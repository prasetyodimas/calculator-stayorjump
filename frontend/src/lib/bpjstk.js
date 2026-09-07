/**
 * Kalkulator BPJS Ketenagakerjaan — JHT (Jaminan Hari Tua) & JP (Jaminan Pensiun)
 *
 * Referensi regulasi:
 * - JHT: PP 46/2015 jo. PP 60/2015 (iuran 5,7% upah — pengusaha 3,7%, pekerja 2%)
 *        Manfaat = akumulasi iuran + hasil pengembangan.
 *        Bisa dicairkan penuh saat: usia 56, PHK, cacat total, meninggal, WNI keluar negeri permanen.
 * - JP: PP 45/2015. Iuran 3% (pengusaha 2%, pekerja 1%) dengan batas upah tertentu.
 *       Manfaat pensiun bulanan (MPB) = 1% × Masa Iur (tahun) × Rata-rata Upah Tertimbang.
 *       Syarat MPB minimal 15 tahun masa iur; kalau tidak, dapat manfaat lump sum.
 *       Nilai minimum/maksimum manfaat bulanan disesuaikan tahunan oleh pemerintah.
 */

// Konstanta 2026 (dapat di-update via env / config di masa depan)
export const JHT_RATE_PENGUSAHA = 0.037; // 3,7%
export const JHT_RATE_PEKERJA = 0.02; // 2,0%
export const JHT_RATE_TOTAL = JHT_RATE_PENGUSAHA + JHT_RATE_PEKERJA; // 5,7%

export const JP_RATE_PENGUSAHA = 0.02; // 2%
export const JP_RATE_PEKERJA = 0.01; // 1%
export const JP_RATE_TOTAL = JP_RATE_PENGUSAHA + JP_RATE_PEKERJA; // 3%

export const JP_UPAH_MAKSIMAL_2026 = 10_547_400; // batas upah JP (nominal 2026, update periodik BPJS TK)
export const JP_MANFAAT_MIN = 393_500; // manfaat pensiun minimum bulanan (2026 nominal)
export const JP_MANFAAT_MAX = 4_718_200; // manfaat pensiun maksimum bulanan (2026 nominal)

export const USIA_KLAIM_JHT = 56;
export const USIA_PENSIUN_JP = 58; // target periodik naik 1 thn tiap 3 thn; 2026 asumsi 58

/**
 * Hitung akumulasi JHT (Jaminan Hari Tua)
 * Menggunakan compounding tahunan dengan kenaikan gaji tahunan.
 *
 * @param {Object} input
 * @param {number} input.gajiPokok - upah bulanan sekarang (Rp)
 * @param {number} input.usiaSekarang - umur saat ini
 * @param {number} input.usiaKlaim - target usia klaim JHT (default 56)
 * @param {number} input.masaIurTerkumpul - saldo JHT sudah ada (Rp) — opsional
 * @param {number} input.kenaikanGajiPct - kenaikan gaji tahunan (%)
 * @param {number} input.hasilPengembanganPct - imbal hasil JHT tahunan (%)
 */
export function hitungJHT(input) {
  const {
    gajiPokok = 0,
    usiaSekarang = 25,
    usiaKlaim = USIA_KLAIM_JHT,
    saldoAwal = 0,
    kenaikanGajiPct = 8,
    hasilPengembanganPct = 5.5,
  } = input;

  const tahunKerja = Math.max(0, usiaKlaim - usiaSekarang);
  const rGaji = 1 + kenaikanGajiPct / 100;
  const rInv = 1 + hasilPengembanganPct / 100;

  let saldo = saldoAwal;
  let totalIuranPekerja = 0;
  let totalIuranPengusaha = 0;
  let gajiTahunIni = gajiPokok;
  const timeline = [];

  // Start-of-year snapshot
  timeline.push({
    tahun: 0,
    usia: usiaSekarang,
    gaji: gajiTahunIni,
    saldo: Math.round(saldo),
    iuranTahunan: 0,
  });

  for (let y = 1; y <= tahunKerja; y++) {
    const iuranBulananPekerja = gajiTahunIni * JHT_RATE_PEKERJA;
    const iuranBulananPengusaha = gajiTahunIni * JHT_RATE_PENGUSAHA;
    const iuranBulananTotal = iuranBulananPekerja + iuranBulananPengusaha;
    const iuranTahunan = iuranBulananTotal * 12;

    // Iuran ditambahkan bulanan → aproksimasi: total iuran tahun berjalan
    // dibayarkan mid-year lalu di-compound.
    saldo = saldo * rInv + iuranTahunan * Math.pow(rInv, 0.5);

    totalIuranPekerja += iuranBulananPekerja * 12;
    totalIuranPengusaha += iuranBulananPengusaha * 12;

    timeline.push({
      tahun: y,
      usia: usiaSekarang + y,
      gaji: Math.round(gajiTahunIni),
      saldo: Math.round(saldo),
      iuranTahunan: Math.round(iuranTahunan),
    });

    gajiTahunIni = gajiTahunIni * rGaji;
  }

  const totalIuran = totalIuranPekerja + totalIuranPengusaha;
  const hasilPengembangan = saldo - saldoAwal - totalIuran;

  return {
    tahunKerja,
    saldoAkhir: Math.round(saldo),
    totalIuran: Math.round(totalIuran),
    totalIuranPekerja: Math.round(totalIuranPekerja),
    totalIuranPengusaha: Math.round(totalIuranPengusaha),
    hasilPengembangan: Math.round(hasilPengembangan),
    iuranBulananSekarang: Math.round(gajiPokok * JHT_RATE_TOTAL),
    iuranBulananPekerjaSekarang: Math.round(gajiPokok * JHT_RATE_PEKERJA),
    timeline,
    gajiAkhir: Math.round(gajiTahunIni),
  };
}

