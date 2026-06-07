from typing import Any, Dict, List, Optional, Set, Tuple


DEFAULT_STAGE_ITEMS: List[Dict[str, Any]] = [
    {
        "stage": 1,
        "category": "common",
        "title": "지원서 제출 일정 확인",
        "deadline_label": "D-120",
        "description": "SSAP 지원 공지, 제출 마감일, 이메일 제출 방식, 파일명 규칙을 확인합니다.",
        "source_detail": "SSAP 신청은 보통 10월~11월 초에 진행됩니다. 제출 전 모집 공고, 제출 마감일, 이메일 제출 방식, 메일 제목 형식(예: SSAP 2024 Application: 이름)을 확인하세요.",
    },
    {
        "stage": 1,
        "category": "common",
        "title": "Study Plan 작성",
        "deadline_label": "D-110",
        "description": "파견 대학에서 수강할 과목, 학습 목표, SSAP 참가 목적을 정리해 영문 학업계획서를 작성합니다.",
        "source_detail": "영문 학업계획서는 직접 작성해야 하며 Papago나 ChatGPT 사용이 금지됩니다. 이메일과 연락처, Course Code/Number, 수강 목표와 과목 선택 이유를 Syllabus 기준으로 작성하세요.",
    },
    {
        "stage": 1,
        "category": "common",
        "title": "CV 및 제출 서류 병합",
        "deadline_label": "D-105",
        "description": "CV, 성적표, 어학 성적, 여권 사본 등 요구 서류를 확인하고 하나의 PDF로 병합합니다.",
        "source_detail": "제출 서류에는 영문 Study Plan, 어학성적표 사본, 서약서 자필 서명본, 학부성적표, CV가 포함됩니다. 모든 서류를 1개의 PDF로 병합한 뒤 제출하세요.",
    },
    {
        "stage": 2,
        "category": "common",
        "title": "면접 대상자 발표 확인",
        "deadline_label": "D-95",
        "description": "학교 공지와 이메일을 확인해 면접 대상 여부, 면접 시간, 장소 또는 온라인 링크를 기록합니다.",
        "source_detail": "면접 대상자 또는 합격자 발표는 보통 11월 중순에 확인합니다. 대상자 지정 메일이 오지 않으면 면접 없이 합격했거나 불합격한 경우일 수 있습니다.",
    },
    {
        "stage": 2,
        "category": "common",
        "title": "예상 질문 답변 준비",
        "deadline_label": "D-90",
        "description": "지원 동기, 파견 대학 선택 이유, 수강 계획, 안전 계획에 대한 답변을 준비합니다.",
        "source_detail": "면접은 발표 후 4~5일 내 안내될 수 있으므로 바로 준비하세요. 지원 동기, 수강 과목 선택 이유, 파견 후 학업 계획, 안전 및 생활 계획을 짧게 정리해 두는 것이 좋습니다.",
    },
    {
        "stage": 2,
        "category": "common",
        "title": "최종 선발 결과 확인",
        "deadline_label": "D-85",
        "description": "최종 선발 결과를 확인하고 이후 파견교 등록, 비자, 숙소 준비 일정을 캘린더에 반영합니다.",
        "source_detail": "최종 결과 확인 후에는 파견교 등록, 수강 신청, I-20 또는 입국 허가, 숙소 신청 일정이 이어집니다. 학교 공식 안내와 KENTECH 안내 메일을 함께 확인하세요.",
    },
    {
        "stage": 3,
        "category": "common",
        "title": "KENTECH 등록 링크 대기",
        "deadline_label": "D-80",
        "description": "International Service Fee 감면을 위해 KENTECH가 제공하는 등록 링크와 비밀번호를 받은 뒤 등록을 시작합니다.",
        "source_detail": "SSAP 체크리스트는 미국 학교 공통으로 KENTECH가 주는 Registration Link와 비밀번호를 받을 때까지 대기하라고 안내합니다. 링크 없이 먼저 등록하면 감면 절차가 복잡해질 수 있습니다.",
    },
    {
        "stage": 3,
        "category": "common",
        "title": "파견교 계정 생성",
        "deadline_label": "D-75",
        "description": "파견교 안내에 따라 학생 ID, 포털 계정, 이메일 계정을 생성하고 로그인 가능 여부를 확인합니다.",
        "source_detail": "UCLA는 UID로 MyUCLA 계정을 만들고, UC Berkeley는 CalCentral/CalNet ID를 생성합니다. Harvard는 DCE 계정, UCL은 등록 번호를 보관해야 합니다.",
    },
    {
        "stage": 3,
        "category": "common",
        "title": "수강 신청 및 등록비 납부",
        "deadline_label": "D-70",
        "description": "파견교 포털에서 수강 과목을 신청하고 등록비, 수업료, 프로그램 비용 납부 여부를 확인합니다.",
        "source_detail": "문서 기준 4월 말까지 등록을 마무리해야 I-20 발급과 비자 신청 일정에 여유가 있습니다. UCLA BruinBill, Berkeley Flywire, Harvard MyDCE, UCL 결제 링크 등 학교별 결제 경로를 확인하세요.",
    },
    {
        "stage": 3,
        "category": "common",
        "title": "I-20 또는 Offer Form 준비",
        "deadline_label": "D-65",
        "description": "미국 파견은 I-20 신청 서류를 준비하고, UCL 등은 Acceptance of Offer Form 제출 여부를 확인합니다.",
        "source_detail": "I-20 신청에는 여권 사본, 재정 증빙, 잔액증명서 또는 장학증서, 영어 성적 증명서가 필요할 수 있습니다. UCL은 Acceptance of Offer Form을 빠르게 제출해야 기숙사 신청에 유리합니다.",
    },
    {
        "stage": 4,
        "category": "visa",
        "title": "I-901 SEVIS Fee 납부",
        "deadline_label": "D-60",
        "description": "미국 F-1 비자 대상자는 I-20 발급 후 SEVIS ID로 I-901 SEVIS Fee를 납부하고 영수증을 저장합니다.",
        "source_detail": "SSAP 체크리스트는 미국 비자 절차를 I-901 SEVIS Fee 납부 → DS-160 작성 → 비자 수수료 납부 → 인터뷰 예약/진행 순서로 안내합니다. Payment Confirmation 영수증은 반드시 보관하세요.",
    },
    {
        "stage": 4,
        "category": "visa",
        "title": "DS-160 작성",
        "deadline_label": "D-55",
        "description": "미국 비자 신청자는 DS-160을 작성하고 Application ID와 보안 질문 답변을 따로 기록합니다.",
        "source_detail": "DS-160은 ceac.state.gov에서 작성합니다. AA로 시작하는 Application ID와 Security Question Answer는 재로그인에 필요하므로 반드시 기록하세요.",
    },
    {
        "stage": 4,
        "category": "visa",
        "title": "비자 인터뷰 예약 및 서류 준비",
        "deadline_label": "D-50",
        "description": "비자 수수료를 납부하고 인터뷰를 예약한 뒤 여권, I-20, DS-160 확인서, SEVIS 영수증, 예약 확인서, 사진을 준비합니다.",
        "source_detail": "미국 비자 인터뷰에는 여권, I-20, DS-160 확인서, SEVIS 영수증, 비자 인터뷰 예약 확인서, 비자 사진이 필요합니다. 인터뷰 후 여권 수령까지 약 1주가 걸릴 수 있습니다.",
    },
    {
        "stage": 4,
        "category": "visa",
        "title": "영국 ETA 확인",
        "deadline_label": "D-45",
        "description": "UCL 등 영국 파견자는 2025년 이후 입국 전 ETA 필요 여부를 확인하고 신청합니다.",
        "source_detail": "문서 기준 2025년부터 영국 입국 전 ETA가 필요합니다. 별도 비자 발급은 아닐 수 있지만, 출국 전 여권과 항공권 준비 단계에서 ETA 발급 여부를 확인하세요.",
    },
    {
        "stage": 5,
        "category": "accommodation",
        "title": "숙소 선택지 비교",
        "deadline_label": "D-75",
        "description": "기숙사, I-House, 단기 임대, Airbnb의 위치, 비용, 계약 조건, 통학 시간을 비교합니다.",
        "source_detail": "문서 기준 숙소 선택지는 기숙사와 Airbnb가 대표적입니다. 기숙사는 안전, 보안, 학교 시설 이용, 현지 학생 교류에 장점이 있고 Airbnb는 자유로운 생활과 친구들과 함께 지내기 좋은 점이 있습니다.",
    },
    {
        "stage": 5,
        "category": "accommodation",
        "title": "숙소 신청 또는 예약",
        "deadline_label": "D-65",
        "description": "파견교 숙소 포털이나 외부 예약 사이트에서 신청을 완료하고 결제 내역을 저장합니다.",
        "source_detail": "UCLA는 Housing Application & Offer, UC Berkeley는 Housing 또는 International House, Harvard는 MyDCE의 Housing Request, UCL은 UCL Summer Residences 안내를 확인해 신청합니다.",
    },
    {
        "stage": 5,
        "category": "accommodation",
        "title": "입주 정보 정리",
        "deadline_label": "D-45",
        "description": "체크인 날짜, 주소, 보증금, 담당자 연락처, 입주 시 필요한 서류를 정리합니다.",
        "source_detail": "숙소 확정 후 체크인/체크아웃 일정, 주소, 결제 내역, 보증금, 식사 포함 여부, 침구와 생활용품 필요 여부를 정리하세요. 외부 숙소는 위치, 치안, 출입 보안도 확인해야 합니다.",
    },
    {
        "stage": 6,
        "category": "packing",
        "title": "항공권 및 이동 동선 확인",
        "deadline_label": "D-40",
        "description": "항공권, 공항 이동, 현지 공항에서 숙소까지의 교통편을 확인하고 예약 정보를 저장합니다.",
        "source_detail": "출국 전 항공권, 공항 이동, 현지 도착 후 숙소까지의 이동 경로를 확인하세요. 여권, 비자 사본, DS-160, SEVIS 영수증 등 필수 서류 사본도 함께 준비합니다.",
    },
    {
        "stage": 6,
        "category": "packing",
        "title": "출국 필수품 준비",
        "deadline_label": "D-25",
        "description": "여권, 비자 서류, 보험 증서, 결제 카드, 어댑터, 상비약, eSIM 또는 로밍을 준비합니다.",
        "source_detail": "문서의 출국 준비 항목에는 해외 사용 카드, 비상용 신용카드, 여권, 비자 서류, 보조배터리, 멀티탭, 일회용품, 상비약, eSIM/로밍 준비가 포함됩니다.",
    },
    {
        "stage": 6,
        "category": "packing",
        "title": "비상 연락망 저장",
        "deadline_label": "D-14",
        "description": "KENTECH 담당자, 파견교 담당자, 숙소, 보험사, 현지 긴급 연락처를 휴대폰과 문서에 저장합니다.",
        "source_detail": "출국 전 KENTECH 담당자, 파견교 담당자, 숙소, 보험사, 현지 긴급 연락처를 저장하세요. 중요한 문서와 연락처는 휴대폰과 클라우드에 모두 보관하는 것이 좋습니다.",
    },
    {
        "stage": 7,
        "category": "common",
        "title": "결과보고서 작성",
        "deadline_label": "귀국 후 7일",
        "description": "수강 내용, 생활 경험, 정산 내용, 사진 자료를 포함해 결과보고서를 작성합니다.",
        "source_detail": "결과보고서는 연수 기관과 지역 소개, 출국 전 준비, 수업 및 연구, 생활, 안전 관련 유의사항, 개인 여행 내용, 연수 소감, 참가 사진 3장 이상을 포함합니다.",
    },
    {
        "stage": 7,
        "category": "common",
        "title": "영수증 및 증빙 정리",
        "deadline_label": "귀국 후 10일",
        "description": "항공권, 숙소, 보험, 교통비 등 제출이 필요한 영수증과 증빙 자료를 정리합니다.",
        "source_detail": "귀국 후 정산과 보고를 위해 모든 영수증과 중요 문서를 보관하세요. 출국 전부터 캡처와 파일 저장을 해두면 누락을 줄일 수 있습니다.",
    },
    {
        "stage": 7,
        "category": "common",
        "title": "최종 제출 확인",
        "deadline_label": "귀국 후 14일",
        "description": "결과보고서와 증빙 자료 제출 여부를 확인하고 누락된 요청이 없는지 담당자에게 확인합니다.",
        "source_detail": "결과보고서와 증빙 자료 제출 후 담당자에게 접수 여부를 확인하세요. 일정, 지역, 활동 내용이 다른 경우 개인 여행 내용도 반드시 보고해야 합니다.",
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


def get_source_detail(item: Dict[str, Any]) -> Optional[str]:
    key = item_key(item)
    for default_item in DEFAULT_STAGE_ITEMS:
        if item_key(default_item) == key:
            return default_item.get("source_detail")
    return None


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
