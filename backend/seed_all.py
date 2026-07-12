import os
import sys
import uuid
from decimal import Decimal
from datetime import datetime, date, timedelta

# Add path
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from app.core.database import SessionLocal, Base, engine
from app.core.models import Company, User, Role, UserRole, ChartOfAccount, BankAccount, JournalEntry, JournalEntryLine
from app.core.security import PasswordManager
from app.core.config import ROLES

def seed():
    # Make sure tables are created fresh with the latest schema
    print("Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables fresh...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding roles...")
        # 1. Create default roles
        role_map = {}
        for role_name, config in ROLES.items():
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(id=uuid.uuid4(), name=role_name, permissions=config["permissions"])
                db.add(role)
                db.flush()
            role_map[role_name] = role

        # Also add custom demo roles if missing
        additional_roles = ["gerant", "dg", "daf", "commercial_director", "hr_director", "logistics_director", "production_director", "comptable_senior", "controleur_gestion", "auditeur", "commercial", "vendeur", "magasinier", "tresorier", "utilisateur"]
        for role_name in additional_roles:
            if role_name not in role_map:
                role = db.query(Role).filter(Role.name == role_name).first()
                if not role:
                    role = Role(id=uuid.uuid4(), name=role_name, permissions=["read"])
                    db.add(role)
                    db.flush()
                role_map[role_name] = role

        db.commit()

        # 2. Create companies and users
        demo_users = [
            # EURL
            {
                "email": "karim.b@electromenager-plus.dz",
                "companyName": "Électroménager Plus (EURL)",
                "companyType": "eurl",
                "segment": "micro",
                "prenom": "Karim",
                "nom": "Benali",
                "role": "gerant",
            },
            # SARL
            {
                "email": "samia.m@mode-moderne.dz",
                "companyName": "Mode Moderne SARL",
                "companyType": "sarl",
                "segment": "small",
                "prenom": "Samia",
                "nom": "Meziane",
                "role": "gerant",
            },
            {
                "email": "ahmed.k@mode-moderne.dz",
                "companyName": "Mode Moderne SARL",
                "companyType": "sarl",
                "segment": "small",
                "prenom": "Ahmed",
                "nom": "Khaled",
                "role": "comptable",
            },
            {
                "email": "lylia.z@mode-moderne.dz",
                "companyName": "Mode Moderne SARL",
                "companyType": "sarl",
                "segment": "small",
                "prenom": "Lylia",
                "nom": "Ziani",
                "role": "commercial",
            },
            # SPA
            {
                "email": "mourad.ouali@industrie-groupe.dz",
                "companyName": "Industrie Groupe SPA",
                "companyType": "spa",
                "segment": "enterprise",
                "prenom": "Mourad",
                "nom": "Ouali",
                "role": "dg",
            },
            {
                "email": "safia.haddad@industrie-groupe.dz",
                "companyName": "Industrie Groupe SPA",
                "companyType": "spa",
                "segment": "enterprise",
                "prenom": "Safia",
                "nom": "Haddad",
                "role": "daf",
            },
            {
                "email": "amine.ziani@industrie-groupe.dz",
                "companyName": "Industrie Groupe SPA",
                "companyType": "spa",
                "segment": "enterprise",
                "prenom": "Amine",
                "nom": "Ziani",
                "role": "commercial_director",
            },
            {
                "email": "ali.stock@industrie-groupe.dz",
                "companyName": "Industrie Groupe SPA",
                "companyType": "spa",
                "segment": "enterprise",
                "prenom": "Ali",
                "nom": "Stock",
                "role": "magasinier",
            },
            {
                "email": "samir.cash@industrie-groupe.dz",
                "companyName": "Industrie Groupe SPA",
                "companyType": "spa",
                "segment": "enterprise",
                "prenom": "Samir",
                "nom": "Cash",
                "role": "tresorier",
            }
        ]

        company_map = {}
        for demo in demo_users:
            cname = demo["companyName"]
            if cname not in company_map:
                company = db.query(Company).filter(Company.name == cname).first()
                if not company:
                    company = Company(
                        id=uuid.uuid4(),
                        name=cname,
                        company_type=demo.get("companyType", "eurl"),
                        segment=demo.get("segment", "micro")
                    )
                    db.add(company)
                    db.flush()
                company_map[cname] = company

            user = db.query(User).filter(User.email == demo["email"]).first()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    company_id=company_map[cname].id,
                    username=demo["email"],
                    email=demo["email"],
                    password_hash=PasswordManager.hash_password("demo123"),
                    first_name=demo["prenom"],
                    last_name=demo["nom"],
                    is_verified=True,
                    is_active=True
                )
                db.add(user)
                db.flush()

                # Assign role
                r_name = demo["role"]
                role_obj = role_map.get(r_name)
                if role_obj:
                    user_role = UserRole(user_id=user.id, role_id=role_obj.id)
                    db.add(user_role)

        db.commit()
        print("Companies and demo users seeded successfully.")

        # 3. Call client & treasury seeds for each company
        for company in db.query(Company).all():
            print(f"Seeding clients for {company.name}...")
            # Create clients if none exist
            from app.modules.operations.models_partners import Wilaya
            from app.core.models import Client
            import random
            sectors = ["BTP", "Informatique", "Commerce", "Agriculture", "Sante", "Transport"]
            sizes = ["micro", "small", "medium", "large"]
            risks = ["faible", "moyen", "eleve"]
            wilayas = list(Wilaya)
            for i in range(15):
                sector = random.choice(sectors)
                client_name = f"Client {i+1} {sector}"
                existing = db.query(Client).filter(Client.name == client_name, Client.company_id == company.id).first()
                if not existing:
                    client = Client(
                        id=uuid.uuid4(),
                        company_id=company.id,
                        name=client_name,
                        email=f"contact{i+1}@example.dz",
                        phone=f"0550{random.randint(100000, 999999)}",
                        address=f"Rue {random.randint(1, 100)}",
                        state=random.choice(wilayas),
                        tax_number=f"{random.randint(100000000000000, 999999999999999)}",
                        sector=sector,
                        size=random.choice(sizes),
                        risk_category=random.choice(risks),
                        is_active=True
                    )
                    db.add(client)
            db.commit()

            print(f"Seeding chart of accounts for {company.name} ({company.segment}/{company.company_type})...")
            # Plan comptable SCF complet adapté à la hiérarchie de l'entreprise
            # (au lieu de 2 comptes de trésorerie isolés, insuffisants pour
            # calculer bilan/BFR/ratios).
            from app.core.service_coa_provisioning import ensure_chart_of_accounts
            ensure_chart_of_accounts(
                db, company.id,
                segment=company.segment or "micro",
                company_type=company.company_type or "eurl",
                has_inventory=True
            )
            db.commit()

            print(f"Seeding treasury for {company.name}...")
            # Create bank accounts and initial funding
            user = db.query(User).filter(User.company_id == company.id).first()
            if user:
                banks = [
                    ("Banque Nationale d'Algerie (BNA)", "512001", "DZ86 0070 0000 0000 0000 0001"),
                    ("Banque BADR", "512002", "DZ86 0080 0000 0000 0000 0002")
                ]
                for bank_name, code, iban in banks:
                    existing_bank = db.query(BankAccount).filter(
                        BankAccount.company_id == company.id,
                        BankAccount.account_code == code
                    ).first()
                    if not existing_bank:
                        bank = BankAccount(
                            company_id=company.id,
                            account_code=code,
                            bank_name=bank_name,
                            iban=iban,
                            currency="DZD",
                            is_active=True
                        )
                        db.add(bank)
                db.commit()

        print("All seeds completed successfully.")
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
