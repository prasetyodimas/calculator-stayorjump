"""Database layer.

Connects to MongoDB via Motor when MONGO_URL is reachable, otherwise falls
back to a lightweight in-memory store so the API stays functional without a
running MongoDB instance.
"""

import logging
import re
import uuid
from copy import deepcopy
from typing import Any, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# In-memory fallback store (minimal subset of the Motor API used in this app)
# ---------------------------------------------------------------------------

def _matches(doc: dict, filter: dict) -> bool:
    for key, cond in filter.items():
        if key == "$or":
            if not any(_matches(doc, sub) for sub in cond):
                return False
            continue
        value = doc.get(key)
        if isinstance(cond, dict):
            if "$regex" in cond:
                flags = re.IGNORECASE if cond.get("$options") == "i" else 0
                if not isinstance(value, str) or not re.search(cond["$regex"], value, flags):
                    return False
            elif "$in" in cond:
                if isinstance(value, list):
                    if not any(v in cond["$in"] for v in value):
                        return False
                elif value not in cond["$in"]:
                    return False
            elif "$ne" in cond:
                if value == cond["$ne"]:
                    return False
            else:
                return False
        elif isinstance(value, list):
            if cond not in value:
                return False
        elif value != cond:
            return False
    return True


class _MemoryCursor:
    def __init__(self, docs):
        self._docs = docs

    def sort(self, key: str, direction: int = 1):
        try:
            self._docs.sort(key=lambda d: d.get(key) or "", reverse=direction < 0)
        except TypeError:
            pass
        return self

    async def to_list(self, length: Optional[int]):
        return self._docs[:length] if length else list(self._docs)


class MemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self._docs: list[dict] = []

    async def insert_one(self, doc: dict):
        doc = deepcopy(doc)
        doc.setdefault("_id", str(uuid.uuid4()))
        self._docs.append(doc)
        return {"inserted_id": doc["_id"]}

    def find(self, filter: Optional[dict] = None, projection: Optional[dict] = None):
        docs = [deepcopy(d) for d in self._docs if _matches(d, filter or {})]
        return _MemoryCursor(docs)

    async def find_one(self, filter: Optional[dict] = None, projection: Optional[dict] = None):
        for doc in self._docs:
            if _matches(doc, filter or {}):
                return deepcopy(doc)
        return None

    async def update_one(self, filter: dict, update: dict, upsert: bool = False):
        for i, doc in enumerate(self._docs):
            if _matches(doc, filter):
                if "$set" in update:
                    doc.update(update["$set"])
                else:
                    doc.update(update)
                self._docs[i] = doc
                return {"matched_count": 1, "modified_count": 1}
        if upsert:
            base = {k: v for k, v in filter.items() if not k.startswith("$")}
            base.update(update.get("$set", update))
            await self.insert_one(base)
            return {"matched_count": 0, "upserted": True}
        return {"matched_count": 0}

    async def replace_one(self, filter: dict, replacement: dict, upsert: bool = False):
        return await self.update_one(filter, {"$set": replacement}, upsert=upsert)

    async def count_documents(self, filter: Optional[dict] = None) -> int:
        return sum(1 for d in self._docs if _matches(d, filter or {}))

    async def delete_many(self, filter: Optional[dict] = None):
        before = len(self._docs)
        self._docs = [d for d in self._docs if not _matches(d, filter or {})]
        return {"deleted_count": before - len(self._docs)}


class MemoryDatabase:
    def __init__(self):
        self._collections: dict[str, MemoryCollection] = {}

    def __getitem__(self, name: str) -> MemoryCollection:
        return self._collections.setdefault(name, MemoryCollection(name))


# ---------------------------------------------------------------------------
# Connection setup
# ---------------------------------------------------------------------------

db: Any = None
mongo_client: Any = None
using_mongodb = False


def get_db() -> Any:
    """Akses handle database aktif (MongoDB atau in-memory)."""
    if db is None:
        raise RuntimeError("Database belum diinisialisasi — panggil connect_db() dulu")
    return db


def is_using_mongodb() -> bool:
    return using_mongodb


async def connect_db(mongo_url: Optional[str], db_name: str) -> Any:
    """Try MongoDB; fall back to in-memory store."""
    global db, mongo_client, using_mongodb

    if mongo_url:
        try:
            from motor.motor_asyncio import AsyncIOMotorClient

            client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=3000)
            await client.admin.command("ping")
            db = client[db_name]
            mongo_client = client
            using_mongodb = True
            logger.info("Connected to MongoDB at %s, database '%s'", mongo_url, db_name)
            return db
        except Exception as exc:  # noqa: BLE001 - any connection failure -> fallback
            logger.warning("MongoDB unavailable (%s). Falling back to in-memory store.", exc)

    db = MemoryDatabase()
    using_mongodb = False
    logger.warning("Using in-memory data store (data is lost on restart).")
    return db


async def close_db():
    if mongo_client is not None:
        mongo_client.close()
