from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.permissions import get_current_user_from_token, require_permission
from app.models.audit import AuditLog
from pydantic import BaseModel
from datetime import datetime
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
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    entity_type: Optional[str] = None,
    entity_id: Optional[uuid.UUID] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission('audit-read'))
):
    """
    Retrieves audit logs for the company.
    Supports filtering by entity type and ID.
    """
    query = db.query(AuditLog).filter(AuditLog.company_id == user["company_id"])
    
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
        
    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
