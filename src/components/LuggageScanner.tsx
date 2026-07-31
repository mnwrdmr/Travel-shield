"use client";

/**
 * @file LuggageScanner.tsx
 * @description FastAPI Vision AI ile entegre bagaj tarama bileşeni.
 *
 * Sorumluluklar:
 *  - Drag-and-drop / tıklama ile görsel yükleme
 *  - FastAPI /api/v1/scan-luggage endpoint'ine POST
 *  - Sonuç durumuna göre UI render (idle/loading/success/error/not_luggage)
 *
 * Dışarı çıkan bağımlılıklar:
 *  - NEXT_PUBLIC_BACKEND_URL env değişkeni
 *  - BackendScanResponse tipi
 */

import { useCallback, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ImagePlus,
  Loader2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { BackendScanResponse } from "@/types/travel";

// ─── Sabitler ────────────────────────────────────────────────

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const SCAN_ENDPOINT = `${BACKEND_URL}/api/v1/scan-luggage`;

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const STATUS_CONFIG = {
  PASS: {
    Icon:      CheckCircle,
    colorText: "text-emerald-400",
    colorBg:   "bg-emerald-500/5 border-emerald-500/20",
    label:     "✓ UYUMLU",
  },
  WARNING: {
    Icon:      AlertTriangle,
    colorText: "text-amber-400",
    colorBg:   "bg-amber-500/5 border-amber-500/20",
    label:     "⚡ UYARI",
  },
  FAIL: {
    Icon:      ShieldAlert,
    colorText: "text-red-400",
    colorBg:   "bg-red-500/5 border-red-500/20",
    label:     "⚠ BOYUT AŞIMI",
  },
} as const;

// ─── Tipler ──────────────────────────────────────────────────

type ScanStatus = "idle" | "loading" | "success" | "not_luggage" | "error";

interface LuggageScannerProps {
  operator?: string;
  onScanComplete?: (result: BackendScanResponse) => void;
}

// ─── Yardımcı fonksiyonlar ───────────────────────────────────

function isAllowedMimeType(type: string): boolean {
  return ALLOWED_MIME_TYPES.has(type);
}

// ─── Airline cabin limits for mock fallback ──────────────────

const CABIN_LIMITS_MOCK: Record<string, { w: number; h: number; d: number; fee: number }> = {
  RYANAIR:    { w: 40, h: 20, d: 25, fee: 70 },
  WIZZAIR:    { w: 40, h: 30, d: 20, fee: 80 },
  EASYJET:    { w: 56, h: 45, d: 25, fee: 48 },
  THY:        { w: 55, h: 23, d: 40, fee: 60 },
  PEGASUS:    { w: 55, h: 20, d: 40, fee: 50 },
  AJET:       { w: 55, h: 20, d: 40, fee: 50 },
  SUNEXPRESS: { w: 55, h: 20, d: 40, fee: 45 },
  CORENDON:   { w: 55, h: 20, d: 40, fee: 45 },
};

/** Generates a realistic mock scan result when backend is unavailable */
function generateMockScanResult(operator: string): BackendScanResponse {
  const limits = CABIN_LIMITS_MOCK[operator.toUpperCase()] ?? CABIN_LIMITS_MOCK.RYANAIR;
  // Simulated detected dimensions: slightly exceeding width & height
  const detected = {
    width_cm:  limits.w + 2,
    height_cm: limits.h + 2,
    depth_cm:  limits.d,
  };
  const allowed = {
    width_cm:  limits.w,
    height_cm: limits.h,
    depth_cm:  limits.d,
  };
  const overage = {
    width_cm:  2,
    height_cm: 2,
    depth_cm:  0,
  };
  return {
    is_luggage: true,
    message: `[Demo Modu] Bavul boyutları yaklaşık ${detected.width_cm}×${detected.height_cm}×${detected.depth_cm} cm olarak tespit edildi. ${operator} kabin limiti aşılıyor.`,
    status: "FAIL",
    detected_dimensions: detected,
    allowed_dimensions: allowed,
    overage_cm: overage,
    potential_gate_fee_eur: limits.fee,
    confidence_score: 0.87,
    recommendations: [
      `${operator} kabin bagaj limiti: ${limits.w}×${limits.h}×${limits.d} cm — bavulunuz genişlik ve yükseklikte 2 cm aşıyor.`,
      `Kapıda €${limits.fee} ceza riski var. Online kabin bagajı yükseltmesi ile €${Math.max(limits.fee - 18, 0)} tasarruf edebilirsiniz.`,
      "⚠ Demo Modu: AI sunucu şu anda meşgul, sonuçlar simülasyon verileridir.",
    ],
  };
}

async function postImageToBackend(
  file: File,
  operator: string
): Promise<BackendScanResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("operator", operator);

  try {
    const response = await fetch(SCAN_ENDPOINT, {
      method: "POST",
      body:   formData,
      signal: AbortSignal.timeout(15_000), // 15s timeout
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ detail: "Sunucu hatası" }));
      // If backend returned quota/rate-limit error, fall back to mock
      const detail = errorBody?.detail ?? "";
      if (response.status === 429 || String(detail).includes("quota") || String(detail).includes("RESOURCE_EXHAUSTED")) {
        console.warn("Backend AI kota aşımı — demo moduna geçiliyor");
        return generateMockScanResult(operator);
      }
      throw new Error(errorBody.detail ?? `HTTP ${response.status}`);
    }

    return response.json() as Promise<BackendScanResponse>;
  } catch (err) {
    // Network error / timeout / backend not running → fall back to mock
    if (err instanceof Error && err.message.includes("HTTP")) {
      throw err; // re-throw explicit HTTP errors that aren't quota related
    }
    console.warn("Backend erişilemedi — demo moduna geçiliyor:", err);
    return generateMockScanResult(operator);
  }
}

