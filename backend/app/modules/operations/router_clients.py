"""
Client API Endpoints - Client management, statistics, and analysis
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
import json

from app.core.database import get_db
from app.core.models import Client
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData, RBACManager
from pydantic import BaseModel, EmailStr
from app.core.websocket import manager
from app.modules.system.utils_audit import log_audit

router = APIRouter(prefix="/clients", tags=["clients"])

# ========== REQUEST/RESPONSE MODELS ==========
class ClientRequest(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = "Algerie"
    tax_id: Optional[str] = None
    credit_limit: Optional[Decimal] = None
    payment_terms: Optional[int] = 30
    notes: Optional[str] = None
    sector: Optional[str] = None
    size: Optional[str] = None
    risk_category: Optional[str] = "faible"
    state: Optional[str] = None

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
    sector: Optional[str]
    size: Optional[str]
    risk_category: Optional[str]
    state: Optional[str]
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
            sector=c.sector,
            size=c.size,
            risk_category=c.risk_category,
            state=c.state.value if c.state else None,
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
    
    total_revenue = Decimal("5250000")  # Placeholder
    avg_order_value = Decimal("35000")   # Placeholder
    
    top_clients = [
        {"id": "C001", "name": "Entreprise Alpha", "revenue": 850000},
        {"id": "C002", "name": "Société Beta", "revenue": 720000},
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
        sector=client.sector,
        size=client.size,
        risk_category=client.risk_category,
        state=client.state.value if client.state else None,
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
        sector=request.sector,
        size=request.size,
        risk_category=request.risk_category,
        state=request.state,
        is_active=True
    )
    
    db.add(client)
    db.commit()
    db.refresh(client)
    
    await manager.broadcast(json.dumps({
        "type": "CLIENT_CREATED",
        "data": {"id": str(client.id), "name": client.name}
    }))

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
        sector=client.sector,
        size=client.size,
        risk_category=client.risk_category,
        state=client.state.value if client.state else None,
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
    
    for field, value in request.dict(exclude_unset=True).items():
        setattr(client, field, value)
    
    client.updated_at = datetime.now()
    db.commit()
    db.refresh(client)
    
    await manager.broadcast(json.dumps({
        "type": "CLIENT_UPDATED",
        "data": {"id": str(client.id), "name": client.name}
    }))

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
        sector=client.sector,
        size=client.size,
        risk_category=client.risk_category,
        state=client.state.value if client.state else None,
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
    
    await manager.broadcast(json.dumps({
        "type": "CLIENT_DELETED",
        "data": {"id": str(client.id)}
    }))

    log_audit(db, current_user, "DELETE", "CLIENT", str(client_id))
    db.commit()

    return None

@router.get("/groups")
async def list_client_groups(
    current_user: TokenData = Depends(check_client_access),
    db: Session = Depends(get_db)
):
    """Categorize clients into groups for CRM analysis"""
    from sqlalchemy import func
    
    sectors = db.query(
        Client.sector, 
        func.count(Client.id).label('count')
    ).filter(Client.company_id == current_user.company_id).group_by(Client.sector).all()
    
    sizes = db.query(
        Client.size, 
        func.count(Client.id).label('count')
    ).filter(Client.company_id == current_user.company_id).group_by(Client.size).all()
    
    risks = db.query(
        Client.risk_category, 
        func.count(Client.id).label('count')
    ).filter(Client.company_id == current_user.company_id).group_by(Client.risk_category).all()
    
    regions = db.query(
        Client.state, 
        func.count(Client.id).label('count')
    ).filter(Client.company_id == current_user.company_id).group_by(Client.state).all()

    return {
        "secteurs": [{"name": s.sector or "Non défini", "count": s.count} for s in sectors],
        "tailles": [{"name": s.size or "Non défini", "count": s.count} for s in sizes],
        "risques": [{"name": s.risk_category or "faible", "count": s.count} for s in risks],
        "regions": [{"name": s.state.value if s.state else "Non défini", "count": s.count} for s in regions]
    }
