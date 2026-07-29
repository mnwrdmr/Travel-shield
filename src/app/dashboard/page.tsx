// ─────────────────────────────────────────────────────────────
// src/app/dashboard/page.tsx
// SPRINT FINAL-personM:
//   ✅ Yasal Uyarı banner eklendi (footer + modal)
//   ✅ DashboardClientWrapper korundu
//   ✅ Server Component mimarisi korundu
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// src/app/dashboard/page.tsx
// SPRINT 3 DEĞIŞIKLIKLERI:
//   ❌ KALDIRILDI: Doğrudan kart import'ları ve useTravel çağrısı
//   ✅ EKLENDİ   : DashboardClientWrapper — tüm mantık orada
//   ✅ EKLENDİ   : MOCK_BAGGAGE_ANALYSIS dahil initialAnalysis prop
//   ✅ KORUNDU   : Server Component mimarisi (page async kalır)
//
// NEDEN BU MİMARİ?
//   Next.js App Router'da useContext kullanmak için "use client"
//   zorunludur ama page.tsx'i "use client" yapmak metadata ve
//   server-side özellikleri kırar. Bu pattern bunu çözer:
//     Server Component (page.tsx) → mock veriyi hazırlar
//     Client Component (Wrapper) → context'i okur, merge eder
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import {
  DashboardClientWrapper,
  DashboardNav,
} from "@/components/dashboard/DashboardClientWrapper";
import { MOCK_ANALYSIS } from "@/lib/mock-analysis";
import LegalDisclaimer from "@/components/dashboard/LegalDisclaimer";

export const metadata: Metadata = {
  title: "Analiz Sonuçları | Travel Shield",
  description:
    "Yapay zeka destekli seyahat bilet ve bagaj analizi sonuçlarınızı görüntüleyin.",
};

export default async function DashboardPage() {
  const initialAnalysis = MOCK_ANALYSIS;

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardNav />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <DashboardClientWrapper initialAnalysis={initialAnalysis} />

        {/* ── Yasal Uyarı (Sprint Final) ── */}
        <LegalDisclaimer />
      </main>
    </div>
  );
}

