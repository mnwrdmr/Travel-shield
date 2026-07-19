"use client";

// ─────────────────────────────────────────────
// app/analyze/AnalyzeForm.tsx
// SPRINT 2 — Person Y exclusive work dock (src/app/analyze/*)
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

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardPaste,
  Bus,
  Luggage,
  MapPin,
  Plane,
  PlaneTakeoff,
  ScanLine,
  Send,
  TrainFront,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTravel } from "@/context/TravelContext"; // Person A
import type { Operator, RawFormInput, TransportMode } from "@/types/travel";
import styles from "./analyze.module.css";

// ── sabitler ─────────────────────────────────

const PARSING_LINES = [
  "Rezervasyon kodu okunuyor…",
  "Tarife sınıfı → operatör kuralları eşleştiriliyor…",
  "Kabin bagajı politikası kontrol ediliyor…",
  "Kapı ücreti tetikleyicileri işaretleniyor…",
];

// 4 satır × 640ms ≈ 2.56s → context'in 2600ms simülasyonuyla senkron
const LINE_MS = 640;

type Mode = "paste" | "manual";
type Airline = Extract<Operator, "RYANAIR" | "WIZZAIR" | "EASYJET">;

// ── yardımcılar ──────────────────────────────

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Yapıştırılan metinden RawFormInput çıkarımı (demo amaçlı basit parser). */
function parsePastedBooking(text: string): RawFormInput {
  const lower = text.toLowerCase();

  let airline: Operator = "RYANAIR";
  if (lower.includes("wizz")) airline = "WIZZAIR";
  else if (lower.includes("easyjet")) airline = "EASYJET";
  else if (lower.includes("trenitalia")) airline = "TRENITALIA";
  else if (lower.includes("flixbus")) airline = "FLIXBUS";

  const transportType: TransportMode =
    airline === "TRENITALIA" ? "TRAIN" : airline === "FLIXBUS" ? "BUS" : "FLIGHT";

  // "IST → BCN", "IST - BCN", "IST-BCN" gibi kalıpları yakala
  const routeMatch = text.match(/\b([A-Z]{3})\s*(?:→|->|–|-)\s*([A-Z]{3})\b/);

  // Metinde ISO tarih varsa al, yoksa yarını varsay (simülasyon için gerekli)
  const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  const fallbackDate = new Date(Date.now() + 1000 * 60 * 60 * 24)
    .toISOString()
    .slice(0, 10);

  return {
    airline,
    transportType,
    origin: routeMatch?.[1] ?? "Belirtilmedi",
    destination: routeMatch?.[2] ?? "Belirtilmedi",
    date: dateMatch?.[1] ?? fallbackDate,
    cabinBagIncluded: /priority|cabin bag|kabin bagaj/i.test(text),
    pastedBookingText: text,
  };
}

// ── küçük parçalar ───────────────────────────

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
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid auto-cols-fr grid-flow-col rounded-lg border border-white/10 bg-white/5 p-0.5"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
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

/** Boolean kabin bagajı anahtarı (RawFormInput.cabinBagIncluded). */
function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
        checked ? "bg-[var(--color-primary)]" : "bg-white/15"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/** Sahte barkod: deterministik çubuk genişlikleri (re-render'da titremesin). */
function Barcode() {
  const bars = useMemo(
    () => Array.from({ length: 42 }, (_, i) => ((i * 7919) % 3) + 1),
    []
  );
  return (
    <div aria-hidden className="flex h-10 items-stretch gap-[3px]">
      {bars.map((w, i) => (
        <span key={i} style={{ width: w }} className="bg-zinc-100/80" />
      ))}
    </div>
  );
}

/** Sahte QR: deterministik hücre deseni (Telegram teaser için). */
function MockQr() {
  const cells = useMemo(
    () => Array.from({ length: 121 }, (_, i) => ((i * 31) % 7) < 3),
    []
  );
  return (
    <div
      aria-hidden
      className="grid h-20 w-20 shrink-0 grid-cols-11 gap-px rounded-md bg-white p-1.5"
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-zinc-900" : "bg-white"} />
      ))}
    </div>
  );
}

