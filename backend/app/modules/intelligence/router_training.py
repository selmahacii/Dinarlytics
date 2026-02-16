from fastapi import APIRouter, Depends, HTTPException
from app.modules.intelligence.service_training import TrainingService
from app.modules.intelligence.model_torch import ERPModel
from app.core.database import get_db
from sqlalchemy.orm import Session
from typing import List, Dict, Any

router = APIRouter(prefix="/training", tags=["training"])

@router.post("/train")
async def train_model_endpoint(
    train_data: List[Dict[str, Any]],
    epochs: int = 10,
    lr: float = 1e-3,
    batch_size: int = 8,
    db: Session = Depends(get_db)
):
    # Charger le mod????le ERP (???? adapter selon votre logique)
    model = ERPModel()
    result = TrainingService.train_model(model, train_data, epochs, lr, batch_size)
    return {"status": "success", "metrics": result}
