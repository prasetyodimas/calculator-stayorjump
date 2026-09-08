# Backend (API Regulasi & Crawler Ketenagakerjaan)

## Perintah

```bash
cd backend
source .venv/bin/activate          # venv ada di backend/.venv
uvicorn server:app --port 8001     # jalankan API
pytest -n 0 tests/ -q              # test (pytest.ini memaksa -n 2; gunakan -n 0 untuk serial)
```

## Catatan penting

- `backend/.env` di-gitignore; isi: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`.
- Jika MongoDB tidak hidup, `app/db.py` otomatis fallback ke penyimpanan
  in-memory (data hilang saat restart) — aman untuk dev.
- Saat koleksi `regulations` kosong, data seed (`app/seed_data.py`) dimuat
  otomatis saat startup.
- Struktur: `server.py` (entry), `app/db.py` (storage), `app/models.py`,
  `app/routers/` (REST API), `app/crawler/` (bpk.py, bpjs_tk.py, pdfparse.py,
  service.py).
- Jangan `from app.db import db` — nilai `db` None saat import; selalu pakai
  `get_db()` dan `is_using_mongodb()` (runtime accessor).
- Crawler berjalan sebagai background task; scope: `all | bpk | bpjs_tk | seed`.
