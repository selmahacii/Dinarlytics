import re
from typing import Dict, Any
import logging

# Chaque dépendance est optionnelle et dégrade proprement si absente :
# - PyMuPDF (fitz) : extrait le texte natif d'un PDF sans OCR (fonctionne
#   sans aucun binaire externe — c'est le cas majoritaire pour une facture
#   PDF générée par un logiciel, pas un scan papier).
# - Pillow + pytesseract : OCR d'image/PDF scanné, nécessite le binaire
#   Tesseract installé sur le système.
try:
    import fitz  # PyMuPDF
    HAS_PDF_TEXT = True
except ImportError:
    HAS_PDF_TEXT = False

try:
    from PIL import Image
    import pytesseract
    HAS_OCR_LIBS = True
except ImportError:
    HAS_OCR_LIBS = False
    logging.warning("Bibliothèques OCR (Pillow, pytesseract) manquantes. Le scan d'images fonctionnera en mode simulation.")


class OCRService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def extract_text(self, file_content: bytes, filename: str) -> tuple[str, bool]:
        """
        Extrait le texte d'une image ou d'un PDF.
        Retourne (texte, simulated) — simulated=True quand aucune extraction
        réelle n'a été possible et qu'un texte d'exemple est renvoyé à la
        place (le frontend doit alors avertir l'utilisateur, pas afficher
        les valeurs comme si elles étaient réelles).
        """
        is_pdf = filename.lower().endswith('.pdf') or file_content[:4] == b'%PDF'

        if is_pdf and HAS_PDF_TEXT:
            try:
                doc = fitz.open(stream=file_content, filetype="pdf")
                text = "\n".join(page.get_text() for page in doc)
                doc.close()
                if text.strip():
                    return text, False
                # PDF sans couche texte (scan image) : tenter l'OCR sur la 1ère page
                if HAS_OCR_LIBS:
                    doc = fitz.open(stream=file_content, filetype="pdf")
                    pix = doc[0].get_pixmap(dpi=200)
                    img_bytes = pix.tobytes("png")
                    doc.close()
                    return self._ocr_image_bytes(img_bytes)
            except Exception as e:
                self.logger.error(f"Erreur extraction PDF: {e}")

        if not is_pdf and HAS_OCR_LIBS:
            return self._ocr_image_bytes(file_content)

        self.logger.info("Extraction réelle impossible (dépendances manquantes ou PDF scanné sans OCR), retour de texte simulé.")
        return self._get_mock_text(), True

    def _ocr_image_bytes(self, file_content: bytes) -> tuple[str, bool]:
        try:
            from io import BytesIO
            image = Image.open(BytesIO(file_content))
            text = pytesseract.image_to_string(image, lang='fra')
            return text, False
        except Exception as e:
            self.logger.error(f"Erreur OCR: {str(e)}")
            return self._get_mock_text(), True

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
        date_pattern = r'\b(\d{2}[/.-]\d{2}[/.-]\d{4})\b'
        dates = re.findall(date_pattern, text)
        if dates:
            data["date"] = dates[0]

        # 2. Extraction NIF (15 ou 20 chiffres)
        nif_pattern = r'(?:N\.?I\.?F\.?|M\.?F\.?|Matricule Fiscal)\s*[:.]?\s*(\d{15,20})'
        nif_match = re.search(nif_pattern, text, re.IGNORECASE)
        if nif_match:
            data["merchant_nif"] = nif_match.group(1)
        else:
            nif_loose = re.search(r'\b(\d{15})\b', text)
            if nif_loose:
                data["merchant_nif"] = nif_loose.group(1)

        # 3. Extraction Montant Total
        amount_patterns = [
            r'(?:Total\s+TTC|Net\s+à\s+payer|Montant\s+TTC)\s*[:.]?\s*([\d\s.,]+)',
            r'Total\s*[:.]?\s*([\d\s.,]+)\s*DZD'
        ]

        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1)
                clean_amount = amount_str.replace(' ', '').replace(',', '.')
                try:
                    val = re.search(r'(\d+\.?\d*)', clean_amount)
                    if val:
                        data["total_amount"] = float(val.group(1))
                        break
                except ValueError:
                    continue

        return data

    def _get_mock_text(self) -> str:
        """Texte d'exemple utilisé UNIQUEMENT quand aucune extraction réelle
        n'est possible — toujours accompagné de simulated=True côté appelant."""
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
