from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, date
from app.database import get_db
from app.routers.auth import get_current_user
from app.security import TokenData
from app.models.inventory import Invoice
from app.models.financial import CollectionAction, Payment
from app.utils.audit import log_audit
from pydantic import BaseModel


router = APIRouter(prefix="/collections", tags=["collections"])

class ActionCreate(BaseModel):
    invoice_id: str
    action_type: str # email, phone, etc.
    notes: Optional[str] = None

@router.get("/overdue")
def list_overdue_invoices(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    """List invoices that are passed their due date and not fully paid."""
    today = date.today()
    overdue = db.query(Invoice).filter(
        Invoice.company_id == current_user.company_id,
        Invoice.due_date < today,
        Invoice.payment_status != 'paid',
        Invoice.status != 'cancelled'
    ).all()
    
    results = []
    for inv in overdue:
        # Calculate days late
        days_late = (today - inv.due_date).days
        
        # Get last action
        last_action = db.query(CollectionAction).filter(
            CollectionAction.invoice_id == inv.id
        ).order_by(CollectionAction.action_date.desc()).first()
        
        results.append({
            "id": str(inv.id),
            "invoice_number": inv.invoice_number,
            "client_id": str(inv.client_id),
            "total_ttc": float(inv.total_ttc),
            "due_date": inv.due_date,
            "days_late": days_late,
            "last_action_type": last_action.action_type if last_action else None,
            "last_action_date": last_action.action_date if last_action else None
        })
        
    return results

@router.post("/actions", status_code=status.HTTP_201_CREATED)
def record_action(request: ActionCreate, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    """Log a manual or automatic collection action (relance)."""
    action = CollectionAction(
        company_id=current_user.company_id,
        invoice_id=request.invoice_id,
        action_type=request.action_type,
        notes=request.notes,
        created_by=current_user.user_id
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    log_audit(db, current_user, "ACTION", "COLLECTION", str(action.id), {"type": action.action_type})
    db.commit()
    return action


@router.get("/aging-balance")
def get_aging_balance(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    """
    Standard AR Aging Balance (Balance Ag????e):
    0-30 days, 31-60 days, 61-90 days, >90 days.
    """
    today = date.today()
    invoices = db.query(Invoice).filter(
        Invoice.company_id == current_user.company_id,
        Invoice.payment_status != 'paid',
        Invoice.status != 'cancelled'
    ).all()
    
    aging = {
        "current": 0,
        "1_30": 0,
        "31_60": 0,
        "61_90": 0,
        "over_90": 0
    }
    
    for inv in invoices:
        if inv.due_date >= today:
            aging["current"] += float(inv.total_ttc)
        else:
            diff = (today - inv.due_date).days
            if diff <= 30: aging["1_30"] += float(inv.total_ttc)
            elif diff <= 60: aging["31_60"] += float(inv.total_ttc)
            elif diff <= 90: aging["61_90"] += float(inv.total_ttc)
            else: aging["over_90"] += float(inv.total_ttc)
            
    return aging
