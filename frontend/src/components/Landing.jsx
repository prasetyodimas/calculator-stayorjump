import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  PlayCircle,
  Check,
  DollarSign,
  BarChart3,
  LineChart,
  ShieldCheck,
  Download,
  Sparkles,
  Rocket,
  TrendingUp,
  Landmark,
  Lock,
  Scale,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: DollarSign,
    color: "emerald",
    title: "Pesangon Akurat",
    desc: "Hitung pesangon sesuai UU Cipta Kerja / PP 35/2021 berdasarkan masa kerja Anda",
  },
  {
    icon: BarChart3,
    color: "amber",
    title: "Total Kompensasi",
    desc: "Bandingkan gaji, bonus, THR, tunjangan, dan semua benefit secara menyeluruh",
  },
  {
    icon: LineChart,
    color: "blue",
    title: "Proyeksi 5 Tahun",
    desc: "Lihat proyeksi pertumbuhan karir dan kompensasi dalam jangka panjang",
  },
  {
    icon: ShieldCheck,
    color: "purple",
    title: "Skenario Fleksibel",
    desc: "Bandingkan berbagai skenario: Resign, PHK Efisiensi, Pensiun, dan lainnya",
  },
  {
    icon: Download,
    color: "rose",
    title: "Export & Share",
    desc: "Unduh hasil perhitungan dalam PDF atau bagikan lewat link & QR aman",
  },
];

const colorClass = (c, variant = "bg") => {
  const map = {
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-600",
      border: "border-emerald-500/20",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-600",
      border: "border-amber-500/20",
    },
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-600",
      border: "border-blue-500/20",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-600",
      border: "border-purple-500/20",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-600",
      border: "border-rose-500/20",
    },
  };
  return map[c][variant];
};

const STEPS = [
  {
    n: "01",
    title: "Isi Data Anda",
    desc: "Input gaji pokok, tunjangan, masa kerja, dan alasan berakhirnya kontrak kerja.",
  },
  {
    n: "02",
    title: "Tambahkan Benefit",
    desc: "Masukkan THR, bonus, BPJS, asuransi, dan tunjangan lain untuk gambar utuh.",
  },
  {
    n: "03",
    title: "Analisa Instan",
    desc: "Lihat Worthit Score 0-100 dengan rekomendasi STAY atau MOVE dalam hitungan detik.",
  },
  {
    n: "04",
    title: "Ambil Keputusan",
    desc: "Simpan riwayat, bandingkan skenario, atau bagikan hasil ke keluarga & mentor.",
  },
];

const DEEP_FEATURES = [
  {
    icon: Scale,
    title: "Basis Hukum Resmi",
    desc: "Semua formula mengikuti UU Cipta Kerja & PP 35/2021, tabel UP (1-9 bln), UPMK (0-10 bln), UPH, dan 11 alasan PHK dengan multiplier sesuai regulasi.",
  },
  {
    icon: Landmark,
    title: "Kalkulator JHT & JP",
    desc: "Modul BPJS Ketenagakerjaan lengkap: estimasi saldo Jaminan Hari Tua dengan compounding, plus proyeksi manfaat pensiun bulanan (MPB) atau lump sum.",
  },
  {
    icon: Sparkles,
    title: "Worthit Score",
    desc: "Skor 0-100 dari 4 faktor: selisih proyeksi 5 tahun, buffer pesangon, density benefit, dan trajektori kenaikan — bukan cuma angka gaji.",
  },
  {
    icon: Lock,
    title: "Privasi Terjamin",
    desc: "Data kalkulasi tersimpan lokal di browser (IndexedDB). Fitur bagikan hanya kirim skor & rekomendasi — gaji asli tidak pernah keluar dari perangkat Anda.",
  },
];

