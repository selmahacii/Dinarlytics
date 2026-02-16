from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
import uuid

from app.core.database import get_db
from app.core.models import Payment, JournalEntry, JournalEntryLine, Invoice, PaymentMode
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from app.modules.finance.service_calculations import AlgerianFinancialCalculator
from app.core.sequences import generate_document_number

from pydantic import BaseModel

router = APIRouter(prefix="/payments", tags=["payments"])

class CheckDepositRequest(BaseModel):
    payment_ids: List[str] # List of Payment IDs to deposit
    bank_account_code: str # e.g., '512001'
    deposit_date: date

class PaymentResponse(BaseModel):
    id: str
    amount: Decimal
    payment_date: date
    mode: str
    check_status: Optional[str]
    check_number: Optional[str]
    deposit_slip_number: Optional[str]

@router.post("/deposit-checks")
async def deposit_checks(
    request: CheckDepositRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cr????e un Bordereau de Remise de Ch????ques et g????n????re l'????criture comptable.
    Transfert du compte 511 (Valeurs ???? l'encaissement) vers 512 (Banque).
    """
    
    # 1. Validate Payments
    payments = db.query(Payment).filter(
        Payment.id.in_(request.payment_ids),
        Payment.company_id == current_user.company_id,
        # Payment.mode is an Enum, need to cast or compare correctly. 
        # PaymentMode.CHECK might be 'check' string depending on SA Enum impl.
        # Assuming string comparison works for Enum in filter usually, or use Enum object.
        Payment.check_status == 'received' # Only undeposited checks
    ).all()
    
    if len(payments) != len(request.payment_ids):
        raise HTTPException(status_code=400, detail="Certains paiements sont introuvables ou d????j???? d????pos????s.")
        
    total_amount = sum(p.amount for p in payments)
    
    # 2. Generate Deposit Slip Number
    slip_number = f"REM-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}"
    
    # 3. Update Payments
    for p in payments:
        p.check_status = 'deposited'
        p.deposit_slip_number = slip_number
        p.due_date = request.deposit_date # Or expected clearing date
    
    # 4. Generate Accounting Entry
    # Credit 511 (Ch????ques ???? l'encaissement) -> Debit 512 (Banque)
    
    entry = JournalEntry(
        company_id=current_user.company_id,
        journal_type="BQ", # Banque
        entry_number=generate_document_number(db, JournalEntry, JournalEntry.entry_number, current_user.company_id, "BQ", request.deposit_date),
        entry_date=request.deposit_date,
        description=f"Remise de ch????ques N???? {slip_number}",
        status="approved",
        created_by=current_user.user_id,
        total_debit=total_amount,
        total_credit=total_amount
    )
    db.add(entry)
    db.flush()
    
    # Line 1: Debit Banque (512)
    line_bank = JournalEntryLine(
        journal_entry_id=entry.id,
        account_code=request.bank_account_code,
        description=f"Remise ch????ques {slip_number}",
        debit_amount=total_amount,
        credit_amount=0
    )
    db.add(line_bank)
    
    # Line 2: Credit Valeurs ???? l'encaissement (511)
    line_checks = JournalEntryLine(
        journal_entry_id=entry.id,
        account_code="511000",
        description=f"Remise ch????ques {slip_number}",
        debit_amount=0,
        credit_amount=total_amount
    )
    db.add(line_checks)
    
    db.commit()
    
    return {"message": "Bordereau cr???????? avec succ????s", "slip_number": slip_number, "total_amount": total_amount}

@router.get("/checks-in-safe", response_model=List[PaymentResponse])
async def get_checks_in_safe(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """R????cup????re tous les ch????ques actuellement au coffre (Statut 'received')."""
    checks = db.query(Payment).filter(
        Payment.company_id == current_user.company_id,
        Payment.check_status == 'received' # Not 'checklist' which is error
    ).all()
    
    return [
        PaymentResponse(
            id=str(p.id),
            amount=p.amount,
            payment_date=p.payment_date,
            mode="check",
            check_status=p.check_status,
            check_number=p.check_number,
            deposit_slip_number=p.deposit_slip_number
        ) for p in checks
    ]
