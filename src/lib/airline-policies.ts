import type { BaggageDimensions, Operator } from "@/types/travel";

export type AirlineBaggagePolicy = BaggageDimensions & { gateFee: number };

/** Client-side source of truth for cabin-bag comparison rules. */
export const AIRLINE_BAGGAGE_POLICIES: Record<Operator, AirlineBaggagePolicy> = {
  THY:        { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 0 },
  PEGASUS:    { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 50 },
  AJET:       { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 45 },
  SUNEXPRESS: { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 45 },
  CORENDON:   { widthCm: 55, heightCm: 40, depthCm: 20, gateFee: 40 },
  RYANAIR:    { widthCm: 40, heightCm: 20, depthCm: 25, gateFee: 70 },
  WIZZAIR:    { widthCm: 40, heightCm: 30, depthCm: 20, gateFee: 80 },
  EASYJET:    { widthCm: 56, heightCm: 45, depthCm: 25, gateFee: 48 },
  TRENITALIA: { widthCm: 80, heightCm: 50, depthCm: 30, gateFee: 0 },
  SNCF:       { widthCm: 70, heightCm: 50, depthCm: 30, gateFee: 0 },
  DB:         { widthCm: 70, heightCm: 50, depthCm: 30, gateFee: 0 },
  OBB:        { widthCm: 70, heightCm: 50, depthCm: 30, gateFee: 0 },
  FLIXBUS:    { widthCm: 67, heightCm: 42, depthCm: 27, gateFee: 0 },
};

export function getAirlineBaggagePolicy(operator: string): AirlineBaggagePolicy {
  return AIRLINE_BAGGAGE_POLICIES[operator.toUpperCase() as Operator] ?? AIRLINE_BAGGAGE_POLICIES.RYANAIR;
}
