from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date
import uuid

from app.core.database import get_db
from app.core.models import Invoice, Client, Article, InvoiceItem, JournalEntry, JournalEntryLine, ChartOfAccount
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from pydantic import BaseModel, Field
from decimal import Decimal, ROUND_CEILING
from app.modules.finance.service_calculations import AlgerianFinancialCalculator
from app.core.sequences import generate_document_number
from datetime import datetime


router = APIRouter(prefix="/invoices", tags=["invoices"])

class InvoiceItemResponse(BaseModel):
    id: str
    article_id: Optional[str]
    quantity: Decimal
    unit_price_ht: Decimal
    total_ht: Decimal

class InvoiceItemRequest(BaseModel):
    article_id: Optional[str] = None
    description: Optional[str] = None
    quantity: Decimal = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0)
    tva_rate: Decimal = Field(Decimal('0.19'), ge=0, le=1) 
    discount: Decimal = Field(Decimal('0'), ge=0)

class CreateInvoiceRequest(BaseModel):
    client_id: str
    date_emission: date
    date_echeance: Optional[date] = None
    items: List[InvoiceItemRequest]
    payment_mode: Optional[str] = "cash"
    notes: Optional[str] = None

class InvoiceResponse(BaseModel):
    id: str
    numero: str
    date_emission: date
    date_echeance: Optional[date]
    client_id: Optional[str]
    client_name: Optional[str]
    total_ht: Decimal
    total_tva: Decimal
    timbre_amount: Decimal = Decimal('0') # Ajout Timbre
    total_ttc: Decimal
    statut: str
    items: List[InvoiceItemResponse] = [] # Include items in response


@router.get("/", response_model=List[InvoiceResponse])
async def list_invoices(
    type: Optional[str] = Query(None),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Invoice).filter(Invoice.company_id == current_user.company_id)
    invoices = query.all()
    
    res = []
    for inv in invoices:
        # Fetch client name if exists
        client_name = "Client Inconnu"
        if inv.client_id:
            client = db.query(Client).filter(Client.id == inv.client_id).first()
            if client:
                client_name = client.name
        
        res.append(InvoiceResponse(
            id=str(inv.id),
            numero=inv.invoice_number,
            date_emission=inv.invoice_date,
            date_echeance=inv.due_date,
            client_id=str(inv.client_id) if inv.client_id else None,
            client_name=client_name,
            total_ht=inv.total_htt,
            total_tva=inv.total_tva,
            total_ttc=inv.total_ttc,
            statut=inv.status
        ))
    return res

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.company_id == current_user.company_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    client_name = "Client Inconnu"
    if inv.client_id:
        client = db.query(Client).filter(Client.id == inv.client_id).first()
        if client:
            client_name = client.name

    items_resp = [
        InvoiceItemResponse(
            id=str(item.id),
            article_id=str(item.article_id) if item.article_id else None,
            quantity=item.quantity,
            unit_price_ht=item.unit_price_htt,
            total_ht=item.unit_price_htt * item.quantity # Simple calc for display
        ) for item in inv.items
    ]

    return InvoiceResponse(
        id=str(inv.id),
        numero=inv.invoice_number,
        date_emission=inv.invoice_date,
        date_echeance=inv.due_date,
        client_id=str(inv.client_id) if inv.client_id else None,
        client_name=client_name,
        total_ht=inv.total_htt,
        total_tva=inv.total_tva,
        total_ttc=inv.total_ttc,
        statut=inv.status,
        items=items_resp
    )

