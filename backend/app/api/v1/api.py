from fastapi import APIRouter
from app.api.v1.endpoints import assets, accounts

api_router = APIRouter()
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
