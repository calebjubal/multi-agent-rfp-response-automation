import os
import json
from typing import Dict, Any
from datetime import datetime
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from state import AgentState, WorkflowStep, NodeName
from sales_agent.tools import scan_rfp_websites, get_rfp_details, qualify_rfp_tool, prioritize_rfps_tool, SAMPLE_RFPS
from llm_config import get_shared_llm

SALES_AGENT_SYSTEM_PROMPT = """You are a Sales Agent specialized in RFP (Request for Proposal) analysis for electrical cable manufacturing.

**Your Responsibilities:**
- Scan and identify RFP documents from various sources
- Extract key requirements, specifications, and deadlines
- Summarize client needs and project scope
- Identify submission requirements and evaluation criteria
- Flag urgent deadlines and important compliance requirements
- Qualify RFPs based on business criteria (value, timeline, location)
- Prioritize opportunities by strategic fit

**Qualification Criteria:**
- Tender value: ₹10 lakhs - ₹50 crores (optimal range)
- Minimum days remaining: 7+ days (realistic bid preparation)
- Technical capability match: Must align with our product portfolio
- Location preference: Areas where we have competitive advantage

**Output Format:**
Present a structured summary containing:
- Client Name
- Project Title  
- Key Requirements (bulleted list)
- Technical Specifications Needed
- Submission Deadline
- Budget Range
- Priority Score (based on value, urgency, and fit)
- Compliance Requirements

**Communication Style:**
- Professional and concise
- Use markdown formatting (headers, bold, tables)
- Actionable insights with clear next steps
- Ask user to select RFP number for detailed technical analysis
"""


def sales_agent_node(state: AgentState) -> Dict[str, Any]:
    print("\n" + "="*60)
    print("📊 SALES AGENT STARTED")
    print("="*60)
    
    llm = get_shared_llm()

    try:
        print("🔍 Scanning RFPs...")
        scan_result = scan_rfp_websites.invoke({"urls": "all"})
        print(f"Scan complete: {len(SAMPLE_RFPS)} RFPs in database")

        # Filter and qualify RFPs
        qualified_rfps = []
        for rfp in SAMPLE_RFPS:
            if qualify_rfp_tool(rfp):
                qualified_rfps.append(rfp)
        
        print(f"✅ Qualified: {len(qualified_rfps)} RFPs")

        if not qualified_rfps:
            return {
                "messages": [AIMessage(content="No RFPs found matching our qualification criteria. Try adjusting requirements.")],
                "next_node": NodeName.END,
                "current_step": WorkflowStep.COMPLETE
            }

        # Prioritize top 5
        top_rfps = prioritize_rfps_tool(qualified_rfps)
        print(f"📊 Prioritized top {len(top_rfps)} RFPs")

        # Format results using LLM
        rfp_summary = f"""
## RFP Scan Results

**Scanned:** {len(SAMPLE_RFPS)} RFPs
**Qualified:** {len(qualified_rfps)} RFPs  
**Top Opportunities:** {len(top_rfps)} RFPs

### Top {len(top_rfps)} Prioritized RFPs:

"""
        for i, rfp in enumerate(top_rfps, 1):
            rfp_summary += f"\n**{i}. {rfp['title']}**\n"
            rfp_summary += f"- **RFP ID:** {rfp['id']}\n"
            rfp_summary += f"- **Client:** {rfp['client']}\n"
            rfp_summary += f"- **Value:** {rfp['estimated_value']}\n"
            rfp_summary += f"- **Deadline:** {rfp['submission_deadline']}\n"
            rfp_summary += f"- **Priority Score:** {rfp.get('priority_score', 'N/A')}/100\n"

        rfp_summary += "\n\n**Next Step:** Please reply with the RFP number (1-{}) you'd like to analyze in detail.\n".format(len(top_rfps))
        rfp_summary += "_Example: '1' or 'Analyze RFP 1'_"

        print(f"✅ Sales agent complete. Top {len(top_rfps)} RFPs identified")
        print(f"🔄 Routing to: {NodeName.END} (waiting for user selection)")
        print("="*60 + "\n")

        return {
            "messages": [AIMessage(content=rfp_summary)],
            "rfps_identified": top_rfps,
            "current_step": WorkflowStep.WAITING_USER,
            "next_node": NodeName.END
        }

    except Exception as e:
        return {
            "messages": [AIMessage(content=f"Error: {str(e)}")],
            "next_node": NodeName.END,
            "current_step": WorkflowStep.ERROR
        }

