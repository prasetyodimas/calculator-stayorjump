// URL-safe base64 encode/decode + share payload builder
// Note: shared payload sengaja TIDAK mengandung gaji pokok / tunjangan.
// Hanya rasio & satuan bulan upah — jadi orang lain tidak bisa reverse-engineer gaji asli.

export function encodeShare(payload) {
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeShare(str) {
  try {
    let b64 = String(str).replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    if (!parsed || parsed.v !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildSharePayload(result) {
  const { pesangon, worthit, input } = result;
  const monthsEquivalent =
    pesangon.upahDasar > 0 ? pesangon.grandTotal / pesangon.upahDasar : 0;

  // Defensive defaults for older stored records that may lack these fields
  const breakdown = worthit.breakdown || {
    scoreSelisih: 0,
    scoreSeverance: 0,
    scoreBenefit: 0,
    scoreGrowth: 0,
  };
  const rationale =
    worthit.rationale ||
    "Detail analisa tidak tersedia pada versi kalkulasi ini.";

  return {
    v: 1,
    ts: new Date().toISOString(),
    score: worthit.score,
    recommendation: worthit.recommendation,
    recommendationLabel: worthit.recommendationLabel,
    recommendationColor: worthit.recommendationColor,
    rationale,
    masaTahun: input.masaKerjaTahun,
    masaBulan: input.masaKerjaBulan,
    alasanPHK: input.alasanPHK,
    upBulan: pesangon.upBulan,
    upmkBln: pesangon.upmkBln,
    multiplierUP: pesangon.multiplierUP,
    multiplierUPMK: pesangon.multiplierUPMK,
    monthsEquivalent: parseFloat(monthsEquivalent.toFixed(2)),
    breakdown,
    stayVsMovePercent:
      worthit.moveFinal > 0
        ? parseFloat(
            ((worthit.stayFinal / worthit.moveFinal - 1) * 100).toFixed(1),
          )
        : null,
    hasNewOffer: worthit.moveFinal > 0,
  };
}

export function buildShareUrl(result) {
  const payload = buildSharePayload(result);
  const encoded = encodeShare(payload);
  const base =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname}`
      : "";
  return `${base}?s=${encoded}`;
}
