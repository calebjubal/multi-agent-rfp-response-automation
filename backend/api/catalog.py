from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import List, Optional
import json
from datetime import datetime

from ..models import OEMProduct
from ..core.config import oem_catalog_db
from ..utils import save_catalog

router = APIRouter(prefix="/api/catalog", tags=["catalog"])

@router.get("")
async def get_catalog(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=200, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    """Get paginated OEM products from catalog with optional category filter"""
    filtered = oem_catalog_db
    if category:
        filtered = [p for p in oem_catalog_db if p.get("category", "").lower() == category.lower()]

    total = len(filtered)
    start = (page - 1) * size
    end = start + size
    items = filtered[start:end]

    return {
        "items": items,
        "pagination": {
            "page": page,
            "size": size,
            "total": total,
            "pages": (total + size - 1) // size,
        },
    }

@router.post("", response_model=OEMProduct)
async def add_product(product: OEMProduct):
    """Add new product to catalog"""
    # Check if SKU already exists
    if any(p['sku'] == product.sku for p in oem_catalog_db):
        raise HTTPException(status_code=400, detail="SKU already exists")

    product_dict = product.dict()
    product_dict['created_at'] = datetime.now().isoformat()
    product_dict['updated_at'] = datetime.now().isoformat()

    oem_catalog_db.append(product_dict)
    save_catalog(oem_catalog_db)
    return product_dict

@router.put("/{sku}", response_model=OEMProduct)
async def update_product(sku: str, product: OEMProduct):
    """Update existing product"""
    for i, p in enumerate(oem_catalog_db):
        if p['sku'] == sku:
            product_dict = product.dict()
            product_dict['updated_at'] = datetime.now().isoformat()
            product_dict['created_at'] = p.get('created_at', datetime.now().isoformat())
            oem_catalog_db[i] = product_dict
            save_catalog(oem_catalog_db)
            return product_dict

    raise HTTPException(status_code=404, detail="Product not found")

@router.delete("/{sku}")
async def delete_product(sku: str):
    """Delete product from catalog"""
    for i, p in enumerate(oem_catalog_db):
        if p['sku'] == sku:
            oem_catalog_db.pop(i)
            save_catalog(oem_catalog_db)
            return {"message": "Product deleted successfully"}

    raise HTTPException(status_code=404, detail="Product not found")

@router.post("/upload")
async def upload_catalog(file: UploadFile = File(...)):
    """Upload catalog from Excel/CSV file"""
    try:
        contents = await file.read()

        # Parse based on file type
        if file.filename.endswith('.json'):
            new_products = json.loads(contents)
        elif file.filename.endswith('.csv'):
            # Parse CSV (implement CSV parsing)
            raise HTTPException(status_code=400, detail="CSV parsing not implemented yet")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        # Add to catalog
        for product in new_products:
            if not any(p['sku'] == product['sku'] for p in oem_catalog_db):
                product['created_at'] = datetime.now().isoformat()
                product['updated_at'] = datetime.now().isoformat()
                oem_catalog_db.append(product)

        save_catalog(oem_catalog_db)

        return {
            "message": f"Successfully uploaded {len(new_products)} products",
            "total_products": len(oem_catalog_db)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
