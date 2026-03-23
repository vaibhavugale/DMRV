import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUser, ISyncPayload } from '../types';

// ─── Keys ────────────────────────────────────────────

const KEYS = {
  AUTH_TOKEN: '@dmrv:auth_token',
  USER: '@dmrv:user',
  ACTIVE_PROJECT_ID: '@dmrv:active_project_id',
  SYNC_QUEUE: '@dmrv:sync_queue',
  DEVICE_ID: '@dmrv:device_id',
  CACHED_FARMERS: '@dmrv:cached_farmers',
  CACHED_PLOTS: '@dmrv:cached_plots',
  CACHED_TREES: '@dmrv:cached_trees',
  CACHED_ACTIVITIES: '@dmrv:cached_activities',
} as const;

// ─── Auth ────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.AUTH_TOKEN);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
}

export async function getUser(): Promise<IUser | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export async function setUser(user: IUser): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.USER]);
}

// ─── Active Project ──────────────────────────────────

export async function getActiveProjectId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.ACTIVE_PROJECT_ID);
}

export async function setActiveProjectId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.ACTIVE_PROJECT_ID, id);
}

// ─── Device ID ───────────────────────────────────────

export async function getDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(KEYS.DEVICE_ID);
  if (!id) {
    id = 'DEV-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    await AsyncStorage.setItem(KEYS.DEVICE_ID, id);
  }
  return id;
}

// ─── Sync Queue ──────────────────────────────────────

export async function getSyncQueue(): Promise<ISyncPayload[]> {
  const raw = await AsyncStorage.getItem(KEYS.SYNC_QUEUE);
  return raw ? JSON.parse(raw) : [];
}

export async function addToSyncQueue(item: ISyncPayload): Promise<void> {
  const queue = await getSyncQueue();
  queue.push(item);
  await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
}

export async function clearSyncQueue(): Promise<void> {
  await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify([]));
}

export async function setSyncQueue(queue: ISyncPayload[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
}

// ─── Data Cache ──────────────────────────────────────

export async function getCachedData<T>(type: 'farmers' | 'plots' | 'trees' | 'activities'): Promise<T[]> {
  const keyMap = {
    farmers: KEYS.CACHED_FARMERS,
    plots: KEYS.CACHED_PLOTS,
    trees: KEYS.CACHED_TREES,
    activities: KEYS.CACHED_ACTIVITIES,
  };
  const raw = await AsyncStorage.getItem(keyMap[type]);
  return raw ? JSON.parse(raw) : [];
}

export async function setCachedData<T>(type: 'farmers' | 'plots' | 'trees' | 'activities', data: T[]): Promise<void> {
  const keyMap = {
    farmers: KEYS.CACHED_FARMERS,
    plots: KEYS.CACHED_PLOTS,
    trees: KEYS.CACHED_TREES,
    activities: KEYS.CACHED_ACTIVITIES,
  };
  await AsyncStorage.setItem(keyMap[type], JSON.stringify(data));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.clear();
}
