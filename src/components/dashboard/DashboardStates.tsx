// ─────────────────────────────────────────────────────────────
// src/components/dashboard/DashboardStates.tsx
// SPRINT 2 DEĞIŞIKLIKLERI:
//   ✅ DashboardEmpty → onNavigate callback prop aldı
//      (router.push dışarıdan enjekte edilir, component saf kalır)
//   ✅ Dark premium tema: slate-950 / slate-800 / emerald aksan
//   ✅ Skeleton renkleri dark background'a uyarlandı
// ─────────────────────────────────────────────────────────────

import { ScanLine } from "lucide-react";

// ── Skeleton pulse ────────────────────────────────────────────
function Pulse({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800 ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Pulse className="h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-5 w-28" />
          </div>
        </div>
        <div className="flex justify-between gap-4 pt-2">
          <Pulse className="h-10 w-24" />
          <Pulse className="h-8 w-10 rounded-full" />
          <Pulse className="h-10 w-24" />
        </div>
      </div>

      {/* Risks */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
        <Pulse className="h-4 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Pulse className="h-5 w-5 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Pulse className="h-3 w-3/4" />
              <Pulse className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Two col */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-14 w-32" />
            {[1, 2, 3].map((j) => <Pulse key={j} className="h-8 w-full" />)}
          </div>
        ))}
      </div>

      {/* Fee breakdown */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
        <Pulse className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-3">
          <Pulse className="h-16 rounded-xl" />
          <Pulse className="h-16 rounded-xl" />
        </div>
        {[1, 2, 3, 4].map((i) => <Pulse key={i} className="h-10 w-full" />)}
      </div>
    </div>
  );
}

// ── Premium Empty State ───────────────────────────────────────
interface DashboardEmptyProps {
  onNavigate: () => void;   // router.push("/analyze") dışarıdan gelir
}

export function DashboardEmpty({ onNavigate }: DashboardEmptyProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6">
      {/* İkon */}
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
          <ScanLine size={36} className="text-slate-600" />
        </div>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-2xl animate-ping bg-slate-700 opacity-20" />
      </div>

      <h2 className="text-xl font-bold text-white">
        Analiz edilmiş bilet bulunamadı
      </h2>

      <p className="mt-3 max-w-sm text-sm text-slate-400 leading-relaxed">
        Seyahat belgelerinizi yükleyin veya AI Agent giriş panelini kullanarak
        biletinizi taramaya başlayın.
      </p>

      {/* CTA — Person A'nın Button bileşenini kullanıyor */}
      <button
        onClick={onNavigate}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all"
      >
        <ScanLine size={16} />
        AI Agent Panelini Aç
      </button>

      {/* Alt not */}
      <p className="mt-4 text-xs text-slate-600">
        Ya da Telegram botumuz üzerinden bilet PDF'inizi iletin
      </p>
    </div>
  );
}
