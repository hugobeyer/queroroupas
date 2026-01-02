@echo off
echo Starting QueroRoupas...
echo.

echo [1/3] Starting Backend...
start "Backend" cmd /k "cd backend && python -m uvicorn server:app --reload --port 8000"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"
timeout /t 2 /nobreak >nul

echo [3/3] Done!
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
