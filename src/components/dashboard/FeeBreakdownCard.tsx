// ─────────────────────────────────────────────
// components/dashboard/FeeBreakdownCard.tsx
// Visual bar breakdown of potential vs avoided fees.
// No external chart library — pure CSS bars.
// ─────────────────────────────────────────────

import { CheckCircle, XCircle } from "lucide-react";
import type { FeeLineItem } from "@/types/travel";

interface FeeBreakdownCardProps {
  fees: FeeLineItem[];
}

export function FeeBreakdownCard({ fees }: FeeBreakdownCardProps) {
  const maxAmount = Math.max(...fees.map((f) => f.amount), 1);
  const totalAtRisk = fees
    .filter((f) => !f.avoided)
    .reduce((s, f) => s + f.amount, 0);
  const totalAvoided = fees
    .filter((f) => f.avoided)
    .reduce((s, f) => s + f.amount, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Fee Breakdown</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          All potential charges detected on this booking
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 px-6 pt-5">
        <div className="flex-1 rounded-lg bg-emerald-50 px-3 py-2 text-center">
          <p className="font-mono text-xl font-black text-emerald-600">
            €{totalAvoided}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-emerald-500">
            Avoided
          </p>
        </div>
        <div className="flex-1 rounded-lg bg-red-50 px-3 py-2 text-center">
          <p className="font-mono text-xl font-black text-red-500">
            €{totalAtRisk}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-red-400">
            Still 
          </p>
        </div>
      </div>

      {/* Bar list */}
      <div className="space-y-4 p-6">
        {fees.map((fee, i) => {
          const pct = Math.round((fee.amount / maxAmount) * 100);
          return (
            <div key={i}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  {fee.avoided ? (
                    <CheckCircle size={14} className="shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle size={14} className="shrink-0 text-red-400" />
                  )}
                  <p className="truncate text-xs text-slate-600">{fee.label}</p>
                </div>
                <span
                  className={`shrink-0 font-mono text-xs font-bold ${
                    fee.avoided ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  €{fee.amount}
                </span>
              </div>
              {/* Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    fee.avoided ? "bg-emerald-400" : "bg-red-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
