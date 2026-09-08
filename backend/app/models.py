import uuid
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Article(BaseModel):
    """Satu pasal/bagian di dalam sebuah regulasi."""

    model_config = ConfigDict(extra="ignore")

    pasal: str = Field(..., description='Nomor pasal, mis. "156" atau nama bagian')
    bab: Optional[str] = Field(None, description="Bab induk, jika ada")
    title: Optional[str] = None
    content: str = ""
    programs: List[str] = Field(
        default_factory=list,
        description="Program BPJS terkait: JHT/JP/JKK/JKM/JKP atau topik seperti PESANGON/PHK",
    )
    source_url: Optional[str] = None


class Regulation(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str = Field(..., description="Identifier unik, mis. uu-13-2003")
    number: str = Field(..., description='Nomor resmi, mis. "UU No. 13 Tahun 2003"')
    title: str
    type: str = Field(..., description="UU | PP | Perpres | Permenaker | UU BPJS | informasi")
    year: Optional[int] = None
    about: Optional[str] = Field(None, description="Tentang")
    status: str = Field("berlaku", description="berlaku | dicabut | diubah")
    programs: List[str] = Field(default_factory=list)
    source: str = Field(..., description="bpk | bpjs_tk | seed")
    source_url: Optional[str] = None
    pdf_url: Optional[str] = None
    articles: List[Article] = Field(default_factory=list)
    articles_count: int = 0
    crawled_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)


class RegulationSummary(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    slug: str
    number: str
    title: str
    type: str
    year: Optional[int] = None
    about: Optional[str] = None
    status: str
    programs: List[str] = []
    source: str
    source_url: Optional[str] = None
    pdf_url: Optional[str] = None
    articles_count: int = 0
    crawled_at: datetime
    updated_at: datetime


class ArticleHit(BaseModel):
    """Pasal beserta konteks regulasi induknya (hasil pencarian lintas regulasi)."""

    model_config = ConfigDict(extra="ignore")

    regulation_id: str
    regulation_slug: str
    regulation_number: str
    regulation_title: str
    pasal: str
    bab: Optional[str] = None
    title: Optional[str] = None
    content: str
    programs: List[str] = []
    source_url: Optional[str] = None


class PaginatedResponse(BaseModel):
    total: int
    page: int
    limit: int
    items: list


class CrawlSourceResult(BaseModel):
    source: str
    target: str
    status: str = "ok"  # ok | skipped | error
    articles: int = 0
    message: Optional[str] = None


class CrawlJob(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "queued"  # queued | running | completed | failed
    scope: str = "all"  # all | bpk | bpjs_tk | seed
    started_at: datetime = Field(default_factory=_now)
    finished_at: Optional[datetime] = None
    results: List[CrawlSourceResult] = []
    error: Optional[str] = None
