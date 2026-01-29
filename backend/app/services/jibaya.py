from typing import Dict, Any, List
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import JournalEntry, JournalEntryLine

class JibayaService:
    """
    Service dédié à la génération de la Liasse Fiscale (Jibaya).
    Mappe les comptes comptables vers les codes cases Jibaya.
    """

    MAPPING_JIBAYA = {
        "ACTIF": {
            "A010": ["20"],     # Immob Incorporelles
            "A020": ["21"],     # Immob Corporelles
            "A030": ["22"],     # Terrains
            "A040": ["23"],     # Batiments
            "A050": ["26", "27"], # Immob Financières
            "A100": ["30", "31", "32"], # Stocks
            "A110": ["411", "413", "416"], # Clients
            "A140": ["512", "53", "54"], # Trésorerie
        },
        "PASSIF": {
            "P010": ["101"],    # Capital social
            "P020": ["105", "106"], # Primes et réserves
            "P040": ["12"],     # Résultat net
            "P100": ["164"],    # Emprunts bancaires
            "P120": ["401", "404"], # Fournisseurs
            "P130": ["42", "43", "44"], # Dettes fiscales et sociales
        },
        "TCR": {
            "R010": ["70"],     # Ventes de marchandises
            "R020": ["72"],     # Production stockée
            "R030": ["60"],     # Achats consommés
            "R040": ["61", "62"], # Services extérieurs
            "R050": ["63"],     # Impôts et taxes
            "R060": ["64"],     # Frais de personnel
            "R070": ["68"],     # Dotations aux amortissements
            "R080": ["75"],     # Autres produits op
            "R090": ["65"],     # Autres charges op
            "R100": ["76"],     # Produits financiers
            "R110": ["66"],     # Charges financières
            "R120": ["69"],     # Impôts sur les bénéfices (IBS)
        }
    }

    @staticmethod
    def calculate_case_value(db: Session, company_id: str, year: int, prefixes: List[str], credit_positive: bool = True) -> float:
        """Calcule la somme des soldes pour une liste de préfixes de comptes."""
        total = Decimal('0')
        for prefix in prefixes:
            val = JibayaService._get_balance(db, company_id, year, prefix, credit_is_positive=credit_positive)
            total += val
        return float(total)

    @staticmethod
    def get_actif_data(db: Session, company_id: str, year: int) -> Dict[str, Any]:
        result = {}
        for case_code, prefixes in JibayaService.MAPPING_JIBAYA["ACTIF"].items():
            result[case_code] = JibayaService.calculate_case_value(db, company_id, year, prefixes, credit_positive=False)
        return result

    @staticmethod
    def get_passif_data(db: Session, company_id: str, year: int) -> Dict[str, Any]:
        result = {}
        for case_code, prefixes in JibayaService.MAPPING_JIBAYA["PASSIF"].items():
            result[case_code] = JibayaService.calculate_case_value(db, company_id, year, prefixes, credit_positive=True)
        return result
    
    @staticmethod
    def get_tcr_data(db: Session, company_id: str, year: int) -> Dict[str, Any]:
        result = {}
        # TCR : Produits (7) positifs, Charges (6) négatives pour le calcul du résultat,
        # Mais dans le XML Jibaya, les montants sont généralement absolus dans leurs cases respectives.
        # R010 (Ventes) -> Credit
        # R030 (Achats) -> Debit
        
        # Logique spécifique par case
        mapping = JibayaService.MAPPING_JIBAYA["TCR"]
        
        # Produits
        result["R010"] = JibayaService.calculate_case_value(db, company_id, year, mapping["R010"], True)
        result["R020"] = JibayaService.calculate_case_value(db, company_id, year, mapping["R020"], True)
        result["R080"] = JibayaService.calculate_case_value(db, company_id, year, mapping["R080"], True)
        result["R100"] = JibayaService.calculate_case_value(db, company_id, year, mapping["R100"], True)

        # Charges (On veut la valeur absolue positive pour le XML)
        result["R030"] = abs(JibayaService.calculate_case_value(db, company_id, year, mapping["R030"], False))
        result["R040"] = abs(JibayaService.calculate_case_value(db, company_id, year, mapping["R040"], False))
        result["R050"] = abs(JibayaService.calculate_case_value(db, company_id, year, mapping["R050"], False))
        result["R060"] = abs(JibayaService.calculate_case_value(db, company_id, year, mapping["R060"], False))
        result["R070"] = abs(JibayaService.calculate_case_value(db, company_id, year, mapping["R070"], False))
        result["R090"] = abs(JibayaService.calculate_case_value(db, company_id, year, mapping["R090"], False))
        result["R110"] = abs(JibayaService.calculate_case_value(db, company_id, year, mapping["R110"], False))
        result["R120"] = abs(JibayaService.calculate_case_value(db, company_id, year, mapping["R120"], False))
        
        # Calcul Résultat Net
        total_produits = result["R010"] + result["R020"] + result["R080"] + result["R100"]
        total_charges = result["R030"] + result["R040"] + result["R050"] + result["R060"] + result["R070"] + result["R090"] + result["R110"] + result["R120"]
        result["ReferenceResultat"] = total_produits - total_charges

        return result

    @staticmethod
    def generate_xml_liasse(db: Session, company_id: str, year: int) -> str:
        """Génère le XML complet structuré selon la norme Jibaya."""
        actif = JibayaService.get_actif_data(db, company_id, year)
        passif = JibayaService.get_passif_data(db, company_id, year)
        tcr = JibayaService.get_tcr_data(db, company_id, year)
        
        xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Liasses xmlns="http://www.mfdgi.gov.dz/Jibaya" Anne="{year}">
    <Liasse ID="{company_id}">
        <Bilan>
            <Actif>
                {_dict_to_xml(actif)}
            </Actif>
            <Passif>
                 {_dict_to_xml(passif)}
            </Passif>
        </Bilan>
        <TCR>
            {_dict_to_xml(tcr)}
        </TCR>
    </Liasse>
</Liasses>"""
        return xml

    @staticmethod
    def _get_balance(db: Session, company_id: str, year: int, account_prefix: str, credit_is_positive: bool = True) -> Decimal:
        """
        Helper pour calculer le solde d'une classe de comptes.
        """
        from sqlalchemy import extract
        
        query = db.query(
            func.sum(JournalEntryLine.credit_amount - JournalEntryLine.debit_amount) 
            if credit_is_positive else 
            func.sum(JournalEntryLine.debit_amount - JournalEntryLine.credit_amount)
        ).join(JournalEntry).filter(
            JournalEntry.company_id == company_id,
            JournalEntry.status == 'approved',
            extract('year', JournalEntry.entry_date) == year,
            JournalEntryLine.account_code.like(f"{account_prefix}%")
        )
        
        return query.scalar() or Decimal('0')

def _dict_to_xml(data: Dict[str, Any]) -> str:
    return "".join([f"<{k}>{v}</{k}>" for k, v in data.items()])
