from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from lib.ai import get_ai_response
from lib.supabase import supabase

router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: List[Message]

@router.post("/")
async def chat(data: ChatRequest):
    # 1. Fetch user context for better AI response
    user_res = supabase.table("users").select("*").eq("id", data.user_id).execute()
    
    context_info = ""
    if user_res.data:
        user = user_res.data[0]
        context_info = f"""
[유저 정보]
- 목적지: {user.get('host_university')}
- 출발일: {user.get('departure_date')}
- 체류 기간: {user.get('stay_weeks')}주
"""

    system_prompt = f"""당신은 SSAPort의 AI 어시스턴트입니다.
KENTECH 학생들이 해외단기연수(SSAP) 출국 전 준비를 할 수 있도록 돕습니다.

[역할]
- 비자, 항공, 숙소, 보험, 짐 등 출국 준비 관련 질문에 답변
- 어려운 행정 용어를 쉬운 한국어로 설명
- 공식 링크나 신뢰할 수 있는 출처 기반으로 안내

[제약]
- SSAP 및 출국 준비와 무관한 질문은 정중히 거절
- 추측성 답변 금지 — 모르면 "국제처에 확인하세요"라고 안내
- 답변은 간결하게 (3~5문장 이내), 필요 시 리스트 형식 사용
{context_info}"""
    
    # Concatenate history
    full_history = "\n".join([f"{m.role}: {m.content}" for m in data.history])
    user_input = f"{full_history}\nuser: {data.message}"
    
    reply = get_ai_response(system_prompt, user_input)
    return {"reply": reply}
