"use client";
// ─────────────────────────────────────────────────────────────
// src/components/dashboard/DashboardClientWrapper.tsx
// SPRINT 3 — Person M yeni sarmalayıcı
//
// Görev:
//   1. Context'ten (Person A'nın TravelContext) canlı veri çeker.
//   2. Context boşsa localStorage'a düşer.
//   3. Her ikisi de boşsa props'tan gelen initialAnalysis'i kullanır.
//   4. BaggageComplianceCard'ı en üste yerleştirir.
//
// Bu yapı Server Component (page.tsx) ile Client Context'in
// çakışmasını önler — "hybrid hydration" pattern.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanLine, RefreshCw, Shield } from "lucide-react";

import { useTravel }                  from "@/context/TravelContext";
import { BaggageComplianceCard }       from "@/components/dashboard/BaggageComplianceCard";
import { TravelSummaryCard }           from "@/components/dashboard/TravelSummaryCard";
import { RiskAlertCard }               from "@/components/dashboard/RiskAlertCard";
import { SavingsCard }                 from "@/components/dashboard/SavingsCard";
import { AlternativeTransportCard }    from "@/components/dashboard/AlternativeTransportCard";
import { FeeBreakdownCard }            from "@/components/dashboard/FeeBreakdownCard";
import { DashboardSkeleton }           from "@/components/dashboard/DashboardStates";

import type { AnalysisResult, BaggageAnalysis } from "@/types/travel";

interface DashboardClientWrapperProps {
  /** Server Component'ten gelen mock/initial veri (fallback) */
  initialAnalysis: AnalysisResult | null;
}

// ── localStorage anahtar sabitleri ───────────────────────────
const LS_ANALYSIS = "ts_analysisResult";
const LS_BAGGAGE  = "ts_baggageResult";

export function DashboardClientWrapper({ initialAnalysis }: DashboardClientWrapperProps) {
  const router = useRouter();
  const { analysisResult, baggageResult, isLoading } = useTravel();

  // Hydration sonrası localStorage'dan oku (SSR uyumlu)
  const [lsAnalysis, setLsAnalysis] = useState<AnalysisResult | null>(null);
  const [lsBaggage,  setLsBaggage]  = useState<BaggageAnalysis | null>(null);
  const [hydrated,   setHydrated]   = useState(false);

  useEffect(() => {
    try {
      const a = localStorage.getItem(LS_ANALYSIS);
      const b = localStorage.getItem(LS_BAGGAGE);
      if (a) setLsAnalysis(JSON.parse(a));
      if (b) setLsBaggage(JSON.parse(b));
    } catch {
      // localStorage erişim hatası — sessizce geç
    }
    setHydrated(true);
  }, []);

  // ── Öncelik sırası: Context > localStorage > initialAnalysis
  const activeAnalysis: AnalysisResult | null =
    analysisResult ?? lsAnalysis ?? initialAnalysis;

  const activeBaggage: BaggageAnalysis | null =
    baggageResult ?? lsBaggage ?? initialAnalysis?.baggageAnalysis ?? null;

  // ── Loading: Person A'nın 2.6s simülasyonu veya localStorage okuması ──
  if (isLoading || !hydrated) {
    return <DashboardSkeleton />;
  }

  // ── Boş durum: hiçbir veri yok ───────────────────────────────
  if (!activeAnalysis && !activeBaggage) {
    return <EmptyState onNavigate={() => router.push("/analyze")} />;
  }

  // ── Kritik sayaç ─────────────────────────────────────────────
  const criticalCount = activeAnalysis?.risks.filter((r) => r.level === "CRITICAL").length ?? 0;

  return (
    <>
      {/* Sayfa başlığı */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Seyahat Analizi</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {activeAnalysis
              ? `${new Date(activeAnalysis.analyzedAt).toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} tarihinde tarandı`
              : "Bagaj analizi tamamlandı"}
            {criticalCount > 0 && (
              <span className="ml-2 font-semibold text-red-400">
                · {criticalCount} kritik sorun
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => router.push("/analyze")}
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <RefreshCw size={13} />
          Yeniden Tara
        </button>
      </div>

      <div className="space-y-5">
        {/* ── Sprint 3: BaggageComplianceCard en üstte ── */}
        {activeBaggage && (
          <BaggageComplianceCard baggage={activeBaggage} />
        )}

        {/* ── Sprint 2 kartları: Yalnızca seyahat analizi varsa ── */}
        {activeAnalysis && (
          <>
            <TravelSummaryCard segment={activeAnalysis.segment} />
            <RiskAlertCard alerts={activeAnalysis.risks} />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <SavingsCard savings={activeAnalysis.savings} />
              <AlternativeTransportCard alternatives={activeAnalysis.alternatives} />
            </div>
            <FeeBreakdownCard fees={activeAnalysis.fees} />
          </>
        )}
      </div>

      <p className="mt-8 pb-6 text-center text-[11px] text-slate-600 leading-relaxed">
        Travel Shield Yapay Zeka yalnızca bilgilendirme amaçlıdır.
        Seyahat kurallarını her zaman operatörünüzle doğrulayın.
      </p>
    </>
  );
}

// ── Premium boş durum ─────────────────────────────────────────
function EmptyState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-6">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
          <ScanLine size={36} className="text-slate-600" />
        </div>
        <span className="absolute inset-0 animate-ping rounded-2xl bg-slate-700 opacity-20" />
      </div>
      <h2 className="text-xl font-bold text-white">Analiz edilmiş bilet bulunamadı</h2>
      <p className="mt-3 max-w-sm text-sm text-slate-400 leading-relaxed">
        Seyahat belgelerinizi yükleyin veya AI Agent giriş panelini kullanarak
        biletinizi ve bagajınızı taramaya başlayın.
      </p>
      <button
        onClick={onNavigate}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all"
      >
        <ScanLine size={16} />
        AI Agent Panelini Aç
      </button>
      <p className="mt-4 text-xs text-slate-600">
        Ya da Telegram botumuz üzerinden bilet PDF'inizi iletin
      </p>
    </div>
  );
}

// ── Sticky nav — DashboardShell'den taşındı ───────────────────
export function DashboardNav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
            <Shield size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white">Travel Shield</span>
        </div>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
          Koruma Aktif
        </span>
      </div>
    </nav>
  );
}
