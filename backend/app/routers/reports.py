from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# ============ Pydantic Models ============

class SalesKpis(BaseModel):
    ca: dict  # { value, change, trend }
    margeBrute: float
    facturesEmises: int
    panierMoyen: float
    tauxRemise: float
    clientsActifs: int
    nouveauxClients: int

class ProductPerformance(BaseModel):
    name: str
    sales: float
    percentage: float
    quantity: int
    evolution: float

class CategorySplit(BaseModel):
    category: str
    amount: float
    percentage: float
    color: str
    trend: int

class ClientSummary(BaseModel):
    name: str
    sales: float
    orders: int
    avgBasket: float
    trend: int

class ClientMetrics(BaseModel):
    totalClients: int
    clientsActifs: int
    nouveauxClients: int
    dsoMoyen: float
    tauxImpayes: float
    tauxFidelisation: float

class SalesReportResponse(BaseModel):
    salesData: SalesKpis
    topProducts: List[ProductPerformance]
    salesByCategory: List[CategorySplit]
    topClients: List[ClientSummary]
    clientMetrics: ClientMetrics

# ============ Endpoints ============

@router.get("/sales", response_model=SalesReportResponse, tags=["reports"])
async def get_sales_report(period: str = Query("mois", description="jour, semaine, mois, trimestre, annee")):
    """
    Fetch sales analytics and client performance data.
    Returns sales KPIs, top products, category splits, and client metrics.
    """
    try:
        # TODO: Query database for actual sales data based on period
        # For now, return sample data structure
        return {
            "salesData": {
                "ca": {"value": 142000, "change": 13.6, "trend": "up"},
                "margeBrute": 42.8,
                "facturesEmises": 215,
                "panierMoyen": 660,
                "tauxRemise": 3.2,
                "clientsActifs": 215,
                "nouveauxClients": 28
            },
            "topProducts": [
                {"name": "Product 1", "sales": 28800, "percentage": 20.3, "quantity": 48, "evolution": 15},
                {"name": "Product 2", "sales": 27200, "percentage": 19.2, "quantity": 40, "evolution": 12}
            ],
            "salesByCategory": [
                {"category": "Category A", "amount": 50280, "percentage": 35.4, "color": "bg-slate-700", "trend": 28}
            ],
            "topClients": [
                {"name": "Client 1", "sales": 28800, "orders": 48, "avgBasket": 600, "trend": 15}
            ],
            "clientMetrics": {
                "totalClients": 215,
                "clientsActifs": 215,
                "nouveauxClients": 28,
                "dsoMoyen": 28.5,
                "tauxImpayes": 3.2,
                "tauxFidelisation": 87.5
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TreasuryData(BaseModel):
    soldeBanque: float
    soldeCaisse: float
    soldeTotal: float
    fluxEntrants: float
    fluxSortants: float
    soldeNet: float
    previsionTresorerie: List[dict]
    repartitionFlux: List[dict]
    repartitionSorties: List[dict]

@router.get("/treasury", response_model=TreasuryData, tags=["reports"])
async def get_treasury_report(period: str = Query("mois")):
    """
    Fetch treasury and cash flow data.
    Returns bank balance, cash predictions, and fund distribution.
    """
    try:
        # TODO: Query database for actual treasury data
        return {
            "soldeBanque": 5000000,
            "soldeCaisse": 750000,
            "soldeTotal": 5750000,
            "fluxEntrants": 2000000,
            "fluxSortants": 1500000,
            "soldeNet": 500000,
            "previsionTresorerie": [
                {"mois": "Mois actuel", "solde": 5750000},
                {"mois": "Mois +1", "solde": 6210000}
            ],
            "repartitionFlux": [
                {"type": "Encaissements clients", "montant": 1700000, "part": 85, "couleur": "from-emerald-500"}
            ],
            "repartitionSorties": [
                {"type": "Achats fournisseurs", "montant": 750000, "part": 50, "couleur": "from-red-500"}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AccountingStatement(BaseModel):
    produits: float
    charges: float
    resultatNet: float
    actifTotal: float
    actifCirculant: float
    actifImmobilise: float
    passifTotal: float
    capitauxPropres: float
    dettes: float
    ratioLiquidite: str
    ratioRentabilite: str
    ratioAutonomie: str
    ratioEndettement: str
    repartitionCharges: List[dict]

@router.get("/accounting-statements", response_model=AccountingStatement, tags=["reports"])
async def get_accounting_statements(period: str = Query("mois")):
    """
    Fetch accounting statements (balance sheet, income statement).
    Returns assets, liabilities, equity, and financial ratios.
    """
    try:
        # TODO: Query database for actual accounting data
        return {
            "produits": 142000,
            "charges": 92300,
            "resultatNet": 49700,
            "actifTotal": 355000,
            "actifCirculant": 213000,
            "actifImmobilise": 142000,
            "passifTotal": 355000,
            "capitauxPropres": 195250,
            "dettes": 159750,
            "ratioLiquidite": "1.33",
            "ratioRentabilite": "35.0",
            "ratioAutonomie": "55.0",
            "ratioEndettement": "81.9",
            "repartitionCharges": [
                {"type": "Achats", "montant": 50765, "part": 55, "couleur": "from-red-500"}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PurchaseReport(BaseModel):
    totalPurchases: float
    supplierCount: int
    period: str
    topSuppliers: List[dict]
    purchasesByCategory: List[dict]

@router.get("/purchases", response_model=PurchaseReport, tags=["reports"])
async def get_purchase_report(period: str = Query("mois")):
    """
    Fetch purchase analytics and supplier performance data.
    Returns total purchases, supplier rankings, and category distribution.
    """
    try:
        # TODO: Query database for actual purchase data
        return {
            "totalPurchases": 95000,
            "supplierCount": 8,
            "period": period,
            "topSuppliers": [
                {"name": "Supplier 1", "purchases": 28500, "percentage": 30.0, "trend": 15}
            ],
            "purchasesByCategory": [
                {"category": "Raw Materials", "amount": 47500, "percentage": 50.0, "color": "bg-slate-700", "trend": 12}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
