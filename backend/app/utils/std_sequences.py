from sqlalchemy.orm import Session
from sqlalchemy import text

def generate_document_number(db: Session, model, column, company_id, prefix, date_obj):
    """
    Génère un numéro séquentiel format PREFIX/ANNEE/SEQ (ex: FACT/2026/00001)
    Réinitialise la séquence chaque année.
    """
    year = date_obj.year
    pattern = f"{prefix}/{year}/%"
    
    # Recherche du dernier numéro pour cette année
    # On utilise column directement dans le filter
    last = db.query(column).filter(
        model.company_id == company_id,
        column.like(pattern)
    ).order_by(column.desc()).first()
    
    if last:
        try:
            # last est un Row(val) ou un tuple (val,) selon la version SQLAlchemy
            val = last[0] if isinstance(last, tuple) or hasattr(last, '__getitem__') else last
            # On suppose le format PREFIX/YEAR/SEQ
            parts = val.split('/')
            if len(parts) == 3 and parts[2].isdigit():
                seq = int(parts[2])
                new_seq = seq + 1
            else:
                new_seq = 1
        except Exception:
            new_seq = 1
    else:
        new_seq = 1
    
    return f"{prefix}/{year}/{str(new_seq).zfill(5)}"
