from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from models import Employee
from schemas import EmployeeCreate

def create_employee_controller(session: Session, employee: EmployeeCreate):
    employee_data = employee.model_dump() if hasattr(employee, "model_dump") else employee.dict()
    db_employee = Employee(**employee_data)
    try:
        session.add(db_employee)
        session.commit()
        session.refresh(db_employee)
        return db_employee
    except IntegrityError as e:
        session.rollback()
        error_info = str(e.orig)
        if "employees_pkey" in error_info:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee with this ID already exists.")
        if "email" in error_info:
             raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee with this email already exists.")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Integrity error: possibly duplicate ID or Email.")

def read_employees_controller(session: Session):
    employees = session.exec(select(Employee)).all()
    return employees

def read_employee_controller(session: Session, employee_id: str):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee

def delete_employee_controller(session: Session, employee_id: str):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    session.delete(employee)
    session.commit()
