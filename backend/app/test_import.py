import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

print("Importing app.core.models...")
try:
    from app.core.models import Client
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")

print("Importing app.modules.operations.models_partners...")
try:
    from app.modules.operations.models_partners import Client
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")
