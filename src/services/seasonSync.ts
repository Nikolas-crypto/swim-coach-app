import { 
  doc, 
  onSnapshot, 
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { SeasonPlan } from '../types/swim';
import { INITIAL_SEASON } from '../data/seedData';
import { normalizeSeason } from '../utils/normalizeSeason';

export const ACTIVE_SEASON_DOC_ID = 'active_season';
export const STORAGE_KEY_SEASON = 'swim_coach_season_v2';
export const STORAGE_KEY_BACKUP = 'swim_coach_season_backup_v1';

export type SyncStatus = 'connected' | 'saving' | 'synced' | 'offline' | 'error';

// Unique client identifier for this tab session to distinguish local echoing writes from remote collaborators
let cachedClientId: string = '';
export function getClientId(): string {
  if (!cachedClientId) {
    cachedClientId = 'client_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  }
  return cachedClientId;
}

/**
 * Deep sanitization function for Firestore payloads.
 * Firestore strictly rejects documents that contain any field with value `undefined`, throwing:
 * "Function setDoc() called with invalid data. Unsupported field value: undefined"
 * This converts undefined properties into omissions/null and prevents runtime crashes.
 */
export function sanitizeForFirestore<T>(data: T): T {
  const jsonStr = JSON.stringify(data, (_, value) => {
    if (typeof value === 'number' && isNaN(value)) {
      return 0;
    }
    return value;
  });
  return JSON.parse(jsonStr);
}

// In-memory reference for debouncing and immediate page-unload flushing
let pendingSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let latestPendingSeason: SeasonPlan | null = null;
let onStatusChangeCallback: ((status: SyncStatus, lastSaved?: Date) => void) | null = null;

/**
 * Immediately dispatches any pending debounced save directly to Firestore.
 * Critical for preventing data loss when a coach edits and immediately closes the tab or switches apps.
 */
export async function flushPendingSeasonSave(): Promise<void> {
  if (pendingSaveTimeout) {
    clearTimeout(pendingSaveTimeout);
    pendingSaveTimeout = null;
  }

  if (!latestPendingSeason) return;

  const toSave = latestPendingSeason;
  latestPendingSeason = null;

  try {
    const seasonDocRef = doc(db, 'seasons', ACTIVE_SEASON_DOC_ID);
    const payload = sanitizeForFirestore({
      ...toSave,
      id: ACTIVE_SEASON_DOC_ID,
      updatedAt: toSave.updatedAt || new Date().toISOString(),
      lastClientId: getClientId(),
      updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach',
    });

    await setDoc(seasonDocRef, payload);

    if (onStatusChangeCallback) {
      onStatusChangeCallback('synced', new Date());
    }
  } catch (err) {
    console.error('Failed to flush season save to Firestore:', err);
    if (onStatusChangeCallback) {
      onStatusChangeCallback('error');
    }
  }
}

// Register browser lifecycle events to flush pending saves automatically before unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushPendingSeasonSave();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingSeasonSave();
    }
  });
}

let lastBackupTimestamp = 0;
async function saveBackupSnapshot(payload: SeasonPlan) {
  const now = Date.now();
  if (now - lastBackupTimestamp < 30000) return; // throttle backups to 1 per 30s
  lastBackupTimestamp = now;
  try {
    const backupId = `backup_${now}`;
    const backupDocRef = doc(db, 'season_backups', backupId);
    await setDoc(backupDocRef, payload);
  } catch (e) {
    console.warn('Non-blocking backup note:', e);
  }
}

/**
 * Force an immediate, non-debounced persistence to Firestore with full error handling.
 */
export async function forceSyncSeasonNow(
  season: SeasonPlan,
  onStatusChange?: (status: SyncStatus, lastSaved?: Date) => void
): Promise<void> {
  if (pendingSaveTimeout) {
    clearTimeout(pendingSaveTimeout);
    pendingSaveTimeout = null;
  }
  latestPendingSeason = null;

  if (onStatusChange) onStatusChange('saving');

  try {
    const seasonDocRef = doc(db, 'seasons', ACTIVE_SEASON_DOC_ID);
    const withTimestamp: SeasonPlan = {
      ...season,
      id: ACTIVE_SEASON_DOC_ID,
      updatedAt: new Date().toISOString(),
      lastClientId: getClientId(),
      updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach',
    };

    const payload = sanitizeForFirestore(withTimestamp);
    await setDoc(seasonDocRef, payload);

    // Save rolling backup snapshot to protect squad against accidental overwrites
    await saveBackupSnapshot(payload);

    // Keep persistent local backup
    try {
      localStorage.setItem(STORAGE_KEY_BACKUP, JSON.stringify(withTimestamp));
    } catch {
      // cache update
    }

    if (onStatusChange) onStatusChange('synced', new Date());
  } catch (err) {
    console.error('Force sync to Firestore failed:', err);
    if (onStatusChange) onStatusChange('error');
    try {
      handleFirestoreError(err, OperationType.WRITE, `seasons/${ACTIVE_SEASON_DOC_ID}`);
    } catch {
      // Handled
    }
    throw err;
  }
}

/**
 * Persists updated season plan to Firestore so all users on any device see updates in real time.
 * Includes automatic 300ms debouncing to consolidate rapid keystrokes/edits into a clean write operation,
 * with immediate flush hooks on tab close, and undefined-sanitization.
 */
