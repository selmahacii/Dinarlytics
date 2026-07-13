from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from typing import Dict, Any, Optional
import os
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.modules.intelligence.service_ocr import ocr_service
from app.core.security import TokenData
from app.core.database import get_db
from app.modules.auth.router_auth import get_current_user
from app.modules.system.models_uploads import UploadedDocument
from app.modules.system.utils_audit import log_audit

router = APIRouter(prefix="/ocr", tags=["ocr"])

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "application/pdf"}
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10 Mo
UPLOAD_ROOT = Path(os.getenv("UPLOAD_STORAGE_PATH", "data/uploads"))


@router.post("/analyze", response_model=Dict[str, Any])
async def analyze_document(
    file: UploadFile = File(...),
    doc_type: Optional[str] = Form("autre"),
    persist: Optional[bool] = Form(True),
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Scanne un document (facture/devis/relevé, image ou PDF) pour en extraire
    les données comptables (date, montant, NIF), et le stocke pour
    traçabilité si persist=True (par défaut).
    Retourne toujours `simulated` : True signifie qu'aucune extraction réelle
    n'a pu être effectuée (dépendances OCR absentes) — les données renvoyées
    sont alors un exemple, pas une lecture du fichier fourni.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Format de fichier non supporté. Utilisez JPG, PNG ou PDF.")

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="Fichier trop volumineux (10 Mo maximum).")

    try:
        raw_text, simulated = ocr_service.extract_text(content, file.filename)
        parsed_data = ocr_service.parse_invoice_data(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'analyse du document: {e}")

    stored_path = None
    doc = None
    if persist:
        company_dir = UPLOAD_ROOT / str(current_user.company_id)
        company_dir.mkdir(parents=True, exist_ok=True)
        ext = Path(file.filename or "document").suffix or (".pdf" if file.content_type == "application/pdf" else ".jpg")
        stored_name = f"{uuid.uuid4()}{ext}"
        stored_path = company_dir / stored_name
        stored_path.write_bytes(content)

        doc = UploadedDocument(
            company_id=current_user.company_id,
            uploaded_by=current_user.user_id,
            doc_type=doc_type or "autre",
            original_filename=file.filename or stored_name,
            content_type=file.content_type,
            size_bytes=len(content),
            storage_path=str(stored_path)
        )
        db.add(doc)
        db.flush()
        log_audit(db, current_user, 'UPLOAD', 'DOCUMENT', str(doc.id), {'filename': file.filename, 'doc_type': doc_type})
        db.commit()

    return {
        "success": True,
        "simulated": simulated,
        "filename": file.filename,
        "document_id": str(doc.id) if doc else None,
        "data": parsed_data
    }


@router.get("/documents", response_model=list)
async def list_uploaded_documents(
    doc_type: Optional[str] = None,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Liste les documents scannés/uploadés pour l'entreprise courante."""
    query = db.query(UploadedDocument).filter(UploadedDocument.company_id == current_user.company_id)
    if doc_type:
        query = query.filter(UploadedDocument.doc_type == doc_type)
    docs = query.order_by(UploadedDocument.created_at.desc()).limit(200).all()
    return [
        {
            "id": str(d.id),
            "filename": d.original_filename,
            "doc_type": d.doc_type,
            "content_type": d.content_type,
            "size_bytes": d.size_bytes,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "linked_entity_type": d.linked_entity_type,
            "linked_entity_id": str(d.linked_entity_id) if d.linked_entity_id else None
        }
        for d in docs
    ]
