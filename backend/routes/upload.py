from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Header
from typing import List, Optional
import os
import uuid
from pathlib import Path
import shutil
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Create uploads directory
UPLOADS_DIR = Path("/app/backend/uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def setup_upload_routes():
    @router.post("/upload")
    async def upload_image(file: UploadFile = File(...)):
        try:
            # Validate file extension
            file_ext = Path(file.filename).suffix.lower()
            if file_ext not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
                )
            
            # Read file and check size
            contents = await file.read()
            if len(contents) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="File size exceeds 5MB limit"
                )
            
            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            file_path = UPLOADS_DIR / unique_filename
            
            # Save file
            with open(file_path, "wb") as f:
                f.write(contents)
            
            # Return URL
            file_url = f"/uploads/{unique_filename}"
            logger.info(f"File uploaded successfully: {file_url}")
            
            return {"url": file_url, "filename": unique_filename}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error uploading file: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return router