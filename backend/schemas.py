from pydantic import BaseModel, EmailStr, validator
from datetime import date
from typing import Optional

# Employee Schemas
class EmployeeCreate(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    department: str

class EmployeeRead(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    department: str
    
    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str
    
    @validator('status')
    def validate_status(cls, v):
        if v not in ("Present", "Absent"):
            raise ValueError('Status must be "Present" or "Absent"')
        return v

class AttendanceRead(BaseModel):
    id: int
    employee_id: str
    date: date
    status: str
    
    class Config:
        from_attributes = True
