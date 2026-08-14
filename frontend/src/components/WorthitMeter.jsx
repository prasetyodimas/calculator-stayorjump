import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function WorthitMeter({ score, recommendation, label, color }) {
  const colorMap = {
    emerald: {
      stroke: "#059669",
      bg: "from-emerald-500/10 to-emerald-500/5",
      text: "text-emerald-700 dark:text-emerald-400",
      badge: "bg-emerald-600 text-white",
      icon: TrendingUp,
    },
    crimson: {
      stroke: "#dc2626",
      bg: "from-red-500/10 to-red-500/5",
      text: "text-red-700 dark:text-red-400",
      badge: "bg-red-600 text-white",
      icon: TrendingDown,
    },
    amber: {
      stroke: "#d97706",
      bg: "from-amber-500/10 to-amber-500/5",
      text: "text-amber-700 dark:text-amber-400",
      badge: "bg-amber-600 text-white",
      icon: Minus,
    },
  };
  const cfg = colorMap[color] || colorMap.amber;
  const Icon = cfg.icon;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      data-testid="worthit-score-meter"
      className={`relative rounded-2xl bg-gradient-to-br ${cfg.bg} border border-border p-6`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Gauge */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-muted opacity-30"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={cfg.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="gauge-arc transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-extrabold num" data-testid="worthit-score-value">
              {score}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-0.5">
              worthit score
            </div>
          </div>
        </div>

        {/* Label */}
        <div className="flex-1 text-center sm:text-left">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cfg.badge}`}
            data-testid="recommendation-badge"
          >
            <Icon className="h-3.5 w-3.5" />
            {recommendation}
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold mt-3 ${cfg.text}`}>
            {label}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Berdasarkan analisa pesangon, benefit, dan proyeksi 5 tahun ke depan.
          </p>
        </div>
      </div>
    </div>
  );
}
