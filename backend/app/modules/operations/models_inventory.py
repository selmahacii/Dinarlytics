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
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), index=True)
    # Facture d'ACHAT : liée à un fournisseur (client_id reste NULL) —
    # permet le cycle achats complet (facture fournisseur → écriture AC →
    # TVA déductible réelle dans la G50 → stock incrémenté à réception).
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("fournisseurs.id"), index=True)
    type = Column(String(20), default="sale", nullable=False, index=True)
    # Les totaux sont TOUJOURS stockés dans la devise de BASE de
    # l'entreprise (convertis à la création si facturé en devise
    # étrangère) — ainsi toutes les agrégations (CA, créances, analytics)
    # restent homogènes sans conversion dispersée dans chaque requête.
    total_htt = Column(Numeric(15, 2), default=0)  # Hors Taxes
    total_tva = Column(Numeric(15, 2), default=0)  # TVA
    total_ttc = Column(Numeric(15, 2), default=0)  # Total TTC
    # Devise d'ORIGINE de la facture + taux appliqué à la création
    # (1 unité de currency_code = exchange_rate unités de devise de base).
    # Montant original = total / exchange_rate.
    currency_code = Column(String(3), default="DZD")
    exchange_rate = Column(Numeric(18, 6), default=1)
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
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), index=True)
    # Désignation libre de la ligne (envoyée par le front, requise pour la
    # ligne spéciale "Droit de Timbre") — était perdue faute de colonne.
    description = Column(String(500))
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
    # `code` rendu nullable : le routeur articles crée via `sku` sans fournir
    # de code (NOT NULL provoquait un échec systématique de création).
    code = Column(String(50), nullable=True, unique=True, index=True)
    sku = Column(String(50), index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    unit_price = Column(Numeric(15, 2), nullable=False)
    cost_price = Column(Numeric(15, 2))
    tax_rate = Column(Numeric(5, 2), default=19)
    barcode = Column(String(64), unique=True, index=True)
    qr_code_url = Column(String(255), unique=True)
    stock_quantity = Column(Numeric(10, 3), default=0)
    min_stock_level = Column(Numeric(10, 3), default=10)
    # Fournisseur habituel — sans ce lien, une alerte de réapprovisionnement
    # ne peut mener à aucune commande fournisseur automatique : l'écran
    # d'inventaire se contentait de rediriger vers /fournisseurs faute de
    # savoir à qui commander.
    preferred_supplier_id = Column(UUID(as_uuid=True), ForeignKey("fournisseurs.id"), nullable=True, index=True)
    category = Column(String(100), default="General", index=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    def __repr__(self):
        return f"<Article(code={self.code}, name={self.name})>"
