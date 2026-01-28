from fastapi import APIRouter
from datetime import datetime

from ..core.config import oem_catalog_db, test_pricing_db

router = APIRouter(tags=["misc"])

@router.get("/")
async def root():
    return {
        "status": "online",
        "service": "RFP Automation System",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "agents": "LangGraph workflow active",
        "catalog_items": len(oem_catalog_db),
        "test_types": len(test_pricing_db)
    }

@router.get("/api/health")
async def api_health_check():
    return await health_check()

@router.post("/api/rfp/scan")
async def scan_rfps():
    """Scan for RFPs (use /api/chat for LangGraph workflow)"""
    return {
        "message": "Please use /api/chat endpoint for RFP workflow with LangGraph agents",
        "total_found": 0,
        "rfps": []
    }

@router.post("/api/rfp/analyze")
async def analyze_rfp():
    """Analyze a specific RFP"""
    return {
        "message": "Use chat interface for full workflow"
    }

@router.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    return {
        "total_products": len(oem_catalog_db),
        "test_types": len(test_pricing_db),
        "system_status": "operational",
        "last_updated": datetime.now().isoformat()
    }
