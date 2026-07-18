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
from app.modules.system.utils_audit import log_audit
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
    # Vente : client_id requis. Achat (facture fournisseur) : supplier_id requis.
    type: str = Field(default="sale", pattern="^(sale|purchase)$")
    client_id: Optional[str] = None
    supplier_id: Optional[str] = None
    date_emission: date
    date_echeance: Optional[date] = None
    items: List[InvoiceItemRequest]
    payment_mode: Optional[str] = "cash"
    notes: Optional[str] = None
    # Devise de facturation (défaut : devise de base de l'entreprise).
    # Si différente, un taux de change saisi (POST /currencies/rates) doit
    # exister — les totaux sont convertis et stockés en devise de base.
    currency_code: Optional[str] = Field(default=None, min_length=3, max_length=3)

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
    currency_code: str = "DZD"
    exchange_rate: Decimal = Decimal('1')
    items: List[InvoiceItemResponse] = [] # Include items in response


@router.get("/", response_model=List[InvoiceResponse])
async def list_invoices(
    type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Invoice).filter(Invoice.company_id == current_user.company_id)
    # Le paramètre `type` était déclaré mais jamais appliqué : le frontend
    # demandait les factures de vente et recevait aussi les achats.
    if type:
        query = query.filter(Invoice.type == type)
    invoices = query.order_by(Invoice.invoice_date.desc()).offset(skip).limit(limit).all()

    # Résolution des noms clients en une seule requête (au lieu d'un SELECT
    # par facture — N+1).
    client_ids = {inv.client_id for inv in invoices if inv.client_id}
    clients_by_id = {}
    if client_ids:
        clients_by_id = {
            c.id: c.name
            for c in db.query(Client.id, Client.name).filter(Client.id.in_(client_ids)).all()
        }

    res = []
    for inv in invoices:
        client_name = clients_by_id.get(inv.client_id, "Client Inconnu")

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
    """Create a new invoice with sequential numbering and auto-calculations.
    type='sale' (client requis) ou type='purchase' (facture fournisseur,
    supplier requis)."""

    # 1. Verify counterparty according to invoice type
    client = None
    supplier = None
    if request.type == 'purchase':
        if not request.supplier_id:
            raise HTTPException(status_code=400, detail="supplier_id est requis pour une facture d'achat")
        from app.core.models import Supplier
        supplier = db.query(Supplier).filter(
            Supplier.id == request.supplier_id, Supplier.company_id == current_user.company_id
        ).first()
        if not supplier:
            raise HTTPException(status_code=404, detail="Supplier not found")
    else:
        if not request.client_id:
            raise HTTPException(status_code=400, detail="client_id est requis pour une facture de vente")
        client = db.query(Client).filter(Client.id == request.client_id, Client.company_id == current_user.company_id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")

    # 1b. Résolution devise : si la facture est émise dans une devise
    # différente de la devise de base de l'entreprise, un taux saisi
    # (POST /currencies/rates) est REQUIS — on refuse plutôt que
    # d'inventer un taux. Lignes et totaux sont convertis en devise de
    # base à la création pour que toutes les agrégations restent homogènes.
    from app.core.models import Company
    _company = db.query(Company).filter(Company.id == current_user.company_id).first()
    base_currency = (_company.currency_code if _company else None) or "DZD"
    invoice_currency = (request.currency_code or base_currency).upper()
    fx_rate = Decimal('1')
    if invoice_currency != base_currency:
        from app.modules.finance.router_currency import get_latest_rate
        rate = get_latest_rate(db, current_user.company_id, invoice_currency, request.date_emission)
        if rate is None:
            raise HTTPException(
                status_code=400,
                detail=f"Aucun taux de change {invoice_currency}->{base_currency} n'est enregistré. "
                       f"Saisissez-le d'abord via POST /currencies/rates."
            )
        fx_rate = Decimal(rate)

    # 2. Generate Number — préfixe distinct pour les factures d'achat
    invoice_number = generate_document_number(
        db, Invoice, Invoice.invoice_number,
        current_user.company_id, "FA" if request.type == 'purchase' else "FACT", request.date_emission
    )

    # 3. Create Invoice Header
    new_inv = Invoice(
        company_id=current_user.company_id,
        invoice_number=invoice_number,
        invoice_date=request.date_emission,
        due_date=request.date_echeance or request.date_emission,
        client_id=request.client_id if request.type == 'sale' else None,
        supplier_id=request.supplier_id if request.type == 'purchase' else None,
        type=request.type,
        status="draft",
        payment_status="unpaid",
        created_by=current_user.user_id, # Assuming user_id available in TokenData
        total_htt=0,
        total_tva=0,
        total_ttc=0,
        currency_code=invoice_currency,
        exchange_rate=fx_rate
    )
    db.add(new_inv)
    db.flush() # Get ID

    # 4. Process Items and Calculate Totals
    total_ht_global = Decimal('0')
    total_tva_global = Decimal('0')

    created_items = []

    for item_req in request.items:
        # Calculate Line Base — prix unitaire converti en devise de base.
        unit_price_base = (item_req.unit_price * fx_rate).quantize(Decimal('0.01'))
        line_ht = item_req.quantity * unit_price_base
        # Apply discount if needed (omitted for now to keep simple SCF)

        # Calculate Tax
        calcs = AlgerianFinancialCalculator.calculate_from_ht(line_ht, item_req.tva_rate)
        
        inv_item = InvoiceItem(
            invoice_id=new_inv.id,
            article_id=item_req.article_id,
            description=item_req.description,
            quantity=item_req.quantity,
            unit_price_htt=unit_price_base,
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

    # 4b. Droit de timbre selon le PROFIL FISCAL du pays de l'entreprise
    # (DZ: 1% especes >2500 DA arrondi au dinar superieur; TN: montant fixe;
    # FR/autres: aucun). Uniquement sur les factures de VENTE : sur une
    # facture d'achat le timbre est celui du fournisseur, déjà inclus
    # dans son TTC.
    from app.core.tax_profiles import get_tax_profile, compute_stamp_duty
    timbre_fiscal = Decimal('0')
    if request.type == 'sale':
        _profile = get_tax_profile(_company.country if _company else None)
        timbre_fiscal = compute_stamp_duty(_profile, total_ht_global + total_tva_global, request.payment_mode or '')

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

    log_audit(db, current_user, 'CREATE', 'INVOICE', str(new_inv.id), {'invoice_number': invoice_number})
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
        client_id=str(new_inv.client_id) if new_inv.client_id else None,
        client_name=client.name if client else (supplier.name if supplier else None),
        total_ht=new_inv.total_htt,
        total_tva=new_inv.total_tva,
        timbre_amount=timbre_fiscal,
        total_ttc=new_inv.total_ttc,
        statut=new_inv.status,
        currency_code=new_inv.currency_code or "DZD",
        exchange_rate=new_inv.exchange_rate or Decimal('1'),
        items=items_resp
    )

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    request: CreateInvoiceRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Met à jour une facture BROUILLON (les factures validées sont figées —
    toute correction passe par un avoir, pas une réécriture). Les totaux
    sont toujours recalculés côté serveur à partir des lignes soumises,
    jamais acceptés tels quels depuis le client.
    """
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.company_id == current_user.company_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if inv.status != 'draft':
        raise HTTPException(status_code=400, detail="Seules les factures en brouillon peuvent être modifiées")

    client = db.query(Client).filter(Client.id == request.client_id, Client.company_id == current_user.company_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    inv.client_id = request.client_id
    inv.invoice_date = request.date_emission
    inv.due_date = request.date_echeance or request.date_emission

    # Remplacement complet des lignes (plus simple et plus sûr qu'un diff
    # ligne à ligne pour un brouillon pas encore comptabilisé).
    db.query(InvoiceItem).filter(InvoiceItem.invoice_id == inv.id).delete()
    db.flush()

    total_ht_global = Decimal('0')
    total_tva_global = Decimal('0')
    updated_items = []

    for item_req in request.items:
        line_ht = item_req.quantity * item_req.unit_price
        calcs = AlgerianFinancialCalculator.calculate_from_ht(line_ht, item_req.tva_rate)
        inv_item = InvoiceItem(
            invoice_id=inv.id,
            article_id=item_req.article_id,
            description=item_req.description,
            quantity=item_req.quantity,
            unit_price_htt=item_req.unit_price,
            tva_rate=item_req.tva_rate * 100,
            tva_amount=calcs['tva'],
            total_ttc=calcs['ttc'],
            discount_value=item_req.discount
        )
        db.add(inv_item)
        updated_items.append(inv_item)
        total_ht_global += calcs['ht']
        total_tva_global += calcs['tva']

    # Timbre selon le profil fiscal du pays (même règle que la création).
    from app.core.tax_profiles import get_tax_profile, compute_stamp_duty
    from app.core.models import Company
    _company = db.query(Company).filter(Company.id == current_user.company_id).first()
    _profile = get_tax_profile(_company.country if _company else None)
    timbre_fiscal = compute_stamp_duty(_profile, total_ht_global + total_tva_global, request.payment_mode or '')

    inv.total_htt = total_ht_global
    inv.total_tva = total_tva_global
    if timbre_fiscal > 0:
        item_timbre = InvoiceItem(
            invoice_id=inv.id,
            description="Droit de Timbre (Espèces)",
            quantity=1,
            unit_price_htt=timbre_fiscal,
            tva_rate=0,
            tva_amount=0,
            total_ttc=timbre_fiscal
        )
        db.add(item_timbre)
        updated_items.append(item_timbre)
    inv.total_ttc = total_ht_global + total_tva_global + timbre_fiscal

    log_audit(db, current_user, 'UPDATE', 'INVOICE', str(inv.id), {'invoice_number': inv.invoice_number})
    db.commit()
    db.refresh(inv)

    items_resp = [
        InvoiceItemResponse(
            id=str(item.id),
            article_id=str(item.article_id) if item.article_id else None,
            quantity=item.quantity,
            unit_price_ht=item.unit_price_htt,
            total_ht=item.unit_price_htt * item.quantity
        ) for item in updated_items
    ]

    return InvoiceResponse(
        id=str(inv.id),
        numero=inv.invoice_number,
        date_emission=inv.invoice_date,
        date_echeance=inv.due_date,
        client_id=str(inv.client_id),
        client_name=client.name,
        total_ht=inv.total_htt,
        total_tva=inv.total_tva,
        timbre_amount=timbre_fiscal,
        total_ttc=inv.total_ttc,
        statut=inv.status,
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
        
    is_purchase = inv.type == 'purchase'

    # 2. Generate Journal Entry - VT (ventes) ou AC (achats).
    # Vente : 411 Clients D TTC / 701 Ventes C HT + 4457 TVA C + 447 timbre C.
    # Achat : 601 Achats D HT + 4456 TVA deductible D / 401 Fournisseurs C TTC
    # - c'est cette ecriture qui rend la TVA deductible REELLE dans la G50.
    journal_code = "AC" if is_purchase else "VT"
    entry = JournalEntry(
        company_id=current_user.company_id,
        journal_type=journal_code,
        entry_number=generate_document_number(db, JournalEntry, JournalEntry.entry_number, current_user.company_id, journal_code, inv.invoice_date),
        entry_date=inv.invoice_date,
        description=f"Facture {inv.invoice_number}",
        status="approved",
        created_by=current_user.user_id
    )
    db.add(entry)
    db.flush()

    if is_purchase:
        # Debit 601000 Achats (HT)
        db.add(JournalEntryLine(
            journal_entry_id=entry.id, account_code="601000",
            description=f"Achats marchandises - {inv.invoice_number}",
            debit_amount=inv.total_htt, credit_amount=0
        ))
        # Debit 445600 TVA deductible
        if inv.total_tva > 0:
            db.add(JournalEntryLine(
                journal_entry_id=entry.id, account_code="445600",
                description=f"TVA deductible - {inv.invoice_number}",
                debit_amount=inv.total_tva, credit_amount=0
            ))
        # Credit 401000 Fournisseurs (TTC)
        db.add(JournalEntryLine(
            journal_entry_id=entry.id, account_code="401000",
            description=f"Facture fournisseur {inv.invoice_number}",
            debit_amount=0, credit_amount=inv.total_ttc
        ))
        entry.total_debit = inv.total_ttc
        entry.total_credit = inv.total_ttc

        # Reception marchandises : le stock des articles achetes AUGMENTE.
        for item in inv.items:
            if item.article_id:
                article = db.query(Article).filter(
                    Article.id == item.article_id,
                    Article.company_id == current_user.company_id
                ).first()
                if article is not None:
                    article.stock_quantity = (article.stock_quantity or 0) + (item.quantity or 0)

        inv.status = 'validated'
        log_audit(db, current_user, 'VALIDATE', 'INVOICE', str(inv.id), {'invoice_number': inv.invoice_number, 'type': 'purchase'})
        db.commit()
        db.refresh(inv)

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
            id=str(inv.id), numero=inv.invoice_number,
            date_emission=inv.invoice_date, date_echeance=inv.due_date,
            client_id=None, client_name=None,
            total_ht=inv.total_htt, total_tva=inv.total_tva,
            total_ttc=inv.total_ttc, statut=inv.status,
            currency_code=inv.currency_code or "DZD",
            exchange_rate=inv.exchange_rate or Decimal('1'),
            items=items_resp
        )

    # ----- Vente (VT) -----
    customer_account = "411000"

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
        account_code="701000",  # ventes de marchandises (present dans le plan provisionne)
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
        
    # Line 4: Droit de timbre collecte pour l'Etat (Credit) -> Compte 447000.
    # Sans cette contrepartie, l'ecriture etait desequilibree du montant du
    # timbre (debit client TTC != credits ventes + TVA).
    timbre_part = (inv.total_ttc or Decimal('0')) - (inv.total_htt or Decimal('0')) - (inv.total_tva or Decimal('0'))
    if timbre_part > 0:
        line_timbre = JournalEntryLine(
            journal_entry_id=entry.id,
            account_code="447000",
            description=f"Droit de timbre - {inv.invoice_number}",
            debit_amount=0,
            credit_amount=timbre_part
        )
        db.add(line_timbre)

    # Totaux de l'ecriture (equilibre debit = credit = TTC), sinon les
    # listes du journal affichent 0.00.
    entry.total_debit = inv.total_ttc
    entry.total_credit = inv.total_ttc

    # 2b. Mouvement de stock : la validation d'une facture de VENTE
    # décrémente le stock des articles facturés (le module inventaire
    # n'était pas relié au cycle de facturation — le stock ne bougeait
    # jamais). Les lignes libres (sans article_id, ex. timbre) sont
    # ignorées. Le stock peut passer négatif volontairement : un blocage
    # dur empêcherait de facturer une vente déjà livrée ; l'alerte
    # stock-bas la signale.
    if inv.type == 'sale':
        for item in inv.items:
            if item.article_id:
                article = db.query(Article).filter(
                    Article.id == item.article_id,
                    Article.company_id == current_user.company_id
                ).first()
                if article is not None:
                    article.stock_quantity = (article.stock_quantity or 0) - (item.quantity or 0)

    # 3. Update Invoice Status
    inv.status = 'validated'

    log_audit(db, current_user, 'VALIDATE', 'INVOICE', str(inv.id), {'invoice_number': inv.invoice_number})
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

    # Restitution du stock : si la facture de vente avait été VALIDÉE, son
    # stock a été décrémenté à la validation — l'annulation le restitue
    # (symétrie exacte du mouvement, lignes avec article_id uniquement).
    if inv.status == 'validated' and inv.type == 'sale':
        for item in inv.items:
            if item.article_id:
                article = db.query(Article).filter(
                    Article.id == item.article_id,
                    Article.company_id == current_user.company_id
                ).first()
                if article is not None:
                    article.stock_quantity = (article.stock_quantity or 0) + (item.quantity or 0)

    inv.status = 'annulee'
    log_audit(db, current_user, 'CANCEL', 'INVOICE', str(inv.id), {'invoice_number': inv.invoice_number})
    db.commit()

    return {"id": str(inv.id), "status": inv.status, "message": "Invoice cancelled"}


@router.get("/{invoice_id}/ubl")
async def export_invoice_ubl(
    invoice_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export e-invoicing : facture au format UBL 2.1 (structure Peppol BIS
    Billing 3.0) — document XML normé et interopérable, socle des
    obligations de facturation électronique internationales.
    """
    from fastapi.responses import Response
    from app.core.models import Company
    from app.modules.operations.service_einvoicing import generate_ubl_invoice

    inv = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.company_id == current_user.company_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    client = db.query(Client).filter(Client.id == inv.client_id).first() if inv.client_id else None
    items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == inv.id).all()

    xml_bytes = generate_ubl_invoice(inv, items, company, client)
    safe_number = (inv.invoice_number or str(inv.id)).replace('/', '-')
    return Response(
        content=xml_bytes,
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename=ubl_{safe_number}.xml"}
    )
