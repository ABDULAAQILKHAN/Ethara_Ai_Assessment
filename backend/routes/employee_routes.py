from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from typing import List

from database import get_session
from schemas import EmployeeCreate, EmployeeRead
from controllers.employee_controller import (
    create_employee_controller,
    read_employees_controller,
    read_employee_controller,
    delete_employee_controller
)
from controllers.stats_controller import get_employee_stats_controller

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post("/", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, session: Session = Depends(get_session)):
    return create_employee_controller(session, employee)

@router.get("/", response_model=List[EmployeeRead])
def read_employees(session: Session = Depends(get_session)):
    return read_employees_controller(session)

@router.get("/{employee_id}", response_model=EmployeeRead)
def read_employee(employee_id: str, session: Session = Depends(get_session)):
    return read_employee_controller(session, employee_id)

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, session: Session = Depends(get_session)):
    delete_employee_controller(session, employee_id)

@router.get("/{employee_id}/stats")
def get_employee_stats(employee_id: str, session: Session = Depends(get_session)):
    return get_employee_stats_controller(session, employee_id)
