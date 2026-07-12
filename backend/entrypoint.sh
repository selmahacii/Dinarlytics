#!/bin/sh
set -e

echo "Waiting for database..."
python - <<'PYEOF'
import time
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

for attempt in range(30):
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database is ready.")
        sys.exit(0)
    except Exception as e:
        print(f"DB not ready (attempt {attempt + 1}/30): {e}")
        time.sleep(2)
sys.exit(1)
PYEOF

echo "Provisioning schema, roles and chart of accounts per company hierarchy..."
python scripts/migrate_company_hierarchy_accounts.py || echo "Migration script reported an issue (non-fatal on first boot with no companies yet)."

if [ "$#" -gt 0 ]; then
    echo "Starting: $@"
    exec "$@"
else
    echo "Starting API server..."
    exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${UVICORN_WORKERS:-2}
fi
