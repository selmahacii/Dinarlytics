import os

replacements = {
    'from app.config': 'from app.core.config',
    'import app.config': 'import app.core.config',
    'from app.database': 'from app.core.database',
    'app.database': 'app.core.database',
    'from app.security': 'from app.core.security',
    'app.security': 'app.core.security',
    'from app.permissions': 'from app.core.permissions',
    'app.permissions': 'app.core.permissions',
    'from app.websocket_manager': 'from app.core.websocket',
    'app.websocket_manager': 'app.core.websocket',
    'from app.db': 'from app.core.db_manager',
    'app.db': 'app.core.db_manager',
    'from app.tasks.ai_tasks': 'from app.modules.intelligence.tasks',
    'from app.models': 'from app.core.models',
    'app.models': 'app.core.models',
    
    # Routers
    'app.routers.auth': 'app.modules.auth.router_auth',
    'app.routers.users': 'app.modules.auth.router_users',
    'app.routers.ai': 'app.modules.intelligence.router_ai',
    'app.routers.training': 'app.modules.intelligence.router_training',
    'app.routers.accounting': 'app.modules.finance.router_accounting',
    'app.routers.analytics': 'app.modules.finance.router_analytics',
    'app.routers.invoices': 'app.modules.operations.router_invoices',
    'app.routers.clients': 'app.modules.operations.router_clients',
    'app.routers.suppliers': 'app.modules.operations.router_suppliers',
    'app.routers.articles': 'app.modules.operations.router_articles',
    'app.routers.audit': 'app.modules.system.router_audit',
    'app.routers.documents': 'app.modules.system.router_documents',
    'app.routers.reports': 'app.modules.system.router_reports',
    'app.routers.fiscality': 'app.modules.finance.router_fiscality',
    'app.routers.budgets': 'app.modules.finance.router_budgets',
    'app.routers.payments': 'app.modules.operations.router_payments',
    'app.routers.collections': 'app.modules.operations.router_collections',
    
    # Services
    'app.services.analytics': 'app.modules.finance.service_analytics',
    'app.services.calculations': 'app.modules.finance.service_calculations',
    'app.services.internal_control': 'app.modules.system.service_internal_control',
    'app.services.notifications': 'app.modules.system.service_notifications',
    'app.services.prediction': 'app.modules.intelligence.service_prediction',
    'app.services.chatbot': 'app.modules.intelligence.service_chatbot',
    'app.services.jibaya': 'app.modules.finance.service_jibaya',
    'app.services.ocr': 'app.modules.intelligence.service_ocr',
    'app.services.training': 'app.modules.intelligence.service_training',
    'app.services.budgeting': 'app.modules.finance.service_budgeting',
    'app.services.accounting_automation': 'app.modules.finance.service_automation',
}

def process_file(filepath):
    if 'core\\models.py' in filepath or 'core/models.py' in filepath:
        return
    if 'migrate_imports.py' in filepath:
        return

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Could not read {filepath}: {e}")
        return
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('backend/app'):
    for file in files:
        if file.endswith('.py'):
            process_file(os.path.join(root, file))
