from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ..models import ChatMessage, ChatResponse
from ..core.config import chat_sessions
from ..core.config import REPORTS_DIR
from datetime import datetime
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("", response_model=ChatResponse)
async def chat(message: ChatMessage):
    from agents.graph import rfp_workflow
    from agents.state import create_initial_state, get_last_ai_message_content
    from langchain_core.messages import HumanMessage

    session_id = message.session_id

    try:
        prior_state = chat_sessions.get(session_id)
        if prior_state:
            state = dict(prior_state)
            state["messages"] = list(prior_state.get("messages", [])) + [HumanMessage(content=message.message)]
        else:
            state = create_initial_state(session_id, message.message)

        result = await rfp_workflow.ainvoke(
            state,
            config={"configurable": {"thread_id": session_id}}
        )

        response_text = get_last_ai_message_content(result)
        chat_sessions[session_id] = result

        return ChatResponse(
            response=response_text,
            session_id=session_id,
            timestamp=datetime.now().isoformat(),
            workflow_state={
                "current_step": result.get("current_step", "COMPLETE"),
                "rfps_identified": result.get("rfps_identified", []),
                "report_url": result.get("report_url")
            }
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ChatResponse(
            response=f"Error: {str(e)}",
            session_id=session_id,
            timestamp=datetime.now().isoformat(),
            workflow_state={"status": "ERROR", "error": str(e)}
        )

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    """Get chat history for a session (LangGraph manages this internally)"""
    return {"message": "Chat history is managed by LangGraph checkpointer"}

@router.get("/state/{session_id}")
async def get_workflow_state(session_id: str):
    """Get current workflow state (managed by LangGraph)"""
    state = chat_sessions.get(session_id)
    if not state:
        return {"session_id": session_id, "exists": False}

    def get_rfp_id(rfp: Dict[str, Any]) -> str:
        return rfp.get("id") or rfp.get("rfp_id", "")

    rfps_identified = state.get("rfps_identified", []) or []
    selected_rfp = state.get("selected_rfp")

    rfps_summary = [
        {
            "id": get_rfp_id(r),
            "title": r.get("title"),
            "client": r.get("client"),
            "estimated_value": r.get("estimated_value") or r.get("value"),
            "submission_deadline": r.get("submission_deadline"),
            "priority_score": r.get("priority_score"),
        }
        for r in rfps_identified
        if isinstance(r, dict)
    ]

    selected_rfp_summary = None
    if isinstance(selected_rfp, dict):
        selected_rfp_summary = {
            "id": get_rfp_id(selected_rfp),
            "title": selected_rfp.get("title"),
            "client": selected_rfp.get("client"),
        }

    return {
        "session_id": session_id,
        "exists": True,
        "current_step": state.get("current_step"),
        "next_node": state.get("next_node"),
        "waiting_for_user": state.get("waiting_for_user", False),
        "rfps_identified": rfps_summary,
        "selected_rfp": selected_rfp_summary,
        "report_url": state.get("report_url"),
        "error": state.get("error"),
    }

@router.delete("/{session_id}")
async def clear_session(session_id: str):
    """Clear chat session"""
    chat_sessions.pop(session_id, None)
    return {"message": "Session cleared", "session_id": session_id}
