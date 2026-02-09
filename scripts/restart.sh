#!/bin/bash
# Restart all services (backend + frontend)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_PORT=8001
FRONTEND_PORT=5174

echo "Stopping existing services..."

# Kill backend
lsof -i :$BACKEND_PORT -t 2>/dev/null | xargs kill 2>/dev/null
# Kill frontend
lsof -i :$FRONTEND_PORT -t 2>/dev/null | xargs kill 2>/dev/null

sleep 1

echo "Starting backend on port $BACKEND_PORT..."
cd "$ROOT_DIR/backend"
nohup ./venv/bin/uvicorn main:app --reload --port $BACKEND_PORT > /tmp/rag-backend.log 2>&1 &
BACKEND_PID=$!

echo "Starting frontend on port $FRONTEND_PORT..."
cd "$ROOT_DIR/frontend"
nohup npm run dev > /tmp/rag-frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3

# Verify
if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
    echo "Backend running on http://localhost:$BACKEND_PORT (PID: $BACKEND_PID)"
else
    echo "Backend FAILED to start. Check /tmp/rag-backend.log"
fi

if lsof -i :$FRONTEND_PORT -t > /dev/null 2>&1; then
    echo "Frontend running on http://localhost:$FRONTEND_PORT (PID: $FRONTEND_PID)"
else
    echo "Frontend FAILED to start. Check /tmp/rag-frontend.log"
fi
