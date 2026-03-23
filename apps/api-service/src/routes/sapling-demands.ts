import { Router, Request, Response } from 'express';
import { SaplingDemand } from '../models/SaplingDemand';

const router = Router();

// GET /api/sapling-demands?projectId=...
router.get('/', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId is required' });
      return;
    }
    const demands = await SaplingDemand.find({ projectId }).sort({ createdAt: -1 });
    res.json({ data: demands });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sapling-demands
router.post('/', async (req: Request, res: Response) => {
  try {
    const demand = new SaplingDemand(req.body);
    await demand.save();
    res.status(201).json({ data: demand });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/sapling-demands/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const demand = await SaplingDemand.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!demand) {
      res.status(404).json({ error: 'Demand not found' });
      return;
    }
    res.json({ data: demand });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sapling-demands/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const demand = await SaplingDemand.findByIdAndDelete(req.params.id);
    if (!demand) {
      res.status(404).json({ error: 'Demand not found' });
      return;
    }
    res.json({ message: 'Demand deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
