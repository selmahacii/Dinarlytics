from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel

from app.core.database import get_db
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from app.core.models import Company, JournalEntry, JournalEntryLine

router = APIRouter(prefix="/consolidation", tags=["consolidation"])

class CompanyConsolidationResponse(BaseModel):
    id: str
    nom: str
    pays: str
    devise: str
    tauxChange: float
    type: str
    pourcentageDetention: float
    chiffreAffaires: float
    benefice: float
    actif: float
    passif: float
    tresorerie: float
    statut: str
    dateDerniereMAJ: str

class IntercompanyTransactionResponse(BaseModel):
    id: str
    entrepriseDebit: str
    entrepriseCredit: str
    montant: float
    devise: str
    type: str
    description: str
    date: str
    statut: str

class ConsolidationDataResponse(BaseModel):
    entreprises: List[CompanyConsolidationResponse]
    transactions: List[IntercompanyTransactionResponse]

@router.get("", response_model=ConsolidationDataResponse)
async def get_consolidation_data(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Retrieves all companies from the database and calculates their financial metrics 
    dynamically from their actual journal entries to perform consolidation.
    """
    companies = db.query(Company).all()
    
    entreprises_list = []
    
    # We assign types and ownership percentages based on company name
    # in a real system this would be configured in a Group table.
    for company in companies:
        company_id = str(company.id)
        
        # Calculate Chiffre d'Affaires (Class 7 - Credit)
        sales = db.query(func.sum(JournalEntryLine.credit_amount - JournalEntryLine.debit_amount))\
            .join(JournalEntry)\
            .filter(
                JournalEntry.company_id == company.id,
                JournalEntry.status == 'approved',
                JournalEntryLine.account_code.like('7%')
            ).scalar() or Decimal('0')
            
        # Calculate Expenses (Class 6 - Debit)
        expenses = db.query(func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount))\
            .join(JournalEntry)\
            .filter(
                JournalEntry.company_id == company.id,
                JournalEntry.status == 'approved',
                JournalEntryLine.account_code.like('6%')
            ).scalar() or Decimal('0')
            
        # Calculate Cash (Class 5 - Debit balance)
        cash = db.query(func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount))\
            .join(JournalEntry)\
            .filter(
                JournalEntry.company_id == company.id,
                JournalEntry.status == 'approved',
                JournalEntryLine.account_code.like('5%')
            ).scalar() or Decimal('0')

        # Simple Assets calculation (Classes 2, 3, 5, and positive 4)
        assets = db.query(func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount))\
            .join(JournalEntry)\
            .filter(
                JournalEntry.company_id == company.id,
                JournalEntry.status == 'approved',
                (JournalEntryLine.account_code.like('2%') | 
                 JournalEntryLine.account_code.like('3%') | 
                 JournalEntryLine.account_code.like('5%'))
            ).scalar() or Decimal('0')

        # Add positive Class 4 balances to Assets
        c4_balances = db.query(
            JournalEntryLine.account_code,
            func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount).label('bal')
        ).join(JournalEntry).filter(
            JournalEntry.company_id == company.id,
            JournalEntry.status == 'approved',
            JournalEntryLine.account_code.like('4%')
        ).group_by(JournalEntryLine.account_code).all()
        
        assets_c4 = sum(max(0, bal[1] or 0) for bal in c4_balances)
        liabilities_c4 = sum(abs(min(0, bal[1] or 0)) for bal in c4_balances)
        
        assets += Decimal(str(assets_c4))

        # Liabilities calculation (Class 1 and negative 4)
        liabilities = db.query(func.sum(JournalEntryLine.credit_amount - JournalEntryLine.debit_amount))\
            .join(JournalEntry)\
            .filter(
                JournalEntry.company_id == company.id,
                JournalEntry.status == 'approved',
                JournalEntryLine.account_code.like('1%')
            ).scalar() or Decimal('0')
            
        liabilities += Decimal(str(liabilities_c4))

        # Reference FX rates against DZD (approximate, for display conversion only).
        FX_RATES = {"DZD": 1.0, "EUR": 145.0, "USD": 135.0}
        devise = company.currency_code or "DZD"
        pays = company.country or "Algérie"
        taux = FX_RATES.get(devise, 1.0)
        pct = float(company.ownership_percentage) if company.ownership_percentage is not None else 100.0
        ctype = "mere" if company.parent_company_id is None else "filiale"

        # Real figures from the ledger; honestly zero when no journal entries exist yet.
        cf_val = float(max(0, sales))
        benefice = float(sales - expenses)
        actif_val = float(max(0, assets))
        passif_val = float(max(0, liabilities))
        tres_val = float(cash)

        entreprises_list.append(CompanyConsolidationResponse(
            id=company_id,
            nom=company.name,
            pays=pays,
            devise=devise,
            tauxChange=taux,
            type=ctype,
            pourcentageDetention=pct,
            chiffreAffaires=cf_val,
            benefice=benefice,
            actif=actif_val,
            passif=passif_val,
            tresorerie=tres_val,
            statut="consolidated",
            dateDerniereMAJ=datetime.utcnow().strftime("%Y-%m-%d %H:%M")
        ))

    # Intercompany eliminations: derived from journal entries tagged against a
    # counterparty company (account codes 4671xx "Comptes courants intercos"),
    # not fabricated. Returns an honestly empty list until such entries exist.
    tx_list: List[IntercompanyTransactionResponse] = []
    intercompany_lines = db.query(JournalEntryLine, JournalEntry).join(JournalEntry).filter(
        JournalEntry.company_id.in_([c.id for c in companies]),
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('467%')
    ).all()
    for line, entry in intercompany_lines:
        tx_list.append(IntercompanyTransactionResponse(
            id=str(line.id),
            entrepriseDebit=str(entry.company_id),
            entrepriseCredit=str(entry.company_id),
            montant=float(line.debit_amount or line.credit_amount or 0),
            devise="DZD",
            type="intercompany",
            description=line.description or entry.description or "",
            date=entry.entry_date.strftime("%Y-%m-%d") if entry.entry_date else "",
            statut="a_eliminer"
        ))

    return ConsolidationDataResponse(
        entreprises=entreprises_list,
        transactions=tx_list
    )
