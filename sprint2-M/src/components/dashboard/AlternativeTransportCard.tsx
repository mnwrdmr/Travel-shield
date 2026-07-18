"use client";
// ─────────────────────────────────────────────────────────────
// src/components/dashboard/AlternativeTransportCard.tsx
// SPRINT 2: Dark tema. Props API değişmedi ✅
// ─────────────────────────────────────────────────────────────

import { Plane, Train, Bus, ArrowRight, Tag } from "lucide-react";
import { getOperatorMeta } from "@/lib/operator-meta";
import type { AlternativeTransport } from "@/types/travel";

interface AlternativeTransportCardProps {
  alternatives: AlternativeTransport[];
}

const MODE_ICON = { FLIGHT: Plane, TRAIN: Train, BUS: Bus };

function formatShortTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function AlternativeItem({ alt }: { alt: AlternativeTransport }) {
  const meta = getOperatorMeta(alt.operator);
  const ModeIcon = MODE_ICON[alt.mode];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-800/50 p-4 hover:border-slate-700 hover:bg-slate-800 transition-colors">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
        style={{ backgroundColor: `${meta.accentColor}22` }}
      >
        {meta.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
          <span>{alt.origin}</span>
          <ArrowRight size={13} className="text-slate-500" />
          <span>{alt.destination}</span>
          <ModeIcon size={12} className="ml-1 text-slate-500" />
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {meta.displayName} · {formatShortTime(alt.departureTime)}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {alt.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 rounded-full bg-slate-900 border border-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400"
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-mono text-lg font-black text-white">€{alt.price}</p>
        <p className="text-xs font-semibold text-emerald-400">€{alt.savings} tasarruf</p>
        {alt.bookingUrl && (
          <a
            href={alt.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 block text-[11px] font-medium text-emerald-500 underline underline-offset-2"
          >
            Rezervasyon →
          </a>
        )}
      </div>
    </div>
  );
}

export function AlternativeTransportCard({ alternatives }: AlternativeTransportCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
      <div className="border-b border-slate-800 px-6 py-4">
        <h2 className="text-sm font-semibold text-white">Daha Akıllı Alternatifler</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Yapay zeka rotanız için daha uygun seçenekler buldu
        </p>
      </div>

      <div className="space-y-3 p-6">
        {alternatives.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">
            Bu rota için alternatif bulunamadı.
          </p>
        ) : (
          alternatives.map((alt) => <AlternativeItem key={alt.id} alt={alt} />)
        )}
      </div>
    </div>
  );
}
