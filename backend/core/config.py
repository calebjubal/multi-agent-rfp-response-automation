import os
from pathlib import Path

# Data directories
DATA_DIR = Path("data")
REPORTS_DIR = DATA_DIR / "reports"

# In-memory storage (replace with DB later)
oem_catalog_db = []
chat_sessions = {}
test_pricing_db = {}
rfps_db = []
