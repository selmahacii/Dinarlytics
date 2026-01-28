from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Any
from decimal import Decimal
from app.database import get_db
from app.permissions import get_current_user_from_token, require_permission
from app.services.calculations import AlgerianFinancialCalculator
from app.models import Invoice, JournalEntry

router = APIRouter(prefix="/fiscality", tags=["fiscality"])

@router.get("/g50-summary")
async def get_g50_summary(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """
    Unified Algerian G50 calculation endpoint.
    Retrieves sales and purchases for the specified month to compute tax obligations.
    """
    company_id = user["company_id"]
    
    # Calculate Sales HT
    sales_ht = db.query(func.sum(Invoice.total_ht)).filter(
        Invoice.company_id == company_id,
        extract('month', Invoice.date_emission) == month,
        extract('year', Invoice.date_emission) == year,
        Invoice.statut != 'annulee'
    ).scalar() or Decimal('0')

    # Calculate Purchases HT (Assuming we have a Purchase model or filter Invoice by type)
    # For now, let's assume we fetch from entries with class 6 (SCF)
    purchases_ht = Decimal('0') # Need implementation for real purchase tracking

    summary = AlgerianFinancialCalculator.calculate_g50_summary(sales_ht, purchases_ht)
    return summary

@router.get("/ibs-simulation")
async def simulate_ibs(
    accounting_profit: Decimal,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """Simulates IBS based on current accounting profit."""
    return AlgerianFinancialCalculator.calculate_ibs(accounting_profit)
