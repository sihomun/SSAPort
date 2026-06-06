import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 모듈 경로 설정
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routers import users, checklist, chat, packing

app = FastAPI(title="SSAPort API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Vercel에서 필요한 경우를 위해 명시적으로 app을 지정
handler = app
