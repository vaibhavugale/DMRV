import { Router, Request, Response } from 'express';
import { Tree } from '../models/Tree';
import { FarmPlot } from '../models/FarmPlot';
import { Farmer } from '../models/Farmer';
import { Activity } from '../models/Activity';
import mongoose from 'mongoose';
import { calculateTreeCarbonBySpecies, calculateNetCredits } from '../shared/core-logic';
import { TreeCondition } from '../shared/constants';

const router = Router();

// GET /api/reports/dashboard-stats — KPI aggregations for dashboard
router.get('/dashboard-stats', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }

    const objProjectId = new mongoose.Types.ObjectId(projectId as string);

    const [totalFarmers, totalPlots, totalTrees, totalActivities] = await Promise.all([
      Farmer.countDocuments({ projectId }),
      FarmPlot.countDocuments({ projectId }),
      Tree.countDocuments({ projectId }),
      Activity.countDocuments({ projectId }),
    ]);

    const totalArea = await FarmPlot.aggregate([
      { $match: { projectId: objProjectId } },
      { $group: { _id: null, total: { $sum: '$areaHectares' } } },
    ]);

    const treesByCondition = await Tree.aggregate([
      { $match: { projectId: objProjectId } },
      { $group: { _id: '$conditionStatus', count: { $sum: 1 } } },
    ]);

    const treesBySpecies = await Tree.aggregate([
      { $match: { projectId: objProjectId } },
      { $group: { _id: '$speciesScientific', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const totalCarbonAgg = await Tree.aggregate([
      { $match: { projectId: objProjectId } },
      { $group: { _id: null, total: { $sum: '$carbonSequestered' } } },
    ]);

    const recentActivities = await Activity.find({ projectId })
      .sort({ timestamp: -1 })
      .limit(10)
      .select('activityId type description timestamp performedBy');

    res.json({
      data: {
        kpis: {
          totalFarmers,
          totalPlots,
          totalTrees,
          totalActivities,
          totalAreaHectares: totalArea[0]?.total || 0,
          totalCarbonTonnes: totalCarbonAgg[0]?.total || 0,
          healthyTrees: treesByCondition.find((t: any) => t._id === TreeCondition.HEALTHY)?.count || 0,
          mortalityRate: totalTrees > 0
            ? ((treesByCondition.find((t: any) => t._id === TreeCondition.DEAD)?.count || 0) / totalTrees * 100).toFixed(2)
            : 0,
        },
        treesByCondition,
        treesBySpecies,
        recentActivities,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/vcs-monitoring — Generate VCS monitoring report JSON
router.get('/vcs-monitoring', async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd, projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }

    const start = periodStart ? new Date(periodStart as string) : new Date('2020-01-01');
    const end = periodEnd ? new Date(periodEnd as string) : new Date();

    // Fetch all trees planted within the verification period
    const trees = await Tree.find({
      plantingDate: { $gte: start, $lte: end },
      projectId,
    });

    const plots = await FarmPlot.find({ projectId });
    const farmers = await Farmer.find({ projectId });

    // Calculate total carbon
    let totalCO2eTonnes = 0;
    const treeResults: any[] = [];

    for (const tree of trees) {
      const result = calculateTreeCarbonBySpecies(
        tree.dbhCm,
        tree.heightM,
        tree.speciesScientific
      );
      if (result) {
        totalCO2eTonnes += result.co2EquivalentTonnes;
        treeResults.push({
          treeId: tree.treeId,
          species: tree.speciesScientific,
          dbhCm: tree.dbhCm,
          heightM: tree.heightM,
          co2eTonnes: result.co2EquivalentTonnes,
        });
      }
    }

    const totalArea = plots.reduce((sum, p) => sum + p.areaHectares, 0);
    const bufferPercentage = 15; // Default non-permanence buffer
    const leakageDeduction = 5;  // Default leakage deduction
    const netCredits = calculateNetCredits(totalCO2eTonnes, bufferPercentage, leakageDeduction);

    const report = {
      reportId: `VCS-RPT-${Date.now()}`,
      projectName: 'Agroforestry DMRV Project',
      standard: 'Verra VCS',
      methodology: 'VM0047 - Afforestation, Reforestation, and Revegetation (ARR)',
      verificationPeriod: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      summary: {
        totalFarmers: farmers.length,
        totalPlots: plots.length,
        totalTrees: trees.length,
        totalAreaHectares: Math.round(totalArea * 100) / 100,
        grossCO2eTonnes: Math.round(totalCO2eTonnes * 100) / 100,
        leakageDeductionPercent: leakageDeduction,
        nonPermanenceBufferPercent: bufferPercentage,
        netCreditsTonnes: netCredits,
      },
      leakageAssessment: {
        leakageRiskIdentified: false,
        mitigationMeasures: [
          'Activity-shifting leakage monitored via satellite',
          'Market leakage assessed as negligible for ARR',
        ],
        deduction: leakageDeduction,
      },
      nonPermanenceRisk: {
        internalRisk: 5,
        externalRisk: 5,
        naturalRisk: 5,
        totalBuffer: bufferPercentage,
      },
      treeInventorySample: treeResults.slice(0, 20),
      generatedAt: new Date().toISOString(),
    };

    res.json({ data: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
