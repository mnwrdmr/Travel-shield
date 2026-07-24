"use client";
// ─────────────────────────────────────────────────────────────
// src/components/dashboard/FeeBreakdownCard.tsx
// SPRINT 2: Dark tema. Props API değişmedi ✅
// ─────────────────────────────────────────────────────────────

import { CheckCircle, XCircle } from "lucide-react";
import type { FeeLineItem } from "@/types/travel";

interface FeeBreakdownCardProps {
  fees: FeeLineItem[];
}

export function FeeBreakdownCard({ fees }: FeeBreakdownCardProps) {
  const maxAmount = Math.max(...fees.map((f) => f.amount), 1);
  const totalAtRisk  = fees.filter((f) => !f.avoided).reduce((s, f) => s + f.amount, 0);
  const totalAvoided = fees.filter((f) =>  f.avoided).reduce((s, f) => s + f.amount, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      <div className="border-b border-slate-800 px-6 py-4">
        <h2 className="text-sm font-semibold text-white">Ücret Dökümü</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Bu rezervasyonda tespit edilen tüm ücretler
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 px-6 pt-5">
        <div className="flex-1 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-3 py-3 text-center">
          <p className="font-mono text-xl font-black text-emerald-400">€{totalAvoided}</p>
          <p className="mt-0.5 text-[11px] font-medium text-emerald-600">Engellendi</p>
        </div>
        <div className="flex-1 rounded-xl bg-red-500/5 border border-red-500/20 px-3 py-3 text-center">
          <p className="font-mono text-xl font-black text-red-400">€{totalAtRisk}</p>
          <p className="mt-0.5 text-[11px] font-medium text-red-600">Hâlâ risk altında</p>
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
                  {fee.avoided
                    ? <CheckCircle size={14} className="shrink-0 text-emerald-500" />
                    : <XCircle    size={14} className="shrink-0 text-red-400" />
                  }
                  <p className="truncate text-xs text-slate-400">{fee.label}</p>
                </div>
                <span className={`shrink-0 font-mono text-xs font-bold ${fee.avoided ? "text-emerald-400" : "text-red-400"}`}>
                  €{fee.amount}
                </span>
              </div>
              {/* Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${fee.avoided ? "bg-emerald-500" : "bg-red-500"}`}
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
