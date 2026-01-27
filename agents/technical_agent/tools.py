from langchain.tools import tool
from typing import List, Dict
import os
import json
import re


def load_oem_catalog():
    catalog_path = os.path.join(os.path.dirname(__file__), '../../data/catalog.json')
    if os.path.exists(catalog_path):
        with open(catalog_path, 'r') as f:
            return json.load(f)
    return []


OEM_PRODUCT_CATALOG = load_oem_catalog()


@tool("search_product_catalog")
def search_product_catalog(query: str) -> str:
    """
    Search the OEM product catalog for matching products.
    Input: Search query (e.g., 'XLPE 3C 120 sqmm' or 'control cable 16 core')
    """
    query_lower = query.lower()
    matches = []
    
    for product in OEM_PRODUCT_CATALOG:
        name_match = query_lower in product["name"].lower()
        category_match = query_lower in product["category"].lower()
        
        specs_match = False
        for key, value in product["specs"].items():
            if isinstance(value, str) and query_lower in value.lower():
                specs_match = True
            elif isinstance(value, list):
                for v in value:
                    if query_lower in str(v).lower():
                        specs_match = True
        
        if name_match or category_match or specs_match:
            matches.append(product)
    
    if not matches:
        return f"No products found matching '{query}'"
    
    result = f"Found {len(matches)} products matching '{query}':\n\n"
    for p in matches:
        result += f"**SKU: {p['sku']}**\n"
        result += f"- Name: {p['name']}\n"
        result += f"- Category: {p['category']}\n"
        result += f"- Base Price: ₹{p['base_price_per_meter']}/m\n"
        result += f"- Key Specs: {json.dumps(p['specs'], indent=2)}\n\n"
    
    return result


@tool("get_product_details")
def get_product_details(sku: str) -> str:
    """
    Get detailed specifications for a specific product SKU.
    Input: Product SKU (e.g., 'PWR-XLPE-3C120-1.1')
    """
    product = next((p for p in OEM_PRODUCT_CATALOG if p["sku"] == sku), None)
    
    if not product:
        return f"Product with SKU '{sku}' not found."
    
    result = f"# Product Details: {product['sku']}\n\n"
    result += f"**Name:** {product['name']}\n"
    result += f"**Category:** {product['category']}\n"
    result += f"**Base Price:** ₹{product['base_price_per_meter']}/meter\n\n"
    
    result += "## Technical Specifications\n"
    for key, value in product["specs"].items():
        if isinstance(value, list):
            result += f"- **{key.replace('_', ' ').title()}:** {', '.join(map(str, value))}\n"
        else:
            result += f"- **{key.replace('_', ' ').title()}:** {value}\n"
    
    return result


