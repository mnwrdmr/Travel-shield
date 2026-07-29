// ─────────────────────────────────────────────────────────────
// src/lib/operator-meta.ts
// SPRINT FINAL: Türk havayolları metadata eklendi
// ─────────────────────────────────────────────────────────────

import type { Operator } from "@/types/travel";

interface OperatorMeta {
  displayName: string;
  accentColor: string;
  bgColor: string;
  emoji: string;
}

export const OPERATOR_META: Record<Operator, OperatorMeta> = {
  // ── Avrupa LCC ────────────────────────────────────────────
  RYANAIR:    { displayName: "Ryanair",          accentColor: "#003580", bgColor: "rgba(0,53,128,.15)",   emoji: "✈️" },
  WIZZAIR:    { displayName: "Wizz Air",          accentColor: "#C6007E", bgColor: "rgba(198,0,126,.12)",  emoji: "✈️" },
  EASYJET:    { displayName: "easyJet",           accentColor: "#FF6600", bgColor: "rgba(255,102,0,.12)",  emoji: "✈️" },

  // ── Türk Havayolları (Sprint Final) ───────────────────────
  THY:        { displayName: "Turkish Airlines",  accentColor: "#E31E24", bgColor: "rgba(227,30,36,.12)",  emoji: "🇹🇷" },
  PEGASUS:    { displayName: "Pegasus Airlines",  accentColor: "#F7A823", bgColor: "rgba(247,168,35,.12)", emoji: "🐎" },
  AJET:       { displayName: "AJet",              accentColor: "#E85D04", bgColor: "rgba(232,93,4,.12)",   emoji: "✈️" },
  SUNEXPRESS: { displayName: "SunExpress",        accentColor: "#F7941D", bgColor: "rgba(247,148,29,.12)", emoji: "☀️" },
  CORENDON:   { displayName: "Corendon Airlines", accentColor: "#003087", bgColor: "rgba(0,48,135,.12)",   emoji: "✈️" },

  // ── Demiryolu & Otobüs ────────────────────────────────────
  TRENITALIA: { displayName: "Trenitalia",        accentColor: "#009246", bgColor: "rgba(0,146,70,.12)",   emoji: "🚂" },
  SNCF:       { displayName: "SNCF",              accentColor: "#C0392B", bgColor: "rgba(192,57,43,.12)",  emoji: "🚄" },
  DB:         { displayName: "Deutsche Bahn",     accentColor: "#E30613", bgColor: "rgba(227,6,19,.12)",   emoji: "🚂" },
  OBB:        { displayName: "ÖBB",              accentColor: "#E31838", bgColor: "rgba(227,24,56,.12)",   emoji: "🚂" },
  FLIXBUS:    { displayName: "FlixBus",           accentColor: "#73D700", bgColor: "rgba(115,215,0,.12)",  emoji: "🚌" },
};

export function getOperatorMeta(op: Operator): OperatorMeta {
  return (
    OPERATOR_META[op] ?? {
      displayName: op,
      accentColor: "#6B7280",
      bgColor: "rgba(107,114,128,.12)",
      emoji: "✈️",
    }
  );
}
