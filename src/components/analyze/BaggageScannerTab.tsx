"use client";

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

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, ScanSearch, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BaggageDimensions, Operator } from "@/types/travel";

// Rozet renklendirmesi için görsel limitler (motor: TravelContext ile aynı)
const DISPLAY_LIMITS: Partial<Record<Operator, BaggageDimensions>> = {
  RYANAIR: { widthCm: 40, heightCm: 20, depthCm: 25 },
  WIZZAIR: { widthCm: 40, heightCm: 30, depthCm: 20 },
  EASYJET: { widthCm: 56, heightCm: 45, depthCm: 25 },
};
const FALLBACK_LIMIT: BaggageDimensions = { widthCm: 40, heightCm: 20, depthCm: 25 };

// Hero senaryosu varsayılanı: 42×22×25 (Ryanair limiti 40×20×25 → +2 cm aşım)
const DEFAULT_DIMS: BaggageDimensions = { widthCm: 42, heightCm: 22, depthCm: 25 };

type SliderKey = keyof BaggageDimensions;

const SLIDERS: { key: SliderKey; label: string; min: number; max: number }[] = [
  { key: "widthCm", label: "Genişlik", min: 20, max: 80 },
  { key: "heightCm", label: "Yükseklik", min: 10, max: 60 },
  { key: "depthCm", label: "Derinlik", min: 10, max: 50 },
];

function DimBadge({
  label,
  value,
  limit,
}: {
  label: string;
  value: number;
  limit: number;
}) {
  const over = value > limit;
  return (
    <span
      className={`pointer-events-none rounded-md px-2 py-1 font-mono text-[10px] font-semibold shadow-lg ring-1 ${
        over
          ? "bg-red-500/90 text-white ring-red-300/50"
          : "bg-emerald-500/90 text-white ring-emerald-300/50"
      }`}
    >
      {label}: {value} cm{" "}
      <span className="font-normal opacity-80">(Limit {limit})</span>
    </span>
  );
}

