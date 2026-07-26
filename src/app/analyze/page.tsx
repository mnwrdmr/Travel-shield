// ─────────────────────────────────────────────
// app/analyze/page.tsx
// Route: /analyze  (TS-103 + TS-104 — Yasin)
// Server wrapper: metadata burada, etkileşimli
// form AnalyzeForm client bileşeninde.
// ─────────────────────────────────────────────

import type { Metadata } from "next";
import { Suspense } from "react";
import AnalyzeForm from "./AnalyzeForm";

export const metadata: Metadata = {
  title: "Bilet Analizi | Travel Shield",
  description:
    "Rezervasyonunu yapıştır veya seyahat bilgilerini gir; yapay zeka gizli ücret risklerini tarasın.",
};

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm font-mono">Yükleniyor...</div>}>
      <AnalyzeForm />
    </Suspense>
  );
}

