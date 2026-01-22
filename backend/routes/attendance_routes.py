from fastapi import APIRouter, Depends, status
from sqlmodel import Session
from typing import List, Optional
from datetime import date

from database import get_session
from schemas import AttendanceCreate, AttendanceRead
from controllers.attendance_controller import (
    create_attendance_controller,
    read_attendance_controller
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(attendance: AttendanceCreate, session: Session = Depends(get_session)):
    return create_attendance_controller(session, attendance)

@router.get("/{employee_id}", response_model=List[AttendanceRead])
def read_attendance(
    employee_id: str, 
    start_date: Optional[date] = None, 
    end_date: Optional[date] = None, 
    session: Session = Depends(get_session)
):
    return read_attendance_controller(session, employee_id, start_date, end_date)
