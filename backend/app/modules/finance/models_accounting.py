from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Numeric, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base

class ChartOfAccount(Base):
    __tablename__ = "chart_of_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    account_code = Column(String(50), nullable=False, index=True)
    account_name = Column(String(255), nullable=False)
    account_class = Column(Integer)  # 1-7 per chart of accounts structure
    account_type = Column(String(50))  # asset, liability, equity, revenue, expense
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<ChartOfAccount(code={self.account_code}, name={self.account_name})>"

class JournalEntry(Base):
    __tablename__ = "journal_entries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    entry_number = Column(String(50), nullable=False, unique=True)
    entry_date = Column(Date, nullable=False, index=True)
    description = Column(String(500))
    status = Column(String(50), default="draft", index=True)  # draft, posted, approved
    total_debit = Column(Numeric(15, 2), default=0)
    total_credit = Column(Numeric(15, 2), default=0)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    company = relationship("Company", back_populates="journal_entries")
    created_by_user = relationship("User", back_populates="journal_entries", foreign_keys=[created_by])
    lines = relationship("JournalEntryLine", back_populates="journal_entry", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<JournalEntry(entry_number={self.entry_number})>"

class JournalEntryLine(Base):
    __tablename__ = "journal_entry_lines"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    journal_entry_id = Column(UUID(as_uuid=True), ForeignKey("journal_entries.id"), nullable=False, index=True)
    account_code = Column(String(50), nullable=False, index=True)
    debit_amount = Column(Numeric(15, 2), default=0)
    credit_amount = Column(Numeric(15, 2), default=0)
    description = Column(String(500))
    
    # Relationships
    journal_entry = relationship("JournalEntry", back_populates="lines")

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    account_code = Column(String(50), nullable=False, index=True)
    bank_name = Column(String(255), nullable=False)
    iban = Column(String(50), nullable=True)
    currency = Column(String(3), default="DZD")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class BankStatement(Base):
    __tablename__ = "bank_statements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    bank_account_id = Column(UUID(as_uuid=True), ForeignKey("bank_accounts.id"), nullable=False, index=True)
    statement_number = Column(String(50), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    starting_balance = Column(Numeric(15, 2), default=0)
    ending_balance = Column(Numeric(15, 2), default=0)
    import_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    file_format = Column(String(20), default="manuel")
    status = Column(String(50), default="importe")  # brouillon, importe, en_cours, rapproche, cloture
    
    # Relationships
    lines = relationship("BankStatementLine", back_populates="statement", cascade="all, delete-orphan")
    bank_account = relationship("BankAccount")

class BankStatementLine(Base):
    __tablename__ = "bank_statement_lines"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    statement_id = Column(UUID(as_uuid=True), ForeignKey("bank_statements.id"), nullable=False, index=True)
    operation_date = Column(Date, nullable=False)
    value_date = Column(Date, nullable=True)
    label = Column(String(500), nullable=False)
    reference = Column(String(100), nullable=True)
    amount = Column(Numeric(15, 2), nullable=False)
    type = Column(String(20), nullable=False)  # debit or credit
    balance = Column(Numeric(15, 2), default=0)
    category = Column(String(100), nullable=True)
    check_number = Column(String(50), nullable=True)
    iban = Column(String(50), nullable=True)
    bic = Column(String(20), nullable=True)
    reconciliation_status = Column(String(50), default="non_rapproche")  # non_rapproche, rapproche, en_attente, dispute
    reconciled_entry_id = Column(UUID(as_uuid=True), ForeignKey("journal_entry_lines.id"), nullable=True)
    confidence_score = Column(Numeric(5, 2), nullable=True)
    
    # Relationships
    statement = relationship("BankStatement", back_populates="lines")
    reconciled_entry = relationship("JournalEntryLine")
