"""
Accounting API Endpoints - Journal Entries, Chart of Accounts, KPIs
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone, date
from decimal import Decimal
import logging
import uuid

from app.database import get_db
from app.models.models import (
    JournalEntry,
    JournalEntryLine,
    ChartOfAccount,
    User,
    AlertDefinition,
    AlertTrigger,
    UserNotification
)
from app.routers.auth import get_current_user
from app.security import TokenData, RBACManager
from app.permissions import (
    require_permission,
    require_role,
    PermissionChecker,
    log_sensitive_access
)
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/accounting", tags=["accounting"])

# ========== REQUEST/RESPONSE MODELS ==========
class JournalEntryLineRequest(BaseModel):
    account_code: str
    debit_amount: Optional[Decimal] = 0
    credit_amount: Optional[Decimal] = 0
    description: Optional[str] = None

class CreateJournalEntryRequest(BaseModel):
    entry_date: date
    description: str
    lines: List[JournalEntryLineRequest]

class JournalEntryLineResponse(BaseModel):
    id: str
    account_code: str
    debit_amount: Decimal
    credit_amount: Decimal
    description: Optional[str]

class JournalEntryResponse(BaseModel):
    id: str
    entry_number: str
    entry_date: date
    description: str
    status: str
    total_debit: Decimal
    total_credit: Decimal
    lines: List[JournalEntryLineResponse]
    created_at: datetime

class ChartOfAccountResponse(BaseModel):
    id: str
    account_code: str
    account_name: str
    account_class: int
    account_type: str
    is_active: bool

class ApproveJournalEntryRequest(BaseModel):
    approval_status: str = Field(..., pattern="^(approved|rejected)$")
    approval_reason: Optional[str] = None

# ========== DEPENDENCIES ==========
async def check_accounting_access(
    current_user: TokenData = Depends(require_permission('comptabilite-read'))
):
    """Check if user has accounting read access"""
    return current_user

async def check_accounting_create(
    current_user: TokenData = Depends(require_permission('comptabilite-write'))
):
    """Check if user can create accounting entries"""
    log_sensitive_access('create_journal_entry', current_user.user_id)
    return current_user

async def check_accounting_validate(
    current_user: TokenData = Depends(require_permission('comptabilite-validate'))
):
    """Check if user can validate accounting entries"""
    log_sensitive_access('validate_journal_entry', current_user.user_id)
    return current_user

# ========== JOURNAL ENTRY ENDPOINTS ==========
@router.post("/journal-entries", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    request: CreateJournalEntryRequest,
    current_user: TokenData = Depends(check_accounting_create),
    db: Session = Depends(get_db)
):
    """Create a new journal entry"""
    
    # Validate debit/credit balance
    total_debit = sum(Decimal(str(line.debit_amount or 0)) for line in request.lines)
    total_credit = sum(Decimal(str(line.credit_amount or 0)) for line in request.lines)
    
    if total_debit != total_credit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Debit and credit amounts must balance. Debit: {total_debit}, Credit: {total_credit}"
        )
    
    # Generate entry number
    entry_number = f"JE-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
    
    # Create journal entry
    journal_entry = JournalEntry(
        company_id=current_user.company_id,
        entry_number=entry_number,
        entry_date=request.entry_date,
        description=request.description,
        status="draft",
        total_debit=total_debit,
        total_credit=total_credit,
        created_by=current_user.user_id
    )
    
    db.add(journal_entry)
    db.flush()
    
    # Create journal entry lines
    for line in request.lines:
        entry_line = JournalEntryLine(
            journal_entry_id=journal_entry.id,
            account_code=line.account_code,
            debit_amount=line.debit_amount or 0,
            credit_amount=line.credit_amount or 0,
            description=line.description
        )
        db.add(entry_line)
    
    db.commit()
    
    logger.info(f"Journal entry created: {entry_number} by user {current_user.username}")
    
    # Check alerts for this entry
    _check_and_trigger_alerts(db, current_user.company_id, journal_entry.id, total_debit)
    
    return _format_journal_entry(journal_entry)

@router.get("/journal-entries", response_model=List[JournalEntryResponse])
async def list_journal_entries(
    current_user: TokenData = Depends(check_accounting_access),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """List journal entries with pagination and filters"""
    
    query = db.query(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id
    )
    
    if status:
        query = query.filter(JournalEntry.status == status)
    
    if start_date:
        query = query.filter(JournalEntry.entry_date >= start_date)
    
    if end_date:
        query = query.filter(JournalEntry.entry_date <= end_date)
    
    entries = query.order_by(JournalEntry.entry_date.desc()).offset(skip).limit(limit).all()
    
    return [_format_journal_entry(entry) for entry in entries]

@router.get("/journal-entries/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(
    entry_id: str,
    current_user: TokenData = Depends(check_accounting_access),
    db: Session = Depends(get_db)
):
    """Get a specific journal entry"""
    
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.company_id == current_user.company_id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    return _format_journal_entry(entry)

@router.post("/journal-entries/{entry_id}/approve")
async def approve_journal_entry(
    entry_id: str,
    request: ApproveJournalEntryRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve or reject a journal entry"""
    
    # Check if user can approve
    if not RBACManager.check_permission(current_user.roles, "approve_entries"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission to approve entries required"
        )
    
    entry = db.query(JournalEntry).filter(
        JournalEntry.id == entry_id,
        JournalEntry.company_id == current_user.company_id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found"
        )
    
    # Update status
    new_status = "approved" if request.approval_status == "approved" else "draft"
    entry.status = new_status
    db.commit()
    
    logger.info(f"Journal entry {entry_id} {new_status} by {current_user.username}")
    
    # Create notification
    _create_approval_notification(
        db,
        entry.created_by,
        current_user.company_id,
        f"Journal Entry {entry.entry_number} {new_status}",
        request.approval_reason or f"Entry has been {new_status}"
    )
    
    return {
        "id": str(entry.id),
        "status": new_status,
        "message": f"Journal entry {new_status} successfully"
    }

