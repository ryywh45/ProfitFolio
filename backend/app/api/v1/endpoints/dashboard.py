from typing import Annotated
from fastapi import APIRouter, Depends

from app.services.dashboard import DashboardService
from app.schemas.dashboard import DashboardStatsResponse

router = APIRouter()

ServiceDep = Annotated[DashboardService, Depends()]

@router.get("/", response_model=DashboardStatsResponse)
def get_dashboard_stats(dashboard_service: ServiceDep):
    """
    Get aggregated dashboard statistics including net worth, profit, and allocation.
    """
    return dashboard_service.get_stats()