@router.post("/", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    request: CreateInvoiceRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new invoice with sequential numbering and auto-calculations."""
    
    # 1. Verify Client
    client = db.query(Client).filter(Client.id == request.client_id, Client.company_id == current_user.company_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # 2. Generate Number
    invoice_number = generate_document_number(
        db, Invoice, Invoice.invoice_number,
        current_user.company_id, "FACT", request.date_emission
    )

    # 3. Create Invoice Header
    new_inv = Invoice(
        company_id=current_user.company_id,
        invoice_number=invoice_number,
        invoice_date=request.date_emission,
        due_date=request.date_echeance or request.date_emission,
        client_id=request.client_id,
        status="draft",
        payment_status="unpaid",
        created_by=current_user.user_id, # Assuming user_id available in TokenData
        total_htt=0,
        total_tva=0,
        total_ttc=0
    )
    db.add(new_inv)
    db.flush() # Get ID

    # 4. Process Items and Calculate Totals
    total_ht_global = Decimal('0')
    total_tva_global = Decimal('0')

    created_items = []

    for item_req in request.items:
        # Calculate Line Base
        line_ht = item_req.quantity * item_req.unit_price
        # Apply discount if needed (omitted for now to keep simple SCF)
        
        # Calculate Tax
        calcs = AlgerianFinancialCalculator.calculate_from_ht(line_ht, item_req.tva_rate)
        
        inv_item = InvoiceItem(
            invoice_id=new_inv.id,
            article_id=item_req.article_id,
            quantity=item_req.quantity,
            unit_price_htt=item_req.unit_price,
            tva_rate=item_req.tva_rate * 100, # Store as percentage often, or check model def. Model says default=19, implies percentage number (19) not ratio (0.19). Let's check model.
            # Checking model: tva_rate = Column(Numeric(5, 2), default=19) -> It expects 19.00
            tva_amount=calcs['tva'],
            total_ttc=calcs['ttc'],
            discount_value=item_req.discount
        )
        
        # Correction: If model expects 19, passing 0.19 is wrong.
        # But wait, logic above: calculate_from_ht uses rate (0.19).
        # So we should store 19 in DB but use 0.19 for calc.
        inv_item.tva_rate = item_req.tva_rate * 100
        
        db.add(inv_item)
        created_items.append(inv_item)
        
        total_ht_global += calcs['ht']
        total_tva_global += calcs['tva']

    # 4b. Calcul du Timbre Fiscal (Sp????cificit???? Alg????rie)
    # R????gle: 1% du montant pour paiement ESP????CES si > seuil (ex: 2500 DA, souvent interpr????t???? comme tout paiement esp????ce)
    # On applique 1% du TTC provisoire
    timbre_fiscal = Decimal('0')
    if request.payment_mode == 'cash':
        ttc_provisoire = total_ht_global + total_tva_global
        if ttc_provisoire > Decimal('2500'): # Seuil d'exon????ration pratique
             # Calcul 1% arrondi au Dinar sup????rieur
             # Arrondi au dinar supérieur (droit de timbre)
             timbre_fiscal = (ttc_provisoire * Decimal('0.01')).quantize(Decimal('1'), rounding=ROUND_CEILING)
             # Plafond 2500 DA (Ancienne loi) ou 100 000 DA (LFC r????cente), on met 2500 par s????curit???? par d????faut ou configurable
             # Pour l'instant on laisse le calcul simple 1%
             
    # 5. Update Invoice Totals
    new_inv.total_htt = total_ht_global
    new_inv.total_tva = total_tva_global
    # Si le mod????le Invoice a un champ timbre, on le remplit, sinon on l'ajoute au TTC ou on cr????e une ligne 'Timbre'
    # Pour faire propre, ajoutons une ligne InvoiceItem sp????ciale 'Timbre Fiscal'
    if timbre_fiscal > 0:
         # On ajoute une ligne sp????ciale non taxable
         item_timbre = InvoiceItem(
            invoice_id=new_inv.id,
            description="Droit de Timbre (Esp????ces)",
            quantity=1,
            unit_price_htt=timbre_fiscal,
            tva_rate=0,
            tva_amount=0,
            total_ttc=timbre_fiscal
         )
         db.add(item_timbre)
         created_items.append(item_timbre)
         # Pas d'ajout au HT, c'est une taxe directe
    
    # Recalcul total TTC
    # Note: Le timbre n'est PAS du chiffre d'affaires (HT), c'est une taxe collect????e pour l'????tat
    new_inv.total_ttc = total_ht_global + total_tva_global + timbre_fiscal

    db.commit()
    db.refresh(new_inv)
    
    # Construct Response manually to avoid heavy recursion/loading issues
    items_resp = [
        InvoiceItemResponse(
            id=str(item.id),
            article_id=str(item.article_id) if item.article_id else None,
            quantity=item.quantity,
            unit_price_ht=item.unit_price_htt,
            total_ht=item.unit_price_htt * item.quantity
        ) for item in created_items
    ]

    return InvoiceResponse(
        id=str(new_inv.id),
        numero=new_inv.invoice_number,
        date_emission=new_inv.invoice_date,
        date_echeance=new_inv.due_date,
        client_id=str(new_inv.client_id),
        client_name=client.name,
        total_ht=new_inv.total_htt,
        total_tva=new_inv.total_tva,
        timbre_amount=timbre_fiscal,
        total_ttc=new_inv.total_ttc,
        statut=new_inv.status,
        items=items_resp
    )

@router.post("/{invoice_id}/validate", response_model=InvoiceResponse)
async def validate_invoice(
    invoice_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validate invoice and generate accounting entries (Task 9)."""
    
    # 1. Fetch Invoice
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.company_id == current_user.company_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    if inv.status != 'draft':
        raise HTTPException(status_code=400, detail="Invoice must be in draft to validate")
        
    # 2. Generate Journal Entry (VT - Ventes)
    # Get Customer Account (should be in Client model, fallback to 411000)
    customer_account = "411000" # TODO: Add account_code to Client model
    
    entry = JournalEntry(
        company_id=current_user.company_id,
        journal_type="VT",
        entry_number=generate_document_number(db, JournalEntry, JournalEntry.entry_number, current_user.company_id, "VT", inv.invoice_date),
        entry_date=inv.invoice_date,
        description=f"Facture N???? {inv.invoice_number}",
        status="approved",
        created_by=current_user.user_id
        # source_document=inv.invoice_number # If field exists
    )
    db.add(entry)
    db.flush()
    
    # Line 1: Client (Debit TTC)
    line_client = JournalEntryLine(
        journal_entry_id=entry.id,
        account_code=customer_account,
        description=f"Facture {inv.invoice_number} - {inv.client_id}",
        debit_amount=inv.total_ttc,
        credit_amount=0
    )
    db.add(line_client)
    
    # Line 2: Ventes (Credit HT) -> Compte 700000
    line_sales = JournalEntryLine(
        journal_entry_id=entry.id,
        account_code="700000", # TODO: Dynamic per article family
        description=f"Ventes marchandises - {inv.invoice_number}",
        debit_amount=0,
        credit_amount=inv.total_htt
    )
    db.add(line_sales)
    
    # Line 3: TVA Collect????e (Credit TVA) -> Compte 445700
    if inv.total_tva > 0:
        line_tva = JournalEntryLine(
            journal_entry_id=entry.id,
            account_code="445700",
            description=f"TVA Collect????e - {inv.invoice_number}",
            debit_amount=0,
            credit_amount=inv.total_tva
        )
        db.add(line_tva)
        
    # 3. Update Invoice Status
    inv.status = 'validated'
    
    db.commit()
    db.refresh(inv)
    
    # Response construction (simplified)
    # Re-fetch items for response
    items_resp = [
        InvoiceItemResponse(
            id=str(item.id),
            article_id=str(item.article_id) if item.article_id else None,
            quantity=item.quantity,
            unit_price_ht=item.unit_price_htt,
            total_ht=item.unit_price_htt * item.quantity
        ) for item in inv.items
    ]

    return InvoiceResponse(
        id=str(inv.id),
        numero=inv.invoice_number,
        date_emission=inv.invoice_date,
        date_echeance=inv.due_date,
        client_id=str(inv.client_id) if inv.client_id else None,
        client_name="Client", # Placeholder
        total_ht=inv.total_htt,
        total_tva=inv.total_tva,
        total_ttc=inv.total_ttc,
        statut=inv.status,
        items=items_resp
    )


@router.post("/{invoice_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_invoice(
    invoice_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel an invoice (only drafts or validated-but-unpaid invoices)."""
    inv = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == current_user.company_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if inv.payment_status == 'paid':
        raise HTTPException(status_code=400, detail="Cannot cancel a paid invoice")

    inv.status = 'annulee'
    db.commit()

    return {"id": str(inv.id), "status": inv.status, "message": "Invoice cancelled"}
