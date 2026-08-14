# StayOrJump - Kalkulator Pesangon & Karir UU Cipta Kerja

## Original Problem Statement
Ide untuk membantu karyawan Indonesia menghitung apakah "worth it" bertahan di kantor
saat ini vs pindah ke kantor baru — berdasarkan perhitungan pesangon Disnaker
(UU Cipta Kerja / PP 35/2021) plus total kompensasi & benefit tahunan. Output berupa
Worthit Score dengan rekomendasi Stay atau Pindah. Aplikasi web dengan UI clean & modern.

## User Choices
- Perhitungan lengkap UU Cipta Kerja / PP 35/2021 (UP + UPMK + UPH) + 11 alasan PHK
- Semua benefits masuk kalkulator: gaji pokok, tunjangan tetap, THR, bonus, BPJS, asuransi, transport/makan, kenaikan tahunan, tawaran kantor baru
- Output: Worthit Score 0-100 + rekomendasi STAY/MOVE/NEUTRAL + breakdown detail
- Riwayat disimpan lokal di IndexedDB browser (tanpa login)
- Tema visual: bebas designer (light + dark mode swiss-modern hijau finansial)

## Architecture
- **Frontend**: React 19 + Tailwind + shadcn/ui + Recharts + lucide-react + sonner
- **State**: Local React state, IndexedDB (native) untuk riwayat
- **Backend**: FastAPI boilerplate (belum digunakan — app frontend-only)
- **Bahasa**: Indonesia

## Implemented (Iter 1 · Feb 2026)
- Kalkulator lengkap dengan 4 section: Gaji & Masa Kerja, Skenario PHK, Benefit Tahunan, Tawaran Kantor Baru
- 11 alasan PHK sesuai PP 35/2021 dengan multiplier UP/UPMK berbeda per alasan
- Formula pesangon lengkap: UP (1-9 bulan), UPMK (0-10 bulan), UPH (cuti + ongkos), Uang Pisah
- Worthit Score algorithm (4 komponen: Selisih 40, Severance 25, Benefit 15, Growth 20)
- Recommendation engine: STAY / NEUTRAL / MOVE dengan rationale kontekstual
- Worthit Meter (SVG circular gauge dengan animasi)
- Breakdown grid pesangon dengan formula visual
- Proyeksi chart Recharts (5 tahun kumulatif, Stay vs Pindah)
- Riwayat IndexedDB (simpan, muat ulang, hapus per item, clear all)
- Panduan Hukum tab dengan tabel UP/UPMK + accordion 11 alasan PHK
- Dark/light mode toggle + noise texture + fade-up animations
- Print/PDF export (@media print)
- Responsive mobile-friendly (tested 375px)

## Test Status
- Iteration 1: 100% pass frontend testing (semua flow works: input formatting, calculation, worthit score, history save/load, tabs, theme toggle, mobile viewport)

## Backlog / Next Actions
- P1: Voice input untuk data gaji (accessibility)
- P1: Compare 2 riwayat side-by-side
- P2: Share hasil via link (URL-encoded state)
- P2: Kalkulator BPJS Ketenagakerjaan (JHT/JP) tersendiri
- P2: PDF export via jspdf (bukan sekadar window.print)
- P3: Backend endpoint opsional untuk sync riwayat cross-device (butuh auth)
