from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from app.database import Base

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
