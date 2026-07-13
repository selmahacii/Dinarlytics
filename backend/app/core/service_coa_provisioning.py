"""
Provisionnement du plan comptable (SCF) et des comptes bancaires par défaut
pour une entreprise, adapté à sa hiérarchie (forme juridique + taille).

Appelé automatiquement à la création d'une entreprise (register, create
company, create subsidiary) pour garantir qu'aucune entreprise ne se
retrouve avec un module comptable vide/inutilisable pour l'analyse
financière — et par le script de migration pour les entreprises
existantes qui n'auraient pas encore de plan comptable.

Idempotent : n'insère que les comptes manquants, ne touche jamais aux
comptes existants (préserve toute écriture déjà passée).
"""
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.modules.finance.models_accounting import ChartOfAccount, BankAccount
from app.core.scf_chart_of_accounts import build_chart_for_company


def ensure_chart_of_accounts(db: Session, company_id, segment: str = "micro", company_type: str = "eurl", has_inventory: bool = True, chart_template: str = "scf") -> int:
    """Insère les comptes manquants pour l'entreprise (template SCF ou IFRS).
    Retourne le nombre de comptes créés."""
    accounts = build_chart_for_company(segment, company_type, has_inventory, chart_template)

    existing_codes = {
        row[0] for row in db.query(ChartOfAccount.account_code).filter(
            ChartOfAccount.company_id == company_id
        ).all()
    }

    created = 0
    for code, name, klass, acc_type in accounts:
        if code in existing_codes:
            continue
        db.add(ChartOfAccount(
            company_id=company_id,
            account_code=code,
            account_name=name,
            account_class=klass,
            account_type=acc_type,
            is_active=True
        ))
        created += 1

    return created


def ensure_default_bank_account(db: Session, company_id) -> int:
    """Garantit au moins un compte bancaire par défaut (classe 5), requis
    par le module trésorerie pour toute hiérarchie. Retourne 1 si créé, 0 sinon."""
    existing = db.query(func.count(BankAccount.id)).filter(
        BankAccount.company_id == company_id
    ).scalar() or 0
    if existing > 0:
        return 0

    db.add(BankAccount(
        company_id=company_id,
        account_code="512001",
        bank_name="Compte bancaire principal",
        iban=None,
        currency="DZD",
        is_active=True
    ))
    return 1


def provision_company_accounting(db: Session, company_id, segment: str = "micro", company_type: str = "eurl", has_inventory: bool = True, chart_template: str = "scf") -> dict:
    """Point d'entrée unique : plan comptable + compte bancaire par défaut."""
    coa_created = ensure_chart_of_accounts(db, company_id, segment, company_type, has_inventory, chart_template)
    bank_created = ensure_default_bank_account(db, company_id)
    return {"chart_of_accounts_created": coa_created, "bank_accounts_created": bank_created}
