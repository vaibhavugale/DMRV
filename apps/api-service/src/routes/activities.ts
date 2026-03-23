import { Router, Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/activities
router.get('/', async (req: Request, res: Response) => {
  try {
    const { farmerId, plotId, type, page = '1', limit = '20', projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required.' });
      return;
    }
    const query: any = { projectId };

    if (farmerId) query.farmerId = farmerId;
    if (plotId) query.plotId = plotId;
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      Activity.find(query).skip(skip).limit(Number(limit)).sort({ timestamp: -1 }),
      Activity.countDocuments(query),
    ]);

    res.json({
      data: activities,
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

// POST /api/activities
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.body.projectId) {
      res.status(400).json({ error: 'projectId is required in the request body.' });
      return;
    }
    const activity = new Activity({
      ...req.body,
      activityId: req.body.activityId || `ACT-${uuidv4().substring(0, 8).toUpperCase()}`,
    });
    await activity.save();
    res.status(201).json({ data: activity, message: 'Activity recorded successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
