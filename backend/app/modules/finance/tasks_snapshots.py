import logging
from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.models import Company
from app.modules.finance.service_snapshots import capture_daily_snapshot

logger = logging.getLogger(__name__)


@celery_app.task
def capture_daily_snapshots():
    """Daily task (see celery_app beat schedule) — records one
    FinancialDailySnapshot per active company. This is the only source
    of the historical data the chatbot's trend features (f16-f20) and
    any future time-series analysis depend on; before this task existed,
    that history was never recorded at all."""
    db = SessionLocal()
    try:
        companies = db.query(Company.id).filter(Company.is_active == True).all()
        for (company_id,) in companies:
            try:
                capture_daily_snapshot(db, company_id)
            except Exception as e:
                logger.error(f"Failed to capture snapshot for company {company_id}: {e}")
                db.rollback()
    finally:
        db.close()
