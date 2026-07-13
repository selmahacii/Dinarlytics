"""
Documents uploadés (factures/devis/relevés scannés ou importés).

Le fichier binaire est stocké sur disque sous data/uploads/<company_id>/,
la base ne garde que les métadonnées — le multi-tenant est garanti par le
company_id à la fois en base et dans le chemin de stockage.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class UploadedDocument(Base):
    __tablename__ = "uploaded_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    # facture | devis | releve_bancaire | declaration | autre
    doc_type = Column(String(30), default="autre", index=True)
    original_filename = Column(String(255), nullable=False)
    content_type = Column(String(100))
    size_bytes = Column(Integer, default=0)
    storage_path = Column(String(500), nullable=False)
    # Identifiant optionnel de l'objet métier lié (facture/devis créé depuis ce scan)
    linked_entity_type = Column(String(50))
    linked_entity_id = Column(UUID(as_uuid=True))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
