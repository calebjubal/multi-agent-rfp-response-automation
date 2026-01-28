"""
FastAPI Backend for RFP Automation System
Provides REST APIs for:
- OEM Catalog Management
- Chat Interface
- RFP Workflow Management
- Dashboard Data
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.loader import load_initial_data
from .api import catalog, test_pricing, rfps, chat, reports, misc

# Initialize FastAPI app
app = FastAPI(
    title="RFP Automation System",
    description="AI-powered B2B RFP Response Automation",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(catalog.router)
app.include_router(test_pricing.router)
app.include_router(rfps.router)
app.include_router(chat.router)
app.include_router(reports.router)
app.include_router(misc.router)

# Startup event
@app.on_event("startup")
async def startup_event():
    load_initial_data()
