from typing import Annotated
from fastapi import APIRouter, Depends, Query, HTTPException

from app.services.asset import AssetService
from app.schemas.asset import AssetCreate, AssetRead, AssetUpdate, AssetValidateRequest, AssetValidateResponse

router = APIRouter()

ServiceDep = Annotated[AssetService, Depends()]

@router.post("/validate", response_model=AssetValidateResponse)
def validate_asset_ticker(asset_service: ServiceDep, request: AssetValidateRequest):
    """
    Validate a ticker using yfinance and return metadata.
    """
    result = asset_service.validate_ticker(request.ticker)
    if not result.valid:
        raise HTTPException(status_code=404, detail=f"Ticker '{request.ticker}' not found or invalid.")
    return result

@router.post("/update_prices")
def update_all_prices(asset_service: ServiceDep):
    """
    Update current prices for all assets.
    """
    count = asset_service.update_prices()
    return {"ok": True, "updated_count": count}

@router.post("/", response_model=AssetRead)
def create_asset(asset_service: ServiceDep, asset_in: AssetCreate):
    """
    Create a new asset.
    """
    return asset_service.create_asset(asset_in=asset_in)


@router.get("/", response_model=list[AssetRead])
def read_assets(
    asset_service: ServiceDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    """
    Retrieve assets.
    """
    return asset_service.get_assets(offset=offset, limit=limit)


@router.get("/{asset_id}", response_model=AssetRead)
def read_asset_by_id(asset_service: ServiceDep, asset_id: int):
    """
    Get a specific asset by ID.
    """
    asset = asset_service.get_asset_by_id(asset_id=asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@router.patch("/{asset_id}", response_model=AssetRead)
def update_asset_by_id(asset_service: ServiceDep, asset_id: int, asset_in: AssetUpdate):
    """
    Update an asset.
    """
    asset = asset_service.get_asset_by_id(asset_id=asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return asset_service.update_asset(asset=asset, asset_in=asset_in)


@router.delete("/{asset_id}")
def delete_asset_by_id(asset_service: ServiceDep, asset_id: int):
    """
    Delete an asset.
    """
    asset = asset_service.get_asset_by_id(asset_id=asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset_service.delete_asset(asset=asset)
    return {"ok": True}