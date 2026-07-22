from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.modules.intelligence.service_prediction import PredictionService
from app.modules.intelligence.service_chatbot import FinancialChatbot
from app.modules.intelligence import service_chatbot_history as history
from app.core.database import get_db
from app.modules.auth.router_auth import get_current_user as get_current_user_from_token
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

class PredictRequest(BaseModel):
    model_name: str
    features: Dict[str, Any]
    company_id: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    company_id: Optional[str] = None
    conversation_id: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str

@router.post("/predict")
def ai_predict(req: PredictRequest):
    """Prédiction IA complète (risque, anomalies, suggestions, etc.)"""
    try:
        result = PredictionService.predict(req.model_name, req.features, req.company_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur IA predict: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")

@router.post("/chat")
def ai_chat(req: ChatRequest, db: Session = Depends(get_db), user_token: Any = Depends(get_current_user_from_token)):
    """Chat interactif avec LIA (Contextual Financial AI).

    Persiste désormais l'échange (message utilisateur + réponse) dans
    chatbot_conversations/chatbot_messages — auparavant entièrement sans
    état, tout l'historique de conversation vivait uniquement dans le
    state React du frontend et disparaissait au rechargement.
    """
    user_id = user_token.user_id
    company_id = user_token.company_id
    target_company = req.company_id or company_id

    conversation = history.get_or_create_conversation(db, target_company, user_id, req.conversation_id)
    history.add_message(db, conversation.id, "user", req.message)

    chatbot = FinancialChatbot(db, target_company, user_token.roles[0] if user_token.roles else "utilisateur")
    result = chatbot.process_message(req.message)

    assistant_content = result.get("content", "") if isinstance(result, dict) else str(result)
    history.add_message(db, conversation.id, "assistant", assistant_content)

    result["conversation_id"] = str(conversation.id)
    return result

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db), user_token: Any = Depends(get_current_user_from_token)):
    """Liste des conversations LIA de l'utilisateur courant, pour que le
    frontend puisse recharger l'historique au lieu de repartir à vide à
    chaque session."""
    conversations = history.list_conversations(db, user_token.user_id)
    return [
        ConversationResponse(
            id=str(c.id), title=c.title,
            created_at=c.created_at.isoformat() if c.created_at else "",
            updated_at=c.updated_at.isoformat() if c.updated_at else ""
        ) for c in conversations
    ]

@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(conversation_id: str, db: Session = Depends(get_db), user_token: Any = Depends(get_current_user_from_token)):
    conversation = history.get_conversation(db, conversation_id, user_token.user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return [
        MessageResponse(
            id=str(m.id), role=m.role, content=m.content,
            created_at=m.created_at.isoformat() if m.created_at else ""
        ) for m in conversation.messages
    ]

@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: str, db: Session = Depends(get_db), user_token: Any = Depends(get_current_user_from_token)):
    ok = history.soft_delete_conversation(db, conversation_id, user_token.user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Conversation not found")

@router.post("/insights")
def ai_insights(req: PredictRequest):
    """Détection d'anomalies et analyse IA"""
    try:
        result = PredictionService.predict(req.model_name, req.features, req.company_id)
        return {
            "anomaly": result.get("financial_analysis", {}).get("anomaly"),
            "financial_analysis": result.get("financial_analysis", {}),
            "risk_level": result.get("risk_level"),
            "health_score": result.get("health_score"),
            "suggestions": result.get("suggestions", {})
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur IA insights: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne du serveur")
