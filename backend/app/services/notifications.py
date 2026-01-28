from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models import UserNotification, AlertTrigger, AlertDefinition
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
        title: str, 
        message: str, 
        priority: str = "medium",
        category: str = "general"
    ) -> UserNotification:
        """Standard method to notify a user."""
        notif = UserNotification(
            user_id=user_id,
            title=title,
            message=message,
            priority=priority,
            category=category,
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif)
        db.commit()
        return notif

    @staticmethod
    def trigger_fiscal_reminder(db: Session, company_id: Any):
        """Checks and creates reminders for G50 (before 20th)."""
        now = datetime.now()
        if now.day > 10 and now.day < 21:
            # Logic to find accounting admins or seniors for the company
            # Mocking notification creation for relevant users
            pass

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
