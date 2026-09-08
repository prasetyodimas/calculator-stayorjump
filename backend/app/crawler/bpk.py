"""Crawler peraturan.bpk.go.id (JDIH BPK).

Strategi per target:
1. Cari detail page lewat endpoint /Search (atau link populer di homepage).
2. Ambil metadata (tentang, status) + link PDF dari detail page.
3. Unduh PDF dan ekstrak pasal-pasalnya (opsional, bisa dimatikan per target).
"""

import logging
import re
from typing import List, Optional
from urllib.parse import quote, urljoin

from bs4 import BeautifulSoup

from .http import fetch_bytes, fetch_text
from .pdfparse import extract_text_from_pdf, parse_articles

logger = logging.getLogger(__name__)

BASE = "https://peraturan.bpk.go.id"

TARGETS = [
    {
        "slug": "uu-13-2003",
        "number": "UU No. 13 Tahun 2003",
        "title": "Undang-Undang tentang Ketenagakerjaan",
        "type": "UU",
        "year": 2003,
        "programs": ["PHK", "PESANGON"],
        "searches": ["uu 13 2003 ketenagakerjaan"],
        "slug_fragment": "uu-no-13-tahun-2003",
    },
    {
        "slug": "uu-6-2023",
        "number": "UU No. 6 Tahun 2023",
        "title": "Penetapan Perppu 2/2022 tentang Cipta Kerja menjadi Undang-Undang",
        "type": "UU",
        "year": 2023,
        "programs": ["PHK", "PESANGON"],
        "searches": ["uu 6 2023 cipta kerja"],
        "slug_fragment": "uu-no-6-tahun-2023",
    },
    {
        "slug": "pp-35-2021",
        "number": "PP No. 35 Tahun 2021",
        "title": "PKWT, Alih Daya, Waktu Kerja dan Istirahat, dan Pemutusan Hubungan Kerja",
        "type": "PP",
        "year": 2021,
        "programs": ["PHK", "PESANGON"],
        "searches": ["pp 35 2021 pemutusan hubungan kerja", "pp 35 tahun 2021"],
        "slug_fragment": "pp-no-35-tahun-2021",
    },
    {
        "slug": "pp-46-2015",
        "number": "PP No. 46 Tahun 2015",
        "title": "Penyelenggaraan Program Jaminan Hari Tua (JHT)",
        "type": "PP",
        "year": 2015,
        "programs": ["JHT"],
        "searches": ["jaminan hari tua"],
        "slug_fragment": "pp-no-46-tahun-2015",
    },
    {
        "slug": "pp-45-2015",
        "number": "PP No. 45 Tahun 2015",
        "title": "Penyelenggaraan Program Jaminan Pensiun (JP)",
        "type": "PP",
        "year": 2015,
        "programs": ["JP"],
        "searches": ["penyelenggaraan program jaminan pensiun"],
        "slug_fragment": "pp-no-45-tahun-2015",
    },
    {
        "slug": "pp-37-2021",
        "number": "PP No. 37 Tahun 2021",
        "title": "Penyelenggaraan Program Jaminan Kehilangan Pekerjaan (JKP)",
        "type": "PP",
        "year": 2021,
        "programs": ["JKP"],
        "searches": ["jaminan kehilangan pekerjaan"],
        "slug_fragment": "pp-no-37-tahun-2021",
    },
    {
        "slug": "uu-24-2011",
        "number": "UU No. 24 Tahun 2011",
        "title": "Badan Penyelenggara Jaminan Sosial (BPJS)",
        "type": "UU",
        "year": 2011,
        "programs": ["JHT", "JP", "JKK", "JKM", "JKP"],
        "searches": ["uu 24 2011", "badan penyelenggara jaminan sosial"],
        "slug_fragment": "uu-no-24-tahun-2011",
    },
]

_DETAIL_RE = re.compile(r"/Details/(\d+)/([a-z0-9-]+)")
_PDF_RE = re.compile(r"(Download/\d+/[^\"']+?\.pdf)", re.IGNORECASE)


