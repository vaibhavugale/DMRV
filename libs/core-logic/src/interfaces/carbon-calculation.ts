// Carbon calculation interfaces and parameters

export interface ICarbonParams {
  volume: number;          // V - merchantable volume (m³)
  woodDensity: number;     // WD - species-specific (g/cm³)
  biomassExpansionFactor: number; // BEF
  rootToShootRatio: number; // R
  carbonFraction: number;   // CF (typically 0.47-0.50)
}

export interface ICarbonResult {
  aboveGroundBiomass: number;  // kg
  belowGroundBiomass: number;  // kg
  totalBiomass: number;        // kg
  carbonContent: number;       // kg C
  co2Equivalent: number;       // kg CO2e (carbon × 3.667)
  co2EquivalentTonnes: number; // tCO2e
}

export interface IProjectCarbonSummary {
  projectId: string;
  verificationPeriodStart: string;
  verificationPeriodEnd: string;
  totalTrees: number;
  totalAreaHectares: number;
  totalAGB: number;       // kg
  totalBGB: number;       // kg
  totalCarbonTonnes: number;
  totalCO2eTonnes: number;
  nonPermanenceBuffer: number; // percentage deducted
  netCreditsIssued: number;
  methodology: string;
  calculatedAt: string;
}
