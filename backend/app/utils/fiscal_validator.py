import re

def validate_nif(nif: str) -> bool:
    """
    Valide le Numéro d'Identification Fiscale (NIF) Algérien.
    Format standard actuel : 15 chiffres.
    Format ancien (encore accepté parfois) : 20 chiffres.
    """
    if not nif:
        return False
    
    # Doit être numérique
    if not nif.isdigit():
        return False
        
    # Longueur doit être 15 ou 20
    if len(nif) not in [15, 20]:
        return False
        
    # Validation du NIF 15 chiffres (Structure approximative)
    # Les 8 premiers chiffres concernent l'identification unique, les suivants l'activité/succursale
    # Validation basique de format
    return True

def validate_nis(nis: str) -> bool:
    """Valide le Numéro d'Identification Statistique (NIS)."""
    # NIS doit faire 15 chiffres aussi généralement
    return nis.isdigit() and len(nis) >= 5 # Basic check

def validate_rc(rc: str) -> bool:
    """Valide le Registre de Commerce (RC)."""
    # Format courant: code_wilaya/00/....
    return len(rc) > 5
