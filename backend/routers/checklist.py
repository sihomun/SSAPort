from typing import Any, Dict, Tuple

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from lib.supabase import supabase

router = APIRouter()


class ItemUpdate(BaseModel):
    is_done: bool


def _empty_categories() -> Dict[str, Any]:
    return {
        "visa": {"id": "visa", "name": "Visa", "items": []},
        "flights": {"id": "flights", "name": "Flights", "items": []},
        "accommodation": {"id": "accommodation", "name": "Accommodation", "items": []},
        "insurance": {"id": "insurance", "name": "Insurance", "items": []},
        "esim": {"id": "esim", "name": "eSIM", "items": []},
        "packing": {"id": "packing", "name": "Packing", "items": []},
        "common": {"id": "common", "name": "Common", "items": []},
    }


def _dedupe_key(item_info: Dict[str, Any]) -> Tuple[str, str, str]:
    stage = str(item_info.get("stage", ""))
    category = (item_info.get("category") or "common").strip().lower()
    title = (item_info.get("title") or "").strip().lower()
    return stage, category, title


@router.get("/")
async def get_checklist(user_id: str = Query(...)):
    try:
        if not supabase:
            return {"overall_progress": 0, "categories": []}

        response = (
            supabase.table("user_checklist")
            .select("*, checklist_items(*)")
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            return {"overall_progress": 0, "categories": []}

        categories_dict = _empty_categories()
        seen_items: Dict[Tuple[str, str, str], Dict[str, Any]] = {}

        for record in response.data:
            item_info = record.get("checklist_items")
            if not item_info:
                continue

            key = _dedupe_key(item_info)
            if key in seen_items:
                # Preserve completion if any duplicate row was already completed.
                seen_items[key]["is_done"] = seen_items[key]["is_done"] or bool(record.get("is_done"))
                continue

            category_id = item_info.get("category") or "common"
            if category_id not in categories_dict:
                category_id = "common"

            ui_item = {
                "id": record["item_id"],
                "title": item_info.get("title"),
                "is_done": bool(record.get("is_done")),
                "deadline_label": item_info.get("deadline_label"),
                "description": item_info.get("description"),
                "links": item_info.get("links", []),
                "stage": item_info.get("stage"),
            }

            seen_items[key] = ui_item
            categories_dict[category_id]["items"].append(ui_item)

        total_items = len(seen_items)
        done_items = sum(1 for item in seen_items.values() if item["is_done"])

        final_categories = []
        for category in categories_dict.values():
            cat_total = len(category["items"])
            cat_done = sum(1 for item in category["items"] if item["is_done"])
            category["progress"] = int((cat_done / cat_total * 100)) if cat_total > 0 else 0
            final_categories.append(category)

        overall_progress = int((done_items / total_items * 100)) if total_items > 0 else 0

        return {
            "overall_progress": overall_progress,
            "categories": final_categories,
        }
    except Exception as e:
        print(f"Checklist fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/items/{item_id}")
async def update_item(item_id: str, data: ItemUpdate, user_id: str = Query(...)):
    try:
        if not supabase:
            raise HTTPException(status_code=500, detail="Supabase not initialized")

        (
            supabase.table("user_checklist")
            .update({"is_done": data.is_done})
            .eq("user_id", user_id)
            .eq("item_id", item_id)
            .execute()
        )

        return {"item_id": item_id, "is_done": data.is_done}
    except Exception as e:
        print(f"Item update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
