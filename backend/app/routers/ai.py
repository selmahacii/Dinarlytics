from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.prediction import PredictionService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["ai"])

class PredictRequest(BaseModel):
    model_name: str
    features: Dict[str, Any]
    company_id: Optional[int] = None

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

@router.post("/insights")
def ai_insights(req: PredictRequest):
    """Détection d'anomalies et analyse IA (retourne uniquement l'analyse/anomalies)"""
    try:
        result = PredictionService.predict(req.model_name, req.features, req.company_id)
        # On retourne uniquement l'analyse et l'anomalie
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
