from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.prediction import PredictionService
from app.services.chatbot import FinancialChatbot
from app.database import get_db
from app.permissions import get_current_user_from_token
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
def ai_chat(req: ChatRequest, db: Session = Depends(get_db), user: dict = Depends(get_current_user_from_token)):
    """Chat interactif avec LIA (Contextual Financial AI)"""
    from app.database import set_db_user_context
    set_db_user_context(db, user["user_id"])
    
    chatbot = FinancialChatbot(db, req.company_id or user["company_id"], user["roles"][0] if user["roles"] else "utilisatateur")
    return chatbot.process_message(req.message)

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
