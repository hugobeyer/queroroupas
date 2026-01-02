# QueroRoupas

E-commerce platform with React frontend and FastAPI backend.

## Quick Start (Windows)

**1. Setup (one time):**
```bash
setup.bat
```

**2. Run:**
```bash
start.bat
```

**3. Open:** http://localhost:3000

## Quick Start (Mac/Linux)

**1. Setup (one time):**
```bash
chmod +x setup.sh start.sh
./setup.sh
```

**2. Run:**
```bash
./start.sh
```

**3. Open:** http://localhost:3000

## Manual Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables (Auto-created)

**Backend** (`backend/.env`):
- `MONGO_URL` (default: `mongodb://localhost:27017`)
- `DB_NAME` (default: `queroroupas`)
- `CORS_ORIGINS` (default: `http://localhost:3000`)

**Frontend** (`frontend/.env`):
- `REACT_APP_BACKEND_URL` (default: `http://localhost:8000`)

## Admin Login

- Email: `geanesousa1818@gmail.com`
- Password: `pepeta`

## Notes

- App will start even without MongoDB (some features disabled)
- All environment variables have defaults
- Setup scripts auto-create `.env` files
