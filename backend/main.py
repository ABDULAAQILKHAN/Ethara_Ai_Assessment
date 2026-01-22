from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, desc
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from contextlib import asynccontextmanager
from datetime import date
from sqlalchemy import func
import os
from dotenv import load_dotenv

load_dotenv()

from database import create_db_and_tables, get_session
from models import Employee, Attendance
from schemas import EmployeeCreate, EmployeeRead, AttendanceCreate, AttendanceRead

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Employee CRUD -----------------

@app.post("/employees/", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, session: Session = Depends(get_session)):
    # Using model_dump() for Pydantic v2 compatibility, falling back to dict() if needed
    employee_data = employee.model_dump() if hasattr(employee, "model_dump") else employee.dict()
    db_employee = Employee(**employee_data)
    try:
        session.add(db_employee)
        session.commit()
        session.refresh(db_employee)
        return db_employee
    except IntegrityError as e:
        session.rollback()
        # Parse error to distinguish between ID and Email duplicates if possible, 
        # or just return generic Conflict.
        # Postgres error messages are in e.orig.pgcode or e.orig.diag.message_primary
        # For simplicity, we assume conflict.
        # We can check specific constraints if we want to be very precise.
        error_info = str(e.orig)
        if "employees_pkey" in error_info:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee with this ID already exists.")
        if "email" in error_info:
             raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee with this email already exists.")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Integrity error: possibly duplicate ID or Email.")

@app.get("/employees/", response_model=List[EmployeeRead])
def read_employees(session: Session = Depends(get_session)):
    employees = session.exec(select(Employee)).all()
    return employees

@app.get("/employees/{employee_id}", response_model=EmployeeRead)
def read_employee(employee_id: str, session: Session = Depends(get_session)):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee

@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, session: Session = Depends(get_session)):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    session.delete(employee)
    session.commit()

# ----------------- Attendance CRUD -----------------

@app.post("/attendance/", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(attendance: AttendanceCreate, session: Session = Depends(get_session)):
    # Verify Employee Exists
    employee = session.get(Employee, attendance.employee_id)
    if not employee:
         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    attendance_data = attendance.model_dump() if hasattr(attendance, "model_dump") else attendance.dict()
    db_attendance = Attendance(**attendance_data)
    try:
        session.add(db_attendance)
        session.commit()
        session.refresh(db_attendance)
        return db_attendance
    except IntegrityError as e:
        session.rollback()
        # Check for unique constraint violation
        if "unique_attendance_per_day" in str(e.orig):
             raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Attendance already marked for this employee on this date.")
        raise e


@app.get("/attendance/{employee_id}", response_model=List[AttendanceRead])
def read_attendance(
    employee_id: str, 
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    session: Session = Depends(get_session)
):
    # Verify Employee Exists (optional, but good for error clarity if user asks for random ID)
    # The requirement says "Retrieve all attendance records for an employee".
    # Typically return 404 if employee doesn't exist, or just empty list?
    # I'll check existence first to share specific 404.
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    statement = select(Attendance).where(Attendance.employee_id == employee_id)
    if start_date:
        statement = statement.where(Attendance.date >= start_date)
    if end_date:
        statement = statement.where(Attendance.date <= end_date)
    
    statement = statement.order_by(desc(Attendance.date))
    results = session.exec(statement).all()
    return results

@app.get("/employees/{employee_id}/stats")
def get_employee_stats(employee_id: str, session: Session = Depends(get_session)):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
    count = session.exec(
        select(func.count(Attendance.id))
        .where(Attendance.employee_id == employee_id)
        .where(Attendance.status == "Present")
    ).one()
    
    return {"total_present": count}

@app.get("/stats/dashboard")
def get_dashboard_stats(session: Session = Depends(get_session)):
    total_employees = session.exec(select(func.count(Employee.id))).one()
    
    today = date.today()
    present_today = session.exec(
        select(func.count(Attendance.id))
        .where(Attendance.date == today)
        .where(Attendance.status == "Present")
    ).one()
    
    return {
        "total_employees": total_employees,
        "present_today": present_today
    }

