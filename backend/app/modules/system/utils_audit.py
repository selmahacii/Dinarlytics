from sqlalchemy.orm import Session
from app.core.models import AuditLog, User
import uuid
import json
import logging

logger = logging.getLogger(__name__)

def log_audit(
    db: Session,
    user: User,  # Use schema or model that has id and company_id
    action: str,
    entity_type: str,
    entity_id: str,
    details: dict = None,
    ip_address: str = None
):
    """
    Creates an audit log entry.
    """
    try:
        log_entry = AuditLog(
            user_id=uuid.UUID(str(user.user_id)) if hasattr(user, "user_id") else user.id,
            company_id=uuid.UUID(str(user.company_id)) if hasattr(user, "company_id") else None,
            action=action,
            entity_type=entity_type,
            entity_id=uuid.UUID(str(entity_id)) if entity_id else None,
            details=details,
            new_values=details,
            ip_address=ip_address
        )
        db.add(log_entry)
        # We don't commit here to allow atomic transactions with the main operation
        # But if the caller already committed, we might need to commit.
        # Best practice: Caller manages commit.
    except Exception as e:
        logger.warning(f"Failed to create audit log entry (action={action}, entity_type={entity_type}): {e}")
