import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Farmer } from '../models/Farmer';
import { FarmPlot } from '../models/FarmPlot';
import { Tree } from '../models/Tree';
import { Activity } from '../models/Activity';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { FarmerStatus, TreeCondition, ActivityType, UserRole, PlotLandUse } from '../shared/constants';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agroforestry-dmrv';

export async function seed() {
  console.log('🌱 Starting seed...');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
  
  // Clear existing data
  await Promise.all([
    Project.deleteMany({}),
    Farmer.deleteMany({}),
    FarmPlot.deleteMany({}),
    Tree.deleteMany({}),
    Activity.deleteMany({}),
    User.deleteMany({}),
  ]);

  // 1. Super Admin
  await User.create({
    userId: 'USR-SUPER-001',
    email: 'superadmin@dmrv.org',
    passwordHash: 'super123',
    firstName: 'Global',
    lastName: 'Admin',
    role: UserRole.SUPER_ADMIN,
  });

  // 2. Project Admin
  await User.create({
    userId: 'USR-ADMIN-001',
    email: 'admin@dmrv.org',
    passwordHash: 'admin123',
    firstName: 'Project',
    lastName: 'Manager',
    role: UserRole.ADMIN,
  });

  // 3. Operator (Data Entry)
  await User.create({
    userId: 'USR-OPER-001',
    email: 'operator@dmrv.org',
    passwordHash: 'operator123',
    firstName: 'Field',
    lastName: 'Operator',
    role: UserRole.OPERATOR,
  });

  // 4. Auditor
  await User.create({
    userId: 'USR-AUDIT-001',
    email: 'auditor@dmrv.org',
    passwordHash: 'auditor123',
    firstName: 'VVB',
    lastName: 'Auditor',
    role: UserRole.AUDITOR,
  });

  console.log('✅ Users seeded');

  // Create Project
  const demoProject = await Project.create({
    name: 'Karnataka Agroforestry Pilot',
    region: 'South India',
    startDate: new Date('2020-01-01'),
    methodology: 'VM0047',
    isActive: true,
    baseline: {
      referencePeriodStart: new Date('2010-01-01'),
      referencePeriodEnd: new Date('2019-12-31'),
      controlArea: {
        type: 'MultiPolygon',
        coordinates: [[[[76.0, 12.0], [77.0, 12.0], [77.0, 13.0], [76.0, 13.0], [76.0, 12.0]]]]
      },
      baselineEmissionsFactorCO2ePerHa: 0 // ARR typically assumes zero baseline for degraded land
    },
    lcaSettings: {
      transportEmissionsFactorCO2ePerKm: 0.15,
      fertilizerEmissionsFactorCO2ePerKg: 2.5,
      defaultWoodDensity: 0.5
    },
    sdgTargets: [1, 2, 13, 15]
  });
  console.log(`✅ Pilot Project created: ${demoProject.name}`);
  const projectId = demoProject._id;

  // Create farmers
  const farmersData = [
    { farmerId: 'FRM-00000001', firstName: 'Rajesh', lastName: 'Kumar', contact: { phone: '+91-9876543210', address: 'Village Sundara, Dist. Mandya, Karnataka' }, status: FarmerStatus.ACTIVE, socioEconomic: { householdSize: 5, annualIncome: 120000, primaryLivelihood: 'farming', accessToCredit: false, genderOfHousehold: 'male' }, consent: { fpicGranted: true, consentDate: new Date('2024-06-15'), witnessName: 'Suresh Babu' }, sdgTags: [1, 2, 13, 15] },
    { farmerId: 'FRM-00000002', firstName: 'Lakshmi', lastName: 'Devi', contact: { phone: '+91-9876543211', address: 'Village Harihara, Dist. Davangere, Karnataka' }, status: FarmerStatus.ACTIVE, socioEconomic: { householdSize: 4, annualIncome: 95000, primaryLivelihood: 'farming', accessToCredit: true, genderOfHousehold: 'female' }, consent: { fpicGranted: true, consentDate: new Date('2024-07-20'), witnessName: 'Meena K' }, sdgTags: [1, 2, 5, 13, 15] },
    { farmerId: 'FRM-00000003', firstName: 'Moses', lastName: 'Okafor', contact: { phone: '+234-8012345678', address: 'Enugu South, Enugu State, Nigeria' }, status: FarmerStatus.ACTIVE, socioEconomic: { householdSize: 7, annualIncome: 80000, primaryLivelihood: 'mixed farming', accessToCredit: false, genderOfHousehold: 'male' }, consent: { fpicGranted: true, consentDate: new Date('2024-05-10'), witnessName: 'Chinedu N' }, sdgTags: [1, 2, 8, 13] },
    { farmerId: 'FRM-00000004', firstName: 'Amara', lastName: 'Diallo', contact: { phone: '+223-7634567890', address: 'Sikasso Region, Mali' }, status: FarmerStatus.PENDING, socioEconomic: { householdSize: 6, annualIncome: 60000, primaryLivelihood: 'subsistence farming', accessToCredit: false, genderOfHousehold: 'female' }, consent: { fpicGranted: false }, sdgTags: [1, 2, 5] },
    { farmerId: 'FRM-00000005', firstName: 'Carlos', lastName: 'Mendoza', contact: { phone: '+502-45678901', address: 'Alta Verapaz, Guatemala' }, status: FarmerStatus.ACTIVE, socioEconomic: { householdSize: 4, annualIncome: 110000, primaryLivelihood: 'coffee agroforestry', accessToCredit: true, genderOfHousehold: 'male' }, consent: { fpicGranted: true, consentDate: new Date('2024-08-01'), witnessName: 'Maria Gomez' }, sdgTags: [1, 2, 12, 13, 15] },
  ];

  const farmersWithProject = farmersData.map(f => ({ ...f, projectId }));
  const farmers = await Farmer.insertMany(farmersWithProject);
  console.log(`✅ ${farmers.length} farmers seeded`);

  // Create farm plots with realistic GeoJSON polygons
  const plotsData = [
    { plotId: 'PLT-00000001', farmerId: 'FRM-00000001', name: 'Rajesh North Plot', boundary: { type: 'Polygon', coordinates: [[[76.895, 12.295], [76.905, 12.295], [76.905, 12.305], [76.895, 12.305], [76.895, 12.295]]] }, areaHectares: 2.5, currentLandUse: PlotLandUse.AGROFORESTRY, landUseHistory: [{ year: 2020, landUse: PlotLandUse.CROPLAND }, { year: 2024, landUse: PlotLandUse.AGROFORESTRY }], plantingDensity: 400, verificationStatus: 'verified', baseline: { initialSoilCarbonContent: 45.5, existingTreeCount: 12, historicalLandUse: PlotLandUse.CROPLAND, baselineBiomassCO2e: 15.2 } },
    { plotId: 'PLT-00000002', farmerId: 'FRM-00000001', name: 'Rajesh South Plot', boundary: { type: 'Polygon', coordinates: [[[76.896, 12.285], [76.906, 12.285], [76.906, 12.293], [76.896, 12.293], [76.896, 12.285]]] }, areaHectares: 1.8, currentLandUse: PlotLandUse.AGROFORESTRY, landUseHistory: [{ year: 2021, landUse: PlotLandUse.DEGRADED }, { year: 2024, landUse: PlotLandUse.AGROFORESTRY }], plantingDensity: 350, verificationStatus: 'verified', baseline: { initialSoilCarbonContent: 38.0, existingTreeCount: 5, historicalLandUse: PlotLandUse.DEGRADED, baselineBiomassCO2e: 8.4 } },
    { plotId: 'PLT-00000003', farmerId: 'FRM-00000002', name: 'Lakshmi Farm', boundary: { type: 'Polygon', coordinates: [[[75.580, 14.450], [75.590, 14.450], [75.590, 14.458], [75.580, 14.458], [75.580, 14.450]]] }, areaHectares: 3.2, currentLandUse: PlotLandUse.AGROFORESTRY, landUseHistory: [{ year: 2019, landUse: PlotLandUse.GRASSLAND }, { year: 2024, landUse: PlotLandUse.AGROFORESTRY }], plantingDensity: 420, verificationStatus: 'unverified', baseline: { initialSoilCarbonContent: 52.1, existingTreeCount: 20, historicalLandUse: PlotLandUse.GRASSLAND, baselineBiomassCO2e: 25.0 } },
    { plotId: 'PLT-00000004', farmerId: 'FRM-00000003', name: 'Okafor Plantation', boundary: { type: 'Polygon', coordinates: [[[7.490, 6.440], [7.500, 6.440], [7.500, 6.450], [7.490, 6.450], [7.490, 6.440]]] }, areaHectares: 4.0, currentLandUse: PlotLandUse.AGROFORESTRY, landUseHistory: [{ year: 2022, landUse: PlotLandUse.DEGRADED }, { year: 2024, landUse: PlotLandUse.AGROFORESTRY }], plantingDensity: 380, verificationStatus: 'verified', baseline: { initialSoilCarbonContent: 32.5, existingTreeCount: 0, historicalLandUse: PlotLandUse.DEGRADED, baselineBiomassCO2e: 0 } },
    { plotId: 'PLT-00000005', farmerId: 'FRM-00000005', name: 'Mendoza Coffee Forest', boundary: { type: 'Polygon', coordinates: [[[-90.370, 15.470], [-90.360, 15.470], [-90.360, 15.480], [-90.370, 15.480], [-90.370, 15.470]]] }, areaHectares: 5.0, currentLandUse: PlotLandUse.AGROFORESTRY, landUseHistory: [{ year: 2018, landUse: PlotLandUse.FOREST }, { year: 2024, landUse: PlotLandUse.AGROFORESTRY }], plantingDensity: 500, verificationStatus: 'verified', baseline: { initialSoilCarbonContent: 65.0, existingTreeCount: 150, historicalLandUse: PlotLandUse.FOREST, baselineBiomassCO2e: 120.5 } },
  ];

  const plotsWithProject = plotsData.map(p => ({ ...p, projectId }));
  const plots = await FarmPlot.insertMany(plotsWithProject);
  console.log(`✅ ${plots.length} farm plots seeded`);

  // Create trees
  const treesData = [
    { treeId: 'TRE-00000001', plotId: 'PLT-00000001', farmerId: 'FRM-00000001', coordinates: { type: 'Point', coordinates: [76.898, 12.298] }, speciesScientific: 'Tectona grandis', family: 'Lamiaceae', genus: 'Tectona', species: 'grandis', dbhCm: 15.5, heightM: 8.2, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2022-06-15'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000002', plotId: 'PLT-00000001', farmerId: 'FRM-00000001', coordinates: { type: 'Point', coordinates: [76.899, 12.299] }, speciesScientific: 'Azadirachta indica', family: 'Meliaceae', genus: 'Azadirachta', species: 'indica', dbhCm: 20.0, heightM: 10.5, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2021-07-20'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000003', plotId: 'PLT-00000001', farmerId: 'FRM-00000001', coordinates: { type: 'Point', coordinates: [76.900, 12.300] }, speciesScientific: 'Mangifera indica', family: 'Anacardiaceae', genus: 'Mangifera', species: 'indica', dbhCm: 25.0, heightM: 12.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2020-08-10'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000004', plotId: 'PLT-00000001', farmerId: 'FRM-00000001', coordinates: { type: 'Point', coordinates: [76.901, 12.301] }, speciesScientific: 'Leucaena leucocephala', family: 'Fabaceae', genus: 'Leucaena', species: 'leucocephala', dbhCm: 12.0, heightM: 7.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2023-03-15'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000005', plotId: 'PLT-00000002', farmerId: 'FRM-00000001', coordinates: { type: 'Point', coordinates: [76.900, 12.288] }, speciesScientific: 'Dalbergia sissoo', family: 'Fabaceae', genus: 'Dalbergia', species: 'sissoo', dbhCm: 18.0, heightM: 9.5, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2022-05-10'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000006', plotId: 'PLT-00000003', farmerId: 'FRM-00000002', coordinates: { type: 'Point', coordinates: [75.585, 14.454] }, speciesScientific: 'Cocos nucifera', family: 'Arecaceae', genus: 'Cocos', species: 'nucifera', dbhCm: 30.0, heightM: 15.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2019-09-20'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000007', plotId: 'PLT-00000003', farmerId: 'FRM-00000002', coordinates: { type: 'Point', coordinates: [75.586, 14.455] }, speciesScientific: 'Psidium guajava', family: 'Myrtaceae', genus: 'Psidium', species: 'guajava', dbhCm: 10.0, heightM: 5.0, conditionStatus: TreeCondition.STRESSED, plantingDate: new Date('2023-01-10'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000008', plotId: 'PLT-00000004', farmerId: 'FRM-00000003', coordinates: { type: 'Point', coordinates: [7.495, 6.445] }, speciesScientific: 'Acacia mangium', family: 'Fabaceae', genus: 'Acacia', species: 'mangium', dbhCm: 22.0, heightM: 11.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2022-04-05'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000009', plotId: 'PLT-00000004', farmerId: 'FRM-00000003', coordinates: { type: 'Point', coordinates: [7.496, 6.446] }, speciesScientific: 'Gliricidia sepium', family: 'Fabaceae', genus: 'Gliricidia', species: 'sepium', dbhCm: 8.0, heightM: 4.5, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2023-06-20'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000010', plotId: 'PLT-00000004', farmerId: 'FRM-00000003', coordinates: { type: 'Point', coordinates: [7.497, 6.447] }, speciesScientific: 'Terminalia arjuna', family: 'Combretaceae', genus: 'Terminalia', species: 'arjuna', dbhCm: 16.0, heightM: 8.0, conditionStatus: TreeCondition.DEAD, plantingDate: new Date('2022-03-10'), mortalityDate: new Date('2024-11-01'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000011', plotId: 'PLT-00000005', farmerId: 'FRM-00000005', coordinates: { type: 'Point', coordinates: [-90.365, 15.475] }, speciesScientific: 'Coffea arabica', family: 'Rubiaceae', genus: 'Coffea', species: 'arabica', dbhCm: 5.0, heightM: 3.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2021-02-15'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000012', plotId: 'PLT-00000005', farmerId: 'FRM-00000005', coordinates: { type: 'Point', coordinates: [-90.364, 15.474] }, speciesScientific: 'Swietenia macrophylla', family: 'Meliaceae', genus: 'Swietenia', species: 'macrophylla', dbhCm: 28.0, heightM: 14.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2020-05-20'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000013', plotId: 'PLT-00000005', farmerId: 'FRM-00000005', coordinates: { type: 'Point', coordinates: [-90.363, 15.473] }, speciesScientific: 'Citrus sinensis', family: 'Rutaceae', genus: 'Citrus', species: 'sinensis', dbhCm: 8.0, heightM: 4.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2023-04-10'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000014', plotId: 'PLT-00000002', farmerId: 'FRM-00000001', coordinates: { type: 'Point', coordinates: [76.901, 12.289] }, speciesScientific: 'Eucalyptus grandis', family: 'Myrtaceae', genus: 'Eucalyptus', species: 'grandis', dbhCm: 14.0, heightM: 12.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2023-01-25'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000015', plotId: 'PLT-00000003', farmerId: 'FRM-00000002', coordinates: { type: 'Point', coordinates: [75.587, 14.456] }, speciesScientific: 'Casuarina equisetifolia', family: 'Casuarinaceae', genus: 'Casuarina', species: 'equisetifolia', dbhCm: 11.0, heightM: 7.5, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2022-11-08'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000016', plotId: 'PLT-00000001', farmerId: 'FRM-00000001', coordinates: { type: 'Point', coordinates: [76.902, 12.302] }, speciesScientific: 'Shorea robusta', family: 'Dipterocarpaceae', genus: 'Shorea', species: 'robusta', dbhCm: 20.0, heightM: 10.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2021-06-30'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000017', plotId: 'PLT-00000004', farmerId: 'FRM-00000003', coordinates: { type: 'Point', coordinates: [7.498, 6.448] }, speciesScientific: 'Ficus religiosa', family: 'Moraceae', genus: 'Ficus', species: 'religiosa', dbhCm: 35.0, heightM: 18.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2019-12-01'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000018', plotId: 'PLT-00000005', farmerId: 'FRM-00000005', coordinates: { type: 'Point', coordinates: [-90.366, 15.476] }, speciesScientific: 'Artocarpus heterophyllus', family: 'Moraceae', genus: 'Artocarpus', species: 'heterophyllus', dbhCm: 22.0, heightM: 11.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2021-09-15'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000019', plotId: 'PLT-00000003', farmerId: 'FRM-00000002', coordinates: { type: 'Point', coordinates: [75.588, 14.457] }, speciesScientific: 'Sesbania grandiflora', family: 'Fabaceae', genus: 'Sesbania', species: 'grandiflora', dbhCm: 6.0, heightM: 4.0, conditionStatus: TreeCondition.REPLANTED, plantingDate: new Date('2024-02-20'), measuredBy: 'USR-ENUM-001' },
    { treeId: 'TRE-00000020', plotId: 'PLT-00000002', farmerId: 'FRM-00000001', coordinates: { type: 'Point', coordinates: [76.902, 12.290] }, speciesScientific: 'Millingtonia hortensis', family: 'Bignoniaceae', genus: 'Millingtonia', species: 'hortensis', dbhCm: 10.0, heightM: 6.0, conditionStatus: TreeCondition.HEALTHY, plantingDate: new Date('2023-05-15'), measuredBy: 'USR-ENUM-001' },
  ];

  const treesWithProject = treesData.map(t => {
    const plot = plots.find(p => p.plotId === t.plotId);
    return { 
      ...t, 
      projectId,
      farmId: plot ? plot._id : new mongoose.Types.ObjectId() 
    };
  });
  const trees = await Tree.insertMany(treesWithProject);
  console.log(`✅ ${trees.length} trees seeded`);

  // Create activities
  const activitiesData = [
    { activityId: 'ACT-00000001', farmerId: 'FRM-00000001', plotId: 'PLT-00000001', type: ActivityType.PLANTING, description: 'Planted 50 Tectona grandis saplings in North Plot', timestamp: new Date('2024-06-15'), performedBy: 'USR-ENUM-001' },
    { activityId: 'ACT-00000002', farmerId: 'FRM-00000001', plotId: 'PLT-00000001', type: ActivityType.MAINTENANCE, description: 'Weeding and mulching around established trees', timestamp: new Date('2024-09-20'), performedBy: 'USR-ENUM-001' },
    { activityId: 'ACT-00000003', farmerId: 'FRM-00000002', plotId: 'PLT-00000003', type: ActivityType.PLANTING, description: 'Planted 30 mixed species including Coconut and Guava', timestamp: new Date('2024-07-10'), performedBy: 'USR-ENUM-001' },
    { activityId: 'ACT-00000004', farmerId: 'FRM-00000003', plotId: 'PLT-00000004', type: ActivityType.MONITORING, description: 'Quarterly monitoring visit - measured DBH and height', timestamp: new Date('2024-10-05'), performedBy: 'USR-ENUM-001' },
    { activityId: 'ACT-00000005', farmerId: 'FRM-00000003', plotId: 'PLT-00000004', treeId: 'TRE-00000010', type: ActivityType.REPLANTING, description: 'Replaced dead Terminalia arjuna with new sapling', timestamp: new Date('2024-12-01'), performedBy: 'USR-ENUM-001' },
    { activityId: 'ACT-00000006', farmerId: 'FRM-00000005', plotId: 'PLT-00000005', type: ActivityType.PEST_CONTROL, description: 'Organic pest management for coffee plants', timestamp: new Date('2024-08-15'), performedBy: 'USR-ENUM-001' },
    { activityId: 'ACT-00000007', farmerId: 'FRM-00000001', plotId: 'PLT-00000002', type: ActivityType.IRRIGATION, description: 'Drip irrigation system maintenance', timestamp: new Date('2024-11-10'), performedBy: 'USR-ENUM-001' },
    { activityId: 'ACT-00000008', farmerId: 'FRM-00000002', plotId: 'PLT-00000003', type: ActivityType.PRUNING, description: 'Pruning mature coconut palms', timestamp: new Date('2024-12-20'), performedBy: 'USR-ENUM-001' },
  ];

  const activitiesWithProject = activitiesData.map(a => ({ ...a, projectId }));
  const activities = await Activity.insertMany(activitiesWithProject);
  console.log(`✅ ${activities.length} activities seeded`);

  console.log('\n🎉 Seed completed successfully!');
  console.log(`   Farmers: ${farmers.length}`);
  console.log(`   Plots: ${plots.length}`);
  console.log(`   Trees: ${trees.length}`);
  console.log(`   Activities: ${activities.length}`);
  console.log('🎉 Auto-seed completed successfully!');
  if (mongoose.connection.readyState !== 0) {
     // No-op if called from index.ts, which maintains the connection
  }
}
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seed finished');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
