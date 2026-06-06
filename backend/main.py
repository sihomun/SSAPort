import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 모듈 경로 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import users, checklist, chat, packing

app = FastAPI(title="SSAPort API")

# CORS 설정: 모든 오리진 허용 (Vercel 미리보기 주소 대응)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(checklist.router, prefix="/checklist", tags=["checklist"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(packing.router, prefix="/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Welcome to SSAPort API"}

handler = app