/**
 * Hitung Jaminan Pensiun (JP)
 * Manfaat bulanan formula: 1% × Masa Iur (tahun, max 40) × Rata-rata Upah Tertimbang.
 * Kalau masa iur < 15 tahun → lump sum (akumulasi iuran + bunga).
 */
export function hitungJP(input) {
  const {
    gajiPokok = 0,
    usiaSekarang = 25,
    usiaPensiun = USIA_PENSIUN_JP,
    masaIurTerkumpul = 0,
    kenaikanGajiPct = 8,
    hasilPengembanganPct = 5.5,
  } = input;

  const tahunKerja = Math.max(0, usiaPensiun - usiaSekarang);
  const masaIurTotal = tahunKerja + masaIurTerkumpul;
  const masaIurFormula = Math.min(40, masaIurTotal); // dibatasi 40 tahun

  const rGaji = 1 + kenaikanGajiPct / 100;
  const rInv = 1 + hasilPengembanganPct / 100;

  let saldoLumpSum = 0;
  let totalIuranPekerja = 0;
  let totalIuranPengusaha = 0;
  let gajiTahunIni = gajiPokok;
  let sumUpahIkut = 0;
  let hitungTahun = 0;

  for (let y = 1; y <= tahunKerja; y++) {
    const upahIkut = Math.min(gajiTahunIni, JP_UPAH_MAKSIMAL_2026);
    const iuranBulananPekerja = upahIkut * JP_RATE_PEKERJA;
    const iuranBulananPengusaha = upahIkut * JP_RATE_PENGUSAHA;
    const iuranTahunan = (iuranBulananPekerja + iuranBulananPengusaha) * 12;

    saldoLumpSum = saldoLumpSum * rInv + iuranTahunan * Math.pow(rInv, 0.5);
    totalIuranPekerja += iuranBulananPekerja * 12;
    totalIuranPengusaha += iuranBulananPengusaha * 12;
    sumUpahIkut += upahIkut;
    hitungTahun += 1;

    gajiTahunIni = gajiTahunIni * rGaji;
  }

  const rataRataUpah = hitungTahun > 0 ? sumUpahIkut / hitungTahun : 0;
  let manfaatBulanan = 0;
  let eligibleMPB = false;
  let lumpSumAkumulatif = Math.round(saldoLumpSum);

  if (masaIurTotal >= 15) {
    eligibleMPB = true;
    manfaatBulanan = 0.01 * masaIurFormula * rataRataUpah;
    manfaatBulanan = Math.max(
      JP_MANFAAT_MIN,
      Math.min(JP_MANFAAT_MAX, manfaatBulanan),
    );
  }

  return {
    tahunKerja,
    masaIurTotal,
    eligibleMPB,
    manfaatBulanan: Math.round(manfaatBulanan),
    lumpSumAkumulatif,
    totalIuran: Math.round(totalIuranPekerja + totalIuranPengusaha),
    totalIuranPekerja: Math.round(totalIuranPekerja),
    totalIuranPengusaha: Math.round(totalIuranPengusaha),
    rataRataUpah: Math.round(rataRataUpah),
    iuranBulananSekarang: Math.round(
      Math.min(gajiPokok, JP_UPAH_MAKSIMAL_2026) * JP_RATE_TOTAL,
    ),
    iuranBulananPekerjaSekarang: Math.round(
      Math.min(gajiPokok, JP_UPAH_MAKSIMAL_2026) * JP_RATE_PEKERJA,
    ),
    upahDiKapKah: gajiPokok > JP_UPAH_MAKSIMAL_2026,
  };
}
