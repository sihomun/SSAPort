from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from lib.supabase import supabase
from typing import List, Dict, Any, Optional

router = APIRouter()

class ItemUpdate(BaseModel):
    is_done: bool

@router.get("/")
async def get_checklist(user_id: str = Query(...)):
    try:
        if not supabase:
            return {"overall_progress": 0, "categories": []}

        response = supabase.table("user_checklist") \
            .select("*, checklist_items(*)") \
            .eq("user_id", user_id) \
            .execute()
        
        if not response.data:
            return {"overall_progress": 0, "categories": []}

        # Organize by categories (legacy) and include stage info
        categories_dict: Dict[str, Any] = {
            "visa": {"id": "visa", "name": "비자", "items": []},
            "flights": {"id": "flights", "name": "항공", "items": []},
            "accommodation": {"id": "accommodation", "name": "숙소", "items": []},
            "insurance": {"id": "insurance", "name": "보험", "items": []},
            "esim": {"id": "esim", "name": "통신/eSIM", "items": []},
            "packing": {"id": "packing", "name": "짐싸기", "items": []},
            "common": {"id": "common", "name": "공통", "items": []}
        }

        total_items = 0
        done_items = 0

        for record in response.data:
            item_info = record.get("checklist_items")
            if not item_info: continue
            
            category_id = item_info.get("category", "common")
            if category_id not in categories_dict: category_id = "common"
                
            ui_item = {
                "id": record["item_id"],
                "title": item_info.get("title"),
                "is_done": record.get("is_done"),
                "deadline_label": item_info.get("deadline_label"),
                "description": item_info.get("description"),
                "links": item_info.get("links", []),
                "stage": item_info.get("stage")
            }
            
            categories_dict[category_id]["items"].append(ui_item)
            total_items += 1
            if record.get("is_done"):
                done_items += 1

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
        print(f"Checklist Fetch Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 경로를 더 유연하게 받기 위해 명시적으로 설정
@router.patch("/items/{item_id}")
async def update_item(item_id: str, data: ItemUpdate, user_id: str = Query(...)):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not initialized")

        response = supabase.table("user_checklist") \
            .update({"is_done": data.is_done}) \
            .eq("user_id", user_id) \
            .eq("item_id", item_id) \
            .execute()
        
        return {"item_id": item_id, "is_done": data.is_done}
    except Exception as e:
        print(f"Item Update Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
