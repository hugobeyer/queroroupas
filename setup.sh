#!/bin/bash
echo "Setting up QueroRoupas..."
echo ""

echo "[1/2] Installing backend dependencies..."
cd backend
pip install -r requirements.txt
if [ ! -f .env ]; then
    cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=queroroupas
CORS_ORIGINS=http://localhost:3000
EOF
    echo "Created backend/.env"
fi
cd ..

echo "[2/2] Installing frontend dependencies..."
cd frontend
if [ ! -d node_modules ]; then
    npm install
fi
if [ ! -f .env ]; then
    echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env
    echo "Created frontend/.env"
fi
cd ..

echo ""
echo "Setup complete! Run ./start.sh to start the app."
