"""CRUD for chatbot conversation persistence — see models_chatbot.py."""
from typing import Any, List, Optional
from sqlalchemy.orm import Session, joinedload

from app.modules.intelligence.models_chatbot import ChatbotConversation, ChatbotMessage


def create_conversation(db: Session, company_id: Any, user_id: Any, title: Optional[str] = None) -> ChatbotConversation:
    conversation = ChatbotConversation(
        company_id=company_id,
        user_id=user_id,
        title=title or "Nouvelle conversation"
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations(db: Session, user_id: Any) -> List[ChatbotConversation]:
    return db.query(ChatbotConversation).filter(
        ChatbotConversation.user_id == user_id,
        ChatbotConversation.is_active == True
    ).order_by(ChatbotConversation.updated_at.desc()).all()


def get_conversation(db: Session, conversation_id: Any, user_id: Any) -> Optional[ChatbotConversation]:
    return db.query(ChatbotConversation).options(joinedload(ChatbotConversation.messages)).filter(
        ChatbotConversation.id == conversation_id,
        ChatbotConversation.user_id == user_id,
        ChatbotConversation.is_active == True
    ).first()


def soft_delete_conversation(db: Session, conversation_id: Any, user_id: Any) -> bool:
    conversation = db.query(ChatbotConversation).filter(
        ChatbotConversation.id == conversation_id,
        ChatbotConversation.user_id == user_id
    ).first()
    if not conversation:
        return False
    conversation.is_active = False
    db.commit()
    return True


def add_message(db: Session, conversation_id: Any, role: str, content: str) -> ChatbotMessage:
    message = ChatbotMessage(conversation_id=conversation_id, role=role, content=content)
    db.add(message)

    conversation = db.query(ChatbotConversation).filter(ChatbotConversation.id == conversation_id).first()
    if conversation:
        # Auto-titre depuis le premier message utilisateur, tronqué —
        # évite que toutes les conversations s'appellent "Nouvelle
        # conversation" dans la liste.
        if role == "user" and conversation.title == "Nouvelle conversation":
            conversation.title = (content[:60] + "...") if len(content) > 60 else content

    db.commit()
    db.refresh(message)
    return message


def get_or_create_conversation(db: Session, company_id: Any, user_id: Any, conversation_id: Optional[Any]) -> ChatbotConversation:
    """Resolves the conversation a chat message belongs to: reuses the one
    given if it's real and owned by this user, otherwise starts a new one
    (first message of a session) — mirrors how the frontend previously had
    no concept of "conversation" at all, just one ephemeral message list."""
    if conversation_id:
        conversation = get_conversation(db, conversation_id, user_id)
        if conversation:
            return conversation
    return create_conversation(db, company_id, user_id)
