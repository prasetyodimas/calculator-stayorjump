import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Scale } from "lucide-react";
import { ALASAN_PHK } from "@/lib/pesangon";

export default function LegalGuide() {
  return (
    <div className="space-y-4">
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            Panduan Perhitungan Pesangon
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Perhitungan pesangon di aplikasi ini mengacu pada{" "}
            <strong>UU No. 6 Tahun 2023 (UU Cipta Kerja)</strong> yang aturan
            teknisnya diatur dalam{" "}
            <strong>Peraturan Pemerintah No. 35 Tahun 2021</strong>. Struktur
            hak karyawan yang di-PHK terdiri dari tiga komponen utama: Uang
            Pesangon (UP), Uang Penghargaan Masa Kerja (UPMK), dan Uang
            Penggantian Hak (UPH).
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-emerald-600" />
            </div>
            Tabel Uang Pesangon (UP) - Pasal 40 ayat (2)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-semibold">Masa Kerja</th>
                  <th className="text-right py-2 font-semibold">Bulan Upah</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["< 1 tahun", "1"],
                  ["1 - < 2 tahun", "2"],
                  ["2 - < 3 tahun", "3"],
                  ["3 - < 4 tahun", "4"],
                  ["4 - < 5 tahun", "5"],
                  ["5 - < 6 tahun", "6"],
                  ["6 - < 7 tahun", "7"],
                  ["7 - < 8 tahun", "8"],
                  ["≥ 8 tahun", "9"],
                ].map(([m, u]) => (
                  <tr key={m} className="border-b border-border/50">
                    <td className="py-1.5">{m}</td>
                    <td className="py-1.5 text-right num font-semibold">{u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-600" />
            </div>
            Tabel UPMK - Pasal 40 ayat (3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-semibold">Masa Kerja</th>
                  <th className="text-right py-2 font-semibold">Bulan Upah</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  ["3 - < 6 tahun", "2"],
                  ["6 - < 9 tahun", "3"],
                  ["9 - < 12 tahun", "4"],
                  ["12 - < 15 tahun", "5"],
                  ["15 - < 18 tahun", "6"],
                  ["18 - < 21 tahun", "7"],
                  ["21 - < 24 tahun", "8"],
                  ["≥ 24 tahun", "10"],
                ].map(([m, u]) => (
                  <tr key={m} className="border-b border-border/50">
                    <td className="py-1.5">{m}</td>
                    <td className="py-1.5 text-right num font-semibold">{u}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Scale className="h-4 w-4 text-purple-600" />
            </div>
            Multiplier Berdasarkan Alasan PHK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {ALASAN_PHK.map((a) => (
              <AccordionItem key={a.value} value={a.value}>
                <AccordionTrigger className="text-sm hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                      {a.up}× UP · {a.upmk}× UPMK
                    </span>
                    <span>{a.label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {a.note}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="text-sm">
          <strong className="text-amber-700 dark:text-amber-400">
            Disclaimer:
          </strong>{" "}
          <span className="text-muted-foreground">
            Aplikasi ini adalah alat bantu estimasi. Perhitungan aktual dapat
            berbeda tergantung Peraturan Perusahaan (PP), Perjanjian Kerja
            Bersama (PKB), dan putusan Pengadilan Hubungan Industrial. Konsultasi
            dengan HRD atau ahli hukum ketenagakerjaan disarankan untuk kasus
            spesifik.
          </span>
        </div>
      </div>
    </div>
  );
}
