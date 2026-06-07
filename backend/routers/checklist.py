import re
from typing import Any, Dict, Tuple

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from lib.default_checklist import ensure_default_stage_items, get_source_detail, get_source_links, mentions_other_university
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


def _normalize_text(value: Any) -> str:
    text = str(value or "").strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def _semantic_topic(item_info: Dict[str, Any]) -> str:
    text = _normalize_text(
        " ".join(
            str(item_info.get(field) or "")
            for field in ("title", "description", "deadline_label")
        )
    )

    topic_rules = [
        ("language-score", ("toeic", "toefl", "ielts", "duolingo", "어학", "영어 성적", "성적표")),
        ("english-name", ("영문명", "여권", "passport name")),
        ("application-deadline", ("지원서", "신청", "제출", "마감", "이메일", "application")),
        ("study-plan", ("study plan", "학업계획", "학업 계획", "course code", "syllabus", "수강 과목", "course")),
        ("cv-documents", ("cv", "이력서", "서류", "pdf", "병합", "서약서", "성적표")),
        ("interview-result", ("면접 대상", "합격자", "선발 결과", "결과 발표", "발표 확인")),
        ("interview-prep", ("예상 질문", "면접 준비", "지원 동기", "답변 준비")),
        ("interview", ("면접 진행", "인터뷰 진행")),
        ("registration-link", ("registration link", "등록 링크", "비밀번호", "service fee", "감면")),
        ("account", ("계정", "portal", "포털", "myucla", "calcentral", "calnet", "mydce", "등록 번호", "student id", "uid")),
        ("course-registration", ("수강 신청", "등록비", "수업료", "납부", "bruinbill", "flywire", "financial services", "결제")),
        ("i20-offer", ("i-20", "i20", "offer form", "acceptance of offer", "iss portal", "visa request")),
        ("sevis", ("sevis", "i-901", "i901")),
        ("ds160", ("ds-160", "ds160")),
        ("visa-interview", ("비자 인터뷰", "인터뷰 예약", "ustraveldocs", "비자 수수료")),
        ("eta", ("eta", "영국 입국", "입국 허가")),
        ("housing-compare", ("숙소 선택", "숙소 비교", "기숙사", "airbnb", "i-house", "위치", "계약 조건")),
        ("housing-apply", ("숙소 신청", "숙소 예약", "housing application", "housing request", "residences", "예약금")),
        ("move-in", ("입주", "체크인", "보증금", "주소", "담당자")),
        ("flight-route", ("항공권", "공항", "이동 동선", "교통편")),
        ("departure-essentials", ("출국 필수", "어댑터", "상비약", "esim", "로밍", "결제 카드", "비상용 카드", "보조배터리")),
        ("emergency-contact", ("비상 연락", "긴급 연락", "연락망", "보험사")),
        ("report", ("결과보고서", "보고서")),
        ("receipt", ("영수증", "증빙", "정산")),
        ("final-submit", ("최종 제출", "제출 확인", "접수 여부")),
    ]

    for topic, keywords in topic_rules:
        if any(keyword in text for keyword in keywords):
            return topic

    return _normalize_text(item_info.get("title"))


def _resolved_stage(item_info: Dict[str, Any]) -> str:
    stage = item_info.get("stage")
    if stage is not None:
        return str(stage)

    category = _normalize_text(item_info.get("category"))
    topic = _semantic_topic(item_info)
    if topic in {"registration-link", "account", "course-registration", "i20-offer"}:
        return "3"
    if topic in {"sevis", "ds160", "visa-interview", "eta"} or category == "visa":
        return "4"
    if topic in {"housing-compare", "housing-apply", "move-in"} or category == "accommodation":
        return "5"
    if topic in {"flight-route", "departure-essentials", "emergency-contact"} or category == "packing":
        return "6"
    if topic in {"report", "receipt", "final-submit"}:
        return "7"
    return ""


def _dedupe_key(item_info: Dict[str, Any]) -> Tuple[str, str]:
    return _resolved_stage(item_info), _semantic_topic(item_info)


