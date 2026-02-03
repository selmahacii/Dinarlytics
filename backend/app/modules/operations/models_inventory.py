from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    invoice_number = Column(String(50), nullable=False, unique=True, index=True)
    invoice_date = Column(Date, nullable=False, index=True)
    due_date = Column(Date)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"))
    total_htt = Column(Numeric(15, 2), default=0)  # Hors Taxes
    total_tva = Column(Numeric(15, 2), default=0)  # TVA
    total_ttc = Column(Numeric(15, 2), default=0)  # Total TTC
    currency_code = Column(String(3), default="DZD")
    status = Column(String(50), default="draft", index=True)
    payment_status = Column(String(50), default="unpaid", index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    company = relationship("Company", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Invoice(invoice_number={self.invoice_number})>"

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False, index=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"))
    quantity = Column(Numeric(10, 3), nullable=False)
    unit_price_htt = Column(Numeric(15, 2), nullable=False)  # Price without tax
    tva_rate = Column(Numeric(5, 2), default=19)  # 19% standard in Algeria
    tva_amount = Column(Numeric(15, 2), default=0)
    total_ttc = Column(Numeric(15, 2), default=0)
    discount_type = Column(String(20), default="percentage")  # percentage, fixed
    discount_value = Column(Numeric(15, 2), default=0)
    
    # Relationships
    invoice = relationship("Invoice", back_populates="items")

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    code = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    unit_price = Column(Numeric(15, 2), nullable=False)
    barcode = Column(String(64), unique=True, index=True)
    qr_code_url = Column(String(255), unique=True)
    stock_quantity = Column(Numeric(10, 3), default=0)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<Article(code={self.code}, name={self.name})>"
