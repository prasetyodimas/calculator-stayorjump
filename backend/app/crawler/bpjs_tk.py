"""Crawler situs resmi BPJS Ketenagakerjaan (bpjsketenagakerjaan.go.id).

Dua target:
1. Halaman informasi program/segmen peserta & artikel edukasi (dari sitemap).
2. Katalog peraturan di /peraturan.html — termasuk unduh & parsing PDF
   untuk peraturan yang relevan dengan ketenagakerjaan/jaminan sosial.
"""

import logging
import re
from typing import List, Optional
from urllib.parse import urljoin
from xml.etree import ElementTree

from bs4 import BeautifulSoup

from .http import fetch_bytes, fetch_text
from .pdfparse import extract_text_from_pdf, parse_articles

logger = logging.getLogger(__name__)

BASE = "https://www.bpjsketenagakerjaan.go.id"
SITEMAP = f"{BASE}/sitemap.xml"
PERATURAN_PAGE = f"{BASE}/peraturan.html"

# Halaman informasi (slug hasil, path relatif, program, judul)
INFO_PAGES = [
    ("bpjs-peserta-pu", "penerima-upah.html", None, "Kepesertaan Pekerja Penerima Upah (PU)"),
    ("bpjs-peserta-bpu", "bukan-penerima-upah.html", None, "Kepesertaan Pekerja Bukan Penerima Upah (BPU)"),
    ("bpjs-peserta-jakon", "jasa-konstruksi.html", "JKK", "Kepesertaan Jasa Konstruksi"),
    ("bpjs-peserta-pmi", "pekerja-migran-indonesia.html", None, "Kepesertaan Pekerja Migran Indonesia (PMI)"),
    ("bpjs-jkp", "jaminan-kehilangan-pekerjaan.html", "JKP", "Jaminan Kehilangan Pekerjaan (JKP)"),
    ("bpjs-cara-klaim", "cara-klaim.html", None, "Cara Klaim Manfaat"),
]

ARTICLE_KEYWORDS = re.compile(
    r"jaminan-(sosial|kematian|kecelakaan|pensiun|hari-tua|kehilangan)|beda-jht",
    re.IGNORECASE,
)
# Judul peraturan di katalog yang relevan untuk aplikasi ini
PERATURAN_RELEVAN_RE = re.compile(
    r"jaminan|ketenagakerjaan|bpjs|hari tua|pensiun|kecelakaan|kematian|"
    r"kehilangan|pesangon|pkwt|hubungan kerja|pemutusan|sosial",
    re.IGNORECASE,
)
_MAX_ARTICLE_PAGES = 8
_MAX_PDF_PARSE = 10
_MAX_ARTICLES_PER_PDF = 300
_MIN_SECTION_CHARS = 60

# Sudah di-cover crawler BPK — jangan diduplikasi dari katalog BPJS TK
_DUPLICATE_SLUGS = {
    "uu-13-2003", "uu-6-2023", "pp-35-2021", "pp-46-2015",
    "pp-45-2015", "pp-37-2021", "uu-24-2011",
}


# ---------------------------------------------------------------------------
# Halaman informasi / artikel
# ---------------------------------------------------------------------------

def _load_sitemap_urls() -> List[str]:
    xml = fetch_text(SITEMAP)
    if not xml:
        return []
    try:
        root = ElementTree.fromstring(xml.encode("utf-8"))
    except ElementTree.ParseError:
        return re.findall(r"<loc>([^<]+)</loc>", xml)
    return [loc.text for loc in root.iter() if loc.tag.endswith("loc") and loc.text]


def _extract_sections(html: str, url: str, program: Optional[str]) -> List[dict]:
    soup = BeautifulSoup(html, "lxml")
    container = soup.find("main") or soup.find("article") or soup.body
    if not container:
        return []

    sections: List[dict] = []
    for tag in container.find_all(["h1", "h2", "h3"]):
        title = " ".join(tag.get_text(" ", strip=True).split())
        if not title or len(title) < 4:
            continue
        texts = []
        for sib in tag.find_all_next():
            if sib is not tag and sib.name in ["h1", "h2", "h3"]:
                break
            if sib.name in ["p", "li"]:
                t = " ".join(sib.get_text(" ", strip=True).split())
                if len(t) > 20 and t not in texts:
                    texts.append(t)
            if sum(len(t) for t in texts) > 3000:
                break
        content = " ".join(texts)[:4000]
        if len(content) < _MIN_SECTION_CHARS:
            continue
        sections.append(
            {
                "pasal": title[:80],
                "bab": None,
                "title": title[:150],
                "content": content,
                "programs": [program] if program else [],
                "source_url": url,
            }
        )

    if not sections:
        text = " ".join(p.get_text(" ", strip=True) for p in container.find_all("p"))
        text = re.sub(r"\s+", " ", text).strip()
        if len(text) >= _MIN_SECTION_CHARS:
            sections.append(
                {
                    "pasal": "Ringkasan",
                    "bab": None,
                    "title": "Ringkasan halaman",
                    "content": text[:4000],
                    "programs": [program] if program else [],
                    "source_url": url,
                }
            )
    return sections


