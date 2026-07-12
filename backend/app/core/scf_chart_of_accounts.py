"""
Référentiel du Système Comptable Financier (SCF) algérien.

Chaque compte est taggé avec les segments/formes juridiques pour lesquels
il est pertinent, afin que le plan comptable provisionné à une entreprise
corresponde exactement à ce dont sa hiérarchie a besoin — ni trop (une
personne physique sous IFU n'a pas besoin d'immobilisations financières
ou de titres de participation), ni trop peu (toute entité avec stock a
besoin de la classe 3 complète pour que le BFR/DIO soient calculables).

`account_type` est le sens normal du solde (asset/liability/equity/
revenue/expense) — utilisé par les calculs de ratios (`AlgerianFinancialCalculator`,
`service_analytics.py`) pour classer chaque ligne d'écriture.

Segments : micro | small | medium | large | enterprise
Formes   : personne_physique | eirl | eurl | sarl | spa
"""

ALL_SEGMENTS = {"micro", "small", "medium", "large", "enterprise"}
ALL_TYPES = {"personne_physique", "eirl", "eurl", "sarl", "spa"}

# Comptes disponibles pour TOUTES les hiérarchies : le socle minimal SCF
# nécessaire pour que trésorerie, résultat, TVA et bilan simplifié soient
# calculables même pour un indépendant sous IFU.
BASE_ACCOUNTS = [
    # Classe 1 — Capitaux propres et dettes financières
    ("101000", "Capital social", 1, "equity"),
    ("106000", "Réserves", 1, "equity"),
    ("110000", "Report à nouveau", 1, "equity"),
    ("120000", "Résultat de l'exercice", 1, "equity"),
    ("164000", "Emprunts auprès des établissements de crédit", 1, "liability"),

    # Classe 4 — Tiers
    ("401000", "Fournisseurs", 4, "liability"),
    ("411000", "Clients", 4, "asset"),
    ("421000", "Personnel — rémunérations dues", 4, "liability"),
    ("431000", "Sécurité sociale (CNAS)", 4, "liability"),
    ("444000", "État — Impôt sur les bénéfices (IBS/IRG)", 4, "liability"),
    ("445000", "État — TVA collectée", 4, "liability"),
    ("445600", "État — TVA déductible", 4, "asset"),
    ("447000", "État — Autres impôts et taxes (TAP, timbre)", 4, "liability"),
    ("467000", "Autres débiteurs/créditeurs divers", 4, "asset"),

    # Classe 5 — Trésorerie
    ("512001", "Banque — Compte courant principal", 5, "asset"),
    ("530000", "Caisse", 5, "asset"),

    # Classe 6 — Charges
    ("601000", "Achats de marchandises", 6, "expense"),
    ("613000", "Locations", 6, "expense"),
    ("615000", "Entretien et réparations", 6, "expense"),
    ("622000", "Rémunérations d'intermédiaires et honoraires", 6, "expense"),
    ("625000", "Déplacements, missions et réceptions", 6, "expense"),
    ("626000", "Frais postaux et télécommunications", 6, "expense"),
    ("631000", "Impôts, taxes et versements assimilés", 6, "expense"),
    ("641000", "Charges de personnel — salaires", 6, "expense"),
    ("645000", "Charges de sécurité sociale et de prévoyance", 6, "expense"),
    ("661000", "Charges d'intérêts", 6, "expense"),
    ("681000", "Dotations aux amortissements", 6, "expense"),

    # Classe 7 — Produits
    ("701000", "Ventes de marchandises", 7, "revenue"),
    ("706000", "Prestations de services", 7, "revenue"),
    ("758000", "Produits divers de gestion courante", 7, "revenue"),
    ("768000", "Produits financiers divers", 7, "revenue"),
]

