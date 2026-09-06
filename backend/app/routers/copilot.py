from fastapi import APIRouter

from app.config import get_settings
from app.schemas import CopilotChatRequest, CopilotChatResponse, RouteIntentRequest, RouteIntentResponse
from app.services.copilot_chat import run_copilot_chat
from app.services.route_intent import run_route_intent

router = APIRouter(prefix="/api/copilot", tags=["copilot"])
settings = get_settings()


@router.post("/chat", response_model=CopilotChatResponse)
async def copilot_chat(body: CopilotChatRequest):
    """GreenGru Copilot chat — sidebar panel and /entry page.

    Plain LLM assistant. Optional loan/grant/cbam vector KB.
    Graph RAG belongs on the CBAM advisory agent, not Copilot.
    """
    reply, is_mock, kb = run_copilot_chat(
        page=body.page,
        message=body.message,
        prompt_id=body.prompt_id,
        history=[{"role": m.role, "content": m.content} for m in body.history],
        include_kb_rag=body.include_kb_rag,
    )
    return CopilotChatResponse(
        reply=reply,
        model=settings.model_copilot,
        mock=is_mock,
        kb_rag=kb,
        kb_rag_attached=kb is not None,
    )


@router.post("/route-intent", response_model=RouteIntentResponse)
async def copilot_route_intent(body: RouteIntentRequest):
    """Update router panel confidences from copilot chat history."""
    result = run_route_intent(
        history=[{"role": m.role, "content": m.content} for m in body.history],
    )
    return RouteIntentResponse(
        loan=result["loan"],
        grant=result["grant"],
        passport=result["passport"],
        reasons=result["reasons"],
        mock=result.get("mock", False),
    )
