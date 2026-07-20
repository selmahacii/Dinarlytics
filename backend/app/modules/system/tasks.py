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


@celery_app.task
def check_low_stock_alerts():
    """Daily task (see celery_app beat schedule) — turns low-stock articles
    into real, persisted alert notifications. Previously, low_stock_count
    in GET /articles/stats was only ever a live-computed number shown in
    the UI; it never became a UserNotification, and
    trigger_financial_alert() (used here) had no caller anywhere."""
    from app.core.models import Article
    db = SessionLocal()
    try:
        companies = db.query(Company.id).filter(Company.is_active == True).all()
        for (company_id,) in companies:
            low_stock_articles = db.query(Article).filter(
                Article.company_id == company_id,
                Article.is_active == True,
                Article.stock_quantity <= Article.min_stock_level,
                Article.stock_quantity > 0
            ).all()
            for article in low_stock_articles:
                NotificationService.trigger_financial_alert(
                    db, company_id,
                    alert_code="low_stock",
                    current_value=float(article.stock_quantity or 0),
                    threshold=float(article.min_stock_level or 0),
                    message=f"Stock bas pour \"{article.name}\" : {article.stock_quantity} unité(s) restante(s) (seuil {article.min_stock_level}).",
                    severity="medium"
                )
    finally:
        db.close()
