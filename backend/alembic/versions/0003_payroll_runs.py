"""Ajoute la table payroll_runs — trace comptable de la paie validée.

Le module RH (IRG/CNAS) était purement calculatoire : /payroll/simulate et
/payroll/summary ne persistaient jamais rien et ne généraient aucune
écriture comptable. payroll_runs enregistre une paie validée par période
(déduplication) et référence l'écriture JournalEntry (charges 641/645,
dettes 421/431/444) générée par POST /rh/employees/payroll/validate.

Revision ID: 0003_payroll_runs
Revises: 0002_article_supplier
Create Date: 2026-07-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003_payroll_runs"
down_revision = "0002_article_supplier"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "payroll_runs" not in inspector.get_table_names():
        op.create_table(
            "payroll_runs",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False),
            sa.Column("period", sa.String(7), nullable=False),
            sa.Column("journal_entry_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("journal_entries.id"), nullable=True),
            sa.Column("headcount", sa.Integer(), default=0),
            sa.Column("total_gross", sa.Numeric(15, 2), default=0),
            sa.Column("total_cnas_employee", sa.Numeric(15, 2), default=0),
            sa.Column("total_irg", sa.Numeric(15, 2), default=0),
            sa.Column("total_net", sa.Numeric(15, 2), default=0),
            sa.Column("total_cnas_employer", sa.Numeric(15, 2), default=0),
            sa.Column("validated_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("validated_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_payroll_runs_company_id", "payroll_runs", ["company_id"])
        op.create_index("ix_payroll_runs_period", "payroll_runs", ["period"])


def downgrade() -> None:
    op.drop_index("ix_payroll_runs_period", table_name="payroll_runs")
    op.drop_index("ix_payroll_runs_company_id", table_name="payroll_runs")
    op.drop_table("payroll_runs")
