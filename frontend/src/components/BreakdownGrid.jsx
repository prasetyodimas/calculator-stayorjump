import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Award, ScrollText, HandCoins, Info } from "lucide-react";
import { formatIDR } from "@/lib/format";

const Row = ({ label, value, sub }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5">
    <div className="text-sm text-muted-foreground">
      {label}
      {sub && (
        <span className="block text-xs text-muted-foreground/70">{sub}</span>
      )}
    </div>
    <div className="text-sm num font-semibold text-right whitespace-nowrap">
      {value}
    </div>
  </div>
);

const BreakdownCard = ({
  icon: Icon,
  color,
  title,
  amount,
  formula,
  children,
  testid,
}) => (
  <Card className="border-border/70 shadow-sm overflow-hidden">
    <div className={`h-1 w-full ${color}`} />
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center ${color.replace("bg-", "bg-").replace("500", "500/10")}`}
          >
            <Icon
              className={`h-4 w-4 ${color.replace("bg-", "text-").replace("500", "600")}`}
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {title}
            </div>
            <div className="text-lg font-extrabold num" data-testid={testid}>
              {formatIDR(amount)}
            </div>
          </div>
        </div>
      </div>
      {formula && (
        <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 rounded-md px-2 py-1 mb-2">
          {formula}
        </div>
      )}
      {children && <div className="space-y-0">{children}</div>}
    </CardContent>
  </Card>
);

export default function BreakdownGrid({ pesangon }) {
  const {
    upNominal,
    upBulan,
    multiplierUP,
    upahDasar,
    upmkNominal,
    upmkBln,
    multiplierUPMK,
    uphCuti,
    uphOngkos,
    uphTotal,
    uangPisah,
    grandTotal,
  } = pesangon;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
              Total Pesangon
            </div>
            <div
              className="text-3xl sm:text-4xl font-extrabold num mt-1"
              data-testid="total-pesangon-value"
            >
              {formatIDR(grandTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Info className="h-3 w-3" />
              Estimasi berdasarkan PP No. 35 Tahun 2021
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Upah Dasar</div>
            <div className="text-lg font-bold num">{formatIDR(upahDasar)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BreakdownCard
          icon={Wallet}
          color="bg-emerald-500"
          title="Uang Pesangon (UP)"
          amount={upNominal}
          formula={`${upBulan} bln × ${multiplierUP}× × Upah`}
          testid="up-value"
        >
          <Row label="Bulan pesangon" value={`${upBulan} bulan`} />
          <Row label="Multiplier PHK" value={`${multiplierUP}×`} />
        </BreakdownCard>

        <BreakdownCard
          icon={Award}
          color="bg-blue-500"
          title="UPMK"
          amount={upmkNominal}
          formula={`${upmkBln} bln × ${multiplierUPMK}× × Upah`}
          testid="upmk-value"
        >
          <Row label="Bulan penghargaan" value={`${upmkBln} bulan`} />
          <Row label="Multiplier PHK" value={`${multiplierUPMK}×`} />
        </BreakdownCard>

        <BreakdownCard
          icon={ScrollText}
          color="bg-amber-500"
          title="UPH (Uang Penggantian Hak)"
          amount={uphTotal}
          testid="uph-value"
        >
          <Row label="Sisa cuti (upah harian)" value={formatIDR(uphCuti)} />
          <Row label="Ongkos pulang" value={formatIDR(uphOngkos)} />
        </BreakdownCard>

        <BreakdownCard
          icon={HandCoins}
          color="bg-purple-500"
          title="Uang Pisah"
          amount={uangPisah}
          testid="uang-pisah-value"
        >
          <Row
            label={
              uangPisah > 0
                ? "Sesuai perjanjian kerja"
                : "Tidak berlaku untuk alasan ini"
            }
            value=""
          />
        </BreakdownCard>
      </div>
    </div>
  );
}
