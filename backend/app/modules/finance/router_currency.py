"""
Gestion des devises et taux de change.

Les taux sont saisis par l'entreprise (1 unité de devise étrangère =
rate_to_base unités de la devise de base de l'entreprise). Ils servent :
  - à convertir une facture émise en devise étrangère vers la devise de
    base à la création (les totaux stockés sont toujours en base),
  - à la consolidation de groupe (filiales en devises différentes).
"""
from datetime import date
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import TokenData
from app.modules.auth.router_auth import get_current_user, require_permission
from app.modules.finance.models_accounting import ExchangeRate
from app.modules.system.utils_audit import log_audit

router = APIRouter(prefix="/currencies", tags=["currencies"])


class ExchangeRateRequest(BaseModel):
    currency_code: str = Field(..., min_length=3, max_length=3)
    rate_to_base: Decimal = Field(..., gt=0)
    rate_date: Optional[date] = None


class ExchangeRateResponse(BaseModel):
    id: str
    currency_code: str
    rate_to_base: Decimal
    rate_date: date


def get_latest_rate(db: Session, company_id, currency_code: str, as_of: Optional[date] = None) -> Optional[Decimal]:
    """Dernier taux connu pour une devise (à une date donnée ou aujourd'hui).
    Retourne None si aucun taux n'a été saisi — l'appelant décide alors de
    refuser l'opération plutôt que d'inventer un taux."""
    query = db.query(ExchangeRate).filter(
        ExchangeRate.company_id == company_id,
        ExchangeRate.currency_code == currency_code.upper()
    )
    if as_of:
        query = query.filter(ExchangeRate.rate_date <= as_of)
    row = query.order_by(ExchangeRate.rate_date.desc()).first()
    return row.rate_to_base if row else None


@router.get("/rates", response_model=List[ExchangeRateResponse])
async def list_exchange_rates(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Dernier taux connu par devise pour l'entreprise courante."""
    rows = db.query(ExchangeRate).filter(
        ExchangeRate.company_id == current_user.company_id
    ).order_by(ExchangeRate.currency_code, ExchangeRate.rate_date.desc()).all()

    latest: dict[str, ExchangeRate] = {}
    for r in rows:
        if r.currency_code not in latest:
            latest[r.currency_code] = r

    return [
        ExchangeRateResponse(
            id=str(r.id), currency_code=r.currency_code,
            rate_to_base=r.rate_to_base, rate_date=r.rate_date
        )
        for r in latest.values()
    ]


@router.post("/rates", response_model=ExchangeRateResponse, status_code=status.HTTP_201_CREATED)
async def set_exchange_rate(
    request: ExchangeRateRequest,
    current_user: TokenData = Depends(require_permission("update")),
    db: Session = Depends(get_db)
):
    """Enregistre un taux de change daté (l'historique est conservé —
    chaque saisie crée une nouvelle ligne, le dernier taux en date fait foi)."""
    rate = ExchangeRate(
        company_id=current_user.company_id,
        currency_code=request.currency_code.upper(),
        rate_to_base=request.rate_to_base,
        rate_date=request.rate_date or date.today()
    )
    db.add(rate)
    db.flush()
    log_audit(db, current_user, 'CREATE', 'EXCHANGE_RATE', str(rate.id),
              {'currency': rate.currency_code, 'rate': str(rate.rate_to_base)})
    db.commit()
    db.refresh(rate)
    return ExchangeRateResponse(
        id=str(rate.id), currency_code=rate.currency_code,
        rate_to_base=rate.rate_to_base, rate_date=rate.rate_date
    )
