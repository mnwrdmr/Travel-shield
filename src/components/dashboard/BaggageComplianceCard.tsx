"use client";
// ─────────────────────────────────────────────────────────────
// src/components/dashboard/BaggageComplianceCard.tsx
// SPRINT 3 — Person M yeni bileşen
//
// Props: { baggage: BaggageAnalysis }
// Görev: Tespit edilen boyutları limit ile kıyaslar,
//        kapı cezası uyarısı ve AI çözüm önerilerini gösterir.
// ─────────────────────────────────────────────────────────────

import { AlertTriangle, CheckCircle, ShoppingCart, Minimize2, Zap } from "lucide-react";
import type { BaggageAnalysis } from "@/types/travel";

interface BaggageComplianceCardProps {
  baggage: BaggageAnalysis;
}

// ── Boyut kıyaslama bar satırı ───────────────────────────────
interface DimRowProps {
  label: string;
  detected: number;
  allowed: number;
}

function DimRow({ label, detected, allowed }: DimRowProps) {
  const exceeded = detected > allowed;
  const pct = Math.min(Math.round((detected / allowed) * 100), 120);
  const fillPct = Math.min(pct, 100);
  const overflowPct = pct > 100 ? pct - 100 : 0;

  return (
    <div className="mb-4">
      {/* Etiket + değerler */}
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold ${exceeded ? "text-red-400" : "text-emerald-400"}`}>
            {detected} cm
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-mono text-slate-500">Limit {allowed} cm</span>
          {exceeded && (
            <span className="rounded-full bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
              +{detected - allowed} cm
            </span>
          )}
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
        {/* Normal dolgu */}
        <div
          className={`absolute left-0 top-0 h-full rounded-l-full transition-all ${
            exceeded ? "bg-red-500" : "bg-emerald-500"
          }`}
          style={{ width: `${fillPct}%` }}
        />
        {/* Limit aşım kısmı */}
        {overflowPct > 0 && (
          <div
            className="absolute top-0 h-full animate-pulse rounded-r-full bg-red-300"
            style={{ left: "100%", width: `${overflowPct}%`, transform: "translateX(-100%)" }}
          />
        )}
        {/* Limit çizgisi */}
        <div className="absolute right-0 top-0 h-full w-px bg-slate-500 opacity-60" />
      </div>
    </div>
  );
}

// ── Ana kart ─────────────────────────────────────────────────
export function BaggageComplianceCard({ baggage }: BaggageComplianceCardProps) {
  const isOversized = baggage.status === "OVERSIZED" || baggage.status === "EXCEEDED";
  const savings = baggage.potentialGateFee - 18; // €70 - €18 = €52

  return (
    <div
      className={`rounded-2xl border shadow-xl overflow-hidden ${
        isOversized
          ? "border-red-500/30 bg-slate-900"
          : "border-emerald-500/20 bg-slate-900"
      }`}
    >
      {/* Üst renkli şerit */}
      <div
        className={`h-1 w-full ${
          isOversized
            ? "bg-gradient-to-r from-red-600 via-orange-500 to-red-600"
            : "bg-gradient-to-r from-emerald-600 to-emerald-400"
        }`}
      />

      {/* Kart başlığı */}
      <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          {isOversized ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle size={18} className="text-emerald-400" />
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-white">Bagaj Uyumluluk Analizi</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              AI Güven Skoru:{" "}
              <span className="font-semibold text-slate-300">%{baggage.confidenceScore}</span>
            </p>
          </div>
        </div>

        {/* Durum rozeti */}
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold border ${
            baggage.status === "OVERSIZED"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : baggage.status === "WARNING"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}
        >
          {baggage.status === "OVERSIZED"
            ? "⚠ BOYUT AŞIMI"
            : baggage.status === "WARNING"
            ? "⚡ UYARI"
            : "✓ UYUMLU"}
        </span>
      </div>

      <div className="p-6">
        {/* Ceza + Tasarruf kutuları */}
        {isOversized && (
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-center">
              <p className="font-mono text-2xl font-black text-red-400">
                €{baggage.potentialGateFee}
              </p>
              <p className="mt-1 text-[11px] font-medium text-red-600">Kapıda Olası Ceza</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-center">
              <p className="font-mono text-2xl font-black text-emerald-400">€{savings}</p>
              <p className="mt-1 text-[11px] font-medium text-emerald-600">Beklenen Tasarruf</p>
            </div>
          </div>
        )}

        {/* 3D Boyut Kıyaslama Barları */}
        <div className="mb-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Boyut Kıyaslaması
          </p>
          <DimRow
            label="Genişlik"
            detected={baggage.detectedDimensions.widthCm}
            allowed={baggage.allowedDimensions.widthCm}
          />
          <DimRow
            label="Yükseklik"
            detected={baggage.detectedDimensions.heightCm}
            allowed={baggage.allowedDimensions.heightCm}
          />
          <DimRow
            label="Derinlik"
            detected={baggage.detectedDimensions.depthCm}
            allowed={baggage.allowedDimensions.depthCm}
          />
        </div>

        {/* AI Önerileri */}
        {baggage.recommendations.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-800/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Zap size={13} className="text-amber-400" />
              <p className="text-xs font-semibold text-slate-300">AI Önerileri</p>
            </div>
            <ul className="space-y-2">
              {baggage.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                  <span className="mt-0.5 shrink-0 text-amber-500">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Aksiyon Butonları */}
        {isOversized && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-95">
              <ShoppingCart size={15} />
              €18'e Online Bagaj Ekle
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700 active:scale-95">
              <Minimize2 size={15} />
              Sıkıştırma İpuçları
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
