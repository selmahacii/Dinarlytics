"""Captures one FinancialDailySnapshot row per company per day.

This is the piece that makes trend-based ML features (revenue growth,
inventory build-up, cash balance direction, etc.) possible at all: they
need at least two points in time to compute a delta, and until this
service ran, none was ever recorded. See models_snapshots.py for the
full rationale.
"""
import datetime as dt
import logging
from decimal import Decimal
from typing import Any, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.models import Article, JournalEntry, JournalEntryLine, FinancialDailySnapshot
from app.modules.finance.service_analytics import AnalyticService

logger = logging.getLogger(__name__)


def _cash_balance(db: Session, company_id: Any) -> Decimal:
    """Real balance of class-5 (trésorerie) accounts — same query already
    used by GET /analytics/dashboard, kept in sync deliberately."""
    return db.query(
        func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount)
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('5%')
    ).scalar() or Decimal('0')


def _inventory_value(db: Session, company_id: Any) -> Decimal:
    """Real stock valuation — same query already used by GET /articles/stats."""
    return db.query(
        func.sum(Article.unit_price * Article.stock_quantity)
    ).filter(
        Article.company_id == company_id,
        Article.is_active == True
    ).scalar() or Decimal('0')


def capture_daily_snapshot(db: Session, company_id: Any, snapshot_date: Optional[dt.date] = None) -> FinancialDailySnapshot:
    """Idempotent: re-running for a date that already has a snapshot
    updates it in place (e.g. if the job is retried, or run manually
    mid-day and again at midnight) rather than creating a duplicate —
    enforced by the DB unique constraint (company_id, snapshot_date) as
    the source of truth, not just application logic."""
    snapshot_date = snapshot_date or dt.date.today()

    kpis = AnalyticService.get_financial_health_kpis(db, company_id)
    delays = AnalyticService.get_payment_delay_kpis(db, company_id)

    existing = db.query(FinancialDailySnapshot).filter(
        FinancialDailySnapshot.company_id == company_id,
        FinancialDailySnapshot.snapshot_date == snapshot_date
    ).first()

    # expenses_cumulative / accounts_payable have no single existing helper
    # returning them directly — computed here from Invoice/Payment like
    # AnalyticService already does for the receivables side.
    from app.core.models import Invoice, Payment
    expenses_cumulative = db.query(func.sum(Invoice.total_htt)).filter(
        Invoice.company_id == company_id, Invoice.type == 'purchase', Invoice.status != 'annulee'
    ).scalar() or Decimal('0')
    purchases_ttc = db.query(func.sum(Invoice.total_ttc)).filter(
        Invoice.company_id == company_id, Invoice.type == 'purchase', Invoice.status != 'annulee'
    ).scalar() or Decimal('0')
    purchases_paid = db.query(func.sum(Payment.amount)).join(
        Invoice, Payment.invoice_id == Invoice.id
    ).filter(Payment.company_id == company_id, Invoice.type == 'purchase').scalar() or Decimal('0')
    accounts_payable = purchases_ttc - purchases_paid

    values = dict(
        revenue_cumulative=Decimal(str(kpis["total_sales"])),
        expenses_cumulative=expenses_cumulative,
        cash_balance=_cash_balance(db, company_id),
        accounts_receivable=Decimal(str(kpis["accounts_receivable"])),
        accounts_payable=accounts_payable,
        inventory_value=_inventory_value(db, company_id),
        dso_days=Decimal(str(kpis["dso_days"])),
        dpo_days=Decimal(str(kpis["dpo_days"])),
        customer_avg_payment_delay_days=(
            Decimal(str(delays["customer_avg_payment_delay_days"]))
            if delays["customer_avg_payment_delay_days"] is not None else None
        ),
        supplier_avg_payment_delay_days=(
            Decimal(str(delays["supplier_avg_payment_delay_days"]))
            if delays["supplier_avg_payment_delay_days"] is not None else None
        ),
    )

    if existing:
        for field, value in values.items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    snapshot = FinancialDailySnapshot(
        company_id=company_id,
        snapshot_date=snapshot_date,
        **values
    )
    db.add(snapshot)
    db.commit()
    db.refresh(snapshot)
    return snapshot


def get_trend_features(db: Session, company_id: Any, lookback_days: int = 30) -> dict:
    """Real trend features for the chatbot ML model (f16-f20): percentage
    change between the most recent snapshot and the closest one at least
    `lookback_days` in the past. Returns None per-field (not 0.0) when
    fewer than 2 snapshots exist yet — the caller must render this as
    "insufficient historical data", never as a fabricated 0% change.
    """
    latest = db.query(FinancialDailySnapshot).filter(
        FinancialDailySnapshot.company_id == company_id
    ).order_by(FinancialDailySnapshot.snapshot_date.desc()).first()

    if not latest:
        return {
            "revenue_trend_pct": None, "expense_trend_pct": None,
            "cash_trend_pct": None, "inventory_trend_pct": None,
            "customer_delay_trend_days": None,
        }

    cutoff = latest.snapshot_date - dt.timedelta(days=lookback_days)
    baseline = db.query(FinancialDailySnapshot).filter(
        FinancialDailySnapshot.company_id == company_id,
        FinancialDailySnapshot.snapshot_date <= cutoff
    ).order_by(FinancialDailySnapshot.snapshot_date.desc()).first()

    if not baseline or baseline.id == latest.id:
        return {
            "revenue_trend_pct": None, "expense_trend_pct": None,
            "cash_trend_pct": None, "inventory_trend_pct": None,
            "customer_delay_trend_days": None,
        }

    def _pct_change(current: Decimal, previous: Decimal) -> Optional[float]:
        if previous is None or previous == 0:
            return None
        return float((current - previous) / abs(previous) * 100)

    customer_delay_trend = None
    if latest.customer_avg_payment_delay_days is not None and baseline.customer_avg_payment_delay_days is not None:
        customer_delay_trend = float(latest.customer_avg_payment_delay_days - baseline.customer_avg_payment_delay_days)

    return {
        "revenue_trend_pct": _pct_change(latest.revenue_cumulative, baseline.revenue_cumulative),
        "expense_trend_pct": _pct_change(latest.expenses_cumulative, baseline.expenses_cumulative),
        "cash_trend_pct": _pct_change(latest.cash_balance, baseline.cash_balance),
        "inventory_trend_pct": _pct_change(latest.inventory_value, baseline.inventory_value),
        "customer_delay_trend_days": customer_delay_trend,
    }