export function BaggageScannerTab({
  operator,
  onOperatorChange,
  analyzing,
  onAnalyze,
}: {
  operator: Operator;
  onOperatorChange: (op: Operator) => void;
  analyzing: boolean;
  onAnalyze: (dimensions: BaggageDimensions, imageUrl?: string) => void;
}) {
  const [dims, setDims] = useState<BaggageDimensions>(DEFAULT_DIMS);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const limit = DISPLAY_LIMITS[operator] ?? FALLBACK_LIMIT;
  const anyOver =
    dims.widthCm > limit.widthCm ||
    dims.heightCm > limit.heightCm ||
    dims.depthCm > limit.depthCm;

  // ── dosya / sürükle-bırak ──────────────────
  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  }, []);

  // ── kamera ─────────────────────────────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  useEffect(() => stopCamera, [stopCamera]); // unmount temizliği

  async function startCamera() {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setCameraOn(true);
      // video elementi render edildikten sonra bağla
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setCameraError(
        "Kameraya erişilemedi. Tarayıcı izinlerini kontrol edin veya fotoğraf yükleyin."
      );
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setImageUrl(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  }

  return (
    <div className="space-y-6">
      {/* taşıyıcı seçimi (limit kıyası için) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
          Havayolu limiti
        </span>
        <div
          role="radiogroup"
          aria-label="Havayolu"
          className="grid auto-cols-fr grid-flow-col rounded-lg border border-white/10 bg-white/5 p-0.5"
        >
          {(["RYANAIR", "WIZZAIR", "EASYJET"] as const).map((op) => (
            <button
              key={op}
              type="button"
              role="radio"
              aria-checked={operator === op}
              onClick={() => onOperatorChange(op)}
              className={`rounded-md px-3 py-1.5 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                operator === op
                  ? "bg-[var(--color-primary)]/20 font-medium text-zinc-100 ring-1 ring-[var(--color-primary)]/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {op === "RYANAIR" ? "Ryanair" : op === "WIZZAIR" ? "Wizz Air" : "EasyJet"}
            </button>
          ))}
        </div>
      </div>

      {/* görüntü alanı: yükleme kutusu / kamera / AR önizleme */}
      {cameraOn ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
          { }
          <video ref={videoRef} playsInline muted className="max-h-72 w-full object-contain" />
          <div className="flex items-center justify-center gap-3 p-3">
            <Button size="sm" onClick={capturePhoto}>
              <Camera size={14} className="mr-1.5" /> Fotoğrafı Çek
            </Button>
            <Button size="sm" variant="outline" onClick={stopCamera}>
              Vazgeç
            </Button>
          </div>
        </div>
      ) : imageUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Yüklenen bavul önizlemesi"
            className="mx-auto max-h-72 w-auto object-contain"
          />

          {/* AR 3D çerçeve + kenar rozetleri */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <rect
              x="18" y="14" width="64" height="72" fill="none"
              stroke={anyOver ? "#ef4444" : "#10b981"}
              strokeWidth="0.7" strokeDasharray="4 2" opacity="0.9"
            />
            {/* köşe işaretleri */}
            {[
              [18, 14], [82, 14], [18, 86], [82, 86],
            ].map(([x, y], i) => (
              <g key={i} stroke={anyOver ? "#ef4444" : "#10b981"} strokeWidth="1.6">
                <line x1={x} y1={y} x2={x + (x < 50 ? 6 : -6)} y2={y} />
                <line x1={x} y1={y} x2={x} y2={y + (y < 50 ? 6 : -6)} />
              </g>
            ))}
            {/* derinlik hissi için ikinci çerçeve */}
            <rect
              x="24" y="20" width="64" height="72" fill="none"
              stroke={anyOver ? "#ef4444" : "#10b981"}
              strokeWidth="0.35" opacity="0.35"
            />
          </svg>

          {/* rozetler */}
          <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center">
            <DimBadge label="En" value={dims.widthCm} limit={limit.widthCm} />
          </div>
          <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 -rotate-90">
            <DimBadge label="Boy" value={dims.heightCm} limit={limit.heightCm} />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <DimBadge label="Derinlik" value={dims.depthCm} limit={limit.depthCm} />
          </div>

          <button
            type="button"
            onClick={() => setImageUrl(null)}
            aria-label="Fotoğrafı kaldır"
            className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-zinc-300 transition-colors hover:text-white"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) readFile(f);
          }}
          className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : "border-white/15 bg-white/[0.03]"
          }`}
        >
          <Upload size={22} className="text-zinc-500" aria-hidden />
          <p className="text-sm text-zinc-300">
            Bavul fotoğrafını buraya sürükle
          </p>
          <p className="text-xs text-zinc-500">veya</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} className="mr-1.5" /> Dosya seç
            </Button>
            <Button size="sm" variant="outline" onClick={startCamera}>
              <Camera size={14} className="mr-1.5" /> Kamerayı aç
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
              e.target.value = "";
            }}
          />
          {cameraError && (
            <p className="mt-1 max-w-xs text-xs text-amber-400">{cameraError}</p>
          )}
        </div>
      )}

      {/* boyut sliderları */}
      <div className="space-y-4">
        {SLIDERS.map(({ key, label, min, max }) => {
          const over = dims[key] > limit[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-baseline justify-between">
                <label
                  htmlFor={`slider-${key}`}
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400"
                >
                  {label}
                </label>
                <span
                  className={`font-mono text-xs font-semibold ${
                    over ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {dims[key]} cm{" "}
                  <span className="font-normal text-zinc-500">
                    / limit {limit[key]}
                  </span>
                </span>
              </div>
              <input
                id={`slider-${key}`}
                type="range"
                min={min}
                max={max}
                value={dims[key]}
                onChange={(e) =>
                  setDims((d) => ({ ...d, [key]: Number(e.target.value) }))
                }
                className="w-full accent-[var(--color-primary)]"
              />
            </div>
          );
        })}
      </div>

      {/* özet + analiz butonu */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="font-mono text-xs text-zinc-400">
          {dims.widthCm}×{dims.heightCm}×{dims.depthCm} cm ·{" "}
          <span className={anyOver ? "text-red-400" : "text-emerald-400"}>
            {anyOver ? "limit aşımı görünüyor" : "limit içinde görünüyor"}
          </span>
        </p>
        <Button
          size="lg"
          disabled={analyzing}
          onClick={() => onAnalyze(dims, imageUrl ?? undefined)}
        >
          <ScanSearch size={16} className="mr-2" aria-hidden />
          Yapay Zeka Bagaj Analizini Başlat
        </Button>
      </div>
    </div>
  );
}
