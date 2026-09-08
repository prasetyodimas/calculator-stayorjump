"""Orkestrator crawl: menjalankan crawler di threadpool dan upsert ke database."""

import logging
from datetime import datetime, timezone
from typing import List

from starlette.concurrency import run_in_threadpool

from ..db import get_db
from ..seed_data import SEED_REGULATIONS
from . import bpk, bpjs_tk

logger = logging.getLogger(__name__)


def _doc_for_storage(reg: dict) -> dict:
    doc = dict(reg)
    doc["articles_count"] = len(doc.get("articles", []))
    doc["crawled_at"] = datetime.now(timezone.utc).isoformat()
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    doc.pop("_id", None)
    doc.pop("id", None)
    return doc


async def upsert_regulation(reg: dict) -> None:
    doc = _doc_for_storage(reg)
    await get_db()["regulations"].update_one({"slug": doc["slug"]}, {"$set": doc}, upsert=True)


async def seed_if_empty() -> bool:
    """Isi database dengan data seed bila koleksi masih kosong."""
    count = await get_db()["regulations"].count_documents({})
    if count:
        return False
    for reg in SEED_REGULATIONS:
        await upsert_regulation(dict(reg))
    logger.info("Database kosong — %d regulasi seed dimuat.", len(SEED_REGULATIONS))
    return True


def _to_job_result(source: str, item: dict) -> dict:
    return {
        "source": source,
        "target": item.get("slug", "-"),
        "status": item.get("status", "error"),
        "articles": item.get("articles", 0),
        "message": item.get("message"),
    }


async def _update_job(job_id: str, fields: dict) -> None:
    await get_db()["crawl_jobs"].update_one({"id": job_id}, {"$set": fields}, upsert=True)


async def run_crawl(job_id: str, scope: str = "all") -> None:
    """Dijalankan sebagai background task."""
    await _update_job(job_id, {"status": "running", "finished_at": None})
    results: List[dict] = []

    try:
        if scope in ("all", "seed"):
            for reg in SEED_REGULATIONS:
                await upsert_regulation(dict(reg))
            results.append(
                {
                    "source": "seed",
                    "target": "kurasi-internal",
                    "status": "ok",
                    "articles": sum(len(r["articles"]) for r in SEED_REGULATIONS),
                    "message": f"{len(SEED_REGULATIONS)} regulasi seed dimuat/diperbarui",
                }
            )

        if scope in ("all", "bpk"):
            bpk_results = await run_in_threadpool(bpk.crawl_all)
            for item in bpk_results:
                if item.get("regulation"):
                    await upsert_regulation(item["regulation"])
                results.append(_to_job_result("bpk", item))

        if scope in ("all", "bpjs_tk"):
            bpjs_results = await run_in_threadpool(bpjs_tk.crawl_all)
            for item in bpjs_results:
                if item.get("regulation"):
                    await upsert_regulation(item["regulation"])
                results.append(_to_job_result("bpjs_tk", item))

        failures = [r for r in results if r["status"] == "error"]
        await _update_job(
            job_id,
            {
                "status": "completed",
                "results": results,
                "finished_at": datetime.now(timezone.utc).isoformat(),
                "error": f"{len(failures)} target gagal" if failures else None,
            },
        )
    except Exception as exc:  # noqa: BLE001
        logger.exception("Crawl job %s gagal", job_id)
        await _update_job(
            job_id,
            {
                "status": "failed",
                "results": results,
                "finished_at": datetime.now(timezone.utc).isoformat(),
                "error": str(exc),
            },
        )
