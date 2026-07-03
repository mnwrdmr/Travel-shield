// ─────────────────────────────────────────────
// components/dashboard/DashboardStates.tsx
// Yüklenme iskeleti + boş durum — Türkçe
// ─────────────────────────────────────────────

import { Search } from "lucide-react";

function Pulse({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Pulse className="h-11 w-11 rounded-xl" />
          <div className="space-y-2">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-5 w-28" />
          </div>
        </div>
        <div className="flex justify-between gap-4 pt-2">
          <Pulse className="h-10 w-20" />
          <Pulse className="h-8 w-16 rounded-full" />
          <Pulse className="h-10 w-20" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <Pulse className="h-4 w-28" />
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-16 w-32" />
          {[1, 2, 3].map((i) => (
            <Pulse key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <Pulse className="h-4 w-24" />
          {[1, 2].map((i) => (
            <Pulse key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardEmpty() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Search size={28} className="text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-800">
        Analiz bulunamadı
      </h2>
      <p className="mt-2 max-w-xs text-sm text-slate-400 leading-relaxed">
        Seyahat analizini başlatmak için rezervasyon onayınızı WhatsApp botuna gönderin.
        Genellikle 30 saniyeden kısa sürer.
      </p>
      <a
        href="https://wa.me/YOUR_NUMBER"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
      >
        WhatsApp Botunu Aç
      </a>
    </div>
  );
}
