"""
Supplier API Endpoints - Supplier Management and Statistics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from app.database import get_db
from app.models.models import Supplier, User
from app.routers.auth import get_current_user
from app.security import TokenData, RBACManager
from pydantic import BaseModel, Field
from app.utils.audit import log_audit
import json

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

# ========== REQUEST/RESPONSE MODELS ==========
class SupplierResponse(BaseModel):
    id: str
    name: str
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]
    tax_id: Optional[str]
    payment_terms: Optional[int]
    is_active: bool
    created_at: str
    updated_at: str

class CreateSupplierRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = "Algérie"
    tax_id: Optional[str] = None
    payment_terms: Optional[int] = 30

class UpdateSupplierRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    tax_id: Optional[str] = None
    payment_terms: Optional[int] = None
    is_active: Optional[bool] = None

class SupplierStatsResponse(BaseModel):
    total_suppliers: int
    active_suppliers: int
    new_suppliers_this_month: int
    total_purchases: Decimal
    average_purchase_value: Decimal
    top_suppliers: List[dict]

# ========== DEPENDENCIES ==========
async def check_supplier_access(
    current_user: TokenData = Depends(get_current_user)
):
    """Check if user has supplier access"""
    if not RBACManager.check_permission(current_user.roles, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Supplier access required"
        )
    return current_user

# ========== SUPPLIER ENDPOINTS ==========
@router.get("/", response_model=List[SupplierResponse])
async def list_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: TokenData = Depends(check_supplier_access),
    db: Session = Depends(get_db)
):
    """List all suppliers with optional filtering"""
    query = db.query(Supplier).filter(Supplier.company_id == current_user.company_id)
    
    if search:
        query = query.filter(
            (Supplier.name.ilike(f"%{search}%")) |
            (Supplier.email.ilike(f"%{search}%")) |
            (Supplier.phone.ilike(f"%{search}%"))
        )
    
    if is_active is not None:
        query = query.filter(Supplier.is_active == is_active)
    
    suppliers = query.order_by(Supplier.name).offset(skip).limit(limit).all()
    
    return [
        SupplierResponse(
            id=str(s.id),
            name=s.name,
            email=s.email,
            phone=s.phone,
            address=s.address,
            city=s.city,
            postal_code=s.postal_code,
            country=s.country,
            tax_id=s.tax_id,
            payment_terms=s.payment_terms,
            is_active=s.is_active,
            created_at=s.created_at.isoformat() if s.created_at else "",
            updated_at=s.updated_at.isoformat() if s.updated_at else ""
        )
        for s in suppliers
    ]

@router.get("/stats", response_model=SupplierStatsResponse)
async def get_supplier_stats(
    current_user: TokenData = Depends(check_supplier_access),
    db: Session = Depends(get_db)
):
    """Get supplier statistics"""
    from sqlalchemy import func
    from datetime import date
    
    # Total suppliers
    total_suppliers = db.query(func.count(Supplier.id)).filter(
        Supplier.company_id == current_user.company_id
    ).scalar() or 0
    
    # Active suppliers
    active_suppliers = db.query(func.count(Supplier.id)).filter(
        Supplier.company_id == current_user.company_id,
        Supplier.is_active == True
    ).scalar() or 0
    
    # New suppliers this month
    first_day_of_month = date.today().replace(day=1)
    new_suppliers_this_month = db.query(func.count(Supplier.id)).filter(
        Supplier.company_id == current_user.company_id,
        Supplier.created_at >= first_day_of_month
    ).scalar() or 0
    
    # TODO: Calculate purchases from purchase orders/invoices
    # For now, return mock data
    total_purchases = Decimal("1850000")
    average_purchase_value = Decimal("45000")
    
    # TODO: Get top suppliers by purchase volume
    top_suppliers = [
        {"id": "1", "name": "Fournisseur A", "purchases": 450000},
        {"id": "2", "name": "Fournisseur B", "purchases": 380000},
        {"id": "3", "name": "Fournisseur C", "purchases": 290000},
    ]
    
    return SupplierStatsResponse(
        total_suppliers=total_suppliers,
        active_suppliers=active_suppliers,
        new_suppliers_this_month=new_suppliers_this_month,
        total_purchases=total_purchases,
        average_purchase_value=average_purchase_value,
        top_suppliers=top_suppliers
    )

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: str,
    current_user: TokenData = Depends(check_supplier_access),
    db: Session = Depends(get_db)
):
    """Get a specific supplier by ID"""
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.company_id == current_user.company_id
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    return SupplierResponse(
        id=str(supplier.id),
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        city=supplier.city,
        postal_code=supplier.postal_code,
        country=supplier.country,
        tax_id=supplier.tax_id,
        payment_terms=supplier.payment_terms,
        is_active=supplier.is_active,
        created_at=supplier.created_at.isoformat() if supplier.created_at else "",
        updated_at=supplier.updated_at.isoformat() if supplier.updated_at else ""
    )

@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
async def create_supplier(
    request: CreateSupplierRequest,
    current_user: TokenData = Depends(check_supplier_access),
    db: Session = Depends(get_db)
):
    """Create a new supplier"""
    # Check if supplier with same name already exists
    existing = db.query(Supplier).filter(
        Supplier.company_id == current_user.company_id,
        Supplier.name == request.name
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Supplier with this name already exists"
        )
    
    supplier = Supplier(
        company_id=current_user.company_id,
        name=request.name,
        email=request.email,
        phone=request.phone,
        address=request.address,
        city=request.city,
        postal_code=request.postal_code,
        country=request.country,
        tax_id=request.tax_id,
        payment_terms=request.payment_terms,
        is_active=True
    )
    
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    
    # Audit Log
    log_audit(db, current_user, "CREATE", "SUPPLIER", str(supplier.id), {"name": supplier.name})
    db.commit()
    
    return SupplierResponse(
        id=str(supplier.id),
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        city=supplier.city,
        postal_code=supplier.postal_code,
        country=supplier.country,
        tax_id=supplier.tax_id,
        payment_terms=supplier.payment_terms,
        is_active=supplier.is_active,
        created_at=supplier.created_at.isoformat() if supplier.created_at else "",
        updated_at=supplier.updated_at.isoformat() if supplier.updated_at else ""
    )

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: str,
    request: UpdateSupplierRequest,
    current_user: TokenData = Depends(check_supplier_access),
    db: Session = Depends(get_db)
):
    """Update an existing supplier"""
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.company_id == current_user.company_id
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Update fields
    update_data = request.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)
    
    supplier.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(supplier)
    
    # Audit Log
    log_audit(db, current_user, "UPDATE", "SUPPLIER", str(supplier.id), request.dict(exclude_unset=True))
    db.commit()
    
    return SupplierResponse(
        id=str(supplier.id),
        name=supplier.name,
        email=supplier.email,
        phone=supplier.phone,
        address=supplier.address,
        city=supplier.city,
        postal_code=supplier.postal_code,
        country=supplier.country,
        tax_id=supplier.tax_id,
        payment_terms=supplier.payment_terms,
        is_active=supplier.is_active,
        created_at=supplier.created_at.isoformat() if supplier.created_at else "",
        updated_at=supplier.updated_at.isoformat() if supplier.updated_at else ""
    )

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_supplier(
    supplier_id: str,
    current_user: TokenData = Depends(check_supplier_access),
    db: Session = Depends(get_db)
):
    """Soft delete a supplier (set is_active to False)"""
    supplier = db.query(Supplier).filter(
        Supplier.id == supplier_id,
        Supplier.company_id == current_user.company_id
    ).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # Soft delete
    supplier.is_active = False
    supplier.updated_at = datetime.utcnow()
    
    db.commit()
    
    return None
