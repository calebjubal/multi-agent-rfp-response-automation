# ============================================================
# DATA MODELS (Pydantic)
# ============================================================
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class OEMProduct(BaseModel):
    sku: str
    product_name: str
    specifications: Dict[str, Any]
    price_per_km: float
    manufacturer: Optional[str] = "Your Company"
    category: Optional[str] = "Cables"
    status: Optional[str] = "Active"

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: str
    workflow_state: Optional[Dict] = None

class RFPScanRequest(BaseModel):
    keywords: List[str]
    days_ahead: Optional[int] = 90
    min_value: Optional[int] = 1000000

class AnalyzeRFPRequest(BaseModel):
    rfp_id: str