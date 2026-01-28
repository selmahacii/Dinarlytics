import logging
import torch
from app.celery_app import celery_app
from app.services.training import TrainingService
from app.services.prediction import PredictionService
from app.config import MODEL_CONFIG
from app.database import SessionLocal
from app.models import AITrainingLog, AIModel
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def train_model_task(self, model_name: str, train_data: list, epochs: int = 20):
    """Tâche Celery pour l'entraînement asynchrone du modèle."""
    db = SessionLocal()
    
    # Créer un log d'entraînement
    model = db.query(AIModel).filter(AIModel.name == model_name).first()
    log = AITrainingLog(
        model_id=model.id if model else None,
        status="running",
        config={"epochs": epochs, "data_size": len(train_data)},
        started_at=datetime.now(timezone.utc)
    )
    db.add(log)
    db.commit()
    
    try:
        self.update_state(state='PROGRESS', meta={'progress': 0})
        
        # Obtenir le modèle via PredictionService (caching + chargement)
        torch_model = PredictionService.get_model(model_name)
        
        # Lancer l'entraînement
        result = TrainingService.train_model(
            torch_model, 
            train_data, 
            epochs=epochs
        )
        
        # Sauvegarder l'artefact si nécessaire
        if MODEL_CONFIG[model_name]["model_path"]:
            torch.save(torch_model.state_dict(), MODEL_CONFIG[model_name]["model_path"])
        
        # Mettre à jour le log
        log.status = "success"
        log.ended_at = datetime.now(timezone.utc)
        log.metrics = result
        db.commit()
        
        return result
        
    except Exception as e:
        logger.error(f"Erreur lors de l'entraînement asynchrone: {e}")
        log.status = "failed"
        log.notes = str(e)
        log.ended_at = datetime.now(timezone.utc)
        db.commit()
        raise
    finally:
        db.close()