# ========== CHART OF ACCOUNTS ENDPOINTS ==========
@router.get("/chart-of-accounts", response_model=List[ChartOfAccountResponse])
async def list_chart_of_accounts(
    current_user: TokenData = Depends(check_accounting_access),
    account_class: Optional[int] = None,
    account_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List chart of accounts with optional filters"""
    
    query = db.query(ChartOfAccount).filter(
        ChartOfAccount.company_id == current_user.company_id,
        ChartOfAccount.is_active == True
    )
    
    if account_class:
        query = query.filter(ChartOfAccount.account_class == account_class)
    
    if account_type:
        query = query.filter(ChartOfAccount.account_type == account_type)
    
    accounts = query.order_by(ChartOfAccount.account_code).all()
    
    return [
        ChartOfAccountResponse(
            id=str(account.id),
            account_code=account.account_code,
            account_name=account.account_name,
            account_class=account.account_class,
            account_type=account.account_type,
            is_active=account.is_active
        )
        for account in accounts
    ]

# ========== HELPER FUNCTIONS ==========
def _format_journal_entry(entry: JournalEntry) -> JournalEntryResponse:
    """Format journal entry for response"""
    return JournalEntryResponse(
        id=str(entry.id),
        entry_number=entry.entry_number,
        entry_date=entry.entry_date,
        description=entry.description,
        status=entry.status,
        total_debit=entry.total_debit,
        total_credit=entry.total_credit,
        lines=[
            JournalEntryLineResponse(
                id=str(line.id),
                account_code=line.account_code,
                debit_amount=line.debit_amount,
                credit_amount=line.credit_amount,
                description=line.description
            )
            for line in entry.lines
        ],
        created_at=entry.created_at
    )

def _check_and_trigger_alerts(
    db: Session,
    company_id: str,
    entry_id: str,
    amount: Decimal
):
    """Check if amount triggers any defined alerts"""
    
    alerts = db.query(AlertDefinition).filter(
        AlertDefinition.company_id == company_id,
        AlertDefinition.enabled == True
    ).all()
    
    for alert in alerts:
        should_trigger = False
        
        if alert.comparison_operator == ">":
            should_trigger = amount > alert.threshold_value
        elif alert.comparison_operator == "<":
            should_trigger = amount < alert.threshold_value
        elif alert.comparison_operator == ">=":
            should_trigger = amount >= alert.threshold_value
        elif alert.comparison_operator == "<=":
            should_trigger = amount <= alert.threshold_value
        
        if should_trigger:
            trigger = AlertTrigger(
                company_id=company_id,
                alert_id=alert.id,
                trigger_value=amount,
                status="new",
                priority=alert.severity_level
            )
            db.add(trigger)
    
    db.commit()

def _create_approval_notification(
    db: Session,
    user_id: str,
    company_id: str,
    subject: str,
    message: str
):
    """Create notification for user"""
    
    notification = UserNotification(
        user_id=user_id,
        company_id=company_id,
        notification_type="approval_request",
        subject=subject,
        message=message,
        priority="high"
    )
    db.add(notification)
    db.commit()
