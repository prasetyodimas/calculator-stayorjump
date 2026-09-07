# StayOrJump — Kalkulator Pesangon & Karir (UU Cipta Kerja)

Aplikasi web untuk membantu karyawan Indonesia memutuskan **bertahan (Stay)** atau
**pindah kerja (Jump)**, dengan menghitung:

- Pesangon sesuai **UU Cipta Kerja / PP 35/2021** (UP + UPMK + UPH + Uang Pisah), 11 skenario alasan PHK
- Estimasi **BPJS Ketenagakerjaan** — JHT (PP 46/2015) & JP (PP 45/2015)
- **Worthit Score 0–100** + rekomendasi `STAY` / `NEUTRAL` / `MOVE` dengan rationale
- Proyeksi kumulatif 5 tahun (Stay vs Pindah), riwayat lokal, share via link/QR

Bahasa antarmuka: **Indonesia**. Semua data pengguna disimpan **di browser**, tidak ada login.

---

## 1. Cara Menjalankan Secara Lokal

### Prasyarat

| Tool | Versi | Catatan |
| --- | --- | --- |
| Node.js | **18 atau 20 LTS** | wajib (React 19 + react-scripts 5). npm sudah otomatis terpasang bersama Node |
| Yarn | 1.22.x (classic) | **direkomendasikan** — sesuai `packageManager` & `yarn.lock` repo ini |
| npm | 9.x / 10.x | alternatif Yarn (lihat catatan `resolutions` di bawah) |
| Python | 3.11+ | **opsional**, hanya untuk backend |
| MongoDB | 6.x/7.x | **opsional**, hanya untuk backend |

Cek instalasi:

```bash
node -v      # v20.x   (kalau belum ada: nvm install 20 && nvm use 20)
npm -v       # 10.x
yarn -v      # 1.22.x  (kalau belum ada: npm install -g yarn)
```

### Jalankan frontend (cukup ini saja untuk memakai semua fitur)

Semua perintah dijalankan **dari dalam folder `frontend/`**, bukan dari root repo —
`package.json` dan `yarn.lock` yang asli ada di sana (`yarn.lock` di root hanya stub kosong).

#### Opsi A — Yarn (direkomendasikan)

```bash
cd frontend
yarn install
yarn start
```

#### Opsi B — npm

```bash
cd frontend
npm install
npm start
```

> **Kenapa Yarn lebih disarankan?** `frontend/package.json` mendeklarasikan
> `"packageManager": "yarn@1.22.22"` dan memakai field **`resolutions`** (± 40 paket
> dipin untuk alasan keamanan, mis. `nth-check`, `webpack-dev-server`, `serialize-javascript`).
> Field `resolutions` **hanya dibaca Yarn** — npm mengabaikannya dan memakai `overrides`,
> jadi `npm install` akan melewati pin-pin tersebut dan menghasilkan dependency tree
> yang berbeda. npm tetap bisa dipakai untuk development, tapi Yarn lebih aman & sesuai lockfile.

Setelah `start` berjalan, aplikasi otomatis terbuka di browser pada
**<http://localhost:3000>** dengan hot-reload aktif — simpan file, halaman refresh sendiri.

> **Penting:** kalkulator ini **frontend-only**. Seluruh perhitungan pesangon, JHT/JP,
> Worthit Score, riwayat, dan share dijalankan di browser. Anda **tidak perlu**
> menjalankan backend atau MongoDB untuk memakai aplikasi.

#### Script yang tersedia

Diambil dari `scripts` di `frontend/package.json` — build system-nya **craco**
(Create React App Configuration Override), bukan `react-scripts` langsung:

| Script | Yarn | npm | Fungsi |
| --- | --- | --- | --- |
| `start` | `yarn start` | `npm start` | `craco start` — dev server + hot reload di port 3000 |
| `build` | `yarn build` | `npm run build` | `craco build` — production build ke `frontend/build/` |
| `test` | `yarn test` | `npm test` | `craco test` — test runner CRA/Jest (watch mode) |

Contoh penggunaan:

```bash
# development
yarn start                 # atau: npm start
PORT=3001 yarn start       # ganti port kalau 3000 dipakai

# production build + preview hasilnya
yarn build                 # atau: npm run build
npx serve -s build         # cek hasil build di http://localhost:3000

# test
yarn test                  # atau: npm test
CI=true yarn test          # sekali jalan, tanpa watch mode (untuk CI)
```

### Jalankan backend (opsional — boilerplate FastAPI)

Backend saat ini **belum dipakai oleh frontend**. Jalankan hanya jika Anda ingin
mengembangkan fitur server-side (mis. sync riwayat cross-device).

1. Pastikan MongoDB hidup:

   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   # atau Docker
   docker run -d --name mongo -p 27017:27017 mongo:7
   ```

2. Buat `backend/.env` (file ini di-gitignore, harus dibuat manual):

   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=stayorjump
   CORS_ORIGINS=http://localhost:3000
   ```

   `MONGO_URL` dan `DB_NAME` **wajib** — `server.py` membacanya via `os.environ[...]`
   dan akan crash saat startup kalau tidak ada.

3. Install dependency & jalankan:

   ```bash
   cd backend
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn server:app --reload --port 8001
   ```

   Cek: `curl http://localhost:8001/api/` → `{"message":"Hello World"}`
   Dokumentasi otomatis: <http://localhost:8001/docs>

> Catatan: `requirements.txt` berisi paket `emergentintegrations==0.2.0` yang berasal dari
> generator (Emergent) dan mungkin tidak tersedia di PyPI publik. Kalau `pip install`
> gagal di baris itu, hapus/komentari baris tersebut — paket ini tidak diimpor oleh
> `server.py`.

### Troubleshooting