// ─── Alt bileşenler ──────────────────────────────────────────

interface DropZoneProps {
  preview:   string | null;
  isLoading: boolean;
  dragOver:  boolean;
  onClick:   () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop:    (e: React.DragEvent) => void;
}

function DropZone({
  preview, isLoading, dragOver,
  onClick, onDragOver, onDragLeave, onDrop,
}: DropZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Bagaj fotoğrafı yükle"
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={[
        "relative flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3",
        "rounded-2xl border-2 border-dashed transition-all duration-200",
        dragOver
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
          : "border-white/15 bg-white/[0.03] hover:border-white/25 hover:bg-white/5",
      ].join(" ")}
    >
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Yüklenen bagaj önizlemesi"
          className="max-h-40 w-auto rounded-xl object-contain opacity-90"
        />
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <ImagePlus size={26} className="text-zinc-400" aria-hidden />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-200">
              Bagaj fotoğrafını sürükle veya tıkla
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              JPG · PNG · WEBP · Maks 10 MB
            </p>
          </div>
        </>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/60 backdrop-blur-sm">
          <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" aria-hidden />
          <p className="text-xs font-mono text-zinc-300">
            Vision AI bagajı analiz ediyor…
          </p>
        </div>
      )}
    </div>
  );
}

interface AlertBannerProps {
  variant: "warning" | "error";
  title:   string;
  message: string;
}

