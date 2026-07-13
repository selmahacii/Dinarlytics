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
    ("445600", "État — TVA déductible", 4, "asset"),
    ("445700", "État — TVA collectée", 4, "liability"),
    ("447000", "État — Autres impôts et taxes (TAP, timbre)", 4, "liability"),
    # Compte bi-directionnel (solde débiteur OU créditeur selon le cas)
    ("467000", "Autres débiteurs/créditeurs divers", 4, "mixed"),

    # Classe 5 — Trésorerie
    ("511000", "Valeurs à l'encaissement (chèques/effets)", 5, "asset"),
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
    # Comptes de contre-actif (solde créditeur) : viennent en déduction des
    # immobilisations au bilan — ne jamais les classer "asset".
    ("2813000", "Amortissements des constructions", 2, "contra_asset"),
    ("2815000", "Amortissements du matériel et outillage", 2, "contra_asset"),
    ("2818000", "Amortissements des autres immobilisations corporelles", 2, "contra_asset"),
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


# ============================================================================
# Template international (IFRS-style, libellés anglais)
# ----------------------------------------------------------------------------
# Toute l'analyse financière du backend agrège par PRÉFIXE DE CLASSE numérique
# (1=equity/debt, 2=fixed assets, 3=inventory, 4=receivables/payables,
# 5=cash, 6=expenses, 7=revenue). Ce template conserve exactement cette
# structure — seuls les libellés changent — donc bilan, ratios, DSO, BFR et
# consolidation restent corrects pour une entreprise « internationale ».
# Seules les taxes spécifiquement algériennes (G50, timbre, TAP) n'ont de
# sens que pour le template SCF.
# ============================================================================
IFRS_EN_BASE_ACCOUNTS = [
    ("101000", "Share capital", 1, "equity"),
    ("106000", "Reserves", 1, "equity"),
    ("110000", "Retained earnings", 1, "equity"),
    ("120000", "Profit or loss for the period", 1, "equity"),
    ("164000", "Bank loans and borrowings", 1, "liability"),

    ("401000", "Trade payables", 4, "liability"),
    ("411000", "Trade receivables", 4, "asset"),
    ("421000", "Employee payables", 4, "liability"),
    ("431000", "Social security payables", 4, "liability"),
    ("444000", "Income tax payable", 4, "liability"),
    ("445600", "VAT recoverable (input)", 4, "asset"),
    ("445700", "VAT payable (output)", 4, "liability"),
    ("447000", "Other taxes payable", 4, "liability"),
    ("467000", "Other receivables/payables", 4, "mixed"),

    ("511000", "Cheques and instruments pending collection", 5, "asset"),
    ("512001", "Bank — main current account", 5, "asset"),
    ("530000", "Cash on hand", 5, "asset"),

    ("601000", "Purchases of goods", 6, "expense"),
    ("613000", "Rent expense", 6, "expense"),
    ("615000", "Repairs and maintenance", 6, "expense"),
    ("622000", "Professional fees", 6, "expense"),
    ("625000", "Travel and entertainment", 6, "expense"),
    ("626000", "Communication expenses", 6, "expense"),
    ("631000", "Taxes and duties", 6, "expense"),
    ("641000", "Salaries and wages", 6, "expense"),
    ("645000", "Social charges and benefits", 6, "expense"),
    ("661000", "Interest expense", 6, "expense"),
    ("681000", "Depreciation and amortization", 6, "expense"),

    ("701000", "Sales of goods", 7, "revenue"),
    ("706000", "Services revenue", 7, "revenue"),
    ("758000", "Other operating income", 7, "revenue"),
    ("768000", "Other financial income", 7, "revenue"),
]

IFRS_EN_FIXED_ASSETS = [
    ("205000", "Licenses, patents and software", 2, "asset"),
    ("213000", "Buildings", 2, "asset"),
    ("215000", "Plant and equipment", 2, "asset"),
    ("218000", "Other property and equipment (furniture, IT)", 2, "asset"),
    ("2813000", "Accumulated depreciation — buildings", 2, "contra_asset"),
    ("2815000", "Accumulated depreciation — plant and equipment", 2, "contra_asset"),
    ("2818000", "Accumulated depreciation — other assets", 2, "contra_asset"),
]

