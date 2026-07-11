from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional
from datetime import date, timedelta
from decimal import Decimal
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.models import Quote, QuoteItem, Client, Invoice, InvoiceItem
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from app.core.sequences import generate_document_number
from app.modules.system.utils_audit import log_audit
from app.modules.finance.service_calculations import AlgerianFinancialCalculator

router = APIRouter(prefix="/quotes", tags=["quotes"])

VALID_TRANSITIONS = {
    "draft": {"sent"},
    "sent": {"accepted", "refused", "expired"},
    "accepted": set(),
    "refused": set(),
    "expired": set(),
}


class QuoteItemRequest(BaseModel):
    article_id: Optional[str] = None
    description: Optional[str] = None
    quantity: Decimal = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0)
    tva_rate: Decimal = Field(Decimal("0.19"), ge=0, le=1)


class QuoteItemResponse(BaseModel):
    id: str
    article_id: Optional[str]
    designation: str
    qty: Decimal
    unitPrice: Decimal
    tva: Decimal


class CreateQuoteRequest(BaseModel):
    client_id: str
    date_creation: date
    date_expiration: Optional[date] = None
    items: List[QuoteItemRequest]
    notes: Optional[str] = None


class QuoteResponse(BaseModel):
    id: str
    numero: str
    client: str
    clientEmail: Optional[str] = None
    dateCreation: date
    dateExpiration: Optional[date] = None
    status: str
    montantHT: Decimal
    montantTVA: Decimal
    montantTTC: Decimal
    items: List[QuoteItemResponse] = []
    notes: Optional[str] = None
    commercial: Optional[str] = None


def _serialize(q: Quote) -> QuoteResponse:
    client = q.client
    return QuoteResponse(
        id=str(q.id),
        numero=q.quote_number,
        client=client.name if client else "Client inconnu",
        clientEmail=client.email if client else None,
        dateCreation=q.quote_date,
        dateExpiration=q.expiry_date,
        status=q.status,
        montantHT=q.total_htt,
        montantTVA=q.total_tva,
        montantTTC=q.total_ttc,
        notes=q.notes,
        commercial=str(q.commercial_id) if q.commercial_id else None,
        items=[
            QuoteItemResponse(
                id=str(item.id),
                article_id=str(item.article_id) if item.article_id else None,
                designation=item.description or "",
                qty=item.quantity,
                unitPrice=item.unit_price_htt,
                tva=item.tva_rate,
            )
            for item in q.items
        ],
    )


