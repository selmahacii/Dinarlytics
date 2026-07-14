"""Tests de cohérence du référentiel SCF et du provisioning par hiérarchie."""
from app.core.scf_chart_of_accounts import (
    ALL_SEGMENTS,
    ALL_TYPES,
    build_chart_for_company,
)

VALID_TYPES = {"asset", "liability", "equity", "revenue", "expense", "contra_asset", "mixed"}


def _all_variants():
    for segment in ALL_SEGMENTS:
        for ctype in ALL_TYPES:
            for template in ("scf", "ifrs_en"):
                yield segment, ctype, template


class TestCoherenceReferentiel:
    def test_premier_chiffre_egale_classe(self):
        # Toute l'analyse financière agrège par préfixe de classe : un code
        # dont le 1er chiffre ne correspond pas à la classe déclarée
        # corromprait bilan, ratios et G50.
        for segment, ctype, template in _all_variants():
            for code, name, klass, acc_type in build_chart_for_company(segment, ctype, True, template):
                assert int(code[0]) == klass, f"{template}/{code} '{name}': code en classe {code[0]} mais déclaré {klass}"

    def test_types_valides(self):
        for segment, ctype, template in _all_variants():
            for code, name, klass, acc_type in build_chart_for_company(segment, ctype, True, template):
                assert acc_type in VALID_TYPES, f"{template}/{code}: type inconnu '{acc_type}'"

    def test_pas_de_doublon_de_code(self):
        for segment, ctype, template in _all_variants():
            codes = [c[0] for c in build_chart_for_company(segment, ctype, True, template)]
            assert len(codes) == len(set(codes)), f"doublons dans {template}/{segment}/{ctype}"

    def test_amortissements_en_contre_actif(self):
        chart = dict(
            (code, acc_type)
            for code, _, _, acc_type in build_chart_for_company("enterprise", "spa", True, "scf")
        )
        for code in ("2813000", "2815000", "2818000"):
            assert chart[code] == "contra_asset", (
                f"{code} est un compte d'amortissement (solde créditeur) : "
                f"le taguer '{chart[code]}' surestimerait l'actif net"
            )

    def test_comptes_d_imputation_facture_presents(self):
        # La validation de facture poste sur 411000/701000/445700/447000 :
        # ces comptes doivent exister dans TOUT plan provisionné, sinon les
        # écritures tombent hors référentiel.
        for segment, ctype, template in _all_variants():
            codes = {c[0] for c in build_chart_for_company(segment, ctype, True, template)}
            for required in ("411000", "701000", "445700", "447000"):
                assert required in codes, f"{required} absent de {template}/{segment}/{ctype}"


class TestHierarchie:
    def test_micro_sans_comptes_de_groupe(self):
        codes = {c[0] for c in build_chart_for_company("micro", "eurl", True)}
        assert "261000" not in codes  # titres de participation
        assert "451000" not in codes  # comptes courants intercos

    def test_enterprise_avec_comptes_de_groupe(self):
        codes = {c[0] for c in build_chart_for_company("enterprise", "spa", True)}
        assert "261000" in codes
        assert "155000" in codes  # provisions (fiscalité avancée)
        assert "695000" in codes  # IBS

    def test_sans_stock_pas_de_classe_3(self):
        codes = {c[0] for c in build_chart_for_company("micro", "personne_physique", has_inventory=False)}
        assert not any(c.startswith("3") for c in codes)

    def test_avec_stock_classe_3_presente(self):
        codes = {c[0] for c in build_chart_for_company("micro", "eurl", has_inventory=True)}
        assert any(c.startswith("3") for c in codes)

    def test_template_ifrs_meme_structure_de_classes(self):
        # Le template international doit préserver la structure 1-7 pour
        # que l'analyse par préfixe de classe reste correcte.
        scf = {c[0] for c in build_chart_for_company("enterprise", "spa", True, "scf")}
        ifrs = {c[0] for c in build_chart_for_company("enterprise", "spa", True, "ifrs_en")}
        assert scf == ifrs  # mêmes codes, seuls les libellés diffèrent

    def test_hierarchie_croissante(self):
        # Une entreprise plus grande ne doit jamais avoir MOINS de comptes.
        micro = len(build_chart_for_company("micro", "personne_physique", False))
        small = len(build_chart_for_company("small", "eurl", True))
        enterprise = len(build_chart_for_company("enterprise", "spa", True))
        assert micro < small < enterprise
