from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict, Any
from app.services.ocr import ocr_service
from app.security import TokenData
from app.routers.auth import get_current_user

router = APIRouter(prefix="/ocr", tags=["ocr"])

@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_document(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Analyse un document (Image/PDF) pour extraire les donn????es comptables.
    Retourne : Date, Montant Total, NIF Fournisseur, et le texte brut.
    """
    # Validation du type de fichier
    if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
        raise HTTPException(status_code=400, detail="Format de fichier non support????. Utilisez JPG, PNG ou PDF.")
    
    try:
        content = await file.read()
        
        # 1. Extraction du texte (OCR)
        raw_text = ocr_service.extract_text(content, file.filename)
        
        # 2. Analyse s????mantique (RegEx)
        parsed_data = ocr_service.parse_invoice_data(raw_text)
        
        return {
            "success": True,
            "filename": file.filename,
            "data": parsed_data
        }
        
    except Exception as e:
        # En prod, logger l'erreur r????elle
        print(f"Erreur endpoint OCR: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'analyse du document.")