function AlertBanner({ variant, title, message }: AlertBannerProps) {
  const styles = {
    warning: {
      wrapper: "border-amber-500/25 bg-amber-500/5",
      icon:    "text-amber-400",
      titleColor: "text-amber-300",
      textColor:  "text-amber-400/80",
    },
    error: {
      wrapper: "border-red-500/25 bg-red-500/5",
      icon:    "text-red-400",
      titleColor: "text-red-300",
      textColor:  "text-red-400/80",
    },
  }[variant];

  const Icon = variant === "warning" ? AlertTriangle : XCircle;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 ${styles.wrapper}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${styles.icon}`} aria-hidden />
      <div>
        <p className={`text-sm font-semibold ${styles.titleColor}`}>{title}</p>
        <p className={`mt-1 text-xs ${styles.textColor}`}>{message}</p>
      </div>
    </div>
  );
}

interface DimensionBarProps {
  label:    string;
  detected: number;
  allowed:  number;
}

function DimensionBar({ label, detected, allowed }: DimensionBarProps) {
  const exceeded = detected > allowed;
  const fillPct  = Math.min(Math.round((detected / allowed) * 100), 100);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-400">{label}</span>
        <span className={`font-mono font-bold ${exceeded ? "text-red-400" : "text-emerald-400"}`}>
          {detected} cm
          {exceeded && (
            <span className="ml-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[10px]">
              +{(detected - allowed).toFixed(0)} cm
            </span>
          )}
          <span className="ml-1 font-normal text-zinc-600">/ {allowed} cm</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${exceeded ? "bg-red-500" : "bg-emerald-500"}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  );
}

interface CompatibilityCardProps {
  result:   BackendScanResponse;
  operator: string;
}

function CompatibilityCard({ result, operator }: CompatibilityCardProps) {
  const statusKey = (result.status ?? "PASS") as keyof typeof STATUS_CONFIG;
  const cfg       = STATUS_CONFIG[statusKey];
  const StatusIcon = cfg.Icon;

  const isFail   = result.status === "FAIL";
  const det      = result.detected_dimensions;
  const lim      = result.allowed_dimensions;
  const savings  = (result.potential_gate_fee_eur ?? 0) - 18;

  return (
    <div className={`space-y-4 rounded-2xl border p-5 ${cfg.colorBg}`}>
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon size={18} className={cfg.colorText} aria-hidden />
          <span className="text-sm font-bold text-zinc-100">
            Bagaj Uyumluluk Analizi
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${cfg.colorBg} ${cfg.colorText}`}>
            {cfg.label}
          </span>
          {result.confidence_score !== null && (
            <span className="text-[10px] text-zinc-500">
              %{Math.round((result.confidence_score ?? 0) * 100)} güven
            </span>
          )}
        </div>
      </div>

      {/* Ceza / tasarruf — sadece FAIL durumunda */}
      {isFail && (result.potential_gate_fee_eur ?? 0) > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-3 text-center">
            <p className="font-mono text-2xl font-black text-red-400">
              €{result.potential_gate_fee_eur}
            </p>
            <p className="mt-1 text-[10px] font-medium text-red-600">Kapıda Olası Ceza</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-3 text-center">
            <p className="font-mono text-2xl font-black text-emerald-400">
              €{savings}
            </p>
            <p className="mt-1 text-[10px] font-medium text-emerald-600">Beklenen Tasarruf</p>
          </div>
        </div>
      )}

      {/* Boyut kıyaslama */}
      {det && lim && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Boyut Kıyaslaması — {operator}
          </p>
          <DimensionBar label="Genişlik"  detected={det.width_cm}  allowed={lim.width_cm}  />
          <DimensionBar label="Yükseklik" detected={det.height_cm} allowed={lim.height_cm} />
          <DimensionBar label="Derinlik"  detected={det.depth_cm}  allowed={lim.depth_cm}  />
        </div>
      )}

      {/* Öneriler */}
      {(result.recommendations ?? []).length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-3 space-y-1.5">
          {result.recommendations!.map((rec, i) => (
            <p key={i} className="flex items-start gap-2 text-xs leading-relaxed text-zinc-400">
              <span className="mt-0.5 shrink-0 text-amber-500" aria-hidden>→</span>
              {rec}
            </p>
          ))}
        </div>
      )}

      {/* CTA */}
      {isFail && (
        <button
          type="button"
          className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-95"
        >
          🛒 €18'e Online Kabin Bagajı Ekle
        </button>
      )}
    </div>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────

export default function LuggageScanner({
  operator = "RYANAIR",
  onScanComplete,
}: LuggageScannerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview,    setPreview]   = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("idle");
  const [result,     setResult]    = useState<BackendScanResponse | null>(null);
  const [dragOver,   setDragOver]  = useState(false);
  const [errorMsg,   setErrorMsg]  = useState<string | null>(null);

  const reset = () => {
    setScanStatus("idle");
    setPreview(null);
    setResult(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const processFile = useCallback(
    async (file: File) => {
      if (!isAllowedMimeType(file.type)) {
        setErrorMsg("Lütfen JPG, PNG veya WEBP formatında bir görsel yükleyin.");
        setScanStatus("error");
        return;
      }

      setPreview(URL.createObjectURL(file));
      setScanStatus("loading");
      setResult(null);
      setErrorMsg(null);

      try {
        const data = await postImageToBackend(file, operator);
        setResult(data);
        setScanStatus(data.is_luggage ? "success" : "not_luggage");
        onScanComplete?.(data);
      } catch (err) {
        const message = err instanceof Error
          ? err.message
          : "Bağlantı hatası — backend çalışıyor mu?";
        setErrorMsg(message);
        setScanStatus("error");
      }
    },
    [operator, onScanComplete]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full space-y-4">
      <DropZone
        preview={preview}
        isLoading={scanStatus === "loading"}
        dragOver={dragOver}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Bagaj görseli dosya seçici"
      />

      {/* Durum panelleri */}
      {scanStatus === "not_luggage" && (
        <AlertBanner
          variant="warning"
          title="Bagaj tespit edilemedi"
          message={result?.message ?? "Lütfen el bagajınızın net bir fotoğrafını yükleyin."}
        />
      )}

      {scanStatus === "error" && (
        <AlertBanner
          variant="error"
          title="Analiz başarısız"
          message={errorMsg ?? "Bilinmeyen bir hata oluştu."}
        />
      )}

      {scanStatus === "success" && result?.is_luggage && (
        <CompatibilityCard result={result} operator={operator} />
      )}

      {scanStatus !== "idle" && scanStatus !== "loading" && (
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/8 hover:text-zinc-200"
        >
          Yeni görsel yükle
        </button>
      )}
    </div>
  );
}
