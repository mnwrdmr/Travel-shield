"use client";
// ─────────────────────────────────────────────
// src/app/analyze/AnalyzeForm.tsx
// SPRINT FINAL DEĞİŞİKLİKLERİ:- Person M
//   ✅ Türk havayolları eklendi: THY, Pegasus, AJet, SunExpress, Corendon
//   ✅ LuggageScanner (FastAPI entegreli) BaggageScannerTab'e entegre edildi
//   ✅ WhatsApp referansları tamamen kaldırıldı → sadece Telegram
//   ✅ Operator tipi güncellendi
// ─────────────────────────────────────────────────────────────
// app/analyze/AnalyzeForm.tsx
// SPRINT 2+3 — Person Y exclusive work dock (src/app/analyze/*)
//
// SPRINT 3 EKLERİ:
//   ✅ Üst sekme yapısı: "Bilet Metni / PNR" ↔ "Bavul AI Kamera & AR Taraması"
//   ✅ BaggageScannerTab entegrasyonu (components/analyze/)
//   ✅ runBaggageAiSimulation(operator, dims, image) → /dashboard akışı
//   ✅ Bagaj analizi için ayrı tarama overlay'i (1.8s motora senkron)
//
// DEĞİŞİKLİKLER (Sprint 1 → Sprint 2):
//   ❌ KALDIRILDI: MOCK_ANALYSIS importu + ?id= yönlendirmesi
//   ❌ KALDIRILDI: lokal "scanning" async state'i
//   ✅ EKLENDİ   : useTravel() → runAiSimulation(formData), global isLoading
//   ✅ EKLENDİ   : EasyJet, Otobüs, Kalkış alanı, boolean kabin bagajı switch'i
//   ✅ EKLENDİ   : Telegram bot teaser kartı (QR mock)
//   ✅ EKLENDİ   : koyu tema hizalaması (Person A'nın global stiliyle uyumlu)
//   ✅ KORUNDU   : biniş kartı yapısı, scanline + harf harf yazma animasyonu
// ─────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bus, CalendarDays, Camera, ClipboardPaste, Luggage,
  MapPin, Plane, PlaneTakeoff, ScanLine, Send, Ticket, TrainFront,
} from "lucide-react";
import { BaggageScannerTab } from "@/components/analyze/BaggageScannerTab";
import RagKnowledgeCard from "@/components/analyze/RagKnowledgeCard";
import { Button }   from "@/components/ui/button";
import { Card }     from "@/components/ui/card";
import { useTravel } from "@/context/TravelContext";
import type { BaggageDimensions, BackendScanResponse, Operator, RawFormInput, TransportMode } from "@/types/travel";
import styles from "./analyze.module.css";

// ── Türk + Avrupa havayolları (Sprint Final) ──────────────────
const AIRLINES: { value: Operator; label: string; group: string }[] = [
  // Türk havayolları
  { value: "THY",        label: "Turkish Airlines (THY)",  group: "Türk Havayolları" },
  { value: "PEGASUS",    label: "Pegasus Airlines",         group: "Türk Havayolları" },
  { value: "AJET",       label: "AJet (AnadoluJet)",        group: "Türk Havayolları" },
  { value: "SUNEXPRESS", label: "SunExpress",               group: "Türk Havayolları" },
  { value: "CORENDON",   label: "Corendon Airlines",        group: "Türk Havayolları" },
  // Avrupa LCC
  { value: "RYANAIR",    label: "Ryanair",                  group: "Avrupa LCC" },
  { value: "WIZZAIR",    label: "Wizz Air",                 group: "Avrupa LCC" },
  { value: "EASYJET",    label: "EasyJet",                  group: "Avrupa LCC" },
];

const PARSING_LINES = [
  "Rezervasyon kodu okunuyor…",
  "Tarife sınıfı → operatör kuralları eşleştiriliyor…",
  "Kabin bagajı politikası kontrol ediliyor…",
  "Kapı ücreti tetikleyicileri işaretleniyor…",
];
const LINE_MS = 640;

