import json
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from state import AgentState, WorkflowStep, NodeName
from llm_config import get_shared_llm
from technical_agent.tools import (
    match_rfp_requirement_to_products,
    load_oem_catalog,
    OEM_PRODUCT_CATALOG,
)


def get_rfp_id(rfp: dict) -> str:
    """Helper to get RFP ID (supports both 'id' and 'rfp_id' fields)"""
    return rfp.get("id") or rfp.get("rfp_id", "")


TECHNICAL_AGENT_PROMPT = """You are a Technical Agent specialized in product specification matching for electrical cables.

**Your Responsibilities:**
- Match RFP requirements with available product SKUs from the OEM catalog
- Analyze technical specifications (voltage, size, material, certifications)
- Recommend best-fit products with match confidence scores
- Identify gaps where no suitable product exists
- Suggest alternatives when exact matches aren't available

**Product Categories You Handle:**
- Power Cables (XLPE, PVC, Armoured)
- Control Cables (Multi-core, Shielded)
- Instrumentation Cables
- Fire Retardant Cables (FR-LSH)
- Specialty Cables (Flexible, Welding, Earthing)

**Matching Criteria (8 Parameters - Equal Weight):**
1. Voltage Grade (11 kV, 1.1 kV, 450/750 V, etc.)
2. Conductor Material (Copper, Aluminium)
3. Conductor Size (sqmm)
4. Number of Cores
5. Insulation Type (XLPE, PVC, FR-LSH, Rubber)
6. Armour (if required)
7. Cable Type (Power, Control, Instrumentation, etc.)
8. Application (Underground, Overhead, Industrial)

**Output Format:**
Present a structured matching report containing:
- **RFP Item** | **Matched SKU** | **Product Name** | **Match Score (%)** | **Notes**
- Detailed comparison table showing RFP specs vs Product specs
- Unmatched requirements (if any)
- Recommended alternatives
- Technical compliance notes

**Communication Style:**
- Technical precision with clear explanations
- Use tables for spec comparisons
- Highlight match confidence and gaps
- Recommend top 3 alternatives per requirement
"""


def technical_agent_node(state: AgentState) -> Dict[str, Any]:
    """Analyzes the selected RFP technically."""
    print("\n" + "="*60)
    print("🔧 TECHNICAL AGENT STARTED")
    print("="*60)
    
    llm = get_shared_llm()
    selected_rfp = state.get("selected_rfp")
    
    print(f"Selected RFP: {get_rfp_id(selected_rfp) if selected_rfp else 'None'}")

    if not selected_rfp:
        print("❌ No RFP selected!")
        return {
            "messages": [AIMessage(content="No RFP selected. Please select an RFP first.")],
            "next_node": NodeName.END,
            "current_step": WorkflowStep.ERROR
        }

    try:
        print("📋 Extracting requirements and matching products...")
        
        # Get scope of supply from RFP
        scope_of_supply = selected_rfp.get("scope_of_supply", [])
        
        if not scope_of_supply:
            print("⚠️ No scope of supply found in RFP")
            return {
                "messages": [AIMessage(content="No product requirements found in selected RFP.")],
                "next_node": NodeName.END,
                "current_step": WorkflowStep.ERROR
            }
        
        # Match each requirement to products
        all_matches = []
        products_for_pricing = []
        matching_results_text = "## Product Matching Results\n\n"
        
        for item in scope_of_supply:
            requirement = item.get("item", "")
            quantity_str = item.get("quantity", "")
            
            print(f"🔍 Matching: {requirement}")
            
            match_result = match_rfp_requirement_to_products.invoke({"rfp_requirement": requirement})
            matching_results_text += f"### Requirement: {requirement} (Qty: {quantity_str})\n\n"
            matching_results_text += match_result + "\n\n"
            
            all_matches.append({
                "requirement": requirement,
                "quantity": quantity_str,
                "matches": match_result
            })
            
            import re
            qty_num = int(re.sub(r'[^\d]', '', quantity_str)) if quantity_str else 1000
            
            sku_match = re.search(r'\|\s*1\s*\|\s*([A-Z0-9\-\.]+)', match_result)
            if sku_match:
                top_sku = sku_match.group(1)
                products_for_pricing.append({
                    "sku": top_sku,
                    "quantity": qty_num,
                    "requirement": requirement
                })
                print(f"   → Top match: {top_sku} (qty: {qty_num})")
        
        # Build final analysis message
        analysis_message = f"""# Technical Analysis for RFP: {get_rfp_id(selected_rfp)}

**Project:** {selected_rfp.get('title', 'N/A')}
**Client:** {selected_rfp.get('client', 'N/A')}

{matching_results_text}

## Summary
- Total requirements analyzed: {len(scope_of_supply)}
- OEM products in catalog: {len(OEM_PRODUCT_CATALOG)}

**Next Step:** Proceeding to pricing analysis based on matched products.
"""

        print(f"✅ Technical analysis complete. Matched {len(scope_of_supply)} requirements")
        print(f"🔄 Routing to: {NodeName.PRICING_AGENT}")
        print("="*60 + "\n")

        return {
            "messages": [AIMessage(content=analysis_message)],
            "technical_analysis": {
                "rfp_id": get_rfp_id(selected_rfp),
                "analysis": analysis_message,
                "requirements": scope_of_supply,
                "recommended_products": products_for_pricing,
                "all_matches": all_matches,
                "total_requirements": len(scope_of_supply)
            },
            "current_step": WorkflowStep.PRICING,
            "next_node": NodeName.PRICING_AGENT
        }

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Technical Agent Error:\n{error_details}")
        return {
            "messages": [AIMessage(content=f"❌ Error analyzing RFP: {str(e)}\n\nPlease check backend logs for details.")],
            "next_node": NodeName.END,
            "current_step": WorkflowStep.ERROR
        }
