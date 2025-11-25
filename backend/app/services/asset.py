from typing import Annotated
from datetime import datetime, timezone, timedelta
from fastapi import Depends
from sqlmodel import Session, select

from app.core.database import SQLiteDB
from app.models.assets import Asset
from app.schemas.asset import AssetCreate, AssetUpdate


class AssetService:
    def __init__(self, session: Annotated[Session, Depends(SQLiteDB.get_session)]):
        self.session = session

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
