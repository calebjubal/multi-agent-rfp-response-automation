#!/usr/bin/env bash
# Run the modular FastAPI backend
cd "$(dirname "$0")"
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
