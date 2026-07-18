"use client";
// ─────────────────────────────────────────────────────────────
// src/components/dashboard/SavingsCard.tsx
// SPRINT 2: Dark tema. Props API değişmedi ✅
// ─────────────────────────────────────────────────────────────

import { ShieldCheck, TrendingDown } from "lucide-react";
import type { Savings } from "@/types/travel";

interface SavingsCardProps {
  savings: Savings;
}

export function SavingsCard({ savings }: SavingsCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-slate-900 shadow-xl overflow-hidden">
      {/* Subtle emerald glow top bar */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* Hero */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck size={16} />
          <p className="text-xs font-semibold uppercase tracking-widest">
            Yapay Zeka Tasarrufu
          </p>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="font-mono text-6xl font-black leading-none tracking-tight text-emerald-400">
            €{savings.totalSaved}
          </span>
          <span className="mb-2 text-sm font-medium text-emerald-600">
            {savings.currency} engellendi
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Seyahat öncesi engellenen ücret ve tuzaklar.
        </p>
      </div>

      {/* Breakdown */}
      <div className="border-t border-slate-800 divide-y divide-slate-800">
        {savings.breakdown.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingDown size={13} className="shrink-0 text-emerald-500" />
              <p className="truncate text-xs text-slate-400">{item.category}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="font-mono text-xs text-slate-600 line-through">
                €{item.originalCost}
              </span>
              <span className="font-mono text-sm font-bold text-emerald-400">
                −€{item.savedAmount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
