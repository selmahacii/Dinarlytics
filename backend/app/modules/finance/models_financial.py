from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum

from app.core.database import Base

class PaymentMode(str, enum.Enum):
    CASH = "cash"
    CHECK = "check"
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    CCP = "ccp"                 # Compte Courant Postal
    EFFET = "effet"             # Lettre de change / Traite
    VERSEMENT = "versement"     # Versement esp????ces banque

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

    # Gestion des Ch????ques (Coffre-fort)
    check_status = Column(Enum('received', 'deposited', 'cleared', 'rejected', 'cancelled', name='check_status_enum'), nullable=True)
    check_number = Column(String(50), nullable=True)
    bank_name = Column(String(100), nullable=True)
    due_date = Column(Date, nullable=True) # Date encaissement pr????vu
    deposit_slip_number = Column(String(50), nullable=True) # Num????ro bordereau remise

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    exercice = Column(String(10), nullable=False) # e.g. "2025"
    status = Column(String(50), default="draft") # draft, active, closed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    items = relationship("BudgetItem", back_populates="budget", cascade="all, delete-orphan")

class BudgetItem(Base):
    __tablename__ = "budget_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    budget_id = Column(UUID(as_uuid=True), ForeignKey("budgets.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False) # e.g. "Salaires", "Loyers", "Ventes"
    account_code = Column(String(50)) # Optional mapping to SCF account
    budgeted_amount = Column(Numeric(18, 2), nullable=False)
    actual_amount = Column(Numeric(18, 2), default=0)
    variance = Column(Numeric(18, 2), default=0)
    
    budget = relationship("Budget", back_populates="items")

class CollectionAction(Base):
    """Tracking debt collection actions (Relances)"""
    __tablename__ = "collection_actions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False, index=True)
    action_type = Column(String(50), nullable=False) # email, phone, mail, legal
    action_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String(50), default="completed") # sent, failed, pending
    notes = Column(String(500))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))

class Immobilisation(Base):
    __tablename__ = "immobilisations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    code = Column(String(50), nullable=False)
    designation = Column(String(255), nullable=False)
    categorie = Column(String(100), nullable=False)
    date_acquisition = Column(Date, nullable=False)
    duree_vie = Column(Integer, nullable=False)
    valeur_acquisition = Column(Numeric(15, 2), nullable=False)
    valeur_residuelle = Column(Numeric(15, 2), default=0)
    methode = Column(String(50), default="lineaire")  # 'lineaire', 'degressif', 'uop'
    taux_amort = Column(Numeric(5, 2), nullable=False)
    departement = Column(String(100))
    fournisseur = Column(String(255))
    status = Column(String(50), default="active")  # 'active', 'fully_depreciated', 'disposed'
    compte_pca = Column(String(50))
    compte_ifrs = Column(String(50))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    matricule = Column(String(50), nullable=False)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    poste = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    contract_type = Column(String(50), nullable=False) # cdi, cdd, stage, freelance
    date_embauche = Column(Date, nullable=False)
    salaire_base = Column(Numeric(15, 2), nullable=False)
    primes = Column(Numeric(15, 2), default=0)
    email = Column(String(255))
    telephone = Column(String(50))
    status = Column(String(50), default="actif") # actif, conge, inactif
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class PayrollRun(Base):
    """Une paie validée pour une période (mois/année) — génère une écriture
    comptable réelle (charges 641/645, dettes 421/431/444) et empêche de
    revalider deux fois la même période. Auparavant, /payroll/simulate et
    /payroll/summary étaient purement calculatoires : la paie n'avait
    aucune trace comptable, module RH totalement isolé de la comptabilité."""
    __tablename__ = "payroll_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    period = Column(String(7), nullable=False, index=True)  # "YYYY-MM"
    journal_entry_id = Column(UUID(as_uuid=True), ForeignKey("journal_entries.id"), nullable=True)
    headcount = Column(Integer, default=0)
    total_gross = Column(Numeric(15, 2), default=0)
    total_cnas_employee = Column(Numeric(15, 2), default=0)
    total_irg = Column(Numeric(15, 2), default=0)
    total_net = Column(Numeric(15, 2), default=0)
    total_cnas_employer = Column(Numeric(15, 2), default=0)
    validated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    validated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


