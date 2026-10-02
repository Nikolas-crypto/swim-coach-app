import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { SavedWorkoutItem, WorkoutSession } from '../types/swim';
import { INSPIRATION_WORKOUTS } from '../data/inspirationPlans';
import { calculateSessionDistance, calculateSessionEstimatedMinutes } from '../utils/swimCalculators';

const STORAGE_KEY_WORKOUT_LIBRARY = 'swim_coach_workout_library_v1';

export function getStoredWorkouts(): SavedWorkoutItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKOUT_LIBRARY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading workout library from storage', e);
  }
  return INSPIRATION_WORKOUTS;
}

export function saveWorkoutsToStorage(workouts: SavedWorkoutItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WORKOUT_LIBRARY, JSON.stringify(workouts));
  } catch (e) {
    console.error('Failed saving workouts to storage', e);
  }
}

export async function saveWorkoutToLibrary(workout: SavedWorkoutItem): Promise<SavedWorkoutItem> {
  const current = getStoredWorkouts();
  const existingIdx = current.findIndex(w => w.id === workout.id);
  
  let updatedList: SavedWorkoutItem[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = workout;
  } else {
    updatedList = [workout, ...current];
  }
  
  saveWorkoutsToStorage(updatedList);

  // Sync to Cloud Firestore
  try {
    const docRef = doc(db, 'saved_workouts', workout.id);
    await setDoc(docRef, {
      id: workout.id,
      name: workout.name,
      category: workout.category || 'Coach Inspiration',
      focus: workout.focus || 'Threshold',
      totalDistance: workout.totalDistance || 0,
      estimatedMinutes: workout.estimatedMinutes || 60,
      blocks: workout.blocks || [],
      completedAt: workout.completedAt || null,
      isCompleted: !!workout.isCompleted,
      notes: workout.notes || '',
      tags: workout.tags || [],
      source: workout.source || 'completed_session',
      originalPlanIndex: workout.originalPlanIndex || null
    });
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, `saved_workouts/${workout.id}`);
    } catch {
      // Handled and cached locally
    }
  }

  return workout;
}

export async function deleteWorkoutFromLibrary(id: string): Promise<void> {
  const current = getStoredWorkouts();
  const filtered = current.filter(w => w.id !== id);
  saveWorkoutsToStorage(filtered);

  try {
    const docRef = doc(db, 'saved_workouts', id);
    await deleteDoc(docRef);
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, `saved_workouts/${id}`);
    } catch {
      // Handled
    }
  }
}

export async function saveCompletedSessionToLibrary(
  session: WorkoutSession,
  notes?: string,
  category: SavedWorkoutItem['category'] = 'Threshold'
): Promise<SavedWorkoutItem> {
  const totalDist = calculateSessionDistance(session);
  const estMins = calculateSessionEstimatedMinutes(session);
  const now = new Date();

  const newSavedWorkout: SavedWorkoutItem = {
    id: `saved-workout-${Date.now()}`,
    name: session.name || `Completed Workout - ${session.dayOfWeek}`,
    category,
    focus: session.focus,
    totalDistance: totalDist,
    estimatedMinutes: estMins,
    blocks: JSON.parse(JSON.stringify(session.blocks || [])),
    completedAt: now.toISOString(),
    isCompleted: true,
    notes: notes || `Completed on deck in Week ${session.weekNumber} (${session.dayOfWeek}).`,
    tags: ['Completed', session.focus, `${session.totalDistance}m`, session.dayOfWeek],
    source: 'completed_session'
  };

  return await saveWorkoutToLibrary(newSavedWorkout);
}

export function subscribeToSavedWorkouts(
  onData: (workouts: SavedWorkoutItem[]) => void
): () => void {
  const collectionRef = collection(db, 'saved_workouts');

  const unsubscribe = onSnapshot(
    collectionRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const cloudWorkouts: SavedWorkoutItem[] = [];
        snapshot.forEach((d) => {
          cloudWorkouts.push(d.data() as SavedWorkoutItem);
        });

        // Merge with local inspiration workouts so base plans are never lost
        const mergedMap = new Map<string, SavedWorkoutItem>();
        INSPIRATION_WORKOUTS.forEach(w => mergedMap.set(w.id, w));
        cloudWorkouts.forEach(w => mergedMap.set(w.id, w));

        const finalMerged = Array.from(mergedMap.values()).sort((a, b) => {
          if (a.completedAt && b.completedAt) {
            return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
          }
          return 0;
        });

        saveWorkoutsToStorage(finalMerged);
        onData(finalMerged);
      } else {
        // Fallback to local
        onData(getStoredWorkouts());
      }
    },
    (err) => {
      console.warn('Real-time saved workouts error:', err?.message || err);
      onData(getStoredWorkouts());
    }
  );

  return unsubscribe;
}
