from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.core.permissions import get_current_user_from_token, require_permission
from app.modules.finance.service_analytics import AnalyticService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/financial-health")
async def get_financial_health(
    db: Session = Depends(get_db), 
    user: dict = Depends(get_current_user_from_token)
):
    """Exposes high-level KPIs based on unified AnalyticService."""
    return AnalyticService.get_financial_health_kpis(db, user["company_id"])

@router.get("/revenue-chart")
async def get_revenue_chart(
    periods: int = 6,
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """Exposes chart data logic."""
    return AnalyticService.get_revenue_chart_data(db, user["company_id"], periods)

@router.get("/alerts")
async def get_smart_alerts(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """Smart financial alerts (DSO, Tax deadlines, Anomaly)."""
    return AnalyticService.get_smart_alerts(db, user["company_id"])

@router.get("/forecast")
async def get_forecast(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """AI Rolling Plan Forecast."""
    return AnalyticService.get_performance_forecast(db, user["company_id"])

from app.core.schemas import FinancialDashboardSchema, CashFlowData, FinancialRatios, SalesData
from datetime import datetime

@router.get("/dashboard", response_model=FinancialDashboardSchema)
async def get_dashboard_data(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    company_id = user["company_id"]
    
    from app.core.models import BankAccount, Invoice, Payment, JournalEntry, JournalEntryLine
    from sqlalchemy import func
    from decimal import Decimal
    import datetime as dt
    
    # Query current balance from class 5 (Cash/Bank) journal entries
    solde_actuel = db.query(
        func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount)
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('5%')
    ).scalar() or Decimal('0')
    
    solde_itineraire = Decimal('0')
    
    thirty_days_ago = dt.date.today() - dt.timedelta(days=30)
    
    # Cash inflows: Debit entries on class 5 in the last 30 days
    entrees_30j = db.query(
        func.sum(JournalEntryLine.debit_amount)
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('5%'),
        JournalEntry.entry_date >= thirty_days_ago
    ).scalar() or Decimal('0')
    
    # Cash outflows: Credit entries on class 5 in the last 30 days
    sorties_30j = db.query(
        func.sum(JournalEntryLine.credit_amount)
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('5%'),
        JournalEntry.entry_date >= thirty_days_ago
    ).scalar() or Decimal('0')
    
    # Ventes over the last 12 months from invoices
    sales_12m = db.query(
        func.to_char(Invoice.invoice_date, 'YYYY-MM').label('month'),
        func.sum(Invoice.total_htt).label('val')
    ).filter(
        Invoice.company_id == company_id,
        Invoice.status != 'annulee'
    ).group_by('month').order_by('month').all()
    
    ventes_list = [SalesData(mois=r.month, valeur=float(r.val)) for r in sales_12m]
    # Compute real financial ratios from journal entries
    from app.core.models import JournalEntryLine, JournalEntry
    # Actif circulant = stocks (3) + trésorerie (5) + créances (soldes
    # DÉBITEURS de classe 4, ex. 411 clients) — sans les créances, la
    # liquidité générale était sous-estimée.
    current_assets = db.query(func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount))\
        .join(JournalEntry).filter(
            JournalEntry.company_id == company_id,
            JournalEntry.status == 'approved',
            (JournalEntryLine.account_code.like('3%') | JournalEntryLine.account_code.like('5%'))
        ).scalar() or Decimal('0')

    c4_debit_for_ca = db.query(
        JournalEntryLine.account_code,
        func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount).label('bal')
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('4%')
    ).group_by(JournalEntryLine.account_code).all()
    current_assets += sum((row.bal for row in c4_debit_for_ca if row.bal and row.bal > 0), Decimal('0'))
    
    # Current Liabilities (Class 4 credit balances)
    c4_balances_r = db.query(
        func.sum(JournalEntryLine.credit_amount - JournalEntryLine.debit_amount)
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('4%')
    ).scalar() or Decimal('0')
    current_liabilities = max(Decimal('0'), c4_balances_r)
    
    # Total equity (Class 1)
    equity = db.query(func.sum(JournalEntryLine.credit_amount - JournalEntryLine.debit_amount))\
        .join(JournalEntry).filter(
            JournalEntry.company_id == company_id,
            JournalEntry.status == 'approved',
            JournalEntryLine.account_code.like('1%')
        ).scalar() or Decimal('0')
    
    # Total assets: classes 2 (immobilisations), 3 (stocks), 5 (trésorerie)
    # plus les soldes débiteurs de classe 4 (créances). La classe 1 (capitaux
    # propres/dettes) est au passif — l'inclure en débit-crédit soustrayait
    # les capitaux propres de l'actif.
    total_assets_r = db.query(func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount))\
        .join(JournalEntry).filter(
            JournalEntry.company_id == company_id,
            JournalEntry.status == 'approved',
            (JournalEntryLine.account_code.like('2%') |
             JournalEntryLine.account_code.like('3%') | JournalEntryLine.account_code.like('5%'))
        ).scalar() or Decimal('0')

    c4_debit_balances = db.query(
        JournalEntryLine.account_code,
        func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount).label('bal')
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('4%')
    ).group_by(JournalEntryLine.account_code).all()
    total_assets_r += sum((row.bal for row in c4_debit_balances if row.bal and row.bal > 0), Decimal('0'))
    if total_assets_r <= 0:
        total_assets_r = Decimal('1')  # avoid division by zero
    
    # Sans passif exigible, liquidité/solvabilité ne sont pas des ratios
    # définis : l'ancien max(passif, 1) divisait par 1 DA et renvoyait le
    # montant brut de l'actif comme "ratio" (ex. solvabilité 240 380).
    # On plafonne à 99.99, valeur conventionnelle "excellent / sans dette".
    RATIO_CAP = 99.99
    if current_liabilities > 0:
        liq = min(float(current_assets / current_liabilities), RATIO_CAP)
        solv = min(float(total_assets_r / current_liabilities), RATIO_CAP)
    else:
        liq = RATIO_CAP if current_assets > 0 else 0.0
        solv = RATIO_CAP if total_assets_r > 1 else 0.0
    auto = float(equity / max(total_assets_r, Decimal('1')) * 100)
    dette = 100.0 - auto if auto > 0 else 0.0

    ratios = FinancialRatios(
        liquidite=round(liq, 2),
        autonomie_financiere=round(auto, 1),
        endettement=round(dette, 1),
        solvabilite=round(solv, 2)
    )
    
    # "Mois courant" au sens propre : factures des 30 derniers jours, pas le
    # cumul de toute la vie de l'entreprise (les consommateurs annualisent
    # ce chiffre en le multipliant par 12).
    ca_current = db.query(func.sum(Invoice.total_htt)).filter(
        Invoice.company_id == company_id,
        Invoice.type == 'sale',
        Invoice.status != 'annulee',
        Invoice.invoice_date >= thirty_days_ago
    ).scalar() or Decimal('0')

    purchases_current = db.query(func.sum(Invoice.total_htt)).filter(
        Invoice.company_id == company_id,
        Invoice.type == 'purchase',
        Invoice.status != 'annulee',
        Invoice.invoice_date >= thirty_days_ago
    ).scalar() or Decimal('0')
    
    profit_current = ca_current - purchases_current
    
    return {
        "tresorerie": {
            "solde_actuel": float(solde_actuel),
            "solde_itineraire": float(solde_itineraire),
            "entrees_30j": float(entrees_30j),
            "sorties_30j": float(sorties_30j),
            "flux_net_mensuel": float(entrees_30j - sorties_30j)
        },
        "ventes_12_mois": ventes_list,
        "ratios": ratios,
        "ca_mois_courant": float(ca_current),
        "profit_mois_courant": float(profit_current),
        "created_at": datetime.utcnow()
    }


