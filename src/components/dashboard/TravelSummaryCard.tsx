"use client";

/**
 * @file TravelSummaryCard.tsx
 * @description Seyahat özet kartı — PNR, operatör, rota, check-in sayacı.
 *
 * İkon kuralı:
 *  - Operatör rozeti (sol üst)  → operator-meta'dan gelen emoji
 *  - Rota ortasındaki mod ikonu → segment.mode'a göre Lucide ikonu
 *    FLIGHT → <Plane />  |  TRAIN → <TrainFront />  |  BUS → <Bus />
 *
 * Props API Sprint 2'den bu yana değişmedi.
 */

import { Bus, Clock, MapPin, Plane, TrainFront } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getOperatorMeta } from "@/lib/operator-meta";
import type { TravelSegment, TransportMode } from "@/types/travel";

// ─── Sabitler ────────────────────────────────────────────────

const MODE_ICON: Record<TransportMode, LucideIcon> = {
  FLIGHT: Plane,
  TRAIN:  TrainFront,
  BUS:    Bus,
};

const URGENT_THRESHOLD_MS = 3 * 60 * 60 * 1000; // 3 saat

// ─── Yardımcı fonksiyonlar ───────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    weekday: "short",
    day:     "numeric",
    month:   "long",
  });
}

function formatCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "Kalktı";

  const hours   = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  return hours === 0 ? `${minutes}dk` : `${hours}s ${minutes}dk`;
}

function isUrgentCheckIn(deadline?: string): boolean {
  if (!deadline) return false;
  return new Date(deadline).getTime() - Date.now() < URGENT_THRESHOLD_MS;
}

// ─── Alt bileşenler ──────────────────────────────────────────

interface OperatorBadgeProps {
  emoji:       string;
  bgColor:     string;
  accentColor: string;
}

function OperatorBadge({ emoji, bgColor, accentColor }: OperatorBadgeProps) {
  return (
    <div
      aria-hidden
      style={{ backgroundColor: bgColor, borderColor: `${accentColor}30` }}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl"
    >
      {emoji}
    </div>
  );
}

interface CountdownPillProps {
  departureTime: string;
  urgent:        boolean;
}

function CountdownPill({ departureTime, urgent }: CountdownPillProps) {
  return (
    <div
      className={[
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
        urgent
          ? "border border-red-500/20 bg-red-500/10 text-red-400"
          : "bg-slate-800 text-slate-300",
      ].join(" ")}
    >
      <Clock size={13} aria-hidden />
      {formatCountdown(departureTime)}
    </div>
  );
}

interface RouteDisplayProps {
  origin:        string;
  destination:   string;
  departureTime: string;
  arrivalTime:   string;
  mode:          TransportMode;
  accentColor:   string;
  bgColor:       string;
}

function RouteDisplay({
  origin, destination,
  departureTime, arrivalTime,
  mode, accentColor, bgColor,
}: RouteDisplayProps) {
  // FIX: mode'a göre doğru Lucide ikonu seçilir
  const ModeIcon = MODE_ICON[mode];

  return (
    <div className="mt-6 flex items-center gap-3">
      {/* Kalkış */}
      <div className="text-center">
        <p className="font-mono text-3xl font-black tracking-tight text-white">
          {origin}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{formatTime(departureTime)}</p>
      </div>

      {/* Çizgi + mod ikonu */}
      <div className="flex flex-1 items-center gap-2">
        <div className="h-px flex-1 bg-slate-700" />
        <div
          style={{ backgroundColor: bgColor, color: accentColor }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          aria-label={mode === "FLIGHT" ? "Uçuş" : mode === "TRAIN" ? "Tren" : "Otobüs"}
        >
          {/* ✈️ FLIGHT · 🚂 TRAIN · 🚌 BUS */}
          <ModeIcon size={15} aria-hidden />
        </div>
        <div className="h-px flex-1 bg-slate-700" />
      </div>

      {/* Varış */}
      <div className="text-center">
        <p className="font-mono text-3xl font-black tracking-tight text-white">
          {destination}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">{formatTime(arrivalTime)}</p>
      </div>
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────

interface TravelSummaryCardProps {
  segment: TravelSegment;
}

// ─── Ana bileşen ─────────────────────────────────────────────

export function TravelSummaryCard({ segment }: TravelSummaryCardProps) {
  const meta   = getOperatorMeta(segment.operator);
  const urgent = isUrgentCheckIn(segment.checkInDeadline);

  return (
    <article
      aria-label={`${meta.displayName} — ${segment.origin} → ${segment.destination}`}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl"
    >
      {/* Üst renk şeridi */}
      <div
        aria-hidden
        className="h-1.5 w-full"
        style={{ backgroundColor: meta.accentColor }}
      />

      <div className="p-6">
        {/* ── Operatör + Sayaç ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* FIX: emoji her zaman operator-meta'dan geliyor */}
            <OperatorBadge
              emoji={meta.emoji}
              bgColor={meta.bgColor}
              accentColor={meta.accentColor}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                {meta.displayName}
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold text-white">
                {segment.pnr}
              </p>
            </div>
          </div>

          <CountdownPill
            departureTime={segment.departureTime}
            urgent={urgent}
          />
        </div>

        {/* ── Rota — mod ikonu burada ── */}
        <RouteDisplay
          origin={segment.origin}
          destination={segment.destination}
          departureTime={segment.departureTime}
          arrivalTime={segment.arrivalTime}
          mode={segment.mode}
          accentColor={meta.accentColor}
          bgColor={meta.bgColor}
        />

        {/* ── Footer ── */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={12} aria-hidden />
            {formatDate(segment.departureTime)}
          </span>

          {segment.validationRequired && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 font-medium text-amber-400">
              Doğrulama gerekli
            </span>
          )}

          {segment.checkInDeadline && (
            <span>
              Check-in kapanıyor · {formatTime(segment.checkInDeadline)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
