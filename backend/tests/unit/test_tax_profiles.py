"""Tests du moteur de profils fiscaux multi-pays — purs, sans base."""
from decimal import Decimal

from app.core.tax_profiles import (
    TAX_PROFILES,
    compute_stamp_duty,
    get_tax_profile,
    resolve_country_code,
)


class TestResolution:
    def test_alias_algerie(self):
        for alias in ("Algérie", "algerie", "Algeria", "DZ", "dz", None, ""):
            assert resolve_country_code(alias) == "DZ"

    def test_alias_autres_pays(self):
        assert resolve_country_code("France") == "FR"
        assert resolve_country_code("Maroc") == "MA"
        assert resolve_country_code("Tunisie") == "TN"

    def test_pays_inconnu_vers_generique(self):
        assert resolve_country_code("Germany") == "INTL"
        assert resolve_country_code("Japon") == "INTL"

    def test_profil_expose_son_code(self):
        assert get_tax_profile("France")["code"] == "FR"
        assert get_tax_profile("DZ")["code"] == "DZ"


class TestCoherenceProfils:
    def test_taux_normal_en_premier(self):
        for code, profile in TAX_PROFILES.items():
            assert profile["vat_rates"][0] == profile["default_vat_rate"], code

    def test_seule_l_algerie_a_la_g50(self):
        for code, profile in TAX_PROFILES.items():
            if code == "DZ":
                assert "g50" in profile["declarations"]
            else:
                assert "g50" not in profile["declarations"], (
                    f"La G50 est algérienne : elle ne doit pas apparaître dans le profil {code}"
                )


class TestTimbre:
    def test_dz_especes_au_dela_du_seuil(self):
        dz = get_tax_profile("DZ")
        assert compute_stamp_duty(dz, Decimal("119000"), "cash") == Decimal("1190")

    def test_dz_arrondi_au_dinar_superieur(self):
        dz = get_tax_profile("DZ")
        assert compute_stamp_duty(dz, Decimal("100001"), "cash") == Decimal("1001")

    def test_dz_virement_exonere(self):
        dz = get_tax_profile("DZ")
        assert compute_stamp_duty(dz, Decimal("119000"), "transfer") == Decimal("0")

    def test_dz_sous_le_seuil_exonere(self):
        dz = get_tax_profile("DZ")
        assert compute_stamp_duty(dz, Decimal("2000"), "cash") == Decimal("0")

    def test_fr_jamais_de_timbre(self):
        fr = get_tax_profile("FR")
        assert compute_stamp_duty(fr, Decimal("1000000"), "cash") == Decimal("0")

    def test_tn_montant_fixe_tout_mode(self):
        tn = get_tax_profile("TN")
        assert compute_stamp_duty(tn, Decimal("500"), "transfer") == Decimal("1.000")
        assert compute_stamp_duty(tn, Decimal("500"), "cash") == Decimal("1.000")
