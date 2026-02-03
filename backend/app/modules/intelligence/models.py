from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Numeric, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base

class AIModel(Base):
    __tablename__ = "ai_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False) # 'forecast', 'scoring', 'nlp', 'anomaly'
    version = Column(String(20))
    description = Column(Text)
    file_url = Column(Text)
    framework = Column(String(30), default='pytorch')
    input_schema = Column(JSONB)
    output_schema = Column(JSONB)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AIPrediction(Base):
    __tablename__ = "ai_predictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    entity_type = Column(String(50))
    entity_id = Column(UUID(as_uuid=True))
    input_data = Column(JSONB)
    prediction = Column(JSONB)
    score = Column(Numeric(10, 6))
    scores = Column(JSONB)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AITrainingLog(Base):
    __tablename__ = "ai_training_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.id"), nullable=False)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    ended_at = Column(DateTime)
    status = Column(String(20), default='running')
    metrics = Column(JSONB)
    config = Column(JSONB)
    trained_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    notes = Column(Text)

class AIFeatureStore(Base):
    __tablename__ = "ai_feature_store"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.id"))
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"))
    feature_set_name = Column(String(100), nullable=False)
    version = Column(String(20), nullable=False)
    features = Column(JSONB, nullable=False)
    source_tables = Column(Text)
    hash = Column(String(64))
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AIDriftMonitoring(Base):
    __tablename__ = "ai_drift_monitoring"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.id"), nullable=False)
    feature_set_name = Column(String(100), nullable=False)
    feature_name = Column(String(100), nullable=False)
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    ref_distribution = Column(JSONB)
    current_distribution = Column(JSONB)
    drift_metric = Column(Numeric(12, 6))
    threshold = Column(Numeric(12, 6))
    drift_detected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
