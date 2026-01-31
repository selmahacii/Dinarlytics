from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
import uuid
from app.models.accounting import JournalEntry, JournalEntryLine
from app.models.inventory import Invoice

class AccountingAutomation:
    """
    Handles automatic creation of accounting records from business events.
    Standard Algerian SCF (Plan Comptable National) account codes.
    """

    # --- Standard SCF Account Codes ---
    ACC_CLIENTS = "411000"
    ACC_VENTES = "700000"
    ACC_TVA_COLLECTEE = "445700"
    
    ACC_FOURNISSEURS = "401000"
    ACC_ACHATS = "600000"
    ACC_TVA_DEDUCTIBLE = "445600"

    @staticmethod
    def auto_post_invoice(db: Session, invoice: Invoice):
        """
        Creates a draft journal entry from a validated sales invoice.
        T-Account:
        DR 411000 (Clients)  - TTC
        CR 700000 (Ventes)   - HT
        CR 445700 (TVA Coll) - TVA
        """
        entry_number = f"OD-{datetime.now().strftime('%Y%m')}-{str(uuid.uuid4())[:6].upper()}"
        
        journal_entry = JournalEntry(
            company_id=invoice.company_id,
            entry_number=entry_number,
            entry_date=invoice.invoice_date,
            description=f"Automatique: Facture {invoice.invoice_number}",
            status="draft",
            total_debit=invoice.total_ttc,
            total_credit=invoice.total_ttc,
            created_by=invoice.created_by
        )
        db.add(journal_entry)
        db.flush()

        # Line 1: Client (Debit)
        db.add(JournalEntryLine(
            journal_entry_id=journal_entry.id,
            account_code=AccountingAutomation.ACC_CLIENTS,
            debit_amount=invoice.total_ttc,
            credit_amount=0,
            description=f"Client: {invoice.invoice_number}"
        ))

        # Line 2: Ventes (Credit)
        db.add(JournalEntryLine(
            journal_entry_id=journal_entry.id,
            account_code=AccountingAutomation.ACC_VENTES,
            debit_amount=0,
            credit_amount=invoice.total_htt,
            description=f"Produit: {invoice.invoice_number}"
        ))

        # Line 3: TVA Collect????e (Credit)
        if invoice.total_tva > 0:
            db.add(JournalEntryLine(
                journal_entry_id=journal_entry.id,
                account_code=AccountingAutomation.ACC_TVA_COLLECTEE,
                debit_amount=0,
                credit_amount=invoice.total_tva,
                description=f"TVA Collect????e: {invoice.invoice_number}"
            ))

        return journal_entry
