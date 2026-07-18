"use client";

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
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type {
  AnalysisResult,
  RawFormInput,
  Operator,
  RiskAlert,
  FeeLineItem,
  SavingsBreakdown,
  AlternativeTransport,
} from "@/types/travel";

// ─────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────
interface TravelContextValue {
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  runAiSimulation: (formData: RawFormInput) => Promise<void>;
  reset: () => void;
}

const TravelContext = createContext<TravelContextValue | undefined>(undefined);

// ─────────────────────────────────────────────
// Operator-specific risk/fee knowledge base
// ─────────────────────────────────────────────

function generatePnr(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "";
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

function buildRisks(
  form: RawFormInput,
  checkInDeadline: string
): RiskAlert[] {
  const risks: RiskAlert[] = [];

  const airlineRiskMaps: Record<Operator, RiskAlert[]> = {
    RYANAIR: [
      {
        id: "risk_checkin",
        level: "CRITICAL",
        title: "Online check-in penceresi kapanıyor",
        description: `Ryanair havalimanı check-in ücreti €55'tir. Check-in penceresi kalkıştan 24 saat önce açılır ve 2 saat önce kapanır. Son tarih: ${new Date(checkInDeadline).toLocaleString("tr-TR")}.`,
        potentialFine: 55,
        currency: "EUR",
        actionLabel: "Check-in yap",
        actionHref: "https://www.ryanair.com/checkin",
      },
      {
        id: "risk_bag",
        level: form.cabinBagIncluded ? "INFO" : "CRITICAL",
        title: form.cabinBagIncluded
          ? "Kabin bagajı dahil — boyut kontrolü önerilir"
          : "Kabin bagajı dahil değil — kapıda ücret riski",
        description: form.cabinBagIncluded
          ? "Kabin bagajı biletinize dahil ancak Ryanair'in ücretsiz limiti 40×20×25 cm'dir. Boyutları aşarsanız kapıda €70 ücret kesilir."
          : "Biletinizde kabin bagajı yok. Kapıda bagaj ücreti €70'e kadar çıkabilir. Şimdi online ekleyerek €25-35 tasarruf edebilirsiniz.",
        potentialFine: form.cabinBagIncluded ? 70 : 70,
        currency: "EUR",
        actionLabel: "Bagaj boyutunu kontrol et",
        actionHref: "/ar-sizer",
      },
      {
        id: "risk_dark",
        level: "INFO",
        title: "Rezervasyon e-postasında dark pattern tespit edildi",
        description:
          "Onay e-postanızda 'Seyahat sigortası ekle' seçeneği önceden işaretlenmiş. Kalkıştan önce kontrol edin.",
        potentialFine: 0,
        currency: "EUR",
      },
    ],
    WIZZAIR: [
      {
        id: "risk_bag_size",
        level: form.cabinBagIncluded ? "WARNING" : "CRITICAL",
        title: form.cabinBagIncluded
          ? "Wizz Air bagaj boyut kontrolü çok katı"
          : "Kabin bagajı dahil değil — kapıda ağır ceza",
        description: form.cabinBagIncluded
          ? "Wizz Air kabin bagajı boyut kontrolü agresif uygulanır (40×30×20 cm). 1 cm bile aşarsanız kapıda €45-80 arası ücret kesilir."
          : "Biletinizde kabin bagajı yok. Kapıda bagaj kontrolünde €45-80 ceza kesilir. Önceden online ekleyin.",
        potentialFine: 80,
        currency: "EUR",
      },
      {
        id: "risk_noshow",
        level: "CRITICAL",
        title: "Gidiş uçuşunu kaçırırsanız dönüş iptal edilir",
        description:
          "Wizz Air gidiş-dönüş biletlerde gidiş uçuşunu kaçıran yolcuların dönüş biletini otomatik iptal eder. Bu kural bilet koşullarında küçük puntolarla belirtilmiştir.",
        potentialFine: 0,
        currency: "EUR",
      },
      {
        id: "risk_checkin_wz",
        level: "WARNING",
        title: "Online check-in'i kaçırmayın",
        description:
          "Wizz Air havalimanı check-in ücreti €30-35'tir. Kalkıştan 48 saat önce online check-in açılır.",
        potentialFine: 35,
        currency: "EUR",
        actionLabel: "Wizz Air Check-in",
        actionHref: "https://wizzair.com/check-in",
      },
    ],
    EASYJET: [
      {
        id: "risk_fare",
        level: "WARNING",
        title: "Gece yarısı fare kuralı aktif",
        description:
          "EasyJet'te aynı gün yapılan koltuk değişikliklerinde yeni sefer daha uygun olsa bile fark iadesi yapılmıyor. 24 saatlik pencere içindeki değişikliklerde bilet bedeli tamamıyla kaybolabilir.",
        potentialFine: 0,
        currency: "EUR",
      },
      {
        id: "risk_seat",
        level: "INFO",
        title: "Zorunlu gibi gösterilen koltuk seçim ücreti",
        description:
          "Check-in sürecinde koltuk seçimi zorunluymuş gibi sunulur ama ücretsiz rastgele koltuk atama hakkınız vardır.",
        potentialFine: 20,
        currency: "EUR",
      },
      {
        id: "risk_bag_ej",
        level: form.cabinBagIncluded ? "INFO" : "WARNING",
        title: form.cabinBagIncluded
          ? "Kabin bagajı dahil — EasyJet limitleri daha geniş"
          : "Kabin bagajı dahil değil",
        description: form.cabinBagIncluded
          ? "EasyJet'in kabin bagajı limiti (56×45×25 cm) Ryanair'den büyüktür. Standart çanta genellikle sığar."
          : "Biletinize kabin bagajı dahil değil. Online ekleme ücreti €25-42 arası, kapıda €48'e kadar çıkar.",
        potentialFine: form.cabinBagIncluded ? 0 : 48,
        currency: "EUR",
      },
    ],
    TRENITALIA: [
      {
        id: "risk_norefund",
        level: "CRITICAL",
        title: "Esnetilemez bilet — değişiklik/iade yok",
        description:
          "Trenitalia 'Base' tarife biletleri hiçbir koşulda değiştirilemez veya iade edilemez. Sefer iptali bile tam iade garantisi vermez.",
        potentialFine: 0,
        currency: "EUR",
      },
      {
        id: "risk_validate",
        level: "WARNING",
        title: "Biletin validasyonu zorunlu",
        description:
          "İstasyondaki sarı validasyon makinelerinde biletinizi doğrulatmanız gerekir. Doğrulatılmamış biletle yolculuk yaparsanız €50 ceza uygulanır.",
        potentialFine: 50,
        currency: "EUR",
      },
    ],
    SNCF: [
      {
        id: "risk_sncf_exchange",
        level: "WARNING",
        title: "Değişim hakkı sınırlı",
        description:
          "SNCF 'Prem's' biletlerde değişim ücreti bilet bedelinin %50'sine kadar çıkabilir. Kalkıştan 3 gün önce değişiklik yapılmazsa tam bedel kaybedilir.",
        potentialFine: 0,
        currency: "EUR",
      },
    ],
    DB: [
      {
        id: "risk_db_sparpreis",
        level: "WARNING",
        title: "Sparpreis bileti tren bağımlı",
        description:
          "Deutsche Bahn Sparpreis biletleri yalnızca belirtilen trende geçerlidir. Treni kaçırırsanız bilet geçersiz olur.",
        potentialFine: 0,
        currency: "EUR",
      },
    ],
    OBB: [
      {
        id: "risk_obb",
        level: "INFO",
        title: "ÖBB Sparschiene kuralları",
        description:
          "ÖBB indirimli biletlerde değişim ücreti kalkıştan 1 gün önce €3, kalkış günü €15'tir.",
        potentialFine: 15,
        currency: "EUR",
      },
    ],
    FLIXBUS: [
      {
        id: "risk_flix",
        level: "INFO",
        title: "FlixBus iptal ve değişim koşulları",
        description:
          "FlixBus biletleri kalkıştan 3 saat öncesine kadar ücretsiz değiştirilebilir. İptal halinde kupon kodu verilir, nakit iade yoktur.",
        potentialFine: 0,
        currency: "EUR",
      },
    ],
  };

  const operatorRisks = airlineRiskMaps[form.airline] ?? [];
  risks.push(...operatorRisks);

  return risks;
}

function buildFees(form: RawFormInput): FeeLineItem[] {
  const feeMaps: Partial<Record<Operator, FeeLineItem[]>> = {
    RYANAIR: [
      { label: "Havalimanı check-in ücreti (Ryanair)", amount: 55, currency: "EUR", avoided: true },
      { label: "Kapıda bagaj ücreti (boyut aşımı)", amount: 70, currency: "EUR", avoided: form.cabinBagIncluded },
      { label: "Koltuk seçim ücreti", amount: 14, currency: "EUR", avoided: true },
      { label: "Priority boarding ücreti", amount: 18, currency: "EUR", avoided: true },
      { label: "Seyahat sigortası (ön-seçim)", amount: 12, currency: "EUR", avoided: true },
    ],
    WIZZAIR: [
      { label: "Havalimanı check-in ücreti (Wizz Air)", amount: 35, currency: "EUR", avoided: true },
      { label: "Kapıda bagaj ücreti", amount: 80, currency: "EUR", avoided: form.cabinBagIncluded },
      { label: "Koltuk seçim ücreti", amount: 10, currency: "EUR", avoided: true },
      { label: "Seyahat sigortası (ön-seçim)", amount: 15, currency: "EUR", avoided: true },
    ],
    EASYJET: [
      { label: "Koltuk seçim ücreti (EasyJet)", amount: 20, currency: "EUR", avoided: true },
      { label: "Kapıda bagaj ek ücreti", amount: 48, currency: "EUR", avoided: form.cabinBagIncluded },
      { label: "Fare farkı riski", amount: 35, currency: "EUR", avoided: true },
    ],
    TRENITALIA: [
      { label: "Validasyon cezası", amount: 50, currency: "EUR", avoided: true },
      { label: "Değişim/iade kaybı", amount: 0, currency: "EUR", avoided: false },
    ],
  };

  return feeMaps[form.airline] ?? [
    { label: "Standart ücret kontrolü", amount: 0, currency: "EUR", avoided: true },
  ];
}

function buildSavings(fees: FeeLineItem[]): {
  totalSaved: number;
  currency: string;
  breakdown: SavingsBreakdown[];
} {
  const avoided = fees.filter((f) => f.avoided && f.amount > 0);
  const breakdown: SavingsBreakdown[] = avoided.map((f) => ({
    category: `${f.label} engellendi`,
    originalCost: f.amount,
    savedAmount: f.amount,
    currency: f.currency,
  }));
  const totalSaved = breakdown.reduce((sum, b) => sum + b.savedAmount, 0);
  return { totalSaved, currency: "EUR", breakdown };
}

function buildAlternatives(form: RawFormInput): AlternativeTransport[] {
  const alts: AlternativeTransport[] = [];

  // Always suggest FlixBus as budget alternative
  if (form.transportType === "FLIGHT") {
    alts.push({
      id: "alt_bus",
      operator: "FLIXBUS",
      mode: "BUS",
      origin: form.origin,
      destination: form.destination,
      departureTime: new Date(
        new Date(form.date).getTime() + 1000 * 60 * 60 * 8
      ).toISOString(),
      price: 29 + Math.floor(Math.random() * 20),
      currency: "EUR",
      savings: 50 + Math.floor(Math.random() * 40),
      bookingUrl: "https://www.flixbus.com",
      tags: ["Bagaj ücretsiz", "Ücretsiz iptal"],
    });
  }

  // Suggest alternative airline
  const altAirlines: Partial<Record<Operator, Operator>> = {
    RYANAIR: "EASYJET",
    WIZZAIR: "RYANAIR",
    EASYJET: "WIZZAIR",
  };

  const altOp = altAirlines[form.airline];
  if (altOp) {
    const bookingUrls: Partial<Record<Operator, string>> = {
      EASYJET: "https://www.easyjet.com",
      RYANAIR: "https://www.ryanair.com",
      WIZZAIR: "https://wizzair.com",
    };
    alts.push({
      id: "alt_flight",
      operator: altOp,
      mode: "FLIGHT",
      origin: form.origin,
      destination: form.destination,
      departureTime: new Date(
        new Date(form.date).getTime() + 1000 * 60 * 60 * 12
      ).toISOString(),
      price: 59 + Math.floor(Math.random() * 50),
      currency: "EUR",
      savings: 15 + Math.floor(Math.random() * 30),
      bookingUrl: bookingUrls[altOp] ?? "#",
      tags: ["Daha geniş kabin limiti", "Farklı saatler"],
    });
  }

  // Suggest train if applicable
  if (form.transportType === "FLIGHT") {
    alts.push({
      id: "alt_train",
      operator: "TRENITALIA",
      mode: "TRAIN",
      origin: form.origin,
      destination: form.destination,
      departureTime: new Date(
        new Date(form.date).getTime() + 1000 * 60 * 60 * 6
      ).toISOString(),
      price: 45 + Math.floor(Math.random() * 30),
      currency: "EUR",
      savings: 30 + Math.floor(Math.random() * 25),
      tags: ["Bagaj sınırsız", "Şehir merkezinden kalkış"],
    });
  }

  return alts;
}

// ─────────────────────────────────────────────
// Provider component
// ─────────────────────────────────────────────
export function TravelProvider({ children }: { children: ReactNode }) {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAiSimulation = useCallback(
    async (formData: RawFormInput): Promise<void> => {
      setIsLoading(true);
      setError(null);
      setAnalysisResult(null);

      try {
        // Simulate AI processing — synced with Person Y's
        // letter-by-letter scanning animation (~2.6s)
        await new Promise((resolve) => setTimeout(resolve, 2600));

        const now = new Date();
        const departureDate = new Date(formData.date);
        departureDate.setHours(
          6 + Math.floor(Math.random() * 14),
          Math.floor(Math.random() * 60)
        );

        const arrivalDate = new Date(
          departureDate.getTime() + 1000 * 60 * 60 * (2 + Math.random() * 4)
        );

        const checkInDeadline = new Date(
          departureDate.getTime() - 1000 * 60 * 60 * 2
        ).toISOString();

        const needsValidation =
          formData.airline === "TRENITALIA" ||
          formData.airline === "DB" ||
          formData.airline === "OBB";

        const risks = buildRisks(formData, checkInDeadline);
        const fees = buildFees(formData);
        const savings = buildSavings(fees);
        const alternatives = buildAlternatives(formData);

        const result: AnalysisResult = {
          id: `analysis_${Date.now()}`,
          analyzedAt: now.toISOString(),
          segment: {
            pnr: generatePnr(),
            operator: formData.airline,
            mode: formData.transportType,
            origin: formData.origin,
            destination: formData.destination,
            departureTime: departureDate.toISOString(),
            arrivalTime: arrivalDate.toISOString(),
            checkInDeadline:
              formData.transportType === "FLIGHT"
                ? checkInDeadline
                : undefined,
            validationRequired: needsValidation,
          },
          risks,
          savings,
          alternatives,
          fees,
        };

        setAnalysisResult(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setAnalysisResult(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return (
    <TravelContext.Provider
      value={{ analysisResult, isLoading, error, runAiSimulation, reset }}
    >
      {children}
    </TravelContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Consumer hook
// ─────────────────────────────────────────────
export function useTravel(): TravelContextValue {
  const ctx = useContext(TravelContext);
  if (!ctx) {
    throw new Error(
      "useTravel() must be used within a <TravelProvider>. " +
        "Wrap your layout with TravelProvider in src/app/layout.tsx."
    );
  }
  return ctx;
}
