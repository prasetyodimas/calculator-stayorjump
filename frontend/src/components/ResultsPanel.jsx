import React from "react";
import WorthitMeter from "./WorthitMeter";
import BreakdownGrid from "./BreakdownGrid";
import ProjectionChart from "./ProjectionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Printer, Lightbulb, Share2 } from "lucide-react";
import { formatIDR } from "@/lib/format";

const ScoreRow = ({ label, value, max, color }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="num font-semibold">
        {value} <span className="text-muted-foreground text-xs">/ {max}</span>
      </span>
    </div>
    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  </div>
);

export default function ResultsPanel({ result, onSave, onPrint, onShare }) {
  if (!result) return null;
  const { pesangon, worthit } = result;

  return (
    <div className="space-y-6 fade-up" data-testid="results-panel">
      {/* Worthit Meter */}
      <WorthitMeter
        score={worthit.score}
        recommendation={worthit.recommendation}
        label={worthit.recommendationLabel}
        color={worthit.recommendationColor}
      />

      {/* Rationale + Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-amber-600" />
              </div>
              Kesimpulan & Saran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-sm leading-relaxed text-foreground/90"
              data-testid="recommendation-rationale"
            >
              {worthit.rationale}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Kompensasi 5 thn (Stay + Pesangon)
                </div>
                <div className="text-lg font-bold num text-emerald-700 dark:text-emerald-400 mt-1">
                  {formatIDR(worthit.stayFinal)}
                </div>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Total 5 thn (Pindah)
                </div>
                <div className="text-lg font-bold num text-red-700 dark:text-red-400 mt-1">
                  {worthit.moveFinal > 0
                    ? formatIDR(worthit.moveFinal)
                    : "Tidak dihitung"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rincian Skor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreRow
              label="Selisih Proyeksi"
              value={worthit.breakdown.scoreSelisih}
              max={40}
              color="bg-emerald-500"
            />
            <ScoreRow
              label="Buffer Pesangon"
              value={worthit.breakdown.scoreSeverance}
              max={25}
              color="bg-blue-500"
            />
            <ScoreRow
              label="Density Benefit"
              value={worthit.breakdown.scoreBenefit}
              max={15}
              color="bg-amber-500"
            />
            <ScoreRow
              label="Trajektori Kenaikan"
              value={worthit.breakdown.scoreGrowth}
              max={20}
              color="bg-purple-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Pesangon */}
      <BreakdownGrid pesangon={pesangon} />

      {/* Chart */}
      <ProjectionChart
        data={worthit.projection}
        stayFinal={worthit.stayFinal}
        moveFinal={worthit.moveFinal}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 no-print">
        <Button
          data-testid="button-simpan-riwayat"
          onClick={onSave}
          variant="default"
          className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <Save className="h-4 w-4 mr-2" />
          Simpan ke Riwayat
        </Button>
        <Button
          data-testid="button-bagikan-hasil"
          onClick={onShare}
          variant="outline"
          className="flex-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Bagikan Hasil
        </Button>
        <Button
          data-testid="button-export-pdf"
          onClick={onPrint}
          variant="outline"
          className="flex-1"
        >
          <Printer className="h-4 w-4 mr-2" />
          Cetak / PDF
        </Button>
      </div>
    </div>
  );
}
