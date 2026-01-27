import json
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from state import AgentState, WorkflowStep, NodeName
from llm_config import get_shared_llm
from pricing_agent.tools import (
    load_test_pricing,
    recommend_tests,
    calculate_testing_cost,
    calculate_material_cost,
    calculate_pricing_breakdown,
)


def get_rfp_id(rfp: dict) -> str:
    """Helper to get RFP ID (supports both 'id' and 'rfp_id' fields)"""
    return rfp.get("id") or rfp.get("rfp_id", "")


PRICING_AGENT_PROMPT = """You are a Pricing Agent specialized in quote generation and cost calculation for electrical cables.

**Your Responsibilities:**
- Calculate unit prices based on product costs and quantities
- Apply volume discounts and bulk pricing rules
- Include testing and certification costs
- Factor in delivery, installation, and warranty costs
- Generate competitive yet profitable quotes
- Ensure margin targets are met

**Pricing Components to Consider:**
1. **Base Material Cost** - Per meter pricing from OEM catalog
2. **Volume Discounts**:
   - 10,000+ meters: 8% discount
   - 5,000+ meters: 5% discount
   - 2,000+ meters: 3% discount
3. **Testing Costs** - Type test, FAT, SAT, High Voltage tests
4. **Overhead** - 5% of subtotal (manufacturing, admin, logistics)
5. **Contingency** - 3% of subtotal (risk buffer)
6. **Packaging and Transportation** (if applicable)
7. **Installation Support** (if required)
8. **Warranty Provisions**

**Output Format:**
Present a structured quote containing:
- **Line Items** with Unit Price and Extended Price
- **Volume Discounts Applied**
- **Testing Costs Breakdown** (per test type)
- **Overhead (5%)** and **Contingency (3%)**
- **Total Quote Amount**
- **Payment Terms Recommendation** (e.g., 30% advance, 70% on delivery)
- **Validity Period** (typically 30 days)

**Communication Style:**
- Professional and financially precise
- Use tables for cost breakdowns
- Clearly show all calculations
- Highlight competitive advantages
- Be transparent about assumptions
"""


def pricing_agent_node(state: AgentState) -> Dict[str, Any]:
    """Generate pricing summary for selected RFP."""
    print("\n" + "="*60)
    print("💰 PRICING AGENT STARTED")
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
        print("💵 Loading pricing data...")
        pricing_db = load_test_pricing()
        rfp_testing_reqs = selected_rfp.get("testing_requirements", [])
        recommended_tests = recommend_tests(rfp_testing_reqs)
        testing_cost = calculate_testing_cost(recommended_tests)

        technical_analysis = state.get("technical_analysis") or {}
        recommended_products = technical_analysis.get("recommended_products", [])
        
        material_cost = 0
        for product in recommended_products:
            if isinstance(product, dict):
                sku = product.get("sku", "")
                qty = product.get("quantity", 1000)
                if sku:
                    material_cost += calculate_material_cost(sku, qty)
        overhead, contingency, subtotal, grand_total = calculate_pricing_breakdown(material_cost, testing_cost)

        pricing_summary = {
            "rfp_id": get_rfp_id(selected_rfp),
            "recommended_tests": recommended_tests,
            "testing_cost": testing_cost,
            "material_cost": material_cost,
            "overhead_pct": 0.05,
            "contingency_pct": 0.03,
            "overhead_cost": overhead,
            "contingency_cost": contingency,
            "subtotal": subtotal,
            "grand_total": grand_total,
        }

        # Only include essential technical data - not the full analysis text
        prompt = f"""
Selected RFP: {get_rfp_id(selected_rfp)} - {selected_rfp.get('title')}
Value: ₹{selected_rfp.get('value', 'N/A')}

Recommended Products (from Technical Agent):
{json.dumps(recommended_products, indent=2, default=str)}

Pricing Breakdown:
- Material Cost: ₹{material_cost:,.2f}
- Testing Cost: ₹{testing_cost:,.2f}
- Overhead (5%): ₹{overhead:,.2f}
- Contingency (3%): ₹{contingency:,.2f}
- **Grand Total: ₹{grand_total:,.2f}**

Provide a concise pricing summary with key assumptions and next steps.
"""

        messages = [
            SystemMessage(content=PRICING_AGENT_PROMPT),
            HumanMessage(content=prompt)
        ]

        print(f"🤖 Calling LLM for pricing analysis... (prompt size: {len(prompt)} chars)")
        try:
            response = llm.invoke(messages)
            print(f"📥 LLM response received ({len(response.content)} chars)")
        except Exception as llm_error:
            print(f"❌ LLM call failed: {str(llm_error)}")
            raise
        
        print(f"✅ Pricing analysis complete. Grand total: ₹{pricing_summary['grand_total']}")
        print(f"🔄 Routing to: {NodeName.MAIN_AGENT}")
        print("="*60 + "\n")

        return {
            "messages": [AIMessage(content=response.content)],
            "pricing_analysis": {"rfp_id": selected_rfp.get("rfp_id"), "analysis": response.content, "inputs": pricing_summary},
            "current_step": WorkflowStep.COMPLETE,
            "next_node": NodeName.MAIN_AGENT
        }

    except Exception as e:
        return {
            "messages": [AIMessage(content=f"Error generating pricing: {str(e)}")],
            "next_node": NodeName.END,
            "current_step": WorkflowStep.ERROR
        }
