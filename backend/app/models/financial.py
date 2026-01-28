from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from app.database import Base

class PaymentMode(str, enum.Enum):
    CASH = "cash"
    CHECK = "check"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"

class FinancialStatement(Base):
    __tablename__ = "financial_statements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    exercice = Column(String(10), nullable=False)
    total_assets = Column(Numeric(18, 2))
    current_assets = Column(Numeric(18, 2))
    current_liabilities = Column(Numeric(18, 2))
    equity = Column(Numeric(18, 2))
    operating_expenses = Column(Numeric(18, 2))
    depreciation = Column(Numeric(18, 2))
    amortization = Column(Numeric(18, 2))
    interest_expense = Column(Numeric(18, 2))
    taxes_expense = Column(Numeric(18, 2))
    net_income = Column(Numeric(18, 2))
    current_inventory = Column(Numeric(18, 2))
    # For compatibility with existing raw queries that use 'revenue' and 'expenses'
    # and 'period' instead of 'exercice'
    # Actually I should be careful. I'll check db.py again.
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    payment_date = Column(Date, nullable=False, default=lambda: datetime.now(timezone.utc).date())
    mode = Column(Enum(PaymentMode), default=PaymentMode.BANK_TRANSFER)
    reference = Column(String(100))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
