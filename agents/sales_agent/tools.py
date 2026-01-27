from langchain.tools import tool
from typing import List, Dict
from datetime import datetime, timedelta
import os
import json

# Load sample RFPs from data folder
def load_sample_rfps():
    data_path = os.path.join(os.path.dirname(__file__), '../../data/rfps.json')
    if os.path.exists(data_path):
        with open(data_path, 'r') as f:
            return json.load(f)
    return []

SAMPLE_RFPS = load_sample_rfps()


@tool("scan_rfp_websites")
def scan_rfp_websites(urls: str = "all") -> str:
    """
    Scan predefined URLs/websites to identify RFPs.
    Returns a list of RFPs found with basic details.
    Input: 'all' to scan all sources, or comma-separated URLs.
    """
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
                "url": rfp.get("url", "N/A"),
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
    Input: RFP ID (e.g., 'TOT-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# RFP Details: {rfp['id']}\n\n"
    result += f"**Title:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n"
    result += f"**Submission Deadline:** {rfp['submission_deadline']}\n"
    result += f"**Estimated Value:** {rfp['estimated_value']}\n\n"
    
    if "scope_of_supply" in rfp:
        result += "## Scope of Supply\n"
        for item in rfp["scope_of_supply"]:
            result += f"- {item['item']} - Qty: {item['quantity']}\n"
    
    if "technical_specs" in rfp:
        result += "\n## Technical Specifications\n"
        for key, value in rfp["technical_specs"].items():
            if isinstance(value, list):
                result += f"- {key.replace('_', ' ').title()}: {', '.join(value)}\n"
            else:
                result += f"- {key.replace('_', ' ').title()}: {value}\n"
    
    if "testing_requirements" in rfp:
        result += "\n## Testing Requirements\n"
        for test in rfp["testing_requirements"]:
            result += f"- {test}\n"
    
    return result


@tool("extract_rfp_summary_for_technical")
def extract_rfp_summary_for_technical(rfp_id: str) -> str:
    """
    Extract and format RFP product requirements for the Technical Agent.
    Focuses on scope of supply and technical specifications.
    Input: RFP ID (e.g., 'TOT-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# Technical Summary for {rfp['id']}\n\n"
    result += f"**Project:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n\n"
    
    if "scope_of_supply" in rfp:
        result += "## Products Required (Scope of Supply)\n"
        result += "| # | Product Description | Quantity |\n"
        result += "|---|---------------------|----------|\n"
        for i, item in enumerate(rfp["scope_of_supply"], 1):
            result += f"| {i} | {item['item']} | {item['quantity']} |\n"
    
    if "technical_specs" in rfp:
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
    Input: RFP ID (e.g., 'TOT-2026-001')
    """
    rfp = next((r for r in SAMPLE_RFPS if r["id"] == rfp_id), None)
    
    if not rfp:
        return f"RFP with ID '{rfp_id}' not found."
    
    result = f"# Pricing Summary for {rfp['id']}\n\n"
    result += f"**Project:** {rfp['title']}\n"
    result += f"**Client:** {rfp['client']}\n\n"
    
    # Load test pricing
    test_pricing_path = os.path.join(os.path.dirname(__file__), '../../data/test_pricing.json')
    test_pricing = {}
    if os.path.exists(test_pricing_path):
        with open(test_pricing_path, 'r') as f:
            test_pricing = json.load(f)
    
    if "testing_requirements" in rfp:
        result += "## Testing & Acceptance Requirements\n"
        result += "| # | Test Type | Estimated Cost | Duration |\n"
        result += "|---|-----------|----------------|----------|\n"
        
        total_test_cost = 0
        for i, test in enumerate(rfp["testing_requirements"], 1):
            if test in test_pricing:
                cost = test_pricing[test]["price"]
                duration = test_pricing[test]["duration_days"]
                total_test_cost += cost
                result += f"| {i} | {test} | ₹{cost:,} | {duration} days |\n"
            else:
                result += f"| {i} | {test} | TBD | TBD |\n"
        
        result += f"\n**Estimated Total Testing Cost:** ₹{total_test_cost:,}\n"
    
    if "scope_of_supply" in rfp:
        result += "\n## Quantities for Pricing\n"
        for item in rfp["scope_of_supply"]:
            result += f"- {item['item']}: {item['quantity']}\n"
    
    return result


def qualify_rfp_tool(rfp_data: dict) -> bool:
    """Helper function to qualify RFPs based on business criteria"""
    try:
        # Basic qualification criteria
        if not rfp_data.get("estimated_value"):
            return False
        
        # Check deadline is reasonable (at least 7 days away)
        deadline_str = rfp_data.get("submission_deadline", "")
        if deadline_str:
            deadline = datetime.strptime(deadline_str, "%Y-%m-%d")
            days_remaining = (deadline - datetime.now()).days
            if days_remaining < 7:
                return False
        
        return True
    except Exception:
        return False


def prioritize_rfps_tool(rfps: List[dict]) -> List[dict]:
    """Helper function to prioritize RFPs based on scoring criteria"""
    scored_rfps = []
    
    for rfp in rfps:
        score = 0
        
        # Score based on value (simplified)
        value_str = rfp.get("estimated_value", "₹0")
        try:
            # Extract numeric value
            import re
            value_match = re.search(r'(\d+(?:\.\d+)?)', value_str)
            if value_match:
                value = float(value_match.group(1))
                if "Cr" in value_str:
                    value *= 10000000
                elif "L" in value_str or "Lakh" in value_str:
                    value *= 100000
                
                # Higher value = higher score (max 50 points)
                if value >= 50000000:
                    score += 50
                elif value >= 10000000:
                    score += 40
                elif value >= 5000000:
                    score += 30
                else:
                    score += 20
        except:
            pass
        
        # Score based on deadline urgency (max 50 points)
        deadline_str = rfp.get("submission_deadline", "")
        if deadline_str:
            try:
                deadline = datetime.strptime(deadline_str, "%Y-%m-%d")
                days_remaining = (deadline - datetime.now()).days
                if 30 <= days_remaining <= 60:
                    score += 50  # Optimal window
                elif 15 <= days_remaining < 30:
                    score += 40
                elif 60 < days_remaining <= 90:
                    score += 35
                else:
                    score += 20
            except:
                pass
        
        scored_rfps.append({
            **rfp,
            "priority_score": score
        })
    
    # Sort by score (descending)
    scored_rfps.sort(key=lambda x: x["priority_score"], reverse=True)
    
    return scored_rfps[:5]  # Return top 5
