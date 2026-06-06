import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 모듈 경로 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import users, checklist, chat, packing

app = FastAPI(title="SSAPort API")

# CORS 설정
# 브라우저 보안 정책상 allow_credentials=True일 경우 allow_origins=["*"]를 사용할 수 없습니다.
# 따라서 명시적인 주소를 적거나, credentials를 False로 설정해야 합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ssa-port-6i3ffz6sw-sihomun-s-projects.vercel.app",
        "https://ssa-port-frontend.vercel.app" # 실제 프론트엔드 배포 주소
    ],
    allow_credentials=True,
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