export async function persistSeasonToCloud(
  season: SeasonPlan,
  onStatusChange?: (status: SyncStatus, lastSaved?: Date) => void
): Promise<void> {
  latestPendingSeason = season;
  if (onStatusChange) {
    onStatusChangeCallback = onStatusChange;
    onStatusChange('saving');
  }

  return new Promise((resolve) => {
    if (pendingSaveTimeout) {
      clearTimeout(pendingSaveTimeout);
    }

    pendingSaveTimeout = setTimeout(async () => {
      pendingSaveTimeout = null;
      if (!latestPendingSeason) {
        resolve();
        return;
      }
      const toSave = latestPendingSeason;
      latestPendingSeason = null;

      const seasonDocRef = doc(db, 'seasons', ACTIVE_SEASON_DOC_ID);

      try {
        const payload = sanitizeForFirestore({
          ...toSave,
          id: ACTIVE_SEASON_DOC_ID,
          updatedAt: toSave.updatedAt || new Date().toISOString(),
          lastClientId: getClientId(),
          updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach',
        });

        await setDoc(seasonDocRef, payload);
        saveBackupSnapshot(payload);

        if (onStatusChange) onStatusChange('synced', new Date());
        resolve();
      } catch (err) {
        console.error('Failed to save season to Firestore:', err);
        if (onStatusChange) onStatusChange('error');
        try {
          handleFirestoreError(err, OperationType.WRITE, `seasons/${ACTIVE_SEASON_DOC_ID}`);
        } catch {
          // Handled and logged to console
        }
        resolve();
      }
    }, 300);
  });
}

/**
 * Subscribes to real-time season updates across all devices.
 * Firestore is the single authoritative source of truth.
 * Stale localStorage caches will NEVER clobber cloud data.
 */
export function subscribeToActiveSeason(
  onData: (season: SeasonPlan, isRemoteUpdate: boolean) => void,
  onStatusChange: (status: SyncStatus, lastSaved?: Date) => void
) {
  const seasonDocRef = doc(db, 'seasons', ACTIVE_SEASON_DOC_ID);

  const unsubscribe = onSnapshot(
    seasonDocRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const cloudSeason = normalizeSeason(snapshot.data());
        const myClientId = getClientId();

        // If local user is actively editing in this tab right now,
        // do not let incoming snapshot cancel their pending keystrokes
        if (latestPendingSeason) {
          return;
        }

        const isRemote = !snapshot.metadata.hasPendingWrites && cloudSeason.lastClientId !== myClientId;
        onData(cloudSeason, isRemote);
        onStatusChange('synced', new Date());
      } else {
        // Cloud document does not exist yet in fresh database.
        // Check if local storage already has user data so we DO NOT overwrite it with seed data!
        try {
          onStatusChange('saving');
          let baseSeason = INITIAL_SEASON;
          try {
            const raw = localStorage.getItem(STORAGE_KEY_SEASON);
            if (raw) {
              const parsed = normalizeSeason(JSON.parse(raw));
              if (parsed?.lanes && parsed.lanes.length > 0) {
                baseSeason = parsed;
              }
            }
          } catch {
            // Fallback to INITIAL_SEASON
          }

          const initialPayload: SeasonPlan = {
            ...baseSeason,
            id: ACTIVE_SEASON_DOC_ID,
            updatedAt: new Date().toISOString(),
            lastClientId: getClientId(),
            updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach',
          };

          const payload = sanitizeForFirestore(initialPayload);
          await setDoc(seasonDocRef, payload);
          onData(initialPayload, false);
          onStatusChange('synced', new Date());
        } catch (err) {
          console.error('Failed to initialize season in Firestore:', err);
          onStatusChange('error');
          try {
            handleFirestoreError(err, OperationType.WRITE, `seasons/${ACTIVE_SEASON_DOC_ID}`);
          } catch {
            // Handled
          }
        }
      }
    },
    (err) => {
      console.warn('Real-time season sync status:', err?.message || err);
      onStatusChange('error');
      try {
        handleFirestoreError(err, OperationType.GET, `seasons/${ACTIVE_SEASON_DOC_ID}`);
      } catch {
        // Handled
      }
    }
  );

  return unsubscribe;
}

export interface SeasonBackupSummary {
  id: string;
  timestamp: string;
  name: string;
  updatedBy: string;
  totalWeeks: number;
  lanesCount: number;
  seasonData: SeasonPlan;
}

export async function fetchSeasonBackups(maxResults = 10): Promise<SeasonBackupSummary[]> {
  try {
    const backupsCol = collection(db, 'season_backups');
    const q = query(backupsCol, orderBy('updatedAt', 'desc'), limit(maxResults));
    const snap = await getDocs(q);
    const results: SeasonBackupSummary[] = [];
    snap.forEach((d) => {
      const data = d.data();
      const season = normalizeSeason(data);
      results.push({
        id: d.id,
        timestamp: season.updatedAt || new Date().toISOString(),
        name: season.name || 'Saison-Sicherung',
        updatedBy: season.updatedBy || 'coach',
        totalWeeks: season.totalWeeks || 12,
        lanesCount: season.lanes?.length || 0,
        seasonData: season,
      });
    });
    return results;
  } catch (err) {
    console.warn('Could not list cloud backups:', err);
    return [];
  }
}

export async function restoreSeasonFromBackup(
  backup: SeasonPlan,
  onStatusChange?: (status: SyncStatus, lastSaved?: Date) => void
): Promise<void> {
  const restored: SeasonPlan = {
    ...backup,
    id: ACTIVE_SEASON_DOC_ID,
    updatedAt: new Date().toISOString(),
    lastClientId: getClientId(),
    updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach (Wiederherstellung)',
  };
  await forceSyncSeasonNow(restored, onStatusChange);
}
