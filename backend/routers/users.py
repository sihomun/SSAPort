from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from lib.supabase import supabase
from lib.ai import get_ai_response
import json

router = APIRouter()

class OnboardingRequest(BaseModel):
    user_id: str  # In MVP, we accept user_id from frontend
    email: Optional[str] = None
    host_university: str
    departure_date: str
    stay_weeks: int
    is_first_time: bool

@router.post("/onboarding")
async def onboarding(data: OnboardingRequest):
    try:
        # 1. Save user info to 'users' table
        user_data = {
            "id": data.user_id,
            "email": data.email,
            "host_university": data.host_university,
            "departure_date": data.departure_date,
            "stay_weeks": data.stay_weeks,
            "is_first_time": data.is_first_time
        }
        supabase.table("users").upsert(user_data).execute()
        
        # 2. Generate personalized checklist using AI
        system_prompt = f"""다음 정보를 바탕으로 SSAP 참가 학생을 위한 출국 전 체크리스트를 JSON으로 생성하세요.
[출력 형식]
카테고리: visa, flights, accommodation, insurance, esim, packing
각 항목마다: title, deadline_label(D-90/D-60/D-30/D-7), description, links(있는 경우)
JSON만 출력하세요."""

        user_info = f"목적지: {data.host_university}, 출발일: {data.departure_date}, 체류 기간: {data.stay_weeks}주"
        
        ai_reply = get_ai_response(system_prompt, user_info)
        checklist_data = json.loads(ai_reply)
        
        # 3. Save AI generated items to 'checklist_items' and link to user
        # This is a simplified version for MVP
        for category_data in checklist_data.get("categories", []):
            category_id = category_data.get("id")
            for item in category_data.get("items", []):
                # Insert into checklist_items
                item_res = supabase.table("checklist_items").insert({
                    "category": category_id,
                    "university": data.host_university,
                    "title": item.get("title"),
                    "description": item.get("description"),
                    "deadline_label": item.get("deadline_label"),
                    "links": item.get("links", [])
                }).execute()
                
                if item_res.data:
                    # Link to user_checklist
                    supabase.table("user_checklist").insert({
                        "user_id": data.user_id,
                        "item_id": item_res.data[0]["id"],
                        "is_done": False
                    }).execute()
        
        return {"user_id": data.user_id, "checklist_generated": True}
    except Exception as e:
        print(f"Onboarding Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
