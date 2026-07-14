"use client";

// ─────────────────────────────────────────────
// app/analyze/AnalyzeForm.tsx
// TS-103: /analyze giriş formu + bilet yapıştırma alanı
// TS-104: "AI ajanları kuralları okuyor…" loading/yazma animasyonu
//
// FILE PLACEMENT NOTE (avoid merge conflicts):
//   Person Y (Yasin) owns: src/app/analyze/
//
// Veri sözleşmesi: /dashboard, lib/mock-analysis.ts içindeki
// AnalysisResult'ı tüketiyor (Münevver'in alanı). Sprint 1'de bu
// form MOCK_ANALYSIS.id ile ?id= paslar; gerçek API geldiğinde
// yalnızca handleAnalyze içindeki push hedefi güncellenir.
// ─────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardPaste,
  Luggage,
  MapPin,
  Plane,
  ScanLine,
  TrainFront,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_ANALYSIS } from "@/lib/mock-analysis";
import styles from "./analyze.module.css";

// ── sabitler ─────────────────────────────────

const PARSING_LINES = [
  "Rezervasyon kodu okunuyor…",
  "Tarife sınıfı → operatör kuralları eşleştiriliyor…",
  "Kabin bagajı politikası kontrol ediliyor (40×20×25)…",
  "Kapı ücreti tetikleyicileri işaretleniyor…",
];

const LINE_MS = 640; // satır başına süre → ~2.6 sn sonra yönlendirme

type Mode = "paste" | "manual";
type Transport = "FLIGHT" | "TRAIN";
type CabinBag = "yes" | "no" | "unsure";

// ── küçük parçalar ───────────────────────────

const fieldBase =
  "h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 " +
  "placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[var(--color-primary)]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
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
      className="grid auto-cols-fr grid-flow-col rounded-lg border border-zinc-300 bg-zinc-100 p-0.5"
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
                ? "bg-white font-medium text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
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
        <span key={i} style={{ width: w }} className="bg-zinc-900" />
      ))}
    </div>
  );
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Kendini harf harf yazan parsing satırı (TS-104). */
function TypedLine({ text, done }: { text: string; done: boolean }) {
  // Azaltılmış hareket tercihinde satır doğrudan tam gösterilir.
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

  const [mode, setMode] = useState<Mode>("paste");
  const [pastedText, setPastedText] = useState("");
  const [operator, setOperator] = useState("RYANAIR");
  const [transport, setTransport] = useState<Transport>("FLIGHT");
  const [travelDate, setTravelDate] = useState("");
  const [cabinBag, setCabinBag] = useState<CabinBag>("unsure");
  const [destination, setDestination] = useState("");

  const [scanning, setScanning] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const canAnalyze =
    mode === "paste"
      ? pastedText.trim().length > 0
      : travelDate !== "" && destination.trim().length > 0;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function handleAnalyze() {
    if (!canAnalyze || scanning) return;

    setScanning(true);
    setLineIndex(0);
    PARSING_LINES.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => setLineIndex(i + 1), (i + 1) * LINE_MS)
      );
    });
    timers.current.push(
      setTimeout(
        // Sprint 1: dashboard mock id ile besleniyor; ?id= ileriye dönük.
        () => router.push(`/dashboard?id=${MOCK_ANALYSIS.id}`),
        PARSING_LINES.length * LINE_MS + 350
      )
    );
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
      <section
        aria-label="Seyahat bilgileri"
        className={`overflow-hidden rounded-2xl bg-zinc-50 text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_16px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/10 ${styles.fadeUpDelay}`}
      >
        {/* kart üst şeridi */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-6 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
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
                  "Rezervasyon onayını buraya yapıştır…\n\nörn. “Ryanair booking XK4F2L · IST → BCN · 14 Ağu · Basic fare”"
                }
                className={`${fieldBase} h-auto resize-none py-2.5 font-mono text-[13px] leading-relaxed`}
              />
              <p className="text-xs text-zinc-500">
                Bu önizleme sürümünde hiçbir veri tarayıcından çıkmaz.
              </p>
            </div>
          ) : (
            <div
              key="manual"
              className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${styles.panelIn}`}
            >
              <div className="space-y-2">
                <label htmlFor="operator" className="block">
                  <FieldLabel>Taşıyıcı</FieldLabel>
                </label>
                <select
                  id="operator"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className={fieldBase}
                >
                  <option value="RYANAIR">Ryanair</option>
                  <option value="WIZZAIR">Wizz Air</option>
                  <option value="OTHER">Diğer</option>
                </select>
              </div>

              <div className="space-y-2">
                <FieldLabel>Ulaşım</FieldLabel>
                <Segmented<Transport>
                  ariaLabel="Ulaşım türü"
                  value={transport}
                  onChange={setTransport}
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
                  ]}
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

              <div className="space-y-2">
                <label htmlFor="destination" className="block">
                  <FieldLabel>
                    <MapPin size={11} className="mr-1 inline" aria-hidden />
                    Varış noktası
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

              <div className="space-y-2 sm:col-span-2">
                <FieldLabel>
                  <Luggage size={11} className="mr-1 inline" aria-hidden />
                  Kabin bagajı dahil mi?
                </FieldLabel>
                <Segmented<CabinBag>
                  ariaLabel="Kabin bagajı durumu"
                  value={cabinBag}
                  onChange={setCabinBag}
                  options={[
                    { value: "yes", label: "Evet, dahil" },
                    { value: "no", label: "Hayır" },
                    { value: "unsure", label: "Emin değilim" },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* perforeli koparma çizgisi */}
        <div className="relative">
          <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--color-background)]" />
          <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[var(--color-background)]" />
          <div className="mx-6 border-t-2 border-dashed border-zinc-300" />
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="hidden sm:block">
            <Barcode />
          </div>
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={!canAnalyze || scanning}
            className="flex-1 sm:flex-none sm:px-8"
          >
            Seyahatimi Analiz Et
          </Button>
        </div>
      </section>

      <p className="mt-6 text-center font-mono text-[11px] tracking-wide text-[var(--color-foreground)]/40">
        RYR · WZZ tarife anlık görüntüleri · yalnızca önizleme verisi
      </p>

      {/* ── AI tarama overlay'i (TS-104) ─────────────────────────── */}
      {scanning && (
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
                  {destination || operator}
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
