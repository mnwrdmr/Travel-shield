"use client";

/**
 * @file LegalDisclaimer.tsx
 * @description Yasal sorumluluk reddi — accordion tasarım.
 *
 * Kapalı halde özet bir satır gösterir.
 * Açık halde tam yasal metin görüntülenir.
 * /dashboard footer'ında ve /analyze footer'ında kullanılır.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Sabit metinler (i18n hazırlığı için dışarıda) ───────────

const DISCLAIMER_PARAGRAPHS = [
  {
    id: "scope",
    text: (
      <>
        <strong className="font-semibold text-slate-400">Travel Shield AI</strong>{" "}
        tarafından sunulan analizler, havayolu şirketlerinin kamuya açık kural ve
        politikaları işlenerek üretilen{" "}
        <strong className="font-semibold text-slate-400">yapay zeka tahminleridir</strong>.
        Bağlayıcı resmi evrak niteliği taşımaz; hukuki veya ticari bir taahhüt
        içermez.
      </>
    ),
  },
  {
    id: "verify",
    text: (
      <>
        Seyahatiniz öncesinde ilgili havayolunun{" "}
        <strong className="font-semibold text-slate-400">resmi web sitesinden</strong>{" "}
        güncel bagaj kurallarını, bilet koşullarını ve ücret tarifelerini teyit
        etmeniz önerilir. Havayolu şirketleri kuralları önceden haber vermeksizin
        değiştirebilir.
      </>
    ),
  },
  {
    id: "liability",
    text: (
      <>
        Analizlerin eksik veya hatalı olması durumunda ortaya çıkabilecek
        operasyonel aksaklıklardan, kaçırılan uçuşlardan ya da finansal
        kayıplardan{" "}
        <strong className="font-semibold text-slate-400">
          platformumuz sorumlu tutulamaz
        </strong>
        . Bagaj boyut ölçümleri tahmini nitelikte olup yalnızca bilgilendirme
        amacıyla sunulmaktadır.
      </>
    ),
  },
] as const;

const SUMMARY_TEXT =
  "Analizler yapay zeka tahminidir — bağlayıcı değildir. Resmi kurallar için havayolunun web sitesini kontrol edin.";

const VERSION_LABEL = "Travel Shield AI v1.0 · Sprint Final";

// ─── Alt bileşenler ──────────────────────────────────────────

interface ToggleHeaderProps {
  expanded: boolean;
  onToggle: () => void;
}

function ToggleHeader({ expanded, onToggle }: ToggleHeaderProps) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between gap-3 px-5 py-4 text-left",
        "transition-colors hover:bg-slate-800/40"
      )}
    >
      <div className="flex items-center gap-2.5">
        <Scale size={15} className="shrink-0 text-slate-500" aria-hidden />
        <span className="text-xs font-semibold text-slate-400">
          ⚖️ Yasal Uyarı & Sorumluluk Reddi
        </span>
      </div>

      {expanded
        ? <ChevronUp   size={14} className="shrink-0 text-slate-500" aria-hidden />
        : <ChevronDown size={14} className="shrink-0 text-slate-500" aria-hidden />
      }
    </button>
  );
}

function ExpandedContent() {
  return (
    <div className="border-t border-slate-800 px-5 py-4 space-y-3">
      {DISCLAIMER_PARAGRAPHS.map(({ id, text }) => (
        <p key={id} className="text-xs leading-relaxed text-slate-500">
          {text}
        </p>
      ))}
      <p className="text-[10px] text-slate-600">{VERSION_LABEL}</p>
    </div>
  );
}

interface CollapsedSummaryProps {
  onExpand: () => void;
}

function CollapsedSummary({ onExpand }: CollapsedSummaryProps) {
  return (
    <p className="px-5 pb-4 text-[11px] leading-relaxed text-slate-600">
      {SUMMARY_TEXT}{" "}
      <button
        type="button"
        onClick={onExpand}
        className="text-slate-500 underline underline-offset-2 hover:text-slate-400"
      >
        Devamını oku
      </button>
    </p>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────

export default function LegalDisclaimer() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      aria-label="Yasal uyarı"
      className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
    >
      <ToggleHeader
        expanded={expanded}
        onToggle={() => setExpanded((prev) => !prev)}
      />

      {/* Açık içerik */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ExpandedContent />
      </div>

      {/* Kapalı özet */}
      {!expanded && (
        <CollapsedSummary onExpand={() => setExpanded(true)} />
      )}
    </aside>
  );
}
