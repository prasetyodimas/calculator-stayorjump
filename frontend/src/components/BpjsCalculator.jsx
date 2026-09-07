import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  PiggyBank,
  Landmark,
  TrendingUp,
  Info,
  Calendar,
  Wallet,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  hitungJHT,
  hitungJP,
  JHT_RATE_TOTAL,
  JHT_RATE_PEKERJA,
  JHT_RATE_PENGUSAHA,
  JP_RATE_TOTAL,
  JP_RATE_PEKERJA,
  JP_RATE_PENGUSAHA,
  JP_UPAH_MAKSIMAL_2026,
  USIA_KLAIM_JHT,
  USIA_PENSIUN_JP,
} from "@/lib/bpjstk";
import { formatIDR, formatIDRShort, parseNumber, formatNumber } from "@/lib/format";

const MoneyInput = ({ value, onChange, placeholder, testid }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
      Rp
    </span>
    <Input
      data-testid={testid}
      value={value ? formatNumber(value) : ""}
      onChange={(e) => onChange(parseNumber(e.target.value))}
      placeholder={placeholder}
      inputMode="numeric"
      className="pl-9 font-mono tabular-nums"
    />
  </div>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background/95 backdrop-blur px-3 py-2 shadow-lg text-xs">
      <div className="font-semibold mb-1">
        Usia {point.usia} · Tahun ke-{label}
      </div>
      <div className="num">Saldo: {formatIDR(point.saldo)}</div>
      <div className="num text-muted-foreground">
        Gaji: {formatIDR(point.gaji)}
      </div>
    </div>
  );
};

