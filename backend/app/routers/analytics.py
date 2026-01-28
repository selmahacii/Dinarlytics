from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.permissions import get_current_user_from_token, require_permission
from app.services.analytics import AnalyticService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/financial-health")
async def get_financial_health(
    db: Session = Depends(get_db), 
    user: dict = Depends(get_current_user_from_token)
):
    """Exposes high-level KPIs based on unified AnalyticService."""
    return AnalyticService.get_financial_health_kpis(db, user["company_id"])

@router.get("/revenue-chart")
async def get_revenue_chart(
    periods: int = 6,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """Exposes chart data logic."""
    return AnalyticService.get_revenue_chart_data(db, user["company_id"], periods)

@router.get("/alerts")
async def get_smart_alerts(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """Smart financial alerts (DSO, Tax deadlines, Anomaly)."""
    return AnalyticService.get_smart_alerts(db, user["company_id"])

@router.get("/forecast")
async def get_forecast(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """AI Rolling Plan Forecast."""
    return AnalyticService.get_performance_forecast(db, user["company_id"])

