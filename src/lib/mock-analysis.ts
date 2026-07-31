// ─────────────────────────────────────────────────────────────
// src/lib/mock-analysis.ts
// SPRINT FINAL:
//   ✅ MOCK_BAGGAGE_ANALYSIS (Ahmet demo senaryosu)
//   ✅ MOCK_ANALYSIS — Ryanair IST→BCN demo
//   ✅ getTurkishAirlineMock() — THY/Pegasus/AJet demo yardımcısı
// ─────────────────────────────────────────────────────────────

import type { AnalysisResult, BaggageAnalysis, Operator } from "@/types/travel";

// ─────────────────────────────────────────────────────────────
// Bagaj Mock — Ahmet'in 42×22×25 cm çantası (Ryanair demo)
// ─────────────────────────────────────────────────────────────
export const MOCK_BAGGAGE_ANALYSIS: BaggageAnalysis = {
  id:     "baggage_demo_001",
  status: "OVERSIZED",
  detectedDimensions: { widthCm: 42, heightCm: 22, depthCm: 25 },
  allowedDimensions:  { widthCm: 40, heightCm: 20, depthCm: 25 },
  overageCm:          { width: 2, height: 2, depth: 0 },
  potentialGateFee: 70,
  currency:         "EUR",
  confidenceScore:  94,
  source:           "DEMO",
  imageUrl:         undefined,
  recommendations: [
    "Çantanız Ryanair kabin limitini (40×20×25 cm) aşıyor.",
    "Kapıda €70 ceza ödememek için €18'e online kabin hakkı ekleyin → €52 net tasarruf.",
    "Çantanızı sıkıştırarak 2 cm küçültmeyi deneyin.",
    "Fazla eşyaları check-in bagajına taşıyın.",
  ],
};

// ─────────────────────────────────────────────────────────────
// Seyahat Analizi Mock — Ryanair IST→BCN
// ─────────────────────────────────────────────────────────────
export const MOCK_ANALYSIS: AnalysisResult = {
  id:          "analysis_0001",
  analyzedAt:  new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  segment: {
    pnr:              "XY789Z",
    operator:         "RYANAIR",
    mode:             "FLIGHT",
    origin:           "IST",
    destination:      "BCN",
    departureTime:    new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    arrivalTime:      new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(),
    checkInDeadline:  new Date(Date.now() + 1000 * 60 * 60 * 16).toISOString(),
    validationRequired: false,
  },
  risks: [
    {
      id:          "risk_001",
      level:       "CRITICAL",
      title:       "Online check-in penceresi 2 saatte kapanıyor",
      description: "Ryanair havalimanı check-in için €55 ceza uygular.",
      potentialFine: 55, currency: "EUR",
      actionLabel: "Şimdi check-in yap",
      actionHref:  "https://www.ryanair.com/checkin",
    },
    {
      id:          "risk_002",
      level:       "WARNING",
      title:       "El bagajı boyut limitini aşıyor",
      description: "42×22×25 cm tespit edildi. Ryanair limiti 40×20×25 cm — kapıda €70 ceza riski.",
      potentialFine: 70, currency: "EUR",
      actionLabel: "AR ile ölç",
      actionHref:  "/analyze?tab=baggage",
    },
    {
      id:          "risk_003",
      level:       "INFO",
      title:       "Rezervasyon e-postasında karanlık örüntü",
      description: "Önceden işaretlenmiş seyahat sigortası bulundu.",
      potentialFine: 0, currency: "EUR",
    },
  ],
  savings: {
    totalSaved: 127,
    currency:   "EUR",
    breakdown: [
      { category: "Havalimanı check-in ücreti engellendi", originalCost: 55, savedAmount: 55, currency: "EUR" },
      { category: "Öncelikli biniş ücreti atlandı",        originalCost: 18, savedAmount: 18, currency: "EUR" },
      { category: "Koltuk seçim ücreti engellendi",        originalCost: 14, savedAmount: 14, currency: "EUR" },
      { category: "Bagaj fazla ücret engellendi",          originalCost: 40, savedAmount: 40, currency: "EUR" },
    ],
  },
  alternatives: [
    {
      id:            "alt_001",
      operator:      "FLIXBUS",
      mode:          "BUS",
      origin:        "Istanbul",
      destination:   "Barcelona",
      departureTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
      price:         39, currency: "EUR", savings: 86,
      bookingUrl:    "https://www.flixbus.com",
      tags:          ["Bagaj ücreti yok", "Ücretsiz iptal"],
    },
    {
      id:            "alt_002",
      operator:      "EASYJET",
      mode:          "FLIGHT",
      origin:        "IST",
      destination:   "BCN",
      departureTime: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
      price:         89, currency: "EUR", savings: 36,
      bookingUrl:    "https://www.easyjet.com",
      tags:          ["Daha geniş kabin limiti"],
    },
  ],
  fees: [
    { label: "Havalimanı check-in ücreti (Ryanair)", amount: 55,  currency: "EUR", avoided: true  },
    { label: "Kapıda bagaj cezası (42×22 ihlali)",   amount: 70,  currency: "EUR", avoided: false },
    { label: "Koltuk seçim ücreti",                  amount: 14,  currency: "EUR", avoided: true  },
    { label: "Öncelikli biniş ücreti",               amount: 18,  currency: "EUR", avoided: true  },
    { label: "Ön işaretli seyahat sigortası",        amount: 12,  currency: "EUR", avoided: true  },
  ],
  baggageAnalysis: MOCK_BAGGAGE_ANALYSIS,
};

