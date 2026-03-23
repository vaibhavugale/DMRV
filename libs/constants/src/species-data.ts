// Species Decision Tree for Agroforestry
// Family → Genus → Species with biomass parameters

export interface SpeciesInfo {
  scientificName: string;
  commonName: string;
  family: string;
  genus: string;
  species: string;
  woodDensity: number;       // g/cm³
  biomassExpansionFactor: number; // BEF
  rootToShootRatio: number;  // R
  carbonFraction: number;    // CF (typically 0.47)
  maxHeight: number;         // meters
  growthRate: string;        // slow, moderate, fast
  isNitrogenFixer: boolean;
}

export const SPECIES_REGISTRY: SpeciesInfo[] = [
  // FABACEAE (Legume family)
  {
    scientificName: 'Leucaena leucocephala',
    commonName: 'White Leadtree',
    family: 'Fabaceae',
    genus: 'Leucaena',
    species: 'leucocephala',
    woodDensity: 0.55,
    biomassExpansionFactor: 1.8,
    rootToShootRatio: 0.28,
    carbonFraction: 0.47,
    maxHeight: 20,
    growthRate: 'fast',
    isNitrogenFixer: true,
  },
  {
    scientificName: 'Gliricidia sepium',
    commonName: 'Gliricidia',
    family: 'Fabaceae',
    genus: 'Gliricidia',
    species: 'sepium',
    woodDensity: 0.48,
    biomassExpansionFactor: 1.7,
    rootToShootRatio: 0.24,
    carbonFraction: 0.47,
    maxHeight: 15,
    growthRate: 'fast',
    isNitrogenFixer: true,
  },
  {
    scientificName: 'Acacia mangium',
    commonName: 'Mangium',
    family: 'Fabaceae',
    genus: 'Acacia',
    species: 'mangium',
    woodDensity: 0.46,
    biomassExpansionFactor: 1.6,
    rootToShootRatio: 0.24,
    carbonFraction: 0.47,
    maxHeight: 30,
    growthRate: 'fast',
    isNitrogenFixer: true,
  },
  {
    scientificName: 'Sesbania grandiflora',
    commonName: 'Agati',
    family: 'Fabaceae',
    genus: 'Sesbania',
    species: 'grandiflora',
    woodDensity: 0.30,
    biomassExpansionFactor: 1.5,
    rootToShootRatio: 0.20,
    carbonFraction: 0.47,
    maxHeight: 12,
    growthRate: 'fast',
    isNitrogenFixer: true,
  },
  {
    scientificName: 'Dalbergia sissoo',
    commonName: 'Shisham',
    family: 'Fabaceae',
    genus: 'Dalbergia',
    species: 'sissoo',
    woodDensity: 0.72,
    biomassExpansionFactor: 1.9,
    rootToShootRatio: 0.26,
    carbonFraction: 0.47,
    maxHeight: 25,
    growthRate: 'moderate',
    isNitrogenFixer: true,
  },
  // MELIACEAE (Mahogany family)
  {
    scientificName: 'Azadirachta indica',
    commonName: 'Neem',
    family: 'Meliaceae',
    genus: 'Azadirachta',
    species: 'indica',
    woodDensity: 0.56,
    biomassExpansionFactor: 1.7,
    rootToShootRatio: 0.26,
    carbonFraction: 0.47,
    maxHeight: 20,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
  {
    scientificName: 'Swietenia macrophylla',
    commonName: 'Mahogany',
    family: 'Meliaceae',
    genus: 'Swietenia',
    species: 'macrophylla',
    woodDensity: 0.50,
    biomassExpansionFactor: 1.8,
    rootToShootRatio: 0.24,
    carbonFraction: 0.47,
    maxHeight: 35,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
  // MORACEAE (Fig family)
  {
    scientificName: 'Artocarpus heterophyllus',
    commonName: 'Jackfruit',
    family: 'Moraceae',
    genus: 'Artocarpus',
    species: 'heterophyllus',
    woodDensity: 0.52,
    biomassExpansionFactor: 1.6,
    rootToShootRatio: 0.24,
    carbonFraction: 0.47,
    maxHeight: 25,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
  {
    scientificName: 'Ficus religiosa',
    commonName: 'Peepal',
    family: 'Moraceae',
    genus: 'Ficus',
    species: 'religiosa',
    woodDensity: 0.38,
    biomassExpansionFactor: 2.0,
    rootToShootRatio: 0.30,
    carbonFraction: 0.47,
    maxHeight: 30,
    growthRate: 'fast',
    isNitrogenFixer: false,
  },
  // MYRTACEAE
  {
    scientificName: 'Eucalyptus grandis',
    commonName: 'Rose Gum',
    family: 'Myrtaceae',
    genus: 'Eucalyptus',
    species: 'grandis',
    woodDensity: 0.45,
    biomassExpansionFactor: 1.5,
    rootToShootRatio: 0.20,
    carbonFraction: 0.47,
    maxHeight: 55,
    growthRate: 'fast',
    isNitrogenFixer: false,
  },
  {
    scientificName: 'Psidium guajava',
    commonName: 'Guava',
    family: 'Myrtaceae',
    genus: 'Psidium',
    species: 'guajava',
    woodDensity: 0.62,
    biomassExpansionFactor: 1.6,
    rootToShootRatio: 0.28,
    carbonFraction: 0.47,
    maxHeight: 10,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
  // COMBRETACEAE
  {
    scientificName: 'Terminalia arjuna',
    commonName: 'Arjuna',
    family: 'Combretaceae',
    genus: 'Terminalia',
    species: 'arjuna',
    woodDensity: 0.62,
    biomassExpansionFactor: 1.8,
    rootToShootRatio: 0.26,
    carbonFraction: 0.47,
    maxHeight: 25,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
  // ANACARDIACEAE (Cashew family)
  {
    scientificName: 'Mangifera indica',
    commonName: 'Mango',
    family: 'Anacardiaceae',
    genus: 'Mangifera',
    species: 'indica',
    woodDensity: 0.52,
    biomassExpansionFactor: 1.7,
    rootToShootRatio: 0.24,
    carbonFraction: 0.47,
    maxHeight: 40,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
  // BIGNONIACEAE
  {
    scientificName: 'Millingtonia hortensis',
    commonName: 'Indian Cork Tree',
    family: 'Bignoniaceae',
    genus: 'Millingtonia',
    species: 'hortensis',
    woodDensity: 0.35,
    biomassExpansionFactor: 1.6,
    rootToShootRatio: 0.22,
    carbonFraction: 0.47,
    maxHeight: 25,
    growthRate: 'fast',
    isNitrogenFixer: false,
  },
  // DIPTEROCARPACEAE
  {
    scientificName: 'Shorea robusta',
    commonName: 'Sal',
    family: 'Dipterocarpaceae',
    genus: 'Shorea',
    species: 'robusta',
    woodDensity: 0.72,
    biomassExpansionFactor: 1.9,
    rootToShootRatio: 0.26,
    carbonFraction: 0.47,
    maxHeight: 35,
    growthRate: 'slow',
    isNitrogenFixer: false,
  },
  // CASUARINACEAE
  {
    scientificName: 'Casuarina equisetifolia',
    commonName: 'She-Oak',
    family: 'Casuarinaceae',
    genus: 'Casuarina',
    species: 'equisetifolia',
    woodDensity: 0.62,
    biomassExpansionFactor: 1.5,
    rootToShootRatio: 0.22,
    carbonFraction: 0.47,
    maxHeight: 20,
    growthRate: 'fast',
    isNitrogenFixer: true,
  },
  // RUBIACEAE (Coffee family)
  {
    scientificName: 'Coffea arabica',
    commonName: 'Arabica Coffee',
    family: 'Rubiaceae',
    genus: 'Coffea',
    species: 'arabica',
    woodDensity: 0.58,
    biomassExpansionFactor: 1.4,
    rootToShootRatio: 0.30,
    carbonFraction: 0.47,
    maxHeight: 5,
    growthRate: 'slow',
    isNitrogenFixer: false,
  },
  // ARECACEAE (Palm family)
  {
    scientificName: 'Cocos nucifera',
    commonName: 'Coconut Palm',
    family: 'Arecaceae',
    genus: 'Cocos',
    species: 'nucifera',
    woodDensity: 0.45,
    biomassExpansionFactor: 1.3,
    rootToShootRatio: 0.20,
    carbonFraction: 0.47,
    maxHeight: 30,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
  // RUTACEAE (Citrus family)
  {
    scientificName: 'Citrus sinensis',
    commonName: 'Sweet Orange',
    family: 'Rutaceae',
    genus: 'Citrus',
    species: 'sinensis',
    woodDensity: 0.60,
    biomassExpansionFactor: 1.5,
    rootToShootRatio: 0.28,
    carbonFraction: 0.47,
    maxHeight: 10,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
  // MALVACEAE
  {
    scientificName: 'Tectona grandis',
    commonName: 'Teak',
    family: 'Lamiaceae',
    genus: 'Tectona',
    species: 'grandis',
    woodDensity: 0.55,
    biomassExpansionFactor: 1.7,
    rootToShootRatio: 0.24,
    carbonFraction: 0.47,
    maxHeight: 40,
    growthRate: 'moderate',
    isNitrogenFixer: false,
  },
];

// Build the decision tree structure: family → genera → species
export function getSpeciesDecisionTree(): Record<string, Record<string, string[]>> {
  const tree: Record<string, Record<string, string[]>> = {};
  for (const sp of SPECIES_REGISTRY) {
    if (!tree[sp.family]) tree[sp.family] = {};
    if (!tree[sp.family][sp.genus]) tree[sp.family][sp.genus] = [];
    if (!tree[sp.family][sp.genus].includes(sp.species)) {
      tree[sp.family][sp.genus].push(sp.species);
    }
  }
  return tree;
}

// Get all unique families
export function getFamilies(): string[] {
  return [...new Set(SPECIES_REGISTRY.map(s => s.family))].sort();
}

// Get genera for a family
export function getGeneraForFamily(family: string): string[] {
  return [...new Set(SPECIES_REGISTRY.filter(s => s.family === family).map(s => s.genus))].sort();
}

// Get species for a genus
export function getSpeciesForGenus(genus: string): SpeciesInfo[] {
  return SPECIES_REGISTRY.filter(s => s.genus === genus);
}

// Find species by scientific name
export function findSpecies(scientificName: string): SpeciesInfo | undefined {
  return SPECIES_REGISTRY.find(s => s.scientificName === scientificName);
}
