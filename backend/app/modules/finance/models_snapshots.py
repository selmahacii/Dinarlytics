"""Historical daily snapshots feeding the ML chatbot's trend features
(f16-f20 of erp_multitask_v1) and any future time-series analysis.

Without this table, the ERP only ever exposed the CURRENT financial
state (via AnalyticService.get_financial_health_kpis) — there was no
way to compute a real trend ("is revenue growing or shrinking?",
"is inventory building up?") because no prior state was ever recorded.
This is a genuine data-availability gap, not a bug: the fix is to start
recording one row/day per company (see service_snapshots.py + the
capture_daily_snapshots Celery beat task) and let history accumulate.
Trend features remain honestly unavailable ("insufficient historical
data") until at least 2 snapshots exist for a company.
"""
from sqlalchemy import Column, String, DateTime, Date, ForeignKey, Numeric, UniqueConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class FinancialDailySnapshot(Base):
    __tablename__ = "financial_daily_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    snapshot_date = Column(Date, nullable=False, index=True)

    # Revenue / expenses history (cumulative-to-date, same convention as
    # AnalyticService.get_financial_health_kpis so snapshots stay directly
    # comparable to the live KPI endpoint).
    revenue_cumulative = Column(Numeric(18, 2), nullable=False, default=0)
    expenses_cumulative = Column(Numeric(18, 2), nullable=False, default=0)

    # Cash flow history — real balance of class-5 (trésorerie) accounts.
    cash_balance = Column(Numeric(18, 2), nullable=False, default=0)

    # Receivables / payables history.
    accounts_receivable = Column(Numeric(18, 2), nullable=False, default=0)
    accounts_payable = Column(Numeric(18, 2), nullable=False, default=0)

    # Inventory evolution — real stock valuation (articles.stock_quantity *
    # cost/unit_price), from GET /articles/stats.total_inventory_value.
    inventory_value = Column(Numeric(18, 2), nullable=False, default=0)

    # DSO/DPO history and average settlement delay (customers/suppliers),
    # both computed for real from Invoice/Payment date deltas — see
    # service_analytics.get_payment_delay_kpis.
    dso_days = Column(Numeric(8, 2), nullable=False, default=0)
    dpo_days = Column(Numeric(8, 2), nullable=False, default=0)
    customer_avg_payment_delay_days = Column(Numeric(8, 2), nullable=True)
    supplier_avg_payment_delay_days = Column(Numeric(8, 2), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("company_id", "snapshot_date", name="uq_financial_snapshot_company_date"),
        Index("ix_financial_snapshot_company_date", "company_id", "snapshot_date"),
    )
