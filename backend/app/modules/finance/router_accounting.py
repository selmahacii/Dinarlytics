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

from app.core.database import get_db
from app.core.models import (
    JournalEntry,
    JournalEntryLine,
    ChartOfAccount,
    User,
    AlertDefinition,
    AlertTrigger,
    UserNotification
)
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData, RBACManager
from app.core.permissions import (
    require_permission,
    require_role,
    PermissionChecker,
    log_sensitive_access
)
from pydantic import BaseModel, Field
from app.modules.system.utils_audit import log_audit
from app.modules.system.service_internal_control import InternalControlService


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

from app.modules.finance.service_calculations import AlgerianFinancialCalculator

# ========== JOURNAL ENTRY ENDPOINTS ==========
@router.post("/journal-entries", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_journal_entry(
    request: CreateJournalEntryRequest,
    current_user: TokenData = Depends(check_accounting_create),
    db: Session = Depends(get_db)
):
    """Create a new journal entry with Algerian precision"""
    
    # Validate debit/credit balance using Decimal
    total_debit = Decimal('0')
    total_credit = Decimal('0')
    
    for line in request.lines:
        total_debit += Decimal(str(line.debit_amount or 0))
        total_credit += Decimal(str(line.credit_amount or 0))
    
    if total_debit != total_credit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"D????s????quilibre: D????bit ({total_debit}) != Cr????dit ({total_credit}). La comptabilit???? SCF exige un ????quilibre strict."
        )
    
    # Generate entry number (Algerian standard: ANNEE-MOIS-NB)
    entry_number = f"JE-{datetime.now().year}-{datetime.now().month:02d}-{str(uuid.uuid4())[:6].upper()}"
    
    # Create journal entry
    # Determine if approval is needed based on threshold (500k DZD)
    requires_approval = InternalControlService.check_approval_requirement(float(total_debit))
    entry_status = "pending_approval" if requires_approval else "draft"
    
    # Create journal entry
    journal_entry = JournalEntry(
        company_id=current_user.company_id,
        entry_number=entry_number,
        entry_date=request.entry_date,
        description=request.description,
        status=entry_status,
        total_debit=total_debit,
        total_credit=total_credit,
        created_by=current_user.user_id
    )


    
    db.add(journal_entry)
    db.flush()
    
    # Create lines
    for line in request.lines:
        entry_line = JournalEntryLine(
            journal_entry_id=journal_entry.id,
            account_code=line.account_code,
            debit_amount=Decimal(str(line.debit_amount or 0)),
            credit_amount=Decimal(str(line.credit_amount or 0)),
            description=line.description
        )
        db.add(entry_line)
    
    log_audit(db, current_user, 'CREATE', 'JOURNAL_ENTRY', str(journal_entry.id), {'entry_number': journal_entry.entry_number})
    db.commit()
    return _format_journal_entry(journal_entry)

@router.get("/journal-entries", response_model=List[JournalEntryResponse])
async def list_journal_entries(
    current_user: TokenData = Depends(check_accounting_access),
    skip: int = Query(0, ge=0),
    # Plafond relevé à 2000 : le plan comptable recalcule les soldes de
    # TOUTES les écritures approuvées côté client (limit=1000) — la borne
    # à 100 renvoyait 422 et cassait silencieusement l'affichage des soldes.
    limit: int = Query(10, ge=1, le=2000),
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
    log_audit(db, current_user, 'APPROVE', 'JOURNAL_ENTRY', str(entry.id), {'status': new_status})
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


VALID_ACCOUNT_TYPES = {"asset", "liability", "equity", "revenue", "expense", "contra_asset", "mixed"}


class CreateChartOfAccountRequest(BaseModel):
    account_code: str = Field(..., min_length=2, max_length=20, pattern=r"^[1-7][0-9A-Za-z]*$")
    account_name: str
    account_class: int = Field(..., ge=1, le=7)
    account_type: str


class UpdateChartOfAccountRequest(BaseModel):
    account_name: Optional[str] = None
    account_class: Optional[int] = Field(None, ge=1, le=7)
    account_type: Optional[str] = None
    is_active: Optional[bool] = None


def _validate_account_coherence(account_code: str, account_class: int, account_type: str):
    """Cohérence SCF : le 1er chiffre du code EST la classe (toute l'analyse
    financière agrège par préfixe de classe — un code incohérent fausserait
    bilan, ratios et G50). Le type doit être un type comptable connu."""
    if int(account_code[0]) != account_class:
        raise HTTPException(
            status_code=400,
            detail=f"Incohérence code/classe : le compte '{account_code}' commence par "
                   f"{account_code[0]} mais est déclaré en classe {account_class}. "
                   f"Le premier chiffre du code doit correspondre à la classe SCF."
        )
    if account_type not in VALID_ACCOUNT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Type de compte invalide '{account_type}'. Types acceptés : {sorted(VALID_ACCOUNT_TYPES)}"
        )


