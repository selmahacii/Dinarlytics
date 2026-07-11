"""
Procurement API - Purchase Orders and Delivery Notes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timezone
from decimal import Decimal
from pydantic import BaseModel, Field
import uuid

from app.core.database import get_db
from app.core.models import PurchaseOrder, PurchaseOrderItem, DeliveryNote, DeliveryNoteItem, Article, Supplier, Client
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData, RBACManager
from app.modules.system.utils_audit import log_audit

router = APIRouter(prefix="/procurement", tags=["procurement"])


async def check_procurement_write(current_user: TokenData = Depends(get_current_user)):
    if not RBACManager.check_permission(current_user.roles, "create"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Procurement write access required")
    return current_user


async def check_procurement_update(current_user: TokenData = Depends(get_current_user)):
    if not RBACManager.check_permission(current_user.roles, "update"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Procurement update access required")
    return current_user


async def check_procurement_approve(current_user: TokenData = Depends(get_current_user)):
    if not RBACManager.check_permission(current_user.roles, "approve"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Procurement approval access required")
    return current_user


async def check_procurement_delete(current_user: TokenData = Depends(get_current_user)):
    if not RBACManager.check_permission(current_user.roles, "delete"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Procurement delete access required")
    return current_user

# ===== PURCHASE ORDERS =====
class POItemResponse(BaseModel):
    id: str
    article_id: Optional[str]
    article_name: Optional[str]
    quantity: float
    unit_price: float
    total: float
    barcode: Optional[str]
    description: Optional[str]

class PurchaseOrderResponse(BaseModel):
    id: str
    order_number: str
    order_date: date
    supplier_id: str
    supplier_name: Optional[str]
    status: str
    notes: Optional[str]
    created_at: str
    items: List[POItemResponse] = []
    total_ht: float = 0.0
    total_ttc: float = 0.0

class CreatePOItemRequest(BaseModel):
    article_id: Optional[str] = None
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    barcode: str = Field(default="")
    description: Optional[str] = None

class CreatePORequest(BaseModel):
    supplier_id: str
    order_date: date
    notes: Optional[str] = None
    items: List[CreatePOItemRequest] = []

class UpdatePORequest(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


def _build_po_response(
    po: PurchaseOrder,
    db: Session,
    supplier_names: Optional[dict] = None,
    article_names: Optional[dict] = None
) -> PurchaseOrderResponse:
    # Les dictionnaires pré-chargés évitent un SELECT par commande/ligne (N+1)
    # lors des listes ; les lectures unitaires les résolvent à la demande.
    if supplier_names is not None:
        supplier_name = supplier_names.get(po.supplier_id)
    else:
        supplier_name = None
        if po.supplier_id:
            sup = db.query(Supplier).filter(Supplier.id == po.supplier_id).first()
            supplier_name = sup.name if sup else None

    items = []
    total_ht = 0.0
    for item in po.items:
        if article_names is not None:
            art_name = article_names.get(item.article_id)
        else:
            art_name = None
            if item.article_id:
                art = db.query(Article).filter(Article.id == item.article_id).first()
                art_name = art.name if art else None
        total = float(item.quantity or 0) * float(item.unit_price or 0)
        total_ht += total
        items.append(POItemResponse(
            id=str(item.id), article_id=str(item.article_id) if item.article_id else None,
            article_name=art_name, quantity=float(item.quantity or 0),
            unit_price=float(item.unit_price or 0), total=total,
            barcode=item.barcode, description=item.description
        ))

    return PurchaseOrderResponse(
        id=str(po.id), order_number=po.order_number, order_date=po.order_date,
        supplier_id=str(po.supplier_id), supplier_name=supplier_name,
        status=po.status, notes=po.notes,
        created_at=po.created_at.isoformat() if po.created_at else "",
        items=items, total_ht=total_ht, total_ttc=round(total_ht * 1.19, 2)
    )


@router.get("/purchase-orders", response_model=List[PurchaseOrderResponse])
async def list_purchase_orders(
    status: Optional[str] = Query(None),
    supplier_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all purchase orders for the company"""
    query = db.query(PurchaseOrder).filter(PurchaseOrder.company_id == current_user.company_id)
    if status:
        query = query.filter(PurchaseOrder.status == status)
    if supplier_id:
        query = query.filter(PurchaseOrder.supplier_id == supplier_id)
    orders = query.order_by(PurchaseOrder.order_date.desc()).offset(skip).limit(limit).all()

    # Pré-chargement en 2 requêtes des noms fournisseurs et articles.
    supplier_ids = {po.supplier_id for po in orders if po.supplier_id}
    supplier_names = {
        s.id: s.name for s in db.query(Supplier.id, Supplier.name).filter(Supplier.id.in_(supplier_ids)).all()
    } if supplier_ids else {}

    article_ids = {item.article_id for po in orders for item in po.items if item.article_id}
    article_names = {
        a.id: a.name for a in db.query(Article.id, Article.name).filter(Article.id.in_(article_ids)).all()
    } if article_ids else {}

    return [_build_po_response(po, db, supplier_names, article_names) for po in orders]


