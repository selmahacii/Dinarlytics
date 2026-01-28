from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.database import Base

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
