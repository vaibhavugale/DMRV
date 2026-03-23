export interface SpeciesInfo {
    scientificName: string;
    commonName: string;
    family: string;
    genus: string;
    species: string;
    woodDensity: number;
    biomassExpansionFactor: number;
    rootToShootRatio: number;
    carbonFraction: number;
    maxHeight: number;
    growthRate: string;
    isNitrogenFixer: boolean;
}
export declare const SPECIES_REGISTRY: SpeciesInfo[];
export declare function getSpeciesDecisionTree(): Record<string, Record<string, string[]>>;
export declare function getFamilies(): string[];
export declare function getGeneraForFamily(family: string): string[];
export declare function getSpeciesForGenus(genus: string): SpeciesInfo[];
export declare function findSpecies(scientificName: string): SpeciesInfo | undefined;
//# sourceMappingURL=species-data.d.ts.map