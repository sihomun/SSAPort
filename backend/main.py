import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# 모듈 경로 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import users, checklist, chat, packing

app = FastAPI(title="SSAPort API")

# 모든 에러에 대해 CORS 헤더를 강제로 붙여주는 미들웨어
@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    if request.method == "OPTIONS":
        response = JSONResponse(content="OK")
    else:
        response = await call_next(request)
    
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
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
