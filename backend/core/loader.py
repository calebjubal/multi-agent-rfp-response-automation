import json
import os
from .config import oem_catalog_db, test_pricing_db, rfps_db, REPORTS_DIR

def load_initial_data():
    """Load initial data on startup"""
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    if os.path.exists('data/catalog.json'):
        with open('data/catalog.json', 'r') as f:
            oem_catalog_db.extend(json.load(f))

    if os.path.exists('data/test_pricing.json'):
        with open('data/test_pricing.json', 'r') as f:
            test_pricing_db.update(json.load(f))

    if os.path.exists('data/rfps.json'):
        with open('data/rfps.json', 'r') as f:
            rfps_db.extend(json.load(f))

    print("✅ RFP Automation System initialized (LangGraph)")
