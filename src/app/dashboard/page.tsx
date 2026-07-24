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

import { DashboardClientWrapper, DashboardNav } from "@/components/dashboard/DashboardClientWrapper";
import { MOCK_ANALYSIS } from "@/lib/mock-analysis";

export default async function DashboardPage() {
  // Server tarafında initial/fallback veriyi hazırla.
  // Gerçek backend geldiğinde burada fetch() yapılır.
  const initialAnalysis = MOCK_ANALYSIS;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav — client component içinden export edildi */}
      <DashboardNav />

      {/* Ana içerik — tüm mantık wrapper'da */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <DashboardClientWrapper initialAnalysis={initialAnalysis} />
      </main>
    </div>
  );
}
