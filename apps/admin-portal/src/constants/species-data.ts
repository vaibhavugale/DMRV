export interface SpeciesInfo {
  scientificName: string;
  commonName: string;
  family: string;
  genus: string;
  species: string;
  growthRate: 'slow' | 'medium' | 'fast';
  carbonSequestrationRate: number; // kg per year average
}

export const SPECIES_REGISTRY: SpeciesInfo[] = [
  { scientificName: "Tectona grandis", genus: "Tectona", species: "grandis", commonName: "Teak", family: "Lamiaceae", growthRate: 'medium', carbonSequestrationRate: 15.5 },
  { scientificName: "Swietenia macrophylla", genus: "Swietenia", species: "macrophylla", commonName: "Mahogany", family: "Meliaceae", growthRate: 'medium', carbonSequestrationRate: 14.8 },
  { scientificName: "Dalbergia latifolia", genus: "Dalbergia", species: "latifolia", commonName: "Rosewood", family: "Fabaceae", growthRate: 'slow', carbonSequestrationRate: 12.2 },
  { scientificName: "Gmelina arborea", genus: "Gmelina", species: "arborea", commonName: "Gambhar", family: "Lamiaceae", growthRate: 'fast', carbonSequestrationRate: 18.5 },
  { scientificName: "Azadirachta indica", genus: "Azadirachta", species: "indica", commonName: "Neem", family: "Meliaceae", growthRate: 'medium', carbonSequestrationRate: 13.9 },
  { scientificName: "Casuarina equisetifolia", genus: "Casuarina", species: "equisetifolia", commonName: "Chauila", family: "Casuarinaceae", growthRate: 'fast', carbonSequestrationRate: 19.2 },
  { scientificName: "Mangifera indica", genus: "Mangifera", species: "indica", commonName: "Mango", family: "Anacardiaceae", growthRate: 'medium', carbonSequestrationRate: 11.5 },
  { scientificName: "Artocarpus heterophyllus", genus: "Artocarpus", species: "heterophyllus", commonName: "Jackfruit", family: "Moraceae", growthRate: 'medium', carbonSequestrationRate: 10.8 },
  { scientificName: "Pongamia pinnata", genus: "Pongamia", species: "pinnata", commonName: "Karanj", family: "Fabaceae", growthRate: 'medium', carbonSequestrationRate: 14.2 },
  { scientificName: "Bambusa vulgaris", genus: "Bambusa", species: "vulgaris", commonName: "Bamboo", family: "Poaceae", growthRate: 'fast', carbonSequestrationRate: 22.5 }
];
