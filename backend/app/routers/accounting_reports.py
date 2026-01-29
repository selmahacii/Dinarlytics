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
        ) # pragma: no cover
    
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
    """Get balance sheet (bilan) calculated from actual journal entries"""
    from sqlalchemy import func, extract, case

    # Base query for account balances
    query = db.query(
        JournalEntryLine.account_code,
        func.sum(JournalEntryLine.debit_amount).label('debit'),
        func.sum(JournalEntryLine.credit_amount).label('credit')
    ).join(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id,
        JournalEntry.status == 'approved' # Only confirmed entries
    )

    if periode:
        try:
            year = int(periode.split('-')[0])
            # For Balance Sheet, we typically want cumulative data up to end of period
            # But usually it's year-to-date. Let's assume year filter.
            query = query.filter(extract('year', JournalEntry.entry_date) == year)
            if len(periode.split('-')) > 1:
                 month = int(periode.split('-')[1])
                 query = query.filter(extract('month', JournalEntry.entry_date) <= month)
        except:
            pass

    # Group by account
    balances = query.group_by(JournalEntryLine.account_code).all()

    actif = {"immobilise": [], "circulant": []}
    passif = {"capitaux": [], "dettes": []}
    
    total_actif = Decimal(0)
    total_passif = Decimal(0)

    for acc_code, debit, credit in balances:
        debit = debit or Decimal(0)
        credit = credit or Decimal(0)
        solde = debit - credit
        
        # Skip zero balances
        if solde == 0:
            continue

        item = BilanItem(compte=acc_code, libelle=f"Compte {acc_code}", montant=abs(solde))

        # Classification SCF simplifiée
        if acc_code.startswith('2'): # Actif Immobilisé
            if solde > 0:
                actif["immobilise"].append(item)
                total_actif += solde
            else: # Amortissements (comptes 28, 29 souvent créditeurs, affichés en négatif à l'actif ou positif au passif?)
                  # En SCF, amortissements viennent réduire l'actif. 
                  # Ici on fait simple: si solde débiteur -> Actif, si créditeur -> Passif ou Actif négatif
                  # Pour l'affichage bilan standard: Actif Net.
                actif["immobilise"].append(BilanItem(compte=acc_code, libelle=f"Amort/Prov {acc_code}", montant=solde)) # Solde est négatif
                total_actif += solde

        elif acc_code.startswith('3'): # Stocks (Actif)
            actif["circulant"].append(item)
            total_actif += solde
            
        elif acc_code.startswith('4'): # Tiers (Actif ou Passif selon solde)
            if solde > 0: # Créance -> Actif
                actif["circulant"].append(item)
                total_actif += solde
            else: # Dette -> Passif
                passif["dettes"].append(item)
                total_passif += abs(solde)

        elif acc_code.startswith('5'): # Financiers (Actif)
             if solde > 0:
                actif["circulant"].append(item)
                total_actif += solde
             else: # Découvert -> Passif
                passif["dettes"].append(item)
                total_passif += abs(solde)

        elif acc_code.startswith('1'): # Capitaux (Passif)
            passif["capitaux"].append(item)
            total_passif += abs(solde) # Solde est normalement négatif (Crédit), on ajoute la valeur absolue au total passif
        
    # Equilibrage (Résultat) = Actif - Passif (hors résultat)
    resultat = total_actif - total_passif
    if resultat != 0:
        passif["capitaux"].append(BilanItem(
            compte="12", 
            libelle="Résultat de l'exercice (calculé)", 
            montant=resultat
        ))
        total_passif += resultat

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
    """Get income statement calculated from actual journal entries"""
    from sqlalchemy import func, extract
    
    # Query for Class 6 and 7
    query = db.query(
        JournalEntryLine.account_code,
        func.sum(JournalEntryLine.debit_amount).label('debit'),
        func.sum(JournalEntryLine.credit_amount).label('credit')
    ).join(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id,
        JournalEntry.status == 'approved'
    )

    if periode:
        try:
            year, month = map(int, periode.split('-'))
            query = query.filter(
                extract('year', JournalEntry.entry_date) == year,
                extract('month', JournalEntry.entry_date) == month
            )
        except:
            pass # Handle year-only or invalid format if needed

    # Balances
    balances = query.group_by(JournalEntryLine.account_code).all()
    
    produits = []
    charges = []
    total_produits = Decimal(0)
    total_charges = Decimal(0)

    for acc_code, debit, credit in balances:
        debit = debit or Decimal(0)
        credit = credit or Decimal(0)
        solde = credit - debit # Pour le résultat, Crédit = Positif (Produit), Débit = Positif (Charge) -> attention signe
        
        # Convention: Afficher montants positifs
        
        if acc_code.startswith('7'): # Produits
            # Solde créditeur normal
            net = credit - debit
            produits.append(CompteResultatItem(compte=acc_code, libelle=f"Produit {acc_code}", montant=net))
            total_produits += net
            
        elif acc_code.startswith('6'): # Charges
            # Solde débiteur normal
            net = debit - credit
            charges.append(CompteResultatItem(compte=acc_code, libelle=f"Charge {acc_code}", montant=net))
            total_charges += net
            
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
    """Get general ledger balance from actual entries"""
    from sqlalchemy import func, extract
    
    query = db.query(
        JournalEntryLine.account_code,
        func.sum(JournalEntryLine.debit_amount).label('debit'),
        func.sum(JournalEntryLine.credit_amount).label('credit')
    ).join(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id
    )
    
    if periode:
        try:
            year, month = map(int, periode.split('-'))
            query = query.filter(
                extract('year', JournalEntry.entry_date) == year,
                extract('month', JournalEntry.entry_date) == month
            )
        except:
            pass

    results = query.group_by(JournalEntryLine.account_code).order_by(JournalEntryLine.account_code).all()
    
    items = []
    for acc, deb, cred in results:
        deb = deb or Decimal(0)
        cred = cred or Decimal(0)
        solde_deb = deb - cred if deb > cred else Decimal(0)
        solde_cred = cred - deb if cred > deb else Decimal(0)
        
        items.append(BalanceItem(
            compte=acc,
            libelle=f"Compte {acc}", # TODO: Fetch name from ChartOfAccount
            debit=deb,
            credit=cred,
            solde_debiteur=solde_deb,
            solde_crediteur=solde_cred
        ))
        
    total_debit = sum(i.debit for i in items)
    total_credit = sum(i.credit for i in items)
    
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
    """Calculated Cash Flow Statement (Simplified SCF)"""
    from sqlalchemy import func, extract

    # 1. Calculer variation nette de trésorerie (Comptes Classe 5)
    query = db.query(
        func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount)
    ).join(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id,
        JournalEntryLine.account_code.like('5%'),
        JournalEntry.status == 'approved'
    )
    
    if periode:
        try:
            year, month = map(int, periode.split('-'))
            query = query.filter(
                extract('year', JournalEntry.entry_date) == year,
                extract('month', JournalEntry.entry_date) == month
            )
        except:
             pass

    variation_nette = query.scalar() or Decimal(0)

    # Note: Sans une comptabilité analytique ou des codes flux, difficile de séparer
    # exploitation/investissement/financement automatiquement.
    # Pour l'instant, on attribue la variation au "Cash Flow Net"
    # et on met des placeholders intelligents à zéro pour le reste, ou on essaie d'estimer.
    # On va laisser les placeholder à 0 pour être "propre" au lieu de fake data.
    
    exploitation = {
        "flux_net": variation_nette, 
    }
    
    return FluxTresorerieResponse(
        exploitation=exploitation,
        investissement={},
        financement={},
        variation_nette=variation_nette
    )
