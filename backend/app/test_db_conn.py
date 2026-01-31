from app.database import init_db
import logging
logging.basicConfig(level=logging.INFO)
try:
    init_db()
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
