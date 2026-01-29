from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.routers.auth import get_current_user
from app.security import TokenData
from app.models.hr import Employee, Payroll
from pydantic import BaseModel
from decimal import Decimal
from datetime import date

router = APIRouter(prefix="/hr", tags=["hr"])

class EmployeeResponse(BaseModel):
    id: str
    matricule: str
    name: str
    first_name: str
    email: Optional[str]
    position: Optional[str]
    department: Optional[str]
    base_salary: Decimal
    status: str

@router.get("/employees", response_model=List[EmployeeResponse])
def list_employees(db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    employees = db.query(Employee).filter(Employee.company_id == current_user.company_id).all()
    return [
        EmployeeResponse(
            id=str(e.id),
            matricule=e.matricule,
            name=e.name,
            first_name=e.first_name,
            email=e.email,
            position=e.position,
            department=e.department,
            base_salary=e.base_salary,
            status=e.status
        ) for e in employees
    ]

@router.get("/payroll", response_model=List[dict])
def list_payroll(period: Optional[str] = None, db: Session = Depends(get_db), current_user: TokenData = Depends(get_current_user)):
    query = db.query(Payroll).filter(Payroll.company_id == current_user.company_id)
    if period:
        query = query.filter(Payroll.period == period)
    payroll = query.all()
    
    res = []
    for p in payroll:
        emp = db.query(Employee).filter(Employee.id == p.employee_id).first()
        res.append({
            "id": str(p.id),
            "employee_name": f"{emp.first_name} {emp.name}" if emp else "Inconnu",
            "period": p.period,
            "gross_salary": float(p.gross_salary),
            "net_salary": float(p.net_salary),
            "status": p.status,
            "payment_date": p.payment_date
        })
    return res