def _deadline_sort_value(deadline_label: Any) -> int:
    label = str(deadline_label or "").strip()

    d_day_match = re.search(r"D\s*-\s*(\d+)", label, re.IGNORECASE)
    if d_day_match:
        return -int(d_day_match.group(1))

    d_plus_match = re.search(r"D\s*\+\s*(\d+)", label, re.IGNORECASE)
    if d_plus_match:
        return int(d_plus_match.group(1))

    after_return_match = re.search(r"귀국\s*후\s*(\d+)", label)
    if after_return_match:
        return 1000 + int(after_return_match.group(1))

    if "귀국" in label:
        return 1000
    if "d-day" in label.lower() or label == "D-Day":
        return 0

    return 500


def _should_hide_for_university(item_info: Dict[str, Any], host_university: Any) -> bool:
    university = (host_university or "").strip().lower()

    category = (item_info.get("category") or "").strip().lower()
    title = (item_info.get("title") or "").strip().lower()
    stage = item_info.get("stage")

    is_visa_item = (
        category == "visa"
        or stage == 4
        or "visa" in title
        or "비자" in title
        or "sevis" in title
        or "ds-160" in title
        or "eta" in title
        or "입국" in title
    )
    if not is_visa_item:
        return False

    us_school = any(name in university for name in ("ucla", "uc berkeley", "berkeley", "harvard", "upenn"))
    ucl_school = "ucl" in university
    utrecht_school = "utrecht" in university

    if us_school:
        return "eta" in title or "영국" in title
    if ucl_school:
        return "sevis" in title or "ds-160" in title or "인터뷰" in title or "i-901" in title
    if utrecht_school:
        return True

    return True


@router.get("/")
async def get_checklist(user_id: str = Query(...)):
    try:
        if not supabase:
            return {"overall_progress": 0, "categories": []}

        user_response = supabase.table("users").select("host_university").eq("id", user_id).execute()
        host_university = user_response.data[0].get("host_university") if user_response.data else None

        response = (
            supabase.table("user_checklist")
            .select("*, checklist_items(*)")
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            ensure_default_stage_items(supabase, user_id, host_university)
            response = (
                supabase.table("user_checklist")
                .select("*, checklist_items(*)")
                .eq("user_id", user_id)
                .execute()
            )
        else:
            existing_item_infos = [
                record.get("checklist_items")
                for record in response.data
                if record.get("checklist_items")
            ]
            inserted_count = ensure_default_stage_items(
                supabase,
                user_id,
                host_university,
                existing_item_infos=existing_item_infos,
            )
            if inserted_count:
                response = (
                    supabase.table("user_checklist")
                    .select("*, checklist_items(*)")
                    .eq("user_id", user_id)
                    .execute()
                )

        if not response.data:
            return {"overall_progress": 0, "categories": []}

        categories_dict = _empty_categories()
        seen_items: Dict[Tuple[str, str], Dict[str, Any]] = {}

        for record in response.data:
            item_info = record.get("checklist_items")
            if not item_info:
                continue
            if mentions_other_university(item_info, host_university):
                continue
            if _should_hide_for_university(item_info, host_university):
                continue

            key = _dedupe_key(item_info)
            if key in seen_items:
                # Preserve completion if any duplicate row was already completed.
                seen_items[key]["is_done"] = seen_items[key]["is_done"] or bool(record.get("is_done"))
                continue

            category_id = item_info.get("category") or "common"
            if category_id not in categories_dict:
                category_id = "common"

            item_with_context = {**item_info, "university": host_university}
            db_links = item_info.get("links") or []
            source_links = get_source_links(item_with_context)
            combined_links = db_links + [
                link
                for link in source_links
                if link.get("url") not in {db_link.get("url") for db_link in db_links}
            ]

            ui_item = {
                "id": record["item_id"],
                "title": item_info.get("title"),
                "is_done": bool(record.get("is_done")),
                "deadline_label": item_info.get("deadline_label"),
                "description": item_info.get("description"),
                "source_detail": get_source_detail(item_with_context),
                "source_links": source_links,
                "links": combined_links,
                "stage": item_info.get("stage"),
            }

            seen_items[key] = ui_item
            categories_dict[category_id]["items"].append(ui_item)

        total_items = len(seen_items)
        done_items = sum(1 for item in seen_items.values() if item["is_done"])

        final_categories = []
        for category in categories_dict.values():
            category["items"].sort(
                key=lambda item: (
                    _deadline_sort_value(item.get("deadline_label")),
                    _normalize_text(item.get("title")),
                )
            )
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
