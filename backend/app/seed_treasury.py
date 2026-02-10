import uuid
from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.models import BankAccount, ChartOfAccount, JournalEntry, JournalEntryLine, Company, User

def seed_treasury():
    db = SessionLocal()
    try:
        # 1. Get a company and user
        company = db.query(Company).first()
        if not company:
            print("No company found. Please run main migrations and setup first.")
            return
        
        user = db.query(User).filter(User.company_id == company.id).first()
        if not user:
            print("No user found.")
            return

        # 2. Ensure Chart of Accounts for Bank exists (512xxx)
        coa_codes = ["512001", "512002"]
        coa_names = ["BNA - Compte Courant", "BADR - Compte Operationnel"]
        
        for code, name in zip(coa_codes, coa_names):
            existing_coa = db.query(ChartOfAccount).filter(
                ChartOfAccount.company_id == company.id,
                ChartOfAccount.account_code == code
            ).first()
            if not existing_coa:
                coa = ChartOfAccount(
                    company_id=company.id,
                    account_code=code,
                    account_name=name,
                    account_class=5,
                    account_type="asset",
                    is_active=True
                )
                db.add(coa)
        db.commit()

        # 3. Create Bank Accounts linked to COA
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

        # 4. Add Initial Balance via Journal Entry
        # Debit 512 (Bank) - Increase
        # Credit 101 (Capital) - Initial funding
        
        # Check if 101 exists
        capital_coa = db.query(ChartOfAccount).filter(
            ChartOfAccount.company_id == company.id,
            ChartOfAccount.account_code == "101000"
        ).first()
        if not capital_coa:
            capital_coa = ChartOfAccount(
                company_id=company.id,
                account_code="101000",
                account_name="Capital Social",
                account_class=1,
                account_type="equity"
            )
            db.add(capital_coa)
            db.commit()

        # Create Journal Entry for initial funding
        entry = JournalEntry(
            company_id=company.id,
            entry_number=f"INIT-BAL-{datetime.now().year}",
            entry_date=date.today() - timedelta(days=30),
            description="Solde Initial Tresorerie",
            status="approved",
            total_debit=Decimal("57500000"),
            total_credit=Decimal("57500000"),
            created_by=user.id
        )
        db.add(entry)
        db.flush()

        # Line 1: BNA (45M)
        db.add(JournalEntryLine(
            journal_entry_id=entry.id,
            account_code="512001",
            debit_amount=Decimal("45000000"),
            description="Solde initial BNA"
        ))
        
        # Line 2: BADR (12.5M)
        db.add(JournalEntryLine(
            journal_entry_id=entry.id,
            account_code="512002",
            debit_amount=Decimal("12500000"),
            description="Solde initial BADR"
        ))
        
        # Line 3: Capital Offset (57.5M)
        db.add(JournalEntryLine(
            journal_entry_id=entry.id,
            account_code="101000",
            credit_amount=Decimal("57500000"),
            description="Apport initial"
        ))
        
        db.commit()

        # 5. Add some mock transactions (Inflows/Outflows)
        # inflow: Vente Facture #INV-001
        entry_in = JournalEntry(
            company_id=company.id,
            entry_number="PAY-SALE-001",
            entry_date=date.today() - timedelta(days=5),
            description="Reglement Facture Clients #001",
            status="approved",
            total_debit=Decimal("1500000"),
            total_credit=Decimal("1500000"),
            created_by=user.id
        )
        db.add(entry_in)
        db.flush()
        db.add(JournalEntryLine(journal_entry_id=entry_in.id, account_code="512001", debit_amount=Decimal("1500000"), description="Encaissement Vente"))
        db.add(JournalEntryLine(journal_entry_id=entry_in.id, account_code="411000", credit_amount=Decimal("1500000"), description="Client Alpha"))

        # outflow: Paiement Loyer
        entry_out = JournalEntry(
            company_id=company.id,
            entry_number="PAY-EXP-001",
            entry_date=date.today() - timedelta(days=2),
            description="Paiement Loyer Bureau",
            status="approved",
            total_debit=Decimal("200000"),
            total_credit=Decimal("200000"),
            created_by=user.id
        )
        db.add(entry_out)
        db.flush()
        db.add(JournalEntryLine(journal_entry_id=entry_out.id, account_code="613000", debit_amount=Decimal("200000"), description="Charges Locatives"))
        db.add(JournalEntryLine(journal_entry_id=entry_out.id, account_code="512001", credit_amount=Decimal("200000"), description="Decaissement BNA"))

        db.commit()
        print("Treasury seeding completed successfully.")

    except Exception as e:
        print(f"Error seeding treasury: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_treasury()
