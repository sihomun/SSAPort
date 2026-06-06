from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from lib.supabase import supabase

router = APIRouter()

class ItemUpdate(BaseModel):
    is_done: bool

@router.get("/")
async def get_checklist():
    # Mocking user_id
    user_id = "test-user-id"
    
    # Get user info
    user_res = supabase.table("users").select("*").eq("id", user_id).execute()
    if not user_res.data:
         return {"overall_progress": 0, "categories": []}
    
    # Get checklist items and status
    # This would typically be a join in SQL, here we simulate
    items_res = supabase.table("checklist_items").select("*").execute()
    status_res = supabase.table("user_checklist").select("*").eq("user_id", user_id).execute()
    
    # Process into the structure defined in API.md
    # (Simplified for now)
    return {
        "overall_progress": 67,
        "categories": [
            {
                "id": "visa",
                "name": "비자",
                "progress": 80,
                "items": items_res.data
            }
        ]
    }

@router.patch("/items/{item_id}")
async def update_item(item_id: str, data: ItemUpdate):
    user_id = "test-user-id"
    supabase.table("user_checklist").upsert({
        "user_id": user_id,
        "item_id": item_id,
        "is_done": data.is_done
    }).execute()
    return {"item_id": item_id, "is_done": data.is_done}
