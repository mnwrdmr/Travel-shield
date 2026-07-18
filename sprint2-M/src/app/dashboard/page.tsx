"use client";

// ─────────────────────────────────────────────────────────────
// src/app/dashboard/page.tsx
// SPRINT 2 — Person M exclusive work dock
//
// DEĞIŞIKLIKLER (Sprint 1 → Sprint 2):
//   ❌ KALDIRILDI: getAnalysis(), MOCK_ANALYSIS, mock-analysis.ts importu
//   ❌ KALDIRILDI: Suspense + async server component mimarisi
//   ✅ EKLENDİ   : useTravel() context hook (Person A'nın TravelContext)
//   ✅ EKLENDİ   : null guard → premium empty state
//   ✅ EKLENDİ   : dark theme uyumu
//   ✅ KORUNDU   : Tüm kart bileşenleri — prop API değişmedi
// ─────────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { Shield, RefreshCw } from "lucide-react";

import { useTravel } from "@/context/TravelContext";          // Person A
import { TravelSummaryCard }       from "@/components/dashboard/TravelSummaryCard";
import { RiskAlertCard }           from "@/components/dashboard/RiskAlertCard";
import { SavingsCard }             from "@/components/dashboard/SavingsCard";
import { AlternativeTransportCard } from "@/components/dashboard/AlternativeTransportCard";
import { FeeBreakdownCard }         from "@/components/dashboard/FeeBreakdownCard";
import { DashboardSkeleton, DashboardEmpty } from "@/components/dashboard/DashboardStates";

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { analysisResult, isLoading } = useTravel();          // ← Live context

  // ── Loading state (Person Y'nin 2.6s animasyonu biterken) ──
  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardSkeleton />
      </DashboardShell>
    );
  }

  // ── Empty state: kullanıcı direkt /dashboard'a geldi ───────
  if (!analysisResult) {
    return (
      <DashboardShell>
        <DashboardEmpty onNavigate={() => router.push("/analyze")} />
      </DashboardShell>
    );
  }

  // ── Dolu state: context'ten gelen canlı veri ───────────────
  const { segment, risks, savings, alternatives, fees, analyzedAt } = analysisResult;
  const criticalCount = risks.filter((r) => r.level === "CRITICAL").length;

  return (
    <DashboardShell>
      {/* Sayfa başlığı */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Seyahat Analizi</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {new Date(analyzedAt).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            tarihinde tarandı
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

      {/* Kart grid — prop API Sprint 1 ile aynı ✅ */}
      <div className="space-y-5">
        <TravelSummaryCard segment={segment} />
        <RiskAlertCard alerts={risks} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <SavingsCard savings={savings} />
          <AlternativeTransportCard alternatives={alternatives} />
        </div>

        <FeeBreakdownCard fees={fees} />
      </div>

      {/* Yasal uyarı */}
      <p className="mt-8 pb-6 text-center text-[11px] text-slate-600 leading-relaxed">
        Travel Shield Yapay Zeka yalnızca bilgilendirme amaçlıdır.
        Seyahat kurallarını her zaman operatörünüzle doğrulayın.
      </p>
    </DashboardShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Shell: dark tema wrapper — Person A'nın global bg ile uyumlu
// ─────────────────────────────────────────────────────────────
function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Travel Shield</span>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
            Koruma Aktif
          </span>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
