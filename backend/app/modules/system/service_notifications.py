from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.models import UserNotification, AlertTrigger, AlertDefinition
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Centralized service for alerts, reminders, and user notifications.
    Ensures all modules use a consistent reporting channel.
    """

    @staticmethod
    def create_notification(
        db: Session,
        user_id: Any,
        company_id: Any,
        title: str,
        message: str,
        priority: str = "medium",
        category: str = "general"
    ) -> UserNotification:
        """Standard method to notify a user.

        Was calling UserNotification(title=..., category=...) — neither
        field exists on the model (the real columns are `subject` and
        `notification_type`), so this raised a TypeError at runtime any
        time it was actually invoked and was never caught by anything
        that exercised the call path."""
        notif = UserNotification(
            user_id=user_id,
            company_id=company_id,
            subject=title,
            message=message,
            priority=priority,
            notification_type=category,
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.commit()
        return notif

    @staticmethod
    def trigger_fiscal_reminder(db: Session, company_id: Any):
        """Creates a G50 declaration reminder (10th-20th of the month) for
        every user in the company who can act on it (comptabilite-write
        permission), skipping duplicates for the same day."""
        from app.modules.auth.models import User
        from app.core.permissions import ROLE_PERMISSIONS

        now = datetime.now()
        if not (10 < now.day < 21):
            return

        # Filtré en Python plutôt qu'avec une requête JSON-containment SQL
        # (Role.permissions est un JSON générique, pas un JSONB — `.contains()`
        # n'est pas fiable sur tous les backends).
        candidates = db.query(User).filter(
            User.company_id == company_id,
            User.is_active == True
        ).all()
        recipients = [
            u for u in candidates
            if any('comptabilite-write' in ROLE_PERMISSIONS.get(r.name, []) for r in u.roles)
        ]

        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        for user in recipients:
            already_sent = db.query(UserNotification).filter(
                UserNotification.user_id == user.id,
                UserNotification.notification_type == "fiscal_reminder_g50",
                UserNotification.created_at >= today_start
            ).first()
            if already_sent:
                continue
            NotificationService.create_notification(
                db, user_id=user.id, company_id=company_id,
                title="Déclaration G50 à venir",
                message=f"La déclaration G50 du mois en cours doit être déposée avant le 20 {now.strftime('%B %Y')}.",
                priority="high",
                category="fiscal_reminder_g50"
            )

    @staticmethod
    def trigger_financial_alert(
        db: Session, 
        company_id: Any, 
        alert_code: str, 
        current_value: float,
        threshold: float
    ):
        """Unified method for AI or Logic-driven alerts."""
        # Record the trigger in DB
        # Send notifications
        logger.warning(f"Financial Alert {alert_code}: {current_value} vs {threshold}")
        pass
