// ─────────────────────────────────────────────────────────────
// src/lib/mock-analysis.ts
// SPRINT 3: baggageAnalysis mock objesi eklendi.
// Sayfa direkt /dashboard'a açıldığında BaggageComplianceCard
// boş kalmasın diye varsayılan veri burada tanımlıdır.
// ─────────────────────────────────────────────────────────────

import type { AnalysisResult, BaggageAnalysis } from "@/types/travel";

// ── Varsayılan Bagaj Mock (Ahmet'in 42×22×25 cm çantası) ─────
export const MOCK_BAGGAGE_ANALYSIS: BaggageAnalysis = {
  id: "baggage_demo_001",
  status: "OVERSIZED",
  detectedDimensions: {
    widthCm: 42,
    heightCm: 22,
    depthCm: 25,
  },
  allowedDimensions: {
    widthCm: 40,
    heightCm: 20,
    depthCm: 25,
  },
  overageCm: {
    width: 2,   // 42 - 40
    height: 2,  // 22 - 20
    depth: 0,   // 25 - 25
  },
  potentialGateFee: 70,
  currency: "EUR",
  confidenceScore: 94,
  imageUrl: undefined,
  recommendations: [
    "€18'e online kabin bagajı yükseltmesi satın alın — kapıda €70 ödemekten €52 tasarruf edersiniz.",
    "Çantanızı seyahattan önce sıkıştırarak 2 cm küçültmeyi deneyin.",
    "Fazla eşyaları check-in bagajına taşıyın.",
  ],
};

// ── Seyahat Analizi Mock ──────────────────────────────────────
export const MOCK_ANALYSIS: AnalysisResult = {
  id: "analysis_0001",
  analyzedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  segment: {
    pnr: "XY789Z",
    operator: "RYANAIR",
    mode: "FLIGHT",
    origin: "IST",
    destination: "BCN",
    departureTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    arrivalTime:   new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(),
    checkInDeadline: new Date(Date.now() + 1000 * 60 * 60 * 16).toISOString(),
    validationRequired: false,
  },
  risks: [
    {
      id: "risk_001",
      level: "CRITICAL",
      title: "Online check-in penceresi 2 saatte kapanıyor",
      description:
        "Ryanair havalimanı check-in için €55 ceza uygular. Pencere kalkıştan 24 saat önce açıldı.",
      potentialFine: 55,
      currency: "EUR",
      actionLabel: "Şimdi check-in yap",
      actionHref: "https://www.ryanair.com/checkin",
    },
    {
      id: "risk_002",
      level: "WARNING",
      title: "El bagajı boyut limitini aşıyor",
      description:
        "Çantanız 42×22×25 cm. Ryanair ücretsiz limiti 40×20×25 cm — kapıda €70 ceza riski.",
      potentialFine: 70,
      currency: "EUR",
      actionLabel: "AR ile ölç",
      actionHref: "/analyze",
    },
    {
      id: "risk_003",
      level: "INFO",
      title: "Rezervasyon e-postasında karanlık örüntü",
      description: "Önceden işaretlenmiş seyahat sigortası bulundu.",
      potentialFine: 0,
      currency: "EUR",
    },
  ],
  savings: {
    totalSaved: 127,
    currency: "EUR",
    breakdown: [
      { category: "Havalimanı check-in ücreti engellendi", originalCost: 55, savedAmount: 55, currency: "EUR" },
      { category: "Öncelikli biniş ücreti atlandı",        originalCost: 18, savedAmount: 18, currency: "EUR" },
      { category: "Koltuk seçim ücreti engellendi",        originalCost: 14, savedAmount: 14, currency: "EUR" },
      { category: "Bagaj fazla ücret engellendi",          originalCost: 40, savedAmount: 40, currency: "EUR" },
    ],
  },
  alternatives: [
    {
      id: "alt_001",
      operator: "FLIXBUS",
      mode: "BUS",
      origin: "Istanbul",
      destination: "Barcelona",
      departureTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
      price: 39,
      currency: "EUR",
      savings: 86,
      bookingUrl: "https://www.flixbus.com",
      tags: ["Bagaj ücreti yok", "Ücretsiz iptal"],
    },
  ],
  fees: [
    { label: "Havalimanı check-in ücreti (Ryanair)",      amount: 55, currency: "EUR", avoided: true  },
    { label: "Kapıda bagaj cezası (42×22 limit ihlali)",  amount: 70, currency: "EUR", avoided: false },
    { label: "Koltuk seçim ücreti",                       amount: 14, currency: "EUR", avoided: true  },
    { label: "Öncelikli biniş ücreti",                    amount: 18, currency: "EUR", avoided: true  },
    { label: "Ön işaretli seyahat sigortası",             amount: 12, currency: "EUR", avoided: true  },
  ],
  // Sprint 3: bagaj analizi entegre edildi
  baggageAnalysis: MOCK_BAGGAGE_ANALYSIS,
};

// ── Simüle async fetch — backend hazırda bunu replace eder ───
export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  await new Promise((r) => setTimeout(r, 900));
  return id === MOCK_ANALYSIS.id ? MOCK_ANALYSIS : null;
}
