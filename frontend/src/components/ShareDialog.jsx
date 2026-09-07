import React, { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Lock,
  QrCode as QrIcon,
  Download,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

export default function ShareDialog({ open, onOpenChange, url, meta }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link disalin ke clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Salin link bagikan:", url);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: "StayOrJump - Analisa Karir Saya",
        text: meta?.recommendationLabel
          ? `Skor Worthit: ${meta.score} · ${meta.recommendationLabel}`
          : "Lihat analisa Stay atau Jump saya",
        url,
      });
    } catch {
      // user canceled — no-op
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 720;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgBlob = new Blob([svgStr], {
      type: "image/svg+xml;charset=utf-8",
    });
    const urlObj = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 40, 40, size - 80, size - 80);
      URL.revokeObjectURL(urlObj);
      const link = document.createElement("a");
      link.download = `stayorjump-qr-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR code diunduh");
    };
    img.src = urlObj;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="share-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-emerald-600" />
            Bagikan Hasil Analisa
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5 text-xs">
            <Lock className="h-3 w-3 text-emerald-600" /> Hanya skor &
            rekomendasi yang dibagikan — gaji asli tidak ikut.
          </DialogDescription>
        </DialogHeader>

        {/* QR Code */}
        <div
          ref={qrRef}
          className="flex flex-col items-center gap-3 py-2"
          data-testid="qr-code-wrapper"
        >
          <div className="relative">
            <div className="rounded-2xl bg-white p-4 shadow-md ring-1 ring-border">
              <QRCodeSVG
                value={url}
                size={200}
                level="M"
                marginSize={0}
                bgColor="#ffffff"
                fgColor="#0f172a"
                imageSettings={{
                  src:
                    "data:image/svg+xml;utf8," +
                    encodeURIComponent(
                      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#059669"/><path d="M8 12l2 2 6-6" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
                    ),
                  height: 34,
                  width: 34,
                  excavate: true,
                }}
              />
            </div>
          </div>

          {meta && (
            <div className="flex items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className={
                  meta.recommendationColor === "emerald"
                    ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold"
                    : meta.recommendationColor === "crimson"
                      ? "border-red-500/40 text-red-700 dark:text-red-400 font-bold"
                      : "border-amber-500/40 text-amber-700 dark:text-amber-400 font-bold"
                }
              >
                {meta.recommendation} · Score {meta.score}
              </Badge>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <QrIcon className="h-3 w-3" /> Scan dari HP untuk buka analisa
          </div>
        </div>

        {/* URL Field */}
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={url}
            className="font-mono text-xs h-9"
            data-testid="share-url-input"
            onFocus={(e) => e.target.select()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-9 shrink-0"
            data-testid="button-copy-share-url"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadQR}
            className="h-10"
            data-testid="button-download-qr"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" /> Unduh QR
          </Button>
          <Button
            onClick={handleNativeShare}
            className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-native-share"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" /> Bagikan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
