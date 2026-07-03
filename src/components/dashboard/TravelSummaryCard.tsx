// ─────────────────────────────────────────────
// components/dashboard/TravelSummaryCard.tsx
// Shows PNR, route, operator, departure countdown.
// ─────────────────────────────────────────────
"use client";

import { Plane, Train, Bus, Clock, MapPin } from "lucide-react";
import { getOperatorMeta } from "@/lib/operator-meta";
import type { TravelSegment } from "@/types/travel";

interface TravelSummaryCardProps {
  segment: TravelSegment;
}

const MODE_ICON = {
  FLIGHT: Plane,
  TRAIN: Train,
  BUS: Bus,
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function hoursUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  const h = Math.floor(diff / 1000 / 60 / 60);
  const m = Math.floor((diff / 1000 / 60) % 60);
  if (diff < 0) return "Kalktı";
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function TravelSummaryCard({ segment }: TravelSummaryCardProps) {
  const meta = getOperatorMeta(segment.operator);
  const ModeIcon = MODE_ICON[segment.mode];
  const checkInUrgent =
    segment.checkInDeadline &&
    new Date(segment.checkInDeadline).getTime() - Date.now() < 1000 * 60 * 60 * 3;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Operator colour bar */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: meta.accentColor }}
      />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Operator badge */}
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: meta.bgColor }}
            >
              {meta.emoji}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                {meta.displayName}
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold text-slate-900">
                {segment.pnr}
              </p>
            </div>
          </div>

          {/* Countdown pill */}
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
              checkInUrgent
                ? "bg-red-50 text-red-600"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <Clock size={13} />
            {hoursUntil(segment.departureTime)}
          </div>
        </div>

        {/* Route */}
        <div className="mt-6 flex items-center gap-3">
          <div className="text-center">
            <p className="font-mono text-3xl font-black tracking-tight text-slate-900">
              {segment.origin}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatTime(segment.departureTime)}
            </p>
          </div>

          <div className="flex flex-1 items-center gap-2">
            <div className="h-px flex-1 bg-slate-200" />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: meta.bgColor, color: meta.accentColor }}
            >
              <ModeIcon size={15} />
            </div>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="text-center">
            <p className="font-mono text-3xl font-black tracking-tight text-slate-900">
              {segment.destination}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatTime(segment.arrivalTime)}
            </p>
          </div>
        </div>

        {/* Footer row */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {formatDate(segment.departureTime)}
          </span>
          {segment.validationRequired && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
              Validation required
            </span>
          )}
          {segment.checkInDeadline && (
            <span>
              Check-in kapanıyor · {formatTime(segment.checkInDeadline)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