// ─────────────────────────────────────────────────────────────
// Türk havayolları için demo mock oluşturucu
// ─────────────────────────────────────────────────────────────
export function getTurkishAirlineMock(operator: Operator): AnalysisResult {
  const configs: Record<string, { origin: string; dest: string; risks: AnalysisResult["risks"] }> = {
    THY: {
      origin: "IST", dest: "LHR",
      risks: [
        { id: "r1", level: "INFO", title: "Economy Lite: koltuk seçimi ücretli",
          description: "Economy Lite biletlerde koltuk seçimi ek ücretlidir.",
          potentialFine: 15, currency: "EUR" },
        { id: "r2", level: "INFO", title: "İkinci bagaj ek ücreti",
          description: "İkinci bagaj için ek ücret uygulanabilir.",
          potentialFine: 30, currency: "EUR" },
      ],
    },
    PEGASUS: {
      origin: "SAW", dest: "TXL",
      risks: [
        { id: "r1", level: "WARNING", title: "Eco bilet: kabin bagajı dahil değil",
          description: "Economy Eco biletlerde kabin bagajı dahil değildir (€20–40).",
          potentialFine: 40, currency: "EUR" },
        { id: "r2", level: "WARNING", title: "Havalimanı check-in ücreti",
          description: "Havalimanında check-in yapılırsa €25 ücret alınır.",
          potentialFine: 25, currency: "EUR" },
      ],
    },
    AJET: {
      origin: "ESB", dest: "AMS",
      risks: [
        { id: "r1", level: "INFO", title: "AJet kabin bagajı politikası",
          description: "Kabin bagajı boyut limitleri standart LCC kurallarını takip eder.",
          potentialFine: 0, currency: "EUR" },
      ],
    },
    SUNEXPRESS: {
      origin: "ADB", dest: "DUS",
      risks: [
        { id: "r1", level: "INFO", title: "Koltuk seçim ücreti",
          description: "Standart biletlerde koltuk seçimi ek ücretlidir.",
          potentialFine: 10, currency: "EUR" },
      ],
    },
    CORENDON: {
      origin: "IST", dest: "AMS",
      risks: [
        { id: "r1", level: "INFO", title: "Büyük kabin bagajı ücretli olabilir",
          description: "Küçük el çantası ücretsiz; büyük kabin bagajı bilet tipine göre ücretli.",
          potentialFine: 20, currency: "EUR" },
      ],
    },
  };

  const cfg = configs[operator] ?? configs["THY"];
  const totalSaved = cfg.risks.reduce((s, r) => s + r.potentialFine * 0.7, 0);

  return {
    id:         `analysis_${operator.toLowerCase()}_demo`,
    analyzedAt: new Date().toISOString(),
    segment: {
      pnr:              `TS${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      operator,
      mode:             "FLIGHT",
      origin:           cfg.origin,
      destination:      cfg.dest,
      departureTime:    new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
      arrivalTime:      new Date(Date.now() + 1000 * 60 * 60 * 23).toISOString(),
      checkInDeadline:  new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
      validationRequired: false,
    },
    risks: cfg.risks,
    savings: {
      totalSaved: Math.round(totalSaved),
      currency:   "EUR",
      breakdown:  cfg.risks
        .filter((r) => r.potentialFine > 0)
        .map((r) => ({
          category:    r.title,
          originalCost: r.potentialFine,
          savedAmount:  Math.round(r.potentialFine * 0.7),
          currency:    r.currency,
        })),
    },
    alternatives: [],
    fees: cfg.risks
      .filter((r) => r.potentialFine > 0)
      .map((r) => ({
        label:   r.title,
        amount:  r.potentialFine,
        currency: r.currency,
        avoided: r.level === "INFO",
      })),
    baggageAnalysis: undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// Simüle async fetch
// ─────────────────────────────────────────────────────────────
export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  await new Promise((r) => setTimeout(r, 400));
  return id === MOCK_ANALYSIS.id ? MOCK_ANALYSIS : null;
}
