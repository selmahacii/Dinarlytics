import os
import sys
import uuid
import random
from sqlalchemy.orm import Session
from datetime import datetime, timezone

# Fix for Windows encoding issues
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal
from app.core.models import Company, Client
from app.modules.operations.models_partners import Wilaya

def seed_clients():
    db = SessionLocal()
    try:
        # Get a company to link clients to
        # Try to handle potential encoding issues in the query
        company = db.query(Company).first()
        if not company:
            print("No company found.")
            return

        print("Seeding clients...") # No company name in print

        sectors = ["BTP", "Informatique", "Commerce", "Agriculture", "Sante", "Transport"]
        sizes = ["micro", "small", "medium", "large"]
        risks = ["faible", "moyen", "eleve"]
        wilayas = list(Wilaya)

        # Create 20 random clients
        for i in range(20):
            sector = random.choice(sectors)
            client_name = f"Client {i+1} {sector}"
            
            # Use raw SQL if necessary or hope SQLAlchemy handles it
            existing = db.query(Client).filter(Client.name == client_name, Client.company_id == company.id).first()
            if not existing:
                wilaya = random.choice(wilayas)
                client = Client(
                    id=uuid.uuid4(),
                    company_id=company.id,
                    name=client_name,
                    email=f"contact{i+1}@example.dz",
                    phone=f"0550{random.randint(100000, 999999)}",
                    address=f"Rue {random.randint(1, 100)}",
                    state=wilaya,
                    tax_number=f"{random.randint(100000000000000, 999999999999999)}",
                    sector=sector,
                    size=random.choice(sizes),
                    risk_category=random.choice(risks),
                    is_active=True
                )
                db.add(client)
        
        db.commit()
        print("Clients seeding completed successfully.")
    except Exception as e:
        print(f"Error seeding clients.")
        # Print error details without causing new encoding errors
        try:
            print(f"Details: {str(e)}")
        except:
            print("Details could not be printed due to encoding.")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_clients()
