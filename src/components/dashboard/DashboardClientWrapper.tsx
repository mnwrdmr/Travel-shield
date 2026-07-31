"use client";


/**
 * @file DashboardClientWrapper.tsx
 * @description Client-side dashboard sarmalayıcısı.
 *
 * Veri öncelik sırası (cascading fallback):
 *  1. TravelContext (canlı — form doldurulduğunda)
 *  2. localStorage (sayfa yenilendiğinde dayanıklılık)
 *  3. initialAnalysis prop (Server Component'ten gelen mock)
 *
 * Bu pattern, Next.js App Router'da Server Component + Client Context
 * uyumsuzluğunu çözer ("hybrid hydration").
 */

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

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ScanLine, Shield } from "lucide-react";

import { useTravel } from "@/context/TravelContext";

import { BaggageComplianceCard }    from "@/components/dashboard/BaggageComplianceCard";
import { TravelSummaryCard }        from "@/components/dashboard/TravelSummaryCard";
import { RiskAlertCard }            from "@/components/dashboard/RiskAlertCard";
import { SavingsCard }              from "@/components/dashboard/SavingsCard";
import { AlternativeTransportCard } from "@/components/dashboard/AlternativeTransportCard";
import { FeeBreakdownCard }         from "@/components/dashboard/FeeBreakdownCard";
import { DashboardSkeleton }        from "@/components/dashboard/DashboardStates";

import type { AnalysisResult, BaggageAnalysis } from "@/types/travel";

// ─── localStorage anahtarları ─────────────────────────────────
const LS_KEYS = {
  analysis: "ts_analysisResult_v1",
  baggage:  "ts_baggageResult_v1",
} as const;

// ─── localStorage yardımcıları ────────────────────────────────

const dashboardCache: Record<string, { raw: string | null; parsed: unknown }> = {};

function readFromStorage<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (dashboardCache[key] && dashboardCache[key].raw === raw) {
      return dashboardCache[key].parsed as T | null;
    }
    const parsed = raw ? (JSON.parse(raw) as T) : null;
    dashboardCache[key] = { raw, parsed };
    return parsed;
  } catch {
    return null;
  }
}

const subscribeToStorage = () => () => {};

// ─── Prop tipleri ─────────────────────────────────────────────

interface DashboardClientWrapperProps {
  /** Server Component'ten gelen fallback veri */
  initialAnalysis: AnalysisResult | null;
}

// ─── Boş durum ────────────────────────────────────────────────

interface EmptyStateProps {
  onNavigate: () => void;
}

function EmptyState({ onNavigate }: EmptyStateProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
          <ScanLine size={36} className="text-slate-600" aria-hidden />
        </div>
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-2xl bg-slate-700 opacity-20"
        />
      </div>

      <h2 className="text-xl font-bold text-white">
        Analiz edilmiş bilet bulunamadı
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
        Seyahat belgelerinizi yükleyin veya AI Agent giriş panelini kullanarak
        biletinizi ve bagajınızı taramaya başlayın.
      </p>

      <button
        type="button"
        onClick={onNavigate}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-95"
      >
        <ScanLine size={16} aria-hidden />
        AI Agent Panelini Aç
      </button>

      <p className="mt-4 text-xs text-slate-600">
        Ya da Telegram botumuz üzerinden bilet PDF'inizi iletin
      </p>
    </div>
  );
}

// ─── Sayfa başlığı ────────────────────────────────────────────

interface PageHeaderProps {
  analyzedAt: string;
  criticalCount: number;
  onRescan: () => void;
}

function PageHeader({ analyzedAt, criticalCount, onRescan }: PageHeaderProps) {
  const timeLabel = new Date(analyzedAt).toLocaleTimeString("tr-TR", {
    hour:   "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">Seyahat Analizi</h1>
        <p className="mt-0.5 text-xs text-slate-400">
          {timeLabel} tarihinde tarandı
          {criticalCount > 0 && (
            <span className="ml-2 font-semibold text-red-400">
              · {criticalCount} kritik sorun
            </span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={onRescan}
        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
      >
        <RefreshCw size={13} aria-hidden />
        Yeniden Tara
      </button>
    </div>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────

export function DashboardClientWrapper({ initialAnalysis }: DashboardClientWrapperProps) {
  const router = useRouter();
  const { analysisResult, baggageResult, isLoading } = useTravel();

  const lsAnalysis = useSyncExternalStore(
    subscribeToStorage,
    () => readFromStorage<AnalysisResult>(LS_KEYS.analysis),
    () => null,
  );
  const lsBaggage = useSyncExternalStore(
    subscribeToStorage,
    () => readFromStorage<BaggageAnalysis>(LS_KEYS.baggage),
    () => null,
  );

  // Veri öncelik sırası
  const activeAnalysis = analysisResult ?? lsAnalysis ?? initialAnalysis;
  const activeBaggage  = baggageResult  ?? lsBaggage  ?? initialAnalysis?.baggageAnalysis ?? null;

  if (isLoading) return <DashboardSkeleton />;

  if (!activeAnalysis && !activeBaggage) {
    return <EmptyState onNavigate={() => router.push("/analyze")} />;
  }

  const criticalCount =
    activeAnalysis?.risks.filter((r) => r.level === "CRITICAL").length ?? 0;

  return (
    <>
      {activeAnalysis && (
        <PageHeader
          analyzedAt={activeAnalysis.analyzedAt}
          criticalCount={criticalCount}
          onRescan={() => router.push("/analyze")}
        />
      )}

      <div className="space-y-5">
        {/* Sprint 3 — Bagaj kartı en üstte */}
        {activeBaggage && (
          <BaggageComplianceCard baggage={activeBaggage} />
        )}

        {/* Sprint 2 — Seyahat kartları */}
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

    </>
  );
}

// ─── Sticky nav (page.tsx'ten export edilir) ──────────────────

export function DashboardNav() {
  return (
    <nav
      aria-label="Dashboard navigasyon"
      className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
            <Shield size={14} className="text-white" aria-hidden />
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
