// UN Sustainable Development Goals relevant to Gold Standard certification

export interface SDGGoal {
  id: number;
  name: string;
  description: string;
  relevantToAgroforestry: boolean;
  indicators: string[];
}

export const SDG_GOALS: SDGGoal[] = [
  { id: 1, name: 'No Poverty', description: 'End poverty in all its forms everywhere', relevantToAgroforestry: true, indicators: ['Income increase for smallholders', 'Access to financial services'] },
  { id: 2, name: 'Zero Hunger', description: 'End hunger, achieve food security', relevantToAgroforestry: true, indicators: ['Food production diversity', 'Nutritional outcomes'] },
  { id: 3, name: 'Good Health and Well-being', description: 'Ensure healthy lives and well-being', relevantToAgroforestry: false, indicators: ['Air quality improvement', 'Clean water access'] },
  { id: 4, name: 'Quality Education', description: 'Ensure inclusive and equitable education', relevantToAgroforestry: false, indicators: ['Training programs delivered', 'Farmer awareness levels'] },
  { id: 5, name: 'Gender Equality', description: 'Achieve gender equality and empower women', relevantToAgroforestry: true, indicators: ['Women participation rate', 'Women in leadership roles'] },
  { id: 6, name: 'Clean Water and Sanitation', description: 'Ensure availability of water and sanitation', relevantToAgroforestry: true, indicators: ['Watershed protection', 'Water quality improvement'] },
  { id: 7, name: 'Affordable and Clean Energy', description: 'Ensure access to energy for all', relevantToAgroforestry: false, indicators: ['Biomass energy provision', 'Fuel-efficient stoves'] },
  { id: 8, name: 'Decent Work and Economic Growth', description: 'Promote sustained economic growth', relevantToAgroforestry: true, indicators: ['Jobs created', 'Income from carbon credits'] },
  { id: 9, name: 'Industry Innovation and Infrastructure', description: 'Build resilient infrastructure', relevantToAgroforestry: false, indicators: ['Technology adoption', 'Digital tools usage'] },
  { id: 10, name: 'Reduced Inequalities', description: 'Reduce inequality within and among countries', relevantToAgroforestry: true, indicators: ['Equitable benefit sharing', 'Marginalized community inclusion'] },
  { id: 11, name: 'Sustainable Cities and Communities', description: 'Make cities inclusive and sustainable', relevantToAgroforestry: false, indicators: ['Urban greening projects', 'Community resilience'] },
  { id: 12, name: 'Responsible Consumption and Production', description: 'Ensure sustainable consumption and production', relevantToAgroforestry: true, indicators: ['Sustainable farming practices', 'Waste reduction'] },
  { id: 13, name: 'Climate Action', description: 'Combat climate change and its impacts', relevantToAgroforestry: true, indicators: ['tCO2e sequestered', 'Climate resilience measures'] },
  { id: 14, name: 'Life Below Water', description: 'Conserve and sustainably use the oceans', relevantToAgroforestry: false, indicators: ['Coastal mangrove restoration', 'Water pollution reduction'] },
  { id: 15, name: 'Life on Land', description: 'Protect and restore terrestrial ecosystems', relevantToAgroforestry: true, indicators: ['Biodiversity index improvement', 'Land degradation neutrality'] },
  { id: 16, name: 'Peace Justice and Strong Institutions', description: 'Promote peaceful and inclusive societies', relevantToAgroforestry: false, indicators: ['FPIC compliance', 'Transparent governance'] },
  { id: 17, name: 'Partnerships for the Goals', description: 'Strengthen global partnerships', relevantToAgroforestry: false, indicators: ['Multi-stakeholder partnerships', 'South-South cooperation'] },
];

export function getAgroforestryRelevantSDGs(): SDGGoal[] {
  return SDG_GOALS.filter(g => g.relevantToAgroforestry);
}
