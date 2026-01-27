import json
from typing import Dict, Any
from langchain_core.messages import AIMessage, HumanMessage

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from state import AgentState, WorkflowStep, NodeName
from llm_config import get_shared_llm
from utils import generate_pdf_report
from main_agent.tools import extract_rfp_selection, is_scan_request, is_selection_request


def main_agent_node(state: AgentState) -> Dict[str, Any]:
    """Routes user requests to appropriate agent."""
    print("\n" + "="*60)
    print("🎯 MAIN AGENT (ORCHESTRATOR) STARTED")
    print("="*60)
    
    user_message = state["messages"][-1].content if state["messages"] else ""
    rfps_identified = state.get("rfps_identified", [])
    pricing_analysis = state.get("pricing_analysis")
    technical_analysis = state.get("technical_analysis")
    selected_rfp = state.get("selected_rfp")
    
    print(f"User message: {user_message[:100]}...")
    print(f"RFPs identified: {len(rfps_identified)}")
    print(f"Selected RFP: {selected_rfp.get('rfp_id') if selected_rfp else 'None'}")
    print(f"Technical analysis: {'✓' if technical_analysis else '✗'}")
    print(f"Pricing analysis: {'✓' if pricing_analysis else '✗'}")

    if pricing_analysis and technical_analysis and selected_rfp and not state.get("final_response"):
        print("📊 All analyses complete - generating final PDF report...")
        try:
            llm = get_shared_llm()
            session_id = state.get("session_id", "default")
            rfp_id = selected_rfp.get("rfp_id", "rfp")

            report_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "reports")
            report_filename = f"{session_id}_{rfp_id}.pdf".replace("/", "_")
            report_path = os.path.join(report_dir, report_filename)
            report_url = f"/api/reports/{session_id}/{rfp_id}"

            # Simplified prompt - don't include massive JSONs
            prompt = f"""
You are the Main Orchestrator. Create a brief executive summary for this RFP response.

RFP: {selected_rfp.get('rfp_id')} - {selected_rfp.get('title')}
Value: ₹{selected_rfp.get('value', 'N/A')}

Key Points:
- Technical analysis: {len((technical_analysis or {}).get('recommended_products', []))} products recommended
- Total cost: ₹{(pricing_analysis or {}).get('inputs', {}).get('grand_total', 'N/A')}

Provide a 2-3 sentence executive summary with a recommendation (proceed/review/decline).
"""

            print("🤖 Generating executive summary...")
            response = llm.invoke([HumanMessage(content=prompt)])
            print(f"📥 Executive summary received ({len(response.content)} chars)")

            sections = [
                ("Executive Summary", response.content),
                ("Technical Analysis", (technical_analysis or {}).get("analysis", "")),
                ("Pricing Summary", (pricing_analysis or {}).get("analysis", "")),
            ]
            
            print(f"📄 Generating PDF at {report_path}...")
            generate_pdf_report(report_path, f"RFP Response Report - {rfp_id}", sections)
            print(f"✅ PDF successfully generated!")
            
        except Exception as pdf_error:
            import traceback
            error_details = traceback.format_exc()
            print(f"❌ PDF Generation Error:\n{error_details}")
            return {
                "messages": [AIMessage(content=f"❌ Error generating PDF: {str(pdf_error)}")],
                "next_node": NodeName.END,
                "current_step": WorkflowStep.ERROR
            }

        final_message = (
            f"{response.content}\n\n"
            f"---\n\n"
            f"📄 **[Download PDF Report]({report_url})**"
        )
        
        print(f"✅ PDF generated at: {report_path}")
        print(f"🔄 Routing to: {NodeName.END}")
        print("="*60 + "\n")

        return {
            "messages": [AIMessage(content=final_message)],
            "final_response": response.content,
            "report_path": report_path,
            "report_url": report_url,
            "current_step": WorkflowStep.COMPLETE,
            "next_node": NodeName.END
        }

    if rfps_identified and is_selection_request(user_message):
        print("🔍 Detected RFP selection request")
        selected_id = extract_rfp_selection(user_message, rfps_identified)
        print(f"Selected ID: {selected_id}")

        if selected_id:
            selected_rfp = next((r for r in rfps_identified if r.get("rfp_id") == selected_id), None)

            if selected_rfp:
                print(f"✅ RFP found: {selected_rfp.get('rfp_id')}")
                print(f"🔄 Routing to: {NodeName.TECHNICAL_AGENT}")
                print("="*60 + "\n")
                return {
                    "selected_rfp": selected_rfp,
                    "user_selected_rfp_id": selected_id,
                    "current_step": WorkflowStep.ANALYZING,
                    "next_node": NodeName.TECHNICAL_AGENT
                }

        return {
            "messages": [AIMessage(content="Please specify which RFP you'd like to select. Use the RFP number (1, 2, 3) or the RFP ID.")],
            "next_node": NodeName.END
        }

    if is_scan_request(user_message) or not rfps_identified:
        print(f"🔍 Detected scan request")
        print(f"🔄 Routing to: {NodeName.SALES_AGENT}")
        print("="*60 + "\n")
        return {
            "current_step": WorkflowStep.SCANNING,
            "next_node": NodeName.SALES_AGENT
        }

    print("❓ No clear action - ending workflow")
    print("="*60 + "\n")
    return {
        "messages": [AIMessage(content="I can help you scan for RFPs or analyze a selected one. What would you like to do?")],
        "next_node": NodeName.END
    }
