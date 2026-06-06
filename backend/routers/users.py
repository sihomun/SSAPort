from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from lib.supabase import supabase
from lib.ai import get_ai_response
import json
import re

router = APIRouter()

class OnboardingRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    host_university: str
    departure_date: str
    stay_weeks: int
    is_first_time: bool

@router.post("/onboarding")
async def onboarding(data: OnboardingRequest):
    try:
        # 1. Supabase 연결 확인 (없으면 에러 방지)
        if not supabase:
            raise Exception("Supabase client is not initialized. Check Env Vars.")

        # 2. Save user info (Upsert)
        supabase.table("users").upsert({
            "id": data.user_id,
            "email": data.email,
            "host_university": data.host_university,
            "departure_date": data.departure_date,
            "stay_weeks": data.stay_weeks,
            "is_first_time": data.is_first_time
        }).execute()
        
        # 3. AI Generation - 최적화 (가장 중요한 5-6개 항목만 생성)
        checklist_data = None
        try:
            # 프롬프트를 아주 짧게 수정하여 AI 응답 속도 향상
            system_prompt = "KENTECH SSAP 가이드. 학교에 맞는 STAGE 3~5 필수 체크리스트 5개만 JSON으로 만드세요. 형식: {\"items\": [{\"stage\": 3, \"category\": \"visa\", \"title\": \"...\", \"deadline_label\": \"D-90\", \"description\": \"...\"}]}"
            user_info = f"학교: {data.host_university}, 출국: {data.departure_date}"
            
            ai_reply = get_ai_response(system_prompt, user_info)
            json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
        except Exception as ai_err:
            print(f"AI Speed Error: {str(ai_err)}")

        # 4. Fallback (AI 지연 시 기본 필수 목록)
        if not checklist_data or "items" not in checklist_data:
            checklist_data = {"items": [
                {"stage": 3, "category": "visa", "title": "비자 및 I-20 신청", "deadline_label": "D-90", "description": "학교 포털에서 I-20 신청 및 SEVIS Fee 납부"},
                {"stage": 4, "category": "flights", "title": "항공권 예약 및 확인", "deadline_label": "D-60", "description": "파견 일정에 맞춰 항공권 예매 완료"}
            ]}

        # 5. DB 저장 (Batch 방식은 아니지만 안전하게 처리)
        for item in checklist_data.get("items", []):
            try:
                res = supabase.table("checklist_items").insert({
                    "stage": item.get("stage", 0),
                    "category": item.get("category", "common"),
                    "university": data.host_university,
                    "title": item.get("title", "준비 항목"),
                    "description": item.get("description", ""),
                    "deadline_label": item.get("deadline_label", "D-Day")
                }).execute()
                
                if res.data:
                    supabase.table("user_checklist").insert({
                        "user_id": data.user_id,
                        "item_id": res.data[0]["id"],
                        "is_done": False
                    }).execute()
            except: continue
        
        return {"user_id": data.user_id, "checklist_generated": True}
    except Exception as e:
        print(f"Onboarding Fail: {str(e)}")
        # 에러가 나도 200을 반환하고 실패 메시지를 보내는 것이 CORS 회피에 도움이 될 수 있음
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/me")
async def get_me(user_id: str):
    if not supabase: return {"error": "DB Not Connected"}
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    return response.data[0] if response.data else {"error": "Not Found"}
