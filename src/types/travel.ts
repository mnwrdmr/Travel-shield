// ─────────────────────────────────────────────
// types/travel.ts
// Single source of truth for all domain types.
// Person B (backend) should extend these shapes
// when real API data arrives.
// ─────────────────────────────────────────────

export type Operator =
  | "RYANAIR"
  | "WIZZAIR"
  | "EASYJET"
  | "TRENITALIA"
  | "SNCF"
  | "DB"
  | "OBB"
  | "FLIXBUS";

export type TransportMode = "FLIGHT" | "TRAIN" | "BUS";

export type RiskLevel = "CRITICAL" | "WARNING" | "INFO";

export interface TravelSegment {
  pnr: string;
  operator: Operator;
  mode: TransportMode;
  origin: string;
  destination: string;
  departureTime: string; // ISO 8601
  arrivalTime: string;
  checkInDeadline?: string; // ISO 8601 — for auto check-in countdown
  validationRequired: boolean;
}

export interface RiskAlert {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  potentialFine: number; // EUR
  currency: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface SavingsBreakdown {
  category: string;
  originalCost: number;
  savedAmount: number;
  currency: string;
}

export interface Savings {
  totalSaved: number;
  currency: string;
  breakdown: SavingsBreakdown[];
}

export interface AlternativeTransport {
  id: string;
  operator: Operator;
  mode: TransportMode;
  origin: string;
  destination: string;
  departureTime: string;
  price: number;
  currency: string;
  savings: number; // vs current booking
  bookingUrl?: string;
  tags: string[]; // e.g. ["Faster", "No baggage fees"]
}

export interface FeeLineItem {
  label: string;
  amount: number;
  currency: string;
  avoided: boolean; // true = we saved this, false = still at risk
}

export interface AnalysisResult {
  id: string;
  analyzedAt: string; // ISO 8601
  segment: TravelSegment;
  risks: RiskAlert[];
  savings: Savings;
  alternatives: AlternativeTransport[];
  fees: FeeLineItem[];
}

// ─── Sprint 2: Person A — Form input bridge type ───
// Bridges Person Y's form to the AI simulation engine.
// Person Y extracts these fields from the form and passes
// them to runAiSimulation() in TravelContext.
export interface RawFormInput {
  airline: Operator;
  transportType: TransportMode;
  origin: string;
  destination: string;
  date: string; // YYYY-MM-DD
  cabinBagIncluded: boolean;
  pastedBookingText?: string; // Optional: paste mode
}
