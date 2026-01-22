from typing import Optional, List
from datetime import date
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import UniqueConstraint

class Employee(SQLModel, table=True):
    id: str = Field(primary_key=True, description="User-provided ID")
    full_name: str
    email: str = Field(unique=True, index=True)
    department: str

    attendance_records: List["Attendance"] = Relationship(
        back_populates="employee", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class Attendance(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="unique_attendance_per_day"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: str = Field(foreign_key="employee.id", ondelete="CASCADE")
    # Using simple date, but storing as Date type in Postgres
    date: date
    status: str

    employee: Optional[Employee] = Relationship(back_populates="attendance_records")
