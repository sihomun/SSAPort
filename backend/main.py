import os
import sys
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# 모듈 경로 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import users, checklist, chat, packing

app = FastAPI(title="SSAPort API")

# 강력한 CORS 미들웨어 적용
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    # OPTIONS 요청 처리 (Preflight)
    if request.method == "OPTIONS":
        response = Response()
    else:
        try:
            response = await call_next(request)
        except Exception as e:
            # 서버 내부 에러 시에도 JSON 응답과 함께 CORS 헤더 전송
            response = JSONResponse(
                status_code=500,
                content={"error": str(e)}
            )
            
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

# 라우터 등록
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(checklist.router, prefix="/checklist", tags=["checklist"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(packing.router, prefix="/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Welcome to SSAPort API"}

handler = app
