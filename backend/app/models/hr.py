from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from app.database import Base

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    matricule = Column(String(50), unique=True, index=True)
    ssn = Column(String(20), unique=True) # Num????ro S????curit???? Sociale (CNAS)
    job_title = Column(String(100))
    department = Column(String(100))
    
    base_salary = Column(Numeric(15, 2)) # Salaire de base
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    payslips = relationship("Payslip", back_populates="employee")

class Payslip(Base):
    __tablename__ = "payslips"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    
    period = Column(String(7)) # YYYY-MM
    
    base_salary = Column(Numeric(15, 2))
    bonuses = Column(Numeric(15, 2), default=0) # Primes imposables
    allowances = Column(Numeric(15, 2), default=0) # Indemnit????s (Panier/Transport)
    
    gross_salary = Column(Numeric(15, 2)) # Salaire Brut
    
    cotisation_cnas = Column(Numeric(15, 2)) # 9%
    irg_amount = Column(Numeric(15, 2)) # Retenue IRG
    
    net_salary = Column(Numeric(15, 2)) # Net ???? payer
    
    payment_status = Column(String(50), default="pending") # pending, paid
    payment_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    employee = relationship("Employee", back_populates="payslips")