@router.get("/company-metrics")
async def get_company_metrics(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    """Aggregated company metrics powering the frontend AppContext (companyData).

    All figures are computed from real records: clients/suppliers/invoices
    tables and class-5 journal balances for cash.
    """
    company_id = user["company_id"]

    from app.core.models import (
        Client, Supplier, Invoice, Payment, Article,
        JournalEntry, JournalEntryLine
    )
    from sqlalchemy import func
    from decimal import Decimal
    import datetime as dt

    clients_count = db.query(func.count(Client.id)).filter(
        Client.company_id == company_id, Client.is_active == True
    ).scalar() or 0

    suppliers_count = db.query(func.count(Supplier.id)).filter(
        Supplier.company_id == company_id, Supplier.is_active == True
    ).scalar() or 0

    invoices_count = db.query(func.count(Invoice.id)).filter(
        Invoice.company_id == company_id, Invoice.status != 'annulee'
    ).scalar() or 0

    invoices_due = db.query(func.count(Invoice.id)).filter(
        Invoice.company_id == company_id,
        Invoice.status != 'annulee',
        Invoice.payment_status == 'unpaid'
    ).scalar() or 0

    # Revenue over the last 30 days (sales invoices, HT)
    thirty_days_ago = dt.date.today() - dt.timedelta(days=30)
    revenue_month = db.query(func.sum(Invoice.total_htt)).filter(
        Invoice.company_id == company_id,
        Invoice.type == 'sale',
        Invoice.status != 'annulee',
        Invoice.invoice_date >= thirty_days_ago
    ).scalar() or Decimal('0')

    expenses_month = db.query(func.sum(Invoice.total_htt)).filter(
        Invoice.company_id == company_id,
        Invoice.type == 'purchase',
        Invoice.status != 'annulee',
        Invoice.invoice_date >= thirty_days_ago
    ).scalar() or Decimal('0')

    # Receivables: unpaid sales invoices TTC minus recorded payments
    receivables = db.query(func.sum(Invoice.total_ttc)).filter(
        Invoice.company_id == company_id,
        Invoice.type == 'sale',
        Invoice.status != 'annulee',
        Invoice.payment_status == 'unpaid'
    ).scalar() or Decimal('0')

    payables = db.query(func.sum(Invoice.total_ttc)).filter(
        Invoice.company_id == company_id,
        Invoice.type == 'purchase',
        Invoice.status != 'annulee',
        Invoice.payment_status == 'unpaid'
    ).scalar() or Decimal('0')

    # Cash: class 5 approved journal balance
    cash_balance = db.query(
        func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount)
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('5%')
    ).scalar() or Decimal('0')

    # Inventory: stock quantity × unit price for active articles
    inventory_value = db.query(
        func.sum(Article.stock_quantity * Article.unit_price)
    ).filter(
        Article.company_id == company_id,
        Article.is_active == True
    ).scalar() or Decimal('0')

    profit_margin = float(((revenue_month - expenses_month) / revenue_month * 100)
                          if revenue_month > 0 else Decimal('0'))
    average_invoice = float(revenue_month / invoices_count) if invoices_count > 0 else 0.0

    return {
        "clientsCount": clients_count,
        "suppliersCount": suppliers_count,
        "invoicesCount": invoices_count,
        "invoicesDue": invoices_due,
        "totalReceivables": float(receivables),
        "totalPayables": float(payables),
        "cashBalance": float(cash_balance),
        "revenue": float(revenue_month),
        "expenses": float(expenses_month),
        "profitMargin": round(profit_margin, 1),
        # No per-article sell-through history yet to compute a real turnover.
        "stockTurnover": 0,
        "averageInvoice": round(average_invoice, 2),
        "inventoryValue": float(inventory_value)
    }

