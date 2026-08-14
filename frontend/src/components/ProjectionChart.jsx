import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart as LineIcon } from "lucide-react";
import { formatIDR, formatIDRShort } from "@/lib/format";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background/95 backdrop-blur px-3 py-2 shadow-lg">
      <div className="text-xs font-semibold text-muted-foreground mb-1">
        {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="font-medium">{p.dataKey}:</span>
          <span className="num font-semibold">{formatIDR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function ProjectionChart({ data, stayFinal, moveFinal }) {
  const showMove = data.some((d) => d.Pindah > 0);
  const selisih = stayFinal - moveFinal;
  const stayBetter = selisih > 0;

  return (
    <Card className="border-border/70 shadow-sm" data-testid="tab-proyeksi">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <LineIcon className="h-4 w-4 text-emerald-600" />
            </div>
            Proyeksi Kumulatif 5 Tahun
          </CardTitle>
          {showMove && (
            <div className="flex items-center gap-3 text-xs">
              <div className="text-right">
                <div className="text-muted-foreground">Selisih Stay vs Pindah</div>
                <div
                  className={`text-lg font-bold num ${
                    stayBetter ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {stayBetter ? "+" : ""}
                  {formatIDR(selisih)}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorStay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorMove" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
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
                tick={{ fontSize: 11 }}
                stroke="currentColor"
                className="text-muted-foreground"
              />
              <YAxis
                tickFormatter={(v) => formatIDRShort(v)}
                tick={{ fontSize: 11 }}
                stroke="currentColor"
                className="text-muted-foreground"
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Area
                type="monotone"
                dataKey="Stay"
                stroke="#059669"
                strokeWidth={2.5}
                fill="url(#colorStay)"
              />
              {showMove && (
                <Area
                  type="monotone"
                  dataKey="Pindah"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  fill="url(#colorMove)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
