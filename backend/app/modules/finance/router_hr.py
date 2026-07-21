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
    db.flush()
    log_audit(db, current_user, 'CREATE', 'EMPLOYEE', str(emp.id), {'matricule': req.matricule, 'nom': req.nom})
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
        
    old_values = {
        'salaire_base': str(emp.salaire_base), 'primes': str(emp.primes),
        'status': emp.status, 'poste': emp.poste, 'department': emp.department
    }

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

    log_audit(db, current_user, 'UPDATE', 'EMPLOYEE', str(emp.id), {
        'matricule': emp.matricule, 'salaire_base': str(emp.salaire_base),
        'primes': str(emp.primes), 'status': emp.status
    }, old_values=old_values)
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


# ========== PAIE (IRG/CNAS Algérie) ==========

class PayrollSimulationRequest(BaseModel):
    gross_salary: Decimal


@router.post("/payroll/simulate")
async def simulate_payroll(
    request: PayrollSimulationRequest,
    current_user: TokenData = Depends(get_current_user),
):
    """
    Simulation de bulletin de paie algérien : brut → CNAS salarié 9 % →
    imposable → IRG (barème mensuel LF2022, exonération ≤ 30 000 DA,
    lissage 30 000–35 000) → net, plus le coût employeur (CNAS 26 %).
    """
    from app.modules.finance.service_payroll import AlgerianPayrollCalculator
    if request.gross_salary < 0:
        raise HTTPException(status_code=400, detail="Le salaire brut ne peut pas être négatif")
    result = AlgerianPayrollCalculator.compute_payslip(request.gross_salary)
    return {k: float(v) for k, v in result.items()}


