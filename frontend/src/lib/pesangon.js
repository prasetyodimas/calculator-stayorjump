/**
 * Perhitungan Pesangon berdasarkan UU Cipta Kerja / PP No. 35 Tahun 2021
 *
 * Struktur:
 *   Total = (UP * multiplier_UP) + (UPMK * multiplier_UPMK) + UPH + UangPisah
 *
 * UP  = Uang Pesangon (berdasarkan masa kerja)
 * UPMK = Uang Penghargaan Masa Kerja
 * UPH  = Uang Penggantian Hak (cuti belum diambil, ongkos pulang, dll)
 */

// Tabel Uang Pesangon (bulan upah) berdasarkan masa kerja
export const uangPesangonBulan = (tahun) => {
  if (tahun < 1) return 1;
  if (tahun < 2) return 2;
  if (tahun < 3) return 3;
  if (tahun < 4) return 4;
  if (tahun < 5) return 5;
  if (tahun < 6) return 6;
  if (tahun < 7) return 7;
  if (tahun < 8) return 8;
  return 9;
};

// Tabel Uang Penghargaan Masa Kerja
export const upmkBulan = (tahun) => {
  if (tahun < 3) return 0;
  if (tahun < 6) return 2;
  if (tahun < 9) return 3;
  if (tahun < 12) return 4;
  if (tahun < 15) return 5;
  if (tahun < 18) return 6;
  if (tahun < 21) return 7;
  if (tahun < 24) return 8;
  return 10;
};

// Alasan PHK & multiplier sesuai PP 35/2021
export const ALASAN_PHK = [
  {
    value: "resign",
    label: "Mengundurkan Diri (Resign)",
    up: 0,
    upmk: 0,
    uph: true,
    uangPisah: true,
    note: "Karyawan hanya berhak UPH + Uang Pisah (bila diatur PK/PP/PKB).",
  },
  {
    value: "efisiensi_rugi",
    label: "Efisiensi Perusahaan (Rugi)",
    up: 0.5,
    upmk: 1,
    uph: true,
    note: "Perusahaan tutup karena rugi 2 tahun berturut-turut.",
  },
  {
    value: "efisiensi_cegah",
    label: "Efisiensi Mencegah Kerugian",
    up: 1,
    upmk: 1,
    uph: true,
    note: "Perusahaan efisiensi untuk mencegah kerugian.",
  },
  {
    value: "merger",
    label: "Merger / Akuisisi (Karyawan Menolak)",
    up: 1,
    upmk: 1,
    uph: true,
    note: "Terjadi perubahan status/kepemilikan perusahaan.",
  },
  {
    value: "pailit",
    label: "Perusahaan Pailit",
    up: 0.5,
    upmk: 1,
    uph: true,
    note: "Perusahaan dinyatakan pailit oleh pengadilan.",
  },
  {
    value: "fm_paksa",
    label: "Force Majeure (Tidak Menyebabkan Tutup)",
    up: 0.75,
    upmk: 1,
    uph: true,
    note: "Keadaan memaksa yang tidak menyebabkan tutup total.",
  },
  {
    value: "fm_tutup",
    label: "Force Majeure (Tutup Permanen)",
    up: 0.5,
    upmk: 1,
    uph: true,
    note: "Bencana / keadaan memaksa berakibat perusahaan tutup.",
  },
  {
    value: "pensiun",
    label: "Pensiun",
    up: 1.75,
    upmk: 1,
    uph: true,
    note: "Karyawan memasuki usia pensiun sesuai perjanjian kerja.",
  },
  {
    value: "meninggal",
    label: "Meninggal Dunia",
    up: 2,
    upmk: 1,
    uph: true,
    note: "Hak diberikan kepada ahli waris karyawan.",
  },
  {
    value: "sakit",
    label: "Sakit Berkepanjangan / Cacat",
    up: 2,
    upmk: 1,
    uph: true,
    note: "Sakit > 12 bulan atau cacat akibat kecelakaan kerja.",
  },
  {
    value: "pelanggaran",
    label: "PHK Karena Pelanggaran Berat",
    up: 0,
    upmk: 0,
    uph: true,
    uangPisah: true,
    note: "Karyawan hanya berhak UPH + Uang Pisah.",
  },
];

export const getAlasanConfig = (value) =>
  ALASAN_PHK.find((a) => a.value === value) || ALASAN_PHK[1];

