from typing import Annotated, List
from fastapi import APIRouter, Depends, Query, HTTPException

from app.services.portfolio import PortfolioService
from app.schemas.portfolio import (
    PortfolioCreate, 
    PortfolioRead, 
    PortfolioUpdate, 
    PortfolioListItem, 
    PortfolioSummary
)

router = APIRouter()

ServiceDep = Annotated[PortfolioService, Depends()]

@router.post("/", response_model=PortfolioRead)
def create_portfolio(portfolio_service: ServiceDep, portfolio_in: PortfolioCreate):
    """
    Create a new portfolio.
    """
    return portfolio_service.create_portfolio(portfolio_in=portfolio_in)


@router.get("/", response_model=List[PortfolioListItem])
def read_portfolios(
    portfolio_service: ServiceDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
):
    """
    Retrieve portfolios with summary data.
    """
    return portfolio_service.get_portfolios(offset=offset, limit=limit)


@router.get("/{portfolio_id}/summary", response_model=PortfolioSummary)
def read_portfolio_summary(portfolio_service: ServiceDep, portfolio_id: int):
    """
    Get a detailed summary of a specific portfolio.
    """
    portfolio_summary = portfolio_service.get_portfolio_summary(portfolio_id=portfolio_id)
    if not portfolio_summary:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio_summary


@router.get("/{portfolio_id}", response_model=PortfolioRead)
def read_portfolio_by_id(portfolio_service: ServiceDep, portfolio_id: int):
    """
    Get a specific portfolio by ID.
    """
    portfolio = portfolio_service.get_portfolio_by_id(portfolio_id=portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.patch("/{portfolio_id}", response_model=PortfolioRead)
def update_portfolio_by_id(portfolio_service: ServiceDep, portfolio_id: int, portfolio_in: PortfolioUpdate):
    """
    Update a portfolio.
    """
    portfolio = portfolio_service.get_portfolio_by_id(portfolio_id=portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    return portfolio_service.update_portfolio(portfolio=portfolio, portfolio_in=portfolio_in)


@router.delete("/{portfolio_id}")
def delete_portfolio_by_id(portfolio_service: ServiceDep, portfolio_id: int):
    """
    Delete a portfolio.
    """
    portfolio = portfolio_service.get_portfolio_by_id(portfolio_id=portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    portfolio_service.delete_portfolio(portfolio=portfolio)
    return {"ok": True}