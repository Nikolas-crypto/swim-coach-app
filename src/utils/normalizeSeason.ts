import { SeasonPlan, WeekCycle, WorkoutSession, WorkoutBlock, WorkoutItem, LaneConfig } from '../types/swim';
import { INITIAL_SEASON } from '../data/seedData';

/**
 * Ensures all nested collections (lanes, swimmers, weeks, sessions, blocks, items, equipment)
 * are valid, non-null, defined arrays so `.length`, `.map`, `.reduce` never throw
 * "Cannot read properties of undefined (reading 'length')".
 */
export function normalizeSeason(raw: any): SeasonPlan {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(INITIAL_SEASON));
  }

  const lanes: LaneConfig[] = (Array.isArray(raw.lanes) ? raw.lanes : INITIAL_SEASON.lanes).map(
    (lane: any, idx: number): LaneConfig => ({
      id: lane?.id || `lane-${idx + 1}`,
      laneNumber: typeof lane?.laneNumber === 'number' ? lane.laneNumber : idx + 1,
      name: lane?.name || `Lane ${idx + 1}`,
      color: lane?.color || '#3b82f6',
      basePace100mSeconds: typeof lane?.basePace100mSeconds === 'number' ? lane.basePace100mSeconds : 85,
      swimmers: Array.isArray(lane?.swimmers) ? lane.swimmers : [],
      maxSwimmers: typeof lane?.maxSwimmers === 'number' ? lane.maxSwimmers : 8,
      notes: lane?.notes || '',
    })
  );

  const weeks: WeekCycle[] = (Array.isArray(raw.weeks) ? raw.weeks : INITIAL_SEASON.weeks).map(
    (week: any, wIdx: number): WeekCycle => {
      const sessions: WorkoutSession[] = (Array.isArray(week?.sessions) ? week.sessions : []).map(
        (session: any, sIdx: number): WorkoutSession => {
          const blocks: WorkoutBlock[] = (Array.isArray(session?.blocks) ? session.blocks : []).map(
            (block: any, bIdx: number): WorkoutBlock => {
              const items: WorkoutItem[] = (Array.isArray(block?.items) ? block.items : []).map(
                (item: any, iIdx: number): WorkoutItem => ({
                  id: item?.id || `item-${wIdx}-${sIdx}-${bIdx}-${iIdx}`,
                  reps: typeof item?.reps === 'number' ? item.reps : 1,
                  distance: typeof item?.distance === 'number' ? item.distance : 100,
                  stroke: item?.stroke || 'Freestyle',
                  intensity: item?.intensity || 'Aerobic (EN1)',
                  description: item?.description || '',
                  equipment: Array.isArray(item?.equipment) ? item.equipment : [],
                  sendOffMode: item?.sendOffMode || 'lane-scaled',
                  ...(item?.fixedInterval ? { fixedInterval: item.fixedInterval } : {}),
                  ...(typeof item?.restSeconds === 'number' ? { restSeconds: item.restSeconds } : {}),
                  ...(item?.notes ? { notes: item.notes } : {}),
                })
              );

              return {
                id: block?.id || `block-${wIdx}-${sIdx}-${bIdx}`,
                type: block?.type || 'main',
                title: block?.title || 'Main Set',
                rounds: typeof block?.rounds === 'number' ? block.rounds : 1,
                items,
              };
            }
          );

          return {
            id: session?.id || `session-${wIdx}-${sIdx}`,
            weekNumber: typeof session?.weekNumber === 'number' ? session.weekNumber : (week?.weekNumber || 1),
            dayOfWeek: session?.dayOfWeek || 'Monday',
            scheduledTime: session?.scheduledTime || '06:00 - 07:30',
            name: session?.name || 'Squad Practice',
            focus: session?.focus || 'Aerobic',
            totalDistance: typeof session?.totalDistance === 'number' ? session.totalDistance : 0,
            estimatedMinutes: typeof session?.estimatedMinutes === 'number' ? session.estimatedMinutes : 60,
            blocks,
            confirmed: Boolean(session?.confirmed),
          };
        }
      );

      return {
        weekNumber: typeof week?.weekNumber === 'number' ? week.weekNumber : wIdx + 1,
        theme: week?.theme || `Week ${wIdx + 1}`,
        phase: week?.phase || 'Build Phase',
        targetVolumeMeters: typeof week?.targetVolumeMeters === 'number' ? week.targetVolumeMeters : 20000,
        actualVolumeMeters: typeof week?.actualVolumeMeters === 'number' ? week.actualVolumeMeters : 0,
        sessions,
        isConfirmed: Boolean(week?.isConfirmed),
        notes: week?.notes || '',
      };
    }
  );

  return {
    id: raw?.id || 'active_season',
    name: raw?.name || INITIAL_SEASON.name,
    goal: raw?.goal || INITIAL_SEASON.goal,
    poolLength: ['25m', '50m', '25y'].includes(raw?.poolLength) ? raw.poolLength : '25m',
    totalWeeks: typeof raw?.totalWeeks === 'number' ? raw.totalWeeks : 12,
    currentWeekNumber: typeof raw?.currentWeekNumber === 'number' ? raw.currentWeekNumber : 1,
    weeklySchedule: Array.isArray(raw?.weeklySchedule) ? raw.weeklySchedule : INITIAL_SEASON.weeklySchedule,
    lanes,
    weeks: weeks.length > 0 ? weeks : JSON.parse(JSON.stringify(INITIAL_SEASON.weeks)),
    updatedAt: raw?.updatedAt,
    updatedBy: raw?.updatedBy,
    lastClientId: raw?.lastClientId,
  };
}
