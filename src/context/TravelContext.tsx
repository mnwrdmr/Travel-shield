"use client";


/**
 * @file TravelContext.tsx
 * @description Global uygulama state'i — React Context API.
 *
 * Yönetilen state:
 *  - analysisResult    : Bilet analizi sonucu
 *  - baggageResult     : Bagaj AI analizi sonucu
 *  - isLoading         : Bilet analizi yüklenme durumu
 *  - isBaggageAnalyzing: Bagaj analizi yüklenme durumu
 *  - error             : Hata mesajı
 *
 * Kalıcılık: Her iki sonuç da localStorage'a yazılır,
 *            sayfa yenilendiğinde client-side hydration ile geri okunur.
 */


// ─────────────────────────────────────────────
// context/TravelContext.tsx
// Sprint 2 — Person A: Global State Engine
//
// Provides TravelProvider + useTravel() hook.
// Bridges Person Y's form inputs to Person M's
// dashboard cards via AI simulation.
// ─────────────────────────────────────────────

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type {
  AnalysisResult,
  BaggageAnalysis,
  BaggageDimensions,
  FeeLineItem,
  Operator,
  RawFormInput,
  RiskAlert,
} from "@/types/travel";

// ─────────────────────────────────────────────────────────────
// Tip tanımları
// ─────────────────────────────────────────────────────────────

interface TravelContextValue {
  analysisResult:     AnalysisResult | null;
  baggageResult:      BaggageAnalysis | null;
  isLoading:          boolean;
  isBaggageAnalyzing: boolean;
  error:              string | null;
  runAiSimulation:         (formData: RawFormInput) => Promise<void>;
  runBaggageAiSimulation:  (
    operator: Operator | string,
    dimensions?: BaggageDimensions,
    imageUrl?: string
  ) => Promise<BaggageAnalysis>;
}

// ─────────────────────────────────────────────────────────────
// localStorage yardımcıları
// ─────────────────────────────────────────────────────────────

const LS_KEYS = {
  analysis: "ts_analysisResult_v1",
  baggage:  "ts_baggageResult_v1",
} as const;

