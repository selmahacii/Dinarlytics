"""
Calcul de paie algérienne : cotisations CNAS et barème IRG mensuel
(art. 104 CIDTA, rédaction Loi de Finances 2022 — applicable depuis le
01/06/2022).

Chaîne de calcul :
  brut (salaire de poste)
    − cotisation sécurité sociale salarié 9%       → salaire imposable
    − IRG (barème progressif + abattement + lissage) → salaire net
  côté employeur : + cotisation patronale 26% du brut → coût total.

Barème IRG MENSUEL (tranches du barème annuel / 12) :
    0      – 20 000  :  0 %
    20 001 – 40 000  : 23 %
    40 001 – 80 000  : 27 %
    80 001 – 160 000 : 30 %
    160 001– 320 000 : 33 %
    au-delà          : 35 %

Puis abattement de 40 % de l'IRG brut, borné entre 1 000 et 1 500 DA/mois.

Règles d'exonération LF2022 :
  - revenu imposable ≤ 30 000 DA/mois : IRG = 0
  - 30 000 < revenu ≤ 35 000 : formule de lissage officielle
        IRG = IRG_barème × 137/51 − 27 925/8
    (continue en 30 000 → 0 et en 35 000 → IRG normal).
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict

TWO_PLACES = Decimal("0.01")

# Taux de cotisations sociales (assiette : salaire de poste)
CNAS_EMPLOYEE_RATE = Decimal("0.09")   # part salariale
CNAS_EMPLOYER_RATE = Decimal("0.26")   # part patronale

# Barème mensuel : (borne_basse_exclue, borne_haute_incluse, taux)
IRG_MONTHLY_BRACKETS = [
    (Decimal("0"),      Decimal("20000"),  Decimal("0")),
    (Decimal("20000"),  Decimal("40000"),  Decimal("0.23")),
    (Decimal("40000"),  Decimal("80000"),  Decimal("0.27")),
    (Decimal("80000"),  Decimal("160000"), Decimal("0.30")),
    (Decimal("160000"), Decimal("320000"), Decimal("0.33")),
    (Decimal("320000"), None,               Decimal("0.35")),
]

ABATEMENT_RATE = Decimal("0.40")
ABATEMENT_MIN = Decimal("1000")
ABATEMENT_MAX = Decimal("1500")

EXEMPTION_THRESHOLD = Decimal("30000")   # IRG = 0 en dessous
SMOOTHING_UPPER = Decimal("35000")       # zone de lissage 30 000 → 35 000
SMOOTHING_MULTIPLIER = Decimal("137") / Decimal("51")
SMOOTHING_DEDUCTION = Decimal("27925") / Decimal("8")


class AlgerianPayrollCalculator:

    @staticmethod
    def compute_irg_bareme(taxable_monthly: Decimal) -> Decimal:
        """IRG mensuel au barème progressif, après abattement 40 %
        (borné 1 000–1 500 DA), SANS les règles d'exonération/lissage."""
        if taxable_monthly <= 0:
            return Decimal("0")

        tax = Decimal("0")
        for lower, upper, rate in IRG_MONTHLY_BRACKETS:
            if taxable_monthly <= lower:
                break
            ceiling = taxable_monthly if upper is None else min(taxable_monthly, upper)
            tax += (ceiling - lower) * rate

        if tax <= 0:
            return Decimal("0")

        abatement = tax * ABATEMENT_RATE
        abatement = max(ABATEMENT_MIN, min(ABATEMENT_MAX, abatement))
        return max(Decimal("0"), (tax - abatement).quantize(TWO_PLACES, rounding=ROUND_HALF_UP))

    @staticmethod
    def compute_irg(taxable_monthly: Decimal) -> Decimal:
        """IRG mensuel effectif, règles LF2022 comprises (exonération
        ≤ 30 000 DA et lissage 30 000–35 000)."""
        if taxable_monthly <= EXEMPTION_THRESHOLD:
            return Decimal("0")

        bareme = AlgerianPayrollCalculator.compute_irg_bareme(taxable_monthly)

        if taxable_monthly <= SMOOTHING_UPPER:
            smoothed = bareme * SMOOTHING_MULTIPLIER - SMOOTHING_DEDUCTION
            return max(Decimal("0"), smoothed.quantize(TWO_PLACES, rounding=ROUND_HALF_UP))

        return bareme

    @staticmethod
    def compute_payslip(gross_monthly: Decimal) -> Dict[str, Decimal]:
        """Bulletin simplifié : brut → cotisations → imposable → IRG → net,
        plus le coût employeur (brut + part patronale)."""
        gross = Decimal(gross_monthly)
        if gross < 0:
            raise ValueError("Le salaire brut ne peut pas être négatif")

        cnas_employee = (gross * CNAS_EMPLOYEE_RATE).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)
        taxable = gross - cnas_employee
        irg = AlgerianPayrollCalculator.compute_irg(taxable)
        net = taxable - irg
        cnas_employer = (gross * CNAS_EMPLOYER_RATE).quantize(TWO_PLACES, rounding=ROUND_HALF_UP)

        return {
            "gross_salary": gross.quantize(TWO_PLACES),
            "cnas_employee": cnas_employee,
            "taxable_income": taxable.quantize(TWO_PLACES),
            "irg": irg,
            "net_salary": net.quantize(TWO_PLACES),
            "cnas_employer": cnas_employer,
            "total_employer_cost": (gross + cnas_employer).quantize(TWO_PLACES),
        }
