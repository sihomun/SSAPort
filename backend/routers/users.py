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
        
        # 2. AI Checklist Generation with SSAP Specific Data
        checklist_data = None
        try:
            # SSAP Master Data Context (Condensed for prompt)
            ssap_context = """
[KENTECH SSAP Master Guide]
- STAGE 3 (Registration): 
  * UCLA: Use KENTECH link (wait!), MyUCLA (9-digit UID), BruinBill, I-20 Request.
  * UC Berkeley: summer.berkeley.edu, CalCentral, CalNet ID, Flywire payment, I-20 (ISS Portal).
  * Harvard: MyDCE, 8 credits min (in-person), Payment via Travel Card.
  * UCL: Acceptance of Offer Form (ASAP), 수업료 결제 링크 확인.
- STAGE 4 (Visa): 
  * US (UCLA, Berkeley, Harvard): F-1 Visa. I-901 SEVIS Fee ($350) -> DS-160 -> USTravelDocs interview.
  * UK (UCL): ETA (Electronic Travel Authorization) required from 2025.
- STAGE 5 (Housing): 
  * UCLA: Housing Portal (Deluxe/Suite), Meal plan mandatory.
  * Berkeley: Summer Sessions Housing Offer, $300 deposit.
- STAGE 7 (Post-program): Report with 3+ photos, include all receipts.
"""

            system_prompt = f"""당신은 KENTECH SSAP 전담 어시스턴트입니다. 
제공된 [KENTECH SSAP Master Guide]를 바탕으로, 유저의 목적지({data.host_university})에 최적화된 출국 전 체크리스트를 JSON으로 생성하세요.

반드시 아래 JSON 구조를 엄격히 지키세요:
{{
  "categories": [
    {{
      "id": "visa",
      "items": [
        {{
          "title": "항목명", 
          "deadline_label": "D-90", 
          "description": "구체적 설명 (학교별 전용 포털 이름 포함)",
          "links": [{{"label": "사이트명", "url": "URL"}}]
        }}
      ]
    }}
  ]
}}
카테고리 ID: visa, flights, accommodation, insurance, esim, packing

{ssap_context}
"""

            user_info = f"목적지 대학: {data.host_university}, 출발일: {data.departure_date}, 기간: {data.stay_weeks}주"
            ai_reply = get_ai_response(system_prompt, user_info)
            
            json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
        except Exception as ai_err:
            print(f"AI Generation Failed: {str(ai_err)}")

        # 3. Fallback (If AI fails)
        if not checklist_data or "categories" not in checklist_data:
            checklist_data = {
                "categories": [
                    {"id": "visa", "items": [{"title": "SSAP 비자 준비 시작", "deadline_label": "D-90", "description": "파견 학교 가이드에 따라 I-20 발급 및 비자 서류 준비"}]},
                    {"id": "flights", "items": [{"title": "항공권 예약", "deadline_label": "D-60", "description": "학교 일정에 맞춰 왕복 항공권 구매"}]}
                ]
            }

        # 4. Save to DB
        for category_data in checklist_data.get("categories", []):
            category_id = category_data.get("id")
            for item in category_data.get("items", []):
                item_res = supabase.table("checklist_items").insert({
                    "category": category_id,
                    "university": data.host_university,
                    "title": item.get("title", "준비 항목"),
                    "description": item.get("description", ""),
                    "deadline_label": item.get("deadline_label", "D-Day"),
                    "links": item.get("links", [])
                }).execute()
                
                if item_res.data:
                    supabase.table("user_checklist").insert({
                        "user_id": data.user_id,
                        "item_id": item_res.data[0]["id"],
                        "is_done": False
                    }).execute()
        
        return {"user_id": data.user_id, "checklist_generated": True}
    except Exception as e:
        print(f"Onboarding Critical Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me(user_id: str):
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data[0]
