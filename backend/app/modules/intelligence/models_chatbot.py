"""Persistence for LIA chatbot conversations — previously entirely
absent: the frontend (ChatbotLIA.tsx) held `messages` in plain React
state, wiped on every reload/user switch, and the backend
(FinancialChatbot.process_message) was fully stateless (no DB write at
all). Mirrors the is_active soft-delete convention already used across
the codebase (auth/models.py, models_partners.py, etc.) rather than
introducing a new is_deleted/deleted_at pattern.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class ChatbotConversation(Base):
    __tablename__ = "chatbot_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Nouvelle conversation")
    is_active = Column(Boolean, default=True, index=True)  # soft delete, same convention as the rest of the app
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    messages = relationship(
        "ChatbotMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ChatbotMessage.created_at"
    )

    __table_args__ = (
        Index("ix_chatbot_conversations_user_active", "user_id", "is_active"),
    )


class ChatbotMessage(Base):
    __tablename__ = "chatbot_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("chatbot_conversations.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user' | 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    conversation = relationship("ChatbotConversation", back_populates="messages")
