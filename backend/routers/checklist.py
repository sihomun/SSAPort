from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from lib.supabase import supabase
from typing import List, Dict, Any

router = APIRouter()

class ItemUpdate(BaseModel):
    is_done: bool

@router.get("/")
async def get_checklist(user_id: str):
    try:
        # 1. Fetch user's checklist items with master data
        # We use a join-like approach via Supabase select
        response = supabase.table("user_checklist") \
            .select("*, checklist_items(*)") \
            .eq("user_id", user_id) \
            .execute()
        
        if not response.data:
            return {"overall_progress": 0, "categories": []}

        # 2. Group items by category and calculate progress
        categories_dict: Dict[str, Any] = {
            "visa": {"id": "visa", "name": "비자", "items": []},
            "flights": {"id": "flights", "name": "항공", "items": []},
            "accommodation": {"id": "accommodation", "name": "숙소", "items": []},
            "insurance": {"id": "insurance", "name": "보험", "items": []},
            "esim": {"id": "esim", "name": "통신/eSIM", "items": []},
            "packing": {"id": "packing", "name": "짐싸기", "items": []}
        }

        total_items = 0
        done_items = 0

        for record in response.data:
            item_info = record["checklist_items"]
            category_id = item_info["category"]
            
            if category_id not in categories_dict:
                continue
                
            ui_item = {
                "id": record["item_id"],
                "title": item_info["title"],
                "is_done": record["is_done"],
                "deadline_label": item_info["deadline_label"],
                "description": item_info["description"],
                "links": item_info["links"]
            }
            
            categories_dict[category_id]["items"].append(ui_item)
            total_items += 1
            if record["is_done"]:
                done_items += 1

        # Calculate progress per category
        final_categories = []
        for cat in categories_dict.values():
            cat_total = len(cat["items"])
            cat_done = sum(1 for i in cat["items"] if i["is_done"])
            cat["progress"] = int((cat_done / cat_total * 100)) if cat_total > 0 else 0
            final_categories.append(cat)

        overall_progress = int((done_items / total_items * 100)) if total_items > 0 else 0

        return {
            "overall_progress": overall_progress,
            "categories": final_categories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/items/{item_id}")
async def update_item(item_id: str, user_id: str, data: ItemUpdate):
    try:
        response = supabase.table("user_checklist") \
            .update({"is_done": data.is_done}) \
            .eq("user_id", user_id) \
            .eq("item_id", item_id) \
            .execute()
        
        return {"item_id": item_id, "is_done": data.is_done}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
