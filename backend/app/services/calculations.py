from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List

class AlgerianFinancialCalculator:
    """
    Centralized service for Algerian (SCF) financial calculations.
    Ensures 100% precision for TVA, HT, TTC and other fiscal metrics.
    """

    # Algerian TVA Rates (2025)
    TVA_NORMAL = Decimal('0.19') # 19%
    TVA_REDUIT = Decimal('0.09') # 9%
    
    # Tax on Professional Activity (TAP) - usually 2% but can vary (e.g. 1% for production)
    TAP_RATE = Decimal('0.02')

    @staticmethod
    def calculate_from_ht(amount_ht: Decimal, tax_rate: Decimal = TVA_NORMAL) -> Dict[str, Decimal]:
        """Calculates TVA and TTC from HT."""
        tva = (amount_ht * tax_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        ttc = amount_ht + tva
        return {
            "ht": amount_ht,
            "tva": tva,
            "ttc": ttc
        }

    @staticmethod
    def calculate_from_ttc(amount_ttc: Decimal, tax_rate: Decimal = TVA_NORMAL) -> Dict[str, Decimal]:
        """Calculates HT and TVA from TTC."""
        ht = (amount_ttc / (1 + tax_rate)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        tva = amount_ttc - ht
        return {
            "ht": ht,
            "tva": tva,
            "ttc": amount_ttc
        }

    @staticmethod
    def calculate_g50_summary(net_sales_ht: Decimal, net_purchases_ht: Decimal) -> Dict[str, Any]:
        """
        Calculates the G50 tax summary for a month.
        - TVA Collectée (Sales)
        - TVA Déductible (Purchases)
        - TAP (2% on Sales)
        - TVA à Verser
        """
        tva_collected = (net_sales_ht * AlgerianFinancialCalculator.TVA_NORMAL).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        tva_deductible = (net_purchases_ht * AlgerianFinancialCalculator.TVA_NORMAL).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        tap = (net_sales_ht * AlgerianFinancialCalculator.TAP_RATE).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        
        tva_to_pay = max(Decimal('0'), tva_collected - tva_deductible)
        total_due = tva_to_pay + tap

        return {
            "tva_collected": float(tva_collected),
            "tva_deductible": float(tva_deductible),
            "tap": float(tap),
            "tva_to_pay": float(tva_to_pay),
            "total_due": float(total_due)
        }

    @staticmethod
    def calculate_ibs(net_profit_accounting: Decimal, reintegrations: Decimal = Decimal('0'), deductions: Decimal = Decimal('0')) -> Dict[str, Decimal]:
        """
        Calculates the Impôt sur les Bénéfices des Sociétés (IBS).
        Standard rate: 26% (can be 19% for production or 23% for building)
        """
        profit_taxable = net_profit_accounting + reintegrations - deductions
        ibs_rate = Decimal('0.26')
        ibs_amount = (profit_taxable * ibs_rate).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        
        return {
            "profit_taxable": profit_taxable,
            "ibs_amount": ibs_amount,
            "net_after_tax": profit_taxable - ibs_amount
        }
