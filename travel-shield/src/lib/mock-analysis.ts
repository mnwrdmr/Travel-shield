// ─────────────────────────────────────────────
// lib/mock-analysis.ts
// Swap this entire file for a real API call later.
// UI components never import JSON directly.
// ─────────────────────────────────────────────

import type { AnalysisResult } from "@/types/travel";

export const MOCK_ANALYSIS: AnalysisResult = {
  id: "analysis_0001",
  analyzedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 mins ago
  segment: {
    pnr: "XY789Z",
    operator: "RYANAIR",
    mode: "FLIGHT",
    origin: "IST",
    destination: "BCN",
    departureTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18h from now
    arrivalTime: new Date(Date.now() + 1000 * 60 * 60 * 21).toISOString(),
    checkInDeadline: new Date(Date.now() + 1000 * 60 * 60 * 16).toISOString(), // 2h before depart
    validationRequired: false,
  },
  risks: [
    {
      id: "risk_001",
      level: "CRITICAL",
      title: "Online check-in window closes in 2h",
      description:
        "Ryanair charges €55 for airport check-in. Your window opened 24h before departure. Don't miss it.",
      potentialFine: 55,
      currency: "EUR",
      actionLabel: "Check in now",
      actionHref: "https://www.ryanair.com/checkin",
    },
    {
      id: "risk_002",
      level: "WARNING",
      title: "Cabin bag size may exceed limit",
      description:
        "Your reported bag is 42×22×26 cm. Ryanair's free limit is 40×20×25 cm. Risk of €70 gate fee.",
      potentialFine: 70,
      currency: "EUR",
      actionLabel: "Measure with AR",
      actionHref: "/ar-sizer",
    },
    {
      id: "risk_003",
      level: "INFO",
      title: "Dark pattern detected in booking email",
      description:
        "Your confirmation email contains an 'Add travel insurance' pre-tick. It has been flagged — review before departure.",
      potentialFine: 0,
      currency: "EUR",
    },
  ],
  savings: {
    totalSaved: 127,
    currency: "EUR",
    breakdown: [
      { category: "Airport check-in fee avoided", originalCost: 55, savedAmount: 55, currency: "EUR" },
      { category: "Priority boarding upsell skipped", originalCost: 18, savedAmount: 18, currency: "EUR" },
      { category: "Pre-selected seat fee blocked", originalCost: 14, savedAmount: 14, currency: "EUR" },
      { category: "Outbound baggage overcharge", originalCost: 40, savedAmount: 40, currency: "EUR" },
    ],
  },
  alternatives: [
    {
      id: "alt_001",
      operator: "FLIXBUS",
      mode: "BUS",
      origin: "Istanbul",
      destination: "Barcelona",
      departureTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
      price: 39,
      currency: "EUR",
      savings: 86,
      bookingUrl: "https://www.flixbus.com",
      tags: ["No baggage fees", "Free cancellation"],
    },
    {
      id: "alt_002",
      operator: "EASYJET",
      mode: "FLIGHT",
      origin: "IST",
      destination: "BCN",
      departureTime: new Date(Date.now() + 1000 * 60 * 60 * 22).toISOString(),
      price: 89,
      currency: "EUR",
      savings: 36,
      bookingUrl: "https://www.easyjet.com",
      tags: ["Larger cabin limit", "+1h travel time"],
    },
  ],
  fees: [
    { label: "Airport check-in fee (Ryanair)", amount: 55, currency: "EUR", avoided: true },
    { label: "Gate bag fee (40×20 limit breach)", amount: 70, currency: "EUR", avoided: false },
    { label: "Pre-selected seat", amount: 14, currency: "EUR", avoided: true },
    { label: "Priority boarding", amount: 18, currency: "EUR", avoided: true },
    { label: "Travel insurance pre-tick", amount: 12, currency: "EUR", avoided: true },
  ],
};

// ─────────────────────────────────────────────
// Simulates async API fetch — swap for real fetch()
// ─────────────────────────────────────────────
export async function getAnalysis(id: string): Promise<AnalysisResult | null> {
  await new Promise((r) => setTimeout(r, 900)); // simulate network
  if (id === MOCK_ANALYSIS.id) return MOCK_ANALYSIS;
  return null;
}
