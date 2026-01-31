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
    def calculate_g50_summary(
        net_sales_ht: Decimal, 
        net_purchases_ht: Decimal,
        irg_amount: Decimal = Decimal('0'),
        stamp_duty: Decimal = Decimal('0'),
        tap_rate: Decimal = None
    ) -> Dict[str, Any]:
        """
        Calculates the G50 tax summary (D????claration mensuelle).
        - TVA Collect????e (Sales)
        - TVA D????ductible (Purchases)
        - TAP (Taxe sur l'Activit???? Professionnelle)
        - IRG (Retenue ???? la source salaires/honoraires)
        - Droit de Timbre
        """
        rate_tap = tap_rate if tap_rate is not None else AlgerianFinancialCalculator.TAP_RATE
        
        tva_collected = (net_sales_ht * AlgerianFinancialCalculator.TVA_NORMAL).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        tva_deductible = (net_purchases_ht * AlgerianFinancialCalculator.TVA_NORMAL).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        
        # TAP = CA * Taux (avec r????faction 25% ou 50% possible, ici simplifi????)
        tap = (net_sales_ht * rate_tap).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        
        # TVA ???? payer = (Collect????e - D????ductible) ou cr????dit reportable
        diff_tva = tva_collected - tva_deductible
        tva_to_pay = diff_tva if diff_tva > 0 else Decimal('0')
        credit_tva = abs(diff_tva) if diff_tva < 0 else Decimal('0')
        
        total_due = tva_to_pay + tap + irg_amount + stamp_duty

        return {
            "tva_collected": float(tva_collected),
            "tva_deductible": float(tva_deductible),
            "credit_tva_reportable": float(credit_tva),
            "tap": float(tap),
            "irg": float(irg_amount),
            "timbre": float(stamp_duty),
            "tva_to_pay": float(tva_to_pay),
            "total_due": float(total_due)
        }

    # Taux IBS (Imp????t sur les B????n????fices des Soci????t????s)
    IBS_RATES = {
        'production': Decimal('0.19'),      # Biens
        'btph': Decimal('0.23'),            # Batiment
        'tourisme': Decimal('0.23'),        # Activit????s touristiques (souvent assimil???? ou taux r????duit sp????cifique)
        'services': Decimal('0.26'),        # Commerce et services (Standard)
        'mixte': Decimal('0.26')            # Par d????faut
    }

    @staticmethod
    def calculate_ibs(
        net_profit_accounting: Decimal, 
        reintegrations: Decimal = Decimal('0'), 
        deductions: Decimal = Decimal('0'),
        activity_sector: str = 'services'
    ) -> Dict[str, Decimal]:
        """
        Calculates the Imp????t sur les B????n????fices des Soci????t????s (IBS).
        Standard rate: 26% (Services), 23% (BTPH), 19% (Production).
        """
        profit_taxable = net_profit_accounting + reintegrations - deductions
        if profit_taxable < 0:
            profit_taxable = Decimal('0')

        ibs_rate = AlgerianFinancialCalculator.IBS_RATES.get(activity_sector.lower(), Decimal('0.26'))
        ibs_amount = (profit_taxable * ibs_rate).quantize(Decimal('1'), rounding=ROUND_HALF_UP)
        
        return {
            "profit_taxable": profit_taxable,
            "ibs_rate": ibs_rate,
            "ibs_amount": ibs_amount,
            "net_after_tax": (net_profit_accounting + reintegrations - deductions) - ibs_amount
        }
