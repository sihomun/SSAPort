from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from backend.lib.ai import get_ai_response

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message]

@router.post("/")
async def chat(data: ChatRequest):
    system_prompt = """당신은 SSAPort의 AI 어시스턴트입니다.
KENTECH 학생들이 해외단기연수(SSAP) 출국 전 준비를 할 수 있도록 돕습니다.
[역할] 비자, 항공, 숙소, 보험, 짐 등 출국 준비 관련 질문에 답변.
[제약] 간결하게 (3~5문장 이내)."""
    
    # Simple history concatenation for context
    context = "\n".join([f"{m.role}: {m.content}" for m in data.history])
    user_input = f"{context}\nuser: {data.message}"
    
    reply = get_ai_response(system_prompt, user_input)
    return {"reply": reply}