| Gejala | Penyebab / Solusi |
| --- | --- |
| `command not found: node` | Node belum terpasang. Install via [nvm](https://github.com/nvm-sh/nvm): `nvm install 20 && nvm use 20` |
| Port 3000 dipakai | `PORT=3001 yarn start` |
| `KeyError: 'MONGO_URL'` saat start backend | `backend/.env` belum dibuat (lihat langkah 2) |
| Riwayat hilang | Riwayat ada di IndexedDB per-browser/profil; mode incognito & clear site data akan menghapusnya |
| `yarn install` lambat/gagal | Gunakan Yarn 1 (bukan Yarn 2+), dan hapus `node_modules` + retry |

---

## 2. System Design

### 2.1 Arsitektur tingkat atas

```text
┌───────────────────────────────────────────────────────────────┐
│                        BROWSER                                │
│                                                               │
│  React 19 SPA (CRA + craco)                                   │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────────┐   │
│  │  App.js     │──▶│ lib/pesangon │   │ lib/bpjstk        │   │
│  │  (state hub)│   │  (pure calc) │   │  (pure calc)      │   │
│  └──────┬──────┘   └──────────────┘   └───────────────────┘   │
│         │                                                     │
│         ├──▶ lib/idb.js  ──────▶ IndexedDB "stayorjump-db"    │
│         ├──▶ lib/share.js ─────▶ URL ?s=<base64url payload>   │
│         └──▶ theme        ─────▶ localStorage                 │
└───────────────────────────────────────────────────────────────┘
                              ╎
                              ╎ (belum terhubung)
                              ▼
        ┌──────────────────────────────────────────┐
        │  FastAPI  /api/*   ──▶  MongoDB (motor)  │
        │  boilerplate: GET /, GET|POST /status    │
        └──────────────────────────────────────────┘
```

Keputusan desain utama: **zero-backend, zero-auth, privacy-first**. Data gaji adalah
data sensitif, jadi tidak pernah dikirim ke server — semua kalkulasi dan penyimpanan
terjadi di sisi klien.

### 2.2 Tech stack

| Layer | Teknologi |
| --- | --- |
| UI | React 19, Tailwind CSS 3, shadcn/ui (Radix primitives), lucide-react |
| Chart | Recharts 3 |
| Notifikasi | sonner |
| Build | CRA 5 + craco (alias `@` → `src/`, visual-edits plugin di dev) |
| State | React `useState` lokal di `App.js` (tanpa Redux/Zustand) |
| Persistensi | IndexedDB (wrapper native, tanpa library), localStorage untuk tema |
| Backend (opsional) | FastAPI, Motor (async MongoDB), Pydantic v2 |

### 2.3 Struktur folder

```text
.
├── frontend/
│   ├── src/
│   │   ├── App.js                 # root: state, tab, orkestrasi kalkulasi
│   │   ├── components/
│   │   │   ├── Landing.jsx        # halaman marketing / hero
│   │   │   ├── Header.jsx         # brand, CTA, toggle dark mode
│   │   │   ├── InputForm.jsx      # 4 section input (gaji, PHK, benefit, tawaran baru)
│   │   │   ├── ResultsPanel.jsx   # kontainer hasil + aksi (save/print/share)
│   │   │   ├── WorthitMeter.jsx   # gauge SVG animasi 0–100
│   │   │   ├── BreakdownGrid.jsx  # rincian UP/UPMK/UPH + formula
│   │   │   ├── ProjectionChart.jsx# proyeksi 5 tahun Stay vs Pindah
│   │   │   ├── BpjsCalculator.jsx # kalkulator JHT & JP
│   │   │   ├── HistoryList.jsx    # riwayat IndexedDB
│   │   │   ├── CompareDialog.jsx  # bandingkan 2 riwayat
│   │   │   ├── ShareDialog.jsx    # link + QR code
│   │   │   ├── SharedView.jsx     # tampilan read-only dari ?s=
│   │   │   ├── LegalGuide.jsx     # tabel UP/UPMK + 11 alasan PHK
│   │   │   └── ui/                # komponen shadcn/ui (generated)
│   │   ├── lib/
│   │   │   ├── pesangon.js        # mesin perhitungan pesangon + Worthit Score
│   │   │   ├── bpjstk.js          # perhitungan JHT & JP
│   │   │   ├── idb.js             # wrapper IndexedDB
│   │   │   ├── share.js           # encode/decode payload share
│   │   │   ├── format.js          # format Rupiah / angka id-ID
│   │   │   └── utils.js           # cn() tailwind-merge
│   │   └── constants/testIds/     # data-testid terpusat untuk testing
│   ├── craco.config.js
│   └── tailwind.config.js
├── backend/
│   ├── server.py                  # FastAPI app, router /api
│   ├── requirements.txt
│   └── pytest.ini                 # xdist: -n 2 --dist loadscope (jangan diubah)
├── memory/PRD.md                  # product requirement & backlog
├── design_guidelines.json         # token desain (warna, tipografi, spacing)
├── test_reports/                  # hasil test per iterasi (JSON)
└── test_result.md                 # ringkasan status test
```

### 2.4 Alur data (calculation pipeline)

```text
InputForm (controlled)
   └─▶ App.state (satu objek flat: gajiPokok, masaKerja, alasanPHK, benefit, tawaranBaru…)
          │
          │  klik "Hitung"  → validasi (gajiPokok ≥ Rp 100.000)
          ▼
   hitungPesangon(state)                  → { UP, UPMK, UPH, uangPisah, grandTotal }
   hitungWorthitScore({...state,          → { score, recommendation, breakdown,
                        pesangonTotal })       stayFinal, moveFinal, rationale }
          │
          ▼
   App.result = { pesangon, worthit, input }
          │
          ├─▶ ResultsPanel → WorthitMeter / BreakdownGrid / ProjectionChart
          ├─▶ handleSave  → idb.addCalculation(record)     (riwayat)
          ├─▶ handleShare → share.buildShareUrl(result)    (link + QR)
          └─▶ handlePrint → window.print()                 (@media print → PDF)
```

Semua fungsi di `lib/` adalah **fungsi murni (pure)** tanpa efek samping —
mudah diuji dan tidak bergantung pada React.

### 2.5 Model perhitungan

**Pesangon (`lib/pesangon.js`)**

```text
Total = (UP × multiplier_UP) + (UPMK × multiplier_UPMK) + UPH + UangPisah
```

- **UP** (Uang Pesangon): tabel masa kerja, 1–9 bulan upah
- **UPMK** (Uang Penghargaan Masa Kerja): 0–10 bulan upah, mulai dari masa kerja ≥ 3 tahun
- **UPH** (Uang Penggantian Hak): sisa cuti + ongkos pulang
- **Upah** = gaji pokok + tunjangan tetap
- **multiplier** berbeda per alasan PHK (11 skenario di `ALASAN_PHK`), mis. efisiensi
  karena rugi `0,5×`, pensiun `1,75×`, meninggal/cacat `2×`; sedangkan `resign` dan
  `pelanggaran berat` mendapat `0×` UP/UPMK — hanya UPH + Uang Pisah

**Worthit Score (0–100)** — bobot 4 komponen:

| Komponen | Bobot |
| --- | --- |
| Selisih total kompensasi (stay vs tawaran baru) | 40 |
| Nilai pesangon (opportunity cost keluar) | 25 |
| Kualitas benefit tahunan (THR, bonus, BPJS, asuransi, transport) | 15 |
| Growth (kenaikan tahunan lama vs baru) | 20 |

Score dipetakan ke rekomendasi `STAY` / `NEUTRAL` / `MOVE` beserta rationale kontekstual.

**JHT & JP (`lib/bpjstk.js`)** — konstanta iuran: JHT 5,7% (pengusaha 3,7% + pekerja 2%),
JP 3% (pengusaha 2% + pekerja 1%). Manfaat Pensiun Bulanan = `1% × masa iur × rata-rata upah`,
dengan syarat minimum 15 tahun masa iur (di bawah itu → lump sum).

### 2.6 Persistensi & privasi

- **Riwayat**: IndexedDB `stayorjump-db` v1, object store `calculations`
  (`keyPath: "id"`, index `createdAt`). Operasi: add, list, delete per item, clear all.
- **Tema**: `localStorage["theme"]` (`light` | `dark`), diterapkan sebagai class `dark`
  pada `<html>`.
- **Share link**: payload di-encode base64url ke query `?s=`. Secara sengaja payload
  **tidak memuat gaji pokok / tunjangan** — hanya rasio dan satuan "bulan upah", sehingga
  penerima link tidak bisa merekonstruksi gaji asli. Payload diberi versi (`v: 1`);
  versi tak dikenal → decode ditolak.
- **Deep link**: `?app=1` membuka langsung tampilan kalkulator (skip landing).

### 2.7 Backend (status: boilerplate)

`backend/server.py` menyediakan:

| Method | Endpoint | Fungsi |
| --- | --- | --- |
| GET | `/api/` | health check sederhana |
| POST | `/api/status` | simpan `StatusCheck` ke MongoDB |
| GET | `/api/status` | list `StatusCheck` (maks 1000) |

Semua route diberi prefix `/api` lewat `APIRouter` — konvensi ini memudahkan reverse
proxy memisahkan API dari static frontend. CORS origin dibaca dari `CORS_ORIGINS`
(comma-separated, default `*`).

Rencana pemakaian backend ada di backlog (`memory/PRD.md`): sync riwayat cross-device,
yang akan membutuhkan autentikasi.

---

## 3. Testing

```bash
# frontend
cd frontend && yarn test      # atau: npm test

# backend
cd backend && pytest        # konfigurasi xdist sudah di pytest.ini, jangan tambah flag -n
```

Riwayat hasil testing tiap iterasi ada di `test_reports/*.json` dan ringkasannya di
`test_result.md`. Komponen memakai `data-testid` yang didefinisikan terpusat di
`frontend/src/constants/testIds/`.

---

## 4. Build & Deploy

```bash
cd frontend
yarn build                    # atau: npm run build
# output: frontend/build/
```

Karena aplikasi frontend-only, `frontend/build/` bisa langsung dilayani sebagai static
site (Netlify, Vercel, Cloudflare Pages, Nginx). Jika nanti backend dipakai, arahkan
`/api/*` ke service FastAPI dan set `CORS_ORIGINS` ke domain produksi.

---

## 5. Disclaimer

Hasil perhitungan adalah **estimasi** berdasarkan PP 35/2021 dan peraturan BPJS yang
berlaku, bukan nasihat hukum atau keuangan. Angka final pesangon dapat berbeda
tergantung Perjanjian Kerja / PKB / putusan penyelesaian hubungan industrial.
