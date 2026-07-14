"""Baseline : schéma complet initial.

Le projet a historiquement été piloté par Base.metadata.create_all (aucune
migration versionnée). Cette révision de base matérialise le schéma
complet des modèles :
  - base vierge  : toutes les tables sont créées (équivalent create_all) ;
  - base existante : checkfirst=True saute les tables déjà présentes,
    et le script scripts/migrate_company_hierarchy_accounts.py (exécuté
    par l'entrypoint) réconcilie les colonnes manquantes de façon additive.

Les évolutions FUTURES de schéma doivent être écrites comme des révisions
alembic classiques (op.add_column / op.create_table...) chaînées sur
celle-ci — le mode create_all reste un filet de sécurité de dev, plus la
source de vérité.

Revision ID: 0001_baseline
Revises:
Create Date: 2026-07-14
"""
from alembic import op

# revision identifiers, used by Alembic.
revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    from app.core.database import Base
    import app.core.models  # noqa: F401 — enregistre tous les modèles sur Base.metadata

    bind = op.get_bind()
    Base.metadata.create_all(bind=bind, checkfirst=True)


def downgrade() -> None:
    # Pas de downgrade destructif pour la baseline : supprimer tout le
    # schéma effacerait les données de production. Volontairement no-op.
    pass