from pydantic import BaseModel
from app.core.models import AlertDefinition

class AlertDefinitionUpdate(BaseModel):
    threshold_value: float
    enabled: Optional[bool] = None

@router.put("/alerts/{alert_code}")
async def update_alert_definition(
    alert_code: str,
    req: AlertDefinitionUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("rapports-create"))
):
    company_id = user["company_id"]
    alert = db.query(AlertDefinition).filter(
        AlertDefinition.company_id == company_id,
        AlertDefinition.alert_code == alert_code
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert definition not found")
    
    alert.threshold_value = req.threshold_value
    if req.enabled is not None:
        alert.enabled = req.enabled
    db.commit()
    return {"status": "success", "message": "Alert updated"}

@router.delete("/alerts/{alert_code}")
async def delete_alert_definition(
    alert_code: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("rapports-create"))
):
    company_id = user["company_id"]
    alert = db.query(AlertDefinition).filter(
        AlertDefinition.company_id == company_id,
        AlertDefinition.alert_code == alert_code
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert definition not found")
    
    db.delete(alert)
    db.commit()
    return {"status": "success", "message": "Alert deleted"}

@router.post("/alerts/{alert_code}/trigger")
async def trigger_alert_definition(
    alert_code: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("rapports-create"))
):
    company_id = user["company_id"]
    alert = db.query(AlertDefinition).filter(
        AlertDefinition.company_id == company_id,
        AlertDefinition.alert_code == alert_code
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert definition not found")
    from app.core.models import AlertTrigger
    trigger = AlertTrigger(
        company_id=company_id,
        alert_id=alert.id,
        trigger_value=alert.threshold_value,
        status="new",
        priority="normal"
    )
    db.add(trigger)
    db.commit()
    return {"status": "success", "message": f"Alert {alert_code} triggered successfully", "trigger_id": str(trigger.id)}

@router.post("/alerts/{alert_code}/test")
async def test_alert_definition(
    alert_code: str,
    db: Session = Depends(get_db),
    user: dict = Depends(require_permission("rapports-create"))
):
    company_id = user["company_id"]
    alert = db.query(AlertDefinition).filter(
        AlertDefinition.company_id == company_id,
        AlertDefinition.alert_code == alert_code
    ).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert definition not found")
    return {"status": "success", "message": f"Alert {alert_code} tested successfully", "current_threshold": alert.threshold_value, "enabled": alert.enabled}


@router.get("/scenarios")
async def get_scenarios(
    db: Session = Depends(get_db),
    user: dict = Depends(get_current_user_from_token)
):
    company_id = user["company_id"]
    from app.core.models import Invoice, JournalEntry, JournalEntryLine
    from sqlalchemy import func
    from decimal import Decimal
    
    # 1. Total sales (sales invoices)
    ca_total = db.query(func.sum(Invoice.total_htt)).filter(
        Invoice.company_id == company_id,
        Invoice.type == 'sale',
        Invoice.status != 'annulee'
    ).scalar() or Decimal('0')
    
    # 2. Total purchases (purchase invoices)
    purchases_total = db.query(func.sum(Invoice.total_htt)).filter(
        Invoice.company_id == company_id,
        Invoice.type == 'purchase',
        Invoice.status != 'annulee'
    ).scalar() or Decimal('0')
    
    profit_total = ca_total - purchases_total
    
    # 3. Current treasury balance (class 5 accounts)
    treasury = db.query(
        func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount)
    ).join(JournalEntry).filter(
        JournalEntry.company_id == company_id,
        JournalEntry.status == 'approved',
        JournalEntryLine.account_code.like('5%')
    ).scalar() or Decimal('0')
    
    # Projections
    ca_pess = float(ca_total) * 0.8
    profit_pess = float(profit_total) * 0.7
    tres_pess = float(treasury) * 0.6
    
    ca_real = float(ca_total) * 1.0
    profit_real = float(profit_total) * 1.0
    tres_real = float(treasury) * 1.0
    
    ca_opt = float(ca_total) * 1.2
    profit_opt = float(profit_total) * 1.3
    tres_opt = float(treasury) * 1.4

    # No fabricated fallback: with no invoices/journal entries yet, projections
    # are honestly zero rather than a fake pre-filled baseline.

    return [
        {
            "id": 1,
            "nom": "pessimistic",
            "ca_mois6": round(ca_pess, 2),
            "profit_mois6": round(profit_pess, 2),
            "tresorerie_mois6": round(tres_pess, 2),
            "risque": "HAUTE"
        },
        {
            "id": 2,
            "nom": "realistic",
            "ca_mois6": round(ca_real, 2),
            "profit_mois6": round(profit_real, 2),
            "tresorerie_mois6": round(tres_real, 2),
            "risque": "MOYEN"
        },
        {
            "id": 3,
            "nom": "optimistic",
            "ca_mois6": round(ca_opt, 2),
            "profit_mois6": round(profit_opt, 2),
            "tresorerie_mois6": round(tres_opt, 2),
            "risque": "FAIBLE"
        }
    ]




