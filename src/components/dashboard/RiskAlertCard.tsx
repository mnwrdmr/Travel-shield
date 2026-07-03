// ─────────────────────────────────────────────
// components/dashboard/RiskAlertCard.tsx
// One card per risk alert. Accepts a list of alerts
// and renders them stacked with severity ordering.
// ─────────────────────────────────────────────

import { AlertTriangle, AlertCircle, Info, ExternalLink } from "lucide-react";
import type { RiskAlert, RiskLevel } from "@/types/travel";

interface RiskAlertCardProps {
  alerts: RiskAlert[];
}

const LEVEL_CONFIG: Record<
  RiskLevel,
  {
    bg: string;
    border: string;
    iconColor: string;
    textColor: string;
    fineColor: string;
    Icon: typeof AlertTriangle;
    label: string;
  }
> = {
  CRITICAL: {
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-500",
    textColor: "text-red-900",
    fineColor: "text-red-600",
    Icon: AlertTriangle,
    label: "Kritik",
  },
  WARNING: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-500",
    textColor: "text-amber-900",
    fineColor: "text-amber-600",
    Icon: AlertCircle,
    label: "Uyarı",
  },
  INFO: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-500",
    textColor: "text-blue-900",
    fineColor: "text-blue-600",
    Icon: Info,
    label: "Bilgi",
  },
};

const LEVEL_ORDER: RiskLevel[] = ["CRITICAL", "WARNING", "INFO"];

function RiskAlertItem({ alert }: { alert: RiskAlert }) {
  const cfg = LEVEL_CONFIG[alert.level];
  const { Icon } = cfg;

  return (
    <div
      className={`flex gap-4 rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <p className={`text-sm font-semibold ${cfg.textColor}`}>
            {alert.title}
          </p>
          {alert.potentialFine > 0 && (
            <span
              className={`shrink-0 rounded-md bg-white/70 px-2 py-0.5 font-mono text-xs font-bold ${cfg.fineColor}`}
            >
              up to €{alert.potentialFine}
            </span>
          )}
        </div>
        <p className={`mt-1 text-xs leading-relaxed ${cfg.textColor} opacity-80`}>
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="text-sm font-semibold text-slate-900">Risk Alerts</h2>
          {criticalCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {criticalCount}
            </span>
          )}
        </div>
        {totalFine > 0 && (
          <span className="text-xs text-slate-400">
            Risk altında: {" "}
            <span className="font-semibold text-red-500">€{totalFine}</span>{" "}
            
          </span>
        )}
      </div>

      {/* Alerts list */}
      <div className="space-y-3 p-6">
        {sorted.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            Risk tespit edilmedi. Yolculuğunuz güvenli ✓
          </p>
        ) : (
          sorted.map((alert) => <RiskAlertItem key={alert.id} alert={alert} />)
        )}
      </div>
    </div>
  );
}
