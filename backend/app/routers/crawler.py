"""REST API trigger & monitoring crawler."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, HTTPException, Query

from ..crawler import service
from ..db import get_db
from ..models import CrawlJob

router = APIRouter(prefix="/crawl", tags=["crawler"])

SCOPE_DESCRIPTIONS = {
    "all": "seed + peraturan.bpk.go.id + bpjsketenagakerjaan.go.id",
    "bpk": "peraturan.bpk.go.id saja (metadata + ekstraksi pasal dari PDF)",
    "bpjs_tk": "bpjsketenagakerjaan.go.id saja (halaman program & artikel)",
    "seed": "data seed terkurasi saja (tanpa mengambil dari web)",
}


def _prepare_job(doc: dict) -> dict:
    doc = {k: v for k, v in doc.items() if k != "_id"}
    for key in ("started_at", "finished_at"):
        if isinstance(doc.get(key), str):
            doc[key] = datetime.fromisoformat(doc[key])
    return doc


@router.get("/sources")
async def list_sources():
    return {
        "sources": [
            {
                "id": "bpk",
                "name": "JDIH BPK (peraturan.bpk.go.id)",
                "kind": "peraturan resmi",
                "targets": [t["number"] for t in service.bpk.TARGETS],
            },
            {
                "id": "bpjs_tk",
                "name": "BPJS Ketenagakerjaan (bpjsketenagakerjaan.go.id)",
                "kind": "informasi program",
                "targets": [p[3] for p in service.bpjs_tk.INFO_PAGES] + ["katalog /peraturan.html"],
            },
            {
                "id": "seed",
                "name": "Data seed terkurasi",
                "kind": "fallback",
                "targets": [],
            },
        ]
    }


@router.post("", response_model=CrawlJob)
@router.post("/trigger", response_model=CrawlJob, include_in_schema=False)
async def trigger_crawl(
    background_tasks: BackgroundTasks,
    scope: str = Query("all", description="all | bpk | bpjs_tk | seed"),
):
    scope = scope.lower()
    if scope not in SCOPE_DESCRIPTIONS:
        raise HTTPException(
            status_code=400,
            detail=f"scope tidak dikenal. Pilihan: {', '.join(SCOPE_DESCRIPTIONS)}",
        )

    # Tolak jika masih ada job berjalan agar tidak menumpuk request crawl
    running = await get_db()["crawl_jobs"].count_documents({"status": {"$in": ["queued", "running"]}})
    if running:
        raise HTTPException(status_code=409, detail="Masih ada proses crawl yang berjalan")

    job = CrawlJob(scope=scope)
    doc = job.model_dump()
    doc["started_at"] = doc["started_at"].isoformat()
    if doc["finished_at"]:
        doc["finished_at"] = doc["finished_at"].isoformat()
    else:
        doc.pop("finished_at", None)
    await get_db()["crawl_jobs"].insert_one(doc)

    background_tasks.add_task(service.run_crawl, job.id, scope)
    return job


@router.get("/jobs")
async def list_crawl_jobs(
    status: Optional[str] = Query(None, description="queued | running | completed | failed"),
    limit: int = Query(20, ge=1, le=100),
):
    query = {"status": status} if status else {}
    docs = await get_db()["crawl_jobs"].find(query, {"_id": 0}).sort("started_at", -1).to_list(limit)
    jobs = [CrawlJob(**_prepare_job(d)).model_dump() for d in docs]
    return {"total": len(jobs), "items": jobs}


@router.get("/jobs/{job_id}", response_model=CrawlJob)
async def get_crawl_job(job_id: str):
    doc = await get_db()["crawl_jobs"].find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Job tidak ditemukan")
    return CrawlJob(**_prepare_job(doc))
