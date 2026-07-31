"use client";

/**
 * @file BaggageScannerTab.tsx
 * @description /analyze sayfasındaki bavul tarama sekmesi.
 *
 * İki mod:
 *  - "camera"  → LuggageScanner (FastAPI Vision AI entegreli)
 *  - "manual"  → Kaydırıcılarla boyut girişi + kıyaslama barları
 *
 * Dışa açık: onFastApiResult — FastAPI'den gelen sonucu üst bileşene iletir.
 */

// ─────────────────────────────────────────────
// components/analyze/BaggageScannerTab.tsx
// SPRINT 3 — Person Y (Camera Vision)
//
// Bavul fotoğrafı yükleme (sürükle-bırak + dosya) ve kamera çekimi,
// önizleme üzerinde SVG AR boyut çerçevesi + kenar rozetleri,
// manuel boyut ayarı için 3 slider ve analiz başlatma butonu.
// Gerçek analiz Person A'nın runBaggageAiSimulation motorunda;
// buradaki limit tablosu yalnızca rozet renklendirmesi için
// (motor tablosuyla aynı değerler).
// ─────────────────────────────────────────────

import { useCallback, useMemo, useState } from "react";
import { Luggage, Ruler, ScanLine, Sliders } from "lucide-react";

import LuggageScanner from "@/components/LuggageScanner";
import { Button }     from "@/components/ui/button";
import type { BackendScanResponse, BaggageDimensions, Operator } from "@/types/travel";
import { getAirlineBaggagePolicy } from "@/lib/airline-policies";

// ─── Sabitler ────────────────────────────────────────────────

const AIRLINES: { value: Operator; label: string; group: string }[] = [
  { value: "THY",        label: "Turkish Airlines (THY)", group: "Türk Havayolları" },
  { value: "PEGASUS",    label: "Pegasus Airlines",        group: "Türk Havayolları" },
  { value: "AJET",       label: "AJet (AnadoluJet)",       group: "Türk Havayolları" },
  { value: "SUNEXPRESS", label: "SunExpress",              group: "Türk Havayolları" },
  { value: "CORENDON",   label: "Corendon Airlines",       group: "Türk Havayolları" },
  { value: "RYANAIR",    label: "Ryanair",                 group: "Avrupa LCC"       },
  { value: "WIZZAIR",    label: "Wizz Air",                group: "Avrupa LCC"       },
  { value: "EASYJET",    label: "EasyJet",                 group: "Avrupa LCC"       },
];

// ─── Tipler ──────────────────────────────────────────────────

type TabMode = "camera" | "manual";

interface Dimension {
  key:   "widthCm" | "heightCm" | "depthCm";
  label: string;
  limitKey: "widthCm" | "heightCm" | "depthCm";
}

const DIMENSIONS: Dimension[] = [
  { key: "widthCm",  label: "Genişlik (cm)",  limitKey: "widthCm"  },
  { key: "heightCm", label: "Yükseklik (cm)", limitKey: "heightCm" },
  { key: "depthCm",  label: "Derinlik (cm)",  limitKey: "depthCm"  },
];

export interface BaggageScannerTabProps {
  operator:          string;
  onOperatorChange:  (op: string) => void;
  analyzing:         boolean;
  onAnalyze:         (dimensions: BaggageDimensions, imageUrl?: string) => void;
  onFastApiResult?:  (result: BackendScanResponse) => void;
}

// ─── Alt bileşenler ──────────────────────────────────────────

interface DimBarProps {
  label:    string;
  value:    number;
  limit:    number;
  maxValue: number;
}

