from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

from app.core.database import get_db
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from app.core.models import Immobilisation

router = APIRouter(prefix="/amortissements", tags=["depreciation"])

class AssetResponse(BaseModel):
    id: str
    code: str
    designation: str
    categorie: str
    dateAcquisition: str
    dureeVie: int
    valeurAcquisition: float
    valeurResiduelle: float
    methode: str
    tauxAmort: float
    departement: Optional[str]
    fournisseur: Optional[str]
    status: str
    comptePCA: Optional[str]
    compteIFRS: Optional[str]

class SummaryResponse(BaseModel):
    totalBrut: float
    totalNet: float
    amortCumule: float
    dotationAnnuelle: float

class DepreciationResponse(BaseModel):
    assets: List[AssetResponse]
    summary: SummaryResponse

def calculate_depreciation(immo: Immobilisation, current_year: int = 2024):
    acq_year = immo.date_acquisition.year
    years_elapsed = max(0, current_year - acq_year)
    valeur_amortissable = float(immo.valeur_acquisition - immo.valeur_residuelle)
    
    amort_annuel = 0.0
    amort_cumul = 0.0
    
    if immo.methode == 'lineaire':
        if immo.duree_vie > 0:
            amort_annuel = valeur_amortissable / immo.duree_vie
        amort_cumul = min(valeur_amortissable, amort_annuel * years_elapsed)
    elif immo.methode == 'degressif':
        valeur_restante = valeur_amortissable
        taux = float(immo.taux_amort) / 100.0
        for i in range(years_elapsed):
            if i >= immo.duree_vie:
                break
            annuel = valeur_restante * taux
            amort_cumul += annuel
            if i == years_elapsed - 1:
                amort_annuel = annuel
            valeur_restante -= annuel
        amort_cumul = min(amort_cumul, valeur_amortissable)
        
    return {
        "amortAnnuel": amort_annuel,
        "amortCumul": amort_cumul,
        "valeurNette": float(immo.valeur_acquisition) - amort_cumul
    }

@router.get("", response_model=DepreciationResponse)
async def get_depreciation_report(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get all company assets and calculate their deprecation status dynamically
    """
    company_id = current_user.company_id
    assets_db = db.query(Immobilisation).filter(Immobilisation.company_id == company_id).all()
    
    current_year = datetime.utcnow().year
    
    assets_list = []
    total_brut = 0.0
    total_net = 0.0
    total_amort_cumule = 0.0
    total_dotation_annuelle = 0.0
    
    for immo in assets_db:
        depr = calculate_depreciation(immo, current_year)
        
        total_brut += float(immo.valeur_acquisition)
        total_net += depr["valeurNette"]
        total_amort_cumule += depr["amortCumul"]
        total_dotation_annuelle += depr["amortAnnuel"]
        
        assets_list.append(AssetResponse(
            id=str(immo.id),
            code=immo.code,
            designation=immo.designation,
            categorie=immo.categorie,
            dateAcquisition=immo.date_acquisition.strftime("%Y-%m-%d"),
            dureeVie=immo.duree_vie,
            valeurAcquisition=float(immo.valeur_acquisition),
            valeurResiduelle=float(immo.valeur_residuelle),
            methode=immo.methode,
            tauxAmort=float(immo.taux_amort),
            departement=immo.departement,
            fournisseur=immo.fournisseur,
            status=immo.status,
            comptePCA=immo.compte_pca,
            compteIFRS=immo.compte_ifrs
        ))
        
    return DepreciationResponse(
        assets=assets_list,
        summary=SummaryResponse(
            totalBrut=total_brut,
            totalNet=total_net,
            amortCumule=total_amort_cumule,
            dotationAnnuelle=total_dotation_annuelle
        )
    )


class CreateAssetRequest(BaseModel):
    code: str
    designation: str
    categorie: str
    dateAcquisition: str
    dureeVie: int
    valeurAcquisition: float
    valeurResiduelle: float = 0
    methode: str = "lineaire"
    tauxAmort: float
    departement: Optional[str] = None
    fournisseur: Optional[str] = None
    comptePCA: Optional[str] = None
    compteIFRS: Optional[str] = None


@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    request: CreateAssetRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new fixed asset (immobilisation) — the 'Ajouter' button in
    TableauAmortissements.tsx previously had no onClick and no backend
    endpoint existed to persist a new asset."""
    immo = Immobilisation(
        company_id=current_user.company_id,
        code=request.code,
        designation=request.designation,
        categorie=request.categorie,
        date_acquisition=datetime.strptime(request.dateAcquisition, "%Y-%m-%d").date(),
        duree_vie=request.dureeVie,
        valeur_acquisition=Decimal(str(request.valeurAcquisition)),
        valeur_residuelle=Decimal(str(request.valeurResiduelle)),
        methode=request.methode,
        taux_amort=Decimal(str(request.tauxAmort)),
        departement=request.departement,
        fournisseur=request.fournisseur,
        status="active",
        compte_pca=request.comptePCA,
        compte_ifrs=request.compteIFRS
    )
    db.add(immo)
    db.commit()
    db.refresh(immo)

    depr = calculate_depreciation(immo, datetime.utcnow().year)
    return AssetResponse(
        id=str(immo.id),
        code=immo.code,
        designation=immo.designation,
        categorie=immo.categorie,
        dateAcquisition=immo.date_acquisition.strftime("%Y-%m-%d"),
        dureeVie=immo.duree_vie,
        valeurAcquisition=float(immo.valeur_acquisition),
        valeurResiduelle=float(immo.valeur_residuelle),
        methode=immo.methode,
        tauxAmort=float(immo.taux_amort),
        departement=immo.departement,
        fournisseur=immo.fournisseur,
        status=immo.status,
        comptePCA=immo.compte_pca,
        compteIFRS=immo.compte_ifrs
    )
