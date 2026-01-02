from fastapi import FastAPI, APIRouter
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from routes.products import setup_product_routes
from routes.auth import setup_auth_routes
from routes.upload import setup_upload_routes
from auth import get_password_hash
from models import UserInDB
import asyncio


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

# Setup product routes
product_router = setup_product_routes(db)
api_router.include_router(product_router)

# Setup auth routes
auth_router, get_current_user = setup_auth_routes(db)
api_router.include_router(auth_router)

# Setup upload routes
upload_router = setup_upload_routes()
api_router.include_router(upload_router)

# Setup settings routes
from routes.settings import setup_settings_routes
settings_router = setup_settings_routes(db)
api_router.include_router(settings_router)

# Setup newsletter routes
from routes.newsletter import setup_newsletter_routes
newsletter_router = setup_newsletter_routes(db)
api_router.include_router(newsletter_router)

# Setup financial routes
from routes.financial import setup_financial_routes
financial_router = setup_financial_routes(db)
api_router.include_router(financial_router)

# Include the router in the main app
app.include_router(api_router)

# Serve uploaded files with CORS headers
uploads_dir = Path("/app/backend/uploads")
uploads_dir.mkdir(exist_ok=True)

# Custom StaticFiles middleware to add CORS headers
class CORSStaticFiles(StaticFiles):
    async def __call__(self, scope, receive, send):
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((b"access-control-allow-origin", b"*"))
                headers.append((b"access-control-allow-methods", b"GET, OPTIONS"))
                headers.append((b"access-control-allow-headers", b"*"))
                message["headers"] = headers
            await send(message)
        await super().__call__(scope, receive, send_wrapper)

app.mount("/uploads", CORSStaticFiles(directory=str(uploads_dir)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create admin user if doesn't exist
    admin_email = "geanesousa1818@gmail.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    
    if not existing_admin:
        admin_user = UserInDB(
            email=admin_email,
            name="Admin",
            role="admin",
            hashed_password=get_password_hash("pepeta")
        )
        await db.users.insert_one(admin_user.dict())
        logger.info(f"Admin user created: {admin_email}")
    else:
        logger.info(f"Admin user already exists: {admin_email}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()