"""
Profils fiscaux par pays.

Sépare les règles fiscales spécifiques à un pays (timbre algérien, TAP,
IBS, G50...) du moteur de facturation générique — avant ce module, la
règle algérienne du droit de timbre (1% espèces) et la G50 s'appliquaient
en dur à toute entreprise, quel que soit son pays.

Le profil est résolu à partir de Company.country (chaîne libre historique)
via resolve_country_code(), puis consulté par :
  - la création/mise à jour de facture (timbre, taux TVA par défaut)
  - les endpoints de déclaration (G50/liasse Jibaya : DZ uniquement)
  - le frontend (GET /fiscality/profile) pour n'afficher que les modules
    fiscaux pertinents pour le pays de l'entreprise.

Ajouter un pays = ajouter une entrée ici, sans toucher au moteur.
"""
from decimal import Decimal
from typing import Optional


TAX_PROFILES: dict[str, dict] = {
    "DZ": {
        "country_name": "Algérie",
        "currency": "DZD",
        # Taux de TVA légaux (loi de finances) — le premier est le taux normal.
        "vat_rates": [Decimal("0.19"), Decimal("0.09"), Decimal("0")],
        "default_vat_rate": Decimal("0.19"),
        # Droit de timbre : 1% du TTC pour paiement en espèces, au-delà
        # de 2 500 DA, arrondi au dinar supérieur.
        "stamp_duty": {
            "applies_to": "cash",
            "rate": Decimal("0.01"),
            "exemption_threshold": Decimal("2500"),
        },
        # TAP — impôt sur le CA du vendeur (déclaré en G50, jamais facturé
        # au client). Maintenue à 2% ici par cohérence avec le calculateur ;
        # abrogée progressivement par les lois de finances récentes, d'où
        # le flag configurable.
        "turnover_tax": {"name": "TAP", "rate": Decimal("0.02")},
        # Impôt sur les bénéfices par secteur (voir AlgerianFinancialCalculator.IBS_RATES)
        "corporate_tax": {"name": "IBS", "default_rate": Decimal("0.26")},
        # Déclarations disponibles pour ce pays.
        "declarations": ["g50", "liasse_jibaya"],
        "chart_template": "scf",
    },
    "FR": {
        "country_name": "France",
        "currency": "EUR",
        "vat_rates": [Decimal("0.20"), Decimal("0.10"), Decimal("0.055"), Decimal("0.021"), Decimal("0")],
        "default_vat_rate": Decimal("0.20"),
        "stamp_duty": None,          # pas de droit de timbre sur factures
        "turnover_tax": None,        # pas d'équivalent TAP
        "corporate_tax": {"name": "IS", "default_rate": Decimal("0.25")},
        "declarations": [],          # CA3/liasse FR non implémentées — rien d'algérien ne s'applique
        "chart_template": "scf",     # PCG français partage la structure de classes 1-7
    },
    "MA": {
        "country_name": "Maroc",
        "currency": "MAD",
        "vat_rates": [Decimal("0.20"), Decimal("0.14"), Decimal("0.10"), Decimal("0.07"), Decimal("0")],
        "default_vat_rate": Decimal("0.20"),
        "stamp_duty": None,
        "turnover_tax": None,
        "corporate_tax": {"name": "IS", "default_rate": Decimal("0.30")},
        "declarations": [],
        "chart_template": "scf",     # CGNC marocain : structure de classes compatible
    },
    "TN": {
        "country_name": "Tunisie",
        "currency": "TND",
        "vat_rates": [Decimal("0.19"), Decimal("0.13"), Decimal("0.07"), Decimal("0")],
        "default_vat_rate": Decimal("0.19"),
        "stamp_duty": {
            # Timbre fiscal tunisien : montant fixe par facture (1 TND depuis LF2022).
            "applies_to": "all",
            "fixed_amount": Decimal("1.000"),
        },
        "turnover_tax": None,
        "corporate_tax": {"name": "IS", "default_rate": Decimal("0.15")},
        "declarations": [],
        "chart_template": "scf",
    },
    # Profil générique : TVA unique configurable, aucune taxe locale —
    # pour tout pays non listé. Les montants restent corrects (HT+TVA),
    # seules les déclarations spécifiques sont indisponibles.
    "INTL": {
        "country_name": "International",
        "currency": "USD",
        "vat_rates": [Decimal("0.20"), Decimal("0.10"), Decimal("0.05"), Decimal("0")],
        "default_vat_rate": Decimal("0.20"),
        "stamp_duty": None,
        "turnover_tax": None,
        "corporate_tax": {"name": "CIT", "default_rate": Decimal("0.25")},
        "declarations": [],
        "chart_template": "ifrs_en",
    },
}

# Correspondance chaîne libre historique (Company.country) → code profil.
_COUNTRY_ALIASES = {
    "dz": "DZ", "algérie": "DZ", "algerie": "DZ", "algeria": "DZ", "الجزائر": "DZ",
    "fr": "FR", "france": "FR",
    "ma": "MA", "maroc": "MA", "morocco": "MA", "المغرب": "MA",
    "tn": "TN", "tunisie": "TN", "tunisia": "TN", "تونس": "TN",
}


def resolve_country_code(country: Optional[str]) -> str:
    """Résout Company.country (chaîne libre) vers un code de profil.
    Défaut : DZ (marché historique de l'application)."""
    if not country:
        return "DZ"
    return _COUNTRY_ALIASES.get(country.strip().lower(), "INTL")


def get_tax_profile(country: Optional[str]) -> dict:
    """Retourne le profil fiscal effectif pour un pays (chaîne libre ou code)."""
    code = country if country in TAX_PROFILES else resolve_country_code(country)
    return {**TAX_PROFILES[code], "code": code}


def compute_stamp_duty(profile: dict, ttc_before_stamp: Decimal, payment_mode: str) -> Decimal:
    """
    Droit de timbre selon le profil du pays.
    - DZ : 1% du TTC si paiement espèces et TTC > 2 500 DA, arrondi au
      dinar supérieur.
    - TN : montant fixe par facture.
    - Autres : 0.
    """
    from decimal import ROUND_CEILING

    stamp = profile.get("stamp_duty")
    if not stamp:
        return Decimal("0")

    applies_to = stamp.get("applies_to", "cash")
    if applies_to == "cash" and payment_mode != "cash":
        return Decimal("0")

    if "fixed_amount" in stamp:
        return Decimal(stamp["fixed_amount"])

    threshold = stamp.get("exemption_threshold", Decimal("0"))
    if ttc_before_stamp <= threshold:
        return Decimal("0")

    rate = stamp.get("rate", Decimal("0"))
    return (ttc_before_stamp * rate).quantize(Decimal("1"), rounding=ROUND_CEILING)
