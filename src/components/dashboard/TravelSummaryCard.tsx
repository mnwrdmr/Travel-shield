"use client";
// ─────────────────────────────────────────────────────────────
// src/components/dashboard/TravelSummaryCard.tsx
// SPRINT 2: Dark tema. Props API değişmedi ✅
// ─────────────────────────────────────────────────────────────

import { Plane, Train, Bus, Clock, MapPin } from "lucide-react";
import { getOperatorMeta } from "@/lib/operator-meta";
import type { TravelSegment } from "@/types/travel";

interface TravelSummaryCardProps {
  segment: TravelSegment;
}

const MODE_ICON = { FLIGHT: Plane, TRAIN: Train, BUS: Bus };

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "long" });
}
function hoursUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff < 0) return "Kalktı";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h === 0 ? `${m}dk` : `${h}s ${m}dk`;
}

export function TravelSummaryCard({ segment }: TravelSummaryCardProps) {
  const meta = getOperatorMeta(segment.operator);
  const ModeIcon = MODE_ICON[segment.mode];
  const checkInUrgent =
    segment.checkInDeadline &&
    new Date(segment.checkInDeadline).getTime() - Date.now() < 3_600_000 * 3;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      {/* Operator colour bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: meta.accentColor }} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: `${meta.accentColor}22` }}
            >
              {meta.emoji}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                {meta.displayName}
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold text-white">
                {segment.pnr}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
              checkInUrgent
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            <Clock size={13} />
            {hoursUntil(segment.departureTime)}
          </div>
        </div>

        {/* Route */}
        <div className="mt-6 flex items-center gap-3">
          <div className="text-center">
            <p className="font-mono text-3xl font-black tracking-tight text-white">
              {segment.origin}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{formatTime(segment.departureTime)}</p>
          </div>

          <div className="flex flex-1 items-center gap-2">
            <div className="h-px flex-1 bg-slate-700" />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: `${meta.accentColor}22`, color: meta.accentColor }}
            >
              <ModeIcon size={15} />
            </div>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <div className="text-center">
            <p className="font-mono text-3xl font-black tracking-tight text-white">
              {segment.destination}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">{formatTime(segment.arrivalTime)}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {formatDate(segment.departureTime)}
          </span>
          {segment.validationRequired && (
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 font-medium text-amber-400">
              Doğrulama gerekli
            </span>
          )}
          {segment.checkInDeadline && (
            <span>Check-in kapanıyor · {formatTime(segment.checkInDeadline)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
