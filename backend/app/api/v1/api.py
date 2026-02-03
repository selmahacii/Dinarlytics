from fastapi import APIRouter
from app.modules.intelligence.router_ai import router as ai_router
from app.modules.intelligence.router_training import router as training_router
from app.modules.intelligence.router_ocr import router as ocr_router
from app.modules.finance.router_accounting import router as accounting_router
from app.modules.finance.router_accounting_reports import router as accounting_reports_router
from app.modules.finance.router_budgets import router as budgets_router
from app.modules.finance.router_fiscality import router as fiscality_router
from app.modules.finance.router_analytics import router as analytics_router
from app.modules.operations.router_invoices import router as invoices_router
from app.modules.operations.router_payments import router as payments_router
from app.modules.operations.router_collections import router as collections_router
from app.modules.operations.router_clients import router as clients_router
from app.modules.operations.router_suppliers import router as suppliers_router
from app.modules.operations.router_articles import router as articles_router
from app.modules.auth.router_auth import router as auth_router
from app.modules.auth.router_users import router as users_router
from app.modules.system.router_audit import router as audit_router
from app.modules.system.router_documents import router as documents_router
from app.modules.system.router_reports import router as reports_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(ai_router)
api_router.include_router(training_router)
api_router.include_router(ocr_router)
api_router.include_router(accounting_router)
api_router.include_router(accounting_reports_router)
api_router.include_router(budgets_router)
api_router.include_router(fiscality_router)
api_router.include_router(analytics_router)
api_router.include_router(invoices_router)
api_router.include_router(payments_router)
api_router.include_router(collections_router)
api_router.include_router(clients_router)
api_router.include_router(suppliers_router)
api_router.include_router(articles_router)
api_router.include_router(audit_router)
api_router.include_router(documents_router)
api_router.include_router(reports_router)
