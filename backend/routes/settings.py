from fastapi import APIRouter, HTTPException
from typing import List
from models import SiteSettings, SiteSettingsUpdate
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter()

def setup_settings_routes(db: AsyncIOMotorDatabase):
    settings_collection = db.settings

    @router.get("/settings", response_model=SiteSettings)
    async def get_settings():
        try:
            settings = await settings_collection.find_one({"id": "site_settings"})
            if not settings:
                # Create default settings
                default_settings = SiteSettings()
                await settings_collection.insert_one(default_settings.dict())
                return default_settings
            return SiteSettings(**settings)
        except Exception as e:
            logger.error(f"Error fetching settings: {e}")
            raise HTTPException(status_code=500, detail="Error fetching settings")

    @router.put("/settings", response_model=SiteSettings)
    async def update_settings(settings_data: SiteSettingsUpdate):
        try:
            update_dict = {k: v for k, v in settings_data.dict().items() if v is not None}
            
            if not update_dict:
                raise HTTPException(status_code=400, detail="No fields to update")
            
            update_dict["updatedAt"] = datetime.utcnow()
            
            result = await settings_collection.find_one_and_update(
                {"id": "site_settings"},
                {"$set": update_dict},
                return_document=True,
                upsert=True
            )
            
            if result:
                return SiteSettings(**result)
            raise HTTPException(status_code=500, detail="Failed to update settings")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating settings: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router