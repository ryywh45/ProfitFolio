from typing import Annotated, Optional
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import yfinance as yf
from fastapi import Depends, HTTPException
from sqlmodel import Session, select

from app.core.database import SQLiteDB
from app.models.assets import Asset, AssetType
from app.schemas.asset import AssetCreate, AssetUpdate, AssetValidateResponse


class AssetService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

    def validate_ticker(self, ticker: str) -> AssetValidateResponse:
        """
        Validates a ticker using yfinance and returns metadata if valid.
        """
        try:
            ticker_obj = yf.Ticker(ticker)
            # Fast check: try to get info. If invalid, it might return empty or raise error depending on version
            info = ticker_obj.info
            
            # Check if we got valid info. yfinance often returns a dict with 'trailingPegRatio': None for invalid tickers or empty dict
            if not info or (len(info) == 1 and 'trailingPegRatio' in info and info['trailingPegRatio'] is None):
                 # Some invalid tickers behave like this
                 raise ValueError("Invalid ticker")

            # Extract data
            # Name: 'shortName' or 'longName'
            name = info.get('shortName') or info.get('longName') or ticker
            currency = info.get('currency', 'USD')
            
            # Price: 'currentPrice', 'regularMarketPrice', or 'ask'
            price = info.get('currentPrice') or info.get('regularMarketPrice') or info.get('ask') or 0.0
            
            # Determine type roughly (can be refined)
            quote_type = info.get('quoteType', '').lower()
            asset_type = AssetType.stock
            if quote_type == 'cryptocurrency':
                asset_type = AssetType.crypto
            elif quote_type == 'etf':
                asset_type = AssetType.etf
            
            return AssetValidateResponse(
                ticker=ticker,
                name=name,
                currency=currency,
                current_price=Decimal(price),
                valid=True,
                type=asset_type
            )

        except Exception as e:
            # Log error if needed
            # print(f"Error validating ticker {ticker}: {e}")
            return AssetValidateResponse(
                ticker=ticker,
                name="",
                currency="",
                current_price=Decimal(0),
                valid=False
            )

    def update_prices(self) -> int:
        """
        Updates current_price for all assets in the database using yfinance.
        Returns the number of assets updated.
        """
        assets = self.session.exec(select(Asset)).all()
        count = 0
        if not assets:
            return 0

        updated_time = datetime.now(timezone(timedelta(hours=8)))

        for asset in assets:
            try:
                if asset.type == AssetType.fiat and not asset.ticker.endswith("=X"):
                    ticker_obj = yf.Ticker(asset.ticker + "=X")
                else:
                    ticker_obj = yf.Ticker(asset.ticker)
                info = ticker_obj.fast_info # fast_info is faster than info
                current_price = info.last_price
                
                if current_price:
                    asset.current_price = Decimal(current_price)
                    asset.last_updated = updated_time
                    self.session.add(asset)
                    count += 1
                    
            except Exception as e:
                print(f"Failed to update {asset.ticker}: {e}")
                continue
        
        self.session.commit()
        return count

    def create_asset(self, asset_in: AssetCreate) -> Asset:
        db_asset = Asset.model_validate(asset_in)
        self.session.add(db_asset)
        self.session.commit()
        self.session.refresh(db_asset)
        return db_asset

    def get_asset_by_id(self, asset_id: int) -> Asset | None:
        return self.session.get(Asset, asset_id)

    def get_assets(self, offset: int = 0, limit: int = 100) -> list[Asset]:
        assets = self.session.exec(select(Asset).offset(offset).limit(limit)).all()
        return assets

    def update_asset(self, asset: Asset, asset_in: AssetUpdate) -> Asset:
        asset_data = asset_in.model_dump(exclude_unset=True)
        asset_data['last_updated'] = datetime.now(timezone(timedelta(hours=8)))
        asset.sqlmodel_update(asset_data)
        self.session.add(asset)
        self.session.commit()
        self.session.refresh(asset)
        return asset

    def delete_asset(self, asset: Asset) -> None:
        self.session.delete(asset)
        self.session.commit()
        return