/**
 * Hitung pesangon lengkap
 * @param {Object} input
 * @param {number} input.gajiPokok - gaji pokok bulanan (Rp)
 * @param {number} input.tunjanganTetap - tunjangan tetap bulanan (Rp)
 * @param {number} input.masaKerjaTahun - tahun bulat
 * @param {number} input.masaKerjaBulan - sisa bulan
 * @param {string} input.alasanPHK - value dari ALASAN_PHK
 * @param {number} input.sisaCutiHari - hari cuti belum diambil
 * @param {number} input.ongkosPulang - biaya pulang (Rp)
 * @param {number} input.uangPisahNominal - uang pisah (Rp)
 */
export const hitungPesangon = (input) => {
  const {
    gajiPokok = 0,
    tunjanganTetap = 0,
    masaKerjaTahun = 0,
    masaKerjaBulan = 0,
    alasanPHK = "efisiensi_cegah",
    sisaCutiHari = 0,
    ongkosPulang = 0,
    uangPisahNominal = 0,
  } = input;

  const upahDasar = gajiPokok + tunjanganTetap;
  const totalTahun = masaKerjaTahun + masaKerjaBulan / 12;

  const config = getAlasanConfig(alasanPHK);

  const upBulan = uangPesangonBulan(totalTahun);
  const upmkBln = upmkBulan(totalTahun);

  const upNominal = upBulan * upahDasar * config.up;
  const upmkNominal = upmkBln * upahDasar * config.upmk;

  // UPH: cuti belum diambil (harian = upah/25) + ongkos pulang
  const upahHarian = upahDasar / 25;
  const uphCuti = sisaCutiHari * upahHarian;
  const uphTotal = config.uph ? uphCuti + ongkosPulang : 0;

  const uangPisah = config.uangPisah ? uangPisahNominal : 0;

  const grandTotal = upNominal + upmkNominal + uphTotal + uangPisah;

  return {
    upahDasar,
    upBulan,
    upmkBln,
    upNominal,
    upmkNominal,
    uphCuti,
    uphOngkos: config.uph ? ongkosPulang : 0,
    uphTotal,
    uangPisah,
    grandTotal,
    config,
    multiplierUP: config.up,
    multiplierUPMK: config.upmk,
  };
};

/**
 * Hitung Worthit Score & rekomendasi
 * Membandingkan tetap stay vs pindah ke kantor baru
 */
