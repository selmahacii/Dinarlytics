"""
SQLAlchemy ORM Models for Database Tables
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Enum, JSON, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from app.database import Base

# ========== ENUMS ==========
class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    VALIDATED = "validated"
    SENT = "sent"
    PAID = "paid"
    CANCELLED = "cancelled"

class PaymentMode(str, enum.Enum):
    CASH = "cash"
    CHECK = "check"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"

class DocumentType(str, enum.Enum):
    INVOICE = "invoice"
    DELIVERY_NOTE = "delivery_note"
    PURCHASE_ORDER = "purchase_order"
    PURCHASE_NOTE = "purchase_note"

class AccessLevel(str, enum.Enum):
    VIEW = "view"
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"
    APPROVE = "approve"
    SIGN = "sign"
    EXPORT = "export"

# ========== USER MODELS ==========
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False)
    username = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(255))
    last_name = Column(String(255))
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)
    last_login = Column(DateTime, default=None)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    company = relationship("Company", back_populates="users")
    roles = relationship("Role", secondary="user_roles", back_populates="users")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="created_by_user", foreign_keys="JournalEntry.created_by")
    
    def __repr__(self):
        return f"<User(username={self.username}, email={self.email})>"

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True, index=True)
    registration_number = Column(String(50), unique=True)
    tax_number = Column(String(50), unique=True)
    address = Column(String(500))
    phone = Column(String(20))
    email = Column(String(255))
    website = Column(String(255))
    currency_code = Column(String(3), default="DZD")
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="company", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="company", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Company(name={self.name})>"

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(500))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    users = relationship("User", secondary="user_roles", back_populates="roles")

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False)
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(String(500))
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    user = relationship("User", back_populates="sessions")

# ========== ACCOUNTING MODELS ==========
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

# ========== INVOICE MODELS ==========
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

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(String(500))
    tax_number = Column(String(50), unique=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<Client(name={self.name})>"

class Supplier(Base):
    __tablename__ = "fournisseurs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(String(500))
    tax_number = Column(String(50), unique=True)
    barcode = Column(String(64), unique=True, index=True)
    qr_code_url = Column(String(255), unique=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<Supplier(name={self.name})>"

# ========== ALERT & NOTIFICATION MODELS ==========
class AlertDefinition(Base):
    __tablename__ = "alert_definitions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    alert_code = Column(String(100), nullable=False, unique=True, index=True)
    alert_name = Column(String(255), nullable=False)
    alert_type = Column(String(50))  # financial, compliance, operational
    threshold_value = Column(Numeric(15, 2))
    comparison_operator = Column(String(10))  # <, >, <=, >=, =, !=
    severity_level = Column(String(50), default="medium")  # low, medium, high, critical
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<AlertDefinition(alert_code={self.alert_code})>"

class AlertTrigger(Base):
    __tablename__ = "alert_triggers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alert_definitions.id"), nullable=False, index=True)
    trigger_value = Column(Numeric(15, 2))
    status = Column(String(50), default="new", index=True)  # new, acknowledged, resolved
    priority = Column(String(50), default="normal")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    def __repr__(self):
        return f"<AlertTrigger(alert_id={self.alert_id}, status={self.status})>"

class UserNotification(Base):
    __tablename__ = "user_notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    notification_type = Column(String(100))  # alert, approval_request, document_shared
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    priority = Column(String(50), default="normal")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    def __repr__(self):
        return f"<UserNotification(user_id={self.user_id}, subject={self.subject})>"

# ========== DELIVERY NOTE MODELS ========== 
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

# ========== PURCHASE ORDER MODELS ========== 
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

# ========== PURCHASE NOTE MODELS ========== 
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

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User")
    company = relationship("Company")

    def __repr__(self):
        return f"<AuditLog(user_id={self.user_id}, action={self.action}, created_at={self.created_at})>"
