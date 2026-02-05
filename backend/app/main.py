from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import battles as battles_router
from app.api.v1 import matchmaking as matchmaking_router
from app.api.v1 import submissions as submissions_router
from app.api.v1 import auth as auth_router
from app.api.v1 import users as users_router
from app.api.v1 import problems as problems_router
from app.api.v1 import algorithms as algorithms_router
from app.api.v1 import leaderboard as leaderboard_router

app = FastAPI(title="CodeArena Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:8081",  # Lovable frontend dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"success": True, "data": {"status": "ok"}}

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(battles_router.router)
app.include_router(matchmaking_router.router)
app.include_router(submissions_router.router)
app.include_router(problems_router.router)
app.include_router(algorithms_router.router)
app.include_router(leaderboard_router.router)
