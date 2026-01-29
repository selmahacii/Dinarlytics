import re
from typing import Dict, Any, Optional
import logging

# Essayer d'importer pytesseract et Pillow, mais ne pas planter si absents (mode dégradé)
try:
    from PIL import Image
    import pytesseract
    # Configuration sommaire pour windows si nécessaire, souvent tesseract est dans le PATH
    # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    HAS_OCR_LIBS = True
except ImportError:
    HAS_OCR_LIBS = False
    logging.warning("Bibliothèques OCR (Pillow, pytesseract) manquantes. Le service OCR fonctionnera en mode simulation.")


class OCRService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def extract_text(self, file_content: bytes, filename: str) -> str:
        """
        Extrait le texte brut d'une image ou PDF (conversion nécessaire pour PDF).
        Pour l'instant, gère principalement les images.
        """
        if not HAS_OCR_LIBS:
            self.logger.info("OCR non disponible, retour de texte simulé.")
            return self._get_mock_text()
        
        try:
            from io import BytesIO
            image = Image.open(BytesIO(file_content))
            # Utilisation du français par défaut
            text = pytesseract.image_to_string(image, lang='fra')
            return text
        except Exception as e:
            self.logger.error(f"Erreur OCR: {str(e)}")
            # Fallback en mode dev si ça échoue (ex: Tesseract pas installé)
            return self._get_mock_text()

    def parse_invoice_data(self, text: str) -> Dict[str, Any]:
        """
        Analyse le texte brut pour trouver: Date, Montant Total, NIF Fournisseur.
        """
        data = {
            "date": None,
            "total_amount": None,
            "merchant_nif": None,
            "merchant_name": None,  # Difficile sans base de données ou IA plus poussée
            "raw_text": text
        }

        # 1. Extraction Date (Formats JJ/MM/AAAA, JJ-MM-AAAA, AAAA-MM-JJ)
        # Regex améliorée pour capturer différents formats
        date_pattern = r'\b(\d{2}[/.-]\d{2}[/.-]\d{4})\b'
        dates = re.findall(date_pattern, text)
        if dates:
            # On prend la première date trouvée pour l'instant, souvent la date facture est en haut
            data["date"] = dates[0]

        # 2. Extraction NIF (15 ou 20 chiffres)
        # Cherche "NIF" ou "Matricule Fiscal" suivi de chiffres, avec ou sans espaces/deux-points
        nif_pattern = r'(?:N\.?I\.?F\.?|M\.?F\.?|Matricule Fiscal)\s*[:.]?\s*(\d{15,20})'
        nif_match = re.search(nif_pattern, text, re.IGNORECASE)
        if nif_match:
            data["merchant_nif"] = nif_match.group(1)
        else:
            # Tentative de trouver juste une suite de 15 chiffres isolée si précédée de rien de spécifique (plus risqué)
            nif_loose = re.search(r'\b(\d{15})\b', text)
            if nif_loose:
                data["merchant_nif"] = nif_loose.group(1)

        # 3. Extraction Montant Total
        # Cherche "Total TTC", "Net à payer", "Montant" suivi d'un nombre
        # Le nombre peut avoir des espaces (milliers) et une virgule/point décimal
        amount_patterns = [
            r'(?:Total\s+TTC|Net\s+à\s+payer|Montant\s+TTC)\s*[:.]?\s*([\d\s.,]+)',
            r'Total\s*[:.]?\s*([\d\s.,]+)\s*DZD'
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1)
                # Nettoyage du montant (enlever espaces, remplacer virgule par point)
                clean_amount = amount_str.replace(' ', '').replace(',', '.')
                # Parfois il reste des caractères non numériques à la fin
                try:
                    # Extraction du premier float valide dans la chaîne nettoyée
                    val = re.search(r'(\d+\.?\d*)', clean_amount)
                    if val:
                        data["total_amount"] = float(val.group(1))
                        break
                except ValueError:
                    continue

        return data

    def _get_mock_text(self) -> str:
        """Texte simulé pour le développement sans Tesseract."""
        return """
        EURL SUPER FOURNISSEUR
        Adresse: 12 Rue de la Liberté, Alger
        NIF: 002315012345678
        RC: 16/00-12345678
        
        FACTURE N° 2024-001
        Date: 25/01/2026
        
        Désignation       Qté    Prix U    Total
        Papier A4         10     500.00    5000.00
        Encre Imprimante   2     2500.00   5000.00
        
        Total HT: 10000.00
        TVA 19%: 1900.00
        Total TTC: 11900.00 DZD
        
        Arrêté la présente facture à la somme de: Onze mille neuf cents dinars.
        """

ocr_service = OCRService()