function storageSave(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

function storageLoad<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────
// Havayolu veri katmanı (tek sorumluluk)
// ─────────────────────────────────────────────────────────────

/** Havayoluna göre kabin boyut limitleri ve kapı ücreti */
const CABIN_LIMITS: Record<string, BaggageDimensions & { gateFee: number }> = {
  THY:        { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 0  },
  PEGASUS:    { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 50 },
  AJET:       { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 45 },
  SUNEXPRESS: { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 45 },
  CORENDON:   { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 40 },
  RYANAIR:    { widthCm: 40, heightCm: 20, depthCm: 25, gateFee: 70 },
  WIZZAIR:    { widthCm: 40, heightCm: 30, depthCm: 20, gateFee: 80 },
  EASYJET:    { widthCm: 56, heightCm: 45, depthCm: 25, gateFee: 48 },
  TRENITALIA: { widthCm: 80, heightCm: 50, depthCm: 30, gateFee: 0  },
  SNCF:       { widthCm: 70, heightCm: 50, depthCm: 30, gateFee: 0  },
  DB:         { widthCm: 70, heightCm: 50, depthCm: 30, gateFee: 0  },
  OBB:        { widthCm: 70, heightCm: 50, depthCm: 30, gateFee: 0  },
  FLIXBUS:    { widthCm: 67, heightCm: 42, depthCm: 27, gateFee: 0  },
};

function getCabinLimits(operator: string) {
  return CABIN_LIMITS[operator.toUpperCase()] ?? CABIN_LIMITS["RYANAIR"];
}

/** Havayoluna göre risk uyarıları */
const AIRLINE_RISKS: Record<string, Omit<RiskAlert, "id">[]> = {
  RYANAIR: [
    {
      level: "CRITICAL",
      title: "Online check-in penceresi 2 saatte kapanıyor",
      description: "Ryanair havalimanı check-in için €55 ceza uygular.",
      potentialFine: 55, currency: "EUR",
      actionLabel: "Şimdi check-in yap",
      actionHref:  "https://www.ryanair.com/checkin",
    },
    {
      level: "WARNING",
      title: "El bagajı boyut limitini aşıyor olabilir",
      description: "Ryanair'in ücretsiz limiti 40×20×25 cm. Kapıda €70 ceza riski.",
      potentialFine: 70, currency: "EUR",
      actionLabel: "AR ile ölç",
      actionHref:  "/analyze?tab=baggage",
    },
    {
      level: "INFO",
      title: "Dark pattern: ön seçili sigorta",
      description: "Onay e-postasında seyahat sigortası önceden işaretli olabilir.",
      potentialFine: 0, currency: "EUR",
    },
  ],
  WIZZAIR: [
    {
      level: "CRITICAL",
      title: "Havalimanı check-in ücreti",
      description: "Online check-in yapılmazsa €30–50 ücret uygulanır.",
      potentialFine: 50, currency: "EUR",
    },
    {
      level: "CRITICAL",
      title: "Gidiş kaçırılırsa dönüş otomatik iptal",
      description: "Gidiş-dönüş biletlerde gidiş kaçırılırsa dönüş iptal edilir.",
      potentialFine: 0, currency: "EUR",
    },
    {
      level: "WARNING",
      title: "Bagaj boyut kontrolü çok katı",
      description: "40×30×20 cm limiti havalimanında ölçülür. 1 cm aşımda €45–80 ceza.",
      potentialFine: 80, currency: "EUR",
    },
  ],
  EASYJET: [
    {
      level: "WARNING",
      title: "Zorunluymuş gibi gösterilen koltuk seçimi",
      description: "Check-in sürecinde koltuk seçimi zorunluymuş gibi sunulur.",
      potentialFine: 20, currency: "EUR",
    },
    {
      level: "INFO",
      title: "Gece yarısı kural değişikliği",
      description: "Aynı gün seferde koltuk değişikliğinde fark iadesi yapılmaz.",
      potentialFine: 0, currency: "EUR",
    },
  ],
  THY: [
    {
      level: "INFO",
      title: "Economy Lite: koltuk seçimi ücretli",
      description: "Economy Lite biletlerde koltuk seçimi ek ücretlidir.",
      potentialFine: 15, currency: "EUR",
    },
    {
      level: "INFO",
      title: "İkinci bagaj ek ücreti",
      description: "İkinci bagaj için ek ücret uygulanabilir.",
      potentialFine: 30, currency: "EUR",
    },
  ],
  PEGASUS: [
    {
      level: "WARNING",
      title: "Economy Eco: kabin bagajı dahil değil",
      description: "Economy Eco biletlerde kabin bagajı dahil değildir (€20–40).",
      potentialFine: 40, currency: "EUR",
    },
    {
      level: "WARNING",
      title: "Havalimanı check-in ücreti",
      description: "Havalimanında check-in yapılırsa €25 ücret alınır.",
      potentialFine: 25, currency: "EUR",
    },
  ],
  AJET:       [{ level: "INFO", title: "AJet kabin bagajı politikası", description: "Kabin limitleri standart LCC kurallarını takip eder.", potentialFine: 0, currency: "EUR" }],
  SUNEXPRESS: [{ level: "INFO", title: "Koltuk seçim ücreti", description: "Standart biletlerde koltuk seçimi ek ücretlidir.", potentialFine: 10, currency: "EUR" }],
  CORENDON:   [{ level: "INFO", title: "Büyük kabin bagajı ücretli olabilir", description: "Küçük el çantası ücretsiz; büyük kabin bagajı bilet tipine göre ücretli.", potentialFine: 20, currency: "EUR" }],
};

function getRisksForOperator(operator: string): Omit<RiskAlert, "id">[] {
  return AIRLINE_RISKS[operator.toUpperCase()] ?? AIRLINE_RISKS["RYANAIR"];
}

// ─────────────────────────────────────────────────────────────
// Simülasyon motoru (tek sorumluluk)
// ─────────────────────────────────────────────────────────────

/** Bilet analizi için simüle AnalysisResult üretir */
function buildAnalysisResult(
  formData: RawFormInput,
  existingBaggage: BaggageAnalysis | null
): AnalysisResult {
  const op     = formData.airline.toUpperCase();
  const rawRisks = getRisksForOperator(op);
  const risks: RiskAlert[] = rawRisks.map((r, i) => ({
    ...r,
    id: `risk_${Date.now()}_${i}`,
  }));

  const fees: FeeLineItem[] = risks
    .filter((r) => r.potentialFine > 0)
    .map((r) => ({
      label:   r.title,
      amount:  r.potentialFine,
      currency: r.currency,
      avoided: r.level !== "CRITICAL",
    }));

  const savedAmount = fees
    .filter((f) => f.avoided)
    .reduce((sum, f) => sum + Math.round(f.amount * 0.9), 0);

  const departure = formData.date
    ? new Date(formData.date)
    : new Date(Date.now() + 18 * 3_600_000);

  return {
    id:          `analysis_${Date.now()}`,
    analyzedAt:  new Date().toISOString(),
    segment: {
      pnr:              `TS${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      operator:         formData.airline,
      mode:             formData.transportType,
      origin:           formData.origin      || "IST",
      destination:      formData.destination || "BCN",
      departureTime:    departure.toISOString(),
      arrivalTime:      new Date(departure.getTime() + 3 * 3_600_000).toISOString(),
      checkInDeadline:  new Date(departure.getTime() - 2 * 3_600_000).toISOString(),
      validationRequired: formData.transportType === "TRAIN",
    },
    risks,
    savings: {
      totalSaved: savedAmount,
      currency:   "EUR",
      breakdown:  fees
        .filter((f) => f.avoided)
        .map((f) => ({
          category:    f.label,
          originalCost: f.amount,
          savedAmount:  Math.round(f.amount * 0.9),
          currency:    f.currency,
        })),
    },
    alternatives: [{
      id:            `alt_${Date.now()}`,
      operator:      "FLIXBUS",
      mode:          "BUS",
      origin:        formData.origin      || "IST",
      destination:   formData.destination || "BCN",
      departureTime: new Date(departure.getTime() + 4 * 3_600_000).toISOString(),
      price: 39, currency: "EUR", savings: 86,
      bookingUrl: "https://www.flixbus.com",
      tags: ["Bagaj ücreti yok", "Ücretsiz iptal"],
    }],
    fees,
    baggageAnalysis: existingBaggage ?? undefined,
  };
}

/** Bagaj analizi için simüle BaggageAnalysis üretir */
function buildBaggageResult(
  operator: string,
  dimensions?: BaggageDimensions,
  imageUrl?: string
): BaggageAnalysis {
  const limits = getCabinLimits(operator);

  const detected: BaggageDimensions = dimensions ?? {
    widthCm:  limits.widthCm  + 2,
    heightCm: limits.heightCm + 2,
    depthCm:  limits.depthCm,
  };

  const ow = Math.max(0, detected.widthCm  - limits.widthCm);
  const oh = Math.max(0, detected.heightCm - limits.heightCm);
  const od = Math.max(0, detected.depthCm  - limits.depthCm);

  const isOversized = ow > 0 || oh > 0 || od > 0;
  const gateFee     = isOversized ? limits.gateFee : 0;
  const netSavings  = gateFee > 0 ? gateFee - 18 : 0;

  const recommendations: string[] = isOversized
    ? [
        `Çantanız ${operator} kabin limitini (${limits.widthCm}×${limits.heightCm}×${limits.depthCm} cm) aşıyor.`,
        ...(gateFee > 0
          ? [`Kapıda €${gateFee} ceza ödememek için €18'e online kabin hakkı ekleyin → €${netSavings} tasarruf.`]
          : []),
        "Çantanızı sıkıştırarak birkaç cm küçültmeyi deneyin.",
      ]
    : [`Çantanız ${operator} kabin limitlari içinde — tamamen güvenli.`];

  return {
    id:              `baggage_${Date.now()}`,
    status:          isOversized ? "OVERSIZED" : "COMPLIANT",
    detectedDimensions: detected,
    allowedDimensions: { widthCm: limits.widthCm, heightCm: limits.heightCm, depthCm: limits.depthCm },
    overageCm:       { width: ow, height: oh, depth: od },
    potentialGateFee: gateFee,
    currency:        "EUR",
    confidenceScore: dimensions ? 0.95 : 0.85,
    imageUrl,
    recommendations,
  };
}

// ─────────────────────────────────────────────────────────────
// Simülasyon gecikmeleri (ms)
// ─────────────────────────────────────────────────────────────
const SIMULATION_DELAY_MS = {
  ticket:  2600,  // Person Y'nin animasyonu ile senkron
  baggage: 1800,  // Vision AI bekleme süresi
} as const;

// ─────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────

const TravelContext = createContext<TravelContextValue>({
  analysisResult:     null,
  baggageResult:      null,
  isLoading:          false,
  isBaggageAnalyzing: false,
  error:              null,
  runAiSimulation:        async () => {},
  runBaggageAiSimulation: async () => ({} as BaggageAnalysis),
});

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function TravelProvider({ children }: { children: ReactNode }) {
  const [analysisResult,     setAnalysisResult]     = useState<AnalysisResult | null>(null);
  const [baggageResult,      setBaggageResult]       = useState<BaggageAnalysis | null>(null);
  const [isLoading,          setIsLoading]           = useState(false);
  const [isBaggageAnalyzing, setIsBaggageAnalyzing] = useState(false);
  const [error,              setError]              = useState<string | null>(null);

  // Client-side localStorage hydration
  useEffect(() => {
    const savedAnalysis = storageLoad<AnalysisResult>(LS_KEYS.analysis);
    const savedBaggage  = storageLoad<BaggageAnalysis>(LS_KEYS.baggage);
    if (savedAnalysis) setAnalysisResult(savedAnalysis);
    if (savedBaggage)  setBaggageResult(savedBaggage);
  }, []);

  // ── Bilet analiz simülasyonu ─────────────────────────────
  const runAiSimulation = useCallback(async (formData: RawFormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, SIMULATION_DELAY_MS.ticket));

      const result = buildAnalysisResult(formData, baggageResult);
      setAnalysisResult(result);
      storageSave(LS_KEYS.analysis, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analiz başarısız oldu.");
    } finally {
      setIsLoading(false);
    }
  }, [baggageResult]);

  // ── Bagaj AI simülasyonu ─────────────────────────────────
  const runBaggageAiSimulation = useCallback(
    async (
      operator: Operator | string,
      dimensions?: BaggageDimensions,
      imageUrl?: string
    ): Promise<BaggageAnalysis> => {
      setIsBaggageAnalyzing(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, SIMULATION_DELAY_MS.baggage));

        const result = buildBaggageResult(operator as string, dimensions, imageUrl);
        setBaggageResult(result);
        storageSave(LS_KEYS.baggage, result);
        return result;
      } finally {
        setIsBaggageAnalyzing(false);
      }
    },
    []
  );

  return (
    <TravelContext.Provider
      value={{
        analysisResult,
        baggageResult,
        isLoading,
        isBaggageAnalyzing,
        error,
        runAiSimulation,
        runBaggageAiSimulation,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useTravel(): TravelContextValue {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error("useTravel — TravelProvider dışında kullanılamaz.");
  }
  return context;
}
