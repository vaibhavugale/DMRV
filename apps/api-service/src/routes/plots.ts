import { Router, Request, Response } from 'express';
import { FarmPlot } from '../models/FarmPlot';
import { Tree } from '../models/Tree';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/plots
router.get('/', async (req: Request, res: Response) => {
  try {
    const { farmerId, status, page = '1', limit = '20', projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const query: any = { projectId };

    if (farmerId) query.farmerId = farmerId;
    if (status) query.verificationStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [plots, total] = await Promise.all([
      FarmPlot.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      FarmPlot.countDocuments(query),
    ]);

    res.json({
      data: plots,
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

// GET /api/plots/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const plot = await FarmPlot.findOne({ plotId: req.params.id, projectId });
    if (!plot) {
      res.status(404).json({ error: 'Plot not found.' });
      return;
    }
    res.json({ data: plot });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/plots/:id/trees - Get trees within a specific plot
router.get('/:id/trees', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const trees = await Tree.find({ plotId: req.params.id, projectId }).sort({ createdAt: -1 });
    res.json({ data: trees, total: trees.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/plots
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.body.projectId) {
      res.status(400).json({ error: 'projectId is required in the request body.' });
      return;
    }
    const plot = new FarmPlot({
      ...req.body,
      plotId: req.body.plotId || `PLT-${uuidv4().substring(0, 8).toUpperCase()}`,
    });
    await plot.save();
    res.status(201).json({ data: plot, message: 'Farm plot created successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/plots/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const plot = await FarmPlot.findOneAndUpdate(
      { plotId: req.params.id, projectId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!plot) {
      res.status(404).json({ error: 'Plot not found.' });
      return;
    }
    res.json({ data: plot, message: 'Plot updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/plots/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const plot = await FarmPlot.findOneAndDelete({ plotId: req.params.id, projectId });
    if (!plot) {
      res.status(404).json({ error: 'Plot not found.' });
      return;
    }
    res.json({ message: 'Plot deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
