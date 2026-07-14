"""Tests de la paie algérienne (IRG barème LF2022, CNAS) — purs, sans base."""
from decimal import Decimal

import pytest

from app.modules.finance.service_payroll import AlgerianPayrollCalculator as Pay


class TestIRG:
    def test_exoneration_sous_30000(self):
        assert Pay.compute_irg(Decimal("30000")) == Decimal("0")
        assert Pay.compute_irg(Decimal("15000")) == Decimal("0")
        assert Pay.compute_irg(Decimal("0")) == Decimal("0")

    def test_continuite_du_lissage_en_30000(self):
        # Juste au-dessus du seuil, l'IRG doit être quasi nul (pas de saut).
        assert Pay.compute_irg(Decimal("30001")) < Decimal("10")

    def test_continuite_du_lissage_en_35000(self):
        # À la sortie de la zone de lissage, la formule doit rejoindre le barème.
        smoothed = Pay.compute_irg(Decimal("35000"))
        bareme = Pay.compute_irg_bareme(Decimal("35000"))
        assert abs(smoothed - bareme) < Decimal("1")

    def test_bareme_progressif_80000(self):
        # 20k×0 + 20k×23% + 32.8k... non : imposable = 72 800 →
        # 20k×0 + 20k×23% (4 600) + 32 800×27% (8 856) = 13 456 ;
        # abattement 40 % = 5 382,4 → plafonné 1 500 → IRG 11 956.
        assert Pay.compute_irg(Decimal("72800")) == Decimal("11956.00")

    def test_abattement_borne_min(self):
        # Petit IRG brut : abattement 40 % sous 1 000 → forcé à 1 000.
        # imposable 32 000 → hors lissage ? Non, 32 000 est dans la zone de
        # lissage — prendre un cas au-delà de 35 000 :
        # imposable 36 000 → barème : 16 000×23 % = 3 680 ;
        # 40 % = 1 472 → entre bornes → IRG = 2 208.
        assert Pay.compute_irg(Decimal("36000")) == Decimal("2208.00")

    def test_irg_croissant(self):
        # L'IRG effectif doit être monotone croissant avec le revenu.
        values = [Pay.compute_irg(Decimal(x)) for x in (29000, 31000, 34000, 36000, 50000, 100000, 400000)]
        assert values == sorted(values)


class TestBulletin:
    def test_bulletin_80000(self):
        p = Pay.compute_payslip(Decimal("80000"))
        assert p["cnas_employee"] == Decimal("7200.00")     # 9 %
        assert p["taxable_income"] == Decimal("72800.00")
        assert p["irg"] == Decimal("11956.00")
        assert p["net_salary"] == Decimal("60844.00")
        assert p["cnas_employer"] == Decimal("20800.00")    # 26 %
        assert p["total_employer_cost"] == Decimal("100800.00")

    def test_bulletin_snmg_sans_irg(self):
        p = Pay.compute_payslip(Decimal("25000"))
        assert p["irg"] == Decimal("0")
        assert p["net_salary"] == Decimal("22750.00")  # brut − 9 %

    def test_coherence_interne(self):
        p = Pay.compute_payslip(Decimal("150000"))
        assert p["gross_salary"] - p["cnas_employee"] == p["taxable_income"]
        assert p["taxable_income"] - p["irg"] == p["net_salary"]
        assert p["gross_salary"] + p["cnas_employer"] == p["total_employer_cost"]

    def test_brut_negatif_refuse(self):
        with pytest.raises(ValueError):
            Pay.compute_payslip(Decimal("-1"))
