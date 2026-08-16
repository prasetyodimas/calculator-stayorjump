import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";
import { getAlasanConfig } from "@/lib/pesangon";
import { ArrowUp, ArrowDown, Minus, Scale, Sparkles } from "lucide-react";

const colorClass = (color) => {
  if (color === "emerald")
    return "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400";
  if (color === "crimson")
    return "border-red-500/40 bg-red-500/5 text-red-700 dark:text-red-400";
  return "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400";
};

const DeltaIndicator = ({ a, b, higherIsBetter = true, unit = "" }) => {
  const diff = a - b;
  if (diff === 0)
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> sama
      </div>
    );
  const positive = higherIsBetter ? diff > 0 : diff < 0;
  const Icon = diff > 0 ? ArrowUp : ArrowDown;
  return (
    <div
      className={`flex items-center gap-1 text-xs font-semibold ${
        positive ? "text-emerald-600" : "text-red-600"
      }`}
    >
      <Icon className="h-3 w-3" />
      {diff > 0 ? "+" : ""}
      {typeof diff === "number" && Math.abs(diff) > 1000
        ? formatIDR(Math.abs(diff))
        : `${Math.abs(diff).toFixed(1)}${unit}`}
    </div>
  );
};

const Column = ({ item, other, side }) => {
  const isA = side === "A";
  const alasan = getAlasanConfig(item.input.alasanPHK);
  const scoreDelta = item.worthit.score - other.worthit.score;
  const pesangonDelta = item.pesangon.grandTotal - other.pesangon.grandTotal;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Skenario {side}
          </div>
          <div className="text-sm font-semibold">{item.label}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">
            {new Date(item.createdAt).toLocaleDateString("id-ID")}
          </div>
        </div>
        <Badge
          variant="outline"
          className={`${colorClass(item.worthit.recommendationColor)} font-bold text-xs`}
        >
          {item.worthit.recommendation}
        </Badge>
      </div>

      <div
        className={`rounded-xl border-2 p-4 ${colorClass(item.worthit.recommendationColor)}`}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold">
              Worthit Score
            </div>
            <div className="text-4xl font-extrabold num" data-testid={`compare-score-${side}`}>
              {item.worthit.score}
            </div>
          </div>
          <DeltaIndicator a={item.worthit.score} b={other.worthit.score} unit="" />
        </div>
        <div className="text-sm font-semibold mt-1">
          {item.worthit.recommendationLabel}
        </div>
      </div>

      <div className="rounded-xl border border-border p-4 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">
            Total Pesangon
          </div>
          <div
            className="text-xl font-extrabold num"
            data-testid={`compare-pesangon-${side}`}
          >
            {formatIDR(item.pesangon.grandTotal)}
          </div>
          <DeltaIndicator
            a={item.pesangon.grandTotal}
            b={other.pesangon.grandTotal}
          />
        </div>

        <div className="border-t border-border pt-3 space-y-1.5 text-sm">
          <Row label="Upah dasar" value={formatIDR(item.pesangon.upahDasar)} />
          <Row
            label="Masa kerja"
            value={`${item.input.masaKerjaTahun}t ${item.input.masaKerjaBulan}b`}
          />
          <Row
            label="Alasan"
            value={alasan.label}
            valueClass="text-right text-xs"
          />
          <Row
            label="UP"
            value={`${item.pesangon.upBulan} bln × ${item.pesangon.multiplierUP}×`}
          />
          <Row
            label="UPMK"
            value={`${item.pesangon.upmkBln} bln × ${item.pesangon.multiplierUPMK}×`}
          />
          <Row
            label="UP Nominal"
            value={formatIDR(item.pesangon.upNominal)}
          />
          <Row
            label="UPMK Nominal"
            value={formatIDR(item.pesangon.upmkNominal)}
          />
          <Row label="UPH" value={formatIDR(item.pesangon.uphTotal)} />
        </div>

        <div className="border-t border-border pt-3 space-y-1.5 text-sm">
          <Row
            label="Proyeksi Stay 5 thn"
            value={formatIDR(item.worthit.stayFinal)}
          />
          <Row
            label="Proyeksi Pindah 5 thn"
            value={
              item.worthit.moveFinal > 0
                ? formatIDR(item.worthit.moveFinal)
                : "—"
            }
          />
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value, valueClass = "" }) => (
  <div className="flex items-baseline justify-between gap-2">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={`num font-semibold text-sm ${valueClass}`}>{value}</span>
  </div>
);

export default function CompareDialog({ open, onOpenChange, itemA, itemB }) {
  if (!itemA || !itemB) return null;

  // Winner determination
  const scoreDiff = itemA.worthit.score - itemB.worthit.score;
  const pesangonDiff = itemA.pesangon.grandTotal - itemB.pesangon.grandTotal;
  const winnerLabel =
    Math.abs(scoreDiff) < 5
      ? "Setara"
      : scoreDiff > 0
        ? "Skenario A lebih layak"
        : "Skenario B lebih layak";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        data-testid="compare-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-emerald-600" />
            Bandingkan Skenario
          </DialogTitle>
          <DialogDescription>
            Analisa perbedaan dua kalkulasi tersimpan untuk memilih strategi
            paling menguntungkan.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span
              className="text-lg font-extrabold"
              data-testid="compare-winner"
            >
              {winnerLabel}
            </span>
          </div>
          <div className="text-xs text-slate-300 mt-1">
            Selisih skor: {Math.abs(scoreDiff)} poin · Selisih pesangon:{" "}
            {formatIDR(Math.abs(pesangonDiff))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Column item={itemA} other={itemB} side="A" />
          <Column item={itemB} other={itemA} side="B" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
