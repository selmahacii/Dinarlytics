from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from datetime import date, datetime, timezone
from decimal import Decimal
from pydantic import BaseModel
import uuid

from app.core.database import get_db
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from app.core.models import BankAccount, BankStatement, BankStatementLine, JournalEntryLine, JournalEntry

router = APIRouter(prefix="/reconciliation", tags=["reconciliation"])

# ========== SCHEMAS ==========
class LigneReleveResponse(BaseModel):
    id: str
    dateOperation: str
    dateValeur: Optional[str] = None
    libelle: str
    reference: Optional[str] = None
    montant: float
    type: str  # debit or credit
    solde: float
    category: Optional[str] = None
    check_number: Optional[str] = None
    statutRapprochement: str  # non_rapproche, rapproche, en_attente, dispute
    ecritureRapprocheeId: Optional[str] = None
    scoreConfiance: Optional[float] = None

class BankAccountShort(BaseModel):
    id: str
    nom: str
    banque: str
    iban: str
    devise: str

class ReleveResponse(BaseModel):
    id: str
    compteBancaireId: str
    compteBancaire: Optional[BankAccountShort] = None
    numeroReleve: str
    dateDebut: str
    dateFin: str
    soldeDebut: float
    soldeFin: float
    dateImport: str
    formatFichier: str
    statut: str
    nombreLignes: int
    nombreRapprochees: int
    nombreNonRapprochees: int
    tauxRapprochement: float
    lignes: List[LigneReleveResponse] = []

class ImportRequest(BaseModel):
    compteBancaireId: str
    numeroReleve: str
    dateDebut: date
    dateFin: date
    soldeDebut: float
    soldeFin: float
    formatFichier: str = "manuel"
    lignes: List[LigneReleveResponse] = []

class MatchRequest(BaseModel):
    ligneReleveId: str
    ecritureId: str

# ========== ROUTER ENDPOINTS ==========

