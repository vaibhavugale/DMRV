import { Router, Request, Response } from 'express';
import { Tree } from '../models/Tree';
import { calculateTreeCarbonBySpecies } from '@dmrv/core-logic';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/trees
router.get('/', async (req: Request, res: Response) => {
  try {
    const { plotId, farmerId, species, condition, page = '1', limit = '20', projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const query: any = { projectId };

    if (plotId) query.plotId = plotId;
    if (farmerId) query.farmerId = farmerId;
    if (species) query.speciesScientific = { $regex: species, $options: 'i' };
    if (condition) query.conditionStatus = condition;

    const skip = (Number(page) - 1) * Number(limit);
    const [trees, total] = await Promise.all([
      Tree.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Tree.countDocuments(query),
    ]);

    res.json({
      data: trees,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trees/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const tree = await Tree.findOne({ treeId: req.params.id, projectId });
    if (!tree) {
      res.status(404).json({ error: 'Tree not found.' });
      return;
    }

    // Calculate carbon for this tree
    const carbonResult = calculateTreeCarbonBySpecies(
      tree.dbhCm,
      tree.heightM,
      tree.speciesScientific
    );

    res.json({
      data: tree,
      carbon: carbonResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trees
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.body.projectId) {
      res.status(400).json({ error: 'projectId is required in the request body.' });
      return;
    }
    const treeData = {
      ...req.body,
      treeId: req.body.treeId || `TRE-${uuidv4().substring(0, 8).toUpperCase()}`,
    };

    // Calculate carbon at creation
    const carbonResult = calculateTreeCarbonBySpecies(
      treeData.dbhCm,
      treeData.heightM,
      treeData.speciesScientific
    );

    if (carbonResult) {
      treeData.carbonSequestered = carbonResult.co2EquivalentTonnes;
    }

    const tree = new Tree(treeData);
    await tree.save();

    res.status(201).json({
      data: tree,
      carbon: carbonResult,
      message: 'Tree recorded successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/trees/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }

    // Recalculate carbon if measurements changed
    if (req.body.dbhCm || req.body.heightM) {
      const existing = await Tree.findOne({ treeId: req.params.id, projectId });
      if (existing) {
        const dbh = req.body.dbhCm || existing.dbhCm;
        const height = req.body.heightM || existing.heightM;
        const species = req.body.speciesScientific || existing.speciesScientific;
        const carbonResult = calculateTreeCarbonBySpecies(dbh, height, species);
        if (carbonResult) {
          req.body.carbonSequestered = carbonResult.co2EquivalentTonnes;
        }
      }
    }

    const tree = await Tree.findOneAndUpdate(
      { treeId: req.params.id, projectId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!tree) {
      res.status(404).json({ error: 'Tree not found.' });
      return;
    }
    res.json({ data: tree, message: 'Tree updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/trees/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const tree = await Tree.findOneAndDelete({ treeId: req.params.id, projectId });
    if (!tree) {
      res.status(404).json({ error: 'Tree not found.' });
      return;
    }
    res.json({ message: 'Tree deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
