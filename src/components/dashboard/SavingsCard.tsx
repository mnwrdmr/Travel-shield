// ─────────────────────────────────────────────
// components/dashboard/SavingsCard.tsx
// Big green hero number + itemised breakdown.
// ─────────────────────────────────────────────

import { ShieldCheck, TrendingDown } from "lucide-react";
import type { Savings } from "@/types/travel";

interface SavingsCardProps {
  savings: Savings;
}

export function SavingsCard({ savings }: SavingsCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-sm overflow-hidden">
      {/* Hero section */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2 text-emerald-600">
          <ShieldCheck size={16} />
          <p className="text-xs font-semibold uppercase tracking-widest">
            AI Savings
          </p>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="font-mono text-6xl font-black leading-none tracking-tight text-emerald-500">
            €{savings.totalSaved}
          </span>
          <span className="mb-2 text-sm font-medium text-emerald-400">
            {savings.currency} engellendi
          </span>
        </div>

        <p className="mt-2 text-xs text-emerald-600/70">
          Seyahat öncesi engellenen ücret ve tuzaklar.
        </p>
      </div>

      {/* Breakdown list */}
      <div className="border-t border-emerald-100 divide-y divide-emerald-100">
        {savings.breakdown.map((item, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <TrendingDown size={13} className="shrink-0 text-emerald-400" />
              <p className="truncate text-xs text-slate-600">{item.category}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="font-mono text-xs text-slate-400 line-through">
                €{item.originalCost}
              </span>
              <span className="font-mono text-sm font-bold text-emerald-600">
                −€{item.savedAmount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
