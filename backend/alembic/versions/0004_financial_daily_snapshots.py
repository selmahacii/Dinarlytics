"""Ajoute financial_daily_snapshots — historique quotidien réel pour les
features de tendance du chatbot ML (f16-f20 de erp_multitask_v1) et
toute analyse de série temporelle future.

Avant cette migration, l'ERP n'exposait que l'état financier COURANT
(AnalyticService.get_financial_health_kpis) : aucune tendance
(croissance CA, évolution stock, etc.) n'était calculable faute d'un
point de comparaison antérieur enregistré. Cette table est alimentée
quotidiennement par la tâche Celery capture_daily_snapshots
(app/modules/finance/tasks_snapshots.py) — les features de tendance
restent honnêtement indisponibles ("insufficient historical data")
tant que moins de 2 snapshots existent pour une entreprise.

Revision ID: 0004_financial_snapshots
Revises: 0003_payroll_runs
Create Date: 2026-07-23
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004_financial_snapshots"
down_revision = "0003_payroll_runs"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "financial_daily_snapshots" not in inspector.get_table_names():
        op.create_table(
            "financial_daily_snapshots",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False),
            sa.Column("snapshot_date", sa.Date(), nullable=False),
            sa.Column("revenue_cumulative", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("expenses_cumulative", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("cash_balance", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("accounts_receivable", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("accounts_payable", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("inventory_value", sa.Numeric(18, 2), nullable=False, server_default="0"),
            sa.Column("dso_days", sa.Numeric(8, 2), nullable=False, server_default="0"),
            sa.Column("dpo_days", sa.Numeric(8, 2), nullable=False, server_default="0"),
            sa.Column("customer_avg_payment_delay_days", sa.Numeric(8, 2), nullable=True),
            sa.Column("supplier_avg_payment_delay_days", sa.Numeric(8, 2), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.UniqueConstraint("company_id", "snapshot_date", name="uq_financial_snapshot_company_date"),
        )
        op.create_index("ix_financial_daily_snapshots_company_id", "financial_daily_snapshots", ["company_id"])
        op.create_index("ix_financial_daily_snapshots_snapshot_date", "financial_daily_snapshots", ["snapshot_date"])
        op.create_index("ix_financial_snapshot_company_date", "financial_daily_snapshots", ["company_id", "snapshot_date"])


def downgrade() -> None:
    op.drop_index("ix_financial_snapshot_company_date", table_name="financial_daily_snapshots")
    op.drop_index("ix_financial_daily_snapshots_snapshot_date", table_name="financial_daily_snapshots")
    op.drop_index("ix_financial_daily_snapshots_company_id", table_name="financial_daily_snapshots")
    op.drop_table("financial_daily_snapshots")
