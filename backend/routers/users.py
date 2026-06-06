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
        print(f"Starting onboarding for user: {data.user_id}")
        
        # 1. Save user info
        try:
            supabase.table("users").upsert({
                "id": data.user_id,
                "email": data.email,
                "host_university": data.host_university,
                "departure_date": data.departure_date,
                "stay_weeks": data.stay_weeks,
                "is_first_time": data.is_first_time
            }).execute()
            print("Step 1: User upsert success")
        except Exception as e:
            print(f"Step 1 Failed: {str(e)}")
            raise Exception(f"User DB save failed: {str(e)}")

        # 2. AI Generation
        checklist_data = None
        try:
            system_prompt = "KENTECH SSAP 가이드. 학교에 맞는 STAGE 3~5 필수 체크리스트 5개만 JSON으로 만드세요. 형식: {\"items\": [{\"stage\": 3, \"category\": \"visa\", \"title\": \"...\", \"deadline_label\": \"D-90\", \"description\": \"...\"}]}"
            user_info = f"학교: {data.host_university}, 출국: {data.departure_date}"
            ai_reply = get_ai_response(system_prompt, user_info)
            
            json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
            print("Step 2: AI generation success")
        except Exception as e:
            print(f"Step 2 (AI) Failed, using fallback: {str(e)}")

        # 3. Fallback
        if not checklist_data or "items" not in checklist_data:
            checklist_data = {"items": [
                {"stage": 3, "category": "visa", "title": "비자 및 I-20 신청", "deadline_label": "D-90", "description": "학교 가이드에 따른 서류 준비"},
                {"stage": 4, "category": "flights", "title": "항공권 예약", "deadline_label": "D-60", "description": "일정에 맞춘 항공권 예매"}
            ]}

        # 4. Save items to DB
        for item in checklist_data.get("items", []):
            try:
                # insert into master table
                item_res = supabase.table("checklist_items").insert({
                    "stage": item.get("stage", 0),
                    "category": item.get("category", "common"),
                    "university": data.host_university,
                    "title": item.get("title", "준비 항목"),
                    "description": item.get("description", ""),
                    "deadline_label": item.get("deadline_label", "D-Day")
                }).execute()
                
                if item_res.data:
                    # link to user
                    supabase.table("user_checklist").insert({
                        "user_id": data.user_id,
                        "item_id": item_res.data[0]["id"],
                        "is_done": False
                    }).execute()
            except Exception as e:
                print(f"Step 4 (Item Save) Error: {str(e)}")
                continue 
        
        print("Onboarding process completed successfully")
        return {"user_id": data.user_id, "checklist_generated": True}

    except Exception as e:
        print(f"CRITICAL ERROR in onboarding: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e), "detail": "Check server logs for traceback"})

@router.get("/me")
async def get_me(user_id: str):
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if response.data:
            return response.data[0]
        return JSONResponse(status_code=404, content={"error": "User not found"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
