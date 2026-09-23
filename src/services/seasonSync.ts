import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { SeasonPlan, DrillLibraryItem } from '../types/swim';
import { INITIAL_SEASON, INITIAL_DRILLS } from '../data/seedData';

const ACTIVE_SEASON_DOC_ID = 'active_season';

export type SyncStatus = 'connected' | 'saving' | 'synced' | 'offline' | 'error';

/**
 * Subscribes to real-time season updates across all devices.
 * If no cloud data exists yet, it seeds the initial season plan into Firestore.
 */
export function subscribeToActiveSeason(
  onData: (season: SeasonPlan) => void,
  onStatusChange: (status: SyncStatus, lastSaved?: Date) => void
) {
  const seasonDocRef = doc(db, 'seasons', ACTIVE_SEASON_DOC_ID);

  const unsubscribe = onSnapshot(
    seasonDocRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const cloudSeason = snapshot.data() as SeasonPlan;
        onData(cloudSeason);
        onStatusChange('synced', new Date());
      } else {
        // Initialize default season in Firestore
        try {
          onStatusChange('saving');
          const initialPayload: SeasonPlan = {
            ...INITIAL_SEASON,
            id: ACTIVE_SEASON_DOC_ID,
          };
          await setDoc(seasonDocRef, {
            ...initialPayload,
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach',
          });
          onData(initialPayload);
          onStatusChange('synced', new Date());
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `seasons/${ACTIVE_SEASON_DOC_ID}`);
          onStatusChange('error');
        }
      }
    },
    (err) => {
      console.error('Real-time season sync error:', err);
      handleFirestoreError(err, OperationType.GET, `seasons/${ACTIVE_SEASON_DOC_ID}`);
      onStatusChange('error');
    }
  );

  return unsubscribe;
}

let pendingSaveTimeout: any = null;
let latestPendingSeason: SeasonPlan | null = null;

/**
 * Persists updated season plan to Firestore so all users on any device see the updates in real time.
 * Includes automatic 400ms debouncing to consolidate rapid edits into a single write operation,
 * keeping database write consumption virtually zero and well within Firebase's permanent free tier.
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
      if (!latestPendingSeason) return;
      const toSave = latestPendingSeason;
      const seasonDocRef = doc(db, 'seasons', ACTIVE_SEASON_DOC_ID);

      try {
        const payload = {
          ...toSave,
          id: ACTIVE_SEASON_DOC_ID,
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'coach',
        };

        await setDoc(seasonDocRef, payload);
        if (onStatusChange) onStatusChange('synced', new Date());
        resolve();
      } catch (err) {
        console.error('Failed to save season to Firestore:', err);
        if (onStatusChange) onStatusChange('error');
        handleFirestoreError(err, OperationType.WRITE, `seasons/${ACTIVE_SEASON_DOC_ID}`);
        resolve();
      }
    }, 350);
  });
}