@router.post("/chart-of-accounts", response_model=ChartOfAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_chart_of_account(
    request: CreateChartOfAccountRequest,
    current_user: TokenData = Depends(check_accounting_create),
    db: Session = Depends(get_db)
):
    """Create a new chart of accounts entry"""
    _validate_account_coherence(request.account_code, request.account_class, request.account_type)

    existing = db.query(ChartOfAccount).filter(
        ChartOfAccount.company_id == current_user.company_id,
        ChartOfAccount.account_code == request.account_code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this code already exists")

    account = ChartOfAccount(
        company_id=current_user.company_id,
        account_code=request.account_code,
        account_name=request.account_name,
        account_class=request.account_class,
        account_type=request.account_type,
        is_active=True
    )
    db.add(account)
    log_audit(db, current_user, 'CREATE', 'CHART_OF_ACCOUNT', None, {'account_code': request.account_code})
    db.commit()
    db.refresh(account)
    return ChartOfAccountResponse(
        id=str(account.id), account_code=account.account_code, account_name=account.account_name,
        account_class=account.account_class, account_type=account.account_type, is_active=account.is_active
    )


@router.put("/chart-of-accounts/{account_id}", response_model=ChartOfAccountResponse)
async def update_chart_of_account(
    account_id: str,
    request: UpdateChartOfAccountRequest,
    current_user: TokenData = Depends(check_accounting_create),
    db: Session = Depends(get_db)
):
    """Update a chart of accounts entry"""
    account = db.query(ChartOfAccount).filter(
        ChartOfAccount.id == account_id,
        ChartOfAccount.company_id == current_user.company_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    updates = request.dict(exclude_unset=True)
    # Cohérence après application : la classe modifiée doit rester alignée
    # avec le premier chiffre du code (le code lui-même n'est pas modifiable,
    # les écritures y font référence par valeur).
    new_class = updates.get("account_class", account.account_class)
    new_type = updates.get("account_type", account.account_type)
    _validate_account_coherence(account.account_code, new_class, new_type or "asset")

    for field, value in updates.items():
        setattr(account, field, value)
    log_audit(db, current_user, 'UPDATE', 'CHART_OF_ACCOUNT', str(account.id), updates)
    db.commit()
    db.refresh(account)
    return ChartOfAccountResponse(
        id=str(account.id), account_code=account.account_code, account_name=account.account_name,
        account_class=account.account_class, account_type=account.account_type, is_active=account.is_active
    )


@router.delete("/chart-of-accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chart_of_account(
    account_id: str,
    current_user: TokenData = Depends(check_accounting_create),
    db: Session = Depends(get_db)
):
    """Soft-delete (deactivate) a chart of accounts entry"""
    account = db.query(ChartOfAccount).filter(
        ChartOfAccount.id == account_id,
        ChartOfAccount.company_id == current_user.company_id
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    # Garde-fou : un compte mouvementé ne peut pas être désactivé — les
    # écritures y référencent le code par valeur et resteraient invisibles
    # au plan tout en comptant dans les agrégats.
    entries_count = db.query(JournalEntryLine.id).join(JournalEntry).filter(
        JournalEntry.company_id == current_user.company_id,
        JournalEntryLine.account_code == account.account_code
    ).count()
    if entries_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Ce compte est mouvementé ({entries_count} ligne(s) d'écriture). "
                   f"Il ne peut pas être supprimé — il fait partie de l'historique comptable."
        )

    account.is_active = False
    log_audit(db, current_user, 'DELETE', 'CHART_OF_ACCOUNT', str(account.id), {'account_code': account.account_code})
    db.commit()
    return None

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

# ========== HELPER FUNCTIONS MOVED TO TOP OR EXTERNAL ==========
from app.modules.finance.service_calculations import AlgerianFinancialCalculator
from app.modules.system.service_notifications import NotificationService

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
