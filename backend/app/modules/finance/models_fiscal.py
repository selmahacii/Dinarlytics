from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class FiscalDeclaration(Base):
    __tablename__ = "fiscal_declarations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    document_id = Column(String(100), nullable=False, index=True)
    country = Column(String(5), nullable=False, default="DZ")
    data = Column(JSON, nullable=True)
    status = Column(String(20), default="brouillon", index=True)  # brouillon, soumis, valide, rejete
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f"<FiscalDeclaration(document_id={self.document_id}, status={self.status})>"
