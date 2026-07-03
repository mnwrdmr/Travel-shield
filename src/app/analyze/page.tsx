import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bilet Analizi | Travel Shield",
  description: "Bilet analizi ve risk tespiti sayfası.",
};

export default function AnalyzePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center justify-center min-h-[50dvh] text-center">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
        Travel Shield - Analiz Sayfası
      </h1>
      <p className="text-[var(--color-foreground)]/60 text-sm">
        (Person Y Çalışma Alanı)
      </p>
    </main>
  );
}
