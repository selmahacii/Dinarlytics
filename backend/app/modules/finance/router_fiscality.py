from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel
import uuid
from app.core.database import get_db
from app.core.permissions import get_current_user_from_token, require_permission
from app.modules.finance.service_calculations import AlgerianFinancialCalculator
from app.core.models import Invoice, JournalEntry, JournalEntryLine, FiscalDeclaration
from app.modules.finance.service_jibaya import JibayaService
from app.modules.system.utils_audit import log_audit
from fastapi.responses import Response

router = APIRouter(prefix="/fiscality", tags=["fiscality"])


class DeclarationResponse(BaseModel):
    id: str
    document_id: str
    country: str
    data: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class CreateDeclarationRequest(BaseModel):
    document_id: str
    country: str = "DZ"
    data: Optional[Dict[str, Any]] = None


class UpdateDeclarationStatusRequest(BaseModel):
    status: str


@router.get("/declarations", response_model=List[DeclarationResponse])
async def list_declarations(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """List fiscal declarations submitted for the current company."""
    declarations = db.query(FiscalDeclaration).filter(
        FiscalDeclaration.company_id == user["company_id"]
    ).order_by(FiscalDeclaration.created_at.desc()).all()
    return declarations


@router.post("/declarations", response_model=DeclarationResponse, status_code=status.HTTP_201_CREATED)
async def create_declaration(
    request: CreateDeclarationRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("comptabilite-write"))
):
    """Create (save as draft) a fiscal declaration."""
    declaration = FiscalDeclaration(
        company_id=user["company_id"],
        document_id=request.document_id,
        country=request.country,
        data=request.data,
        status="brouillon",
        created_by=user["user_id"]
    )
    db.add(declaration)
    db.flush()
    log_audit(db, user, 'CREATE', 'FISCAL_DECLARATION', str(declaration.id), {'document_id': request.document_id})
    db.commit()
    db.refresh(declaration)
    return declaration


@router.put("/declarations/{declaration_id}/status", response_model=DeclarationResponse)
async def update_declaration_status(
    declaration_id: str,
    request: UpdateDeclarationStatusRequest,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("comptabilite-write"))
):
    """Update a declaration's status (e.g. brouillon -> soumis)."""
    declaration = db.query(FiscalDeclaration).filter(
        FiscalDeclaration.id == declaration_id,
        FiscalDeclaration.company_id == user["company_id"]
    ).first()
    if not declaration:
        raise HTTPException(status_code=404, detail="Declaration not found")
    declaration.status = request.status
    log_audit(db, user, 'UPDATE', 'FISCAL_DECLARATION', str(declaration.id), {'status': request.status})
    db.commit()
    db.refresh(declaration)
    return declaration

def _require_declaration(db: Session, company_id, declaration: str) -> dict:
    """Vérifie que la déclaration demandée existe dans le profil fiscal du
    pays de l'entreprise — la G50/liasse Jibaya sont algériennes ; les
    servir à une entreprise française produirait des obligations fiscales
    inventées. Retourne le profil si applicable, 400 sinon."""
    from app.core.tax_profiles import get_tax_profile
    from app.core.models import Company
    company = db.query(Company).filter(Company.id == company_id).first()
    profile = get_tax_profile(company.country if company else None)
    if declaration not in profile.get("declarations", []):
        raise HTTPException(
            status_code=400,
            detail=f"La déclaration '{declaration}' ne s'applique pas au profil fiscal "
                   f"'{profile['code']}' ({profile['country_name']}) de cette entreprise."
        )
    return profile


@router.get("/profile")
async def get_fiscal_profile(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """Profil fiscal effectif de l'entreprise (pays, taux TVA, timbre,
    déclarations applicables) — consommé par le frontend pour n'afficher
    que les modules fiscaux pertinents pour le pays."""
    from app.core.tax_profiles import get_tax_profile
    from app.core.models import Company
    company = db.query(Company).filter(Company.id == user["company_id"]).first()
    profile = get_tax_profile(company.country if company else None)
    stamp = profile.get("stamp_duty")
    corporate = profile.get("corporate_tax") or {}
    turnover = profile.get("turnover_tax")
    return {
        "code": profile["code"],
        "country_name": profile["country_name"],
        "currency": profile["currency"],
        "vat_rates": [float(r) for r in profile["vat_rates"]],
        "default_vat_rate": float(profile["default_vat_rate"]),
        "has_stamp_duty": stamp is not None,
        "stamp_duty_applies_to": stamp.get("applies_to") if stamp else None,
        "turnover_tax": {"name": turnover["name"], "rate": float(turnover["rate"])} if turnover else None,
        "corporate_tax": {"name": corporate.get("name"), "default_rate": float(corporate.get("default_rate", 0))},
        "declarations": profile.get("declarations", []),
        "chart_template": profile.get("chart_template", "scf"),
    }


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
    _require_declaration(db, company_id, "g50")
    
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

    # Droit de timbre réellement collecté sur le mois : crédit du compte
    # 447xxx (État — autres impôts), alimenté par la validation des factures
    # en espèces (était codé en dur à 0).
    stamp_duty = db.query(func.sum(JournalEntryLine.credit_amount - JournalEntryLine.debit_amount))\
        .join(JournalEntry)\
        .filter(
            JournalEntry.company_id == company_id,
            JournalEntry.status == 'approved',
            extract('month', JournalEntry.entry_date) == month,
            extract('year', JournalEntry.entry_date) == year,
            JournalEntryLine.account_code.like('447%')
        ).scalar() or Decimal('0')

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
    _require_declaration(db, company_id, "liasse_jibaya")
    
    xml_content = JibayaService.generate_xml_liasse(db, company_id, year)
    
    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename=liasse_{year}.xml"}
    )
