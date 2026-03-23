export interface ICarbonParams {
    volume: number;
    woodDensity: number;
    biomassExpansionFactor: number;
    rootToShootRatio: number;
    carbonFraction: number;
}
export interface ICarbonResult {
    aboveGroundBiomass: number;
    belowGroundBiomass: number;
    totalBiomass: number;
    carbonContent: number;
    co2Equivalent: number;
    co2EquivalentTonnes: number;
}
export interface IProjectCarbonSummary {
    projectId: string;
    verificationPeriodStart: string;
    verificationPeriodEnd: string;
    totalTrees: number;
    totalAreaHectares: number;
    totalAGB: number;
    totalBGB: number;
    totalCarbonTonnes: number;
    totalCO2eTonnes: number;
    nonPermanenceBuffer: number;
    netCreditsIssued: number;
    methodology: string;
    calculatedAt: string;
}
//# sourceMappingURL=carbon-calculation.d.ts.map