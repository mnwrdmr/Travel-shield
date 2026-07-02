// ─────────────────────────────────────────────
// components/dashboard/AlternativeTransportCard.tsx
// Shows AI-suggested cheaper/better alternatives.
// ─────────────────────────────────────────────

import { Plane, Train, Bus, ArrowRight, Tag } from "lucide-react";
import { getOperatorMeta } from "@/lib/operator-meta";
import type { AlternativeTransport } from "@/types/travel";

interface AlternativeTransportCardProps {
  alternatives: AlternativeTransport[];
}

const MODE_ICON = { FLIGHT: Plane, TRAIN: Train, BUS: Bus };

function formatShortTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AlternativeItem({ alt }: { alt: AlternativeTransport }) {
  const meta = getOperatorMeta(alt.operator);
  const ModeIcon = MODE_ICON[alt.mode];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 hover:border-slate-200 hover:bg-white transition-colors">
      {/* Operator */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: meta.bgColor }}
      >
        {meta.emoji}
      </div>

      {/* Route + time */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
          <span>{alt.origin}</span>
          <ArrowRight size={13} className="text-slate-400" />
          <span>{alt.destination}</span>
          <ModeIcon size={12} className="ml-1 text-slate-400" />
        </div>
        <p className="mt-0.5 text-xs text-slate-400">
          {meta.displayName} · {formatShortTime(alt.departureTime)}
        </p>
        {/* Tags */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {alt.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-500"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Price + savings */}
      <div className="shrink-0 text-right">
        <p className="font-mono text-lg font-black text-slate-900">
          €{alt.price}
        </p>
        <p className="text-xs font-semibold text-emerald-600">
          save €{alt.savings}
        </p>
        {alt.bookingUrl && (
          <a
            href={alt.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 block text-[11px] font-medium text-blue-500 underline underline-offset-2"
          >
            Book →
          </a>
        )}
      </div>
    </div>
  );
}

export function AlternativeTransportCard({
  alternatives,
}: AlternativeTransportCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Smarter Alternatives
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          AI found cheaper options for your route
        </p>
      </div>

      <div className="space-y-3 p-6">
        {alternatives.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            No alternatives found for this route.
          </p>
        ) : (
          alternatives.map((alt) => (
            <AlternativeItem key={alt.id} alt={alt} />
          ))
        )}
      </div>
    </div>
  );
}
