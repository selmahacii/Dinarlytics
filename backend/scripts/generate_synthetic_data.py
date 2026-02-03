import csv
import random
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import json
import argparse
import os

# Configuration pour la comptabilité algérienne (SCF)
PLAN_COMPTABLE_SCF = {
    "CLIENTS": "411000",
    "VENTES_MARCHANDISES": "700000",
    "TVA_COLLECTEE": "445700",
    "BANQUE": "512000",
    "CAISSE": "530000",
    "FOURNISSEURS": "401000",
    "ACHATS_MARCHANDISES": "380000",
    "STOCK_MARCHANDISES": "300000",
    "TVA_DEDUCTIBLE": "445600",
}

class AlgerianDataGenerator:
    def __init__(self, start_date: datetime, end_date: datetime):
        self.start_date = start_date
        self.end_date = end_date
        self.clients = [f"CLIENT_{i:03d}" for i in range(1, 21)]
        self.suppliers = [f"FROY_{i:03d}" for i in range(1, 11)]

    def random_date(self):
        delta = self.end_date - self.start_date
        return self.start_date + timedelta(days=random.randrange(delta.days))

    def generate_sales_invoice(self, num_invoice):
        """Génère une facture de vente et ses écritures comptables associées."""
        date_facture = self.random_date()
        client = random.choice(self.clients)
        
        # Montants
        amount_ht = Decimal(random.randint(1000, 500000))
        # 80% de chance d'être à 19%, 20% à 9%
        tva_rate = Decimal('19.0') if random.random() > 0.2 else Decimal('9.0')
        amount_tva = round(amount_ht * (tva_rate / 100), 2)
        amount_ttc = amount_ht + amount_tva
        
        # Écritures (Journal des Ventes)
        entries = []
        
        # Débit Client (411)
        entries.append({
            "date": date_facture.strftime("%Y-%m-%d"),
            "journal": "VT",
            "compte": PLAN_COMPTABLE_SCF["CLIENTS"],
            "libelle": f"Facture N°{num_invoice} - {client}",
            "debit": str(amount_ttc),
            "credit": "0.00",
            "piece": num_invoice
        })
        
        # Crédit Ventes (700)
        entries.append({
            "date": date_facture.strftime("%Y-%m-%d"),
            "journal": "VT",
            "compte": PLAN_COMPTABLE_SCF["VENTES_MARCHANDISES"],
            "libelle": f"Vente marchandises - {client}",
            "debit": "0.00",
            "credit": str(amount_ht),
            "piece": num_invoice
        })
        
        # Crédit TVA (4457)
        entries.append({
            "date": date_facture.strftime("%Y-%m-%d"),
            "journal": "VT",
            "compte": PLAN_COMPTABLE_SCF["TVA_COLLECTEE"],
            "libelle": f"TVA sur vente - {client}",
            "debit": "0.00",
            "credit": str(amount_tva),
            "piece": num_invoice
        })
        
        return entries

    def generate_dataset(self, num_invoices=100):
        all_entries = []
        for i in range(1, num_invoices + 1):
            invoice_entries = self.generate_sales_invoice(f"FAC2024-{i:04d}")
            all_entries.extend(invoice_entries)
        return all_entries

    def export_csv(self, entries, filename="synthetic_data_scf.csv"):
        fieldnames = ["date", "journal", "compte", "libelle", "debit", "credit", "piece"]
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
            writer.writeheader()
            writer.writerows(entries)
        print(f"Data exported to {filename} ({len(entries)} lines)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Générateur de données synthétiques SCF")
    parser.add_argument("--count", type=int, default=100, help="Nombre de factures à générer")
    parser.add_argument("--output", type=str, default="backend/data/synthetic_journal_ventes.csv", help="Fichier de sortie")
    
    args = parser.parse_args()
    
    # Créer le dossier si nécessaire
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    
    start = datetime(2024, 1, 1)
    end = datetime(2024, 12, 31)
    
    generator = AlgerianDataGenerator(start, end)
    entries = generator.generate_dataset(num_invoices=args.count)
    generator.export_csv(entries, filename=args.output)