IFRS_EN_INVENTORY = [
    ("301000", "Raw materials inventory", 3, "asset"),
    ("355000", "Finished goods inventory", 3, "asset"),
    ("370000", "Merchandise inventory", 3, "asset"),
    ("6037000", "Change in merchandise inventory", 6, "expense"),
]

IFRS_EN_GROUP = [
    ("261000", "Investments in subsidiaries", 2, "asset"),
    ("451000", "Intercompany current accounts", 4, "asset"),
    ("108000", "Owner's / shareholder current account", 1, "equity"),
]

IFRS_EN_ADVANCED_TAX = [
    ("155000", "Provisions for risks and charges", 1, "liability"),
    ("695000", "Income tax expense", 6, "expense"),
    ("146000", "Foreign currency translation differences", 1, "liability"),
]

CHART_TEMPLATES = {
    "scf": {
        "base": None,  # rempli plus bas (BASE_ACCOUNTS déjà défini au-dessus)
        "fixed_assets": None,
        "inventory": None,
        "group": None,
        "advanced_tax": None,
    },
    "ifrs_en": {
        "base": IFRS_EN_BASE_ACCOUNTS,
        "fixed_assets": IFRS_EN_FIXED_ASSETS,
        "inventory": IFRS_EN_INVENTORY,
        "group": IFRS_EN_GROUP,
        "advanced_tax": IFRS_EN_ADVANCED_TAX,
    },
}


def build_chart_for_company(segment: str, company_type: str, has_inventory: bool = True, chart_template: str = "scf") -> list[tuple[str, str, int, str]]:
    """
    Détermine le sous-ensemble du plan comptable SCF pertinent pour une
    entreprise donnée, afin que rien de superflu ne soit imposé à une
    hiérarchie qui n'en a pas l'usage, et que rien d'indispensable au
    calcul du bilan/ratios ne manque.
    """
    segment = segment if segment in ALL_SEGMENTS else "micro"
    company_type = company_type if company_type in ALL_TYPES else "eurl"

    # Sélection du référentiel : SCF algérien (défaut) ou IFRS anglophone —
    # même structure de classes 1-7, donc l'analyse financière fonctionne
    # à l'identique.
    tpl = CHART_TEMPLATES.get(chart_template) or CHART_TEMPLATES["scf"]
    base = tpl["base"] or BASE_ACCOUNTS
    fixed_assets = tpl["fixed_assets"] or FIXED_ASSETS_ACCOUNTS
    inventory = tpl["inventory"] or INVENTORY_ACCOUNTS
    group = tpl["group"] or GROUP_ACCOUNTS
    advanced_tax = tpl["advanced_tax"] or ADVANCED_TAX_ACCOUNTS

    accounts = list(base)

    # Immobilisations : toute forme sociétaire (eurl/sarl/spa) en a besoin
    # dès sa création (matériel, mobilier) ; une personne physique/EIRL
    # micro n'en a l'usage qu'à partir d'un volume d'activité conséquent.
    if company_type in ("eurl", "sarl", "spa") or segment not in ("micro",):
        accounts += fixed_assets

    # Stocks : conditionné à l'activité déclarée (has_inventory), pas au
    # segment — un micro-commerçant a des stocks, un grand cabinet de
    # conseil n'en a pas.
    if has_inventory:
        accounts += inventory

    # Comptes de groupe : seulement à partir de medium (consolidation
    # inter-sociétés n'a de sens qu'avec une taille critique).
    if segment in ("medium", "large", "enterprise"):
        accounts += group

    # Fiscalité avancée : à partir de medium également.
    if segment in ("medium", "large", "enterprise"):
        accounts += advanced_tax

    return accounts
