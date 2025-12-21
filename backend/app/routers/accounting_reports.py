"""
Accounting Reports API Endpoints - Journal Entries and Financial Statements
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal

from app.database import get_db
from app.models.models import JournalEntry, JournalEntryLine, ChartOfAccount, User
from app.routers.auth import get_current_user
from app.security import TokenData, RBACManager
from pydantic import BaseModel, Field

router = APIRouter(prefix="/accounting-reports", tags=["accounting-reports"])

# ========== REQUEST/RESPONSE MODELS ==========
class JournalSummaryResponse(BaseModel):
    code: str
    nom: str
    ecritures: int
    montant: Decimal
    color: str

class JournalEntryDetailResponse(BaseModel):
    id: str
    numero: str
    date: str
    journal: str
    libelle: str
    debit: Decimal
    credit: Decimal
    compte: str
    piece: Optional[str]
    valide: bool

class BilanItem(BaseModel):
    compte: str
    libelle: str
    montant: Decimal

class BilanResponse(BaseModel):
    actif: Dict[str, List[BilanItem]]
    passif: Dict[str, List[BilanItem]]
    total_actif: Decimal
    total_passif: Decimal

class CompteResultatItem(BaseModel):
    compte: str
    libelle: str
    montant: Decimal

class CompteResultatResponse(BaseModel):
    produits: List[CompteResultatItem]
    charges: List[CompteResultatItem]
    total_produits: Decimal
    total_charges: Decimal
    resultat: Decimal

class BalanceItem(BaseModel):
    compte: str
    libelle: str
    debit: Decimal
    credit: Decimal
    solde_debiteur: Decimal
    solde_crediteur: Decimal

class BalanceResponse(BaseModel):
    items: List[BalanceItem]
    total_debit: Decimal
    total_credit: Decimal

class FluxTresorerieResponse(BaseModel):
    exploitation: Dict[str, Decimal]
    investissement: Dict[str, Decimal]
    financement: Dict[str, Decimal]
    variation_nette: Decimal

# ========== DEPENDENCIES ==========
async def check_accounting_access(
    current_user: TokenData = Depends(get_current_user)
):
    """Check if user has accounting access"""
    if not RBACManager.check_permission(current_user.roles, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accounting access required"
        )
    return current_user

# ========== JOURNAL ENDPOINTS ==========
@router.get("/journaux", response_model=List[JournalSummaryResponse])
async def get_journaux_summary(
    periode: Optional[str] = Query(None, description="Période (YYYY-MM)"),
    current_user: TokenData = Depends(check_accounting_access),
    db: Session = Depends(get_db)
):
    """Get journal summaries"""
    from sqlalchemy import func, extract
    
    query = db.query(
        JournalEntry.journal_type,
        func.count(JournalEntry.id).label('count'),
        func.sum(
            db.query(func.sum(JournalEntryLine.debit_amount))
            .filter(JournalEntryLine.journal_entry_id == JournalEntry.id)
            .correlate(JournalEntry)
            .scalar_subquery()
        ).label('total')
    ).filter(JournalEntry.company_id == current_user.company_id)
    
    if periode:
        year, month = map(int, periode.split('-'))
        query = query.filter(
            extract('year', JournalEntry.entry_date) == year,
            extract('month', JournalEntry.entry_date) == month
        )
    
    query = query.group_by(JournalEntry.journal_type)
    results = query.all()
    
    # Map journal types to names and colors
    journal_map = {
        'VT': ('Journal des Ventes', 'emerald'),
        'AC': ('Journal des Achats', 'amber'),
        'BQ': ('Journal de Banque', 'cyan'),
        'CA': ('Journal de Caisse', 'slate'),
        'OD': ('Opérations Diverses', 'red')
    }
    
    return [
        JournalSummaryResponse(
            code=journal_type,
            nom=journal_map.get(journal_type, (f'Journal {journal_type}', 'slate'))[0],
            ecritures=count,
            montant=total or Decimal(0),
            color=journal_map.get(journal_type, ('slate', 'slate'))[1]
        )
        for journal_type, count, total in results
    ]

@router.get("/ecritures", response_model=List[JournalEntryDetailResponse])
async def get_journal_entries(
    journal: Optional[str] = Query(None),
    periode: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: TokenData = Depends(check_accounting_access),
    db: Session = Depends(get_db)
):
    """Get detailed journal entries"""
    from sqlalchemy import extract
    
    query = db.query(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id
    )
    
    if journal and journal != 'tous':
        query = query.filter(JournalEntry.journal_type == journal)
    
    if periode:
        year, month = map(int, periode.split('-'))
        query = query.filter(
            extract('year', JournalEntry.entry_date) == year,
            extract('month', JournalEntry.entry_date) == month
        )
    
    entries = query.order_by(JournalEntry.entry_date.desc()).offset(skip).limit(limit).all()
    
    # Flatten entries with their lines
    result = []
    for entry in entries:
        for line in entry.lines:
            result.append(JournalEntryDetailResponse(
                id=str(line.id),
                numero=entry.entry_number,
                date=entry.entry_date.isoformat(),
                journal=entry.journal_type,
                libelle=entry.description,
                debit=line.debit_amount or Decimal(0),
                credit=line.credit_amount or Decimal(0),
                compte=f"{line.account_code} - {line.description or ''}",
                piece=None,  # TODO: Link to source document
                valide=entry.status == 'approved'
            ))
    
    return result

# ========== FINANCIAL STATEMENTS ENDPOINTS ==========
@router.get("/bilan", response_model=BilanResponse)
async def get_bilan(
    periode: Optional[str] = Query(None),
    current_user: TokenData = Depends(check_accounting_access),
    db: Session = Depends(get_db)
):
    """Get balance sheet (bilan)"""
    # TODO: Calculate from actual journal entries
    # For now, return mock structured data
    
    actif = {
        "immobilise": [
            BilanItem(compte="21", libelle="Immobilisations corporelles", montant=Decimal("2500000")),
            BilanItem(compte="28", libelle="Amortissements", montant=Decimal("-450000"))
        ],
        "circulant": [
            BilanItem(compte="31", libelle="Stocks de marchandises", montant=Decimal("850000")),
            BilanItem(compte="411", libelle="Clients", montant=Decimal("1250000")),
            BilanItem(compte="512", libelle="Banque", montant=Decimal("450000")),
            BilanItem(compte="53", libelle="Caisse", montant=Decimal("125000"))
        ]
    }
    
    passif = {
        "capitaux": [
            BilanItem(compte="10", libelle="Capital social", montant=Decimal("1000000")),
            BilanItem(compte="12", libelle="Résultat de l'exercice", montant=Decimal("850000"))
        ],
        "dettes": [
            BilanItem(compte="16", libelle="Emprunts", montant=Decimal("1500000")),
            BilanItem(compte="401", libelle="Fournisseurs", montant=Decimal("890000")),
            BilanItem(compte="4457", libelle="TVA collectée", montant=Decimal("285000")),
            BilanItem(compte="42", libelle="Personnel", montant=Decimal("200000"))
        ]
    }
    
    total_actif = sum(item.montant for items in actif.values() for item in items)
    total_passif = sum(item.montant for items in passif.values() for item in items)
    
    return BilanResponse(
        actif=actif,
        passif=passif,
        total_actif=total_actif,
        total_passif=total_passif
    )

@router.get("/compte-resultat", response_model=CompteResultatResponse)
async def get_compte_resultat(
    periode: Optional[str] = Query(None),
    current_user: TokenData = Depends(check_accounting_access),
    db: Session = Depends(get_db)
):
    """Get income statement (compte de résultat)"""
    # TODO: Calculate from actual journal entries
    
    produits = [
        CompteResultatItem(compte="70", libelle="Ventes de marchandises", montant=Decimal("5200000")),
        CompteResultatItem(compte="76", libelle="Produits financiers", montant=Decimal("45000"))
    ]
    
    charges = [
        CompteResultatItem(compte="60", libelle="Achats consommés", montant=Decimal("3100000")),
        CompteResultatItem(compte="63", libelle="Services", montant=Decimal("420000")),
        CompteResultatItem(compte="64", libelle="Frais de personnel", montant=Decimal("680000")),
        CompteResultatItem(compte="66", libelle="Charges financières", montant=Decimal("95000")),
        CompteResultatItem(compte="68", libelle="Dotations aux amortissements", montant=Decimal("100000"))
    ]
    
    total_produits = sum(p.montant for p in produits)
    total_charges = sum(c.montant for c in charges)
    resultat = total_produits - total_charges
    
    return CompteResultatResponse(
        produits=produits,
        charges=charges,
        total_produits=total_produits,
        total_charges=total_charges,
        resultat=resultat
    )

@router.get("/balance", response_model=BalanceResponse)
async def get_balance_generale(
    periode: Optional[str] = Query(None),
    current_user: TokenData = Depends(check_accounting_access),
    db: Session = Depends(get_db)
):
    """Get general ledger balance"""
    # TODO: Calculate from actual journal entries
    
    items = [
        BalanceItem(compte="21", libelle="Immobilisations corporelles", 
                   debit=Decimal("2500000"), credit=Decimal("0"),
                   solde_debiteur=Decimal("2500000"), solde_crediteur=Decimal("0")),
        BalanceItem(compte="28", libelle="Amortissements",
                   debit=Decimal("0"), credit=Decimal("450000"),
                   solde_debiteur=Decimal("0"), solde_crediteur=Decimal("450000")),
        # Add more items...
    ]
    
    total_debit = sum(item.debit for item in items)
    total_credit = sum(item.credit for item in items)
    
    return BalanceResponse(
        items=items,
        total_debit=total_debit,
        total_credit=total_credit
    )

@router.get("/flux-tresorerie", response_model=FluxTresorerieResponse)
async def get_flux_tresorerie(
    periode: Optional[str] = Query(None),
    current_user: TokenData = Depends(check_accounting_access),
    db: Session = Depends(get_db)
):
    """Get cash flow statement"""
    # TODO: Calculate from actual journal entries
    
    exploitation = {
        "resultat_net": Decimal("850000"),
        "amortissements": Decimal("100000"),
        "variation_stocks": Decimal("-50000"),
        "variation_clients": Decimal("120000"),
        "variation_fournisseurs": Decimal("-80000")
    }
    
    investissement = {
        "acquisition_immobilisations": Decimal("-300000"),
        "cession_immobilisations": Decimal("50000")
    }
    
    financement = {
        "augmentation_capital": Decimal("0"),
        "nouveaux_emprunts": Decimal("500000"),
        "remboursement_emprunts": Decimal("-200000"),
        "dividendes": Decimal("-150000")
    }
    
    flux_exploitation = sum(exploitation.values())
    flux_investissement = sum(investissement.values())
    flux_financement = sum(financement.values())
    variation_nette = flux_exploitation + flux_investissement + flux_financement
    
    return FluxTresorerieResponse(
        exploitation=exploitation,
        investissement=investissement,
        financement=financement,
        variation_nette=variation_nette
    )
