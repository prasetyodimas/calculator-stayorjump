import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  DollarSign,
  Gift,
  TrendingUp,
  ArrowRightLeft,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { ALASAN_PHK, getAlasanConfig } from "@/lib/pesangon";
import { formatIDR, parseNumber, formatNumber } from "@/lib/format";

const MoneyInput = ({ id, value, onChange, placeholder, testid }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
      Rp
    </span>
    <Input
      id={id}
      data-testid={testid}
      value={value ? formatNumber(value) : ""}
      onChange={(e) => onChange(parseNumber(e.target.value))}
      placeholder={placeholder}
      inputMode="numeric"
      className="pl-9 font-mono tabular-nums"
    />
  </div>
);

export default function InputForm({ state, setState, onSubmit, onReset }) {
  const upd = (k, v) => setState((s) => ({ ...s, [k]: v }));
  const alasanCfg = getAlasanConfig(state.alasanPHK);

  return (
    <div className="space-y-6">
      {/* Section 1: Gaji & Masa Kerja */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            Gaji & Masa Kerja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gaji-pokok">Gaji Pokok (Bulanan)</Label>
              <MoneyInput
                id="gaji-pokok"
                testid="input-gaji-pokok"
                value={state.gajiPokok}
                onChange={(v) => upd("gajiPokok", v)}
                placeholder="8.000.000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tunjangan-tetap">Tunjangan Tetap</Label>
              <MoneyInput
                id="tunjangan-tetap"
                testid="input-tunjangan-tetap"
                value={state.tunjanganTetap}
                onChange={(v) => upd("tunjanganTetap", v)}
                placeholder="1.500.000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="masa-tahun">Masa Kerja (Tahun)</Label>
              <Input
                id="masa-tahun"
                data-testid="input-masa-kerja-tahun"
                type="number"
                min={0}
                max={50}
                value={state.masaKerjaTahun}
                onChange={(e) =>
                  upd("masaKerjaTahun", parseInt(e.target.value || 0, 10))
                }
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="masa-bulan">+ Bulan</Label>
              <Input
                id="masa-bulan"
                data-testid="input-masa-kerja-bulan"
                type="number"
                min={0}
                max={11}
                value={state.masaKerjaBulan}
                onChange={(e) =>
                  upd("masaKerjaBulan", parseInt(e.target.value || 0, 10))
                }
                className="font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Kenaikan Gaji Tahunan</Label>
              <span className="text-sm font-mono font-semibold text-emerald-600">
                {state.kenaikanTahunan}%
              </span>
            </div>
            <Slider
              data-testid="slider-kenaikan"
              value={[state.kenaikanTahunan]}
              min={0}
              max={20}
              step={0.5}
              onValueChange={(v) => upd("kenaikanTahunan", v[0])}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Alasan PHK */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            Skenario PHK / Keluar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Alasan Berakhirnya Hubungan Kerja</Label>
            <Select
              value={state.alasanPHK}
              onValueChange={(v) => upd("alasanPHK", v)}
            >
              <SelectTrigger data-testid="select-alasan-phk">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALASAN_PHK.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex flex-wrap gap-2 rounded-lg border border-border/70 bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">UP:</span>
                <span className="font-mono font-semibold">
                  {alasanCfg.up}×
                </span>
              </div>
              <span className="text-muted-foreground/40">·</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">UPMK:</span>
                <span className="font-mono font-semibold">
                  {alasanCfg.upmk}×
                </span>
              </div>
              <span className="text-muted-foreground/40">·</span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">UPH:</span>
                <span className="font-mono font-semibold">
                  {alasanCfg.uph ? "Ya" : "Tidak"}
                </span>
              </div>
              <p className="w-full text-xs text-muted-foreground mt-1 leading-relaxed">
                {alasanCfg.note}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sisa Cuti (Hari)</Label>
              <Input
                data-testid="input-sisa-cuti"
                type="number"
                min={0}
                value={state.sisaCutiHari}
                onChange={(e) =>
                  upd("sisaCutiHari", parseInt(e.target.value || 0, 10))
                }
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ongkos Pulang / UPH lain</Label>
              <MoneyInput
                testid="input-ongkos-pulang"
                value={state.ongkosPulang}
                onChange={(v) => upd("ongkosPulang", v)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Benefit Tahunan */}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Gift className="h-4 w-4 text-amber-600" />
            </div>
            Benefit & Tunjangan Non-Tetap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>THR (× Gaji Pokok)</Label>
              <div className="flex items-center gap-2">
                <Input
                  data-testid="input-thr-multiplier"
                  type="number"
                  min={0}
                  max={3}
                  step={0.5}
                  value={state.thrKali}
                  onChange={(e) =>
                    upd("thrKali", parseFloat(e.target.value || 0))
                  }
                  className="font-mono w-24"
                />
                <span className="text-sm text-muted-foreground">
                  = {formatIDR(state.gajiPokok * state.thrKali)}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Bonus Tahunan</Label>
              <MoneyInput
                testid="input-bonus-tahunan"
                value={state.bonusTahunan}
                onChange={(v) => upd("bonusTahunan", v)}
                placeholder="0"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Kontribusi BPJS Kesehatan / bln</Label>
              <MoneyInput
                testid="input-bpjs-kes"
                value={state.bpjsKes}
                onChange={(v) => upd("bpjsKes", v)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Kontribusi BPJS TK / bln</Label>
              <MoneyInput
                testid="input-bpjs-tk"
                value={state.bpjsTK}
                onChange={(v) => upd("bpjsTK", v)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Asuransi Tambahan / bln</Label>
              <MoneyInput
                testid="input-asuransi"
                value={state.asuransi}
                onChange={(v) => upd("asuransi", v)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tunjangan Transport / Makan / bln</Label>
              <MoneyInput
                testid="input-transport-makan"
                value={state.transportMakan}
                onChange={(v) => upd("transportMakan", v)}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Tawaran Baru */}
      <Card className="border-border/70 shadow-sm border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4 text-purple-600" />
            </div>
            Tawaran Kantor Baru
            <span className="text-xs font-normal text-muted-foreground ml-1">
              (opsional)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tawaran Gaji Baru / bln</Label>
              <MoneyInput
                testid="input-gaji-kantor-baru"
                value={state.gajiKantorBaru}
                onChange={(v) => upd("gajiKantorBaru", v)}
                placeholder="Kosongkan bila tidak ada"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Estimasi Kenaikan Baru</Label>
                <span className="text-sm font-mono font-semibold text-purple-600">
                  {state.kenaikanBaru}%
                </span>
              </div>
              <Slider
                value={[state.kenaikanBaru]}
                min={0}
                max={20}
                step={0.5}
                onValueChange={(v) => upd("kenaikanBaru", v[0])}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3 sticky bottom-4 z-30">
        <Button
          data-testid="button-hitung-pesangon"
          onClick={onSubmit}
          size="lg"
          className="flex-1 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold shadow-lg shadow-emerald-500/20"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Hitung Pesangon & Analisa
        </Button>
        <Button
          data-testid="button-reset-form"
          onClick={onReset}
          variant="outline"
          size="lg"
          className="h-12"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}
