from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from app.core.models import Budget, BudgetItem
from app.modules.finance.service_budgeting import BudgetingService
from app.modules.system.utils_audit import log_audit
from pydantic import BaseModel

from decimal import Decimal

router = APIRouter(prefix="/budgets", tags=["budgets"])

class BudgetItemSchema(BaseModel):
    category: str
    account_code: Optional[str] = None
    budgeted_amount: Decimal

class BudgetCreate(BaseModel):
    name: str
    exercice: str
    items: List[BudgetItemSchema]

@router.get("/")
def list_budgets(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    return db.query(Budget).filter(Budget.company_id == current_user.company_id).all()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_budget(request: BudgetCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    budget = Budget(
        company_id=current_user.company_id,
        name=request.name,
        exercice=request.exercice,
        status="draft"
    )
    db.add(budget)
    db.flush()
    
    for item in request.items:
        db.add(BudgetItem(
            budget_id=budget.id,
            category=item.category,
            account_code=item.account_code,
            budgeted_amount=item.budgeted_amount
        ))
    
    db.commit()
    db.refresh(budget)
    log_audit(db, current_user, "CREATE", "BUDGET", str(budget.id), {"name": budget.name})
    db.commit()
    return budget

@router.post("/{budget_id}/sync")
def sync_budget(budget_id: str, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    """Force an update of 'Actual' amounts from the ledger."""
    budget = BudgetingService.sync_actual_amounts(db, budget_id)
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    log_audit(db, current_user, "SYNC", "BUDGET", budget_id)
    db.commit()
    return budget


@router.get("/summary/{exercice}")
def get_budget_summary(exercice: str, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    return BudgetingService.get_summary(db, current_user.company_id, exercice)