const BAGGAGE_LINES = [
  "Bavul görüntüsü işleniyor…",
  "Vision AI boyut kestirimi yapıyor…",
  "Havayolu kabin limitleriyle kıyaslanıyor…",
];
const BAG_LINE_MS = 600;

type Section = "ticket" | "baggage";
type Mode    = "paste" | "manual";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function parsePastedBooking(text: string): RawFormInput {
  const lower = text.toLowerCase();
  let airline: Operator = "RYANAIR";
  if (lower.includes("wizz"))         airline = "WIZZAIR";
  else if (lower.includes("easyjet")) airline = "EASYJET";
  else if (lower.includes("thy") || lower.includes("turkish")) airline = "THY";
  else if (lower.includes("pegasus") || lower.includes("flypgs")) airline = "PEGASUS";
  else if (lower.includes("ajet") || lower.includes("anadolujet")) airline = "AJET";
  else if (lower.includes("sunexpress")) airline = "SUNEXPRESS";
  else if (lower.includes("corendon")) airline = "CORENDON";
  else if (lower.includes("trenitalia")) airline = "TRENITALIA";
  else if (lower.includes("flixbus")) airline = "FLIXBUS";

  const transportType: TransportMode =
    airline === "TRENITALIA" ? "TRAIN" : airline === "FLIXBUS" ? "BUS" : "FLIGHT";

  const routeMatch = text.match(/\b([A-Z]{3})\s*(?:→|->|–|-)\s*([A-Z]{3})\b/);
  const dateMatch  = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  const fallback   = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 10);

  return {
    airline,
    transportType,
    origin:      routeMatch?.[1] ?? "Belirtilmedi",
    destination: routeMatch?.[2] ?? "Belirtilmedi",
    date:        dateMatch?.[1]  ?? fallback,
    cabinBagIncluded: /priority|cabin bag|kabin bagaj/i.test(text),
    pastedBookingText: text,
  };
}

const fieldBase =
  "h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 " +
  "placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[var(--color-primary)] [color-scheme:dark]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
      {children}
    </span>
  );
}

