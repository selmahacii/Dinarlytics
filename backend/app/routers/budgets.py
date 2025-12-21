from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/budgets", tags=["budgets"])

class LigneBudget(BaseModel):
    id: str
    code: str
    libelle: str
    categorie: str
    type: str
    compteComptable: str
    periode: str
    montantBudget: float
    montantReel: float
    ecart: float
    ecartPourcentage: float
    statut: str
    dateCreation: str
    dateModification: str

class Budget(BaseModel):
    id: str
    nom: str
    description: Optional[str] = None
    exercice: str
    type: str
    statut: str
    dateCreation: str
    dateDebut: str
    dateFin: str
    dateValidation: Optional[str] = None
    creePar: Optional[str] = None
    validePar: Optional[str] = None
    lignes: List[LigneBudget] = []

# In-memory sample data (replace with DB calls later)
_sample_budget = [
    Budget(
        id="bud-001",
        nom="Budget Initial 2025",
        description="Budget initial pour l'exercice 2025",
        exercice="2025",
        type="initial",
        statut="approuvé",
        dateCreation="2024-12-15",
        dateDebut="2025-01-01",
        dateFin="2025-12-31",
        dateValidation="2024-12-20",
        creePar="Admin",
        validePar="Manager",
        lignes=[
            LigneBudget(
                id="ligne-001",
                code="VTE-001",
                libelle="Ventes Produits",
                categorie="ventes",
                type="recette",
                compteComptable="701",
                periode="2025",
                montantBudget=12000000,
                montantReel=12500000,
                ecart=500000,
                ecartPourcentage=4.17,
                statut="depasse",
                dateCreation="2024-12-01",
                dateModification="2024-12-15",
            )
        ],
    )
]

@router.get("/", response_model=List[Budget])
def list_budgets():
    return _sample_budget

@router.get("/{budget_id}", response_model=Budget)
def get_budget(budget_id: str):
    for b in _sample_budget:
        if b.id == budget_id:
            return b
    raise HTTPException(status_code=404, detail="Budget not found")

@router.post("/", response_model=Budget)
def create_budget(budget: Budget):
    _sample_budget.append(budget)
    return budget

@router.put("/{budget_id}", response_model=Budget)
def update_budget(budget_id: str, budget: Budget):
    for i, b in enumerate(_sample_budget):
        if b.id == budget_id:
            _sample_budget[i] = budget
            return budget
    raise HTTPException(status_code=404, detail="Budget not found")

@router.delete("/{budget_id}")
def delete_budget(budget_id: str):
    global _sample_budget
    _sample_budget = [b for b in _sample_budget if b.id != budget_id]
    return {"status": "deleted"}
