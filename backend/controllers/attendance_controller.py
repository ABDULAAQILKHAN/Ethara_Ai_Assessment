from sqlmodel import Session, select, desc
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from models import Attendance, Employee
from schemas import AttendanceCreate
from typing import Optional
from datetime import date

def create_attendance_controller(session: Session, attendance: AttendanceCreate):
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
        if "unique_attendance_per_day" in str(e.orig):
             raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Attendance already marked for this employee on this date.")
        raise e

def read_attendance_controller(
    session: Session, 
    employee_id: str, 
    start_date: Optional[date] = None, 
    end_date: Optional[date] = None
):
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
