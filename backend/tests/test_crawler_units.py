import asyncio

from app.crawler.pdfparse import parse_articles
from app.crawler.bpjs_tk import _slugify_number

SAMPLE = """
BAB VI
CUTI

Pasal 79
(1) Waktu istirahat sebagaimana dimaksud dalam Pasal 77 ayat (2) meliputi:
a. istirahat antara jam kerja;
b. istirahat mingguan.

Pasal 80
Pekerja/buruh yang berpuasa tidak dapat dipekerjakan pada waktu makan sahur,
kecuali mereka yang bersedia bekerja.

Pasal 156
(1) Dalam hal terjadi pemutusan hubungan kerja, pengusaha wajib membayar uang
pesangon dan/atau uang penghargaan masa kerja.
"""


def test_parse_articles_basic():
    arts = parse_articles(SAMPLE)
    by_pasal = {a["pasal"]: a for a in arts}
    assert set(by_pasal) == {"79", "80", "156"}
    assert "pesangon" in by_pasal["156"]["content"]
    assert by_pasal["79"]["bab"] == "BAB VI"


def test_parse_articles_multiline_number():
    text = "Pasal\n40\nDalam hal terjadi pemutusan hubungan kerja, pengusaha " \
           "wajib membayar uang pesangon."
    arts = parse_articles(text)
    assert arts and arts[0]["pasal"] == "40"


def test_parse_articles_empty_and_noise():
    assert parse_articles("") == []
    assert parse_articles("tidak ada pasal di sini") == []
    # rujukan silang singkat harus dibuang
    arts = parse_articles("Pasal 5\nlihat Pasal 7.\n")
    assert arts == []


def test_slugify_number():
    t, slug, year, programs = _slugify_number(
        "Peraturan Pemerintah Nomor 44 Tahun 2015 tentang Penyelenggaraan "
        "Program Jaminan Kecelakaan Kerja dan Jaminan Kematian", "x"
    )
    assert t == "PP" and slug == "pp-44-2015" and year == 2015
    assert "JKK" in programs and "JKM" in programs

    t, slug, year, _ = _slugify_number(
        "Undang-Undang Republik Indonesia Nomor 24 Tahun 2011 Tentang Badan "
        "Penyelenggara Jaminan Sosial", "x"
    )
    assert t == "UU" and slug == "uu-24-2011" and year == 2011


def test_memory_collection_filters():
    asyncio.run(_memory_collection_scenario())


async def _memory_collection_scenario():
    from app.db import MemoryCollection

    col = MemoryCollection("regulations")
    await col.insert_one({"slug": "a", "programs": ["JHT"], "year": 2015})
    await col.insert_one({"slug": "b", "programs": ["PHK", "PESANGON"], "year": 2021})

    assert await col.count_documents({"programs": "JHT"}) == 1
    assert await col.count_documents({"programs": {"$in": ["PESANGON", "JHT"]}}) == 2

    found = await col.find_one({"slug": "b"})
    assert found["year"] == 2021

    await col.update_one({"slug": "c"}, {"$set": {"slug": "c", "programs": ["JP"], "year": 2015}}, upsert=True)
    assert await col.count_documents({}) == 3
