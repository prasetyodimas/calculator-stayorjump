"""REST API data regulasi & pasal ketenagakerjaan."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from ..db import get_db, is_using_mongodb
from ..models import Regulation, RegulationSummary

router = APIRouter(prefix="/regulations", tags=["regulations"])

NO_ARTICLES_PROJECTION = {"_id": 0, "articles": 0}


def _prepare(doc: dict) -> dict:
    """Normalisasi dokumen dari MongoDB/in-memory jadi dict yang Pydantic-friendly."""
    doc = {k: v for k, v in doc.items() if k != "_id"}
    doc.setdefault("articles", [])
    doc.setdefault("id", doc.get("slug"))
    doc.setdefault("articles_count", len(doc["articles"]))
    for key in ("crawled_at", "updated_at"):
        if isinstance(doc.get(key), str):
            doc[key] = datetime.fromisoformat(doc[key])
    return doc


def _build_filter(
    type: Optional[str], year: Optional[int], program: Optional[str], source: Optional[str]
) -> dict:
    query: dict = {}
    if type:
        query["type"] = {"$regex": f"^{type}$", "$options": "i"}
    if year:
        query["year"] = year
    if program:
        query["programs"] = program.upper()
    if source:
        query["source"] = source
    return query


@router.get("")
async def list_regulations(
    search: Optional[str] = Query(None, description="Cari di judul/nomor/tentang"),
    type: Optional[str] = Query(None, description="UU | PP | Perpres | Permenaker | informasi"),
    year: Optional[int] = None,
    program: Optional[str] = Query(None, description="JHT | JP | JKK | JKM | JKP | PHK | PESANGON"),
    source: Optional[str] = Query(None, description="bpk | bpjs_tk | seed"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = _build_filter(type, year, program, source)
    # Saat ada pencarian, ambil dokumen utuh karena pencarian juga masuk ke isi pasal
    projection = {"_id": 0} if search else NO_ARTICLES_PROJECTION
    docs = await get_db()["regulations"].find(query, projection).sort("year", -1).to_list(5000)
    docs = [_prepare(d) for d in docs]

    if search:
        needle = search.lower()

        def matches(d: dict) -> bool:
            if any(
                needle in (d.get(field) or "").lower()
                for field in ("title", "number", "about")
            ):
                return True
            return any(
                needle in f"{a.get('pasal', '')} {a.get('title') or ''} {a.get('content', '')}".lower()
                for a in d.get("articles", [])
            )

        docs = [d for d in docs if matches(d)]

    total = len(docs)
    start = (page - 1) * limit
    items = [RegulationSummary(**d).model_dump() for d in docs[start : start + limit]]
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "using_mongodb": is_using_mongodb(),
        "items": items,
    }


@router.get("/articles/search")
async def search_articles(
    search: Optional[str] = Query(None, description="Cari di isi/judul pasal"),
    pasal: Optional[str] = Query(None, description="Nomor pasal persis, mis. 156"),
    program: Optional[str] = Query(None, description="JHT | JP | JKK | JKM | JKP | PHK | PESANGON"),
    regulation: Optional[str] = Query(None, description="slug regulasi induk"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    query = _build_filter(None, None, program, None)
    if regulation:
        query["slug"] = regulation

    docs = await get_db()["regulations"].find(query, {"_id": 0}).to_list(5000)
    docs = [_prepare(d) for d in docs]

    hits = []
    for prepared in docs:
        for art in prepared.get("articles") or []:
            if pasal and art.get("pasal") != pasal:
                continue
            if search:
                haystack = f"{art.get('pasal', '')} {art.get('title') or ''} {art.get('content', '')}".lower()
                if search.lower() not in haystack:
                    continue
            hits.append(
                {
                    "regulation_id": prepared["id"],
                    "regulation_slug": prepared["slug"],
                    "regulation_number": prepared.get("number", ""),
                    "regulation_title": prepared.get("title", ""),
                    "pasal": art.get("pasal", ""),
                    "bab": art.get("bab"),
                    "title": art.get("title"),
                    "content": art.get("content", ""),
                    "programs": art.get("programs", []),
                    "source_url": art.get("source_url"),
                }
            )

    total = len(hits)
    start = (page - 1) * limit
    return {"total": total, "page": page, "limit": limit, "items": hits[start : start + limit]}


@router.get("/{slug}", response_model=Regulation)
async def get_regulation(slug: str):
    query = {"$or": [{"slug": slug}, {"id": slug}]}
    doc = await get_db()["regulations"].find_one(query, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Regulasi tidak ditemukan")
    return Regulation(**_prepare(doc))


@router.get("/{slug}/articles")
async def get_regulation_articles(slug: str, pasal: Optional[str] = None):
    query = {"$or": [{"slug": slug}, {"id": slug}]}
    doc = await get_db()["regulations"].find_one(query, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Regulasi tidak ditemukan")
    doc = _prepare(doc)
    articles = doc["articles"]
    if pasal:
        articles = [a for a in articles if a.get("pasal") == pasal]
    return {
        "regulation": RegulationSummary(**{k: v for k, v in doc.items() if k != "articles"}).model_dump(),
        "total": len(articles),
        "items": articles,
    }
