from fastapi import APIRouter, HTTPException
from typing import Dict

from ..models import TestPricingEntry
from ..core.config import test_pricing_db
from ..utils import save_test_pricing

router = APIRouter(prefix="/api/test-pricing", tags=["test-pricing"])

@router.get("")
async def get_test_pricing():
    return test_pricing_db

@router.put("/{test_name}")
async def upsert_test_pricing(test_name: str, entry: TestPricingEntry):
    global test_pricing_db

    existing = test_pricing_db.get(test_name, {}) if isinstance(test_pricing_db, dict) else {}

    duration_days = entry.duration_days
    if duration_days is None and isinstance(existing, dict):
        duration_days = existing.get("duration_days")

    test_pricing_db[test_name] = {
        "price": entry.price,
        "duration_days": duration_days,
    }

    save_test_pricing(test_pricing_db)
    return {"test_name": test_name, **test_pricing_db[test_name]}

@router.delete("/{test_name}")
async def delete_test_pricing(test_name: str):
    if test_name not in test_pricing_db:
        raise HTTPException(status_code=404, detail="Test not found")

    test_pricing_db.pop(test_name, None)
    save_test_pricing(test_pricing_db)
    return {"message": "Test pricing deleted", "test_name": test_name}

@router.put("")
async def replace_test_pricing(pricing: Dict[str, TestPricingEntry]):
    global test_pricing_db

    test_pricing_db = {
        name: {"price": entry.price, "duration_days": entry.duration_days}
        for name, entry in pricing.items()
    }
    save_test_pricing(test_pricing_db)
    return {"message": "Test pricing replaced", "total_tests": len(test_pricing_db)}
