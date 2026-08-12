#!/usr/bin/env bash
# Starts the backend and frontend together from a single terminal.
# Requires: backend/.env and frontend/.env already filled in (see .env.example
# in each folder), and dependencies already installed (pip install -r
# requirements.txt in backend, npm install in frontend).
#
# Usage:
#   ./run.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  echo "Missing backend/.env — copy backend/.env.example to backend/.env and fill in your CognoDB credentials first."
  exit 1
fi

if [ ! -f "$ROOT_DIR/frontend/.env" ]; then
  echo "Missing frontend/.env — copy frontend/.env.example to frontend/.env first."
  exit 1
fi

if [ ! -d "$ROOT_DIR/backend/.venv" ]; then
  echo "No backend/.venv found. Run this first:"
  echo "  cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

if [ ! -d "$ROOT_DIR/frontend/node_modules" ]; then
  echo "No frontend/node_modules found. Run this first:"
  echo "  cd frontend && npm install"
  exit 1
fi

cleanup() {
  echo ""
  echo "Stopping backend and frontend..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting backend on http://localhost:8000 ..."
(
  cd "$ROOT_DIR/backend"
  if [ -f .venv/bin/activate ]; then
    source .venv/bin/activate
  elif [ -f .venv/Scripts/activate ]; then
    source .venv/Scripts/activate
  else
    echo "Could not find a virtualenv activate script in backend/.venv"
    exit 1
  fi
  uvicorn app.main:app --reload --port 8000
) &
BACKEND_PID=$!

# Give the backend a moment to boot before starting the frontend.
sleep 2

echo "Starting frontend on http://localhost:5173 ..."
(
  cd "$ROOT_DIR/frontend"
  npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "Both servers running. Press Ctrl+C to stop both."
wait
