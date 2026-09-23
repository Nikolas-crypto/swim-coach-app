import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { SeasonPlan } from '../types/swim';
import { INITIAL_SEASON } from '../data/seedData';
import { normalizeSeason } from '../utils/normalizeSeason';

const ACTIVE_SEASON_DOC_ID = 'active_season';

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

/**
 * Subscribes to real-time season updates across all devices.
 * If no cloud data exists yet, it seeds the initial season plan into Firestore.
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
        const isRemote = !snapshot.metadata.hasPendingWrites && cloudSeason.lastClientId !== myClientId;
        onData(cloudSeason, isRemote);
        onStatusChange('synced', new Date());
      } else {
        // Initialize default season in Firestore
        try {
          onStatusChange('saving');
          const initialPayload: SeasonPlan = {
            ...INITIAL_SEASON,
            id: ACTIVE_SEASON_DOC_ID,
          };
          const payload = sanitizeForFirestore({
            ...initialPayload,
            updatedAt: new Date().toISOString(),
            lastClientId: getClientId(),
            updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach',
          });
          await setDoc(seasonDocRef, payload);
          onData(initialPayload, false);
          onStatusChange('synced', new Date());
        } catch (err) {
          console.error('Failed to initialize seed season in Firestore:', err);
          onStatusChange('error');
          try {
            handleFirestoreError(err, OperationType.WRITE, `seasons/${ACTIVE_SEASON_DOC_ID}`);
          } catch {
            // Handled and logged to console
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

let pendingSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let latestPendingSeason: SeasonPlan | null = null;

/**
 * Persists updated season plan to Firestore so all users on any device see updates in real time.
 * Includes automatic 300ms debouncing to consolidate rapid keystrokes/edits into a clean write operation,
 * with complete undefined-sanitization to prevent Firestore rejection.
 */
export async function persistSeasonToCloud(
  season: SeasonPlan,
  onStatusChange?: (status: SyncStatus, lastSaved?: Date) => void
): Promise<void> {
  latestPendingSeason = season;
  if (onStatusChange) onStatusChange('saving');

  return new Promise((resolve) => {
    if (pendingSaveTimeout) {
      clearTimeout(pendingSaveTimeout);
    }

    pendingSaveTimeout = setTimeout(async () => {
      if (!latestPendingSeason) {
        resolve();
        return;
      }
      const toSave = latestPendingSeason;
      const seasonDocRef = doc(db, 'seasons', ACTIVE_SEASON_DOC_ID);

      try {
        const payload = sanitizeForFirestore({
          ...toSave,
          id: ACTIVE_SEASON_DOC_ID,
          updatedAt: new Date().toISOString(),
          lastClientId: getClientId(),
          updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach',
        });

        await setDoc(seasonDocRef, payload);
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
