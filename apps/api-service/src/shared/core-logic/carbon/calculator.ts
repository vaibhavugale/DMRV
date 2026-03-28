// Carbon sequestration calculator using IPCC methodology
// C_tree = (V × WD × BEF) × (1 + R) × CF
// CO2e = C × 3.667

import { ICarbonParams, ICarbonResult } from '../interfaces/carbon-calculation';
import { findSpecies, SpeciesInfo } from '@dmrv/constants';

/**
 * Calculate merchantable volume from DBH and height
 * Using a simplified form factor approach: V = π/4 × (DBH/100)² × H × f
 * where f is the form factor (typically 0.5–0.7 for tropical species)
 */
export function calculateVolume(dbhCm: number, heightM: number, formFactor: number = 0.6): number {
  const dbhM = dbhCm / 100;
  return (Math.PI / 4) * Math.pow(dbhM, 2) * heightM * formFactor;
}

/**
 * Calculate carbon sequestered by a single tree
 * Following IPCC Tier 2 approach for AGB estimation
 */
export function calculateTreeCarbon(params: ICarbonParams): ICarbonResult {
  const { volume, woodDensity, biomassExpansionFactor, rootToShootRatio, carbonFraction } = params;

  // Above-ground biomass: AGB = V × WD × BEF (in kg, converting WD from g/cm³ to kg/m³)
  const aboveGroundBiomass = volume * (woodDensity * 1000) * biomassExpansionFactor;

  // Below-ground biomass: BGB = AGB × R
  const belowGroundBiomass = aboveGroundBiomass * rootToShootRatio;

  // Total biomass
  const totalBiomass = aboveGroundBiomass + belowGroundBiomass;

  // Carbon content: C = totalBiomass × CF
  const carbonContent = totalBiomass * carbonFraction;

  // CO2 equivalent: CO2e = C × (44/12) = C × 3.667
  const co2Equivalent = carbonContent * 3.667;

  return {
    aboveGroundBiomass: Math.round(aboveGroundBiomass * 1000) / 1000,
    belowGroundBiomass: Math.round(belowGroundBiomass * 1000) / 1000,
    totalBiomass: Math.round(totalBiomass * 1000) / 1000,
    carbonContent: Math.round(carbonContent * 1000) / 1000,
    co2Equivalent: Math.round(co2Equivalent * 1000) / 1000,
    co2EquivalentTonnes: Math.round((co2Equivalent / 1000) * 10000) / 10000,
  };
}

/**
 * Calculate carbon for a tree using its DBH, height, and species
 */
export function calculateTreeCarbonBySpecies(
  dbhCm: number,
  heightM: number,
  scientificName: string,
  formFactor: number = 0.6
): ICarbonResult | null {
  const speciesInfo = findSpecies(scientificName);
  if (!speciesInfo) return null;

  const volume = calculateVolume(dbhCm, heightM, formFactor);

  return calculateTreeCarbon({
    volume,
    woodDensity: speciesInfo.woodDensity,
    biomassExpansionFactor: speciesInfo.biomassExpansionFactor,
    rootToShootRatio: speciesInfo.rootToShootRatio,
    carbonFraction: speciesInfo.carbonFraction,
  });
}

/**
 * Calculate non-permanence buffer deduction percentage
 * Based on Verra's AFOLU Non-Permanence Risk Tool
 */
export function calculateBufferPercentage(
  internalRisk: number,
  externalRisk: number,
  naturalRisk: number
): number {
  const total = internalRisk + externalRisk + naturalRisk;
  return Math.min(Math.max(total, 10), 60); // Between 10% and 60%
}

/**
 * Calculate net credits after buffer pool deduction
 */
export function calculateNetCredits(
  grossCO2eTonnes: number,
  bufferPercentage: number,
  leakageDeduction: number = 0
): number {
  const afterLeakage = grossCO2eTonnes * (1 - leakageDeduction / 100);
  const afterBuffer = afterLeakage * (1 - bufferPercentage / 100);
  return Math.round(afterBuffer * 100) / 100;
}
