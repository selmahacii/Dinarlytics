"""
Article API Endpoints - Product/Article Management and Statistics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from app.core.database import get_db
from app.core.models import Article, User
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData, RBACManager
from pydantic import BaseModel, Field
from app.modules.system.utils_audit import log_audit
import json

router = APIRouter(prefix="/articles", tags=["articles"])

# ========== REQUEST/RESPONSE MODELS ==========
class ArticleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    sku: Optional[str]
    barcode: Optional[str]
    category: Optional[str]
    unit_price: Decimal
    cost_price: Optional[Decimal]
    tax_rate: Optional[Decimal]
    stock_quantity: Optional[int]
    min_stock_level: Optional[int]
    is_active: bool
    created_at: str
    updated_at: str

class CreateArticleRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    unit_price: Decimal = Field(..., gt=0)
    cost_price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = Field(default=Decimal("19"), ge=0, le=100)
    stock_quantity: Optional[int] = Field(default=0, ge=0)
    min_stock_level: Optional[int] = Field(default=10, ge=0)

class UpdateArticleRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    stock_quantity: Optional[int] = None
    min_stock_level: Optional[int] = None
    is_active: Optional[bool] = None

class ArticleStatsResponse(BaseModel):
    total_articles: int
    active_articles: int
    low_stock_count: int
    out_of_stock_count: int
    total_inventory_value: Decimal
    categories: List[dict]
    top_selling: List[dict]

# ========== DEPENDENCIES ==========
async def check_article_access(
    current_user: TokenData = Depends(get_current_user)
):
    """Check if user has article access"""
    if not RBACManager.check_permission(current_user.roles, "read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Article access required"
        )
    return current_user

# ========== ARTICLE ENDPOINTS ==========
@router.get("/", response_model=List[ArticleResponse])
async def list_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    low_stock: Optional[bool] = Query(None),
    current_user: TokenData = Depends(check_article_access),
    db: Session = Depends(get_db)
):
    """List all articles with optional filtering"""
    query = db.query(Article).filter(Article.company_id == current_user.company_id)
    
    if search:
        query = query.filter(
            (Article.name.ilike(f"%{search}%")) |
            (Article.sku.ilike(f"%{search}%")) |
            (Article.barcode.ilike(f"%{search}%"))
        )
    
    if category:
        query = query.filter(Article.category == category)
    
    if is_active is not None:
        query = query.filter(Article.is_active == is_active)
    
    if low_stock:
        query = query.filter(Article.stock_quantity <= Article.min_stock_level)
    
    articles = query.order_by(Article.name).offset(skip).limit(limit).all()
    
    return [
        ArticleResponse(
            id=str(a.id),
            name=a.name,
            description=a.description,
            sku=a.sku,
            barcode=a.barcode,
            category=a.category,
            unit_price=a.unit_price,
            cost_price=a.cost_price,
            tax_rate=a.tax_rate,
            stock_quantity=a.stock_quantity,
            min_stock_level=a.min_stock_level,
            is_active=a.is_active,
            created_at=a.created_at.isoformat() if a.created_at else "",
            updated_at=a.updated_at.isoformat() if a.updated_at else ""
        )
        for a in articles
    ]

@router.get("/stats", response_model=ArticleStatsResponse)
async def get_article_stats(
    current_user: TokenData = Depends(check_article_access),
    db: Session = Depends(get_db)
):
    """Get article statistics"""
    from sqlalchemy import func
    
    # Total articles
    total_articles = db.query(func.count(Article.id)).filter(
        Article.company_id == current_user.company_id
    ).scalar() or 0
    
    # Active articles
    active_articles = db.query(func.count(Article.id)).filter(
        Article.company_id == current_user.company_id,
        Article.is_active == True
    ).scalar() or 0
    
    # Low stock count
    low_stock_count = db.query(func.count(Article.id)).filter(
        Article.company_id == current_user.company_id,
        Article.stock_quantity <= Article.min_stock_level,
        Article.stock_quantity > 0
    ).scalar() or 0
    
    # Out of stock count
    out_of_stock_count = db.query(func.count(Article.id)).filter(
        Article.company_id == current_user.company_id,
        Article.stock_quantity == 0
    ).scalar() or 0
    
    # Total inventory value
    articles = db.query(Article).filter(
        Article.company_id == current_user.company_id,
        Article.is_active == True
    ).all()
    
    total_inventory_value = sum(
        (a.unit_price or Decimal(0)) * (a.stock_quantity or 0)
        for a in articles
    )
    
    # Categories distribution
    categories_query = db.query(
        Article.category,
        func.count(Article.id).label('count')
    ).filter(
        Article.company_id == current_user.company_id
    ).group_by(Article.category).all()
    
    categories = [
        {"name": cat or "Sans cat????gorie", "count": count}
        for cat, count in categories_query
    ]
    
    from app.core.models import InvoiceItem, Invoice
    top_selling_rows = db.query(
        Article.id, Article.name,
        func.sum(InvoiceItem.quantity).label('total_qty')
    ).join(InvoiceItem, InvoiceItem.article_id == Article.id).join(Invoice, Invoice.id == InvoiceItem.invoice_id).filter(
        Article.company_id == current_user.company_id,
        Invoice.status != 'annulee'
    ).group_by(Article.id, Article.name).order_by(func.sum(InvoiceItem.quantity).desc()).limit(5).all()
    
    top_selling = [{"id": str(r.id), "name": r.name, "quantity": float(r.total_qty or 0)} for r in top_selling_rows]
    
    # Fallback to top stocked articles if no sales data
    if not top_selling:
        top_stocked = db.query(Article).filter(
            Article.company_id == current_user.company_id,
            Article.is_active == True
        ).order_by(Article.stock_quantity.desc()).limit(5).all()
        top_selling = [{"id": str(a.id), "name": a.name, "quantity": float(a.stock_quantity or 0)} for a in top_stocked]
    
    return ArticleStatsResponse(
        total_articles=total_articles,
        active_articles=active_articles,
        low_stock_count=low_stock_count,
        out_of_stock_count=out_of_stock_count,
        total_inventory_value=total_inventory_value,
        categories=categories,
        top_selling=top_selling
    )

@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    current_user: TokenData = Depends(check_article_access),
    db: Session = Depends(get_db)
):
    """Get a specific article by ID"""
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.company_id == current_user.company_id
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return ArticleResponse(
        id=str(article.id),
        name=article.name,
        description=article.description,
        sku=article.sku,
        barcode=article.barcode,
        category=article.category,
        unit_price=article.unit_price,
        cost_price=article.cost_price,
        tax_rate=article.tax_rate,
        stock_quantity=article.stock_quantity,
        min_stock_level=article.min_stock_level,
        is_active=article.is_active,
        created_at=article.created_at.isoformat() if article.created_at else "",
        updated_at=article.updated_at.isoformat() if article.updated_at else ""
    )

@router.post("/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    request: CreateArticleRequest,
    current_user: TokenData = Depends(check_article_access),
    db: Session = Depends(get_db)
):
    """Create a new article"""
    # Check if article with same SKU already exists
    if request.sku:
        existing = db.query(Article).filter(
            Article.company_id == current_user.company_id,
            Article.sku == request.sku
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Article with this SKU already exists"
            )
    
    article = Article(
        company_id=current_user.company_id,
        name=request.name,
        description=request.description,
        sku=request.sku,
        barcode=request.barcode,
        category=request.category,
        unit_price=request.unit_price,
        cost_price=request.cost_price,
        tax_rate=request.tax_rate,
        stock_quantity=request.stock_quantity,
        min_stock_level=request.min_stock_level,
        is_active=True
    )
    
    db.add(article)
    db.commit()
    db.refresh(article)
    
    # Audit Log
    log_audit(db, current_user, "CREATE", "ARTICLE", str(article.id), {"name": article.name})
    db.commit()
    
    return ArticleResponse(
        id=str(article.id),
        name=article.name,
        description=article.description,
        sku=article.sku,
        barcode=article.barcode,
        category=article.category,
        unit_price=article.unit_price,
        cost_price=article.cost_price,
        tax_rate=article.tax_rate,
        stock_quantity=article.stock_quantity,
        min_stock_level=article.min_stock_level,
        is_active=article.is_active,
        created_at=article.created_at.isoformat() if article.created_at else "",
        updated_at=article.updated_at.isoformat() if article.updated_at else ""
    )

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: str,
    request: UpdateArticleRequest,
    current_user: TokenData = Depends(check_article_access),
    db: Session = Depends(get_db)
):
    """Update an existing article"""
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.company_id == current_user.company_id
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Update fields
    update_data = request.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(article, field, value)
    
    article.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(article)
    
    # Audit Log
    log_audit(db, current_user, "UPDATE", "ARTICLE", str(article.id), request.dict(exclude_unset=True))
    db.commit()
    
    return ArticleResponse(
        id=str(article.id),
        name=article.name,
        description=article.description,
        sku=article.sku,
        barcode=article.barcode,
        category=article.category,
        unit_price=article.unit_price,
        cost_price=article.cost_price,
        tax_rate=article.tax_rate,
        stock_quantity=article.stock_quantity,
        min_stock_level=article.min_stock_level,
        is_active=article.is_active,
        created_at=article.created_at.isoformat() if article.created_at else "",
        updated_at=article.updated_at.isoformat() if article.updated_at else ""
    )

@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: str,
    current_user: TokenData = Depends(check_article_access),
    db: Session = Depends(get_db)
):
    """Soft delete an article (set is_active to False)"""
    article = db.query(Article).filter(
        Article.id == article_id,
        Article.company_id == current_user.company_id
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Soft delete
    article.is_active = False
    article.updated_at = datetime.utcnow()
    
    db.commit()
    
    # Audit Log
    log_audit(db, current_user, "DELETE", "ARTICLE", str(article_id))
    db.commit()
    
    return None