export const hitungWorthitScore = (input) => {
  const {
    gajiPokok = 0,
    tunjanganTetap = 0,
    thrKali = 1, // multiplier THR (default 1x gaji)
    bonusTahunan = 0,
    bpjsKes = 0,
    bpjsTK = 0,
    asuransi = 0,
    transportMakan = 0,
    kenaikanTahunan = 8, // %
    gajiKantorBaru = 0,
    kenaikanBaru = 8,
    horizonTahun = 5,
    pesangonTotal = 0,
  } = input;

  const gajiBulanan = gajiPokok + tunjanganTetap;
  const benefitBulananLain = bpjsKes + bpjsTK + asuransi + transportMakan;
  const totalKompensasiBulananSekarang = gajiBulanan + benefitBulananLain;
  const kompensasiTahunanSekarang =
    gajiBulanan * 12 +
    gajiPokok * thrKali +
    bonusTahunan +
    benefitBulananLain * 12;

  // Proyeksi Stay: kompensasi tumbuh dengan kenaikanTahunan %
  let cumStay = 0;
  const stayProjection = [];
  for (let y = 1; y <= horizonTahun; y++) {
    const annual =
      kompensasiTahunanSekarang * Math.pow(1 + kenaikanTahunan / 100, y - 1);
    cumStay += annual;
    stayProjection.push({
      tahun: `Thn ${y}`,
      stay: Math.round(cumStay),
    });
  }
  // Tambahan buffer: pesangon (jika di-PHK di tahun ke-horizon)
  const stayFinal = cumStay + pesangonTotal;

  // Proyeksi Move: pakai gaji baru (asumsi tidak ada pesangon kalau resign dari kantor lama)
  const gajiBaruBulanan = gajiKantorBaru;
  const kompensasiTahunanBaru = gajiBaruBulanan * 13; // gaji + THR
  let cumMove = 0;
  const moveProjection = [];
  for (let y = 1; y <= horizonTahun; y++) {
    const annual =
      kompensasiTahunanBaru * Math.pow(1 + kenaikanBaru / 100, y - 1);
    cumMove += annual;
    moveProjection.push({
      tahun: `Thn ${y}`,
      move: Math.round(cumMove),
    });
  }

  // Merge projections
  const projection = stayProjection.map((s, i) => ({
    tahun: s.tahun,
    Stay: s.stay,
    Pindah: moveProjection[i].move,
  }));

  // Scoring components (bobot):
  // 1) Selisih total 5 tahun (40%)
  // 2) Rasio pesangon vs total tahunan (25%) - severance protection
  // 3) Rasio benefit-lain vs gaji pokok (15%) - benefit density
  // 4) Growth trajectory (20%) - kenaikan tahunan

  let score = 0;

  // 1) Selisih (Stay lebih tinggi = score naik)
  const selisih = stayFinal - cumMove;
  const selisihRasio = selisih / Math.max(cumMove, 1);
  const scoreSelisih = Math.max(0, Math.min(1, 0.5 + selisihRasio * 2));
  score += scoreSelisih * 40;

  // 2) Severance protection
  const bulananSekarang = totalKompensasiBulananSekarang || 1;
  const bulanTertutup = pesangonTotal / bulananSekarang;
  const scoreSeverance = Math.min(1, bulanTertutup / 18); // 18 bulan = full
  score += scoreSeverance * 25;

  // 3) Benefit density
  const benefitRasio = benefitBulananLain / Math.max(gajiPokok, 1);
  const scoreBenefit = Math.min(1, benefitRasio / 0.35);
  score += scoreBenefit * 15;

  // 4) Growth
  const scoreGrowth = Math.min(1, kenaikanTahunan / 10);
  score += scoreGrowth * 20;

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Rekomendasi
  let recommendation = "NEUTRAL";
  let recommendationLabel = "Netral - Pertimbangkan Lagi";
  let recommendationColor = "amber";
  let rationale = "";

  if (gajiKantorBaru <= 0) {
    if (score >= 65) {
      recommendation = "STAY";
      recommendationLabel = "Layak Bertahan";
      recommendationColor = "emerald";
      rationale =
        "Total kompensasi & benefit di kantor sekarang sudah cukup kompetitif. Pesangon UU Cipta Kerja juga memberi buffer finansial yang baik jika terjadi PHK.";
    } else if (score >= 40) {
      recommendation = "NEUTRAL";
      recommendationLabel = "Netral - Evaluasi Kembali";
      recommendationColor = "amber";
      rationale =
        "Kompensasi kantor saat ini rata-rata. Coba negosiasi kenaikan atau tambahan benefit sebelum memutuskan pindah.";
    } else {
      recommendation = "MOVE";
      recommendationLabel = "Pertimbangkan Pindah";
      recommendationColor = "crimson";
      rationale =
        "Benefit total tergolong rendah. Cari peluang lain dengan gaji & benefit yang lebih kompetitif.";
    }
  } else {
    // Ada tawaran baru
    const premi =
      (gajiBaruBulanan - gajiBulanan) / Math.max(gajiBulanan, 1);
    if (score >= 65 && premi < 0.2) {
      recommendation = "STAY";
      recommendationLabel = "Layak Bertahan";
      recommendationColor = "emerald";
      rationale = `Tawaran baru hanya ${(premi * 100).toFixed(
        0,
      )}% lebih tinggi. Belum sebanding dengan pesangon terkumpul & benefit yang sudah Anda dapatkan.`;
    } else if (premi >= 0.3 && score < 60) {
      recommendation = "MOVE";
      recommendationLabel = "Layak Pindah";
      recommendationColor = "crimson";
      rationale = `Tawaran baru ${(premi * 100).toFixed(
        0,
      )}% lebih besar dari gaji sekarang. Meskipun kehilangan pesangon, proyeksi 5 tahun tetap unggul.`;
    } else if (premi >= 0.2) {
      recommendation = "MOVE";
      recommendationLabel = "Cenderung Pindah";
      recommendationColor = "crimson";
      rationale = `Tawaran baru ${(premi * 100).toFixed(
        0,
      )}% lebih tinggi. Pindah masuk akal secara jangka panjang bila benefit baru sepadan.`;
    } else {
      recommendation = "NEUTRAL";
      recommendationLabel = "Perlu Negosiasi";
      recommendationColor = "amber";
      rationale = `Selisih tawaran ${(premi * 100).toFixed(
        0,
      )}% masih di zona abu-abu. Coba negosiasi di kantor lama atau minta counter-offer.`;
    }
  }

  return {
    score,
    recommendation,
    recommendationLabel,
    recommendationColor,
    rationale,
    projection,
    stayFinal,
    moveFinal: cumMove,
    kompensasiTahunanSekarang,
    kompensasiTahunanBaru,
    totalKompensasiBulananSekarang,
    breakdown: {
      scoreSelisih: Math.round(scoreSelisih * 40),
      scoreSeverance: Math.round(scoreSeverance * 25),
      scoreBenefit: Math.round(scoreBenefit * 15),
      scoreGrowth: Math.round(scoreGrowth * 20),
    },
  };
};
