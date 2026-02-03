from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base

class DeliveryNote(Base):
    __tablename__ = "delivery_notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    delivery_number = Column(String(50), nullable=False, unique=True, index=True)
    delivery_date = Column(Date, nullable=False, index=True)
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False, index=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Relationships
    items = relationship("DeliveryNoteItem", back_populates="delivery_note", cascade="all, delete-orphan")

class DeliveryNoteItem(Base):
    __tablename__ = "delivery_note_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    delivery_note_id = Column(UUID(as_uuid=True), ForeignKey("delivery_notes.id"), nullable=False, index=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False, index=True)
    quantity = Column(Numeric(10, 3), nullable=False)
    barcode = Column(String(64), nullable=False, index=True)
    description = Column(Text)
    
    # Relationships
    delivery_note = relationship("DeliveryNote", back_populates="items")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    order_number = Column(String(50), nullable=False, unique=True, index=True)
    order_date = Column(Date, nullable=False, index=True)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("fournisseurs.id"), nullable=False, index=True)
    status = Column(String(50), default="draft", index=True)  # draft, confirmed, delivered, invoiced, cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Relationships
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    purchase_order_id = Column(UUID(as_uuid=True), ForeignKey("purchase_orders.id"), nullable=False, index=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False, index=True)
    quantity = Column(Numeric(10, 3), nullable=False)
    unit_price = Column(Numeric(15, 2), nullable=False)
    barcode = Column(String(64), nullable=False, index=True)
    description = Column(Text)
    
    # Relationships
    purchase_order = relationship("PurchaseOrder", back_populates="items")

class PurchaseNote(Base):
    __tablename__ = "purchase_notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    note_number = Column(String(50), nullable=False, unique=True, index=True)
    note_date = Column(Date, nullable=False, index=True)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("fournisseurs.id"), nullable=False, index=True)
    conformity_status = Column(String(50), default="ok", index=True)  # ok, defect, missing
    notes = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    # Relationships
    items = relationship("PurchaseNoteItem", back_populates="purchase_note", cascade="all, delete-orphan")

class PurchaseNoteItem(Base):
    __tablename__ = "purchase_note_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    purchase_note_id = Column(UUID(as_uuid=True), ForeignKey("purchase_notes.id"), nullable=False, index=True)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False, index=True)
    quantity_commanded = Column(Numeric(10, 3), nullable=False)
    quantity_received = Column(Numeric(10, 3), nullable=False)
    barcode = Column(String(64), nullable=False, index=True)
    conformity = Column(String(50), default="ok")  # ok, defect, missing
    description = Column(Text)
    
    # Relationships
    purchase_note = relationship("PurchaseNote", back_populates="items")
