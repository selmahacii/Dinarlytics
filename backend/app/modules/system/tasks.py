import logging
from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.models import Company
from app.modules.system.service_notifications import NotificationService

logger = logging.getLogger(__name__)


@celery_app.task
def send_fiscal_reminders():
    """Daily task (see celery_app beat schedule) — creates G50 declaration
    reminders for every active company, 10th-20th of the month.
    trigger_fiscal_reminder() itself only builds notifications for one
    company; nothing previously called it for any company at all."""
    db = SessionLocal()
    try:
        companies = db.query(Company.id).filter(Company.is_active == True).all()
        for (company_id,) in companies:
            NotificationService.trigger_fiscal_reminder(db, company_id)
    finally:
        db.close()
