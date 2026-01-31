"""
Client API Endpoints - Client management, statistics, and analysis
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
import uuid

from app.database import get_db
from app.models import Client, User
from app.routers.auth import get_current_user
from app.security import TokenData, RBACManager
from pydantic import BaseModel, Field, EmailStr
from app.websocket_manager import manager
from app.utils.audit import log_audit
import json

router = APIRouter(prefix="/clients", tags=["clients"])

# ========== REQUEST/RESPONSE MODELS ==========
class ClientRequest(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = "Alg????rie"
    tax_id: Optional[str] = None
    credit_limit: Optional[Decimal] = None
    payment_terms: Optional[int] = 30
    notes: Optional[str] = None

class ClientResponse(BaseModel):
    id: str
    name: str
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    postal_code: Optional[str]
    country: Optional[str]
    tax_id: Optional[str]
    credit_limit: Optional[Decimal]
    payment_terms: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: datetime

class ClientStatsResponse(BaseModel):
    total_clients: int
    active_clients: int
    new_clients_this_month: int
    total_revenue: Decimal
    average_order_value: Decimal
    top_clients: List[dict]

# ========== DEPENDENCIES ==========
async def check_client_access(
    current_user: TokenData = Depends(get_current_user)
):
    if not RBACManager.check_permission(current_user.roles, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client access required"
        )
    return current_user

# ========== CLIENT ENDPOINTS ==========
@router.get("/", response_model=List[ClientResponse])
async def list_clients(
    current_user: TokenData = Depends(check_client_access),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """List all clients with optional filtering"""
    query = db.query(Client).filter(Client.company_id == current_user.company_id)
    
    if search:
        query = query.filter(
            (Client.name.ilike(f"%{search}%")) |
            (Client.email.ilike(f"%{search}%")) |
            (Client.phone.ilike(f"%{search}%"))
        )
    
    if is_active is not None:
        query = query.filter(Client.is_active == is_active)
    
    clients = query.order_by(Client.name).offset(skip).limit(limit).all()
    
    return [
        ClientResponse(
            id=str(c.id),
            name=c.name,
            email=c.email,
            phone=c.phone,
            address=c.address,
            city=c.city,
            postal_code=c.postal_code,
            country=c.country,
            tax_id=c.tax_id,
            credit_limit=c.credit_limit,
            payment_terms=c.payment_terms,
            is_active=c.is_active,
            created_at=c.created_at,
            updated_at=c.updated_at
        ) for c in clients
    ]

@router.get("/stats", response_model=ClientStatsResponse)
async def get_client_stats(
    current_user: TokenData = Depends(check_client_access),
    db: Session = Depends(get_db)
):
    """Get client statistics and KPIs"""
    from sqlalchemy import func, extract
    from datetime import datetime
    
    # Total clients
    total = db.query(func.count(Client.id)).filter(
        Client.company_id == current_user.company_id
    ).scalar() or 0
    
    # Active clients
    active = db.query(func.count(Client.id)).filter(
        Client.company_id == current_user.company_id,
        Client.is_active == True
    ).scalar() or 0
    
    # New clients this month
    current_month = datetime.now().month
    current_year = datetime.now().year
    new_this_month = db.query(func.count(Client.id)).filter(
        Client.company_id == current_user.company_id,
        extract('month', Client.created_at) == current_month,
        extract('year', Client.created_at) == current_year
    ).scalar() or 0
    
    # TODO: Calculate revenue from invoices/orders when those models are ready
    total_revenue = Decimal("5250000")  # Placeholder
    avg_order_value = Decimal("35000")   # Placeholder
    
    # Top clients (placeholder)
    top_clients = [
        {"id": "C001", "name": "Entreprise Alpha", "revenue": 850000},
        {"id": "C002", "name": "Soci????t???? Beta", "revenue": 720000},
        {"id": "C003", "name": "Groupe Gamma", "revenue": 650000},
    ]
    
    return ClientStatsResponse(
        total_clients=total,
        active_clients=active,
        new_clients_this_month=new_this_month,
        total_revenue=total_revenue,
        average_order_value=avg_order_value,
        top_clients=top_clients
    )

@router.get("/{client_id}", response_model=ClientResponse)
async def get_client(
    client_id: str,
    current_user: TokenData = Depends(check_client_access),
    db: Session = Depends(get_db)
):
    """Get a specific client by ID"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return ClientResponse(
        id=str(client.id),
        name=client.name,
        email=client.email,
        phone=client.phone,
        address=client.address,
        city=client.city,
        postal_code=client.postal_code,
        country=client.country,
        tax_id=client.tax_id,
        credit_limit=client.credit_limit,
        payment_terms=client.payment_terms,
        is_active=client.is_active,
        created_at=client.created_at,
        updated_at=client.updated_at
    )