@router.get("/", response_model=List[QuoteResponse])
async def list_quotes(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # joinedload/selectinload : _serialize lisait q.client et q.items en lazy
    # loading, soit 2 requêtes par devis (N+1).
    query = db.query(Quote).options(
        joinedload(Quote.client),
        selectinload(Quote.items)
    ).filter(Quote.company_id == current_user.company_id)
    if status_filter:
        query = query.filter(Quote.status == status_filter)
    quotes = query.order_by(Quote.created_at.desc()).offset(skip).limit(limit).all()
    return [_serialize(q) for q in quotes]


@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(
    quote_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote = db.query(Quote).filter(Quote.id == quote_id, Quote.company_id == current_user.company_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return _serialize(quote)


@router.post("/", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_quote(
    request: CreateQuoteRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    client = db.query(Client).filter(
        Client.id == request.client_id, Client.company_id == current_user.company_id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    quote_number = generate_document_number(
        db, Quote, Quote.quote_number, current_user.company_id, "DEV", request.date_creation
    )

    new_quote = Quote(
        company_id=current_user.company_id,
        quote_number=quote_number,
        client_id=request.client_id,
        quote_date=request.date_creation,
        expiry_date=request.date_expiration or (request.date_creation + timedelta(days=30)),
        status="draft",
        commercial_id=current_user.user_id,
        created_by=current_user.user_id,
        notes=request.notes,
        total_htt=0,
        total_tva=0,
        total_ttc=0,
    )
    db.add(new_quote)
    db.flush()

    total_ht = Decimal("0")
    total_tva = Decimal("0")

    for item_req in request.items:
        line_ht = item_req.quantity * item_req.unit_price
        calcs = AlgerianFinancialCalculator.calculate_from_ht(line_ht, item_req.tva_rate)

        db.add(QuoteItem(
            quote_id=new_quote.id,
            article_id=item_req.article_id,
            description=item_req.description,
            quantity=item_req.quantity,
            unit_price_htt=item_req.unit_price,
            tva_rate=item_req.tva_rate * 100,
            tva_amount=calcs["tva"],
            total_ttc=calcs["ttc"],
        ))

        total_ht += calcs["ht"]
        total_tva += calcs["tva"]

    new_quote.total_htt = total_ht
    new_quote.total_tva = total_tva
    new_quote.total_ttc = total_ht + total_tva

    log_audit(db, current_user, 'CREATE', 'QUOTE', str(new_quote.id), {'quote_number': quote_number})
    db.commit()
    db.refresh(new_quote)
    return _serialize(new_quote)


class UpdateQuoteStatusRequest(BaseModel):
    status: str


@router.post("/{quote_id}/status", response_model=QuoteResponse)
async def update_quote_status(
    quote_id: str,
    request: UpdateQuoteStatusRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote = db.query(Quote).filter(Quote.id == quote_id, Quote.company_id == current_user.company_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    allowed = VALID_TRANSITIONS.get(quote.status, set())
    if request.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition quote from '{quote.status}' to '{request.status}'",
        )

    quote.status = request.status
    log_audit(db, current_user, 'UPDATE', 'QUOTE', str(quote.id), {'status': request.status})
    db.commit()
    db.refresh(quote)
    return _serialize(quote)


@router.post("/{quote_id}/convert", response_model=dict)
async def convert_quote_to_invoice(
    quote_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote = db.query(Quote).filter(Quote.id == quote_id, Quote.company_id == current_user.company_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted quotes can be converted to invoices")
    if quote.converted_invoice_id:
        raise HTTPException(status_code=400, detail="Quote already converted")

    invoice_number = generate_document_number(
        db, Invoice, Invoice.invoice_number, current_user.company_id, "FACT", date.today()
    )

    new_invoice = Invoice(
        company_id=current_user.company_id,
        invoice_number=invoice_number,
        invoice_date=date.today(),
        due_date=date.today() + timedelta(days=30),
        client_id=quote.client_id,
        status="draft",
        payment_status="unpaid",
        created_by=current_user.user_id,
        total_htt=quote.total_htt,
        total_tva=quote.total_tva,
        total_ttc=quote.total_ttc,
    )
    db.add(new_invoice)
    db.flush()

    for item in quote.items:
        db.add(InvoiceItem(
            invoice_id=new_invoice.id,
            article_id=item.article_id,
            quantity=item.quantity,
            unit_price_htt=item.unit_price_htt,
            tva_rate=item.tva_rate,
            tva_amount=item.tva_amount,
            total_ttc=item.total_ttc,
        ))

    quote.converted_invoice_id = new_invoice.id
    log_audit(db, current_user, 'CONVERT', 'QUOTE', str(quote.id), {'invoice_number': invoice_number})
    db.commit()
    db.refresh(new_invoice)

    return {"quote_id": str(quote.id), "invoice_id": str(new_invoice.id), "invoice_number": new_invoice.invoice_number}


@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quote(
    quote_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    quote = db.query(Quote).filter(Quote.id == quote_id, Quote.company_id == current_user.company_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    if quote.status != "draft":
        raise HTTPException(status_code=400, detail="Only draft quotes can be deleted")
    log_audit(db, current_user, 'DELETE', 'QUOTE', str(quote.id), {'quote_number': quote.quote_number})
    db.delete(quote)
    db.commit()
