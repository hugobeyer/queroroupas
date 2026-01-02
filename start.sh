#!/bin/bash
echo "Starting QueroRoupas..."
echo ""

echo "[1/3] Starting Backend..."
cd backend
python -m uvicorn server:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 3

echo "[2/3] Starting Frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "[3/3] Done!"
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

wait
