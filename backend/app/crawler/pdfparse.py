"""Ekstraksi pasal dari PDF peraturan (heuristik berbasis regex)."""

import io
import logging
import re
from typing import List, Optional

logger = logging.getLogger(__name__)

_MAX_ARTICLES = 400
_PASAL_RE = re.compile(r"^\s*Pasal\s+(\d+[a-zA-Z]?(?:\s*\(\d+\))?)\s*$", re.MULTILINE)
_PASAL_INLINE_RE = re.compile(r"\bPasal\s+(\d+[a-zA-Z]?)\b")
_BAB_RE = re.compile(r"^\s*BAB\s+([IVXLCDM]+)\b[^\n]*\n([^\n]*)", re.MULTILINE)


def extract_text_from_pdf(pdf_bytes: bytes) -> Optional[str]:
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(pdf_bytes))
        parts = []
        for page in reader.pages:
            try:
                parts.append(page.extract_text() or "")
            except Exception as exc:  # noqa: BLE001
                logger.debug("Gagal ekstrak satu halaman PDF: %s", exc)
        text = "\n".join(parts)
        return text if text.strip() else None
    except Exception as exc:  # noqa: BLE001
        logger.warning("Gagal membaca PDF: %s", exc)
        return None


def parse_articles(text: str, source_url: Optional[str] = None) -> List[dict]:
    """Pecah teks peraturan menjadi daftar pasal.

    Mengembalikan list berisi {"pasal", "bab", "content", "source_url"}.
    """
    if not text:
        return []

    # Dua pola umum layout PDF: "Pasal\n156" (nomor di baris berikutnya)
    # dan "Pasal 156" satu baris. Normalisasi pola pertama.
    normalized = re.sub(r"[ \t]*\bPasal[ \t]*\n[ \t]*(\d+[a-zA-Z]?)\b", r"Pasal \1", text)

    markers = list(_PASAL_INLINE_RE.finditer(normalized))
    if not markers:
        return []

    bab_matches = list(_BAB_RE.finditer(normalized))

    def current_bab(pos: int) -> Optional[str]:
        active = None
        for m in bab_matches:
            if m.start() <= pos:
                active = f"BAB {m.group(1)}"
            else:
                break
        return active

    articles: List[dict] = []
    seen: set[str] = set()
    for i, m in enumerate(markers):
        pasal_no = m.group(1)
        if pasal_no in seen:
            continue  # hindari duplikat dari daftar isi / rujukan silang
        start = m.end()
        end = markers[i + 1].start() if i + 1 < len(markers) else len(normalized)
        content = re.sub(r"\s+", " ", normalized[start:end]).strip()
        # Buang pasal "hantu": isi terlalu pendek biasanya hanya rujukan di teks lain
        if len(content) < 30 or len(content) > 20000:
            continue
        seen.add(pasal_no)
        articles.append(
            {
                "pasal": pasal_no,
                "bab": current_bab(m.start()),
                "title": None,
                "content": content[:8000],
                "programs": [],
                "source_url": source_url,
            }
        )
        if len(articles) >= _MAX_ARTICLES:
            break
    return articles