/** Kendini harf harf yazan parsing satırı. */
function TypedLine({ text, done }: { text: string; done: boolean }) {
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? text : ""));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let i = 0;
    const step = Math.max(12, (LINE_MS - 120) / text.length);
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [text]);

  return (
    <div className="flex items-baseline gap-2 font-mono text-[13px] text-zinc-200">
      <span className={done ? "text-[var(--color-success)]" : "text-[var(--color-primary)]"}>
        {done ? "✓" : "›"}
      </span>
      <span>
        {shown}
        {!done && <span className={styles.caret}>▌</span>}
      </span>
    </div>
  );
}

// ── ana bileşen ──────────────────────────────

export default function AnalyzeForm() {
  const router = useRouter();
  const { isLoading, error, runAiSimulation } = useTravel(); // Person A

  const [mode, setMode] = useState<Mode>("paste");
  const [pastedText, setPastedText] = useState("");
  const [airline, setAirline] = useState<Airline>("RYANAIR");
  const [transportType, setTransportType] = useState<TransportMode>("FLIGHT");
  const [travelDate, setTravelDate] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [cabinBagIncluded, setCabinBagIncluded] = useState(false);

  const [lineIndex, setLineIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const canAnalyze =
    mode === "paste"
      ? pastedText.trim().length > 0
      : travelDate !== "" &&
        origin.trim().length > 0 &&
        destination.trim().length > 0;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  async function handleAnalyze() {
    if (!canAnalyze || isLoading) return;

    const formData: RawFormInput =
      mode === "paste"
        ? parsePastedBooking(pastedText)
        : {
            airline,
            transportType,
            origin: origin.trim(),
            destination: destination.trim(),
            date: travelDate,
            cabinBagIncluded,
          };

    // Yazma animasyonu satırlarını zamanla (overlay isLoading ile açılır)
    setLineIndex(0);
    timers.current.forEach(clearTimeout);
    timers.current = PARSING_LINES.map((_, i) =>
      setTimeout(() => setLineIndex(i + 1), (i + 1) * LINE_MS)
    );

    // Global simülasyon (2600ms) — bitince temiz yönlendirme
    await runAiSimulation(formData);
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-14 sm:py-20">
      {/* başlık */}
      <header className={`mb-8 ${styles.fadeUp}`}>
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-primary)]">
          <ScanLine size={13} aria-hidden />
          Travel Shield · Uçuş öncesi kontrol
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
          Bileti onlar taramadan önce sen tara.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground)]/60">
          Rezervasyon onayını yapıştır ya da bilgileri elle gir — kapıya
          varmadan önce tarife kurallarında saklanan ücretleri işaretleyelim.
        </p>
      </header>

      {/* biniş kartı */}
      <Card
        aria-label="Seyahat bilgileri"
        className={`overflow-hidden ${styles.fadeUpDelay}`}
      >
        {/* kart üst şeridi */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">
            Biniş kartı · taslak
          </span>
          <Segmented<Mode>
            ariaLabel="Giriş modu"
            value={mode}
            onChange={setMode}
            options={[
              {
                value: "paste",
                label: (
                  <>
                    <ClipboardPaste size={14} aria-hidden /> Bileti yapıştır
                  </>
                ),
              },
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
                id="booking-text"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={7}
                placeholder={
                  "Rezervasyon onayını buraya yapıştır…\n\nörn. “Ryanair booking XK4F2L · IST → BCN · 2026-08-14 · Basic fare”"
                }
                className={`${fieldBase} h-auto resize-none py-2.5 font-mono text-[13px] leading-relaxed`}
              />
              <p className="text-xs text-zinc-500">
                Metinden taşıyıcı, rota ve tarih otomatik çıkarılır. Hiçbir
                veri tarayıcından çıkmaz.
              </p>
            </div>
          ) : (
            <div
              key="manual"
              className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${styles.panelIn}`}
            >
              <div className="space-y-2">
                <label htmlFor="airline" className="block">
                  <FieldLabel>Taşıyıcı</FieldLabel>
                </label>
                <select
                  id="airline"
                  value={airline}
                  onChange={(e) => setAirline(e.target.value as Airline)}
                  className={fieldBase}
                >
                  <option value="RYANAIR">Ryanair</option>
                  <option value="WIZZAIR">Wizz Air</option>
                  <option value="EASYJET">EasyJet</option>
                </select>
              </div>

              <div className="space-y-2">
                <FieldLabel>Ulaşım</FieldLabel>
                <Segmented<TransportMode>
                  ariaLabel="Ulaşım türü"
                  value={transportType}
                  onChange={setTransportType}
                  options={[
                    {
                      value: "FLIGHT",
                      label: (
                        <>
                          <Plane size={14} aria-hidden /> Uçak
                        </>
                      ),
                    },
                    {
                      value: "TRAIN",
                      label: (
                        <>
                          <TrainFront size={14} aria-hidden /> Tren
                        </>
                      ),
                    },
                    {
                      value: "BUS",
                      label: (
                        <>
                          <Bus size={14} aria-hidden /> Otobüs
                        </>
                      ),
                    },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="origin" className="block">
                  <FieldLabel>
                    <PlaneTakeoff size={11} className="mr-1 inline" aria-hidden />
                    Kalkış
                  </FieldLabel>
                </label>
                <input
                  id="origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="örn. İstanbul"
                  className={`${fieldBase} font-mono text-[13px]`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="destination" className="block">
                  <FieldLabel>
                    <MapPin size={11} className="mr-1 inline" aria-hidden />
                    Varış
                  </FieldLabel>
                </label>
                <input
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="örn. Barselona"
                  className={`${fieldBase} font-mono text-[13px]`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="travel-date" className="block">
                  <FieldLabel>
                    <CalendarDays size={11} className="mr-1 inline" aria-hidden />
                    Seyahat tarihi
                  </FieldLabel>
                </label>
                <input
                  id="travel-date"
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className={`${fieldBase} font-mono text-[13px]`}
                />
              </div>

              <div className="flex items-end justify-between gap-3 pb-1 sm:col-span-1">
                <FieldLabel>
                  <Luggage size={11} className="mr-1 inline" aria-hidden />
                  Kabin bagajı dahil
                </FieldLabel>
                <ToggleSwitch
                  checked={cabinBagIncluded}
                  onChange={setCabinBagIncluded}
                  label="Kabin bagajı dahil"
                />
              </div>
            </div>
          )}
        </div>

        {/* perforeli koparma çizgisi */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--color-background)]" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--color-background)]" />
          <div className="mx-6 border-t-2 border-dashed border-white/15" />
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="hidden sm:block">
            <Barcode />
          </div>
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!canAnalyze || isLoading}
            className="flex-1 sm:flex-none sm:px-8"
          >
            Seyahatimi Analiz Et
          </Button>
        </div>
      </Card>

      {/* hata durumu (context'ten) */}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 px-4 py-3 text-sm text-[var(--color-destructive)]"
        >
          Analiz başarısız oldu: {error}
        </p>
      )}

      {/* Telegram bot teaser (Sprint 2 — omnichannel) */}
      <Card className={`mt-6 ${styles.fadeUpDelay}`}>
        <div className="flex items-center gap-5 p-5">
          <MockQr />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <Send size={14} className="text-[var(--color-primary)]" aria-hidden />
              Yazmak istemiyor musun?
              <span className="rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-primary)]">
                Yakında
              </span>
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              Bilet PDF&apos;ini doğrudan{" "}
              <strong className="text-zinc-200">Travel Shield Telegram
              Botu</strong>&apos;na ilet, analiz raporu sohbetine düşsün.
              QR&apos;ı taratman yeterli.
            </p>
          </div>
        </div>
      </Card>

      <p className="mt-6 text-center font-mono text-[11px] tracking-wide text-[var(--color-foreground)]/40">
        RYR · WZZ · EZY tarife anlık görüntüleri · yalnızca simülasyon verisi
      </p>

      {/* ── AI tarama overlay'i (global isLoading ile) ──────────── */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-sm ${styles.overlayIn}`}
        >
          <div className="w-full max-w-md">
            {/* taranan mini bilet */}
            <div className="relative overflow-hidden rounded-xl bg-zinc-50 p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Bilet kuralları
                </span>
                <span className="font-mono text-[10px] text-zinc-400">
                  {destination.trim() || airline}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-2 w-3/4 rounded bg-zinc-200" />
                <div className="h-2 w-1/2 rounded bg-zinc-200" />
                <div className="h-2 w-2/3 rounded bg-zinc-200" />
              </div>
              <div aria-hidden className={styles.scanline} />
            </div>

            {/* parsing terminali */}
            <div className="mt-5 min-h-[112px] space-y-2 px-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-400">
                AI ajanları bilet kurallarını okuyor…
              </p>
              {PARSING_LINES.slice(
                0,
                Math.min(lineIndex + 1, PARSING_LINES.length)
              ).map((line, i) => (
                <TypedLine key={line} text={line} done={i < lineIndex} />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
