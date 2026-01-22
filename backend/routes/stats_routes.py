from fastapi import APIRouter, Depends
from sqlmodel import Session

from database import get_session
from controllers.stats_controller import get_dashboard_stats_controller

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/dashboard")
def get_dashboard_stats(session: Session = Depends(get_session)):
    return get_dashboard_stats_controller(session)
