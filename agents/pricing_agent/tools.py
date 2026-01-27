from langchain.tools import tool
from typing import List, Dict
import os
import json


def load_test_pricing():
    pricing_path = os.path.join(os.path.dirname(__file__), '../../data/test_pricing.json')
    if os.path.exists(pricing_path):
        with open(pricing_path, 'r') as f:
            return json.load(f)
    return {}


def load_oem_catalog():
    catalog_path = os.path.join(os.path.dirname(__file__), '../../data/catalog.json')
    if os.path.exists(catalog_path):
        with open(catalog_path, 'r') as f:
            return json.load(f)
    return []


TEST_PRICING = load_test_pricing()
OEM_PRODUCT_CATALOG = load_oem_catalog()

# Volume Discount Tiers
VOLUME_DISCOUNTS = [
    {"min_quantity": 10000, "discount_percent": 8},
    {"min_quantity": 5000, "discount_percent": 5},
    {"min_quantity": 2000, "discount_percent": 3},
    {"min_quantity": 0, "discount_percent": 0},
]


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
def get_test_pricing_tool(test_name: str) -> str:
    """
    Get pricing for a specific test or acceptance requirement.
    Input: Test name (e.g., 'Factory Acceptance Test (FAT)')
    """
    if test_name in TEST_PRICING:
        test = TEST_PRICING[test_name]
        return f"**{test_name}**\n- Price: ₹{test['price']:,}\n- Duration: {test['duration_days']} days"
    
    # Fuzzy match
    test_lower = test_name.lower()
    for name, details in TEST_PRICING.items():
        if test_lower in name.lower():
            return f"**{name}**\n- Price: ₹{details['price']:,}\n- Duration: {details['duration_days']} days"
    
    return f"Test '{test_name}' not found in pricing database. Available tests: {', '.join(TEST_PRICING.keys())}"


@tool("calculate_total_quote")
def calculate_total_quote(products_json: str, tests_json: str) -> str:
    """
    Calculate the total quote including materials, testing, overhead (5%), and contingency (3%).
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
    
    # Material costs
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
            
            # Apply volume discount
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
    
    # Testing costs
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
    
    # Calculate overhead and contingency
    subtotal = total_material_cost + total_test_cost
    overhead = subtotal * 0.05  # 5% overhead
    contingency = subtotal * 0.03  # 3% contingency
    grand_total = subtotal + overhead + contingency
    
    result += "## Quote Summary\n"
    result += f"- Material Cost: ₹{total_material_cost:,.0f}\n"
    result += f"- Testing Cost: ₹{total_test_cost:,}\n"
    result += f"- Subtotal: ₹{subtotal:,.0f}\n"
    result += f"- Overhead (5%): ₹{overhead:,.0f}\n"
    result += f"- Contingency (3%): ₹{contingency:,.0f}\n"
    result += f"- **Final Quote: ₹{grand_total:,.0f}**\n\n"
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


def recommend_tests(rfp_testing_requirements: List[str]) -> List[str]:
    """Helper to match RFP testing requirements to available tests"""
    recommended = []
    for req in rfp_testing_requirements:
        req_lower = req.lower()
        for test_name in TEST_PRICING.keys():
            if req_lower in test_name.lower() or test_name.lower() in req_lower:
                if test_name not in recommended:
                    recommended.append(test_name)
    return recommended


def calculate_material_cost(product_sku: str, quantity: int) -> float:
    """Helper to calculate material cost for a product"""
    product = next((p for p in OEM_PRODUCT_CATALOG if p["sku"] == product_sku), None)
    if not product:
        return 0
    
    base_price = product["base_price_per_meter"]
    
    # Apply volume discount
    discount_percent = 0
    for tier in VOLUME_DISCOUNTS:
        if quantity >= tier["min_quantity"]:
            discount_percent = tier["discount_percent"]
            break
    
    discounted_price = base_price * (1 - discount_percent / 100)
    return discounted_price * quantity


def calculate_testing_cost(test_names: List[str]) -> float:
    """Helper to calculate total testing cost"""
    total = 0
    for test in test_names:
        if test in TEST_PRICING:
            total += TEST_PRICING[test]["price"]
    return total


def calculate_pricing_breakdown(material_cost: float, testing_cost: float) -> tuple:
    """Helper to calculate full pricing breakdown"""
    subtotal = material_cost + testing_cost
    overhead = subtotal * 0.05
    contingency = subtotal * 0.03
    grand_total = subtotal + overhead + contingency
    
    return overhead, contingency, subtotal, grand_total
