from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.modules.auth.router_auth import get_current_user
from app.core.security import TokenData
from app.core.models import Employee
from app.modules.system.utils_audit import log_audit

router = APIRouter(prefix="/rh/employees", tags=["hr"])

class EmployeeCreateRequest(BaseModel):
    matricule: str
    nom: str
    prenom: str
    poste: str
    department: str
    contractType: str
    dateEmbauche: str
    salaireBase: float
    primes: Optional[float] = 0.0
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    status: Optional[str] = "actif"

class EmployeeResponse(BaseModel):
    id: str
    matricule: str
    nom: str
    prenom: str
    poste: str
    department: str
    contractType: str
    dateEmbauche: str
    salaireBase: float
    primes: float
    email: Optional[str]
    telephone: Optional[str]
    status: str

@router.get("", response_model=List[EmployeeResponse])
async def list_employees(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    company_id = current_user.company_id
    employees = db.query(Employee).filter(Employee.company_id == company_id).all()
    
    return [
        EmployeeResponse(
            id=str(emp.id),
            matricule=emp.matricule,
            nom=emp.nom,
            prenom=emp.prenom,
            poste=emp.poste,
            department=emp.department,
            contractType=emp.contract_type,
            dateEmbauche=emp.date_embauche.strftime("%Y-%m-%d"),
            salaireBase=float(emp.salaire_base),
            primes=float(emp.primes or 0),
            email=emp.email,
            telephone=emp.telephone,
            status=emp.status
        )
        for emp in employees
    ]

@router.get("/{id}", response_model=EmployeeResponse)
async def get_employee(
    id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    company_id = current_user.company_id
    emp = db.query(Employee).filter(Employee.id == id, Employee.company_id == company_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    return EmployeeResponse(
        id=str(emp.id),
        matricule=emp.matricule,
        nom=emp.nom,
        prenom=emp.prenom,
        poste=emp.poste,
        department=emp.department,
        contractType=emp.contract_type,
        dateEmbauche=emp.date_embauche.strftime("%Y-%m-%d"),
        salaireBase=float(emp.salaire_base),
        primes=float(emp.primes or 0),
        email=emp.email,
        telephone=emp.telephone,
        status=emp.status
    )

@router.post("", response_model=EmployeeResponse)
async def create_employee(
    req: EmployeeCreateRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    company_id = current_user.company_id
    try:
        dt_embauche = datetime.strptime(req.dateEmbauche, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
        
    emp = Employee(
        company_id=company_id,
        matricule=req.matricule,
        nom=req.nom,
        prenom=req.prenom,
        poste=req.poste,
        department=req.department,
        contract_type=req.contractType,
        date_embauche=dt_embauche,
        salaire_base=Decimal(str(req.salaireBase)),
        primes=Decimal(str(req.primes or 0.0)),
        email=req.email,
        telephone=req.telephone,
        status=req.status or "actif"
    )
    
    db.add(emp)
    log_audit(db, current_user, 'CREATE', 'EMPLOYEE', None, {'matricule': request.matricule, 'nom': request.nom})
    db.commit()
    db.refresh(emp)
    
    return EmployeeResponse(
        id=str(emp.id),
        matricule=emp.matricule,
        nom=emp.nom,
        prenom=emp.prenom,
        poste=emp.poste,
        department=emp.department,
        contractType=emp.contract_type,
        dateEmbauche=emp.date_embauche.strftime("%Y-%m-%d"),
        salaireBase=float(emp.salaire_base),
        primes=float(emp.primes or 0),
        email=emp.email,
        telephone=emp.telephone,
        status=emp.status
    )

@router.put("/{id}", response_model=EmployeeResponse)
async def update_employee(
    id: str,
    req: EmployeeCreateRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    company_id = current_user.company_id
    emp = db.query(Employee).filter(Employee.id == id, Employee.company_id == company_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    try:
        dt_embauche = datetime.strptime(req.dateEmbauche, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
        
    emp.matricule = req.matricule
    emp.nom = req.nom
    emp.prenom = req.prenom
    emp.poste = req.poste
    emp.department = req.department
    emp.contract_type = req.contractType
    emp.date_embauche = dt_embauche
    emp.salaire_base = Decimal(str(req.salaireBase))
    emp.primes = Decimal(str(req.primes or 0.0))
    emp.email = req.email
    emp.telephone = req.telephone
    emp.status = req.status
    
    log_audit(db, current_user, 'UPDATE', 'EMPLOYEE', str(emp.id) if hasattr(emp, 'id') else None, {'matricule': getattr(emp, 'matricule', None)})
    db.commit()
    db.refresh(emp)
    
    return EmployeeResponse(
        id=str(emp.id),
        matricule=emp.matricule,
        nom=emp.nom,
        prenom=emp.prenom,
        poste=emp.poste,
        department=emp.department,
        contractType=emp.contract_type,
        dateEmbauche=emp.date_embauche.strftime("%Y-%m-%d"),
        salaireBase=float(emp.salaire_base),
        primes=float(emp.primes or 0),
        email=emp.email,
        telephone=emp.telephone,
        status=emp.status
    )

@router.delete("/{id}")
async def delete_employee(
    id: str,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user)
):
    company_id = current_user.company_id
    emp = db.query(Employee).filter(Employee.id == id, Employee.company_id == company_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    db.delete(emp)
    log_audit(db, current_user, 'DELETE', 'EMPLOYEE', str(emp.id) if hasattr(emp, 'id') else None, {'matricule': getattr(emp, 'matricule', None)})
    db.commit()
    return {"status": "success", "message": "Employee deleted"}
