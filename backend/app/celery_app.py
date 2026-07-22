from celery import Celery
from celery.schedules import crontab
import os
from app.core.config import settings

# Configure Celery to use Redis as broker and backend
celery_app = Celery(
    "dinarlytics",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    include=["app.tasks.ai_tasks", "app.modules.system.tasks", "app.modules.finance.tasks_snapshots"]
)

# Optional configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600, # 1 hour limit for training tasks
    beat_schedule={
        "send-fiscal-reminders-daily": {
            "task": "app.modules.system.tasks.send_fiscal_reminders",
            "schedule": crontab(hour=8, minute=0),
        },
        "check-low-stock-alerts-daily": {
            "task": "app.modules.system.tasks.check_low_stock_alerts",
            "schedule": crontab(hour=8, minute=15),
        },
        "capture-daily-financial-snapshots": {
            "task": "app.modules.finance.tasks_snapshots.capture_daily_snapshots",
            # Fin de journée (23h30 UTC) : capture l'état une fois les
            # écritures/factures du jour saisies, avant minuit.
            "schedule": crontab(hour=23, minute=30),
        },
    },
)
