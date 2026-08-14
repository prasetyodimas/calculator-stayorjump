// Currency & number formatting for Indonesian Rupiah
export const formatIDR = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatIDRShort = (value) => {
  if (!value || isNaN(value)) return "Rp 0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000)
    return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
  if (abs >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  if (abs >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  return formatIDR(value);
};

export const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(value || 0);

export const parseNumber = (str) => {
  if (typeof str === "number") return str;
  if (!str) return 0;
  const cleaned = String(str).replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
};

export const formatPercent = (v) => `${(v || 0).toFixed(1)}%`;
