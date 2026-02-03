from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Any
from decimal import Decimal
from app.core.database import get_db
from app.core.permissions import get_current_user_from_token, require_permission
from app.modules.finance.service_calculations import AlgerianFinancialCalculator
from app.core.models import Invoice, JournalEntry, JournalEntryLine
from app.modules.finance.service_jibaya import JibayaService
from fastapi.responses import Response

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
    
    # Calculate Sales HT (Class 7 - Credit)
    sales_ht = db.query(func.sum(JournalEntryLine.credit_amount - JournalEntryLine.debit_amount))\
        .join(JournalEntry)\
        .filter(
            JournalEntry.company_id == company_id,
            JournalEntry.status == 'approved',
            extract('month', JournalEntry.entry_date) == month,
            extract('year', JournalEntry.entry_date) == year,
            JournalEntryLine.account_code.like('7%')
        ).scalar() or Decimal('0')

    # Calculate Purchases HT (Class 6 - Debit)
    purchases_ht = db.query(func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount))\
        .join(JournalEntry)\
        .filter(
            JournalEntry.company_id == company_id,
            JournalEntry.status == 'approved',
            extract('month', JournalEntry.entry_date) == month,
            extract('year', JournalEntry.entry_date) == year,
            JournalEntryLine.account_code.like('6%')
        ).scalar() or Decimal('0')

    # IRG (Account 442 or similar, Credit side for payments due) - Approximation
    irg_amount = Decimal('0') # To be refined with payroll module

    # Timbre (Account 64... Droit de timbre)
    stamp_duty = Decimal('0') 

    summary = AlgerianFinancialCalculator.calculate_g50_summary(
        sales_ht, 
        purchases_ht,
        irg_amount=irg_amount,
        stamp_duty=stamp_duty
    )
    return summary

@router.get("/ibs-simulation")
async def simulate_ibs(
    accounting_profit: Decimal,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """Simulates IBS based on current accounting profit."""
    return AlgerianFinancialCalculator.calculate_ibs(accounting_profit)

@router.get("/liasse-fiscale/xml")
async def export_liasse_xml(
    year: int = Query(..., ge=2000),
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """
    Export the Fiscal Bundle (Liasse Fiscale) as Jibaya-compatible XML.
    Aggregates Balance Sheet (Actif/Passif) and Income Statement (TCR).
    """
    company_id = user["company_id"]
    
    xml_content = JibayaService.generate_xml_liasse(db, company_id, year)
    
    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename=liasse_{year}.xml"}
    )
