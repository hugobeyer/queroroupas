@echo off
echo Setting up QueroRoupas...
echo.

echo [1/2] Installing backend dependencies...
cd backend
pip install -r requirements.txt
if not exist .env (
    echo MONGO_URL=mongodb://localhost:27017 > .env
    echo DB_NAME=queroroupas >> .env
    echo CORS_ORIGINS=http://localhost:3000 >> .env
    echo Created backend/.env
)
cd ..

echo [2/2] Installing frontend dependencies...
cd frontend
if not exist node_modules (
    call npm install --legacy-peer-deps
)
if not exist .env (
    echo REACT_APP_BACKEND_URL=http://localhost:8000 > .env
    echo Created frontend/.env
)
cd ..

echo.
echo Setup complete! Run start.bat to start the app.
pause
