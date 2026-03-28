import { ICarbonParams, ICarbonResult } from '../interfaces/carbon-calculation';
/**
 * Calculate merchantable volume from DBH and height
 * Using a simplified form factor approach: V = π/4 × (DBH/100)² × H × f
 * where f is the form factor (typically 0.5–0.7 for tropical species)
 */
export declare function calculateVolume(dbhCm: number, heightM: number, formFactor?: number): number;
/**
 * Calculate carbon sequestered by a single tree
 * Following IPCC Tier 2 approach for AGB estimation
 */
export declare function calculateTreeCarbon(params: ICarbonParams): ICarbonResult;
/**
 * Calculate carbon for a tree using its DBH, height, and species
 */
export declare function calculateTreeCarbonBySpecies(dbhCm: number, heightM: number, scientificName: string, formFactor?: number): ICarbonResult | null;
/**
 * Calculate non-permanence buffer deduction percentage
 * Based on Verra's AFOLU Non-Permanence Risk Tool
 */
export declare function calculateBufferPercentage(internalRisk: number, externalRisk: number, naturalRisk: number): number;
/**
 * Calculate net credits after buffer pool deduction
 */
export declare function calculateNetCredits(grossCO2eTonnes: number, bufferPercentage: number, leakageDeduction?: number): number;
//# sourceMappingURL=calculator.d.ts.map