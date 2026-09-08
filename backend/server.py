import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

from app.db import close_db, connect_db, get_db, is_using_mongodb
from app.crawler.service import seed_if_empty
from app.routers import crawler as crawler_router
from app.routers import regulations as regulations_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db(os.environ.get("MONGO_URL"), os.environ.get("DB_NAME", "stayorjump"))
    await seed_if_empty()
    yield
    await close_db()


app = FastAPI(
    title="StayOrJump API",
    description=(
        "API data regulasi & pasal ketenagakerjaan (UU 13/2003, UU 6/2023, "
        "PP 35/2021, JHT/JP/JKK/JKM/JKP) dengan crawler dari peraturan.bpk.go.id "
        "dan bpjsketenagakerjaan.go.id."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

api_router = APIRouter(prefix="/api")


# --- Endpoint legacy dari template awal (status check) ----------------------

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {
        "message": "StayOrJump API",
        "storage": "mongodb" if is_using_mongodb() else "in-memory",
        "docs": "/docs",
    }


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()
    await get_db()["status_checks"].insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await get_db()["status_checks"].find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check["timestamp"], str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


# --- Router utama -----------------------------------------------------------

api_router.include_router(regulations_router.router)
api_router.include_router(crawler_router.router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