@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
async def create_client(
    request: ClientRequest,
    current_user: TokenData = Depends(check_client_access),
    db: Session = Depends(get_db)
):
    """Create a new client"""
    client = Client(
        company_id=current_user.company_id,
        name=request.name,
        email=request.email,
        phone=request.phone,
        address=request.address,
        city=request.city,
        postal_code=request.postal_code,
        country=request.country,
        tax_id=request.tax_id,
        credit_limit=request.credit_limit,
        payment_terms=request.payment_terms,
        is_active=True
    )
    
    db.add(client)
    db.commit()
    db.refresh(client)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "CLIENT_CREATED",
        "data": {
            "id": str(client.id),
            "name": client.name
        }
    }))

    # Audit Log
    log_audit(db, current_user, "CREATE", "CLIENT", str(client.id), {"name": client.name})
    db.commit()

    return ClientResponse(
        id=str(client.id),
        name=client.name,
        email=client.email,
        phone=client.phone,
        address=client.address,
        city=client.city,
        postal_code=client.postal_code,
        country=client.country,
        tax_id=client.tax_id,
        credit_limit=client.credit_limit,
        payment_terms=client.payment_terms,
        is_active=client.is_active,
        created_at=client.created_at,
        updated_at=client.updated_at
    )

@router.put("/{client_id}", response_model=ClientResponse)
async def update_client(
    client_id: str,
    request: ClientRequest,
    current_user: TokenData = Depends(check_client_access),
    db: Session = Depends(get_db)
):
    """Update an existing client"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Update fields
    for field, value in request.dict(exclude_unset=True).items():
        setattr(client, field, value)
    
    client.updated_at = datetime.now()
    db.commit()
    db.refresh(client)
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "CLIENT_UPDATED",
        "data": {
            "id": str(client.id),
            "name": client.name
        }
    }))

    # Audit Log
    log_audit(db, current_user, "UPDATE", "CLIENT", str(client.id), request.dict(exclude_unset=True))
    db.commit()

    return ClientResponse(
        id=str(client.id),
        name=client.name,
        email=client.email,
        phone=client.phone,
        address=client.address,
        city=client.city,
        postal_code=client.postal_code,
        country=client.country,
        tax_id=client.tax_id,
        credit_limit=client.credit_limit,
        payment_terms=client.payment_terms,
        is_active=client.is_active,
        created_at=client.created_at,
        updated_at=client.updated_at
    )

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: str,
    current_user: TokenData = Depends(check_client_access),
    db: Session = Depends(get_db)
):
    """Soft delete a client (mark as inactive)"""
    client = db.query(Client).filter(
        Client.id == client_id,
        Client.company_id == current_user.company_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client.is_active = False
    client.updated_at = datetime.now()
    db.commit()
    
    # Notify via WebSocket
    await manager.broadcast(json.dumps({
        "type": "CLIENT_DELETED",
        "data": {
            "id": str(client.id)
        }
    }))

    # Audit Log
    log_audit(db, current_user, "DELETE", "CLIENT", str(client_id))
    db.commit()

    return None
