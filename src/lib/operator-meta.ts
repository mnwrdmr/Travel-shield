// ─────────────────────────────────────────────
// lib/operator-meta.ts
// Maps Operator enum → display metadata.
// No UI concerns here — pure data.
// ─────────────────────────────────────────────

import type { Operator } from "@/types/travel";

interface OperatorMeta {
  displayName: string;
  accentColor: string; // Tailwind arbitrary color
  bgColor: string;
  emoji: string; // fallback when SVG logo isn't available
}

export const OPERATOR_META: Record<Operator, OperatorMeta> = {
  RYANAIR:    { displayName: "Ryanair",    accentColor: "#003580", bgColor: "#EBF0FF", emoji: "✈️" },
  WIZZAIR:    { displayName: "Wizz Air",   accentColor: "#C6007E", bgColor: "#FFE8F7", emoji: "✈️" },
  EASYJET:    { displayName: "easyJet",    accentColor: "#FF6600", bgColor: "#FFF0E6", emoji: "✈️" },
  TRENITALIA: { displayName: "Trenitalia", accentColor: "#009246", bgColor: "#E6F7ED", emoji: "🚂" },
  SNCF:       { displayName: "SNCF",       accentColor: "#C0392B", bgColor: "#FDEDEC", emoji: "🚄" },
  DB:         { displayName: "Deutsche Bahn", accentColor: "#E30613", bgColor: "#FDEDEC", emoji: "🚂" },
  OBB:        { displayName: "ÖBB",        accentColor: "#E31838", bgColor: "#FDEDEC", emoji: "🚂" },
  FLIXBUS:    { displayName: "FlixBus",    accentColor: "#73D700", bgColor: "#F0FDE4", emoji: "🚌" },
};

export function getOperatorMeta(op: Operator): OperatorMeta {
  return OPERATOR_META[op] ?? {
    displayName: op,
    accentColor: "#6B7280",
    bgColor: "#F3F4F6",
    emoji: "🚍",
  };
}