function Segmented<T extends string>({
  value, onChange, options, ariaLabel,
}: {
  value: T; onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[]; ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel}
      className="grid auto-cols-fr grid-flow-col rounded-lg border border-white/10 bg-white/5 p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button key={opt.value} type="button" role="radio" aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
              active
                ? "bg-[var(--color-primary)]/20 font-medium text-zinc-100 shadow-sm ring-1 ring-[var(--color-primary)]/40"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
        checked ? "bg-[var(--color-primary)]" : "bg-white/15"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function Barcode() {
  const bars = useMemo(() => Array.from({ length: 42 }, (_, i) => ((i * 7919) % 3) + 1), []);
  return (
    <div aria-hidden className="flex h-10 items-stretch gap-[3px]">
      {bars.map((w, i) => <span key={i} style={{ width: w }} className="bg-zinc-100/80" />)}
    </div>
  );
}

function MockQr() {
  const cells = useMemo(() => Array.from({ length: 121 }, (_, i) => ((i * 31) % 7) < 3), []);
  return (
    <div aria-hidden className="grid h-20 w-20 shrink-0 grid-cols-11 gap-px rounded-md bg-white p-1.5">
      {cells.map((on, i) => <span key={i} className={on ? "bg-zinc-900" : "bg-white"} />)}
    </div>
  );
}

function TypedLine({ text, done }: { text: string; done: boolean }) {
  const [shown, setShown] = useState(() => prefersReducedMotion() ? text : "");
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let i = 0;
    const step = Math.max(12, (LINE_MS - 120) / text.length);
    const id = setInterval(() => {
      i += 1; setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [text]);
  return (
    <div className="flex items-baseline gap-2 font-mono text-[13px] text-zinc-200">
      <span className={done ? "text-[var(--color-success)]" : "text-[var(--color-primary)]"}>
        {done ? "✓" : "›"}
      </span>
      <span>{shown}{!done && <span className={styles.caret}>▌</span>}</span>
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────
export default function AnalyzeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, isBaggageAnalyzing, error, runAiSimulation, runBaggageAiSimulation } = useTravel();

  const [section, setSection] = useState<Section>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "baggage"
      ? "baggage" : "ticket"
  );
  useEffect(() => {
    if (searchParams?.get("tab") === "baggage") setSection("baggage");
  }, [searchParams]);

  const [mode, setMode]                   = useState<Mode>("paste");
  const [pastedText, setPastedText]       = useState("");
  const [airline, setAirline]             = useState<Operator>("THY");
  const [transportType, setTransportType] = useState<TransportMode>("FLIGHT");
  const [travelDate, setTravelDate]       = useState("");
  const [origin, setOrigin]               = useState("");
  const [destination, setDestination]     = useState("");
  const [cabinBagIncluded, setCabinBag]   = useState(false);
  const [lineIndex, setLineIndex]         = useState(0);
  const [bagLineIndex, setBagLineIndex]   = useState(0);
  const [bagPreview, setBagPreview]       = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const canAnalyze =
    mode === "paste"
      ? pastedText.trim().length > 0
      : travelDate !== "" && origin.trim().length > 0 && destination.trim().length > 0;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  async function handleAnalyze() {
    if (!canAnalyze || isLoading) return;
    const formData: RawFormInput = mode === "paste"
      ? parsePastedBooking(pastedText)
      : { airline, transportType, origin: origin.trim(), destination: destination.trim(), date: travelDate, cabinBagIncluded };

    setLineIndex(0);
    timers.current.forEach(clearTimeout);
    timers.current = PARSING_LINES.map((_, i) =>
      setTimeout(() => setLineIndex(i + 1), (i + 1) * LINE_MS)
    );
    await runAiSimulation(formData);
    router.push("/dashboard");
  }

  async function handleBaggageAnalyze(dimensions: BaggageDimensions, imageUrl?: string) {
    if (isBaggageAnalyzing || isLoading) return;
    setBagPreview(imageUrl ?? null);
    setBagLineIndex(0);
    timers.current.forEach(clearTimeout);
    timers.current = BAGGAGE_LINES.map((_, i) =>
      setTimeout(() => setBagLineIndex(i + 1), (i + 1) * BAG_LINE_MS)
    );
    await runBaggageAiSimulation(airline, dimensions, imageUrl);
    router.push("/dashboard");
  }

  // FastAPI sonucu geldiğinde context'e aktar ve yönlendir
  const handleFastApiResult = useCallback(async (result: BackendScanResponse) => {
    if (!result.is_luggage) return;
    const dims: BaggageDimensions | undefined = result.detected_dimensions
      ? { widthCm: result.detected_dimensions.width_cm, heightCm: result.detected_dimensions.height_cm, depthCm: result.detected_dimensions.depth_cm }
      : undefined;
    await runBaggageAiSimulation(airline, dims, undefined);
    router.push("/dashboard");
  }, [airline, router, runBaggageAiSimulation]);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-14 sm:py-20">
      <header className={`mb-8 ${styles.fadeUp}`}>
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-primary)]">
          <ScanLine size={13} aria-hidden />
          Travel Shield · Uçuş öncesi kontrol
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Bileti onlar taramadan önce sen tara.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]/60">
          Rezervasyon onayını yapıştır ya da bilgileri elle gir — kapıya varmadan önce gizli ücretleri ortaya çıkaralım.
        </p>
      </header>

      {/* Sekmeler */}
      <div role="tablist" aria-label="Analiz türü"
        className={`mb-4 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1 ${styles.fadeUpDelay}`}
      >
        {([
          { key: "ticket",  icon: Ticket, label: "Bilet Metni / PNR" },
          { key: "baggage", icon: Camera, label: "Bavul AI & AR Tarama" },
        ] as const).map(({ key, icon: Icon, label }) => (
          <button key={key} type="button" role="tab" aria-selected={section === key}
            onClick={() => setSection(key)}
            className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
              section === key
                ? "bg-[var(--color-primary)]/20 font-medium text-zinc-100 ring-1 ring-[var(--color-primary)]/40"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Icon size={15} aria-hidden /> {label}
          </button>
        ))}
      </div>

      {section === "baggage" ? (
        <Card aria-label="Bavul taraması" className={`overflow-hidden ${styles.panelIn}`}>
          <div className="px-6 py-6">
            <BaggageScannerTab
              operator={airline}
              onOperatorChange={(op) => setAirline(op as Operator)}
              analyzing={isBaggageAnalyzing}
              onAnalyze={handleBaggageAnalyze}
              onFastApiResult={handleFastApiResult}
            />
          </div>
        </Card>
      ) : (
        <Card aria-label="Seyahat bilgileri" className={`overflow-hidden ${styles.panelIn}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">
              Biniş kartı · taslak
            </span>
            <Segmented<Mode>
              ariaLabel="Giriş modu" value={mode} onChange={setMode}
              options={[
                { value: "paste",  label: <><ClipboardPaste size={14} aria-hidden /> Bileti yapıştır</> },
                { value: "manual", label: "Elle gir" },
              ]}
            />
          </div>

          <div className="px-6 py-6">
            {mode === "paste" ? (
              <div key="paste" className={`space-y-2 ${styles.panelIn}`}>
                <label htmlFor="booking-text" className="block">
                  <FieldLabel>Onay metni veya URL</FieldLabel>
                </label>
                <textarea
                  id="booking-text" value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={7}
                  placeholder={"Rezervasyon onayını buraya yapıştır…\n\nörn. 'THY booking TK2345 · IST → BCN · 2026-08-14'"}
                  className={`${fieldBase} h-auto resize-none py-2.5 font-mono text-[13px] leading-relaxed`}
                />
                <p className="text-xs text-zinc-500">
                  Metinden taşıyıcı, rota ve tarih otomatik çıkarılır. Hiçbir veri tarayıcından çıkmaz.
                </p>
              </div>
            ) : (
              <div key="manual" className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${styles.panelIn}`}>

                {/* ── TÜRK + AVRUPA HAVAYOLLARI DROPDOWN (Sprint Final) ── */}
                <div className="space-y-2">
                  <label htmlFor="airline" className="block">
                    <FieldLabel>Taşıyıcı</FieldLabel>
                  </label>
                  <select
                    id="airline" value={airline}
                    onChange={(e) => setAirline(e.target.value as Operator)}
                    className={fieldBase}
                  >
                    <optgroup label="Türk Havayolları">
                      {AIRLINES.filter(a => a.group === "Türk Havayolları").map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Avrupa LCC">
                      {AIRLINES.filter(a => a.group === "Avrupa LCC").map(a => (
                        <option key={a.value} value={a.value}>{a.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-2">
                  <FieldLabel>Ulaşım</FieldLabel>
                  <Segmented<TransportMode>
                    ariaLabel="Ulaşım türü" value={transportType} onChange={setTransportType}
                    options={[
                      { value: "FLIGHT", label: <><Plane size={14} aria-hidden /> Uçak</> },
                      { value: "TRAIN",  label: <><TrainFront size={14} aria-hidden /> Tren</> },
                      { value: "BUS",    label: <><Bus size={14} aria-hidden /> Otobüs</> },
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="origin" className="block">
                    <FieldLabel><PlaneTakeoff size={11} className="mr-1 inline" aria-hidden />Kalkış</FieldLabel>
                  </label>
                  <input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)}
                    placeholder="örn. İstanbul" className={`${fieldBase} font-mono text-[13px]`}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="destination" className="block">
                    <FieldLabel><MapPin size={11} className="mr-1 inline" aria-hidden />Varış</FieldLabel>
                  </label>
                  <input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)}
                    placeholder="örn. Barselona" className={`${fieldBase} font-mono text-[13px]`}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="travel-date" className="block">
                    <FieldLabel><CalendarDays size={11} className="mr-1 inline" aria-hidden />Seyahat tarihi</FieldLabel>
                  </label>
                  <input id="travel-date" type="date" value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className={`${fieldBase} font-mono text-[13px]`}
                  />
                </div>

                <div className="flex items-end justify-between gap-3 pb-1 sm:col-span-1">
                  <FieldLabel><Luggage size={11} className="mr-1 inline" aria-hidden />Kabin bagajı dahil</FieldLabel>
                  <ToggleSwitch checked={cabinBagIncluded} onChange={setCabinBag} label="Kabin bagajı dahil" />
                </div>
              </div>
            )}
          </div>

          {/* Perforeli çizgi */}
          <div className="relative">
            <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--color-background)]" />
            <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--color-background)]" />
            <div className="mx-6 border-t-2 border-dashed border-white/15" />
          </div>

          <div className="flex items-center justify-between gap-4 px-6 py-5">
            <div className="hidden sm:block"><Barcode /></div>
            <Button size="lg" onClick={handleAnalyze} disabled={!canAnalyze || isLoading}
              className="flex-1 sm:flex-none sm:px-8">
              Seyahatimi Analiz Et
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <p role="alert"
          className="mt-4 rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 px-4 py-3 text-sm text-[var(--color-destructive)]">
          Analiz başarısız oldu: {error}
        </p>
      )}

      {/* ── Telegram Teaser (WhatsApp KALDIRILDI — Sprint Final) ── */}
      <Card className={`mt-6 ${styles.fadeUpDelay}`}>
        <div className="flex items-center gap-5 p-5">
          <MockQr />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Send size={14} className="text-sky-400" aria-hidden />
              Yazmak istemiyor musun?
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-sky-400">
                Yakında
              </span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Bilet PDF&apos;ini doğrudan{" "}
              <strong className="text-zinc-200">@TravelShieldBot</strong>&apos;a ilet,
              analiz raporu sohbetine düşsün. QR&apos;ı tarat — anında sonuç.
            </p>
          </div>
        </div>
      </Card>

      {/* RAG Engine Mevzuat & Ceza Sorgu Kartı */}
      <div className="mt-8">
        <RagKnowledgeCard />
      </div>

      <p className="mt-6 text-center font-mono text-[11px] tracking-wide text-[var(--color-foreground)]/40">
        THY · PGS · XQ · SunX · XC · RYR · WZZ · EZY tarife anlık görüntüleri · yalnızca simülasyon verisi
      </p>

      {/* Bagaj AI overlay */}
      {isBaggageAnalyzing && (
        <div role="status" aria-live="polite"
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm ${styles.overlayIn}`}
        >
          <div className="w-full max-w-md">
            <div className="relative overflow-hidden rounded-xl bg-zinc-900 p-4 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">Bavul taraması</span>
                <span className="font-mono text-[10px] text-zinc-500">{airline}</span>
              </div>
              {bagPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bagPreview} alt="" className="mx-auto mt-3 max-h-44 w-auto rounded-md object-contain opacity-90" />
              ) : (
                <div className="mt-3 flex h-28 items-center justify-center rounded-md bg-white/5">
                  <Luggage size={34} className="text-zinc-600" aria-hidden />
                </div>
              )}
              <div aria-hidden className={styles.scanline} />
            </div>
            <div className="mt-5 min-h-[92px] space-y-2 px-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">
                Vision AI bagajı değerlendiriyor…
              </p>
              {BAGGAGE_LINES.slice(0, Math.min(bagLineIndex + 1, BAGGAGE_LINES.length)).map((line, i) => (
                <TypedLine key={line} text={line} done={i < bagLineIndex} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bilet tarama overlay */}
      {isLoading && (
        <div role="status" aria-live="polite"
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm ${styles.overlayIn}`}
        >
          <div className="w-full max-w-md">
            <div className="relative overflow-hidden rounded-xl bg-zinc-50 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Bilet kuralları</span>
                <span className="font-mono text-[10px] text-zinc-400">{destination.trim() || airline}</span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-2 w-3/4 rounded bg-zinc-200" />
                <div className="h-2 w-1/2 rounded bg-zinc-200" />
                <div className="h-2 w-2/3 rounded bg-zinc-200" />
              </div>
              <div aria-hidden className={styles.scanline} />
            </div>
            <div className="mt-5 min-h-[112px] space-y-2 px-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">
                AI ajanları bilet kurallarını okuyor…
              </p>
              {PARSING_LINES.slice(0, Math.min(lineIndex + 1, PARSING_LINES.length)).map((line, i) => (
                <TypedLine key={line} text={line} done={i < lineIndex} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
