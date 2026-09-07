import React, { useEffect, useState } from "react";
import {
  getAllCalculations,
  deleteCalculation,
  clearCalculations,
} from "@/lib/idb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatIDR } from "@/lib/format";
import {
  Trash2,
  RefreshCw,
  Archive,
  HistoryIcon,
  Scale,
  Share2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import CompareDialog from "./CompareDialog";
import ShareDialog from "./ShareDialog";
import { buildShareUrl } from "@/lib/share";

export default function HistoryList({ refreshKey, onLoad }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [shareDialog, setShareDialog] = useState({ open: false, url: "", meta: null });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllCalculations();
      setItems(data);
    } catch (e) {
      toast.error("Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) {
        toast.info("Maksimal 2 skenario untuk dibandingkan", {
          description: "Hapus salah satu pilihan terlebih dahulu.",
        });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleDelete = async (id) => {
    await deleteCalculation(id);
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    toast.success("Riwayat dihapus");
    load();
  };

  const handleClearAll = async () => {
    await clearCalculations();
    setSelectedIds([]);
    toast.success("Semua riwayat dibersihkan");
    load();
  };

  const handleShare = (item) => {
    const url = buildShareUrl({
      pesangon: item.pesangon,
      worthit: item.worthit,
      input: item.input,
    });
    setShareDialog({
      open: true,
      url,
      meta: {
        score: item.worthit.score,
        recommendation: item.worthit.recommendation,
        recommendationLabel: item.worthit.recommendationLabel,
        recommendationColor: item.worthit.recommendationColor,
      },
    });
  };

  const itemA = items.find((i) => i.id === selectedIds[0]);
  const itemB = items.find((i) => i.id === selectedIds[1]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Memuat...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-dashed border-border/70">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Archive className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="font-semibold">Belum ada riwayat</div>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Riwayat kalkulasi disimpan lokal di browser Anda (IndexedDB). Klik
            &ldquo;Simpan ke Riwayat&rdquo; setelah menghitung untuk menyimpannya di sini.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3" data-testid="history-list-container">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HistoryIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">
            {items.length} perhitungan tersimpan
          </span>
          {items.length >= 2 && (
            <span className="text-xs text-muted-foreground ml-2">
              · centang 2 untuk membandingkan
            </span>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-red-600">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Bersihkan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus semua riwayat?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak bisa dibatalkan. Semua data kalkulasi di
                browser ini akan hilang.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearAll}>
                Ya, Hapus Semua
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((it) => {
          const isSelected = selectedIds.includes(it.id);
          const selectionIdx = selectedIds.indexOf(it.id);
          return (
            <Card
              key={it.id}
              className={`border-border/70 transition-all group ${
                isSelected
                  ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/[0.02]"
                  : "hover:border-emerald-500/50"
              }`}
              data-testid={`history-card-${it.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2.5 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(it.id)}
                      className="mt-0.5"
                      data-testid={`checkbox-select-${it.id}`}
                    />
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground font-mono">
                        {new Date(it.createdAt).toLocaleString("id-ID")}
                      </div>
                      <div className="text-sm font-semibold mt-0.5">
                        {it.label || "Perhitungan"}
                        {isSelected && (
                          <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                            {String.fromCharCode(65 + selectionIdx)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      it.worthit.recommendationColor === "emerald"
                        ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                        : it.worthit.recommendationColor === "crimson"
                          ? "border-red-500/40 text-red-700 dark:text-red-400"
                          : "border-amber-500/40 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {it.worthit.recommendation} · {it.worthit.score}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pl-6">
                  <div>
                    <span className="text-muted-foreground">Pesangon</span>
                    <div className="num font-bold text-sm">
                      {formatIDR(it.pesangon.grandTotal)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Masa Kerja</span>
                    <div className="font-bold text-sm">
                      {it.input.masaKerjaTahun}t {it.input.masaKerjaBulan}b
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2 pl-6">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs"
                    onClick={() => onLoad(it)}
                    data-testid={`button-load-${it.id}`}
                  >
                    Muat Ulang
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleShare(it)}
                    data-testid={`button-share-history-${it.id}`}
                    title="Bagikan"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600"
                    onClick={() => handleDelete(it.id)}
                    data-testid={`button-delete-${it.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Floating comparison bar */}
      {selectedIds.length > 0 && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full border border-border bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/10 px-2 py-2 flex items-center gap-3 fade-up"
          data-testid="compare-floating-bar"
        >
          <div className="pl-3 flex items-center gap-2">
            <Scale className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold">
              {selectedIds.length}/2 dipilih
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds([])}
            className="h-8 w-8 p-0"
            data-testid="button-clear-selection"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            disabled={selectedIds.length !== 2}
            onClick={() => setCompareOpen(true)}
            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            data-testid="button-bandingkan"
          >
            Bandingkan
          </Button>
        </div>
      )}

      <CompareDialog
        open={compareOpen}
        onOpenChange={setCompareOpen}
        itemA={itemA}
        itemB={itemB}
      />

      <ShareDialog
        open={shareDialog.open}
        onOpenChange={(o) => setShareDialog((s) => ({ ...s, open: o }))}
        url={shareDialog.url}
        meta={shareDialog.meta}
      />
    </div>
  );
}
