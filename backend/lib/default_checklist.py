from typing import Any, Dict, List, Optional, Set, Tuple


DEFAULT_STAGE_ITEMS: List[Dict[str, Any]] = [
    {
        "stage": 1,
        "category": "common",
        "title": "지원서 제출 일정 확인",
        "deadline_label": "D-120",
        "description": "SSAP 지원 공지, 제출 마감일, 이메일 제출 방식, 파일명 규칙을 확인합니다.",
    },
    {
        "stage": 1,
        "category": "common",
        "title": "Study Plan 작성",
        "deadline_label": "D-110",
        "description": "파견 대학에서 수강할 과목, 학습 목표, SSAP 참가 목적을 정리해 영문 학업계획서를 작성합니다.",
    },
    {
        "stage": 1,
        "category": "common",
        "title": "CV 및 제출 서류 병합",
        "deadline_label": "D-105",
        "description": "CV, 성적표, 어학 성적, 여권 사본 등 요구 서류를 확인하고 하나의 PDF로 병합합니다.",
    },
    {
        "stage": 2,
        "category": "common",
        "title": "면접 대상자 발표 확인",
        "deadline_label": "D-95",
        "description": "학교 공지와 이메일을 확인해 면접 대상 여부, 면접 시간, 장소 또는 온라인 링크를 기록합니다.",
    },
    {
        "stage": 2,
        "category": "common",
        "title": "예상 질문 답변 준비",
        "deadline_label": "D-90",
        "description": "지원 동기, 파견 대학 선택 이유, 수강 계획, 안전 계획에 대한 답변을 준비합니다.",
    },
    {
        "stage": 2,
        "category": "common",
        "title": "최종 선발 결과 확인",
        "deadline_label": "D-85",
        "description": "최종 선발 결과를 확인하고 이후 파견교 등록, 비자, 숙소 준비 일정을 캘린더에 반영합니다.",
    },
    {
        "stage": 5,
        "category": "accommodation",
        "title": "숙소 선택지 비교",
        "deadline_label": "D-75",
        "description": "기숙사, I-House, 단기 임대, Airbnb의 위치, 비용, 계약 조건, 통학 시간을 비교합니다.",
    },
    {
        "stage": 5,
        "category": "accommodation",
        "title": "숙소 신청 또는 예약",
        "deadline_label": "D-65",
        "description": "파견교 숙소 포털이나 외부 예약 사이트에서 신청을 완료하고 결제 내역을 저장합니다.",
    },
    {
        "stage": 5,
        "category": "accommodation",
        "title": "입주 정보 정리",
        "deadline_label": "D-45",
        "description": "체크인 날짜, 주소, 보증금, 담당자 연락처, 입주 시 필요한 서류를 정리합니다.",
    },
    {
        "stage": 6,
        "category": "packing",
        "title": "항공권 및 이동 동선 확인",
        "deadline_label": "D-40",
        "description": "항공권, 공항 이동, 현지 공항에서 숙소까지의 교통편을 확인하고 예약 정보를 저장합니다.",
    },
    {
        "stage": 6,
        "category": "packing",
        "title": "출국 필수품 준비",
        "deadline_label": "D-25",
        "description": "여권, 비자 서류, 보험 증서, 결제 카드, 어댑터, 상비약, eSIM 또는 로밍을 준비합니다.",
    },
    {
        "stage": 6,
        "category": "packing",
        "title": "비상 연락망 저장",
        "deadline_label": "D-14",
        "description": "KENTECH 담당자, 파견교 담당자, 숙소, 보험사, 현지 긴급 연락처를 휴대폰과 문서에 저장합니다.",
    },
    {
        "stage": 7,
        "category": "common",
        "title": "결과보고서 작성",
        "deadline_label": "귀국 후 7일",
        "description": "수강 내용, 생활 경험, 정산 내용, 사진 자료를 포함해 결과보고서를 작성합니다.",
    },
    {
        "stage": 7,
        "category": "common",
        "title": "영수증 및 증빙 정리",
        "deadline_label": "귀국 후 10일",
        "description": "항공권, 숙소, 보험, 교통비 등 제출이 필요한 영수증과 증빙 자료를 정리합니다.",
    },
    {
        "stage": 7,
        "category": "common",
        "title": "최종 제출 확인",
        "deadline_label": "귀국 후 14일",
        "description": "결과보고서와 증빙 자료 제출 여부를 확인하고 누락된 요청이 없는지 담당자에게 확인합니다.",
    },
]


def item_key(item: Dict[str, Any]) -> Tuple[str, str, str]:
    return (
        str(item.get("stage", 0)),
        (item.get("category") or "common").strip().lower(),
        (item.get("title") or "").strip().lower(),
    )


def merge_default_stage_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    merged = list(items)
    seen = {item_key(item) for item in merged}

    for default_item in DEFAULT_STAGE_ITEMS:
        key = item_key(default_item)
        if key in seen:
            continue
        seen.add(key)
        merged.append(default_item)

    return merged


def ensure_default_stage_items(
    supabase_client: Any,
    user_id: str,
    host_university: Optional[str] = None,
    existing_item_infos: Optional[List[Dict[str, Any]]] = None,
) -> int:
    existing_keys: Set[Tuple[str, str, str]] = set()

    if existing_item_infos is None:
        response = (
            supabase_client.table("user_checklist")
            .select("checklist_items(stage, category, title)")
            .eq("user_id", user_id)
            .execute()
        )
        existing_item_infos = [
            record.get("checklist_items")
            for record in (response.data or [])
            if record.get("checklist_items")
        ]

    for item_info in existing_item_infos:
        existing_keys.add(item_key(item_info))

    inserted_count = 0
    for default_item in DEFAULT_STAGE_ITEMS:
        key = item_key(default_item)
        if key in existing_keys:
            continue

        inserted = (
            supabase_client.table("checklist_items")
            .insert(
                {
                    "stage": default_item["stage"],
                    "category": default_item["category"],
                    "university": host_university,
                    "title": default_item["title"],
                    "description": default_item["description"],
                    "deadline_label": default_item["deadline_label"],
                }
            )
            .execute()
        )

        if not inserted.data:
            continue

        supabase_client.table("user_checklist").insert(
            {
                "user_id": user_id,
                "item_id": inserted.data[0]["id"],
                "is_done": False,
            }
        ).execute()
        existing_keys.add(key)
        inserted_count += 1

    return inserted_count