# Immobilisations et amortissements — pertinent dès qu'il y a un
# investissement matériel/outillage/véhicule à suivre. Non essentiel pour
# une personne physique en prestation de service pure sans actif immobilisé,
# mais toujours proposé à partir du segment "small" (a quasi toujours du
# matériel), et systématique pour eurl/sarl/spa.
FIXED_ASSETS_ACCOUNTS = [
    ("205000", "Concessions, brevets, licences", 2, "asset"),
    ("213000", "Constructions", 2, "asset"),
    ("215000", "Installations techniques, matériel et outillage", 2, "asset"),
    ("218000", "Autres immobilisations corporelles (mobilier, informatique)", 2, "asset"),
    ("2813000", "Amortissements des constructions", 2, "asset"),
    ("2815000", "Amortissements du matériel et outillage", 2, "asset"),
    ("2818000", "Amortissements des autres immobilisations corporelles", 2, "asset"),
]

# Stocks — uniquement pertinent pour une activité avec inventaire physique
# (commerce/distribution/production). Une activité de service pur (conseil,
# freelance) n'en a pas besoin : proposé sur demande via has_inventory.
INVENTORY_ACCOUNTS = [
    ("301000", "Stocks de matières premières", 3, "asset"),
    ("355000", "Stocks de produits finis", 3, "asset"),
    ("370000", "Stocks de marchandises", 3, "asset"),
    ("6037000", "Variation des stocks de marchandises", 6, "expense"),
]

# Structures de groupe (participations, opérations inter-sociétés) —
# uniquement pertinent pour large/enterprise avec filiales
# (consolidation, cf. router_consolidation.py).
GROUP_ACCOUNTS = [
    ("261000", "Titres de participation", 2, "asset"),
    ("451000", "Groupe — Comptes courants inter-sociétés", 4, "asset"),
    ("108000", "Compte de l'exploitant / apports en compte courant associé", 1, "equity"),
]

# IBS/IS avancé et provisions réglementées — pertinent à partir de
# medium (obligations de provisionnement, CET) ; une micro/small en
# régime réel simplifié n'a généralement pas ces écritures.
ADVANCED_TAX_ACCOUNTS = [
    ("155000", "Provisions pour risques et charges", 1, "liability"),
    ("695000", "Impôts sur les bénéfices (IBS)", 6, "expense"),
    ("146000", "Écart de conversion (dettes) — opérations en devises", 1, "liability"),
]


def build_chart_for_company(segment: str, company_type: str, has_inventory: bool = True) -> list[tuple[str, str, int, str]]:
    """
    Détermine le sous-ensemble du plan comptable SCF pertinent pour une
    entreprise donnée, afin que rien de superflu ne soit imposé à une
    hiérarchie qui n'en a pas l'usage, et que rien d'indispensable au
    calcul du bilan/ratios ne manque.
    """
    segment = segment if segment in ALL_SEGMENTS else "micro"
    company_type = company_type if company_type in ALL_TYPES else "eurl"

    accounts = list(BASE_ACCOUNTS)

    # Immobilisations : toute forme sociétaire (eurl/sarl/spa) en a besoin
    # dès sa création (matériel, mobilier) ; une personne physique/EIRL
    # micro n'en a l'usage qu'à partir d'un volume d'activité conséquent.
    if company_type in ("eurl", "sarl", "spa") or segment not in ("micro",):
        accounts += FIXED_ASSETS_ACCOUNTS

    # Stocks : conditionné à l'activité déclarée (has_inventory), pas au
    # segment — un micro-commerçant a des stocks, un grand cabinet de
    # conseil n'en a pas.
    if has_inventory:
        accounts += INVENTORY_ACCOUNTS

    # Comptes de groupe : seulement à partir de medium (consolidation
    # inter-sociétés n'a de sens qu'avec une taille critique).
    if segment in ("medium", "large", "enterprise"):
        accounts += GROUP_ACCOUNTS

    # Fiscalité avancée : à partir de medium également.
    if segment in ("medium", "large", "enterprise"):
        accounts += ADVANCED_TAX_ACCOUNTS

    return accounts
