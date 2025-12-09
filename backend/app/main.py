from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import init_db, get_db
from .routes.goals import router as goals_router
from .config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_settings()
    await init_db()
    yield


app = FastAPI(
    title="Smart Goal Breaker API",
    description="AI-powered goal breakdown service",
    version="1.0.0",
    lifespan=lifespan
)

settings = get_settings()

allowed_origins = [
    "http://localhost:3000",
    settings.FRONTEND_URL,
    "https://smart-goal-breaker-psi.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(goals_router)


@app.get("/")
async def root():
    return {"message": "Smart Goal Breaker API", "status": "running"}


@app.get("/health")
async def health():
    from sqlalchemy import text
    try:
        async for db in get_db():
            await db.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
