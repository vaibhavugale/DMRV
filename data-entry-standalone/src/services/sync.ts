import NetInfo from '@react-native-community/netinfo';
import { api } from './api';
import {
  getSyncQueue,
  clearSyncQueue,
  setSyncQueue,
  getActiveProjectId,
  getDeviceId,
  addToSyncQueue,
} from './storage';
import { ISyncPayload, SyncStatus } from '../types';

// ─── Sync Service ────────────────────────────────────

export interface SyncResult {
  total: number;
  synced: number;
  conflicts: number;
  failed: number;
}

/**
 * Queue a data mutation for sync. If online, flushes immediately.
 */
export async function queueForSync(
  type: ISyncPayload['type'],
  data: any
): Promise<void> {
  const deviceId = await getDeviceId();
  const payload: ISyncPayload = {
    type,
    data,
    localTimestamp: new Date().toISOString(),
    deviceId,
  };

  await addToSyncQueue(payload);

  // Attempt immediate sync if online
  const state = await NetInfo.fetch();
  if (state.isConnected) {
    await flushSyncQueue();
  }
}

/**
 * Flush all pending items in the sync queue to the server.
 */
export async function flushSyncQueue(): Promise<SyncResult> {
  const queue = await getSyncQueue();
  const result: SyncResult = { total: queue.length, synced: 0, conflicts: 0, failed: 0 };

  if (queue.length === 0) return result;

  const projectId = await getActiveProjectId();
  if (!projectId) {
    throw new Error('No active project selected for sync.');
  }

  try {
    const response = await api.post(
      '/sync',
      { items: queue },
      { params: { projectId }, skipProjectScope: true }
    );

    const results = response.results || [];
    const failedItems: ISyncPayload[] = [];

    results.forEach((r: any, index: number) => {
      switch (r.status) {
        case 'created':
        case 'updated':
          result.synced++;
          break;
        case 'conflict':
          result.conflicts++;
          failedItems.push(queue[index]);
          break;
        default:
          result.failed++;
          failedItems.push(queue[index]);
      }
    });

    // Keep only failed/conflicted items in the queue
    if (failedItems.length > 0) {
      await setSyncQueue(failedItems);
    } else {
      await clearSyncQueue();
    }
  } catch (error) {
    result.failed = queue.length;
    // Keep items in queue for retry
  }

  return result;
}

/**
 * Get current sync queue length (pending items count).
 */
export async function getPendingCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}

/**
 * Start a background listener that auto-syncs when connectivity resumes.
 * Returns an unsubscribe function.
 */
export function startAutoSync(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      flushSyncQueue().catch(console.warn);
    }
  });

  return unsubscribe;
}
