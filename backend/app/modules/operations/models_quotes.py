from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class Quote(Base):
    __tablename__ = "quotes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    quote_number = Column(String(50), nullable=False, unique=True, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False, index=True)
    quote_date = Column(Date, nullable=False, index=True)
    expiry_date = Column(Date)
    status = Column(String(20), default="draft", index=True)  # draft, sent, accepted, refused, expired
    total_htt = Column(Numeric(15, 2), default=0)
    total_tva = Column(Numeric(15, 2), default=0)
    total_ttc = Column(Numeric(15, 2), default=0)
    notes = Column(Text)
    commercial_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    converted_invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    company = relationship("Company")
    client = relationship("Client")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Quote(quote_number={self.quote_number})>"


class QuoteItem(Base):
    __tablename__ = "quote_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id = Column(UUID(as_uuid=True), ForeignKey("quotes.id"), nullable=False, index=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"))
    description = Column(String(255))
    quantity = Column(Numeric(10, 3), nullable=False)
    unit_price_htt = Column(Numeric(15, 2), nullable=False)
    tva_rate = Column(Numeric(5, 2), default=19)
    tva_amount = Column(Numeric(15, 2), default=0)
    total_ttc = Column(Numeric(15, 2), default=0)

    quote = relationship("Quote", back_populates="items")
