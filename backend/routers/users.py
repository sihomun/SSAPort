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
        if not supabase:
            return JSONResponse(status_code=500, content={"error": "Supabase not connected"})

        supabase.table("users").upsert({
            "id": data.user_id,
            "email": data.email,
            "host_university": data.host_university,
            "departure_date": data.departure_date,
            "stay_weeks": data.stay_weeks,
            "is_first_time": data.is_first_time
        }).execute()
        
        # Fast AI Generation
        checklist_data = {"items": []}
        try:
            system_prompt = "KENTECH SSAP. STAGE 3,4,5 필수 3개 JSON. {\"items\": [{\"stage\": 3, \"category\": \"visa\", \"title\": \"...\"}]}"
            ai_reply = get_ai_response(system_prompt, f"학교: {data.host_university}")
            json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
        except: pass

        if not checklist_data.get("items"):
            checklist_data = {"items": [{"stage": 3, "category": "visa", "title": "기본 준비 시작", "deadline_label": "D-90", "description": "파견 학교 가이드 확인"}]}

        for item in checklist_data["items"]:
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
                    supabase.table("user_checklist").insert({"user_id": data.user_id, "item_id": res.data[0]["id"], "is_done": False}).execute()
            except: continue
            
        return {"success": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/me")
async def get_me(user_id: str):
    try:
        if not supabase:
            return JSONResponse(status_code=500, content={"error": "Supabase not connected"})
        
        # user_id가 query param으로 들어올 때의 처리
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0]
        
        # 만약 해당 유저가 없으면 빈 객체나 에러 대신 기본값이라도 반환 (CORS 방지)
        return JSONResponse(status_code=404, content={"error": "User not found", "user_id": user_id})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
