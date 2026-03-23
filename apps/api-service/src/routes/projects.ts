import { Router, Request, Response } from 'express';
import { Project } from '../models/Project';
import { Tree } from '../models/Tree';
import { Activity } from '../models/Activity';
import { FarmPlot } from '../models/FarmPlot';

const router = Router();

// GET /api/projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ data: projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json({ data: project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/projects
router.post('/', async (req: Request, res: Response) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({ data: project, message: 'Project created successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json({ data: project, message: 'Project updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/projects/:id/lca
router.get('/:id/lca', async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    
    if (!project) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    // 1. Calculate Gross Carbon Sequestered (Gains)
    const totalCarbonAgg = await Tree.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: null, total: { $sum: '$carbonSequestered' } } },
    ]);
    const grossGains = totalCarbonAgg[0]?.total || 0;

    // 2. Calculate Project Emissions (Losses)
    // We assume Activity type 'Fertilizer Application' and 'Transportation' emit CO2e.
    const emissionsAgg = await Activity.aggregate([
      { 
        $match: { 
          projectId: project._id,
          type: { $in: ['Fertilizer Application', 'Transportation'] }
        } 
      },
      // Simplified emission factor mapping for demonstration
      // Assume "Fertilizer Application" has an input named "Fertilizer" with a quantity
      { $unwind: { path: '$inputs', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          emissions: {
            $cond: [
              { $eq: ['$type', 'Fertilizer Application'] },
              { $multiply: [{ $ifNull: ['$inputs.quantity', 0] }, project.lcaSettings?.fertilizerEmissionsFactorCO2ePerKg || 2.5] },
              50 // Flat 50 kg CO2e per transport log
            ]
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$emissions' } } }
    ]);
    
    // Emissions might be tracked in kg, divide by 1000 for tonnes
    const totalLosses = (emissionsAgg[0]?.total || 0) / 1000;

    // 3. Baseline emissions aggregator
    // Calculate the sum of baselineBiomassCO2e for all plots in this project
    const plotBaselineAgg = await FarmPlot.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: null, total: { $sum: '$baseline.baselineBiomassCO2e' } } }
    ]);
    const totalBaselineBiomass = plotBaselineAgg[0]?.total || 0;
    
    // 4. Net Carbon Impact = (Gross Gains - Total Baseline) - Project Emissions
    const netImpact = grossGains - totalBaselineBiomass - totalLosses;

    res.json({
      data: {
        projectId,
        projectName: project.name,
        grossGains,
        totalLosses,
        baselineEmissions: totalBaselineBiomass,
        netImpact
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