@router.get("/purchase-orders/{po_id}", response_model=PurchaseOrderResponse)
async def get_purchase_order(
    po_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single purchase order"""
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id,
        PurchaseOrder.company_id == current_user.company_id
    ).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return _build_po_response(po, db)


@router.post("/purchase-orders", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_purchase_order(
    request: CreatePORequest,
    current_user: TokenData = Depends(check_procurement_write),
    db: Session = Depends(get_db)
):
    """Create a new purchase order"""
    # Check supplier exists
    supplier = db.query(Supplier).filter(
        Supplier.id == request.supplier_id,
        Supplier.company_id == current_user.company_id
    ).first()
    if not supplier:
        raise HTTPException(status_code=400, detail="Supplier not found")
    
    # Generate order number
    count = db.query(PurchaseOrder).filter(PurchaseOrder.company_id == current_user.company_id).count()
    order_number = f"BC-{datetime.now().year}-{count + 1:04d}"
    
    po = PurchaseOrder(
        company_id=current_user.company_id,
        order_number=order_number,
        order_date=request.order_date,
        supplier_id=request.supplier_id,
        status="draft",
        notes=request.notes
    )
    db.add(po)
    db.flush()
    
    for item_req in request.items:
        item = PurchaseOrderItem(
            purchase_order_id=po.id,
            article_id=item_req.article_id,
            quantity=Decimal(str(item_req.quantity)),
            unit_price=Decimal(str(item_req.unit_price)),
            barcode=item_req.barcode or f"BC-{uuid.uuid4().hex[:8]}",
            description=item_req.description
        )
        db.add(item)
    
    db.commit()
    db.refresh(po)
    log_audit(db, current_user, "CREATE", "PURCHASE_ORDER", str(po.id), {"order_number": po.order_number})
    db.commit()
    return _build_po_response(po, db)


@router.put("/purchase-orders/{po_id}", response_model=PurchaseOrderResponse)
async def update_purchase_order(
    po_id: str,
    request: UpdatePORequest,
    current_user: TokenData = Depends(check_procurement_update),
    db: Session = Depends(get_db)
):
    """Update purchase order status or notes"""
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id,
        PurchaseOrder.company_id == current_user.company_id
    ).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    if request.status:
        valid_statuses = ['draft', 'pending_approval', 'approved', 'confirmed', 'delivered', 'invoiced', 'cancelled']
        if request.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        if request.status == 'approved' and not RBACManager.check_permission(current_user.roles, "approve"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Approval permission required")
        po.status = request.status
    if request.notes is not None:
        po.notes = request.notes
    
    db.commit()
    db.refresh(po)
    log_audit(db, current_user, "UPDATE", "PURCHASE_ORDER", str(po.id), request.dict(exclude_unset=True))
    db.commit()
    return _build_po_response(po, db)


@router.delete("/purchase-orders/{po_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_purchase_order(
    po_id: str,
    current_user: TokenData = Depends(check_procurement_delete),
    db: Session = Depends(get_db)
):
    """Cancel a purchase order"""
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id,
        PurchaseOrder.company_id == current_user.company_id
    ).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    po.status = "cancelled"
    db.commit()
    log_audit(db, current_user, "DELETE", "PURCHASE_ORDER", str(po.id))
    db.commit()
    return None


# ===== DELIVERY NOTES (SUIVI LIVRAISONS) =====
class DeliveryItemResponse(BaseModel):
    id: str
    article_id: Optional[str]
    article_name: Optional[str]
    quantity: float
    barcode: str
    description: Optional[str]

class DeliveryNoteResponse(BaseModel):
    id: str
    delivery_number: str
    delivery_date: date
    client_id: str
    client_name: Optional[str]
    notes: Optional[str]
    created_at: str
    items: List[DeliveryItemResponse] = []
    statut: str = "livree"  # Fixed status since delivery_note = delivered

class CreateDeliveryItemRequest(BaseModel):
    article_id: Optional[str] = None
    quantity: float = Field(..., gt=0)
    barcode: str = Field(default="")
    description: Optional[str] = None

class CreateDeliveryRequest(BaseModel):
    client_id: str
    delivery_date: date
    notes: Optional[str] = None
    items: List[CreateDeliveryItemRequest] = []


def _build_delivery_response(
    dn: DeliveryNote,
    db: Session,
    client_names: Optional[dict] = None,
    article_names: Optional[dict] = None
) -> DeliveryNoteResponse:
    if client_names is not None:
        client_name = client_names.get(dn.client_id)
    else:
        client_name = None
        if dn.client_id:
            cl = db.query(Client).filter(Client.id == dn.client_id).first()
            client_name = cl.name if cl else None

    items = []
    for item in dn.items:
        if article_names is not None:
            art_name = article_names.get(item.article_id)
        else:
            art_name = None
            if item.article_id:
                art = db.query(Article).filter(Article.id == item.article_id).first()
                art_name = art.name if art else None
        items.append(DeliveryItemResponse(
            id=str(item.id), article_id=str(item.article_id) if item.article_id else None,
            article_name=art_name, quantity=float(item.quantity or 0),
            barcode=item.barcode, description=item.description
        ))

    return DeliveryNoteResponse(
        id=str(dn.id), delivery_number=dn.delivery_number,
        delivery_date=dn.delivery_date, client_id=str(dn.client_id),
        client_name=client_name, notes=dn.notes,
        created_at=dn.created_at.isoformat() if dn.created_at else "",
        items=items, statut="livree"
    )


@router.get("/deliveries", response_model=List[DeliveryNoteResponse])
async def list_deliveries(
    client_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all delivery notes"""
    query = db.query(DeliveryNote).filter(DeliveryNote.company_id == current_user.company_id)
    if client_id:
        query = query.filter(DeliveryNote.client_id == client_id)
    notes = query.order_by(DeliveryNote.delivery_date.desc()).offset(skip).limit(limit).all()

    # Pré-chargement en 2 requêtes des noms clients et articles (anti N+1).
    client_ids = {dn.client_id for dn in notes if dn.client_id}
    client_names = {
        c.id: c.name for c in db.query(Client.id, Client.name).filter(Client.id.in_(client_ids)).all()
    } if client_ids else {}

    article_ids = {item.article_id for dn in notes for item in dn.items if item.article_id}
    article_names = {
        a.id: a.name for a in db.query(Article.id, Article.name).filter(Article.id.in_(article_ids)).all()
    } if article_ids else {}

    return [_build_delivery_response(dn, db, client_names, article_names) for dn in notes]


@router.post("/deliveries", response_model=DeliveryNoteResponse, status_code=status.HTTP_201_CREATED)
async def create_delivery(
    request: CreateDeliveryRequest,
    current_user: TokenData = Depends(check_procurement_write),
    db: Session = Depends(get_db)
):
    """Create a new delivery note"""
    client = db.query(Client).filter(
        Client.id == request.client_id,
        Client.company_id == current_user.company_id
    ).first()
    if not client:
        raise HTTPException(status_code=400, detail="Client not found")
    
    count = db.query(DeliveryNote).filter(DeliveryNote.company_id == current_user.company_id).count()
    delivery_number = f"BL-{datetime.now().year}-{count + 1:04d}"
    
    dn = DeliveryNote(
        company_id=current_user.company_id,
        delivery_number=delivery_number,
        delivery_date=request.delivery_date,
        client_id=request.client_id,
        notes=request.notes
    )
    db.add(dn)
    db.flush()
    
    for item_req in request.items:
        item = DeliveryNoteItem(
            delivery_note_id=dn.id,
            article_id=item_req.article_id,
            quantity=Decimal(str(item_req.quantity)),
            barcode=item_req.barcode or f"BL-{uuid.uuid4().hex[:8]}",
            description=item_req.description
        )
        db.add(item)
    
    db.commit()
    db.refresh(dn)
    log_audit(db, current_user, "CREATE", "DELIVERY_NOTE", str(dn.id), {"delivery_number": dn.delivery_number})
    db.commit()
    return _build_delivery_response(dn, db)
