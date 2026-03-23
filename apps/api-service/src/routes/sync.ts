import { Router, Request, Response } from 'express';

const router = Router();

interface SyncPayload {
  type: 'farmer' | 'plot' | 'tree' | 'activity';
  data: any;
  localTimestamp: string;
  deviceId: string;
}

// POST /api/sync — Offline-first sync endpoint with conflict resolution
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).json({ error: 'projectId query parameter is required for syncing.' });
      return;
    }

    const items: SyncPayload[] = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'No items to sync.' });
      return;
    }

    const results: { index: number; status: string; id?: string; error?: string }[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        // Dynamic import based on type
        let Model: any;
        let idField: string;

        switch (item.type) {
          case 'farmer':
            Model = (await import('../models/Farmer')).Farmer;
            idField = 'farmerId';
            break;
          case 'plot':
            Model = (await import('../models/FarmPlot')).FarmPlot;
            idField = 'plotId';
            break;
          case 'tree':
            Model = (await import('../models/Tree')).Tree;
            idField = 'treeId';
            break;
          case 'activity':
            Model = (await import('../models/Activity')).Activity;
            idField = 'activityId';
            break;
          default:
            results.push({ index: i, status: 'error', error: `Unknown type: ${item.type}` });
            continue;
        }

        const existingId = item.data[idField];
        const existing = existingId ? await Model.findOne({ [idField]: existingId, projectId }) : null;

        if (existing) {
          // Conflict check: compare timestamps
          const localTime = new Date(item.localTimestamp).getTime();
          const serverTime = new Date(existing.updatedAt).getTime();

          if (localTime < serverTime) {
            // Server is newer — conflict
            results.push({
              index: i,
              status: 'conflict',
              id: existingId,
              error: 'Server version is newer. Use GET to retrieve latest.',
            });
          } else {
            // Local is newer — update
            await Model.findOneAndUpdate(
              { [idField]: existingId, projectId },
              { $set: item.data },
              { runValidators: true }
            );
            results.push({ index: i, status: 'updated', id: existingId });
          }
        } else {
          // New record — create
          if (!item.data.projectId) {
            item.data.projectId = projectId;
          }
          const doc = new Model(item.data);
          await doc.save();
          results.push({ index: i, status: 'created', id: item.data[idField] });
        }
      } catch (err: any) {
        results.push({ index: i, status: 'error', error: err.message });
      }
    }

    const hasConflicts = results.some((r) => r.status === 'conflict');
    res.status(hasConflicts ? 209 : 200).json({
      message: `Synced ${results.filter((r) => r.status !== 'error').length}/${items.length} items.`,
      results,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
