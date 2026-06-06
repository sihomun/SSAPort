from fastapi import APIRouter
from pydantic import BaseModel
import json
from lib.ai import get_ai_response

router = APIRouter()

class PackingRequest(BaseModel):
    destination: str
    stay_weeks: int
    has_laundry: bool
    season: str

@router.post("/packing-list")
async def get_packing_list(data: PackingRequest):
    system_prompt = """다음 조건에 맞는 해외 연수 짐 목록을 JSON으로 생성하세요.
[출력 형식] 카테고리: 의류, 전자기기, 서류, 의약품, 생활용품. JSON만 출력하세요."""
    
    user_input = f"목적지: {data.destination}, 기간: {data.stay_weeks}주, 계절: {data.season}, 세탁기: {data.has_laundry}"
    
    reply = get_ai_response(system_prompt, user_input)
    try:
        packing_list = json.loads(reply)
    except:
        packing_list = {"error": "Failed to generate structured list", "raw": reply}
        
    return {"packing_list": packing_list}
