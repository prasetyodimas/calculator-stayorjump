import React, { useEffect, useState, useMemo, useRef } from "react";
import "@/App.css";
import { Toaster, toast } from "sonner";
import Header from "@/components/Header";
import InputForm from "@/components/InputForm";
import ResultsPanel from "@/components/ResultsPanel";
import HistoryList from "@/components/HistoryList";
import LegalGuide from "@/components/LegalGuide";
import SharedView from "@/components/SharedView";
import ShareDialog from "@/components/ShareDialog";
import BpjsCalculator from "@/components/BpjsCalculator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { hitungPesangon, hitungWorthitScore } from "@/lib/pesangon";
import { addCalculation } from "@/lib/idb";
import { buildShareUrl, decodeShare } from "@/lib/share";
import { Sparkles, Calculator, History, BookOpen, PiggyBank } from "lucide-react";

const DEFAULT_STATE = {
  gajiPokok: 0,
  tunjanganTetap: 0,
  masaKerjaTahun: 3,
  masaKerjaBulan: 0,
  alasanPHK: "efisiensi_cegah",
  sisaCutiHari: 0,
  ongkosPulang: 0,
  uangPisahNominal: 0,
  thrKali: 1,
  bonusTahunan: 0,
  bpjsKes: 0,
  bpjsTK: 0,
  asuransi: 0,
  transportMakan: 0,
  kenaikanTahunan: 8,
  gajiKantorBaru: 0,
  kenaikanBaru: 8,
};

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem("theme") || "light";
  });
  const [state, setState] = useState(DEFAULT_STATE);
  const [result, setResult] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);
  const [activeTab, setActiveTab] = useState("kalkulator");
  const [sharedPayload, setSharedPayload] = useState(null);
  const [shareDialog, setShareDialog] = useState({ open: false, url: "", meta: null });
  const resultsRef = useRef(null);

  // Detect ?s= share param on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s");
    if (s) {
      const payload = decodeShare(s);
      if (payload) setSharedPayload(payload);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleCalculate = () => {
    if (!state.gajiPokok || state.gajiPokok < 100000) {
      toast.error("Isi gaji pokok terlebih dahulu (min. Rp 100.000)");
      return;
    }
    const pesangon = hitungPesangon(state);
    const worthit = hitungWorthitScore({
      ...state,
      pesangonTotal: pesangon.grandTotal,
    });
    setResult({ pesangon, worthit, input: { ...state } });
    toast.success("Perhitungan selesai!", {
      description: `Total pesangon: ${pesangon.grandTotal.toLocaleString("id-ID")} · Score: ${worthit.score}`,
    });
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleReset = () => {
    setState(DEFAULT_STATE);
    setResult(null);
    toast.info("Form direset");
  };

  const handleSave = async () => {
    if (!result) return;
    const record = {
      id: `calc_${Date.now()}`,
      createdAt: new Date().toISOString(),
      label: `Perhitungan ${new Date().toLocaleDateString("id-ID")}`,
      input: result.input,
      pesangon: result.pesangon,
      worthit: {
        score: result.worthit.score,
        recommendation: result.worthit.recommendation,
        recommendationLabel: result.worthit.recommendationLabel,
        recommendationColor: result.worthit.recommendationColor,
        rationale: result.worthit.rationale,
        breakdown: result.worthit.breakdown,
        stayFinal: result.worthit.stayFinal,
        moveFinal: result.worthit.moveFinal,
      },
    };
    await addCalculation(record);
    setHistoryKey((k) => k + 1);
    toast.success("Riwayat tersimpan di browser Anda");
  };

  const handleLoad = (record) => {
    setState({ ...DEFAULT_STATE, ...record.input });
    setActiveTab("kalkulator");
    toast.info("Kalkulasi dimuat ulang. Klik Hitung untuk melihat hasil.");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handlePrint = () => window.print();

  const handleShare = () => {
    if (!result) return;
    const url = buildShareUrl(result);
    setShareDialog({
      open: true,
      url,
      meta: {
        score: result.worthit.score,
        recommendation: result.worthit.recommendation,
        recommendationLabel: result.worthit.recommendationLabel,
        recommendationColor: result.worthit.recommendationColor,
      },
    });
  };

  const handleExitShared = () => {
    setSharedPayload(null);
    // Clean URL
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const heroStats = useMemo(
    () => [
      { label: "Berdasarkan", value: "PP 35/2021" },
      { label: "Alasan PHK", value: "11 skenario" },
      { label: "Proyeksi", value: "5 Tahun" },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-background text-foreground relative noise-bg">
      {sharedPayload ? (
        <SharedView payload={sharedPayload} onExit={handleExitShared} />
      ) : (
        <>
          <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Hero */}
        <section className="mb-10 no-print">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-4">
              <Sparkles className="h-3 w-3" />
              Kalkulator Legal Indonesia · UU Cipta Kerja
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
              Stay atau <span className="text-emerald-600">Jump?</span>
              <br />
              Hitung dulu <span className="italic font-light">worth-it</span>-nya.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mt-4 leading-relaxed">
              Kalkulator pesangon resmi berbasis PP No. 35 Tahun 2021, plus
              analisa <strong>Worthit Score</strong> dan estimasi{" "}
              <strong>JHT + Jaminan Pensiun</strong> untuk bantu Anda merencanakan
              karir & masa depan.
            </p>
            <div className="flex flex-wrap gap-6 mt-6">
              {heroStats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    {s.label}
                  </span>
                  <span className="text-lg font-bold num">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl h-11 no-print">
            <TabsTrigger
              value="kalkulator"
              data-testid="tab-kalkulator"
              className="gap-1.5"
            >
              <Calculator className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pesangon</span>
            </TabsTrigger>
            <TabsTrigger
              value="bpjs"
              data-testid="tab-bpjs"
              className="gap-1.5"
            >
              <PiggyBank className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">JHT & JP</span>
            </TabsTrigger>
            <TabsTrigger
              value="riwayat"
              data-testid="tab-riwayat"
              className="gap-1.5"
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Riwayat</span>
            </TabsTrigger>
            <TabsTrigger
              value="panduan"
              data-testid="tab-panduan"
              className="gap-1.5"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Panduan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kalkulator" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              <div className="lg:col-span-5 xl:col-span-4">
                <InputForm
                  state={state}
                  setState={setState}
                  onSubmit={handleCalculate}
                  onReset={handleReset}
                />
              </div>
              <div className="lg:col-span-7 xl:col-span-8" ref={resultsRef}>
                {result ? (
                  <ResultsPanel
                    result={result}
                    onSave={handleSave}
                    onPrint={handlePrint}
                    onShare={handleShare}
                  />
                ) : (
                  <EmptyResults />
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="riwayat" className="mt-6">
            <HistoryList refreshKey={historyKey} onLoad={handleLoad} />
          </TabsContent>

          <TabsContent value="bpjs" className="mt-6">
            <BpjsCalculator />
          </TabsContent>

          <TabsContent value="panduan" className="mt-6">
            <LegalGuide />
          </TabsContent>
        </Tabs>

        <footer className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground text-center no-print">
          <p>
            StayOrJump · Estimasi berdasarkan PP 35/2021 · Data disimpan lokal
            di browser Anda
          </p>
        </footer>
      </main>
        </>
      )}

      <ShareDialog
        open={shareDialog.open}
        onOpenChange={(o) => setShareDialog((s) => ({ ...s, open: o }))}
        url={shareDialog.url}
        meta={shareDialog.meta}
      />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 p-8 sm:p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
      <div className="relative mb-5">
        <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Calculator className="h-7 w-7 text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold">Isi form dulu, yuk.</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">
        Masukkan gaji, masa kerja, benefit, dan tawaran baru (opsional). Kami
        akan menghitung pesangon UU Cipta Kerja dan skor &ldquo;layak-bertahan&rdquo;
        secara instan.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-4 text-xs max-w-md">
        {[
          { label: "1", title: "Input Data", desc: "Gaji + benefit" },
          { label: "2", title: "Klik Hitung", desc: "Analisa instan" },
          { label: "3", title: "Ambil Keputusan", desc: "Stay atau Jump" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center">
            <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs mb-1.5">
              {s.label}
            </div>
            <div className="font-semibold text-foreground">{s.title}</div>
            <div className="text-muted-foreground">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