def _find_detail_url(slug_fragment: str, searches: List[str]) -> Optional[str]:
    pages = [f"{BASE}/"] + [
        f"{BASE}/Search?keywords={quote(q)}" for q in searches
    ]
    for page in pages:
        html = fetch_text(page)
        if not html:
            continue
        for match in _DETAIL_RE.finditer(html):
            if match.group(2) == slug_fragment or match.group(2).endswith(slug_fragment):
                return f"{BASE}/Details/{match.group(1)}/{match.group(2)}"
        # slug bisa muncul sebagai teks href penuh
        for href in re.findall(rf"/Details/\d+/[a-z0-9-]*{re.escape(slug_fragment)}[a-z0-9-]*", html):
            if href.split("/")[-1] == slug_fragment:
                return urljoin(BASE, href)
    return None


def _parse_detail(html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    out: dict = {}

    title_tag = soup.find("title")
    if title_tag and title_tag.text.strip():
        out["page_title"] = title_tag.text.strip()

    # "TENTANG" — baris tabel metadata
    about_tag = soup.find(string=re.compile(r"^\s*tentang\s*$", re.IGNORECASE))
    if about_tag and about_tag.parent:
        cell = about_tag.parent.find_next_sibling("td") or about_tag.parent.parent.find_next_sibling("td")
        if cell:
            out["about"] = " ".join(cell.get_text(" ", strip=True).split())

    # STATUS
    status_tag = soup.find(string=re.compile(r"^\s*status\s*$", re.IGNORECASE))
    if status_tag and status_tag.parent:
        cell = status_tag.parent.find_next_sibling("td") or status_tag.parent.parent.find_next_sibling("td")
        if cell:
            text = " ".join(cell.get_text(" ", strip=True).split())
            out["status_raw"] = text
            lowered = text.lower()
            if "tidak berlaku" in lowered or "dicabut" in lowered:
                out["status"] = "dicabut/diubah"
            elif "berlaku" in lowered:
                out["status"] = "berlaku"

    pdf_match = _PDF_RE.search(html)
    if pdf_match:
        out["pdf_url"] = urljoin(BASE + "/", pdf_match.group(1))
    return out


def crawl_target(target: dict, parse_pdf: bool = True, max_articles: int = 300) -> dict:
    """Crawl satu peraturan. Selalu mengembalikan dict hasil (sukses/gagal)."""
    result = {
        "slug": target["slug"],
        "status": "error",
        "articles": 0,
        "regulation": None,
        "message": None,
    }

    detail_url = _find_detail_url(target["slug_fragment"], target["searches"])
    if not detail_url:
        result["message"] = "detail page tidak ditemukan di pencarian BPK"
        return result

    html = fetch_text(detail_url)
    if not html:
        result["message"] = f"gagal mengambil {detail_url}"
        return result

    meta = _parse_detail(html)
    pdf_url = meta.get("pdf_url")

    articles: List[dict] = []
    if parse_pdf and pdf_url:
        pdf = fetch_bytes(pdf_url, timeout=90)
        if pdf:
            text = extract_text_from_pdf(pdf)
            articles = parse_articles(text or "", source_url=detail_url)[:max_articles]
            for art in articles:
                art["programs"] = target.get("programs", [])
        else:
            logger.warning("PDF tidak dapat diunduh: %s", pdf_url)

    regulation = {
        "slug": target["slug"],
        "number": target["number"],
        "title": target["title"],
        "type": target["type"],
        "year": target["year"],
        "about": meta.get("about"),
        "status": meta.get("status", "berlaku"),
        "programs": target.get("programs", []),
        "source": "bpk",
        "source_url": detail_url,
        "pdf_url": pdf_url,
        "articles": articles,
    }
    result.update(
        status="ok",
        regulation=regulation,
        articles=len(articles),
        message=None if articles else "metadata tersimpan; ekstraksi pasal dari PDF tidak menghasilkan data",
    )
    return result


def crawl_all(parse_pdf: bool = True) -> List[dict]:
    return [crawl_target(t, parse_pdf=parse_pdf) for t in TARGETS]
