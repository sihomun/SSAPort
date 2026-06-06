from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from lib.supabase import supabase

router = APIRouter()

class OnboardingRequest(BaseModel):
    host_university: str
    departure_date: str
    stay_weeks: int
    is_first_time: bool

@router.post("/onboarding")
async def onboarding(data: OnboardingRequest):
    # In a real app, we'd get user_id from JWT
    # For now, we assume a placeholder or that Supabase RLS handles it
    # This is a simplified implementation
    try:
        # Mocking user_id for this step
        user_id = "test-user-id" 
        response = supabase.table("users").upsert({
            "id": user_id,
            "host_university": data.host_university,
            "departure_date": data.departure_date,
            "stay_weeks": data.stay_weeks,
            "is_first_time": data.is_first_time
        }).execute()
        
        return {"user_id": user_id, "checklist_generated": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me():
    # Mocking user_id
    user_id = "test-user-id"
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="User not found")
    return response.data[0]
