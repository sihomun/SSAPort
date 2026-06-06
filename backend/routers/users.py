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
        # 1. Save user info
        user_data = {
            "id": data.user_id,
            "email": data.email,
            "host_university": data.host_university,
            "departure_date": data.departure_date,
            "stay_weeks": data.stay_weeks,
            "is_first_time": data.is_first_time
        }
        supabase.table("users").upsert(user_data).execute()
        
        # 2. AI Checklist Generation with STAGE info
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

[단계 정의]
STAGE 0: 사전 준비 (어학 등)
STAGE 1: SSAP 신청 (학업계획서 등)
STAGE 2: 결과 발표/면접
STAGE 3: 파견교 등록/수강신청 (가장 중요!)
STAGE 4: 비자/입국허가
STAGE 5: 숙소 신청
STAGE 6: 출국 전 준비 (짐싸기/금융)
STAGE 7: 귀국 후 결과보고서
"""

            user_info = f"목적지: {data.host_university}, 출발일: {data.departure_date}, 기간: {data.stay_weeks}주"
            ai_reply = get_ai_response(system_prompt, user_info)
            
            json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
        except Exception as ai_err:
            print(f"AI Error: {str(ai_err)}")

        # 3. Save to DB with Stage
        if checklist_data and "items" in checklist_data:
            for item in checklist_data["items"]:
                item_res = supabase.table("checklist_items").insert({
                    "stage": item.get("stage", 0),
                    "category": item.get("category", "common"),
                    "university": data.host_university,
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "deadline_label": item.get("deadline_label"),
                }).execute()
                
                if item_res.data:
                    supabase.table("user_checklist").insert({
                        "user_id": data.user_id,
                        "item_id": item_res.data[0]["id"],
                        "is_done": False
                    }).execute()
        
        return {"user_id": data.user_id, "checklist_generated": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
