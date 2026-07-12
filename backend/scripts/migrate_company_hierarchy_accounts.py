"""
Migration : garantit que company_type/segment sont persistés en base et
que chaque entreprise existante dispose du plan comptable SCF (+ compte
bancaire par défaut) correspondant à sa hiérarchie.

Idempotent — peut être relancé sans risque (n'insère que ce qui manque,
ne modifie jamais une écriture existante). À exécuter :
  - manuellement : python scripts/migrate_company_hierarchy_accounts.py
  - automatiquement au démarrage du conteneur backend (voir entrypoint.sh)

Sans argument, --segment/--company-type par entreprise, une heuristique
raisonnable est appliquée à partir du nombre d'utilisateurs de
l'entreprise (proxy de taille faute de déclaration explicite) ; le champ
n'est écrasé QUE s'il est encore à sa valeur par défaut ("eurl"/"micro"
posée par le modèle) — une valeur déjà personnalisée n'est jamais
réécrite.
"""
import os
import sys
from sqlalchemy import func

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal, engine, Base
from app.core.models import Company, User, Role
from app.core.config import ROLES
from app.core.service_coa_provisioning import provision_company_accounting
from app.core.models import Article  # noqa: for has_inventory heuristic


def ensure_standard_roles(db) -> int:
    """Garantit que les rôles standards (communs à toute hiérarchie)
    existent — idempotent, ne touche jamais un rôle déjà présent (ses
    permissions ont pu être personnalisées)."""
    created = 0
    for role_name, config in ROLES.items():
        exists = db.query(Role.id).filter(Role.name == role_name).first()
        if not exists:
            db.add(Role(name=role_name, permissions=config["permissions"]))
            created += 1
    return created


def infer_segment(user_count: int) -> str:
    if user_count <= 1:
        return "micro"
    if user_count <= 5:
        return "small"
    if user_count <= 20:
        return "medium"
    if user_count <= 50:
        return "large"
    return "enterprise"


def sync_missing_columns():
    """
    create_all ne modifie jamais une table existante : toute colonne
    ajoutée aux modèles après la création initiale de la base n'existe
    pas en production. Réconciliation ADDITIVE uniquement : ajoute les
    colonnes manquantes (jamais de suppression ni de modification de
    type), donc sans risque pour les données existantes.
    """
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    added = 0

    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                continue  # create_all la créera entièrement
            live_cols = {c["name"] for c in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in live_cols:
                    continue
                col_type = column.type.compile(engine.dialect)
                ddl = f'ALTER TABLE {table.name} ADD COLUMN "{column.name}" {col_type}'
                # Valeur par défaut simple si définie statiquement
                if column.default is not None and getattr(column.default, "arg", None) is not None \
                        and not callable(column.default.arg):
                    arg = column.default.arg
                    if isinstance(arg, str):
                        ddl += f" DEFAULT '{arg}'"
                    elif isinstance(arg, bool):
                        ddl += f" DEFAULT {'TRUE' if arg else 'FALSE'}"
                    elif isinstance(arg, (int, float)):
                        ddl += f" DEFAULT {arg}"
                conn.execute(text(ddl))
                print(f"  + {table.name}.{column.name} ({col_type})")
                added += 1
    print(f"Colonnes ajoutées : {added}")
    return added


def run():
    # S'assure que les nouvelles colonnes (company_type, segment,
    # max_users) existent — équivalent d'une migration de schéma pour un
    # projet piloté par create_all plutôt que par Alembic.
    Base.metadata.create_all(bind=engine)
    sync_missing_columns()

    db = SessionLocal()
    total_created_coa = 0
    total_created_bank = 0
    total_companies = 0

    try:
        roles_created = ensure_standard_roles(db)
        db.commit()
        print(f"Rôles standards : {roles_created} créés (le reste existait déjà).")

        companies = db.query(Company).all()
        for company in companies:
            total_companies += 1
            user_count = db.query(func.count(User.id)).filter(
                User.company_id == company.id, User.is_active == True
            ).scalar() or 0

            # N'affecte le segment que s'il est resté à la valeur par
            # défaut du modèle (jamais personnalisé) — préserve les choix
            # explicites faits via l'API.
            if company.segment in (None, "micro") and user_count > 1:
                company.segment = infer_segment(user_count)

            has_inventory = db.query(func.count(Article.id)).filter(
                Article.company_id == company.id
            ).scalar() > 0 or True  # par défaut : on suppose une activité avec stock possible

            result = provision_company_accounting(
                db, company.id,
                segment=company.segment or "micro",
                company_type=company.company_type or "eurl",
                has_inventory=has_inventory
            )
            total_created_coa += result["chart_of_accounts_created"]
            total_created_bank += result["bank_accounts_created"]
            print(f"[{company.name}] segment={company.segment} type={company.company_type} "
                  f"-> +{result['chart_of_accounts_created']} comptes, +{result['bank_accounts_created']} compte bancaire")

        db.commit()
        print(f"\nTerminé : {total_companies} entreprises, "
              f"{total_created_coa} comptes SCF créés, {total_created_bank} comptes bancaires créés.")
    except Exception as e:
        db.rollback()
        print(f"Erreur pendant la migration : {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
