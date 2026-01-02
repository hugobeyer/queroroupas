from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from models import User, UserCreate, UserLogin, Token, UserInDB
from auth import get_password_hash, verify_password, create_access_token, decode_token
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

async def get_current_user(authorization: Optional[str] = Header(None), db: AsyncIOMotorDatabase = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication")

def setup_auth_routes(db: AsyncIOMotorDatabase):
    users_collection = db.users

    @router.post("/auth/register", response_model=Token)
    async def register(user_data: UserCreate):
        try:
            # Check if user already exists
            existing_user = await users_collection.find_one({"email": user_data.email})
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Create user
            hashed_password = get_password_hash(user_data.password)
            user = User(**user_data.dict(exclude={"password"}))
            user_in_db = UserInDB(**user.dict(), hashed_password=hashed_password)
            
            await users_collection.insert_one(user_in_db.dict())
            
            # Create token
            access_token = create_access_token(data={"sub": user.email, "role": user.role})
            
            return Token(access_token=access_token, token_type="bearer", user=user)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error registering user: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.post("/auth/login", response_model=Token)
    async def login(credentials: UserLogin):
        try:
            user = await users_collection.find_one({"email": credentials.email})
            if not user:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            user_in_db = UserInDB(**user)
            if not verify_password(credentials.password, user_in_db.hashed_password):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Create token
            access_token = create_access_token(data={"sub": user_in_db.email, "role": user_in_db.role})
            user_response = User(**user)
            
            return Token(access_token=access_token, token_type="bearer", user=user_response)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error logging in: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @router.get("/auth/me", response_model=User)
    async def get_me(authorization: Optional[str] = Header(None)):
        return await get_current_user(authorization, db)

    return router, get_current_user