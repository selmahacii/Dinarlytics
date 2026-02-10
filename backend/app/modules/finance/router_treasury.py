from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal
import uuid

from app.core.database import get_db
from app.core.models import BankAccount, JournalEntry, JournalEntryLine, ChartOfAccount
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from pydantic import BaseModel

router = APIRouter(prefix="/treasury", tags=["treasury"])

# ========== SCHEMAS ==========
class BankAccountResponse(BaseModel):
    id: str
    bank_name: str
    account_code: str
    iban: Optional[str]
    balance: Decimal
    currency: str
    is_active: bool

class TransactionResponse(BaseModel):
    id: str
    date: date
    label: str
    amount: Decimal
    type: str # 'credit' or 'debit'
    reference: Optional[str]
    account_code: str

# ========== ENDPOINTS ==========

@router.get("/accounts", response_model=List[BankAccountResponse])
async def list_bank_accounts(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists all bank accounts with their current balances.
    Calculates balance by summing journal entries for the associated account_code.
    """
    accounts = db.query(BankAccount).filter(
        BankAccount.company_id == current_user.company_id,
        BankAccount.is_active == True
    ).all()
    
    results = []
    for acc in accounts:
        # Calculate balance from journal entries
        # Debit increases (512 is an asset account in SCF)
        total_debit = db.query(func.sum(JournalEntryLine.debit_amount)).join(JournalEntry).filter(
            JournalEntryLine.account_code == acc.account_code,
            JournalEntry.company_id == current_user.company_id,
            JournalEntry.status == 'approved'
        ).scalar() or Decimal('0')
        
        total_credit = db.query(func.sum(JournalEntryLine.credit_amount)).join(JournalEntry).filter(
            JournalEntryLine.account_code == acc.account_code,
            JournalEntry.company_id == current_user.company_id,
            JournalEntry.status == 'approved'
        ).scalar() or Decimal('0')
        
        balance = total_debit - total_credit
        
        results.append(BankAccountResponse(
            id=str(acc.id),
            bank_name=acc.bank_name,
            account_code=acc.account_code,
            iban=acc.iban,
            balance=balance,
            currency=acc.currency,
            is_active=acc.is_active
        ))
        
    return results

@router.get("/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    account_code: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = Query(50, le=100),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lists all transactions (journal entry lines) related to bank accounts.
    """
    query = db.query(JournalEntryLine).join(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id,
        JournalEntry.status == 'approved'
    )
    
    if account_code:
        query = query.filter(JournalEntryLine.account_code == account_code)
    else:
        # Default to all bank accounts (SCF code 512xxx)
        query = query.filter(JournalEntryLine.account_code.like('512%'))
        
    if start_date:
        query = query.filter(JournalEntry.entry_date >= start_date)
    if end_date:
        query = query.filter(JournalEntry.entry_date <= end_date)
        
    lines = query.order_by(JournalEntry.entry_date.desc()).limit(limit).all()
    
    results = []
    for line in lines:
        amount = line.debit_amount if line.debit_amount > 0 else line.credit_amount
        tx_type = 'credit' if line.debit_amount > 0 else 'debit' # Careful: in bank statement, Debit is decrease, but in Accounting 512, Debit is increase.
        # Frontend might expect 'credit' for income and 'debit' for expense. 
        # In SCF: 512 Debit = Received money (Cash IN), 512 Credit = Spent money (Cash OUT).
        
        results.append(TransactionResponse(
            id=str(line.id),
            date=line.journal_entry.entry_date,
            label=line.description or line.journal_entry.description,
            amount=amount,
            type=tx_type,
            reference=line.journal_entry.entry_number,
            account_code=line.account_code
        ))
        
    return results
