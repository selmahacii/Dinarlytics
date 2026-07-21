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
    ip_address: str = None,
    old_values: dict = None
):
    """
    Creates an audit log entry.

    old_values : état avant modification (pour UPDATE), permettant un vrai
    diff avant/après dans la page Audit. Auparavant jamais renseigné —
    seul `new_values` était écrit, rendant impossible tout diff malgré le
    champ et l'UI prévus pour ça.
    """
    try:
        # Accepte TokenData/modèle User (attributs) ou dict (style
        # get_current_user_from_token) pour couvrir tous les routeurs.
        if isinstance(user, dict):
            raw_user_id = user.get("user_id") or user.get("id")
            raw_company_id = user.get("company_id")
        else:
            raw_user_id = getattr(user, "user_id", None) or getattr(user, "id", None)
            raw_company_id = getattr(user, "company_id", None)

        log_entry = AuditLog(
            user_id=uuid.UUID(str(raw_user_id)) if raw_user_id else None,
            company_id=uuid.UUID(str(raw_company_id)) if raw_company_id else None,
            action=action,
            entity_type=entity_type,
            entity_id=uuid.UUID(str(entity_id)) if entity_id else None,
            details=details,
            new_values=details,
            old_values=old_values,
            ip_address=ip_address
        )
        db.add(log_entry)
        # We don't commit here to allow atomic transactions with the main operation
        # But if the caller already committed, we might need to commit.
        # Best practice: Caller manages commit.
    except Exception as e:
        logger.warning(f"Failed to create audit log entry (action={action}, entity_type={entity_type}): {e}")
