import { 
  IntensityZone, 
  StrokeType, 
  WorkoutBlock, 
  WorkoutItem, 
  WorkoutSession, 
  WeekCycle,
  LaneConfig 
} from '../types/swim';

export function formatSecondsToTime(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

export function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  return parseInt(timeStr, 10) || 0;
}

/**
 * Rounds seconds up to standard swim coach send-off increments (typically 5 seconds, e.g. :05, :10, :15, :20...)
 */
export function roundToSwimIncrement(seconds: number, increment = 5): number {
  return Math.ceil(seconds / increment) * increment;
}

export interface LanePaceDetail {
  laneId: string;
  laneNumber: number;
  laneName: string;
  laneColor: string;
  base100mSec: number;
  swimTimeSec: number;
  swimTimeStr: string;
  sendOffSec: number;
  sendOffStr: string;
  restSec: number;
  repsCount: number;
}

/**
 * Calculates lane-specific send-off intervals and target swim times
 */
export function calculateLaneSendOff(
  lane: LaneConfig,
  distance: number,
  intensity: IntensityZone,
  stroke: StrokeType,
  customReps?: number
): LanePaceDetail {
  const base100 = lane.basePace100mSeconds;
  const distRatio = distance / 100;

  // Stroke adjustments per 100m
  let strokeFactor = 0;
  if (stroke === 'Backstroke') strokeFactor = 3;
  else if (stroke === 'Breaststroke') strokeFactor = 8;
  else if (stroke === 'Butterfly') strokeFactor = 6;
  else if (stroke === 'IM') strokeFactor = 4;
  else if (stroke === 'Kick') strokeFactor = 18;
  else if (stroke === 'Pull') strokeFactor = -2;

  // Intensity pacing (swim pace per 100m) & rest allowance
  let pacePer100Delta = 0;
  let targetRestSeconds = 10;

  switch (intensity) {
    case 'Recovery':
      pacePer100Delta = 16;
      targetRestSeconds = 15;
      break;
    case 'Aerobic (EN1)':
      pacePer100Delta = 10;
      targetRestSeconds = 12;
      break;
    case 'Threshold (EN2)':
      pacePer100Delta = 4;
      targetRestSeconds = 8; // classic T-pace tight rest
      break;
    case 'VO2Max (EN3)':
      pacePer100Delta = -1;
      targetRestSeconds = 20; // higher rest for max aerobic power
      break;
    case 'Sprint (SP)':
      pacePer100Delta = -8;
      targetRestSeconds = Math.max(30, Math.round(distance * 0.6)); // generous sprint rest
      break;
  }

  // Estimated swim time in seconds
  const swimPacePer100 = Math.max(25, base100 + strokeFactor + pacePer100Delta);
  const rawSwimTime = Math.round(swimPacePer100 * distRatio);
  
  // Total send-off interval = swim time + rest, rounded to 5 seconds
  const rawInterval = rawSwimTime + targetRestSeconds;
  const roundedSendOff = roundToSwimIncrement(rawInterval, 5);
  const actualRest = Math.max(5, roundedSendOff - rawSwimTime);

  return {
    laneId: lane.id,
    laneNumber: lane.laneNumber,
    laneName: lane.name,
    laneColor: lane.color,
    base100mSec: base100,
    swimTimeSec: rawSwimTime,
    swimTimeStr: formatSecondsToTime(rawSwimTime),
    sendOffSec: roundedSendOff,
    sendOffStr: formatSecondsToTime(roundedSendOff),
    restSec: actualRest,
    repsCount: customReps ?? 1,
  };
}

export function calculateItemDistance(item: WorkoutItem): number {
  return (item.reps || 1) * (item.distance || 0);
}

export function calculateBlockDistance(block: WorkoutBlock): number {
  const roundDist = (block?.items || []).reduce((sum, item) => sum + calculateItemDistance(item), 0);
  return roundDist * (block?.rounds || 1);
}

export function calculateSessionDistance(session: WorkoutSession): number {
  return (session?.blocks || []).reduce((sum, block) => sum + calculateBlockDistance(block), 0);
}

export function calculateSessionEstimatedMinutes(session: WorkoutSession, averageBasePaceSec = 90): number {
  let totalSeconds = 0;
  for (const block of (session?.blocks || [])) {
    const rounds = block?.rounds || 1;
    for (const item of (block?.items || [])) {
      const reps = item?.reps || 1;
      const dist = item?.distance || 0;
      let intervalSec = 0;
      if (item?.sendOffMode === 'fixed-interval' && item?.fixedInterval) {
        intervalSec = parseTimeToSeconds(item.fixedInterval);
      } else {
        // Average lane send-off approximation
        const ratio = dist / 100;
        intervalSec = roundToSwimIncrement(Math.round(ratio * (averageBasePaceSec + 10) + 12), 5);
      }
      totalSeconds += reps * intervalSec * rounds;
    }
  }
  // Add 10% transition/hydration buffer
  return Math.max(30, Math.round((totalSeconds * 1.1) / 60));
}

export type ProgressionMode = 'overload_volume' | 'sharpen_threshold' | 'taper_speed' | 'deload_recovery';