def _crawl_info_page(url: str, slug: str, title: str, program: Optional[str]) -> dict:
    html = fetch_text(url)
    if not html:
        return {"slug": slug, "status": "error", "articles": 0, "message": f"gagal mengambil {url}"}
    sections = _extract_sections(html, url, program)
    regulation = {
        "slug": slug,
        "number": "Info BPJS Ketenagakerjaan",
        "title": title,
        "type": "informasi",
        "year": None,
        "about": f"Informasi resmi dari bpjsketenagakerjaan.go.id: {title}",
        "status": "berlaku",
        "programs": [program] if program else [],
        "source": "bpjs_tk",
        "source_url": url,
        "pdf_url": None,
        "articles": sections,
    }
    return {
        "slug": slug,
        "status": "ok",
        "articles": len(sections),
        "regulation": regulation,
        "message": None if sections else "tidak ada konten yang berhasil diekstrak",
    }


# ---------------------------------------------------------------------------
# Katalog peraturan (/peraturan.html)
# ---------------------------------------------------------------------------

_KATEGORI_TYPE = {
    "undangUndang": "UU",
    "peraturanPemerintah": "PP",
    "peraturanPresiden": "Perpres",
    "keputusanPresiden": "Keppres",
    "peraturanMenteri": "Permenaker",
    "peraturanBPJSKetenagakerjaan": "Per BPJS TK",
}


def _slugify_number(title: str, fallback: str) -> tuple[str, str, Optional[int], List[str]]:
    """Ambil (jenis, slug, tahun, programs) dari judul peraturan, mis.
    'Peraturan Pemerintah Nomor 44 Tahun 2015 tentang ...' -> ('PP', 'pp-44-2015', 2015).
    """
    m = re.search(
        r"(UU|Undang[- ]Undang|Peraturan Pemerintah Pengganti|Peraturan Pemerintah|"
        r"Peraturan Presiden|Keputusan Presiden|Peraturan Menteri(?:\s+Ketenagakerjaan)?|"
        r"Peraturan BPJS\s*(?:Ketenagakerjaan)?|PP)[^\d]{0,30}"
        r"(?:Nomor|No\.?)?\s*(\d+)\s*(?:Tahun|Th\.?|\/)\s*(\d{4})",
        title,
        re.IGNORECASE,
    )
    programs = []
    for label, kw in (("JHT", r"\bjht\b|hari tua"), ("JP", r"\bjp\b|pensiun"),
                      ("JKK", r"\bjkk\b|kecelakaan"), ("JKM", r"\bjkm\b|kematian"),
                      ("JKP", r"\bjkp\b|kehilangan"),
                      ("PESANGON", r"pesangon|pkwt"), ("PHK", r"pemutusan|phk|hubungan kerja")):
        if re.search(kw, title, re.IGNORECASE) and label not in programs:
            programs.append(label)
    if not m:
        slug = re.sub(r"[^a-z0-9]+", "-", fallback.lower()).strip("-")
        return "informasi", f"bpjs-peraturan-{slug}"[:60], None, programs
    jenis_raw, nomor, tahun = m.group(1).lower(), m.group(2), int(m.group(3))
    jenis = {
        "uu": "uu", "undang undang": "uu", "undang-undang": "uu",
        "pp": "pp", "peraturan pemerintah": "pp",
        "peraturan pemerintah pengganti": "perppu",
        "peraturan presiden": "perpres", "keputusan presiden": "keppres",
    }
    type_slug = next((v for k, v in jenis.items() if k in jenis_raw),
                     "permenaker" if "menteri" in jenis_raw else "per-bpjs-tk")
    slug = f"{type_slug}-{nomor}-{tahun}"
    type_name = {
        "uu": "UU", "pp": "PP", "perppu": "Perppu", "perpres": "Perpres",
        "keppres": "Keppres", "permenaker": "Permenaker", "per-bpjs-tk": "Per BPJS TK",
    }[type_slug]
    return type_name, slug, tahun, programs


