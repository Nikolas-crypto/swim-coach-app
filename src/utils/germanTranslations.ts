import { DayOfWeek, StrokeType, IntensityZone, EquipmentItem, SendOffMode } from '../types/swim';

export const GERMAN_DAYS: Record<DayOfWeek, string> = {
  Monday: 'Montag',
  Tuesday: 'Dienstag',
  Wednesday: 'Mittwoch',
  Thursday: 'Donnerstag',
  Friday: 'Freitag',
  Saturday: 'Samstag',
  Sunday: 'Sonntag',
};

export const GERMAN_DAYS_SHORT: Record<DayOfWeek, string> = {
  Monday: 'Mo',
  Tuesday: 'Di',
  Wednesday: 'Mi',
  Thursday: 'Do',
  Friday: 'Fr',
  Saturday: 'Sa',
  Sunday: 'So',
};

export const GERMAN_STROKES: Record<StrokeType, string> = {
  Freestyle: 'Kraul',
  Backstroke: 'Rücken',
  Breaststroke: 'Brust',
  Butterfly: 'Delphin',
  IM: 'Lagen',
  Choice: 'Beliebig',
  Kick: 'Beine',
  Pull: 'Arme',
  Drill: 'Technik',
};

export const GERMAN_INTENSITIES: Record<IntensityZone, { label: string; short: string; desc: string }> = {
  Recovery: {
    label: 'Kompensation (Regeneration)',
    short: 'Komp / Locker',
    desc: 'Locker, Puls < 120, Laktatabbau & aktive Erholung',
  },
  'Aerobic (EN1)': {
    label: 'Grundlagenausdauer 1 (GA1)',
    short: 'GA1 Aerob',
    desc: 'Ruhige aerobe Ausdauer, Puls 130–150, saubere Wasserlage',
  },
  'Threshold (EN2)': {
    label: 'Schwellenbereich (GA2 / CSS)',
    short: 'GA2 Schwelle',
    desc: 'Aerob-anaerober Übergang, Wettkampftempo 400m/1500m',
  },
  'VO2Max (EN3)': {
    label: 'VO2max / WSA (Spitzenbereich)',
    short: 'WSA VO2max',
    desc: 'Maximale Sauerstoffaufnahme, hohe Laktattoleranz',
  },
  'Sprint (SP)': {
    label: 'Schnelligkeit (Sprint / SP)',
    short: 'Sprint (Max)',
    desc: 'Maximale neuromuskuläre Explosivität & Abstoßpower',
  },
};

export const GERMAN_BLOCK_TYPES: Record<string, string> = {
  warmup: 'Einschwimmen',
  preset: 'Vorbereitungsserie (Pre-Set)',
  main: 'Hauptserie',
  secondary: 'Nebenserie',
  cooldown: 'Ausschwimmen',
};

export const GERMAN_EQUIPMENT: Record<EquipmentItem, string> = {
  Kickboard: 'Schwimmbrett',
  'Pull Buoy': 'Pullbuoy',
  Paddles: 'Paddles',
  Fins: 'Flossen',
  Snorkel: 'Frontschnorchel',
  Parachute: 'Bremsschirm',
  Band: 'Fessel / Band',
};

export const GERMAN_FOCUS: Record<string, string> = {
  Aerobic: 'Grundlagenausdauer (GA1)',
  Threshold: 'Schwellentraining (CSS)',
  Speed: 'Schnelligkeit & Sprint',
  Technique: 'Technik & Rumpf',
  Recovery: 'Regeneration',
  'Test Set': 'Leistungstest',
};

export const GERMAN_PHASES: Record<string, string> = {
  'Base Phase': 'Basisphase (Grundlagen)',
  'Build Phase': 'Aufbauphase',
  'Threshold Peak': 'Schwellenspitze',
  'Deload / Recovery': 'Entlastung & Regeneration',
  'Taper Phase': 'Tapering (Zuspitzung)',
  'Race Week': 'Wettkampfwoche',
};

export const GERMAN_SEND_OFF: Record<SendOffMode, string> = {
  'lane-scaled': 'Nach Bahnen-CSS skaliert',
  'fixed-interval': 'Fester Abgang (Min:Sek)',
  'rest-after': 'Feste Pause nach Serie',
};

export const GERMAN_COURSE: Record<string, string> = {
  '25m': '25m (Kurzbahn - SCM)',
  '50m': '50m (Langbahn - LCM)',
  '25y': '25y (Yardbahn - SCY)',
};

export function formatDayGerman(day: DayOfWeek): string {
  return GERMAN_DAYS[day] || day;
}

export function formatDayShortGerman(day: DayOfWeek): string {
  return GERMAN_DAYS_SHORT[day] || day;
}

export function formatStrokeGerman(stroke: StrokeType): string {
  return GERMAN_STROKES[stroke] || stroke;
}

export function formatIntensityGerman(intensity: IntensityZone): string {
  return GERMAN_INTENSITIES[intensity]?.label || intensity;
}

export function formatIntensityShortGerman(intensity: IntensityZone): string {
  return GERMAN_INTENSITIES[intensity]?.short || intensity;
}

export function formatBlockTypeGerman(type: string): string {
  return GERMAN_BLOCK_TYPES[type] || type;
}

export function formatEquipmentGerman(eq: EquipmentItem): string {
  return GERMAN_EQUIPMENT[eq] || eq;
}

export function formatFocusGerman(focus: string): string {
  return GERMAN_FOCUS[focus] || focus;
}

export function formatPhaseGerman(phase: string): string {
  return GERMAN_PHASES[phase] || phase;
}

// Aliases for convenience
export const translateStroke = (stroke: any): string => {
  return (GERMAN_STROKES as any)[stroke] || stroke;
};

export const translateIntensity = (intensity: any): string => {
  return (GERMAN_INTENSITIES as any)[intensity]?.label || intensity;
};

export const translateIntensityShort = (intensity: any): string => {
  return (GERMAN_INTENSITIES as any)[intensity]?.short || intensity;
};

export const translateEquipment = (eq: any): string => {
  return (GERMAN_EQUIPMENT as any)[eq] || eq;
};

export const translateBlockType = (type: any): string => {
  return (GERMAN_BLOCK_TYPES as any)[type] || type;
};

export const translateCycleFocus = (focus: any): string => {
  return (GERMAN_FOCUS as any)[focus] || focus;
};
