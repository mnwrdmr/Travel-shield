import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import ProblemGrid from "@/components/landing/ProblemGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesSection from "@/components/landing/FeaturesSection";

export const metadata: Metadata = {
  title: "Travel Shield — Havayolu Gizli Cezalarına Karşı Yapay Zeka Kalkanı",
  description:
    "Ryanair, Wizz Air ve Trenitalia gibi havayollarının gizli kural labirentlerini yapay zeka ile analiz eden bilet koruma sistemi. Check-in cezaları, bagaj tuzakları ve iade kurallarına karşı 30 saniyede tam analiz.",
  keywords: [
    "havayolu ceza",
    "bilet analizi",
    "Ryanair ceza",
    "Wizz Air bagaj",
    "EC 261/2004",
    "uçak bileti tuzak",
    "seyahat koruması",
  ],
  openGraph: {
    title: "Travel Shield — Havayolu Gizli Cezalarına Karşı Yapay Zeka Kalkanı",
    description:
      "Biletinizdeki gizli kuralları ve ceza tetikleyicilerini 30 saniyede tespit eden yapay zeka destekli koruma sistemi.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />

      {/* Visual separator */}
      <div
        aria-hidden="true"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      </div>

      <ProblemGrid />

      <div
        aria-hidden="true"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      </div>

      <HowItWorks />

      <div
        aria-hidden="true"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      </div>

      <FeaturesSection />
    </main>
  );
}
