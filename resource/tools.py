from langchain.tools import tool
from typing import List, Dict, Any
import json
import re

# Import sample data from separate file
from sample_data import (
    SAMPLE_RFPS,
    OEM_PRODUCT_CATALOG,
    TEST_PRICING,
    VOLUME_DISCOUNTS,
)


# ========================= SALES AGENT TOOLS ========================= #

@tool("scan_rfp_websites")
def scan_rfp_websites(urls: str = "all") -> str:
    """
    Scan predefined URLs/websites to identify RFPs.
    Returns a list of RFPs found with basic details.
    Input: 'all' to scan all sources, or comma-separated URLs.
    """
    from datetime import datetime, timedelta
    
    # Filter RFPs due in next 3 months
    today = datetime.now()
    three_months_later = today + timedelta(days=90)
    
    upcoming_rfps = []
    for rfp in SAMPLE_RFPS:
        deadline = datetime.strptime(rfp["submission_deadline"], "%Y-%m-%d")
        if today <= deadline <= three_months_later:
            upcoming_rfps.append({
                "id": rfp["id"],
                "title": rfp["title"],
                "client": rfp["client"],
                "submission_deadline": rfp["submission_deadline"],
                "estimated_value": rfp["estimated_value"],
                "url": rfp["url"],
                "days_remaining": (deadline - today).days,
            })
    
    if not upcoming_rfps:
        return "No RFPs found due in the next 3 months."
    
    result = f"Found {len(upcoming_rfps)} RFPs due in the next 3 months:\n\n"
    for rfp in sorted(upcoming_rfps, key=lambda x: x["days_remaining"]):
        result += f"- **{rfp['id']}**: {rfp['title']}\n"
        result += f"  Client: {rfp['client']}\n"
        result += f"  Deadline: {rfp['submission_deadline']} ({rfp['days_remaining']} days remaining)\n"
        result += f"  Estimated Value: {rfp['estimated_value']}\n\n"
    
    return result


