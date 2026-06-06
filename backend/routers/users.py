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
        # 1. Save user info (Upsert)
        user_data = {
            "id": data.user_id,
            "email": data.email,
            "host_university": data.host_university,
            "departure_date": data.departure_date,
            "stay_weeks": data.stay_weeks,
            "is_first_time": data.is_first_time
        }
        supabase.table("users").upsert(user_data).execute()
        
        # 2. AI Checklist Generation with Stage info
        checklist_data = None
        try:
            system_prompt = f"""당신은 KENTECH SSAP 전담 어시스턴트입니다. 
제공된 STAGE 0~7 흐름을 바탕으로 {data.host_university} 파견 학생을 위한 체크리스트를 생성하세요.

[출력 형식]
반드시 아래 JSON 구조를 지키세요. 각 항목에는 stage(0~7) 번호를 부여하세요.
{{
  "items": [
    {{
      "stage": 3,
      "category": "visa",
      "title": "UCLA I-20 신청",
      "deadline_label": "D-90",
      "description": "설명..."
    }}
  ]
}}
"""
            user_info = f"목적지: {data.host_university}, 출발일: {data.departure_date}, 기간: {data.stay_weeks}주"
            ai_reply = get_ai_response(system_prompt, user_info)
            
            # JSON 추출 로직 강화
            json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
        except Exception as ai_err:
            print(f"AI Onboarding Error: {str(ai_err)}")

        # 3. Fallback (AI가 실패할 경우 최소한의 목록 생성)
        if not checklist_data or "items" not in checklist_data:
            checklist_data = {
                "items": [
                    {"stage": 3, "category": "flights", "title": "항공권 예약", "deadline_label": "D-60", "description": "파견 학교 일정에 맞춘 항공권 예매"},
                    {"stage": 4, "category": "visa", "title": "비자 서류 준비", "deadline_label": "D-90", "description": "I-20 발급 및 비자 인터뷰 준비"}
                ]
            }

        # 4. Save items to DB
        for item in checklist_data.get("items", []):
            try:
                # Insert item into master table
                item_res = supabase.table("checklist_items").insert({
                    "stage": item.get("stage", 0),
                    "category": item.get("category", "common"),
                    "university": data.host_university,
                    "title": item.get("title", "준비 항목"),
                    "description": item.get("description", ""),
                    "deadline_label": item.get("deadline_label", "D-Day")
                }).execute()
                
                if item_res.data:
                    # Link item to the specific user
                    supabase.table("user_checklist").insert({
                        "user_id": data.user_id,
                        "item_id": item_res.data[0]["id"],
                        "is_done": False
                    }).execute()
            except Exception as item_err:
                print(f"Item Insert Error: {str(item_err)}")
                continue # 하나의 항목이 실패해도 계속 진행
        
        return {"user_id": data.user_id, "checklist_generated": True}
    except Exception as e:
        print(f"Critical Onboarding Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
