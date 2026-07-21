from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.permissions import get_current_user_from_token, require_permission
from app.core.models import AuditLog
from pydantic import BaseModel
from datetime import datetime, date, timedelta
import uuid

router = APIRouter(prefix="/audit", tags=["audit"])

class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID]
    action: str
    entity_type: Optional[str]
    entity_id: Optional[uuid.UUID]
    old_values: Optional[dict]
    new_values: Optional[dict]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    entity_type: Optional[str] = None,
    entity_id: Optional[uuid.UUID] = None,
    user_id: Optional[uuid.UUID] = None,
    period: Optional[str] = Query(None, description="day | week | month | quarter"),
    limit: int = Query(50, ge=1, le=2000),
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission('audit-read'))
):
    """
    Retrieves audit logs for the company.
    Supports filtering by entity type, entity ID, user, and period — le
    frontend (page Audit) envoyait déjà `selectedPeriod`/recherche
    utilisateur sans que l'API n'accepte ces paramètres : les filtres
    étaient donc purement décoratifs, sans effet sur les logs retournés.
    """
    query = db.query(AuditLog).filter(AuditLog.company_id == user["company_id"])

    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if period:
        since_days = {"day": 1, "week": 7, "month": 30, "quarter": 90}.get(period)
        if since_days:
            query = query.filter(AuditLog.created_at >= datetime.utcnow() - timedelta(days=since_days))

    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
