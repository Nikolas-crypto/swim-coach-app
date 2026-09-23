export type StrokeType = 
  | 'Freestyle'
  | 'Backstroke'
  | 'Breaststroke'
  | 'Butterfly'
  | 'IM'
  | 'Choice'
  | 'Kick'
  | 'Pull'
  | 'Drill';

export type IntensityZone = 
  | 'Recovery'
  | 'Aerobic (EN1)'
  | 'Threshold (EN2)'
  | 'VO2Max (EN3)'
  | 'Sprint (SP)';

export type EquipmentItem = 
  | 'Kickboard'
  | 'Pull Buoy'
  | 'Paddles'
  | 'Fins'
  | 'Snorkel'
  | 'Parachute'
  | 'Band';

export type SendOffMode = 'lane-scaled' | 'fixed-interval' | 'rest-after';

export interface DrillLibraryItem {
  id: string;
  name: string;
  category: 'Freestyle' | 'Backstroke' | 'Breaststroke' | 'Butterfly' | 'IM' | 'Kick' | 'Pull' | 'Starts & Turns';
  stroke: StrokeType;
  defaultDistance: number;
  equipment: EquipmentItem[];
  focusCue: string;
  intensity: IntensityZone;
  description: string;
}

export interface WorkoutItem {
  id: string;
  reps: number;
  distance: number; // e.g. 50, 100, 200, 400
  stroke: StrokeType;
  intensity: IntensityZone;
  description: string;
  equipment: EquipmentItem[];
  sendOffMode: SendOffMode;
  fixedInterval?: string; // e.g. "1:30"
  restSeconds?: number; // e.g. 15
  notes?: string;
}

export interface WorkoutBlock {
  id: string;
  type: 'warmup' | 'preset' | 'main' | 'secondary' | 'cooldown';
  title: string;
  rounds: number;
  items: WorkoutItem[];
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface SessionScheduleSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // e.g. "06:00"
  endTime: string;   // e.g. "07:30"
  sessionTitle: string;
  primaryFocus: 'Aerobic' | 'Threshold' | 'Speed' | 'Technique' | 'Recovery' | 'Test Set';
  poolLength: '25m' | '50m' | '25y';
}

export interface LaneConfig {
  id: string;
  laneNumber: number;
  name: string;
  color: string;
  basePace100mSeconds: number; // base threshold/CSS pace per 100m in seconds (e.g. 75 = 1:15)
  swimmers: string[];
  maxSwimmers: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  weekNumber: number;
  dayOfWeek: DayOfWeek;
  scheduledTime?: string;
  name: string;
  focus: 'Aerobic' | 'Threshold' | 'Speed' | 'Technique' | 'Recovery' | 'Test Set';
  totalDistance: number; // calculated in meters/yards
  estimatedMinutes: number;
  blocks: WorkoutBlock[];
  confirmed?: boolean;
}

export interface WeekCycle {
  weekNumber: number;
  theme: string;
  phase: 'Base Phase' | 'Build Phase' | 'Threshold Peak' | 'Deload / Recovery' | 'Taper Phase' | 'Race Week';
  targetVolumeMeters: number;
  actualVolumeMeters: number;
  sessions: WorkoutSession[];
  isConfirmed: boolean;
  notes?: string;
}

export interface SeasonPlan {
  id: string;
  name: string;
  goal: string;
  poolLength: '25m' | '50m' | '25y';
  totalWeeks: number;
  currentWeekNumber: number;
  weeklySchedule: SessionScheduleSlot[];
  lanes: LaneConfig[];
  weeks: WeekCycle[];
  updatedAt?: string;
  updatedBy?: string;
  lastClientId?: string;
}
