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
  useState,
  useSyncExternalStore,
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
  BackendScanResponse,
} from "@/types/travel";
import { getAirlineBaggagePolicy } from "@/lib/airline-policies";

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
  saveBackendBaggageAnalysis: (operator: Operator | string, response: BackendScanResponse) => Promise<BaggageAnalysis>;
}

// ─────────────────────────────────────────────────────────────
// localStorage yardımcıları
// ─────────────────────────────────────────────────────────────

const LS_KEYS = {
  analysis: "ts_analysisResult_v1",
  baggage:  "ts_baggageResult_v1",
} as const;

const storageCache: Record<string, { raw: string | null; parsed: unknown }> = {};

function storageSave(key: string, value: unknown): void {
  try {
    const raw = JSON.stringify(value);
    localStorage.setItem(key, raw);
    storageCache[key] = { raw, parsed: value };
  } catch { /* quota */ }
}

function storageLoad<T>(key: string): T | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(key);
    if (storageCache[key] && storageCache[key].raw === raw) {
      return storageCache[key].parsed as T | null;
    }
    const parsed = raw ? (JSON.parse(raw) as T) : null;
    storageCache[key] = { raw, parsed };
    return parsed;
  } catch { return null; }
}

const subscribeToStorage = () => () => {};

// ─────────────────────────────────────────────────────────────
// Havayolu veri katmanı (tek sorumluluk)
// ─────────────────────────────────────────────────────────────

/** Havayoluna göre kabin boyut limitleri ve kapı ücreti */
function getCabinLimits(operator: string) {
  return getAirlineBaggagePolicy(operator);
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
    confidenceScore: dimensions ? 95 : 85,
    source:          dimensions ? "MANUAL" : "DEMO",
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

const TravelContext = createContext<TravelContextValue | null>(null);

// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export function TravelProvider({ children }: { children: ReactNode }) {
  const [analysisResult,     setAnalysisResult]     = useState<AnalysisResult | null>(null);
  const [baggageResult,      setBaggageResult]       = useState<BaggageAnalysis | null>(null);
  const [isLoading,          setIsLoading]           = useState(false);
  const [isBaggageAnalyzing, setIsBaggageAnalyzing] = useState(false);
  const [error,              setError]              = useState<string | null>(null);

  // React supplies the null server snapshot during hydration, then reads the
  // browser store without an effect-driven state update.
  const storedAnalysis = useSyncExternalStore(
    subscribeToStorage,
    () => storageLoad<AnalysisResult>(LS_KEYS.analysis),
    () => null,
  );
  const storedBaggage = useSyncExternalStore(
    subscribeToStorage,
    () => storageLoad<BaggageAnalysis>(LS_KEYS.baggage),
    () => null,
  );
  const activeBaggage = baggageResult ?? storedBaggage;

  // ── Bilet analiz simülasyonu ─────────────────────────────
  const runAiSimulation = useCallback(async (formData: RawFormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, SIMULATION_DELAY_MS.ticket));

      const result = buildAnalysisResult(formData, activeBaggage);
      setAnalysisResult(result);
      storageSave(LS_KEYS.analysis, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analiz başarısız oldu.");
    } finally {
      setIsLoading(false);
    }
  }, [activeBaggage]);

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

  const saveBackendBaggageAnalysis = useCallback(async (
    operator: Operator | string,
    response: BackendScanResponse,
  ): Promise<BaggageAnalysis> => {
    const fallbackLimits = getCabinLimits(operator);
    const detected = response.detected_dimensions ?? {
      width_cm: fallbackLimits.widthCm,
      height_cm: fallbackLimits.heightCm,
      depth_cm: fallbackLimits.depthCm,
    };
    const allowed = response.allowed_dimensions ?? {
      width_cm: fallbackLimits.widthCm,
      height_cm: fallbackLimits.heightCm,
      depth_cm: fallbackLimits.depthCm,
    };
    const result: BaggageAnalysis = {
      id: `baggage_${Date.now()}`,
      status: response.status === "FAIL" ? "OVERSIZED" : response.status === "WARNING" ? "WARNING" : "COMPLIANT",
      detectedDimensions: { widthCm: detected.width_cm, heightCm: detected.height_cm, depthCm: detected.depth_cm },
      allowedDimensions: { widthCm: allowed.width_cm, heightCm: allowed.height_cm, depthCm: allowed.depth_cm },
      overageCm: response.overage_cm ? { width: response.overage_cm.width_cm, height: response.overage_cm.height_cm, depth: response.overage_cm.depth_cm } : undefined,
      potentialGateFee: response.potential_gate_fee_eur ?? 0,
      currency: "EUR",
      confidenceScore: Math.round((response.confidence_score ?? 0) * 100),
      source: response.analysis_source === "demo" ? "DEMO" : "AI",
      recommendations: response.recommendations ?? [response.message],
    };
    setBaggageResult(result);
    storageSave(LS_KEYS.baggage, result);
    return result;
  }, []);

  return (
    <TravelContext.Provider
      value={{
        analysisResult: analysisResult ?? storedAnalysis,
        baggageResult: baggageResult ?? storedBaggage,
        isLoading,
        isBaggageAnalyzing,
        error,
        runAiSimulation,
        runBaggageAiSimulation,
        saveBackendBaggageAnalysis,
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
