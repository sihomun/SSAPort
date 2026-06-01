from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import users, checklist, chat, packing

app = FastAPI(title="SSAPort API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(checklist.router, prefix="/checklist", tags=["checklist"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(packing.router, prefix="/ai", tags=["ai"])

@app.get("/")
async def root():
    return {"message": "Welcome to SSAPort API"}
