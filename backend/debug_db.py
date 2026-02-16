
import sys
import traceback

sys.path.append(r"c:\Users\surface\Downloads\Dinarlytics\backend")

try:
    from app.core.database import init_db
    print("Imported init_db successfully.")
    init_db()
    print("init_db completed successfully.")
except Exception:
    print("Caught Exception:")
    traceback.print_exc()
