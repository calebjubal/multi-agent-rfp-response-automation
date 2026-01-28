from fastapi import APIRouter, HTTPException
from typing import List, Optional

from ..models import RFPEntry
from ..core.config import rfps_db
from ..utils import save_rfps

router = APIRouter(prefix="/api/rfps", tags=["rfps"])

def _next_rfp_id() -> str:
    """Generate next RFP ID in format RFP-YYYY-NNNN"""
    from datetime import datetime
    year = datetime.now().year
    max_num = 0
    for r in rfps_db:
        if r.get("id", "").startswith(f"RFP-{year}-"):
            try:
                num = int(r["id"].split("-")[-1])
                max_num = max(max_num, num)
            except Exception:
                continue
    return f"RFP-{year}-{max_num + 1:04d}"

@router.get("", response_model=List[RFPEntry])
async def get_rfps():
    """Get all RFPs"""
    return rfps_db

@router.get("/{rfp_id}", response_model=RFPEntry)
async def get_rfp(rfp_id: str):
    """Get a specific RFP by ID"""
    for r in rfps_db:
        if r.get("id") == rfp_id:
            return r
    raise HTTPException(status_code=404, detail="RFP not found")

@router.post("", response_model=RFPEntry)
async def create_rfp(rfp: RFPEntry):
    """Create a new RFP"""
    rfp_dict = rfp.dict()
    if not rfp_dict.get("id"):
        rfp_dict["id"] = _next_rfp_id()
    else:
        # Ensure no duplicate ID
        if any(r.get("id") == rfp_dict["id"] for r in rfps_db):
            raise HTTPException(status_code=400, detail="RFP ID already exists")
    rfps_db.append(rfp_dict)
    save_rfps(rfps_db)
    return rfp_dict

@router.put("/{rfp_id}", response_model=RFPEntry)
async def update_rfp(rfp_id: str, rfp: RFPEntry):
    """Update an existing RFP"""
    for i, r in enumerate(rfps_db):
        if r.get("id") == rfp_id:
            rfp_dict = rfp.dict()
            rfp_dict["id"] = rfp_id
            rfps_db[i] = rfp_dict
            save_rfps(rfps_db)
            return rfp_dict
    raise HTTPException(status_code=404, detail="RFP not found")

@router.delete("/{rfp_id}")
async def delete_rfp(rfp_id: str):
    """Delete an RFP"""
    for i, r in enumerate(rfps_db):
        if r.get("id") == rfp_id:
            rfps_db.pop(i)
            save_rfps(rfps_db)
            return {"message": "RFP deleted", "rfp_id": rfp_id}
    raise HTTPException(status_code=404, detail="RFP not found")