def _guess_programs(text: str, existing: List[str]) -> List[str]:
    programs = list(existing)
    upper = text.upper()
    for label, kws in (
        ("JHT", ["HARI TUA", "JHT"]),
        ("JP", ["JAMINAN PENSIUN"]),
        ("JKK", ["KECELAKAAN KERJA"]),
        ("JKM", ["JAMINAN KEMATIAN", "KEMATIAN"]),
        ("JKP", ["KEHILANGAN PEKERJAAN"]),
        ("PHK", ["PEMUTUSAN HUBUNGAN KERJA", "PHK"]),
        ("PESANGON", ["PESANGON"]),
    ):
        if label not in programs and any(kw in upper for kw in kws):
            programs.append(label)
    return programs


def _crawl_peraturan_library() -> List[dict]:
    html = fetch_text(PERATURAN_PAGE)
    if not html:
        return [{"slug": "bpjs-peraturan", "status": "error", "articles": 0,
                 "message": f"gagal mengambil {PERATURAN_PAGE}"}]

    soup = BeautifulSoup(html, "lxml")
    results: List[dict] = []
    parsed_pdfs = 0
    seen_slugs: set[str] = set()

    for pane_id, kategori in _KATEGORI_TYPE.items():
        pane = soup.find(id=pane_id)
        if not pane:
            continue
        for item in pane.select(".rectangle-peraturan"):
            title_tag = item.select_one(".p-peraturan")
            link_tag = item.find("a", href=re.compile(r"assets/uploads/peraturan/.*\.pdf", re.IGNORECASE))
            if not title_tag or not link_tag:
                continue
            title = " ".join(title_tag.get_text(" ", strip=True).split())
            pdf_url = urljoin(BASE, link_tag["href"])

            if not PERATURAN_RELEVAN_RE.search(title):
                continue

            type_name, slug, tahun, programs = _slugify_number(title, pdf_url.split("/")[-1].rsplit(".", 1)[0])
            # Lewati peraturan yang sudah menjadi target crawler BPK
            if slug in _DUPLICATE_SLUGS:
                logger.info("Lewati duplikat dari katalog BPJS TK: %s", title[:60])
                continue
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)

            articles: List[dict] = []
            note = None
            if parsed_pdfs < _MAX_PDF_PARSE:
                pdf = fetch_bytes(pdf_url, timeout=90)
                if pdf:
                    text = extract_text_from_pdf(pdf)
                    articles = parse_articles(text or "", source_url=pdf_url)[:_MAX_ARTICLES_PER_PDF]
                    parsed_pdfs += 1
                    if not articles:
                        note = "metadata tersimpan; PDF tidak menghasilkan pasal"
                else:
                    note = "PDF gagal diunduh"
            if articles:
                programs = _guess_programs(" ".join(a.get("content", "")[:2000] for a in articles[:30]), programs)
                for art in articles:
                    art["programs"] = programs

            regulation = {
                "slug": slug,
                "number": title.split(" Tentang ")[0].split(" tentang ")[0][:100],
                "title": title[:250],
                "type": kategori,
                "year": tahun,
                "about": title,
                "status": "berlaku",
                "programs": programs,
                "source": "bpjs_tk",
                "source_url": PERATURAN_PAGE,
                "pdf_url": pdf_url,
                "articles": articles,
            }
            results.append(
                {
                    "slug": slug,
                    "status": "ok",
                    "articles": len(articles),
                    "regulation": regulation,
                    "message": note,
                }
            )
    return results


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def crawl_all() -> List[dict]:
    results: List[dict] = []
    urls = _load_sitemap_urls()

    for slug, path, program, title in INFO_PAGES:
        url = f"{BASE}/{path}"
        results.append(_crawl_info_page(url, slug, title, program))

    article_urls = [
        u for u in urls
        if "/artikel/" in u and ARTICLE_KEYWORDS.search(u) and "/en/" not in u
    ][: _MAX_ARTICLE_PAGES]
    for url in article_urls:
        m = re.search(r"/artikel/\d+/([a-z0-9-]+)", url)
        short = m.group(1)[:40] if m else url.split("/")[-1][:40]
        slug = f"bpjs-artikel-{short}"
        title = short.replace("-", " ").title()
        results.append(_crawl_info_page(url, slug, title, None))

    results.extend(_crawl_peraturan_library())
    return results
