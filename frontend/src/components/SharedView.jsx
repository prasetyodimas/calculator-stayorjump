import React from "react";
import WorthitMeter from "./WorthitMeter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Lock,
  Scale,
  Calendar,
  Briefcase,
  ArrowRight,
  Share2,
} from "lucide-react";
import { getAlasanConfig } from "@/lib/pesangon";

export default function SharedView({ payload, onExit }) {
  const alasan = getAlasanConfig(payload.alasanPHK);
  const breakdown = payload.breakdown || {
    scoreSelisih: 0,
    scoreSeverance: 0,
    scoreBenefit: 0,
    scoreGrowth: 0,
  };
  const dateStr = new Date(payload.ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground relative noise-bg">
      {/* Minimal header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight">
                  StayOrJump
                </span>
                <span className="text-[11px] text-muted-foreground -mt-0.5">
                  Tampilan Bagikan · Read-only
                </span>
              </div>
            </div>
            <Button
              onClick={onExit}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-hitung-punya-saya"
            >
              Hitung Punya Saya
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 space-y-6">
        {/* Privacy notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-emerald-500/5 border border-emerald-500/20 rounded-full px-4 py-2 w-fit">
          <Lock className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            Gaji asli tidak ditampilkan. Hanya rasio & skor yang dibagikan.
          </span>
        </div>

        {/* Score meter */}
        <WorthitMeter
          score={payload.score}
          recommendation={payload.recommendation}
          label={payload.recommendationLabel}
          color={payload.recommendationColor}
        />

        {/* Rationale */}
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
              Kesimpulan
            </div>
            <p
              className="text-base leading-relaxed"
              data-testid="shared-rationale"
            >
              {payload.rationale}
            </p>
          </CardContent>
        </Card>

        {/* Public metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-border/70">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-2">
                <Calendar className="h-3.5 w-3.5" /> Masa Kerja
              </div>
              <div
                className="text-2xl font-extrabold num"
                data-testid="shared-masa-kerja"
              >
                {payload.masaTahun}
                <span className="text-base font-medium text-muted-foreground">
                  t
                </span>{" "}
                {payload.masaBulan}
                <span className="text-base font-medium text-muted-foreground">
                  b
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-2">
                <Briefcase className="h-3.5 w-3.5" /> Skenario
              </div>
              <div
                className="text-sm font-bold leading-tight"
                data-testid="shared-alasan"
              >
                {alasan.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                {payload.multiplierUP}× UP · {payload.multiplierUPMK}× UPMK
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-emerald-500/5 border-emerald-500/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider font-semibold mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Pesangon
              </div>
              <div
                className="text-2xl font-extrabold num text-emerald-700 dark:text-emerald-400"
                data-testid="shared-months-equivalent"
              >
                {payload.monthsEquivalent}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                bulan upah setara
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score breakdown */}
        <Card className="border-border/70">
          <CardContent className="p-6">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-4">
              Rincian Worthit Score
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Selisih Proyeksi",
                  value: breakdown.scoreSelisih,
                  max: 40,
                  color: "bg-emerald-500",
                },
                {
                  label: "Buffer Pesangon",
                  value: breakdown.scoreSeverance,
                  max: 25,
                  color: "bg-blue-500",
                },
                {
                  label: "Density Benefit",
                  value: breakdown.scoreBenefit,
                  max: 15,
                  color: "bg-amber-500",
                },
                {
                  label: "Trajektori Kenaikan",
                  value: breakdown.scoreGrowth,
                  max: 20,
                  color: "bg-purple-500",
                },
              ].map((r) => (
                <div key={r.label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="num font-semibold">
                      {r.value}{" "}
                      <span className="text-muted-foreground text-xs">
                        / {r.max}
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.color}`}
                      style={{ width: `${(r.value / r.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {payload.hasNewOffer && payload.stayVsMovePercent !== null && (
              <div className="mt-5 pt-5 border-t border-border">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Perbandingan Proyeksi 5 Tahun
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-extrabold num ${
                      payload.stayVsMovePercent > 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {payload.stayVsMovePercent > 0 ? "+" : ""}
                    {payload.stayVsMovePercent}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Stay {payload.stayVsMovePercent > 0 ? "unggul" : "kalah"}{" "}
                    vs Pindah
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-border/70 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white">
          <CardContent className="p-6 sm:p-8 text-center">
            <Share2 className="h-6 w-6 mx-auto mb-2 text-emerald-400" />
            <h3 className="text-xl sm:text-2xl font-extrabold">
              Mau hitung kasus kamu sendiri?
            </h3>
            <p className="text-sm text-slate-300 mt-1.5 max-w-md mx-auto">
              Gratis. Data disimpan lokal di browser kamu. Tanpa login.
            </p>
            <Button
              onClick={onExit}
              size="lg"
              className="mt-5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              data-testid="button-cta-hitung"
            >
              Buka Kalkulator
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Dibagikan pada {dateStr} · StayOrJump · PP 35/2021
        </p>
      </main>
    </div>
  );
}
