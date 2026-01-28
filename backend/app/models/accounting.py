from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Numeric, Date, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.database import Base

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