@tool("get_rfp_details")
def get_rfp_details(rfp_id: str) -> str:
    """
    Get detailed information about a specific RFP including scope of supply,
    technical specifications, and testing requirements.
    Input: RFP ID (e.g., 'RFP-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# RFP Details: {rfp['id']}\n\n"
    result += f"**Title:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n"
    result += f"**Submission Deadline:** {rfp['submission_deadline']}\n"
    result += f"**Estimated Value:** {rfp['estimated_value']}\n\n"
    
    result += "## Scope of Supply\n"
    for item in rfp["scope_of_supply"]:
        result += f"- {item['item']} - Qty: {item['quantity']}\n"
    
    result += "\n## Technical Specifications\n"
    for key, value in rfp["technical_specs"].items():
        if isinstance(value, list):
            result += f"- {key.replace('_', ' ').title()}: {', '.join(value)}\n"
        else:
            result += f"- {key.replace('_', ' ').title()}: {value}\n"
    
    result += "\n## Testing Requirements\n"
    for test in rfp["testing_requirements"]:
        result += f"- {test}\n"
    
    return result


@tool("extract_rfp_summary_for_technical")
def extract_rfp_summary_for_technical(rfp_id: str) -> str:
    """
    Extract and format RFP product requirements for the Technical Agent.
    Focuses on scope of supply and technical specifications.
    Input: RFP ID (e.g., 'RFP-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# Technical Summary for {rfp['id']}\n\n"
    result += f"**Project:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n\n"
    
    result += "## Products Required (Scope of Supply)\n"
    result += "| # | Product Description | Quantity |\n"
    result += "|---|---------------------|----------|\n"
    for i, item in enumerate(rfp["scope_of_supply"], 1):
        result += f"| {i} | {item['item']} | {item['quantity']} |\n"
    
    result += "\n## Technical Specifications to Match\n"
    for key, value in rfp["technical_specs"].items():
        if isinstance(value, list):
            result += f"- **{key.replace('_', ' ').title()}:** {', '.join(value)}\n"
        else:
            result += f"- **{key.replace('_', ' ').title()}:** {value}\n"
    
    return result


@tool("extract_rfp_summary_for_pricing")
def extract_rfp_summary_for_pricing(rfp_id: str) -> str:
    """
    Extract and format RFP testing requirements for the Pricing Agent.
    Focuses on testing and acceptance test requirements.
    Input: RFP ID (e.g., 'RFP-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# Pricing Summary for {rfp['id']}\n\n"
    result += f"**Project:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n\n"
    
    result += "## Testing & Acceptance Requirements\n"
    result += "| # | Test Type | Estimated Cost | Duration |\n"
    result += "|---|-----------|----------------|----------|\n"
    
    total_test_cost = 0
    for i, test in enumerate(rfp["testing_requirements"], 1):
        if test in TEST_PRICING:
            cost = TEST_PRICING[test]["price"]
            duration = TEST_PRICING[test]["duration_days"]
            total_test_cost += cost
            result += f"| {i} | {test} | ₹{cost:,} | {duration} days |\n"
        else:
            result += f"| {i} | {test} | TBD | TBD |\n"
    
    result += f"\n**Estimated Total Testing Cost:** ₹{total_test_cost:,}\n"
    
    result += "\n## Quantities for Pricing\n"
    for item in rfp["scope_of_supply"]:
        result += f"- {item['item']}: {item['quantity']}\n"
    
    return result


# ========================= TECHNICAL AGENT TOOLS ========================= #

@tool("search_product_catalog")
def search_product_catalog(query: str) -> str:
    """
    Search the OEM product catalog for matching products.
    Input: Search query (e.g., 'XLPE 3C 120 sqmm' or 'control cable 16 core')
    """
    query_lower = query.lower()
    matches = []
    
    for product in OEM_PRODUCT_CATALOG:
        # Check name and specs for matches
        name_match = query_lower in product["name"].lower()
        category_match = query_lower in product["category"].lower()
        
        # Check specs
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
    Input: RFP requirement description (e.g., '1.1 kV XLPE Power Cable - 3C x 120 sqmm')
    """
    req_lower = rfp_requirement.lower()
    matches = []
    
    # Parse requirement for key specs
    req_specs = {
        "voltage": None,
        "insulation": None,
        "cores": None,
        "size": None,
    }
    
    # Extract voltage
    if "1.1 kv" in req_lower or "1.1kv" in req_lower:
        req_specs["voltage"] = "1.1 kV"
    elif "450/750" in req_lower:
        req_specs["voltage"] = "450/750 V"
    
    # Extract insulation
    for ins in ["xlpe", "pvc", "fr-lsh", "rubber"]:
        if ins in req_lower:
            req_specs["insulation"] = ins.upper()
    
    # Extract cores
    core_match = re.search(r'(\d+)\s*c(?:ore)?', req_lower)
    if core_match:
        req_specs["cores"] = int(core_match.group(1))
    
    # Extract size
    size_match = re.search(r'(\d+(?:\.\d+)?)\s*sqmm', req_lower)
    if size_match:
        req_specs["size"] = float(size_match.group(1))
    
    # Score each product
    for product in OEM_PRODUCT_CATALOG:
        score = 0
        total_criteria = 0
        match_details = []
        
        specs = product["specs"]
        
        # Voltage match
        if req_specs["voltage"]:
            total_criteria += 1
            if specs.get("voltage_grade") == req_specs["voltage"]:
                score += 1
                match_details.append("✓ Voltage")
            else:
                match_details.append("✗ Voltage")
        
        # Insulation match
        if req_specs["insulation"]:
            total_criteria += 1
            if req_specs["insulation"].lower() in specs.get("insulation", "").lower():
                score += 1
                match_details.append("✓ Insulation")
            else:
                match_details.append("✗ Insulation")
        
        # Cores match
        if req_specs["cores"]:
            total_criteria += 1
            if specs.get("cores") == req_specs["cores"]:
                score += 1
                match_details.append("✓ Cores")
            elif specs.get("cores") and abs(specs.get("cores") - req_specs["cores"]) <= 2:
                score += 0.5
                match_details.append("~ Cores (close)")
            else:
                match_details.append("✗ Cores")
        
        # Size match
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
        
        if total_criteria > 0:
            match_percent = (score / total_criteria) * 100
            if match_percent > 0:
                matches.append({
                    "sku": product["sku"],
                    "name": product["name"],
                    "match_percent": match_percent,
                    "match_details": match_details,
                    "price": product["base_price_per_meter"],
                })
    
    # Sort by match percentage and take top 3
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
    
    # Get all unique spec keys
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


# ========================= PRICING AGENT TOOLS ========================= #

@tool("get_product_price")
def get_product_price(sku: str, quantity: str) -> str:
    """
    Get the price for a product SKU with quantity-based discounts.
    Input: sku - Product SKU, quantity - Quantity in meters (e.g., '5000')
    """
    product = next((p for p in OEM_PRODUCT_CATALOG if p["sku"] == sku), None)
    
    if not product:
        return f"Product with SKU '{sku}' not found."
    
    try:
        qty = int(quantity.replace(",", "").replace("m", "").strip())
    except ValueError:
        return f"Invalid quantity: {quantity}"
    
    base_price = product["base_price_per_meter"]
    
    # Apply volume discount
    discount_percent = 0
    for tier in VOLUME_DISCOUNTS:
        if qty >= tier["min_quantity"]:
            discount_percent = tier["discount_percent"]
            break
    
    discounted_price = base_price * (1 - discount_percent / 100)
    total_price = discounted_price * qty
    
    result = f"## Pricing for {product['sku']}\n\n"
    result += f"**Product:** {product['name']}\n"
    result += f"**Quantity:** {qty:,} meters\n"
    result += f"**Base Price:** ₹{base_price}/m\n"
    result += f"**Volume Discount:** {discount_percent}%\n"
    result += f"**Discounted Price:** ₹{discounted_price:.2f}/m\n"
    result += f"**Total Price:** ₹{total_price:,.2f}\n"
    
    return result


@tool("get_test_pricing")
def get_test_pricing(test_name: str) -> str:
    """
    Get pricing for a specific test or acceptance requirement.
    Input: Test name (e.g., 'Factory Acceptance Test (FAT)')
    """
    # Try exact match first
    if test_name in TEST_PRICING:
        test = TEST_PRICING[test_name]
        return f"**{test_name}**\n- Price: ₹{test['price']:,}\n- Duration: {test['duration_days']} days"
    
    # Try partial match
    test_lower = test_name.lower()
    for name, details in TEST_PRICING.items():
        if test_lower in name.lower():
            return f"**{name}**\n- Price: ₹{details['price']:,}\n- Duration: {details['duration_days']} days"
    
    return f"Test '{test_name}' not found in pricing database. Available tests: {', '.join(TEST_PRICING.keys())}"


@tool("calculate_total_quote")
def calculate_total_quote(products_json: str, tests_json: str) -> str:
    """
    Calculate the total quote including materials and testing costs.
    Input: 
        products_json - JSON string of products: [{"sku": "SKU1", "quantity": 5000}, ...]
        tests_json - JSON string of tests: ["Test 1", "Test 2", ...]
    """
    try:
        products = json.loads(products_json)
        tests = json.loads(tests_json)
    except json.JSONDecodeError:
        return "Invalid JSON input. Please provide valid JSON for products and tests."
    
    result = "# Consolidated Quote\n\n"
    
    # Calculate material costs
    result += "## Material Costs\n"
    result += "| SKU | Product | Qty | Unit Price | Discount | Total |\n"
    result += "|-----|---------|-----|------------|----------|-------|\n"
    
    total_material_cost = 0
    for item in products:
        sku = item.get("sku", "")
        qty = item.get("quantity", 0)
        
        product = next((p for p in OEM_PRODUCT_CATALOG if p["sku"] == sku), None)
        if product:
            base_price = product["base_price_per_meter"]
            
            # Apply discount
            discount_percent = 0
            for tier in VOLUME_DISCOUNTS:
                if qty >= tier["min_quantity"]:
                    discount_percent = tier["discount_percent"]
                    break
            
            unit_price = base_price * (1 - discount_percent / 100)
            total = unit_price * qty
            total_material_cost += total
            
            result += f"| {sku} | {product['name'][:30]} | {qty:,} | ₹{base_price} | {discount_percent}% | ₹{total:,.0f} |\n"
    
    result += f"\n**Total Material Cost:** ₹{total_material_cost:,.0f}\n\n"
    
    # Calculate testing costs
    result += "## Testing Costs\n"
    result += "| Test | Price | Duration |\n"
    result += "|------|-------|----------|\n"
    
    total_test_cost = 0
    for test in tests:
        if test in TEST_PRICING:
            price = TEST_PRICING[test]["price"]
            duration = TEST_PRICING[test]["duration_days"]
            total_test_cost += price
            result += f"| {test} | ₹{price:,} | {duration} days |\n"
    
    result += f"\n**Total Testing Cost:** ₹{total_test_cost:,}\n\n"
    
    # Grand total
    grand_total = total_material_cost + total_test_cost
    margin = grand_total * 0.20  # 20% margin
    final_quote = grand_total + margin
    
    result += "## Quote Summary\n"
    result += f"- Material Cost: ₹{total_material_cost:,.0f}\n"
    result += f"- Testing Cost: ₹{total_test_cost:,}\n"
    result += f"- Subtotal: ₹{grand_total:,.0f}\n"
    result += f"- Margin (20%): ₹{margin:,.0f}\n"
    result += f"- **Final Quote: ₹{final_quote:,.0f}**\n\n"
    result += f"*Validity: 30 days from quote date*\n"
    result += f"*Payment Terms: 30% advance, 70% on delivery*\n"
    
    return result


@tool("list_all_tests")
def list_all_tests() -> str:
    """
    List all available tests with their prices and durations.
    """
    result = "# Available Tests & Pricing\n\n"
    result += "| Test Name | Price | Duration |\n"
    result += "|-----------|-------|----------|\n"
    
    for test, details in TEST_PRICING.items():
        result += f"| {test} | ₹{details['price']:,} | {details['duration_days']} days |\n"
    
    return result

# Test Pricing Data
TEST_PRICING = {
    "Type Test as per IS 7098": {"price": 150000, "duration_days": 15},
    "Type Test": {"price": 120000, "duration_days": 12},
    "Factory Acceptance Test (FAT)": {"price": 75000, "duration_days": 5},
    "Site Acceptance Test (SAT)": {"price": 95000, "duration_days": 7},
    "Partial Discharge Test": {"price": 45000, "duration_days": 3},
    "High Voltage Test": {"price": 35000, "duration_days": 2},
    "Routine Test": {"price": 25000, "duration_days": 2},
    "Sample Test": {"price": 30000, "duration_days": 3},
}

# Volume Discount Tiers
VOLUME_DISCOUNTS = [
    {"min_quantity": 10000, "discount_percent": 8},
    {"min_quantity": 5000, "discount_percent": 5},
    {"min_quantity": 2000, "discount_percent": 3},
    {"min_quantity": 0, "discount_percent": 0},
]


# ========================= SALES AGENT TOOLS ========================= #

@tool("scan_rfp_websites")
def scan_rfp_websites(urls: str = "all") -> str:
    """
    Scan predefined URLs/websites to identify RFPs.
    Returns a list of RFPs found with basic details.
    Input: 'all' to scan all sources, or comma-separated URLs.
    """
    from datetime import datetime, timedelta
    
    # Filter RFPs due in next 3 months
    today = datetime.now()
    three_months_later = today + timedelta(days=90)
    
    upcoming_rfps = []
    for rfp in SAMPLE_RFPS:
        deadline = datetime.strptime(rfp["submission_deadline"], "%Y-%m-%d")
        if today <= deadline <= three_months_later:
            upcoming_rfps.append({
                "id": rfp["id"],
                "title": rfp["title"],
                "client": rfp["client"],
                "submission_deadline": rfp["submission_deadline"],
                "estimated_value": rfp["estimated_value"],
                "url": rfp["url"],
                "days_remaining": (deadline - today).days,
            })
    
    if not upcoming_rfps:
        return "No RFPs found due in the next 3 months."
    
    result = f"Found {len(upcoming_rfps)} RFPs due in the next 3 months:\n\n"
    for rfp in sorted(upcoming_rfps, key=lambda x: x["days_remaining"]):
        result += f"- **{rfp['id']}**: {rfp['title']}\n"
        result += f"  Client: {rfp['client']}\n"
        result += f"  Deadline: {rfp['submission_deadline']} ({rfp['days_remaining']} days remaining)\n"
        result += f"  Estimated Value: {rfp['estimated_value']}\n\n"
    
    return result


@tool("get_rfp_details")
def get_rfp_details(rfp_id: str) -> str:
    """
    Get detailed information about a specific RFP including scope of supply,
    technical specifications, and testing requirements.
    Input: RFP ID (e.g., 'RFP-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# RFP Details: {rfp['id']}\n\n"
    result += f"**Title:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n"
    result += f"**Submission Deadline:** {rfp['submission_deadline']}\n"
    result += f"**Estimated Value:** {rfp['estimated_value']}\n\n"
    
    result += "## Scope of Supply\n"
    for item in rfp["scope_of_supply"]:
        result += f"- {item['item']} - Qty: {item['quantity']}\n"
    
    result += "\n## Technical Specifications\n"
    for key, value in rfp["technical_specs"].items():
        if isinstance(value, list):
            result += f"- {key.replace('_', ' ').title()}: {', '.join(value)}\n"
        else:
            result += f"- {key.replace('_', ' ').title()}: {value}\n"
    
    result += "\n## Testing Requirements\n"
    for test in rfp["testing_requirements"]:
        result += f"- {test}\n"
    
    return result


@tool("extract_rfp_summary_for_technical")
def extract_rfp_summary_for_technical(rfp_id: str) -> str:
    """
    Extract and format RFP product requirements for the Technical Agent.
    Focuses on scope of supply and technical specifications.
    Input: RFP ID (e.g., 'RFP-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# Technical Summary for {rfp['id']}\n\n"
    result += f"**Project:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n\n"
    
    result += "## Products Required (Scope of Supply)\n"
    result += "| # | Product Description | Quantity |\n"
    result += "|---|---------------------|----------|\n"
    for i, item in enumerate(rfp["scope_of_supply"], 1):
        result += f"| {i} | {item['item']} | {item['quantity']} |\n"
    
    result += "\n## Technical Specifications to Match\n"
    for key, value in rfp["technical_specs"].items():
        if isinstance(value, list):
            result += f"- **{key.replace('_', ' ').title()}:** {', '.join(value)}\n"
        else:
            result += f"- **{key.replace('_', ' ').title()}:** {value}\n"
    
    return result


@tool("extract_rfp_summary_for_pricing")
def extract_rfp_summary_for_pricing(rfp_id: str) -> str:
    """
    Extract and format RFP testing requirements for the Pricing Agent.
    Focuses on testing and acceptance test requirements.
    Input: RFP ID (e.g., 'RFP-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# Pricing Summary for {rfp['id']}\n\n"
    result += f"**Project:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n\n"
    
    result += "## Testing & Acceptance Requirements\n"
    result += "| # | Test Type | Estimated Cost | Duration |\n"
    result += "|---|-----------|----------------|----------|\n"
    
    total_test_cost = 0
    for i, test in enumerate(rfp["testing_requirements"], 1):
        if test in TEST_PRICING:
            cost = TEST_PRICING[test]["price"]
            duration = TEST_PRICING[test]["duration_days"]
            total_test_cost += cost
            result += f"| {i} | {test} | ₹{cost:,} | {duration} days |\n"
        else:
            result += f"| {i} | {test} | TBD | TBD |\n"
    
    result += f"\n**Estimated Total Testing Cost:** ₹{total_test_cost:,}\n"
    
    result += "\n## Quantities for Pricing\n"
    for item in rfp["scope_of_supply"]:
        result += f"- {item['item']}: {item['quantity']}\n"
    
    return result


# ========================= TECHNICAL AGENT TOOLS ========================= #

@tool("search_product_catalog")
def search_product_catalog(query: str) -> str:
    """
    Search the OEM product catalog for matching products.
    Input: Search query (e.g., 'XLPE 3C 120 sqmm' or 'control cable 16 core')
    """
    query_lower = query.lower()
    matches = []
    
    for product in OEM_PRODUCT_CATALOG:
        # Check name and specs for matches
        name_match = query_lower in product["name"].lower()
        category_match = query_lower in product["category"].lower()
        
        # Check specs
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
    Input: RFP requirement description (e.g., '1.1 kV XLPE Power Cable - 3C x 120 sqmm')
    """
    import re
    
    req_lower = rfp_requirement.lower()
    matches = []
    
    # Parse requirement for key specs
    req_specs = {
        "voltage": None,
        "insulation": None,
        "cores": None,
        "size": None,
    }
    
    # Extract voltage
    if "1.1 kv" in req_lower or "1.1kv" in req_lower:
        req_specs["voltage"] = "1.1 kV"
    elif "450/750" in req_lower:
        req_specs["voltage"] = "450/750 V"
    
    # Extract insulation
    for ins in ["xlpe", "pvc", "fr-lsh", "rubber"]:
        if ins in req_lower:
            req_specs["insulation"] = ins.upper()
    
    # Extract cores
    core_match = re.search(r'(\d+)\s*c(?:ore)?', req_lower)
    if core_match:
        req_specs["cores"] = int(core_match.group(1))
    
    # Extract size
    size_match = re.search(r'(\d+(?:\.\d+)?)\s*sqmm', req_lower)
    if size_match:
        req_specs["size"] = float(size_match.group(1))
    
    # Score each product
    for product in OEM_PRODUCT_CATALOG:
        score = 0
        total_criteria = 0
        match_details = []
        
        specs = product["specs"]
        
        # Voltage match
        if req_specs["voltage"]:
            total_criteria += 1
            if specs.get("voltage_grade") == req_specs["voltage"]:
                score += 1
                match_details.append("✓ Voltage")
            else:
                match_details.append("✗ Voltage")
        
        # Insulation match
        if req_specs["insulation"]:
            total_criteria += 1
            if req_specs["insulation"].lower() in specs.get("insulation", "").lower():
                score += 1
                match_details.append("✓ Insulation")
            else:
                match_details.append("✗ Insulation")
        
        # Cores match
        if req_specs["cores"]:
            total_criteria += 1
            if specs.get("cores") == req_specs["cores"]:
                score += 1
                match_details.append("✓ Cores")
            elif specs.get("cores") and abs(specs.get("cores") - req_specs["cores"]) <= 2:
                score += 0.5
                match_details.append("~ Cores (close)")
            else:
                match_details.append("✗ Cores")
        
        # Size match
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
        
        if total_criteria > 0:
            match_percent = (score / total_criteria) * 100
            if match_percent > 0:
                matches.append({
                    "sku": product["sku"],
                    "name": product["name"],
                    "match_percent": match_percent,
                    "match_details": match_details,
                    "price": product["base_price_per_meter"],
                })
    
    # Sort by match percentage and take top 3
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
    
    # Get all unique spec keys
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


# ========================= PRICING AGENT TOOLS ========================= #

@tool("get_product_price")
def get_product_price(sku: str, quantity: str) -> str:
    """
    Get the price for a product SKU with quantity-based discounts.
    Input: sku - Product SKU, quantity - Quantity in meters (e.g., '5000')
    """
    product = next((p for p in OEM_PRODUCT_CATALOG if p["sku"] == sku), None)
    
    if not product:
        return f"Product with SKU '{sku}' not found."
    
    try:
        qty = int(quantity.replace(",", "").replace("m", "").strip())
    except ValueError:
        return f"Invalid quantity: {quantity}"
    
    base_price = product["base_price_per_meter"]
    
    # Apply volume discount
    discount_percent = 0
    for tier in VOLUME_DISCOUNTS:
        if qty >= tier["min_quantity"]:
            discount_percent = tier["discount_percent"]
            break
    
    discounted_price = base_price * (1 - discount_percent / 100)
    total_price = discounted_price * qty
    
    result = f"## Pricing for {product['sku']}\n\n"
    result += f"**Product:** {product['name']}\n"
    result += f"**Quantity:** {qty:,} meters\n"
    result += f"**Base Price:** ₹{base_price}/m\n"
    result += f"**Volume Discount:** {discount_percent}%\n"
    result += f"**Discounted Price:** ₹{discounted_price:.2f}/m\n"
    result += f"**Total Price:** ₹{total_price:,.2f}\n"
    
    return result


@tool("get_test_pricing")
def get_test_pricing(test_name: str) -> str:
    """
    Get pricing for a specific test or acceptance requirement.
    Input: Test name (e.g., 'Factory Acceptance Test (FAT)')
    """
    # Try exact match first
    if test_name in TEST_PRICING:
        test = TEST_PRICING[test_name]
        return f"**{test_name}**\n- Price: ₹{test['price']:,}\n- Duration: {test['duration_days']} days"
    
    # Try partial match
    test_lower = test_name.lower()
    for name, details in TEST_PRICING.items():
        if test_lower in name.lower():
            return f"**{name}**\n- Price: ₹{details['price']:,}\n- Duration: {details['duration_days']} days"
    
    return f"Test '{test_name}' not found in pricing database. Available tests: {', '.join(TEST_PRICING.keys())}"


@tool("calculate_total_quote")
def calculate_total_quote(products_json: str, tests_json: str) -> str:
    """
    Calculate the total quote including materials and testing costs.
    Input: 
        products_json - JSON string of products: [{"sku": "SKU1", "quantity": 5000}, ...]
        tests_json - JSON string of tests: ["Test 1", "Test 2", ...]
    """
    try:
        products = json.loads(products_json)
        tests = json.loads(tests_json)
    except json.JSONDecodeError:
        return "Invalid JSON input. Please provide valid JSON for products and tests."
    
    result = "# Consolidated Quote\n\n"
    
    # Calculate material costs
    result += "## Material Costs\n"
    result += "| SKU | Product | Qty | Unit Price | Discount | Total |\n"
    result += "|-----|---------|-----|------------|----------|-------|\n"
    
    total_material_cost = 0
    for item in products:
        sku = item.get("sku", "")
        qty = item.get("quantity", 0)
        
        product = next((p for p in OEM_PRODUCT_CATALOG if p["sku"] == sku), None)
        if product:
            base_price = product["base_price_per_meter"]
            
            # Apply discount
            discount_percent = 0
            for tier in VOLUME_DISCOUNTS:
                if qty >= tier["min_quantity"]:
                    discount_percent = tier["discount_percent"]
                    break
            
            unit_price = base_price * (1 - discount_percent / 100)
            total = unit_price * qty
            total_material_cost += total
            
            result += f"| {sku} | {product['name'][:30]} | {qty:,} | ₹{base_price} | {discount_percent}% | ₹{total:,.0f} |\n"
    
    result += f"\n**Total Material Cost:** ₹{total_material_cost:,.0f}\n\n"
    
    # Calculate testing costs
    result += "## Testing Costs\n"
    result += "| Test | Price | Duration |\n"
    result += "|------|-------|----------|\n"
    
    total_test_cost = 0
    for test in tests:
        if test in TEST_PRICING:
            price = TEST_PRICING[test]["price"]
            duration = TEST_PRICING[test]["duration_days"]
            total_test_cost += price
            result += f"| {test} | ₹{price:,} | {duration} days |\n"
    
    result += f"\n**Total Testing Cost:** ₹{total_test_cost:,}\n\n"
    
    # Grand total
    grand_total = total_material_cost + total_test_cost
    margin = grand_total * 0.20  # 20% margin
    final_quote = grand_total + margin
    
    result += "## Quote Summary\n"
    result += f"- Material Cost: ₹{total_material_cost:,.0f}\n"
    result += f"- Testing Cost: ₹{total_test_cost:,}\n"
    result += f"- Subtotal: ₹{grand_total:,.0f}\n"
    result += f"- Margin (20%): ₹{margin:,.0f}\n"
    result += f"- **Final Quote: ₹{final_quote:,.0f}**\n\n"
    result += f"*Validity: 30 days from quote date*\n"
    result += f"*Payment Terms: 30% advance, 70% on delivery*\n"
    
    return result


@tool("list_all_tests")
def list_all_tests() -> str:
    """
    List all available tests with their prices and durations.
    """
    result = "# Available Tests & Pricing\n\n"
    result += "| Test Name | Price | Duration |\n"
    result += "|-----------|-------|----------|\n"
    
    for test, details in TEST_PRICING.items():
        result += f"| {test} | ₹{details['price']:,} | {details['duration_days']} days |\n"
    
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
