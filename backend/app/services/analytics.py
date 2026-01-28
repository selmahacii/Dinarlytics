from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from decimal import Decimal
from typing import Dict, Any, List
from app.models import Invoice, Payment, FinancialStatement, AIModel, AIPrediction
from app.services.calculations import AlgerianFinancialCalculator

class AnalyticService:
    """
    Unified engine for KPIs and graphs.
    Eliminates duplication by centralizing financial business logic.
    """

    @staticmethod
    def get_financial_health_kpis(db: Session, company_id: Any) -> Dict[str, Any]:
        """Calculates core KPIs using SCF standards."""
        # Get latest stats
        sales_total = db.query(func.sum(Invoice.total_ttc)).filter(
            Invoice.company_id == company_id, 
            Invoice.statut != 'annulee'
        ).scalar() or Decimal('0')
        
        payments_total = db.query(func.sum(Payment.amount)).filter(
            Payment.company_id == company_id
        ).scalar() or Decimal('0')
        
        ar_total = sales_total - payments_total # Accounts Receivable
        
        # Last statement for deeper analysis
        statement = db.query(FinancialStatement).filter(
            FinancialStatement.company_id == company_id
        ).order_by(FinancialStatement.exercice.desc()).first()
        
        # Marge Net Correcte (SCF)
        margin_net = Decimal('0')
        if sales_total > 0 and statement:
             margin_net = (statement.net_income / sales_total) * 100
             
        return {
            "total_sales": float(sales_total),
            "accounts_receivable": float(ar_total),
            "collection_rate": float((payments_total / sales_total * 100) if sales_total > 0 else 0),
            "margin_net_pct": float(margin_net),
            "currency": "DZD"
        }

    @staticmethod
    def get_revenue_chart_data(db: Session, company_id: Any, periods: int = 6) -> List[Dict[str, Any]]:
        """Unified logic for revenue graphs."""
        # This prevents various frontend components from having different chart logic
        # Aggregate by month
        results = db.query(
            func.to_char(Invoice.date_emission, 'YYYY-MM').label('month'),
            func.sum(Invoice.total_ht).label('revenue_ht')
        ).filter(
            Invoice.company_id == company_id,
            Invoice.statut != 'annulee'
        ).group_by('month').order_by('month').limit(periods).all()
        
        return [{"period": r.month, "value": float(r.revenue_ht)} for r in results]

    @staticmethod
    def get_smart_alerts(db: Session, company_id: Any) -> List[Dict[str, Any]]:
        """Detection of financial anomalies or risks."""
        alerts = []
        
        # 1. DSO Alert (Delay of Payment)
        # Simplified logic: If AR > 50% of annual revenue
        health = AnalyticService.get_financial_health_kpis(db, company_id)
        if health["accounts_receivable"] > (health["total_sales"] * 0.5):
            alerts.append({
                "type": "danger",
                "title": "Risque de Liquidité",
                "message": "Vos créances clients dépassent 50% de votre CA annuel. Action requise sur le recouvrement.",
                "code": "HIGH_AR"
            })
            
        # 2. Fiscal Deadline (G50)
        today = func.now()
        # Logic to check if 20th of month is near
        
        return alerts