export default function Landing({ onCTAClick }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <Sparkles className="h-3 w-3" />
              Kalkulator Legal Indonesia · UU Cipta Kerja
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Stay atau <span className="text-emerald-600">Jump?</span>
              <br />
              Hitung dulu{" "}
              <span className="italic font-light">worth-it</span>-nya.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Kalkulator pesangon resmi berbasis PP No. 35 Tahun 2021 plus
              analisa <strong className="text-foreground">Worthit Score</strong>{" "}
              untuk bantu Anda memutuskan bertahan di kantor atau pindah ke
              tawaran baru.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                onClick={onCTAClick}
                data-testid="cta-mulai-perhitungan"
                className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg shadow-emerald-500/20 group"
              >
                Mulai Perhitungan Gratis
                <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("cara-kerja")}
                data-testid="cta-lihat-cara-kerja"
                className="h-12 px-6 font-semibold text-base"
              >
                <PlayCircle className="h-4 w-4 mr-1.5" />
                Lihat Cara Kerja
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
              {[
                "100% Gratis",
                "Tanpa Login",
                "Data aman di perangkat Anda",
              ].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Mock */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 blur-3xl rounded-full" />
            <PreviewMock />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="fitur"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50"
      >
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            Semua yang Anda Butuhkan dalam Satu Perhitungan
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Perhitungan komprehensif untuk keputusan karir terbaik Anda
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              className={`border-border/70 hover:border-emerald-500/40 transition-all group hover:-translate-y-0.5 fade-up`}
              style={{ animationDelay: `${i * 60}ms` }}
              data-testid={`feature-card-${i}`}
            >
              <CardContent className="p-5 space-y-3">
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center ${colorClass(f.color, "bg")}`}
                >
                  <f.icon className={`h-5 w-5 ${colorClass(f.color, "text")}`} />
                </div>
                <div>
                  <h3 className="font-bold text-base">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Cara Kerja */}
      <section
        id="cara-kerja"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:sticky lg:top-24 self-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-4">
              <PlayCircle className="h-3 w-3" /> Cara Kerja
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              4 langkah, hasil <br />
              <span className="text-emerald-600">langsung jelas</span>.
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-sm">
              Tidak perlu login, tidak perlu instal. Semua kalkulasi berjalan di
              browser Anda — data tidak dikirim ke server manapun.
            </p>
            <Button
              onClick={onCTAClick}
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="cta-cara-kerja-mulai"
            >
              Mulai Sekarang <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {STEPS.map((s, i) => (
              <Card
                key={s.n}
                className="border-border/70 hover:border-emerald-500/40 transition-all"
              >
                <CardContent className="p-5 flex gap-5 items-start">
                  <div className="text-4xl font-extrabold font-mono text-emerald-600/40 leading-none flex-shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{s.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Deep features (Fitur & Tentang) */}
      <section
        id="tentang"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50"
      >
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
            <Rocket className="h-3 w-3" /> Kenapa StayOrJump
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Bukan sekadar kalkulator Rupiah.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            Analisa multi-dimensi supaya keputusan karir Anda didasari data,
            bukan cuma tawaran gaji yang lebih tinggi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEEP_FEATURES.map((f) => (
            <Card
              key={f.title}
              className="border-border/70 hover:border-emerald-500/40 transition-all"
            >
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
              Tawaran barumu sudah muncul.
              <br />
              Sekarang giliran <span className="text-emerald-400">datanya</span>{" "}
              yang bicara.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-4 max-w-lg mx-auto">
              Hitung selama 2 menit dan Anda punya jawaban yang bisa
              dipertanggungjawabkan — bukan tebak-tebakan.
            </p>
            <Button
              onClick={onCTAClick}
              size="lg"
              data-testid="cta-final"
              className="mt-6 h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/30"
            >
              Buka Kalkulator Sekarang
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PreviewMock() {
  return (
    <div className="relative rounded-3xl bg-background border border-border/80 shadow-2xl shadow-black/5 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5" /> Hasil Rekomendasi
        </div>
        <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          preview
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* STAY */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-widest">STAY</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">
                Total Kompensasi Tahunan
              </div>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold num text-emerald-600">
            Rp 180.250.000
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">/ tahun</div>
        </div>

        <div className="text-xs text-muted-foreground font-bold">VS</div>

        {/* JUMP */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Rocket className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-extrabold tracking-widest">JUMP</div>
              <div className="text-[10px] text-muted-foreground -mt-0.5">
                Total Kompensasi Tahunan
              </div>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold num text-purple-600">
            Rp 228.750.000
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">/ tahun</div>
        </div>
      </div>

      {/* Recommendation strip */}
      <div className="rounded-2xl bg-muted/50 border border-border/70 p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">Rekomendasi:</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-base font-extrabold">JUMP</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
              JUMP lebih menguntungkan
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-extrabold num text-emerald-600">
            + Rp 48.500.000
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            +26.9% per tahun
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Periode Perhitungan", value: "5 Tahun" },
          { label: "Tingkat Keyakinan", value: "82%", bar: 82 },
          { label: "Skenario", value: "Expected" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/70 p-3">
            <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">
              {s.label}
            </div>
            <div className="text-sm font-bold mt-1 num">{s.value}</div>
            {s.bar && (
              <div className="h-1 rounded-full bg-muted overflow-hidden mt-1.5">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${s.bar}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
