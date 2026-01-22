from sqlmodel import Session, select, func
from fastapi import HTTPException, status
from models import Employee, Attendance
from datetime import date

def get_employee_stats_controller(session: Session, employee_id: str):
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        
    count = session.exec(
        select(func.count(Attendance.id))
        .where(Attendance.employee_id == employee_id)
        .where(Attendance.status == "Present")
    ).one()
    
    return {"total_present": count}

def get_dashboard_stats_controller(session: Session):
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
