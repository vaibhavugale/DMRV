import { Router, Request, Response } from 'express';
import { Farmer } from '../models/Farmer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/farmers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search, page = '1', limit = '20', projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const query: any = { projectId };

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { farmerId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [farmers, total] = await Promise.all([
      Farmer.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Farmer.countDocuments(query),
    ]);

    res.json({
      data: farmers,
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

// GET /api/farmers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const farmer = await Farmer.findOne({ farmerId: req.params.id, projectId });
    if (!farmer) {
      res.status(404).json({ error: 'Farmer not found.' });
      return;
    }
    res.json({ data: farmer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/farmers
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.body.projectId) {
      res.status(400).json({ error: 'projectId is required in the request body.' });
      return;
    }
    const farmer = new Farmer({
      ...req.body,
      farmerId: req.body.farmerId || `FRM-${uuidv4().substring(0, 8).toUpperCase()}`,
    });
    await farmer.save();
    res.status(201).json({ data: farmer, message: 'Farmer registered successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/farmers/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const farmer = await Farmer.findOneAndUpdate(
      { farmerId: req.params.id, projectId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!farmer) {
      res.status(404).json({ error: 'Farmer not found.' });
      return;
    }
    res.json({ data: farmer, message: 'Farmer updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/farmers/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const farmer = await Farmer.findOneAndDelete({ farmerId: req.params.id, projectId });
    if (!farmer) {
      res.status(404).json({ error: 'Farmer not found.' });
      return;
    }
    res.json({ message: 'Farmer deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
