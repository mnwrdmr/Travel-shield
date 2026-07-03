// ─────────────────────────────────────────────
// app/dashboard/page.tsx
// Route: /dashboard
//
// FILE PLACEMENT NOTE (avoid merge conflicts):
//   Person A (landing page) owns:  src/app/(marketing)/
//   Person B (backend/API) owns:   src/app/api/
//   Person C (YOU) owns:           src/app/dashboard/
//                                  src/components/dashboard/
//                                  src/types/travel.ts
//                                  src/lib/mock-analysis.ts
//                                  src/lib/operator-meta.ts
//
// To use real data later: swap getAnalysis() in lib/mock-analysis.ts.
// No changes needed in this file.
// ─────────────────────────────────────────────

import { Suspense } from "react";
import { getAnalysis, MOCK_ANALYSIS } from "@/lib/mock-analysis";
import { TravelSummaryCard } from "@/components/dashboard/TravelSummaryCard";
import { RiskAlertCard } from "@/components/dashboard/RiskAlertCard";
import { SavingsCard } from "@/components/dashboard/SavingsCard";
import { AlternativeTransportCard } from "@/components/dashboard/AlternativeTransportCard";
import { FeeBreakdownCard } from "@/components/dashboard/FeeBreakdownCard";
import {
  DashboardSkeleton,
  DashboardEmpty,
} from "@/components/dashboard/DashboardStates";
import { Shield, RefreshCw } from "lucide-react";

// ─────────────────────────────────────────────
// Inner async component (runs on server)
// ─────────────────────────────────────────────
async function DashboardContent({ id }: { id: string }) {
  const analysis = await getAnalysis(id);

  if (!analysis) return <DashboardEmpty />;

  const { segment, risks, savings, alternatives, fees, analyzedAt } = analysis;

  const criticalCount = risks.filter((r) => r.level === "CRITICAL").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Trip Analysis</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            Son tarama{" "}
            {new Date(analyzedAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {criticalCount > 0 && (
              <span className="ml-2 font-semibold text-red-500">
                · {criticalCount} kritik sorun{criticalCount > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
          <RefreshCw size={13} />
          Yeniden Tara
        </button>
      </div>

      {/* Row 1: Full-width travel summary */}
      <TravelSummaryCard segment={segment} />

      {/* Row 2: Full-width risk alerts */}
      <RiskAlertCard alerts={risks} />

      {/* Row 3: Savings + Alternatives side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SavingsCard savings={savings} />
        <AlternativeTransportCard alternatives={alternatives} />
      </div>

      {/* Row 4: Full-width fee breakdown */}
      <FeeBreakdownCard fees={fees} />

      {/* Footer disclaimer */}
      <p className="pb-8 text-center text-[11px] text-slate-300 leading-relaxed">
        Travel Shield Yapay Zeka yalnızca bilgilendirme amaçlıdır. Seyahat öncesi rezervasyon kurallarını operatörünüzle doğrulayın.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page export (Next.js App Router)
// ─────────────────────────────────────────────
export default function DashboardPage() {
  // In production, read ?id= from searchParams or session.
  // For Sprint 1: hardcode the mock ID.
  const ANALYSIS_ID = MOCK_ANALYSIS.id;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav bar */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Travel Shield
            </span>
          </div>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            Protected
          </span>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent id={ANALYSIS_ID} />
        </Suspense>
      </main>
    </div>
  );
}