/**
 * Automatically populates the next week's sessions from the confirmed week structure,
 * applying progressive training principles (volume, sets, drills, lane intervals).
 */
export function autoPopulateNextWeek(
  currentWeek: WeekCycle,
  nextWeekNumber: number,
  progressionMode: ProgressionMode = 'overload_volume'
): WeekCycle {
  // Determine progression factors
  let volumeMultiplier = 1.06; // standard +6% to +8%
  let phase: WeekCycle['phase'] = 'Build Phase';
  let theme = `Week ${nextWeekNumber} - Progressive Build`;

  if (progressionMode === 'overload_volume') {
    volumeMultiplier = 1.08;
    phase = 'Build Phase';
    theme = `Week ${nextWeekNumber} - Overload & Endurance`;
  } else if (progressionMode === 'sharpen_threshold') {
    volumeMultiplier = 1.02;
    phase = 'Threshold Peak';
    theme = `Week ${nextWeekNumber} - Threshold Density & Pacing`;
  } else if (progressionMode === 'deload_recovery') {
    volumeMultiplier = 0.78; // -22% volume drop for supercompensation
    phase = 'Deload / Recovery';
    theme = `Week ${nextWeekNumber} - Active Recovery & Tech Reset`;
  } else if (progressionMode === 'taper_speed') {
    volumeMultiplier = 0.70;
    phase = 'Taper Phase';
    theme = `Week ${nextWeekNumber} - Race Speed & Sharpening`;
  }

  const oldSessions = Array.isArray(currentWeek?.sessions) ? currentWeek.sessions : [];
  const newSessions: WorkoutSession[] = oldSessions.map((oldSession, sIndex) => {
    // Clone blocks and adjust based on progression
    const oldBlocks = Array.isArray(oldSession?.blocks) ? oldSession.blocks : [];
    const newBlocks: WorkoutBlock[] = oldBlocks.map(block => {
      const oldItems = Array.isArray(block?.items) ? block.items : [];
      const clonedItems: WorkoutItem[] = oldItems.map(item => {
        let newReps = item.reps;
        let newDist = item.distance;
        let newDesc = item.description;

        // Apply progressive overload to main & secondary sets
        if (block.type === 'main') {
          if (progressionMode === 'overload_volume') {
            // Add a repetition or slightly increase distance if reps are already high
            if (item.reps < 8) {
              newReps = Math.round(item.reps + 1);
            } else {
              newReps = Math.round(item.reps * 1.15);
            }
            newDesc = item.description ? `${item.description} (+1 rep progression)` : '+1 rep progression';
          } else if (progressionMode === 'sharpen_threshold') {
            // Higher intensity, tighten interval or shift focus
            newDesc = `${item.description || 'Pace focus'} (Descend to CSS -2s)`;
          } else if (progressionMode === 'deload_recovery') {
            // Cut reps by 25%
            newReps = Math.max(2, Math.round(item.reps * 0.75));
            newDesc = `${item.description || ''} (Smooth technical speed)`;
          } else if (progressionMode === 'taper_speed') {
            // Cut reps by 40%, high quality speed
            newReps = Math.max(2, Math.round(item.reps * 0.6));
            newDesc = `${item.description || ''} (Race pace breakout!)`;
          }
        } else if (block.type === 'preset' && progressionMode === 'overload_volume') {
          // slight preset bump
          if (item.reps % 2 === 0 && item.reps < 10) {
            newReps = item.reps + 2;
          }
        }

        return {
          ...item,
          id: `w${nextWeekNumber}-s${sIndex}-item-${Math.random().toString(36).substring(2, 8)}`,
          reps: newReps,
          distance: newDist,
          description: newDesc,
          equipment: Array.isArray(item.equipment) ? [...item.equipment] : [],
        };
      });

      return {
        ...block,
        id: `w${nextWeekNumber}-s${sIndex}-block-${Math.random().toString(36).substring(2, 8)}`,
        items: clonedItems,
      };
    });

    const populatedSession: WorkoutSession = {
      id: `w${nextWeekNumber}-session-${sIndex + 1}`,
      weekNumber: nextWeekNumber,
      dayOfWeek: oldSession.dayOfWeek,
      scheduledTime: oldSession.scheduledTime,
      name: `${oldSession.name.replace(/W\d+/, `W${nextWeekNumber}`)}`,
      focus: oldSession.focus,
      totalDistance: 0,
      estimatedMinutes: 0,
      blocks: newBlocks,
      confirmed: false,
    };

    populatedSession.totalDistance = calculateSessionDistance(populatedSession);
    populatedSession.estimatedMinutes = calculateSessionEstimatedMinutes(populatedSession);
    return populatedSession;
  });

  const actualVolume = newSessions.reduce((sum, s) => sum + s.totalDistance, 0);

  return {
    weekNumber: nextWeekNumber,
    theme,
    phase,
    targetVolumeMeters: Math.round(currentWeek.targetVolumeMeters * volumeMultiplier),
    actualVolumeMeters: actualVolume,
    sessions: newSessions,
    isConfirmed: false,
    notes: `Auto-generated from Week ${currentWeek.weekNumber} using ${progressionMode.replace('_', ' ')} progression.`,
  };
}