@tool("match_rfp_requirement_to_products")
def match_rfp_requirement_to_products(rfp_requirement: str) -> str:
    """
    Match a single RFP product requirement to top 3 OEM products with spec match percentage.
    Uses 8-parameter equal-weight scoring: voltage, conductor, size, cores, insulation, armour, cable_type, application.
    Input: RFP requirement description (e.g., '1.1 kV XLPE Power Cable - 3C x 120 sqmm')
    """
    req_lower = rfp_requirement.lower()
    matches = []
    
    # Extract required specs from requirement string
    req_specs = {
        "voltage": None,
        "insulation": None,
        "cores": None,
        "size": None,
        "conductor": None,
        "armour": None,
        "cable_type": None,
        "application": None
    }
    
    # Voltage extraction
    if "11 kv" in req_lower or "11kv" in req_lower:
        req_specs["voltage"] = "11 kV"
    elif "1.1 kv" in req_lower or "1.1kv" in req_lower:
        req_specs["voltage"] = "1.1 kV"
    elif "450/750" in req_lower:
        req_specs["voltage"] = "450/750 V"
    elif "300/500" in req_lower:
        req_specs["voltage"] = "300/500 V"
    
    # Insulation extraction
    for ins in ["xlpe", "pvc", "fr-lsh", "rubber", "pe"]:
        if ins in req_lower:
            req_specs["insulation"] = ins.upper()
    
    # Cores extraction
    core_match = re.search(r'(\d+(?:\.\d+)?)\s*c(?:ore)?', req_lower)
    if core_match:
        cores_val = core_match.group(1)
        if '.' in cores_val:
            req_specs["cores"] = float(cores_val)
        else:
            req_specs["cores"] = int(cores_val)
    
    # Size extraction
    size_match = re.search(r'(\d+(?:\.\d+)?)\s*sqmm', req_lower)
    if size_match:
        req_specs["size"] = float(size_match.group(1))
    
    # Conductor extraction
    if "copper" in req_lower:
        req_specs["conductor"] = "copper"
    elif "aluminium" in req_lower or "aluminum" in req_lower:
        req_specs["conductor"] = "aluminium"
    
    # Armour extraction
    if "armour" in req_lower or "armored" in req_lower:
        req_specs["armour"] = True
    
    # Cable type extraction
    if "power" in req_lower:
        req_specs["cable_type"] = "power"
    elif "control" in req_lower:
        req_specs["cable_type"] = "control"
    elif "instrumentation" in req_lower:
        req_specs["cable_type"] = "instrumentation"
    elif "flexible" in req_lower:
        req_specs["cable_type"] = "flexible"
    
    # Application extraction
    if "underground" in req_lower:
        req_specs["application"] = "underground"
    elif "overhead" in req_lower:
        req_specs["application"] = "overhead"
    
    # Score each product (8 parameters, equal weight)
    for product in OEM_PRODUCT_CATALOG:
        score = 0
        total_criteria = 0
        match_details = []
        specs = product["specs"]
        
        # 1. Voltage (1/8 = 12.5%)
        if req_specs["voltage"]:
            total_criteria += 1
            if specs.get("voltage_grade") == req_specs["voltage"]:
                score += 1
                match_details.append("✓ Voltage")
            else:
                match_details.append("✗ Voltage")
        
        # 2. Insulation (1/8 = 12.5%)
        if req_specs["insulation"]:
            total_criteria += 1
            if req_specs["insulation"].lower() in specs.get("insulation", "").lower():
                score += 1
                match_details.append("✓ Insulation")
            else:
                match_details.append("✗ Insulation")
        
        # 3. Cores (1/8 = 12.5%)
        if req_specs["cores"]:
            total_criteria += 1
            product_cores = specs.get("cores", 0)
            if product_cores == req_specs["cores"]:
                score += 1
                match_details.append("✓ Cores")
            elif product_cores and abs(product_cores - req_specs["cores"]) <= 2:
                score += 0.5
                match_details.append("~ Cores (close)")
            else:
                match_details.append("✗ Cores")
        
        # 4. Size (1/8 = 12.5%)
        if req_specs["size"]:
            total_criteria += 1
            product_size = specs.get("conductor_size_sqmm", 0)
            if product_size == req_specs["size"]:
                score += 1
                match_details.append("✓ Size")
            elif product_size and abs(product_size - req_specs["size"]) / req_specs["size"] <= 0.25:
                score += 0.5
                match_details.append("~ Size (close)")
            else:
                match_details.append("✗ Size")
        
        # 5. Conductor (1/8 = 12.5%)
        if req_specs["conductor"]:
            total_criteria += 1
            if req_specs["conductor"].lower() in specs.get("conductor_material", "").lower():
                score += 1
                match_details.append("✓ Conductor")
            else:
                match_details.append("✗ Conductor")
        
        # 6. Armour (1/8 = 12.5%)
        if req_specs["armour"]:
            total_criteria += 1
            if "armour" in specs or "armored" in product["category"].lower():
                score += 1
                match_details.append("✓ Armour")
            else:
                match_details.append("✗ Armour")
        
        # 7. Cable Type (1/8 = 12.5%)
        if req_specs["cable_type"]:
            total_criteria += 1
            if req_specs["cable_type"].lower() in product["category"].lower():
                score += 1
                match_details.append("✓ Cable Type")
            else:
                match_details.append("✗ Cable Type")
        
        # 8. Application (1/8 = 12.5%)
        if req_specs["application"]:
            total_criteria += 1
            if specs.get("application") and req_specs["application"].lower() in specs.get("application", "").lower():
                score += 1
                match_details.append("✓ Application")
            else:
                match_details.append("✗ Application")
        
        # Calculate percentage
        if total_criteria > 0:
            match_percent = (score / total_criteria) * 100
            if match_percent > 0:
                matches.append({
                    "sku": product["sku"],
                    "name": product["name"],
                    "match_percent": match_percent,
                    "match_details": match_details,
                    "price": product["base_price_per_meter"],
                    "specs": specs
                })
    
    # Sort and get top 3
    matches.sort(key=lambda x: x["match_percent"], reverse=True)
    top_matches = matches[:3]
    
    if not top_matches:
        return f"No matching products found for: {rfp_requirement}"
    
    result = f"## Top 3 OEM Product Matches for: {rfp_requirement}\n\n"
    result += "| Rank | SKU | Product Name | Spec Match | Price/m | Match Details |\n"
    result += "|------|-----|--------------|------------|---------|---------------|\n"
    
    for i, m in enumerate(top_matches, 1):
        details = ", ".join(m["match_details"])
        result += f"| {i} | {m['sku']} | {m['name']} | {m['match_percent']:.0f}% | ₹{m['price']} | {details} |\n"
    
    return result


