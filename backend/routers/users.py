import json
import re
from typing import Any, Dict, List, Optional, Tuple

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from lib.ai import get_ai_response
from lib.default_checklist import merge_default_stage_items
from lib.supabase import supabase

router = APIRouter()


class OnboardingRequest(BaseModel):
    user_id: str
    email: Optional[str] = None
    host_university: str
    departure_date: str
    stay_weeks: int
    is_first_time: bool


def _item_key(item: Dict[str, Any]) -> Tuple[str, str, str]:
    return (
        str(item.get("stage", 0)),
        (item.get("category") or "common").strip().lower(),
        (item.get("title") or "").strip().lower(),
    )


def _dedupe_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    deduped = []

    for item in items:
        key = _item_key(item)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(item)

    return deduped


@router.post("/onboarding")
async def onboarding(data: OnboardingRequest):
    try:
        if not supabase:
            return JSONResponse(status_code=500, content={"error": "Supabase not initialized"})

        supabase.table("users").upsert(
            {
                "id": data.user_id,
                "email": data.email,
                "host_university": data.host_university,
                "departure_date": data.departure_date,
                "stay_weeks": data.stay_weeks,
                "is_first_time": data.is_first_time,
            }
        ).execute()

        checklist_data = {"items": []}
        try:
            ssap_master_guide = f"""
You are a KENTECH SSAP preparation guide.
Create a complete checklist for a student going to {data.host_university}.

Required stages:
- STAGE 0: Before application. Check notices, language scores, passport English name.
- STAGE 1: Application. Study plan, CV, combine required documents into one PDF, email submission.
- STAGE 2: Result and interview. Check interview target announcement and prepare interview.
- STAGE 3: Host university registration. Account setup, registration, tuition or program fee, I-20 or offer forms when relevant.
- STAGE 4: Visa and entry permit. US SEVIS/DS-160/interview or UK ETA when relevant.
- STAGE 5: Housing. Compare dormitory, I-House, Airbnb, and school housing instructions.
- STAGE 6: Pre-departure. Travel card, adapter, travel insurance, eSIM, packing.
- STAGE 7: Return and report. Final report, receipts, evidence documents.

Return JSON only.
Format:
{{"items":[{{"stage":0,"category":"common","title":"...","deadline_label":"D-90","description":"..."}}]}}

Rules:
- Include at least 1 item per stage.
- Do not repeat the same title within the same stage.
- Use short Korean titles and Korean descriptions.
"""
            user_info = (
                f"Host university: {data.host_university}, "
                f"departure date: {data.departure_date}, "
                f"stay: {data.stay_weeks} weeks, "
                f"first time abroad: {data.is_first_time}"
            )
            ai_reply = get_ai_response(ssap_master_guide, user_info)

            json_match = re.search(r"\{.*\}", ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
        except Exception as ai_error:
            print(f"AI generation error: {str(ai_error)}")

        items = _dedupe_items(merge_default_stage_items(checklist_data.get("items", [])))
        if items:
            # Replace the user's generated checklist instead of appending duplicates.
            supabase.table("user_checklist").delete().eq("user_id", data.user_id).execute()

            for item in items:
                try:
                    inserted = (
                        supabase.table("checklist_items")
                        .insert(
                            {
                                "stage": item.get("stage", 0),
                                "category": item.get("category", "common"),
                                "university": data.host_university,
                                "title": item.get("title", "준비 항목"),
                                "description": item.get("description", ""),
                                "deadline_label": item.get("deadline_label", "D-Day"),
                            }
                        )
                        .execute()
                    )

                    if inserted.data:
                        supabase.table("user_checklist").insert(
                            {
                                "user_id": data.user_id,
                                "item_id": inserted.data[0]["id"],
                                "is_done": False,
                            }
                        ).execute()
                except Exception as insert_error:
                    print(f"Checklist insert error: {str(insert_error)}")
                    continue

        return {"success": True, "items_count": len(items)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/me")
async def get_me(user_id: str):
    if not supabase:
        return JSONResponse(status_code=500, content={"error": "Supabase not initialized"})

    response = supabase.table("users").select("*").eq("id", user_id).execute()
    return response.data[0] if response.data else {"error": "Not Found"}
