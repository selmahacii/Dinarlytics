"""
Pydantic Schemas (DTOs) pour les réponses API
Cela sépare les modèles de base de données des structures API
"""

from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ===== AUTH & USER SCHEMAS =====
class RoleSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserBaseSchema(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    is_active: bool = True

    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Le nom doit contenir au moins 2 caractères')
        return v.strip()


class UserCreateSchema(UserBaseSchema):
    password: str = Field(..., min_length=8)

    @validator('password')
    def validate_password_strength(cls, v):
        if not any(c.isupper() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins une majuscule')
        if not any(c.isdigit() for c in v):
            raise ValueError('Le mot de passe doit contenir au moins un chiffre')
        return v


class UserResponseSchema(UserBaseSchema):
    id: int
    company_id: int
    roles: List[RoleSchema] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


# ===== COMPANY SCHEMAS =====
class CompanyBaseSchema(BaseModel):
    name: str
    siret: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None


class CompanyCreateSchema(CompanyBaseSchema):
    owner_email: EmailStr


class CompanyResponseSchema(CompanyBaseSchema):
    id: int
    created_at: datetime
    is_active: bool
    subscription_level: str

    class Config:
        from_attributes = True


# ===== INVOICE SCHEMAS =====
class InvoiceItemSchema(BaseModel):
    id: Optional[int] = None
    article_id: int
    quantity: float
    unit_price: float
    total_price: float = Field(..., description="quantity * unit_price")

    @validator('quantity', 'unit_price', 'total_price')
    def validate_positive(cls, v):
        if v < 0:
            raise ValueError('Les valeurs doivent être positives')
        return v


class InvoiceBaseSchema(BaseModel):
    number: str
    issue_date: datetime
    due_date: Optional[datetime] = None
    status: str = "draft"
    total_amount: float
    tax_amount: float
    net_amount: float
    notes: Optional[str] = None


class InvoiceCreateSchema(InvoiceBaseSchema):
    client_id: int
    items: List[InvoiceItemSchema]


class InvoiceResponseSchema(InvoiceBaseSchema):
    id: int
    client_id: int
    company_id: int
    user_id: int
    items: List[InvoiceItemSchema] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvoiceListResponseSchema(BaseModel):
    """Réponse paginated d'invoices"""
    total: int
    page: int
    page_size: int
    items: List[InvoiceResponseSchema]


# ===== CLIENT SCHEMAS =====
class ClientBaseSchema(BaseModel):
    code: str
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    is_active: bool = True


class ClientCreateSchema(ClientBaseSchema):
    pass


class ClientResponseSchema(ClientBaseSchema):
    id: int
    company_id: int
    total_purchases: float = 0
    last_purchase_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ===== FINANCIAL METRICS SCHEMAS =====
class CashFlowData(BaseModel):
    solde_actuel: float
    solde_itineraire: float
    entrees_30j: float
    sorties_30j: float
    flux_net_mensuel: float


class FinancialRatios(BaseModel):
    liquidite: float
    autonomie_financiere: float
    endettement: float
    solvabilite: float


class SalesData(BaseModel):
    mois: str
    valeur: float


class FinancialDashboardSchema(BaseModel):
    """Schéma complet du dashboard financier"""
    tresorerie: CashFlowData
    ventes_12_mois: List[SalesData]
    ratios: FinancialRatios
    ca_mois_courant: float
    profit_mois_courant: float
    created_at: datetime


# ===== ALERT SCHEMAS =====
class AlertDefinitionSchema(BaseModel):
    id: str
    name: str
    description: str
    status: str  # 'active' | 'inactive'
    threshold_value: float
    current_value: Optional[float] = None
    frequency: str  # 'daily' | 'weekly' | 'realtime'
    recipients: List[str] = []
    last_triggered: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertTriggerSchema(BaseModel):
    alert_id: str
    triggered_at: datetime
    exceeding_value: float
    recipients_notified: List[str]

    class Config:
        from_attributes = True


# ===== ERROR RESPONSE SCHEMAS =====
class ErrorSchema(BaseModel):
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ValidationErrorSchema(BaseModel):
    errors: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ===== PAGINATION SCHEMAS =====
class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: str = "desc"  # 'asc' | 'desc'


class PaginatedResponse(BaseModel):
    """Wrapper générique pour les réponses paginées"""
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[Any]


# ===== AUDIT LOG SCHEMAS =====
class AuditLogSchema(BaseModel):
    id: int
    user_id: int
    action: str
    entity_type: str
    entity_id: int
    changes: Dict[str, Any]
    ip_address: str
    user_agent: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===== HEALTH CHECK SCHEMAS =====
class HealthCheckResponse(BaseModel):
    status: str  # 'healthy' | 'degraded' | 'unhealthy'
    timestamp: datetime
    database: str = "ok"
    cache: str = "ok"
    message: Optional[str] = None


__all__ = [
    # Auth
    'UserCreateSchema',
    'UserResponseSchema',
    'UserBaseSchema',
    'TokenSchema',
    'LoginSchema',
    'RoleSchema',
    # Company
    'CompanyBaseSchema',
    'CompanyCreateSchema',
    'CompanyResponseSchema',
    # Invoice
    'InvoiceItemSchema',
    'InvoiceCreateSchema',
    'InvoiceResponseSchema',
    'InvoiceListResponseSchema',
    # Client
    'ClientBaseSchema',
    'ClientCreateSchema',
    'ClientResponseSchema',
    # Financial
    'CashFlowData',
    'FinancialRatios',
    'SalesData',
    'FinancialDashboardSchema',
    # Alerts
    'AlertDefinitionSchema',
    'AlertTriggerSchema',
    # Common
    'ErrorSchema',
    'ValidationErrorSchema',
    'PaginationParams',
    'PaginatedResponse',
    'AuditLogSchema',
    'HealthCheckResponse',
]