@tool("generate_product_comparison_table")
def generate_product_comparison_table(rfp_requirement: str, sku_list: str) -> str:
    """
    Generate a detailed comparison table of RFP specs vs OEM product specs.
    Input: rfp_requirement - the RFP requirement description
           sku_list - comma-separated list of SKUs to compare (e.g., 'SKU1,SKU2,SKU3')
    """
    skus = [s.strip() for s in sku_list.split(",")]
    products = [p for p in OEM_PRODUCT_CATALOG if p["sku"] in skus]
    
    if not products:
        return "No valid SKUs provided for comparison."
    
    result = f"## Specification Comparison: {rfp_requirement}\n\n"
    
    # Collect all unique spec keys
    all_specs = set()
    for p in products:
        all_specs.update(p["specs"].keys())
    
    # Build comparison table
    result += "| Specification | RFP Requirement |"
    for p in products:
        result += f" {p['sku']} |"
    result += "\n"
    
    result += "|---------------|-----------------|"
    for _ in products:
        result += "------------|"
    result += "\n"
    
    for spec in sorted(all_specs):
        result += f"| {spec.replace('_', ' ').title()} | - |"
        for p in products:
            value = p["specs"].get(spec, "N/A")
            if isinstance(value, list):
                value = ", ".join(map(str, value))
            result += f" {value} |"
        result += "\n"
    
    return result


@tool("list_all_products")
def list_all_products() -> str:
    """
    List all available products in the OEM catalog with basic info.
    """
    result = "# OEM Product Catalog\n\n"
    result += "| SKU | Product Name | Category | Base Price |\n"
    result += "|-----|--------------|----------|------------|\n"
    
    for p in OEM_PRODUCT_CATALOG:
        result += f"| {p['sku']} | {p['name']} | {p['category']} | ₹{p['base_price_per_meter']}/m |\n"
    
    return result


def build_technical_prompt(rfp_data: dict, top_matches: List[dict]) -> str:
    """Helper to build technical analysis prompt"""
    prompt = f"# Technical Analysis for RFP: {rfp_data.get('id', 'N/A')}\n\n"
    prompt += f"**Project:** {rfp_data.get('title', 'N/A')}\n"
    prompt += f"**Client:** {rfp_data.get('client', 'N/A')}\n\n"
    
    prompt += "## Product Matches Found:\n\n"
    for i, match in enumerate(top_matches, 1):
        prompt += f"{i}. **{match['sku']}** - {match['name']}\n"
        prompt += f"   - Match Score: {match['match_percent']:.0f}%\n"
        prompt += f"   - Price: ₹{match['price']}/meter\n\n"
    
    return prompt
