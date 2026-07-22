"""Ajoute chatbot_conversations et chatbot_messages — persistance des
échanges avec LIA. Auparavant, FinancialChatbot.process_message était
entièrement sans état (aucune écriture DB) et le frontend
(ChatbotLIA.tsx) gardait l'historique en simple state React, perdu à
chaque rechargement/changement d'utilisateur.

Revision ID: 0005_chatbot_conversations
Revises: 0004_financial_snapshots
Create Date: 2026-07-23
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0005_chatbot_conversations"
down_revision = "0004_financial_snapshots"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if "chatbot_conversations" not in existing_tables:
        op.create_table(
            "chatbot_conversations",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False),
            sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("title", sa.String(255), nullable=False, server_default="Nouvelle conversation"),
            sa.Column("is_active", sa.Boolean(), server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_chatbot_conversations_company_id", "chatbot_conversations", ["company_id"])
        op.create_index("ix_chatbot_conversations_user_id", "chatbot_conversations", ["user_id"])
        op.create_index("ix_chatbot_conversations_is_active", "chatbot_conversations", ["is_active"])
        op.create_index("ix_chatbot_conversations_created_at", "chatbot_conversations", ["created_at"])
        op.create_index("ix_chatbot_conversations_user_active", "chatbot_conversations", ["user_id", "is_active"])

    if "chatbot_messages" not in existing_tables:
        op.create_table(
            "chatbot_messages",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("conversation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("chatbot_conversations.id"), nullable=False),
            sa.Column("role", sa.String(20), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_chatbot_messages_conversation_id", "chatbot_messages", ["conversation_id"])
        op.create_index("ix_chatbot_messages_created_at", "chatbot_messages", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_chatbot_messages_created_at", table_name="chatbot_messages")
    op.drop_index("ix_chatbot_messages_conversation_id", table_name="chatbot_messages")
    op.drop_table("chatbot_messages")

    op.drop_index("ix_chatbot_conversations_user_active", table_name="chatbot_conversations")
    op.drop_index("ix_chatbot_conversations_created_at", table_name="chatbot_conversations")
    op.drop_index("ix_chatbot_conversations_is_active", table_name="chatbot_conversations")
    op.drop_index("ix_chatbot_conversations_user_id", table_name="chatbot_conversations")
    op.drop_index("ix_chatbot_conversations_company_id", table_name="chatbot_conversations")
    op.drop_table("chatbot_conversations")
