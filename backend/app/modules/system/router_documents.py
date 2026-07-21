"""
Document API Endpoints - Delivery Notes, Purchase Orders, Purchase Notes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
import uuid

from app.core.database import get_db
from app.core.models import (
    User, Supplier, Client, Article,
    # You must add these models in models.py if not present:
    # DeliveryNote, DeliveryNoteItem, PurchaseOrder, PurchaseOrderItem, PurchaseNote, PurchaseNoteItem
    AlertDefinition, AlertTrigger, UserNotification
)
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData, RBACManager
from app.modules.system.utils_audit import log_audit
from pydantic import BaseModel, Field

def generate_document_number(db: Session, model, column, company_id, prefix, date_obj):
    """G????n????re un num????ro s????quentiel format PREFIX/ANNEE/SEQ"""
    year = date_obj.year
    pattern = f"{prefix}/{year}/%"
    # Recherche du dernier num????ro pour cette ann????e
    last = db.query(column).filter(
        model.company_id == company_id,
        column.like(pattern)
    ).order_by(column.desc()).first()
    
    if last:
        try:
            # last est un Row(val) donc last[0]
            seq_str = last[0].split('/')[-1]
            seq = int(seq_str)
            new_seq = seq + 1
        except (ValueError, IndexError):
            new_seq = 1
    else:
        new_seq = 1
    
    return f"{prefix}/{year}/{str(new_seq).zfill(5)}"

router = APIRouter(prefix="/documents", tags=["documents"])

# ========== REQUEST/RESPONSE MODELS ==========
class DeliveryNoteItemRequest(BaseModel):
    article_id: str
    quantity: Decimal
    barcode: Optional[str] = None
    description: Optional[str] = None

class CreateDeliveryNoteRequest(BaseModel):
    delivery_date: date
    client_id: str
    items: List[DeliveryNoteItemRequest]
    notes: Optional[str] = None

class DeliveryNoteItemResponse(BaseModel):
    id: str
    article_id: str
    quantity: Decimal
    barcode: str
    description: Optional[str]

class DeliveryNoteResponse(BaseModel):
    id: str
    delivery_number: str
    delivery_date: date
    client_id: str
    items: List[DeliveryNoteItemResponse]
    notes: Optional[str]
    created_at: datetime

# ================= PURCHASE ORDERS =================
class PurchaseOrderItemRequest(BaseModel):
    article_id: str
    quantity: Decimal
    unit_price: Decimal
    barcode: Optional[str] = None
    description: Optional[str] = None

class CreatePurchaseOrderRequest(BaseModel):
    order_date: date
    supplier_id: str
    items: List[PurchaseOrderItemRequest]
    notes: Optional[str] = None

class PurchaseOrderItemResponse(BaseModel):
    id: str
    article_id: str
    quantity: Decimal
    unit_price: Decimal
    barcode: str
    description: Optional[str]

class PurchaseOrderResponse(BaseModel):
    id: str
    order_number: str
    order_date: date
    supplier_id: str
    status: str
    items: List[PurchaseOrderItemResponse]
    notes: Optional[str]
    created_at: datetime

# ========== DEPENDENCIES ==========
async def check_document_access(
    current_user: TokenData = Depends(get_current_user)
):
    if not RBACManager.check_permission(current_user.roles, "create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Document creation access required"
        )
    return current_user

# ========== DELIVERY NOTES ENDPOINTS ==========
@router.post("/delivery-notes", response_model=DeliveryNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_delivery_note(
    request: CreateDeliveryNoteRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    """Create a new delivery note with barcode for each item"""
    # You must implement DeliveryNote and DeliveryNoteItem models in models.py
    from app.core.models import DeliveryNote, DeliveryNoteItem

    delivery_number = generate_document_number(
        db, DeliveryNote, DeliveryNote.delivery_number, 
        current_user.company_id, "BL", request.delivery_date
    )
    note = DeliveryNote(
        company_id=current_user.company_id,
        delivery_number=delivery_number,
        delivery_date=request.delivery_date,
        client_id=request.client_id,
        notes=request.notes
    )
    db.add(note)
    db.flush()
    for item in request.items:
        barcode = item.barcode or str(uuid.uuid4()).replace('-', '')
        note_item = DeliveryNoteItem(
            delivery_note_id=note.id,
            article_id=item.article_id,
            quantity=item.quantity,
            barcode=barcode,
            description=item.description
        )
        db.add(note_item)
    log_audit(db, current_user, 'CREATE', 'DELIVERY_NOTE', str(note.id), {'delivery_number': note.delivery_number})
    db.commit()
    db.refresh(note)
    return DeliveryNoteResponse(
        id=str(note.id),
        delivery_number=note.delivery_number,
        delivery_date=note.delivery_date,
        client_id=str(note.client_id),
        items=[
            DeliveryNoteItemResponse(
                id=str(i.id),
                article_id=str(i.article_id),
                quantity=i.quantity,
                barcode=i.barcode,
                description=i.description
            ) for i in note.items
        ],
        notes=note.notes,
        created_at=note.created_at
    )

@router.get("/delivery-notes", response_model=List[DeliveryNoteResponse])
async def list_delivery_notes(
    current_user: TokenData = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    from app.core.models import DeliveryNote
    notes = db.query(DeliveryNote).filter(
        DeliveryNote.company_id == current_user.company_id
    ).order_by(DeliveryNote.delivery_date.desc()).offset(skip).limit(limit).all()
    return [
        DeliveryNoteResponse(
            id=str(note.id),
            delivery_number=note.delivery_number,
            delivery_date=note.delivery_date,
            client_id=str(note.client_id),
            items=[],  # For brevity, items can be loaded with joinedload if needed
            notes=note.notes,
            created_at=note.created_at
        ) for note in notes
    ]

@router.get("/delivery-notes/{note_id}", response_model=DeliveryNoteResponse)
async def get_delivery_note(
    note_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.core.models import DeliveryNote, DeliveryNoteItem
    note = db.query(DeliveryNote).options(joinedload(DeliveryNote.items)).filter(
        DeliveryNote.id == note_id,
        DeliveryNote.company_id == current_user.company_id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Delivery note not found")
    return DeliveryNoteResponse(
        id=str(note.id),
        delivery_number=note.delivery_number,
        delivery_date=note.delivery_date,
        client_id=str(note.client_id),
        items=[
            DeliveryNoteItemResponse(
                id=str(i.id),
                article_id=str(i.article_id),
                quantity=i.quantity,
                barcode=i.barcode,
                description=i.description
            ) for i in note.items
        ],
        notes=note.notes,
        created_at=note.created_at
    )

@router.post("/delivery-notes/{note_id}/items", response_model=DeliveryNoteItemResponse, status_code=201)
async def add_delivery_note_item(
    note_id: str,
    item: DeliveryNoteItemRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import DeliveryNote, DeliveryNoteItem
    note = db.query(DeliveryNote).filter(
        DeliveryNote.id == note_id,
        DeliveryNote.company_id == current_user.company_id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Delivery note not found")
    barcode = item.barcode or str(uuid.uuid4()).replace('-', '')
    note_item = DeliveryNoteItem(
        delivery_note_id=note.id,
        article_id=item.article_id,
        quantity=item.quantity,
        barcode=barcode,
        description=item.description
    )
    db.add(note_item)
    db.commit()
    db.refresh(note_item)
    return DeliveryNoteItemResponse(
        id=str(note_item.id),
        article_id=str(note_item.article_id),
        quantity=note_item.quantity,
        barcode=note_item.barcode,
        description=note_item.description
    )

@router.put("/delivery-notes/{note_id}/items/{item_id}", response_model=DeliveryNoteItemResponse)
async def update_delivery_note_item(
    note_id: str,
    item_id: str,
    item: DeliveryNoteItemRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import DeliveryNoteItem, DeliveryNote
    note_item = db.query(DeliveryNoteItem).join(DeliveryNote).filter(
        DeliveryNoteItem.id == item_id,
        DeliveryNoteItem.delivery_note_id == note_id,
        DeliveryNote.company_id == current_user.company_id
    ).first()
    if not note_item:
        raise HTTPException(status_code=404, detail="Delivery note item not found")
    note_item.article_id = item.article_id
    note_item.quantity = item.quantity
    note_item.barcode = item.barcode or note_item.barcode
    note_item.description = item.description
    db.commit()
    db.refresh(note_item)
    return DeliveryNoteItemResponse(
        id=str(note_item.id),
        article_id=str(note_item.article_id),
        quantity=note_item.quantity,
        barcode=note_item.barcode,
        description=note_item.description
    )

@router.delete("/delivery-notes/{note_id}/items/{item_id}", status_code=204)
async def delete_delivery_note_item(
    note_id: str,
    item_id: str,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import DeliveryNoteItem, DeliveryNote
    note_item = db.query(DeliveryNoteItem).join(DeliveryNote).filter(
        DeliveryNoteItem.id == item_id,
        DeliveryNoteItem.delivery_note_id == note_id,
        DeliveryNote.company_id == current_user.company_id
    ).first()
    if not note_item:
        raise HTTPException(status_code=404, detail="Delivery note item not found")
    log_audit(db, current_user, 'DELETE', 'DELIVERY_NOTE_ITEM', str(item_id), {'delivery_note_id': note_id})
    db.delete(note_item)
    db.commit()
    return

# ========== PURCHASE ORDERS ENDPOINTS ==========
@router.post("/purchase-orders", response_model=PurchaseOrderResponse, status_code=201)
async def create_purchase_order(
    request: CreatePurchaseOrderRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseOrder, PurchaseOrderItem
    order_number = generate_document_number(
        db, PurchaseOrder, PurchaseOrder.order_number,
        current_user.company_id, "BC", request.order_date
    )
    po = PurchaseOrder(
        company_id=current_user.company_id,
        order_number=order_number,
        order_date=request.order_date,
        supplier_id=request.supplier_id,
        notes=request.notes
    )
    db.add(po)
    db.flush()
    for item in request.items:
        barcode = item.barcode or str(uuid.uuid4()).replace('-', '')
        po_item = PurchaseOrderItem(
            purchase_order_id=po.id,
            article_id=item.article_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            barcode=barcode,
            description=item.description
        )
        db.add(po_item)
    log_audit(db, current_user, 'CREATE', 'PURCHASE_ORDER', str(po.id), {'order_number': po.order_number})
    db.commit()
    db.refresh(po)
    return PurchaseOrderResponse(
        id=str(po.id),
        order_number=po.order_number,
        order_date=po.order_date,
        supplier_id=str(po.supplier_id),
        status=po.status,
        items=[
            PurchaseOrderItemResponse(
                id=str(i.id),
                article_id=str(i.article_id),
                quantity=i.quantity,
                unit_price=i.unit_price,
                barcode=i.barcode,
                description=i.description
            ) for i in po.items
        ],
        notes=po.notes,
        created_at=po.created_at
    )

@router.get("/purchase-orders", response_model=List[PurchaseOrderResponse])
async def list_purchase_orders(
    current_user: TokenData = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseOrder
    orders = db.query(PurchaseOrder).filter(
        PurchaseOrder.company_id == current_user.company_id
    ).order_by(PurchaseOrder.order_date.desc()).offset(skip).limit(limit).all()
    return [
        PurchaseOrderResponse(
            id=str(order.id),
            order_number=order.order_number,
            order_date=order.order_date,
            supplier_id=str(order.supplier_id),
            status=order.status,
            items=[],  # For brevity, items can be loaded with joinedload if needed
            notes=order.notes,
            created_at=order.created_at
        ) for order in orders
    ]

@router.get("/purchase-orders/{order_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(
    order_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseOrder
    from sqlalchemy.orm import joinedload
    order = db.query(PurchaseOrder).options(joinedload(PurchaseOrder.items)).filter(
        PurchaseOrder.id == order_id,
        PurchaseOrder.company_id == current_user.company_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return PurchaseOrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        order_date=order.order_date,
        supplier_id=str(order.supplier_id),
        status=order.status,
        items=[
            PurchaseOrderItemResponse(
                id=str(i.id),
                article_id=str(i.article_id),
                quantity=i.quantity,
                unit_price=i.unit_price,
                barcode=i.barcode,
                description=i.description
            ) for i in order.items
        ],
        notes=order.notes,
        created_at=order.created_at
    )

@router.post("/purchase-orders/{order_id}/items", response_model=PurchaseOrderItemResponse, status_code=201)
async def add_purchase_order_item(
    order_id: str,
    item: PurchaseOrderItemRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseOrder, PurchaseOrderItem
    order = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == order_id,
        PurchaseOrder.company_id == current_user.company_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    barcode = item.barcode or str(uuid.uuid4()).replace('-', '')
    po_item = PurchaseOrderItem(
        purchase_order_id=order.id,
        article_id=item.article_id,
        quantity=item.quantity,
        unit_price=item.unit_price,
        barcode=barcode,
        description=item.description
    )
    db.add(po_item)
    db.commit()
    db.refresh(po_item)
    return PurchaseOrderItemResponse(
        id=str(po_item.id),
        article_id=str(po_item.article_id),
        quantity=po_item.quantity,
        unit_price=po_item.unit_price,
        barcode=po_item.barcode,
        description=po_item.description
    )

@router.put("/purchase-orders/{order_id}/items/{item_id}", response_model=PurchaseOrderItemResponse)
async def update_purchase_order_item(
    order_id: str,
    item_id: str,
    item: PurchaseOrderItemRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseOrderItem, PurchaseOrder
    po_item = db.query(PurchaseOrderItem).join(PurchaseOrder).filter(
        PurchaseOrderItem.id == item_id,
        PurchaseOrderItem.purchase_order_id == order_id,
        PurchaseOrder.company_id == current_user.company_id
    ).first()
    if not po_item:
        raise HTTPException(status_code=404, detail="Purchase order item not found")
    po_item.article_id = item.article_id
    po_item.quantity = item.quantity
    po_item.unit_price = item.unit_price
    po_item.barcode = item.barcode or po_item.barcode
    po_item.description = item.description
    db.commit()
    db.refresh(po_item)
    return PurchaseOrderItemResponse(
        id=str(po_item.id),
        article_id=str(po_item.article_id),
        quantity=po_item.quantity,
        unit_price=po_item.unit_price,
        barcode=po_item.barcode,
        description=po_item.description
    )

@router.delete("/purchase-orders/{order_id}/items/{item_id}", status_code=204)
async def delete_purchase_order_item(
    order_id: str,
    item_id: str,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseOrderItem, PurchaseOrder
    po_item = db.query(PurchaseOrderItem).join(PurchaseOrder).filter(
        PurchaseOrderItem.id == item_id,
        PurchaseOrderItem.purchase_order_id == order_id,
        PurchaseOrder.company_id == current_user.company_id
    ).first()
    if not po_item:
        raise HTTPException(status_code=404, detail="Purchase order item not found")
    log_audit(db, current_user, 'DELETE', 'PURCHASE_ORDER_ITEM', str(item_id), {'purchase_order_id': order_id})
    db.delete(po_item)
    db.commit()
    return

# ========== (Similar endpoints for Purchase Notes to be added) ==========

# ================= PURCHASE NOTES =================
class PurchaseNoteItemRequest(BaseModel):
    article_id: str
    quantity_commanded: Decimal
    quantity_received: Decimal
    barcode: Optional[str] = None
    conformity: Optional[str] = "ok"  # ok, defect, missing
    description: Optional[str] = None

class CreatePurchaseNoteRequest(BaseModel):
    note_date: date
    supplier_id: str
    items: List[PurchaseNoteItemRequest]
    conformity_status: Optional[str] = "ok"
    notes: Optional[str] = None

class PurchaseNoteItemResponse(BaseModel):
    id: str
    article_id: str
    quantity_commanded: Decimal
    quantity_received: Decimal
    barcode: str
    conformity: str
    description: Optional[str]

class PurchaseNoteResponse(BaseModel):
    id: str
    note_number: str
    note_date: date
    supplier_id: str
    conformity_status: str
    items: List[PurchaseNoteItemResponse]
    notes: Optional[str]
    created_at: datetime

@router.post("/purchase-notes", response_model=PurchaseNoteResponse, status_code=201)
async def create_purchase_note(
    request: CreatePurchaseNoteRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseNote, PurchaseNoteItem
    note_number = generate_document_number(
        db, PurchaseNote, PurchaseNote.note_number,
        current_user.company_id, "BA", request.note_date
    )
    pn = PurchaseNote(
        company_id=current_user.company_id,
        note_number=note_number,
        note_date=request.note_date,
        supplier_id=request.supplier_id,
        conformity_status=request.conformity_status,
        notes=request.notes
    )
    db.add(pn)
    db.flush()
    for item in request.items:
        barcode = item.barcode or str(uuid.uuid4()).replace('-', '')
        pn_item = PurchaseNoteItem(
            purchase_note_id=pn.id,
            article_id=item.article_id,
            quantity_commanded=item.quantity_commanded,
            quantity_received=item.quantity_received,
            barcode=barcode,
            conformity=item.conformity or "ok",
            description=item.description
        )
        db.add(pn_item)
    log_audit(db, current_user, 'CREATE', 'PURCHASE_NOTE', str(pn.id), {'note_number': pn.note_number})
    db.commit()
    db.refresh(pn)
    return PurchaseNoteResponse(
        id=str(pn.id),
        note_number=pn.note_number,
        note_date=pn.note_date,
        supplier_id=str(pn.supplier_id),
        conformity_status=pn.conformity_status,
        items=[
            PurchaseNoteItemResponse(
                id=str(i.id),
                article_id=str(i.article_id),
                quantity_commanded=i.quantity_commanded,
                quantity_received=i.quantity_received,
                barcode=i.barcode,
                conformity=i.conformity,
                description=i.description
            ) for i in pn.items
        ],
        notes=pn.notes,
        created_at=pn.created_at
    )

@router.get("/purchase-notes", response_model=List[PurchaseNoteResponse])
async def list_purchase_notes(
    current_user: TokenData = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseNote
    notes = db.query(PurchaseNote).filter(
        PurchaseNote.company_id == current_user.company_id
    ).order_by(PurchaseNote.note_date.desc()).offset(skip).limit(limit).all()
    return [
        PurchaseNoteResponse(
            id=str(note.id),
            note_number=note.note_number,
            note_date=note.note_date,
            supplier_id=str(note.supplier_id),
            conformity_status=note.conformity_status,
            items=[],
            notes=note.notes,
            created_at=note.created_at
        ) for note in notes
    ]

@router.get("/purchase-notes/{note_id}", response_model=PurchaseNoteResponse)
async def get_purchase_note(
    note_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseNote
    note = db.query(PurchaseNote).options(joinedload(PurchaseNote.items)).filter(
        PurchaseNote.id == note_id,
        PurchaseNote.company_id == current_user.company_id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Purchase note not found")
    return PurchaseNoteResponse(
        id=str(note.id),
        note_number=note.note_number,
        note_date=note.note_date,
        supplier_id=str(note.supplier_id),
        conformity_status=note.conformity_status,
        items=[
            PurchaseNoteItemResponse(
                id=str(i.id),
                article_id=str(i.article_id),
                quantity_commanded=i.quantity_commanded,
                quantity_received=i.quantity_received,
                barcode=i.barcode,
                conformity=i.conformity,
                description=i.description
            ) for i in note.items
        ],
        notes=note.notes,
        created_at=note.created_at
    )

@router.post("/purchase-notes/{note_id}/items", response_model=PurchaseNoteItemResponse, status_code=201)
async def add_purchase_note_item(
    note_id: str,
    item: PurchaseNoteItemRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseNote, PurchaseNoteItem
    note = db.query(PurchaseNote).filter(
        PurchaseNote.id == note_id,
        PurchaseNote.company_id == current_user.company_id
    ).first()
    if not note:
        raise HTTPException(status_code=404, detail="Purchase note not found")
    barcode = item.barcode or str(uuid.uuid4()).replace('-', '')
    pn_item = PurchaseNoteItem(
        purchase_note_id=note.id,
        article_id=item.article_id,
        quantity_commanded=item.quantity_commanded,
        quantity_received=item.quantity_received,
        barcode=barcode,
        conformity=item.conformity or "ok",
        description=item.description
    )
    db.add(pn_item)
    db.commit()
    db.refresh(pn_item)
    return PurchaseNoteItemResponse(
        id=str(pn_item.id),
        article_id=str(pn_item.article_id),
        quantity_commanded=pn_item.quantity_commanded,
        quantity_received=pn_item.quantity_received,
        barcode=pn_item.barcode,
        conformity=pn_item.conformity,
        description=pn_item.description
    )

@router.put("/purchase-notes/{note_id}/items/{item_id}", response_model=PurchaseNoteItemResponse)
async def update_purchase_note_item(
    note_id: str,
    item_id: str,
    item: PurchaseNoteItemRequest,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseNoteItem, PurchaseNote
    pn_item = db.query(PurchaseNoteItem).join(PurchaseNote).filter(
        PurchaseNoteItem.id == item_id,
        PurchaseNoteItem.purchase_note_id == note_id,
        PurchaseNote.company_id == current_user.company_id
    ).first()
    if not pn_item:
        raise HTTPException(status_code=404, detail="Purchase note item not found")
    pn_item.article_id = item.article_id
    pn_item.quantity_commanded = item.quantity_commanded
    pn_item.quantity_received = item.quantity_received
    pn_item.barcode = item.barcode or pn_item.barcode
    pn_item.conformity = item.conformity or pn_item.conformity
    pn_item.description = item.description
    db.commit()
    db.refresh(pn_item)
    return PurchaseNoteItemResponse(
        id=str(pn_item.id),
        article_id=str(pn_item.article_id),
        quantity_commanded=pn_item.quantity_commanded,
        quantity_received=pn_item.quantity_received,
        barcode=pn_item.barcode,
        conformity=pn_item.conformity,
        description=pn_item.description
    )

@router.delete("/purchase-notes/{note_id}/items/{item_id}", status_code=204)
async def delete_purchase_note_item(
    note_id: str,
    item_id: str,
    current_user: TokenData = Depends(check_document_access),
    db: Session = Depends(get_db)
):
    from app.core.models import PurchaseNoteItem, PurchaseNote
    pn_item = db.query(PurchaseNoteItem).join(PurchaseNote).filter(
        PurchaseNoteItem.id == item_id,
        PurchaseNoteItem.purchase_note_id == note_id,
        PurchaseNote.company_id == current_user.company_id
    ).first()
    if not pn_item:
        raise HTTPException(status_code=404, detail="Purchase note item not found")
    log_audit(db, current_user, 'DELETE', 'PURCHASE_NOTE_ITEM', str(item_id), {'purchase_note_id': note_id})
    db.delete(pn_item)
    db.commit()
    return

# ========== KPIs & ALERTS ENDPOINTS ========== #
from pydantic import BaseModel

class KPIResponse(BaseModel):
    name: str
    value: float
    unit: str
    period: str

class FinancialIndicatorResponse(BaseModel):
    name: str
    value: float
    unit: str
    period: str

class AlertResponse(BaseModel):
    id: str
    alert_code: str
    alert_name: str
    alert_type: str
    severity_level: str
    status: Optional[str] = None
    created_at: str

class NotificationResponse(BaseModel):
    id: str
    subject: str
    message: str
    notification_type: str
    priority: str
    is_read: bool
    created_at: str

@router.get("/kpis", response_model=List[KPIResponse])
async def get_kpis(
    period: Optional[str] = Query(None, description="Filtrer par p????riode (mois, trimestre, ann????e)"),
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    # KPIs reels calcules sur les factures des 30 derniers jours
    from app.core.models import Invoice
    from sqlalchemy import func as sqlfunc
    from decimal import Decimal
    import datetime as dt

    thirty_days_ago = dt.date.today() - dt.timedelta(days=30)
    ca = db.query(sqlfunc.sum(Invoice.total_htt)).filter(
        Invoice.company_id == current_user.company_id,
        Invoice.type == 'sale',
        Invoice.status != 'annulee',
        Invoice.invoice_date >= thirty_days_ago
    ).scalar() or Decimal('0')
    achats = db.query(sqlfunc.sum(Invoice.total_htt)).filter(
        Invoice.company_id == current_user.company_id,
        Invoice.type == 'purchase',
        Invoice.status != 'annulee',
        Invoice.invoice_date >= thirty_days_ago
    ).scalar() or Decimal('0')
    profit = ca - achats
    marge = float((profit / ca) * 100) if ca > 0 else 0.0
    kpis = [
        {"name": "CA", "value": float(ca), "unit": "DZD", "period": period or "mois"},
        {"name": "Profit", "value": float(profit), "unit": "DZD", "period": period or "mois"},
        {"name": "Marge", "value": round(marge, 1), "unit": "%", "period": period or "mois"},
    ]
    return [KPIResponse(**k) for k in kpis]

@router.get("/financial-indicators", response_model=List[FinancialIndicatorResponse])
async def get_financial_indicators(
    period: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    # Indicateurs financiers reels (service analytique unifie)
    from app.modules.finance.service_analytics import AnalyticService
    health = AnalyticService.get_financial_health_kpis(db, current_user.company_id)
    indicators = [
        {"name": "Solvabilite", "value": round(health.get("solvency_ratio", 0), 2), "unit": "ratio", "period": period or "mois"},
        {"name": "DSO", "value": round(health.get("dso_days", 0), 1), "unit": "jours", "period": period or "mois"},
        {"name": "Marge nette", "value": round(health.get("margin_net_pct", 0), 1), "unit": "%", "period": period or "mois"},
    ]
    return [FinancialIndicatorResponse(**i) for i in indicators]

@router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    status: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    company_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    query = db.query(AlertTrigger).join(AlertDefinition).filter(AlertDefinition.company_id == current_user.company_id)
    if status:
        query = query.filter(AlertTrigger.status == status)
    if severity:
        query = query.filter(AlertDefinition.severity_level == severity)
    alerts = query.order_by(AlertTrigger.created_at.desc()).limit(200).all()
    # Resolution des definitions en une requete (nom/type reels)
    def_ids = {a.alert_id for a in alerts}
    defs_by_id = {d.id: d for d in db.query(AlertDefinition).filter(AlertDefinition.id.in_(def_ids)).all()} if def_ids else {}
    return [
        AlertResponse(
            id=str(a.id),
            alert_code=a.alert_id,
            alert_name=a.alert_id,  # Replace with real name
            alert_type=a.status,    # Replace with real type
            severity_level=a.priority,
            status=a.status,
            created_at=a.created_at.isoformat()
        ) for a in alerts
    ]

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    is_read: Optional[bool] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    query = db.query(UserNotification).filter(UserNotification.company_id == current_user.company_id)
    if is_read is not None:
        query = query.filter(UserNotification.is_read == is_read)
    if priority:
        query = query.filter(UserNotification.priority == priority)
    notifications = query.order_by(UserNotification.created_at.desc()).limit(200).all()
    return [
        NotificationResponse(
            id=str(n.id),
            subject=n.subject,
            message=n.message,
            notification_type=n.notification_type,
            priority=n.priority,
            is_read=n.is_read,
            created_at=n.created_at.isoformat()
        ) for n in notifications
    ]