@router.get("/statements", response_model=List[ReleveResponse])
async def list_statements(
    compte_id: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(BankStatement).filter(BankStatement.company_id == current_user.company_id)
    if compte_id:
        query = query.filter(BankStatement.bank_account_id == compte_id)
    statements = query.order_by(BankStatement.import_date.desc()).all()
    
    results = []
    for s in statements:
        # Get account details
        acc = db.query(BankAccount).filter(BankAccount.id == s.bank_account_id).first()
        acc_short = None
        if acc:
            acc_short = BankAccountShort(
                id=str(acc.id),
                nom=acc.bank_name,
                banque=acc.bank_name,
                iban=acc.iban or "",
                devise=acc.currency
            )
            
        lignes_resp = []
        for line in s.lines:
            lignes_resp.append(LigneReleveResponse(
                id=str(line.id),
                dateOperation=line.operation_date.strftime("%Y-%m-%d"),
                dateValeur=line.value_date.strftime("%Y-%m-%d") if line.value_date else None,
                libelle=line.label,
                reference=line.reference,
                montant=float(line.amount),
                type=line.type,
                solde=float(line.balance),
                category=line.category,
                check_number=line.check_number,
                statutRapprochement=line.reconciliation_status,
                ecritureRapprocheeId=str(line.reconciled_entry_id) if line.reconciled_entry_id else None,
                scoreConfiance=float(line.confidence_score) if line.confidence_score else None
            ))
            
        nb_lines = len(s.lines)
        nb_rapprochees = sum(1 for line in s.lines if line.reconciliation_status == 'rapproche')
        nb_non_rapprochees = nb_lines - nb_rapprochees
        taux = (nb_rapprochees / nb_lines * 100) if nb_lines > 0 else 0
        
        results.append(ReleveResponse(
            id=str(s.id),
            compteBancaireId=str(s.bank_account_id),
            compteBancaire=acc_short,
            numeroReleve=s.statement_number,
            dateDebut=s.start_date.strftime("%Y-%m-%d"),
            dateFin=s.end_date.strftime("%Y-%m-%d"),
            soldeDebut=float(s.starting_balance),
            soldeFin=float(s.ending_balance),
            dateImport=s.import_date.strftime("%Y-%m-%d"),
            formatFichier=s.file_format,
            statut=s.status,
            nombreLignes=nb_lines,
            nombreRapprochees=nb_rapprochees,
            nombreNonRapprochees=nb_non_rapprochees,
            tauxRapprochement=round(taux, 2),
            lignes=lignes_resp
        ))
        
    return results

@router.post("/statements/import", response_model=ReleveResponse, status_code=status.HTTP_201_CREATED)
async def import_statement(
    req: ImportRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify account
    acc = db.query(BankAccount).filter(BankAccount.id == req.compteBancaireId, BankAccount.company_id == current_user.company_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Bank account not found")
        
    statement = BankStatement(
        company_id=current_user.company_id,
        bank_account_id=req.compteBancaireId,
        statement_number=req.numeroReleve,
        start_date=req.dateDebut,
        end_date=req.dateFin,
        starting_balance=Decimal(str(req.soldeDebut)),
        ending_balance=Decimal(str(req.soldeFin)),
        file_format=req.formatFichier,
        status="importe"
    )
    db.add(statement)
    db.flush()
    
    for l in req.lignes:
        line = BankStatementLine(
            statement_id=statement.id,
            operation_date=datetime.strptime(l.dateOperation, "%Y-%m-%d").date(),
            value_date=datetime.strptime(l.dateValeur, "%Y-%m-%d").date() if l.dateValeur else None,
            label=l.libelle,
            reference=l.reference,
            amount=Decimal(str(l.montant)),
            type=l.type,
            balance=Decimal(str(l.solde)),
            category=l.category,
            check_number=l.check_number,
            reconciliation_status=l.statutRapprochement or "non_rapproche",
            confidence_score=l.scoreConfiance
        )
        db.add(line)
        
    db.commit()
    db.refresh(statement)
    
    # Reload with relation
    return (await list_statements(compte_id=str(acc.id), current_user=current_user, db=db))[0]

@router.post("/statements/{statement_id}/auto-match")
async def auto_match_statement(
    statement_id: str,
    tolerance_days: int = Query(5),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    statement = db.query(BankStatement).filter(BankStatement.id == statement_id, BankStatement.company_id == current_user.company_id).first()
    if not statement:
        raise HTTPException(status_code=404, detail="Bank statement not found")
        
    acc = db.query(BankAccount).filter(BankAccount.id == statement.bank_account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Associated bank account not found")
        
    # Get all unmatched statement lines
    unmatched_lines = db.query(BankStatementLine).filter(
        BankStatementLine.statement_id == statement.id,
        BankStatementLine.reconciliation_status != 'rapproche'
    ).all()
    
    # Get all unmatched journal entries related to this bank account
    # Bank accounts map to account_code (like '512000')
    unmatched_entries = db.query(JournalEntryLine).join(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code == acc.account_code
    ).all()
    
    # Simple matching engine
    matched_count = 0
    for line in unmatched_lines:
        line_amount = float(line.amount)
        line_date = line.operation_date
        
        best_match = None
        best_score = 0
        
        for entry in unmatched_entries:
            # Check if this entry is already matched to another statement line
            already_matched = db.query(BankStatementLine).filter(
                BankStatementLine.reconciled_entry_id == entry.id
            ).first()
            if already_matched:
                continue
                
            entry_amount = float(entry.debit_amount if entry.debit_amount > 0 else entry.credit_amount)
            entry_date = entry.journal_entry.entry_date
            
            # Match rules
            if abs(line_amount - entry_amount) < 0.01:
                # Exact amount match
                days_diff = abs((line_date - entry_date).days)
                if days_diff <= tolerance_days:
                    score = 100 - (days_diff * 5)  # 100% minus 5% per day diff
                    
                    # Bonus for matching reference
                    if line.reference and entry.journal_entry.entry_number and line.reference.lower() in entry.journal_entry.entry_number.lower():
                        score += 10
                    score = min(score, 100)
                    
                    if score > best_score:
                        best_score = score
                        best_match = entry
                        
        if best_match and best_score >= 70:
            line.reconciliation_status = 'rapproche'
            line.reconciled_entry_id = best_match.id
            line.confidence_score = Decimal(str(best_score))
            matched_count += 1
            
    db.commit()
    return {"status": "success", "matched_lines_count": matched_count}

@router.post("/match")
async def manual_match(
    req: MatchRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    line = db.query(BankStatementLine).filter(BankStatementLine.id == req.ligneReleveId).first()
    if not line:
        raise HTTPException(status_code=404, detail="Bank statement line not found")
        
    entry = db.query(JournalEntryLine).filter(JournalEntryLine.id == req.ecritureId).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry line not found")
        
    line.reconciliation_status = 'rapproche'
    line.reconciled_entry_id = entry.id
    line.confidence_score = Decimal('100.0')
    
    db.commit()
    return {"status": "success", "message": "Manual match recorded successfully"}

@router.post("/unmatch/{line_id}")
async def manual_unmatch(
    line_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    line = db.query(BankStatementLine).filter(BankStatementLine.id == line_id).first()
    if not line:
        raise HTTPException(status_code=404, detail="Bank statement line not found")
        
    line.reconciliation_status = 'non_rapproche'
    line.reconciled_entry_id = None
    line.confidence_score = None
    
    db.commit()
    return {"status": "success", "message": "Match removed successfully"}
