from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from lib.supabase import supabase
from lib.ai import get_ai_response
from fastapi.responses import JSONResponse
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
        print(f"--- Onboarding Start: {data.user_id} ---")
        
        # 1. User Upsert (가장 먼저 확실히 처리)
        user_res = supabase.table("users").upsert({
            "id": data.user_id,
            "email": data.email,
            "host_university": data.host_university,
            "departure_date": data.departure_date,
            "stay_weeks": data.stay_weeks,
            "is_first_time": data.is_first_time
        }).execute()
        print("1. User data saved.")

        # 2. AI Generation - 타임아웃 방지를 위해 매우 짧고 명확하게 요청
        checklist_data = None
        try:
            # 항목 개수를 3개로 더 줄여서 속도 극대화
            system_prompt = "KENTECH SSAP. STAGE 3,4,5 필수템 3개만 JSON 생성. 형식: {\"items\": [{\"stage\": 3, \"category\": \"visa\", \"title\": \"...\", \"deadline_label\": \"D-90\", \"description\": \"...\"}]}"
            user_info = f"학교: {data.host_university}"
            ai_reply = get_ai_response(system_prompt, user_info)
            
            json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
            print("2. AI generation success.")
        except Exception as ai_e:
            print(f"2. AI generation failed: {str(ai_e)}")

        # 3. Fallback (AI가 늦거나 실패할 경우)
        if not checklist_data or "items" not in checklist_data:
            checklist_data = {"items": [
                {"stage": 3, "category": "visa", "title": "비자 및 I-20 신청", "deadline_label": "D-90", "description": "SSAP 파견 학교 가이드 확인"},
                {"stage": 4, "category": "flights", "title": "항공권 예약", "deadline_label": "D-60", "description": "출국 일정 확정 및 예매"}
            ]}

        # 4. Save Checklist Items
        for item in checklist_data.get("items", []):
            try:
                # master item insert
                m_res = supabase.table("checklist_items").insert({
                    "stage": item.get("stage", 0),
                    "category": item.get("category", "common"),
                    "university": data.host_university,
                    "title": item.get("title", "준비 항목"),
                    "description": item.get("description", ""),
                    "deadline_label": item.get("deadline_label", "D-Day")
                }).execute()
                
                if m_res.data:
                    # user mapping insert
                    supabase.table("user_checklist").insert({
                        "user_id": data.user_id,
                        "item_id": m_res.data[0]["id"],
                        "is_done": False
                    }).execute()
            except Exception as item_e:
                print(f"4. Item save skip: {str(item_e)}")
                continue 
        
        print("--- Onboarding Successfully Finished ---")
        return {"success": True}

    except Exception as e:
        print(f"CRITICAL ERROR: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/me")
async def get_me(user_id: str):
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    return response.data[0] if response.data else {"error": "Not Found"}