@router.get("/payroll/summary")
async def payroll_summary(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Masse salariale réelle de l'entreprise : bulletins calculés sur les
    salaires de base des employés actifs (IRG/CNAS réels, pas d'estimation
    forfaitaire) + totaux agrégés pour l'analyse financière.
    """
    from app.modules.finance.service_payroll import AlgerianPayrollCalculator
    employees = db.query(Employee).filter(
        Employee.company_id == current_user.company_id,
        Employee.status == 'actif'
    ).all()

    total = {
        "headcount": len(employees),
        "total_gross": 0.0, "total_cnas_employee": 0.0, "total_irg": 0.0,
        "total_net": 0.0, "total_cnas_employer": 0.0, "total_employer_cost": 0.0
    }
    payslips = []
    for emp in employees:
        gross = Decimal(str((emp.salaire_base or 0))) + Decimal(str((emp.primes or 0)))
        slip = AlgerianPayrollCalculator.compute_payslip(gross)
        total["total_gross"] += float(slip["gross_salary"])
        total["total_cnas_employee"] += float(slip["cnas_employee"])
        total["total_irg"] += float(slip["irg"])
        total["total_net"] += float(slip["net_salary"])
        total["total_cnas_employer"] += float(slip["cnas_employer"])
        total["total_employer_cost"] += float(slip["total_employer_cost"])
        payslips.append({
            "employee_id": str(emp.id),
            **{k: float(v) for k, v in slip.items()}
        })

    total["payslips"] = payslips
    return total


class ValidatePayrollRequest(BaseModel):
    period: str  # "YYYY-MM"


@router.post("/payroll/validate")
async def validate_payroll(
    request: ValidatePayrollRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Valide la paie d'une période et génère l'écriture comptable réelle
    (charges 641/645, dettes 421/431/444) — jusqu'ici le module RH était
    totalement isolé de la comptabilité : /payroll/simulate et
    /payroll/summary étaient purement calculatoires, sans aucune trace
    comptable ni persistance d'un cycle de paie.
    """
    from app.core.security import RBACManager
    from app.modules.finance.service_payroll import AlgerianPayrollCalculator
    from app.core.models import PayrollRun, JournalEntry, JournalEntryLine
    from app.core.sequences import generate_document_number

    if not RBACManager.check_permission(current_user.roles, "approve"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Payroll validation requires approval permission")

    existing = db.query(PayrollRun).filter(
        PayrollRun.company_id == current_user.company_id,
        PayrollRun.period == request.period
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"La paie de la période {request.period} a déjà été validée")

    employees = db.query(Employee).filter(
        Employee.company_id == current_user.company_id,
        Employee.status == 'actif'
    ).all()
    if not employees:
        raise HTTPException(status_code=400, detail="Aucun employé actif — rien à valider")

    total_gross = Decimal('0')
    total_cnas_employee = Decimal('0')
    total_irg = Decimal('0')
    total_net = Decimal('0')
    total_cnas_employer = Decimal('0')
    for emp in employees:
        gross = Decimal(str((emp.salaire_base or 0))) + Decimal(str((emp.primes or 0)))
        slip = AlgerianPayrollCalculator.compute_payslip(gross)
        total_gross += slip["gross_salary"]
        total_cnas_employee += slip["cnas_employee"]
        total_irg += slip["irg"]
        total_net += slip["net_salary"]
        total_cnas_employer += slip["cnas_employer"]

    year, month = map(int, request.period.split('-'))
    entry_date = date(year, month, 1)

    entry_number = generate_document_number(db, JournalEntry, JournalEntry.entry_number, current_user.company_id, "PAIE", entry_date)
    entry = JournalEntry(
        company_id=current_user.company_id,
        entry_number=entry_number,
        entry_date=entry_date,
        description=f"Paie {request.period} — {len(employees)} employé(s)",
        journal_type="OD",
        status="approved",
        created_by=current_user.user_id,
        total_debit=total_gross + total_cnas_employer,
        total_credit=total_net + total_cnas_employee + total_cnas_employer + total_irg
    )
    db.add(entry)
    db.flush()

    # 641 Charges de personnel (salaires bruts) — débit
    db.add(JournalEntryLine(
        journal_entry_id=entry.id, account_code="641000",
        debit_amount=total_gross, credit_amount=0,
        description=f"Salaires bruts {request.period}"
    ))
    # 645 Charges sociales patronales (CNAS employeur) — débit
    db.add(JournalEntryLine(
        journal_entry_id=entry.id, account_code="645000",
        debit_amount=total_cnas_employer, credit_amount=0,
        description=f"CNAS employeur {request.period}"
    ))
    # 421 Personnel — rémunérations dues (net à payer) — crédit
    db.add(JournalEntryLine(
        journal_entry_id=entry.id, account_code="421000",
        debit_amount=0, credit_amount=total_net,
        description=f"Net à payer {request.period}"
    ))
    # 431 Sécurité sociale (CNAS salarié + patronal) — crédit
    db.add(JournalEntryLine(
        journal_entry_id=entry.id, account_code="431000",
        debit_amount=0, credit_amount=total_cnas_employee + total_cnas_employer,
        description=f"CNAS à verser {request.period}"
    ))
    # 444 État — IRG à reverser — crédit
    db.add(JournalEntryLine(
        journal_entry_id=entry.id, account_code="444000",
        debit_amount=0, credit_amount=total_irg,
        description=f"IRG à reverser {request.period}"
    ))

    payroll_run = PayrollRun(
        company_id=current_user.company_id,
        period=request.period,
        journal_entry_id=entry.id,
        headcount=len(employees),
        total_gross=total_gross,
        total_cnas_employee=total_cnas_employee,
        total_irg=total_irg,
        total_net=total_net,
        total_cnas_employer=total_cnas_employer,
        validated_by=current_user.user_id
    )
    db.add(payroll_run)

    log_audit(db, current_user, 'VALIDATE', 'PAYROLL_RUN', str(payroll_run.id), {
        'period': request.period, 'headcount': len(employees), 'total_net': str(total_net)
    })
    db.commit()

    return {
        "status": "success",
        "period": request.period,
        "journal_entry_id": str(entry.id),
        "journal_entry_number": entry_number,
        "headcount": len(employees),
        "total_gross": float(total_gross),
        "total_net": float(total_net)
    }


@router.get("/payroll/runs")
async def list_payroll_runs(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Historique des paies validées, pour éviter une double validation
    depuis l'UI et afficher le statut réel (payé/en attente) par période."""
    from app.core.models import PayrollRun
    runs = db.query(PayrollRun).filter(
        PayrollRun.company_id == current_user.company_id
    ).order_by(PayrollRun.period.desc()).all()
    return [
        {
            "id": str(r.id), "period": r.period,
            "journal_entry_id": str(r.journal_entry_id) if r.journal_entry_id else None,
            "headcount": r.headcount, "total_gross": float(r.total_gross or 0),
            "total_net": float(r.total_net or 0),
            "validated_at": r.validated_at.isoformat() if r.validated_at else None
        }
        for r in runs
    ]
