import React, { useEffect, useState } from "react";
import {
  getAllCalculations,
  deleteCalculation,
  clearCalculations,
} from "@/lib/idb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";
import { Trash2, RefreshCw, Archive, HistoryIcon } from "lucide-react";
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

export default function HistoryList({ refreshKey, onLoad }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    await deleteCalculation(id);
    toast.success("Riwayat dihapus");
    load();
  };

  const handleClearAll = async () => {
    await clearCalculations();
    toast.success("Semua riwayat dibersihkan");
    load();
  };

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
        {items.map((it) => (
          <Card
            key={it.id}
            className="border-border/70 hover:border-emerald-500/50 transition-colors group"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground font-mono">
                    {new Date(it.createdAt).toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm font-semibold mt-0.5">
                    {it.label || "Perhitungan"}
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
              <div className="grid grid-cols-2 gap-2 text-xs">
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
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => onLoad(it)}
                >
                  Muat Ulang
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-red-600"
                  onClick={() => handleDelete(it.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
