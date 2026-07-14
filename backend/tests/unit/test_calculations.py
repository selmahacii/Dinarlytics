"""Tests des calculs financiers algériens (TVA, G50, IBS) — purs, sans base."""
from decimal import Decimal

from app.modules.finance.service_calculations import AlgerianFinancialCalculator as Calc


class TestTVA:
    def test_from_ht_taux_normal(self):
        r = Calc.calculate_from_ht(Decimal("100000"), Decimal("0.19"))
        assert r["tva"] == Decimal("19000.00")
        assert r["ttc"] == Decimal("119000.00")

    def test_from_ht_taux_reduit(self):
        r = Calc.calculate_from_ht(Decimal("10000"), Decimal("0.09"))
        assert r["tva"] == Decimal("900.00")
        assert r["ttc"] == Decimal("10900.00")

    def test_from_ttc_inverse_exact(self):
        r = Calc.calculate_from_ttc(Decimal("119000"), Decimal("0.19"))
        assert r["ht"] == Decimal("100000.00")
        assert r["tva"] == Decimal("19000.00")

    def test_aller_retour_ht_ttc(self):
        ht = Decimal("12345.67")
        ttc = Calc.calculate_from_ht(ht, Decimal("0.19"))["ttc"]
        back = Calc.calculate_from_ttc(ttc, Decimal("0.19"))["ht"]
        assert abs(back - ht) <= Decimal("0.01")


class TestG50:
    def test_tva_a_payer(self):
        r = Calc.calculate_g50_summary(Decimal("200000"), Decimal("50000"))
        assert r["tva_collected"] == 38000.0
        assert r["tva_deductible"] == 9500.0
        assert r["tva_to_pay"] == 28500.0
        assert r["credit_tva_reportable"] == 0.0

    def test_credit_tva_reportable(self):
        # Plus d'achats que de ventes → crédit de TVA, rien à payer
        r = Calc.calculate_g50_summary(Decimal("10000"), Decimal("100000"))
        assert r["tva_to_pay"] == 0.0
        assert r["credit_tva_reportable"] == 17100.0

    def test_total_du_inclut_tap_et_timbre(self):
        r = Calc.calculate_g50_summary(
            Decimal("100000"), Decimal("0"),
            irg_amount=Decimal("5000"), stamp_duty=Decimal("1190")
        )
        # TVA 19 000 + TAP 2 000 + IRG 5 000 + timbre 1 190
        assert r["total_due"] == 27190.0


class TestIBS:
    def test_taux_par_secteur(self):
        assert Calc.calculate_ibs(Decimal("1000000"), activity_sector="production")["ibs_amount"] == Decimal("190000")
        assert Calc.calculate_ibs(Decimal("1000000"), activity_sector="services")["ibs_amount"] == Decimal("260000")
        assert Calc.calculate_ibs(Decimal("1000000"), activity_sector="btph")["ibs_amount"] == Decimal("230000")

    def test_deficit_pas_d_impot_negatif(self):
        r = Calc.calculate_ibs(Decimal("-500000"))
        assert r["ibs_amount"] == Decimal("0")

    def test_reintegrations_et_deductions(self):
        r = Calc.calculate_ibs(
            Decimal("1000000"), reintegrations=Decimal("200000"),
            deductions=Decimal("100000"), activity_sector="services"
        )
        assert r["profit_taxable"] == Decimal("1100000")
        assert r["ibs_amount"] == Decimal("286000")