function DimBar({ label, value, limit, maxValue }: DimBarProps) {
  const exceeded = value > limit;
  const fillPct  = Math.min(Math.round((value / maxValue) * 100), 100);
  const limitPct = Math.min(Math.round((limit / maxValue) * 100), 100);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-400">{label}</span>
        <span className={`font-mono font-bold ${exceeded ? "text-red-400" : "text-emerald-400"}`}>
          {value} cm
          {exceeded && (
            <span className="ml-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px]">
              +{value - limit} cm
            </span>
          )}
          <span className="ml-1 font-normal text-zinc-500">/ {limit} cm</span>
        </span>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            exceeded ? "bg-red-500" : "bg-emerald-500"
          }`}
          style={{ width: `${fillPct}%` }}
        />
        {/* Limit işareti */}
        <div
          className="absolute top-0 h-full w-px bg-slate-500 opacity-60"
          style={{ left: `${limitPct}%` }}
        />
      </div>
    </div>
  );
}

interface ModeTabsProps {
  value:    TabMode;
  onChange: (mode: TabMode) => void;
}

function ModeTabs({ value, onChange }: ModeTabsProps) {
  const options: { key: TabMode; Icon: typeof ScanLine; label: string }[] = [
    { key: "camera", Icon: ScanLine, label: "Fotoğraf / Kamera" },
    { key: "manual", Icon: Sliders,  label: "Manuel Boyut"      },
  ];

  return (
    <div role="tablist" aria-label="Tarama modu"
      className="grid grid-cols-2 rounded-lg border border-white/10 bg-white/5 p-0.5"
    >
      {options.map(({ key, Icon, label }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={[
            "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm",
            "transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
            value === key
              ? "bg-[var(--color-primary)]/20 font-medium text-zinc-100 ring-1 ring-[var(--color-primary)]/40"
              : "text-zinc-400 hover:text-zinc-200",
          ].join(" ")}
        >
          <Icon size={14} aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────

export function BaggageScannerTab({
  operator,
  onOperatorChange,
  analyzing,
  onAnalyze,
  onFastApiResult,
}: BaggageScannerTabProps) {
  const [tabMode, setTabMode] = useState<TabMode>("camera");

  const limits = getAirlineBaggagePolicy(operator);

  // Manuel boyut state'i — her boyut için limit + %40 üst sınır
  const [dims, setDims] = useState<BaggageDimensions>({
    widthCm:  limits.widthCm  + 2,
    heightCm: limits.heightCm + 2,
    depthCm:  limits.depthCm,
  });

  const maxValues = useMemo(() => ({
    widthCm:  Math.max(limits.widthCm  * 1.4, 80),
    heightCm: Math.max(limits.heightCm * 1.4, 70),
    depthCm:  Math.max(limits.depthCm  * 1.4, 50),
  }), [limits]);

  // FastAPI sonucunu yakala → slider'ları güncelle → üst bileşene ilet
  const handleFastApiResult = useCallback(
    (result: BackendScanResponse) => {
      if (result.is_luggage && result.detected_dimensions) {
        setDims({
          widthCm:  Math.round(result.detected_dimensions.width_cm),
          heightCm: Math.round(result.detected_dimensions.height_cm),
          depthCm:  Math.round(result.detected_dimensions.depth_cm),
        });
      }
      onFastApiResult?.(result);
    },
    [onFastApiResult]
  );

  const handleSliderChange = (key: keyof BaggageDimensions, value: number) => {
    setDims((prev) => ({ ...prev, [key]: value }));
  };

  const fieldBase = [
    "h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm",
    "text-zinc-100 focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[var(--color-primary)] [color-scheme:dark]",
  ].join(" ");

  return (
    <div className="space-y-5">
      {/* Havayolu seçimi */}
      <div className="space-y-1.5">
        <label
          htmlFor="bag-airline"
          className="block font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400"
        >
          Havayolu (Kabin Limiti Referansı)
        </label>

        <select
          id="bag-airline"
          value={operator}
          onChange={(e) => onOperatorChange(e.target.value)}
          className={fieldBase}
        >
          <optgroup label="Türk Havayolları">
            {AIRLINES.filter((a) => a.group === "Türk Havayolları").map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </optgroup>
          <optgroup label="Avrupa LCC">
            {AIRLINES.filter((a) => a.group === "Avrupa LCC").map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </optgroup>
        </select>

        <p className="font-mono text-[11px] text-zinc-500">
          {operator} kabin limiti:{" "}
          <span className="text-zinc-300">
            {limits.widthCm} × {limits.heightCm} × {limits.depthCm} cm
          </span>
          {limits.gateFee > 0 && (
            <span className="ml-2 text-red-400">· Kapı cezası: €{limits.gateFee}</span>
          )}
        </p>
      </div>

      {/* Mod sekmeleri */}
      <ModeTabs value={tabMode} onChange={setTabMode} />

      {/* ── Kamera modu ── */}
      {tabMode === "camera" && (
        <div className="space-y-4">
          <LuggageScanner
            operator={operator}
            onScanComplete={handleFastApiResult}
          />

          {/* AR bounding box özeti */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
            <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-zinc-400">
              <Ruler size={12} className="text-[var(--color-primary)]" aria-hidden />
              Boyut Rozetleri (AR Simülasyonu)
            </p>
            <div className="flex flex-wrap gap-2">
              {DIMENSIONS.map(({ key, label, limitKey }) => {
                const value = dims[key];
                const lim   = limits[limitKey];
                const over  = value > lim;
                return (
                  <span
                    key={key}
                    className={[
                      "rounded-lg border px-2.5 py-1 font-mono text-xs font-bold",
                      over
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
                    ].join(" ")}
                  >
                    {label.split(" ")[0]}: {value} cm{over ? ` ⚠ +${value - lim}` : " ✓"}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Manuel boyut modu ── */}
      {tabMode === "manual" && (
        <div className="space-y-5">
          <p className="flex items-center gap-2 text-[11px] text-zinc-500">
            <Luggage size={13} className="text-zinc-400" aria-hidden />
            Kaydırıcıyla çanta boyutlarınızı ayarlayın
          </p>

          {/* Sliders */}
          {DIMENSIONS.map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                <span>{label}</span>
                <span className="text-zinc-100">{dims[key]} cm</span>
              </label>
              <input
                type="range"
                min={5}
                max={Math.round(maxValues[key])}
                value={dims[key]}
                onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                className="w-full cursor-pointer accent-[var(--color-primary)]"
                aria-label={label}
              />
            </div>
          ))}

          {/* Kıyaslama barları */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              {operator} Limit Kıyaslaması
            </p>
            {DIMENSIONS.map(({ key, label, limitKey }) => (
              <DimBar
                key={key}
                label={label.split(" ")[0]}
                value={dims[key]}
                limit={limits[limitKey]}
                maxValue={maxValues[key]}
              />
            ))}
          </div>

          <Button
            type="button"
            size="lg"
            disabled={analyzing}
            onClick={() => onAnalyze(dims)}
            className="w-full"
          >
            <ScanLine size={16} className="mr-2" aria-hidden />
            {analyzing ? "Analiz Ediliyor…" : "Yapay Zeka Bagaj Analizini Başlat"}
          </Button>
        </div>
      )}
    </div>
  );
}
