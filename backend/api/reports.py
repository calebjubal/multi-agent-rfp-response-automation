from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ..core.config import REPORTS_DIR

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/{session_id}/{rfp_id}")
async def get_report(session_id: str, rfp_id: str):
    """Download generated RFP report PDF."""
    safe_rfp_id = rfp_id.replace("/", "_")
    report_path = REPORTS_DIR / f"{session_id}_{safe_rfp_id}.pdf"
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(str(report_path), media_type="application/pdf", filename=report_path.name)
