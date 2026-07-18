"use client";
// ─────────────────────────────────────────────────────────────
// src/components/dashboard/RiskAlertCard.tsx
// SPRINT 2: Dark tema. Props API değişmedi ✅
// ─────────────────────────────────────────────────────────────

import { AlertTriangle, AlertCircle, Info, ExternalLink } from "lucide-react";
import type { RiskAlert, RiskLevel } from "@/types/travel";

interface RiskAlertCardProps {
  alerts: RiskAlert[];
}

const LEVEL_CONFIG: Record<RiskLevel, {
  bg: string; border: string; iconColor: string;
  textColor: string; fineColor: string;
  Icon: typeof AlertTriangle; label: string;
}> = {
  CRITICAL: {
    bg: "bg-red-500/5", border: "border-red-500/20",
    iconColor: "text-red-400", textColor: "text-red-200",
    fineColor: "text-red-400", Icon: AlertTriangle, label: "Kritik",
  },
  WARNING: {
    bg: "bg-amber-500/5", border: "border-amber-500/20",
    iconColor: "text-amber-400", textColor: "text-amber-200",
    fineColor: "text-amber-400", Icon: AlertCircle, label: "Uyarı",
  },
  INFO: {
    bg: "bg-blue-500/5", border: "border-blue-500/20",
    iconColor: "text-blue-400", textColor: "text-blue-200",
    fineColor: "text-blue-400", Icon: Info, label: "Bilgi",
  },
};

const LEVEL_ORDER: RiskLevel[] = ["CRITICAL", "WARNING", "INFO"];

function RiskAlertItem({ alert }: { alert: RiskAlert }) {
  const cfg = LEVEL_CONFIG[alert.level];
  const { Icon } = cfg;
  return (
    <div className={`flex gap-4 rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <p className={`text-sm font-semibold ${cfg.textColor}`}>{alert.title}</p>
          {alert.potentialFine > 0 && (
            <span className={`shrink-0 rounded-md bg-slate-900/60 px-2 py-0.5 font-mono text-xs font-bold border border-slate-700 ${cfg.fineColor}`}>
              €{alert.potentialFine}'e kadar
            </span>
          )}
        </div>
        <p className={`mt-1 text-xs leading-relaxed opacity-70 ${cfg.textColor}`}>
          {alert.description}
        </p>
        {alert.actionLabel && alert.actionHref && (
          <a
            href={alert.actionHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2.5 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2 ${cfg.iconColor}`}
          >
            {alert.actionLabel}
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

export function RiskAlertCard({ alerts }: RiskAlertCardProps) {
  const sorted = [...alerts].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  );
  const criticalCount = alerts.filter((a) => a.level === "CRITICAL").length;
  const totalFine = alerts.reduce((s, a) => s + a.potentialFine, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <h2 className="text-sm font-semibold text-white">Risk Uyarıları</h2>
          {criticalCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {criticalCount}
            </span>
          )}
        </div>
        {totalFine > 0 && (
          <span className="text-xs text-slate-500">
            Risk altında:{" "}
            <span className="font-semibold text-red-400">€{totalFine}</span>
          </span>
        )}
      </div>

      <div className="space-y-3 p-6">
        {sorted.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            Risk tespit edilmedi. Yolculuğunuz güvenli ✓
          </p>
        ) : (
          sorted.map((alert) => <RiskAlertItem key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
}
