import { SeasonPlan, WeekCycle, WorkoutSession, WorkoutBlock, WorkoutItem } from '../types/swim';
import { calculateSessionDistance, calculateSessionEstimatedMinutes } from './swimCalculators';

/**
 * Scales all sessions in a season so that they average approximately `targetAvgMeters` (default: 3000m),
 * with natural variation where some sessions are longer (e.g. 3300m - 3600m) and some are shorter (e.g. 2500m - 2800m).
 */
export function scaleSeasonSessionsToTarget(
  season: SeasonPlan,
  targetAvgMeters: number = 3000
): SeasonPlan {
  const allSessions: WorkoutSession[] = (season.weeks || []).flatMap(w => w.sessions || []);
  if (allSessions.length === 0) {
    return {
      ...season,
      targetSessionVolumeMeters: targetAvgMeters,
    };
  }

  // Calculate current average volume across all sessions
  const currentTotal = allSessions.reduce((sum, s) => sum + (s.totalDistance || 0), 0);
  const currentAvg = currentTotal / allSessions.length;

  // If already right around target (within 3%), don't over-mutate
  const overallRatio = currentAvg > 0 ? targetAvgMeters / currentAvg : 1;

  const updatedWeeks: WeekCycle[] = (season.weeks || []).map(week => {
    const updatedSessions: WorkoutSession[] = (week.sessions || []).map(session => {
      const origDist = session.totalDistance || 3000;
      
      // Determine session focus modifier (longer for Aerobic/Threshold, shorter for Speed/Technique/Recovery)
      let focusMultiplier = 1.0;
      if (session.focus === 'Aerobic') focusMultiplier = 1.10; // ~3300m
      else if (session.focus === 'Threshold') focusMultiplier = 1.05; // ~3150m
      else if (session.focus === 'Speed') focusMultiplier = 0.88; // ~2640m
      else if (session.focus === 'Technique') focusMultiplier = 0.92; // ~2760m
      else if (session.focus === 'Recovery') focusMultiplier = 0.82; // ~2460m

      const targetSessionDist = Math.round((targetAvgMeters * focusMultiplier) / 50) * 50;
      const sessionRatio = origDist > 0 ? targetSessionDist / origDist : 1;

      // Scale blocks
      const updatedBlocks: WorkoutBlock[] = (session.blocks || []).map(block => {
        // We primarily scale 'main' and 'secondary' blocks, keeping warmup and cooldown reasonable (200-400m)
        const updatedItems: WorkoutItem[] = (block.items || []).map(item => {
          let newReps = item.reps;
          let newDist = item.distance;

          if (block.type === 'main' || block.type === 'secondary') {
            // Apply scale factor to reps first if reps > 2
            if (item.reps >= 4) {
              newReps = Math.max(2, Math.round(item.reps * sessionRatio));
            } else if (item.distance >= 300) {
              // Scale distance for big sets (e.g. 800m -> 600m, 400m -> 300m)
              const scaledDist = Math.round((item.distance * sessionRatio) / 50) * 50;
              newDist = Math.max(100, scaledDist);
            } else {
              newReps = Math.max(1, Math.round(item.reps * sessionRatio));
            }
          } else if (block.type === 'preset' && sessionRatio < 0.85) {
            // Slightly compress preset if scaling down from huge volume
            if (item.reps >= 6) {
              newReps = Math.max(4, Math.round(item.reps * 0.75));
            }
          }

          return {
            ...item,
            reps: newReps,
            distance: newDist,
          };
        });

        return {
          ...block,
          items: updatedItems,
        };
      });

      const updatedSession: WorkoutSession = {
        ...session,
        blocks: updatedBlocks,
        totalDistance: 0,
        estimatedMinutes: 0,
      };

      updatedSession.totalDistance = calculateSessionDistance(updatedSession);
      updatedSession.estimatedMinutes = calculateSessionEstimatedMinutes(updatedSession);
      return updatedSession;
    });

    const newActualVol = updatedSessions.reduce((sum, s) => sum + s.totalDistance, 0);

    // Calculate proportional target volume for the week based on phase
    const numSlots = updatedSessions.length || (season.weeklySchedule?.length || 6);
    let phaseFactor = 1.0;
    if (week.phase === 'Build Phase') phaseFactor = 1.06;
    else if (week.phase === 'Threshold Peak') phaseFactor = 1.08;
    else if (week.phase === 'Deload / Recovery') phaseFactor = 0.78;
    else if (week.phase === 'Taper Phase') phaseFactor = 0.70;
    else if (week.phase === 'Race Week') phaseFactor = 0.55;

    const newTargetVol = Math.round((numSlots * targetAvgMeters * phaseFactor) / 500) * 500;

    return {
      ...week,
      sessions: updatedSessions,
      actualVolumeMeters: newActualVol,
      targetVolumeMeters: newTargetVol,
    };
  });

  return {
    ...season,
    targetSessionVolumeMeters: targetAvgMeters,
    weeks: updatedWeeks,
    updatedAt: new Date().toISOString(),
  };
}
