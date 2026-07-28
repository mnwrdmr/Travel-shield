// ─────────────────────────────────────────────────────────────
// src/types/travel.ts
// SPRINT FINAL: Türk havayolları eklendi
//   THY | PEGASUS | AJET | SUNEXPRESS | CORENDON
// ─────────────────────────────────────────────────────────────

export type Operator =
  | "RYANAIR"
  | "WIZZAIR"
  | "EASYJET"
  // ── Türk havayolları (Sprint Final) ──
  | "THY"
  | "PEGASUS"
  | "AJET"
  | "SUNEXPRESS"
  | "CORENDON"
  // ── Demiryolu & otobüs ──
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
  departureTime: string;
  arrivalTime: string;
  checkInDeadline?: string;
  validationRequired: boolean;
}

export interface RiskAlert {
  id: string;
  level: RiskLevel;
  title: string;
  description: string;
  potentialFine: number;
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
  savings: number;
  bookingUrl?: string;
  tags: string[];
}

export interface FeeLineItem {
  label: string;
  amount: number;
  currency: string;
  avoided: boolean;
}

export interface AnalysisResult {
  id: string;
  analyzedAt: string;
  segment: TravelSegment;
  risks: RiskAlert[];
  savings: Savings;
  alternatives: AlternativeTransport[];
  fees: FeeLineItem[];
  baggageAnalysis?: BaggageAnalysis;
}

// ── Bagaj AI tipleri ─────────────────────────────────────────
export type BaggageStatus = "COMPLIANT" | "WARNING" | "OVERSIZED" | "EXCEEDED";

export interface BaggageDimensions {
  widthCm: number;
  heightCm: number;
  depthCm: number;
}

export interface BaggageAnalysis {
  id: string;
  status: BaggageStatus;
  detectedDimensions: BaggageDimensions;
  allowedDimensions: BaggageDimensions;
  overageCm?: { width: number; height: number; depth: number };
  weightKg?: number;
  maxWeightKg?: number;
  potentialGateFee: number;
  currency: string;
  confidenceScore: number;
  imageUrl?: string;
  recommendations: string[];
}

export interface RawFormInput {
  airline: Operator;
  transportType: TransportMode;
  origin: string;
  destination: string;
  date: string;
  cabinBagIncluded: boolean;
  pastedBookingText?: string;
  baggageImage?: string;
  baggageDimensions?: BaggageDimensions;
}

// ── FastAPI backend yanıt tipi (LuggageScanner için) ─────────
export interface BackendScanResponse {
  is_luggage: boolean;
  message: string;
  status: "PASS" | "FAIL" | "WARNING" | null;
  detected_dimensions: { width_cm: number; height_cm: number; depth_cm: number } | null;
  allowed_dimensions:  { width_cm: number; height_cm: number; depth_cm: number } | null;
  overage_cm:          { width_cm: number; height_cm: number; depth_cm: number } | null;
  potential_gate_fee_eur: number | null;
  confidence_score: number | null;
  recommendations: string[] | null;
}
