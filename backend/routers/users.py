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
        # 1. User Profile Upsert
        supabase.table("users").upsert({
            "id": data.user_id,
            "email": data.email,
            "host_university": data.host_university,
            "departure_date": data.departure_date,
            "stay_weeks": data.stay_weeks,
            "is_first_time": data.is_first_time
        }).execute()

        # 2. Comprehensive AI Generation based on SSAP_신청_체크리스트.md
        checklist_data = {"items": []}
        try:
            ssap_master_guide = f"""
당신은 KENTECH SSAP(해외단기연수) 전문 가이드입니다. 다음 단계별 지침을 바탕으로 {data.host_university} 파견 학생을 위한 전체 체크리스트를 생성하세요.

[단계별 필수 포함 내용]
- STAGE 0 (사전 준비): 모집 공고 확인, 어학 성적 확보(TOEFL/TOEIC 등), 여권 영문명 통일 확인.
- STAGE 1 (신청): 영문 학업계획서(Study Plan) 작성, CV 작성, 모든 서류 1개 PDF 병합 후 이메일 제출.
- STAGE 2 (결과/면접): 면접 대상자 발표 확인 및 면접 준비.
- STAGE 3 (등록/수강신청): 
  * 공통: KENTECH 제공 링크/비번 대기 필수.
  * UCLA: MyUCLA 계정(9자리 UID), BruinBill 수업료 납부, I-20 신청(여권/재정증명).
  * Berkeley: CalCentral/CalNet ID 생성, Flywire 송금, ISS Portal I-20 발급.
  * Harvard: MyDCE 계정, 8학점 대면수업 필수, 트래블카드 결제 권장.
  * UCL: Acceptance of Offer Form 제출, 등록 번호 저장.
- STAGE 4 (비자/입국): 
  * 미국: I-901 SEVIS Fee($350) -> DS-160 -> 비자 인터뷰 예약.
  * 영국: 2025년부터 ETA 전자여행허가 필수.
- STAGE 5 (숙소): 기숙사 vs 에어비앤비 선택. 학교별 포털(UCLA Housing, I-House 등) 신청.
- STAGE 6 (출국 전): 트래블로그/월렛 카드 발급, 상비약, 110V 돼지코, 즉석식품 준비.
- STAGE 7 (귀국 후): 사진 3장 포함 결과보고서 작성, 모든 영수증 및 증빙 서류 제출.

[출력 규칙]
- JSON 형식으로만 응답하세요.
- 각 단계(0~7)별로 최소 1-2개 이상의 핵심 항목을 포함하세요.
- 형식: {{"items": [{{"stage": 0, "category": "common", "title": "...", "deadline_label": "D-90", "description": "..."}}]}}
"""
            user_info = f"파견 대학: {data.host_university}, 출국일: {data.departure_date}, 기간: {data.stay_weeks}주"
            ai_reply = get_ai_response(ssap_master_guide, user_info)
            
            json_match = re.search(r'\{.*\}', ai_reply, re.DOTALL)
            if json_match:
                checklist_data = json.loads(json_match.group())
        except Exception as ai_e:
            print(f"AI Generation Error: {str(ai_e)}")

        # 3. Save generated items to DB
        if checklist_data.get("items"):
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
                        supabase.table("user_checklist").insert({
                            "user_id": data.user_id,
                            "item_id": res.data[0]["id"],
                            "is_done": False
                        }).execute()
                except: continue
            
        return {"success": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/me")
async def get_me(user_id: str):
    response = supabase.table("users").select("*").eq("id", user_id).execute()
    return response.data[0] if response.data else {"error": "Not Found"}
