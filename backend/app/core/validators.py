from decimal import Decimal
from typing import List, Optional, Tuple

class FiscalValidator:
    """
    Centralise les règles de validation pour la conformité fiscale algérienne (SCF).
    """

    TVA_RATES = [Decimal('0.0'), Decimal('9.0'), Decimal('19.0')]
    TIMBRE_THRESHOLD = Decimal('2500.0') # Seuil pour droit de timbre (espèces)
    TIMBRE_RATE = Decimal('0.01')

    @staticmethod
    def validate_tva(amount_ht: Decimal, amount_tva: Decimal, rate: Decimal) -> bool:
        """Vérifie si le montant de TVA correspond au taux appliqué (à 0.01 près)."""
        expected = amount_ht * (rate / Decimal('100'))
        return abs(expected - amount_tva) < Decimal('0.01')

    @staticmethod
    def calculate_timbre(amount_total: Decimal, payment_mode: str) -> Decimal:
        """Calcule le droit de timbre pour les paiements en espèces."""
        if payment_mode.lower() == 'cash' and amount_total > FiscalValidator.TIMBRE_THRESHOLD:
            timbre = amount_total * FiscalValidator.TIMBRE_RATE
            return min(max(timbre, Decimal('5.0')), Decimal('2500.0')) # Ex: Min 5 DA, Max 2500 DA (règle hypothétique à ajuster)
        return Decimal('0.0')

    @staticmethod
    def validate_journal_entry_balance(debits: Decimal, credits: Decimal) -> bool:
        """Vérifie l'équilibre strict d'une écriture comptable."""
        return debits == credits

    @staticmethod
    def validate_invoice_totals(lines: List[dict], total_ht: Decimal, total_ttc: Decimal) -> Tuple[bool, str]:
        """Vérifie la cohérence des totaux d'une facture par rapport à ses lignes."""
        calc_ht = sum(line.get('amount_ht', 0) for line in lines)
        if abs(calc_ht - total_ht) > Decimal('0.05'):
             return False, f"Total HT incorrect. Calculé: {calc_ht}, Déclaré: {total_ht}"
        
        return True, ""