export default function BpjsCalculator() {
  const [input, setInput] = useState({
    gajiPokok: 0,
    usiaSekarang: 27,
    usiaKlaimJHT: USIA_KLAIM_JHT,
    usiaPensiunJP: USIA_PENSIUN_JP,
    saldoAwalJHT: 0,
    masaIurTerkumpul: 0,
    kenaikanGajiPct: 8,
    hasilPengembanganPct: 5.5,
  });

  const upd = (k, v) => setInput((s) => ({ ...s, [k]: v }));

  const jht = useMemo(() => {
    if (!input.gajiPokok) return null;
    return hitungJHT({
      gajiPokok: input.gajiPokok,
      usiaSekarang: input.usiaSekarang,
      usiaKlaim: input.usiaKlaimJHT,
      saldoAwal: input.saldoAwalJHT,
      kenaikanGajiPct: input.kenaikanGajiPct,
      hasilPengembanganPct: input.hasilPengembanganPct,
    });
  }, [input]);

  const jp = useMemo(() => {
    if (!input.gajiPokok) return null;
    return hitungJP({
      gajiPokok: input.gajiPokok,
      usiaSekarang: input.usiaSekarang,
      usiaPensiun: input.usiaPensiunJP,
      masaIurTerkumpul: input.masaIurTerkumpul,
      kenaikanGajiPct: input.kenaikanGajiPct,
      hasilPengembanganPct: input.hasilPengembanganPct,
    });
  }, [input]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* LEFT: Input */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-4">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              Data Kepesertaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Gaji Pokok (bulanan)</Label>
              <MoneyInput
                testid="input-bpjs-gaji"
                value={input.gajiPokok}
                onChange={(v) => upd("gajiPokok", v)}
                placeholder="8.000.000"
              />
              {input.gajiPokok > JP_UPAH_MAKSIMAL_2026 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> Iuran JP dibatasi upah{" "}
                  {formatIDR(JP_UPAH_MAKSIMAL_2026)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Usia Sekarang</Label>
                <Input
                  data-testid="input-bpjs-usia"
                  type="number"
                  min={17}
                  max={65}
                  value={input.usiaSekarang}
                  onChange={(e) =>
                    upd("usiaSekarang", parseInt(e.target.value || 0, 10))
                  }
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Masa Iur Sudah Berjalan (thn)</Label>
                <Input
                  data-testid="input-bpjs-masa-iur"
                  type="number"
                  min={0}
                  max={40}
                  value={input.masaIurTerkumpul}
                  onChange={(e) =>
                    upd("masaIurTerkumpul", parseInt(e.target.value || 0, 10))
                  }
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Saldo JHT saat ini (opsional)</Label>
              <MoneyInput
                testid="input-bpjs-saldo-awal"
                value={input.saldoAwalJHT}
                onChange={(v) => upd("saldoAwalJHT", v)}
                placeholder="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              Target & Asumsi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Klaim JHT usia</Label>
                <Input
                  data-testid="input-bpjs-usia-klaim-jht"
                  type="number"
                  min={40}
                  max={65}
                  value={input.usiaKlaimJHT}
                  onChange={(e) =>
                    upd("usiaKlaimJHT", parseInt(e.target.value || 0, 10))
                  }
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pensiun JP usia</Label>
                <Input
                  data-testid="input-bpjs-usia-pensiun-jp"
                  type="number"
                  min={55}
                  max={65}
                  value={input.usiaPensiunJP}
                  onChange={(e) =>
                    upd("usiaPensiunJP", parseInt(e.target.value || 0, 10))
                  }
                  className="font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label>Kenaikan Gaji Tahunan</Label>
                <span className="text-sm font-mono font-semibold text-emerald-600">
                  {input.kenaikanGajiPct}%
                </span>
              </div>
              <Slider
                data-testid="slider-kenaikan-gaji"
                value={[input.kenaikanGajiPct]}
                min={0}
                max={15}
                step={0.5}
                onValueChange={(v) => upd("kenaikanGajiPct", v[0])}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label>Hasil Pengembangan JHT (yield)</Label>
                <span className="text-sm font-mono font-semibold text-blue-600">
                  {input.hasilPengembanganPct}%
                </span>
              </div>
              <Slider
                data-testid="slider-hasil-pengembangan"
                value={[input.hasilPengembanganPct]}
                min={3}
                max={9}
                step={0.25}
                onValueChange={(v) => upd("hasilPengembanganPct", v[0])}
              />
              <p className="text-[11px] text-muted-foreground">
                Rata-rata BPJS TK 5-7% per tahun.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-muted/30">
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Info className="h-3.5 w-3.5" /> Struktur Iuran
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                JHT (PP 46/2015)
              </span>
              <span className="num font-semibold">
                {(JHT_RATE_TOTAL * 100).toFixed(1)}% (
                {(JHT_RATE_PENGUSAHA * 100).toFixed(1)}% +{" "}
                {(JHT_RATE_PEKERJA * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">JP (PP 45/2015)</span>
              <span className="num font-semibold">
                {(JP_RATE_TOTAL * 100).toFixed(1)}% (
                {(JP_RATE_PENGUSAHA * 100).toFixed(1)}% +{" "}
                {(JP_RATE_PEKERJA * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Batas upah JP 2026
              </span>
              <span className="num font-semibold">
                {formatIDR(JP_UPAH_MAKSIMAL_2026)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Results */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        {!jht ? (
          <EmptyBpjs />
        ) : (
          <>
            {/* JHT Card */}
            <Card
              className="border-border/70 shadow-sm overflow-hidden"
              data-testid="jht-result-card"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-600" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <PiggyBank className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div>Jaminan Hari Tua (JHT)</div>
                      <div className="text-[11px] text-muted-foreground font-normal">
                        Cair di usia {input.usiaKlaimJHT} · {jht.tahunKerja}{" "}
                        tahun ke depan
                      </div>
                    </div>
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono border-emerald-500/40"
                  >
                    PP 46/2015
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5">
                  <div className="text-[11px] uppercase tracking-widest text-emerald-100 font-semibold">
                    Estimasi Saldo Akhir
                  </div>
                  <div
                    className="text-3xl sm:text-4xl font-extrabold num mt-1"
                    data-testid="jht-saldo-akhir"
                  >
                    {formatIDR(jht.saldoAkhir)}
                  </div>
                  <div className="text-xs text-emerald-100 mt-1.5">
                    Dari akumulasi iuran + hasil pengembangan{" "}
                    {input.hasilPengembanganPct}%/tahun
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <MiniStat
                    label="Iuran / bulan sekarang"
                    value={formatIDR(jht.iuranBulananSekarang)}
                    sub={`${(JHT_RATE_TOTAL * 100).toFixed(1)}% × gaji`}
                  />
                  <MiniStat
                    label="Bagian Anda / bulan"
                    value={formatIDR(jht.iuranBulananPekerjaSekarang)}
                    sub={`${(JHT_RATE_PEKERJA * 100).toFixed(0)}% dipotong gaji`}
                  />
                  <MiniStat
                    label="Total Iuran s/d klaim"
                    value={formatIDRShort(jht.totalIuran)}
                    sub={`Pekerja + Pengusaha`}
                  />
                </div>

                <Separator />

                <div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3" /> Proyeksi Pertumbuhan
                    Saldo
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={jht.timeline}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorJHT"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#059669"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="95%"
                              stopColor="#059669"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="currentColor"
                          className="text-border"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="tahun"
                          tick={{ fontSize: 10 }}
                          stroke="currentColor"
                          className="text-muted-foreground"
                        />
                        <YAxis
                          tickFormatter={formatIDRShort}
                          tick={{ fontSize: 10 }}
                          stroke="currentColor"
                          className="text-muted-foreground"
                          width={65}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="saldo"
                          stroke="#059669"
                          strokeWidth={2.5}
                          fill="url(#colorJHT)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-lg border border-border/70 p-3">
                    <div className="text-[11px] text-muted-foreground">
                      Total Iuran (pokok)
                    </div>
                    <div className="text-base font-bold num mt-0.5">
                      {formatIDR(jht.totalIuran)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/70 p-3 bg-emerald-500/5">
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Hasil Pengembangan
                    </div>
                    <div
                      className="text-base font-bold num text-emerald-700 dark:text-emerald-400 mt-0.5"
                      data-testid="jht-hasil-pengembangan"
                    >
                      + {formatIDR(jht.hasilPengembangan)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JP Card */}
            {jp && (
              <Card
                className="border-border/70 shadow-sm overflow-hidden"
                data-testid="jp-result-card"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Landmark className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div>Jaminan Pensiun (JP)</div>
                        <div className="text-[11px] text-muted-foreground font-normal">
                          Pensiun usia {input.usiaPensiunJP} · Masa iur{" "}
                          {jp.masaIurTotal} tahun
                        </div>
                      </div>
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        jp.eligibleMPB
                          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                          : "border-amber-500/40 text-amber-700 dark:text-amber-400"
                      }`}
                      data-testid="jp-eligibility-badge"
                    >
                      {jp.eligibleMPB
                        ? "MPB Berkala"
                        : "Lump Sum (< 15 thn)"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {jp.eligibleMPB ? (
                    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5">
                      <div className="text-[11px] uppercase tracking-widest text-blue-100 font-semibold">
                        Manfaat Pensiun Bulanan
                      </div>
                      <div
                        className="text-3xl sm:text-4xl font-extrabold num mt-1"
                        data-testid="jp-manfaat-bulanan"
                      >
                        {formatIDR(jp.manfaatBulanan)}
                      </div>
                      <div className="text-xs text-blue-100 mt-1.5">
                        Formula: 1% × {Math.min(jp.masaIurTotal, 40)} thn ×
                        rata-rata upah {formatIDRShort(jp.rataRataUpah)}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5">
                      <div className="text-[11px] uppercase tracking-widest text-amber-100 font-semibold">
                        Manfaat Lump Sum
                      </div>
                      <div
                        className="text-3xl sm:text-4xl font-extrabold num mt-1"
                        data-testid="jp-lump-sum"
                      >
                        {formatIDR(jp.lumpSumAkumulatif)}
                      </div>
                      <div className="text-xs text-amber-100 mt-1.5 flex items-start gap-1">
                        <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>
                          Masa iur belum 15 tahun — dana dibayarkan sekaligus,
                          bukan bulanan berkala.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <MiniStat
                      label="Iuran JP / bulan"
                      value={formatIDR(jp.iuranBulananSekarang)}
                      sub={`${(JP_RATE_TOTAL * 100).toFixed(1)}% × upah iur`}
                    />
                    <MiniStat
                      label="Bagian Anda / bulan"
                      value={formatIDR(jp.iuranBulananPekerjaSekarang)}
                      sub={`${(JP_RATE_PEKERJA * 100).toFixed(0)}% dipotong gaji`}
                    />
                    <MiniStat
                      label="Total Iuran s/d pensiun"
                      value={formatIDRShort(jp.totalIuran)}
                      sub="Akumulasi"
                    />
                  </div>

                  <Separator />

                  <div className="rounded-lg bg-muted/40 border border-border/70 p-4 text-xs space-y-2">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      Ringkasan Total Dana Pensiun
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">JHT (cair sekaligus)</span>
                      <span className="num font-semibold">
                        {formatIDR(jht.saldoAkhir)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {jp.eligibleMPB
                          ? "JP (per bulan seumur hidup)"
                          : "JP (lump sum)"}
                      </span>
                      <span className="num font-semibold">
                        {jp.eligibleMPB
                          ? `${formatIDR(jp.manfaatBulanan)} / bln`
                          : formatIDR(jp.lumpSumAkumulatif)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground flex gap-2">
              <Info className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                Estimasi menggunakan asumsi kenaikan gaji & yield konstan.
                Angka aktual tergantung kebijakan BPJS Ketenagakerjaan, batas
                upah tahunan, dan penyesuaian pemerintah.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const MiniStat = ({ label, value, sub }) => (
  <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
      {label}
    </div>
    <div className="text-sm font-bold num mt-1">{value}</div>
    {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
  </div>
);

const EmptyBpjs = () => (
  <div className="rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 p-8 sm:p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
    <div className="relative mb-5">
      <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-2xl" />
      <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
        <PiggyBank className="h-7 w-7 text-white" />
      </div>
    </div>
    <h3 className="text-xl font-bold">Isi gaji pokok dulu, yuk.</h3>
    <p className="text-sm text-muted-foreground mt-2 max-w-md">
      Masukkan gaji pokok bulanan Anda untuk mulai estimasi saldo JHT dan
      manfaat pensiun JP saat memasuki usia klaim.
    </p>
  </div>
);
