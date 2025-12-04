from fastapi import APIRouter
from app.api.v1.endpoints import assets, accounts, portfolios, transactions, dashboard

api_router = APIRouter()
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(portfolios.router, prefix="/portfolios", tags=["portfolios"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
