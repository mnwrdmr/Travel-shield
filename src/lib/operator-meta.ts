/**
 * @file operator-meta.ts
 * @description Havayolu / taşıyıcı görsel metadata haritası.
 *
 * Emoji kuralı:
 *  ✈️  → Uçuş operatörleri (tüm havayolları)
 *  🚂  → Tren operatörleri
 *  🚌  → Otobüs operatörleri
 */

import type { Operator } from "@/types/travel";

export interface OperatorMeta {
  displayName:  string;
  accentColor:  string;
  bgColor:      string;
  /** Mod bazlı ikon: ✈️ uçak · 🚂 tren · 🚌 otobüs */
  emoji:        string;
}

// ─── Metadata haritası ────────────────────────────────────────

export const OPERATOR_META: Record<Operator, OperatorMeta> = {
  // ── Türk havayolları ─────────────────────────────────────────
  THY:        { displayName: "Turkish Airlines",  accentColor: "#E31E24", bgColor: "rgba(227,30,36,.15)",  emoji: "✈️" },
  PEGASUS:    { displayName: "Pegasus Airlines",  accentColor: "#F7A823", bgColor: "rgba(247,168,35,.15)", emoji: "✈️" },
  AJET:       { displayName: "AJet",              accentColor: "#E85D04", bgColor: "rgba(232,93,4,.15)",   emoji: "✈️" },
  SUNEXPRESS: { displayName: "SunExpress",        accentColor: "#F7941D", bgColor: "rgba(247,148,29,.15)", emoji: "✈️" },
  CORENDON:   { displayName: "Corendon Airlines", accentColor: "#003087", bgColor: "rgba(0,48,135,.15)",   emoji: "✈️" },

  // ── Avrupa LCC ───────────────────────────────────────────────
  RYANAIR:    { displayName: "Ryanair",           accentColor: "#003580", bgColor: "rgba(0,53,128,.15)",   emoji: "✈️" },
  WIZZAIR:    { displayName: "Wizz Air",          accentColor: "#C6007E", bgColor: "rgba(198,0,126,.15)",  emoji: "✈️" },
  EASYJET:    { displayName: "easyJet",           accentColor: "#FF6600", bgColor: "rgba(255,102,0,.15)",  emoji: "✈️" },

  // ── Tren operatörleri ────────────────────────────────────────
  TRENITALIA: { displayName: "Trenitalia",        accentColor: "#009246", bgColor: "rgba(0,146,70,.15)",   emoji: "🚂" },
  SNCF:       { displayName: "SNCF",              accentColor: "#C0392B", bgColor: "rgba(192,57,43,.15)",  emoji: "🚂" },
  DB:         { displayName: "Deutsche Bahn",     accentColor: "#E30613", bgColor: "rgba(227,6,19,.15)",   emoji: "🚂" },
  OBB:        { displayName: "ÖBB",              accentColor: "#E31838", bgColor: "rgba(227,24,56,.15)",   emoji: "🚂" },

  // ── Otobüs operatörleri ──────────────────────────────────────
  FLIXBUS:    { displayName: "FlixBus",           accentColor: "#73D700", bgColor: "rgba(115,215,0,.15)",  emoji: "🚌" },
};

// ─── Yardımcı fonksiyon ───────────────────────────────────────

/** Tanımsız operatör için güvenli fallback döner. */
export function getOperatorMeta(op: Operator): OperatorMeta {
  return (
    OPERATOR_META[op] ?? {
      displayName:  op,
      accentColor:  "#6B7280",
      bgColor:      "rgba(107,114,128,.15)",
      emoji:        "✈️",   // bilinmeyen operatör → uçak varsayımı
    }
  );
}
