import os
import sys
import uuid
import random
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime, timezone

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.core.database import SessionLocal<
# Don't import models yet if possible, or use text()

def seed_clients():
    db = SessionLocal()
    try:
        # Get id using raw SQL to avoid ORM hydration issues with invalid UTF-8 strings
        result = db.execute(text("SELECT id FROM companies LIMIT 1")).fetchone()
        if not result:
            print("No company found.")
            return
        
        company_id = result[0]
        print(f"Using company ID: {company_id}")

        sectors = ["BTP", "Informatique", "Commerce", "Agriculture", "Sante", "Transport"]
        sizes = ["micro", "small", "medium", "large"]
        risks = ["faible", "moyen", "eleve"]
        wilayas = ["16", "31", "25", "06", "19"] # Literal codes to avoid importing enum if it has issues

        for i in range(20):
            sector = random.choice(sectors)
            client_name = f"Client {i+1} {sector}"
            
            # Use raw SQL to insert
            check = db.execute(text("SELECT id FROM clients WHERE name = :name AND company_id = :cid"), 
                              {"name": client_name, "cid": company_id}).fetchone()
            
            if not check:
                db.execute(text("""
                    INSERT INTO clients (id, company_id, name, email, phone, sector, size, risk_category, state, is_active, created_at)
                    VALUES (:id, :cid, :name, :email, :phone, :sector, :size, :risk, :state, :active, :created)
                """), {
                    "id": str(uuid.uuid4()),
                    "cid": str(company_id),
                    "name": client_name,
                    "email": f"contact{i+1}@example.dz",
                    "phone": f"0550{random.randint(100000, 999999)}",
                    "sector": sector,
                    "size": random.choice(sizes),
                    "risk": random.choice(risks),
                    "state": random.choice(wilayas),
                    "active": True,
                    "created": datetime.now(timezone.utc)
                })
        
        db.commit()
        print("Clients seeding completed successfully.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_clients()
