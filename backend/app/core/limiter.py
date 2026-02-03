from slowapi import Limiter
from slowapi.util import get_remote_address

# Initialisation du Rate Limiter
# Utilise l'adresse IP du client pour l'identification
limiter = Limiter(key_func=get_remote_address)
