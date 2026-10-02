import { 
  CycleFocusConfig, 
  CycleFocusType, 
  SeasonPlan, 
  WeekCycle, 
  WorkoutSession 
} from '../types/swim';
import { INSPIRATION_WORKOUTS, convertInspirationToSession } from './inspirationPlans';

export const CYCLE_FOCUS_PRESETS: Record<CycleFocusType, CycleFocusConfig> = {
  endurance_focus: {
    id: 'endurance_focus',
    name: 'Endurance & Aerobic Engine Block',
    shortLabel: 'Endurance Cycle',
    badge: 'Aerobic Base (EN1/EN2)',
    accentColor: 'emerald',
    summary: 'Focuses exclusively on expanding mitochondrial density, stroke economy, and continuous aerobic power without premature tapering.',
    targetObjective: 'Elevate weekly mileage sustainably, build deep aerobic capillary networks, and condition kick & pull endurance for 400m+ events.',
    physiologicalAdaptation: 'Mitochondrial biogenesis, elevated stroke volume, increased glycogen storage, and lactate buffering under aerobic steady state.',
    suggestedDurationWeeks: 8,
    weeklyStructureSummary: '3 loading weeks : 1 regeneration week ratio. High percentage of aerobic steady-state ladders (300m-800m sets), pull-buoy endurance, and aerobic kick conditioning.',
    defaultWeeklyVolumeBase: 19500,
    benchmarks: [
      {
        metric: 'Critical Swim Speed (CSS)',
        targetDescription: 'Establish steady baseline CSS via 400m & 200m time trials.',
        testProtocol: '400m Free for time + 15 min active recovery + 200m Free for time.'
      },
      {
        metric: 'Aerobic Heart Rate Drift',
        targetDescription: 'Hold sub-145 bpm at CSS + 6s over 3000m total continuous work.',
        testProtocol: '3x1000m or 6x500m on send-off with 20s rest, monitoring stroke count and HR.'
      },
      {
        metric: 'Kick Aerobic Capacity',
        targetDescription: 'Complete 10x100m kick holding consistent splits within 5 seconds.',
        testProtocol: '10x100m Kick with board on send-off base + 25s.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'Aerobic Foundation & Stroke Count Benchmark',
        phase: 'Base Phase',
        targetVolumeMeters: 18000,
        focus: 'Aerobic Baseline & SWOLF Check',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '5x300m Free descending 1-5 + 6x50m kick holding tempo'
      },
      {
        weekNumber: 2,
        theme: 'Progressive Aerobic Mileage & Distance per Stroke',
        phase: 'Build Phase',
        targetVolumeMeters: 19500,
        focus: 'Volume Overload & DPS',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '2400m Aerobic Ladder (600-400-300-200) @ Base + 10s'
      },
      {
        weekNumber: 3,
        theme: 'Endurance Peak & Pull Overload',
        phase: 'Build Phase',
        targetVolumeMeters: 21000,
        focus: 'Volume Peak 1 & Pull Endurance',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '6x300m Pull with paddles on 4:15 + 4x150m Be/Ge/Be kick/swim'
      },
      {
        weekNumber: 4,
        theme: 'Mid-Block Aerobic Test & Active Flush',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 15000,
        focus: 'Mid-Cycle 400m/200m CSS Re-Test',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Official CSS Benchmark Test (400m + 200m TT) + 1000m flush'
      },
      {
        weekNumber: 5,
        theme: 'Extended Aerobic Volume & Long-Course Simulation',
        phase: 'Build Phase',
        targetVolumeMeters: 20500,
        focus: 'Sustained Pacing at CSS + 4s',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '10x200m Free on steady interval (even pacing within 1.5s)'
      },
      {
        weekNumber: 6,
        theme: 'Maximum Aerobic Overload & Medley Endurance',
        phase: 'Build Phase',
        targetVolumeMeters: 22000,
        focus: 'Cycle Highest Volume & IM Balance',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '4x(300m Free + 150m IM + 100m Kick) total 3.6km session'
      },
      {
        weekNumber: 7,
        theme: 'Endurance Consolidation & Threshold Bridge',
        phase: 'Build Phase',
        targetVolumeMeters: 19500,
        focus: 'Sub-Threshold Density',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '6x300m negative split (first 150 easy, second 150 hard)'
      },
      {
        weekNumber: 8,
        theme: 'Cycle Culmination & 30-Minute Aerobic Test',
        phase: 'Threshold Peak',
        targetVolumeMeters: 16500,
        focus: 'T-30 Distance Swim Benchmark',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '30-minute continuous swim test for total distance & stroke efficiency'
      }
    ]
  },

  threshold_focus: {
    id: 'threshold_focus',
    name: 'Threshold & Critical Swim Speed (CSS) Mastery',
    shortLabel: 'Threshold Cycle',
    badge: 'Anaerobic Threshold (EN2)',
    accentColor: 'amber',
    summary: 'Focuses entirely on shifting the lactate inflection curve rightward, improving lactate clearance rate, and holding race pace under high systemic acidosis.',
    targetObjective: 'Drop squad CSS pace by 2-4 seconds per 100m through dense interval repeats, descend ladders, and tight send-off recovery periods.',
    physiologicalAdaptation: 'Lactate shuttling via monocarboxylate transporters (MCT1/4), improved muscular buffer capacity, and mental resilience under burning legs/forearms.',
    suggestedDurationWeeks: 8,
    weeklyStructureSummary: '3 targeted threshold sessions per week: (1) CSS interval repetition, (2) descend/negative split pacing, (3) lactate clearance active recovery bridge.',
    defaultWeeklyVolumeBase: 18000,
    benchmarks: [
      {
        metric: 'CSS Send-Off Interval',
        targetDescription: 'Hold 15x100m on base CSS + 5s send-off with under 5s rest.',
        testProtocol: '15x100m Freestyle holding within 1.0s of current CSS.'
      },
      {
        metric: 'Lactate Clearance Broken 400',
        targetDescription: 'Execute broken 400 (4x100 with 10s rest) faster than single 400 PR.',
        testProtocol: '4x100m @ CSS - 2s on 10s rest + 200m active easy.'
      },
      {
        metric: 'Descend 200s Target',
        targetDescription: 'Descend 5x200m from Aerobic Base to All-Out Threshold.',
        testProtocol: '5x200m Free on base + 20s, descending 1 to 5.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'CSS Calibration & Send-Off Synchronization',
        phase: 'Base Phase',
        targetVolumeMeters: 17500,
        focus: 'Lane Base Paces & Send-Off Checks',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '10x100m @ CSS on lane-scaled send-off (5-8s rest target)'
      },
      {
        weekNumber: 2,
        theme: 'Threshold Density & Short Rest Clusters',
        phase: 'Build Phase',
        targetVolumeMeters: 18500,
        focus: 'Lactate Steady State',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '3x(4x100m CSS) on 1:25 with 1 min between sets'
      },
      {
        weekNumber: 3,
        theme: 'Descending Ladders & Negative Splits',
        phase: 'Build Phase',
        targetVolumeMeters: 19500,
        focus: 'Pacing Discipline Under Fatigue',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '3x(200m CSS + 2x100m CSS-1s + 4x50m CSS-2s)'
      },
      {
        weekNumber: 4,
        theme: 'Deload & Lactate Clearance Flush',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 14000,
        focus: 'Flush Lactate & Technical Realignment',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Technical drills + 6x100m easy pull buoy with snorkel'
      },
      {
        weekNumber: 5,
        theme: 'Threshold Volume Peak & Extended Sets',
        phase: 'Threshold Peak',
        targetVolumeMeters: 20000,
        focus: 'Longer Threshold Intervals (300s & 400s)',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '4x400m at CSS pace with only 15s rest'
      },
      {
        weekNumber: 6,
        theme: 'Lactate Tolerance & Pace Sharpness',
        phase: 'Threshold Peak',
        targetVolumeMeters: 19500,
        focus: 'CSS Minus 1 Second Target',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '16x100m alternating: odd @ CSS, even @ CSS - 2s'
      },
      {
        weekNumber: 7,
        theme: 'Over-Under Lactate Shuttling Sets',
        phase: 'Threshold Peak',
        targetVolumeMeters: 18500,
        focus: 'Aerobic/Anaerobic Boundary Oscillation',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '6x200m (50m Sprint / 150m CSS hold) continuous'
      },
      {
        weekNumber: 8,
        theme: 'Cycle Benchmark Challenge & Re-Testing',
        phase: 'Threshold Peak',
        targetVolumeMeters: 16000,
        focus: 'Official Squad CSS Re-Test',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: 'Re-test 400m + 200m TT and celebrate pace gains'
      }
    ]
  },

  vo2max_focus: {
    id: 'vo2max_focus',
    name: 'VO2 Max & Aerobic Power Overload',
    shortLabel: 'VO2 Max Cycle',
    badge: 'Aerobic Power (EN3)',
    accentColor: 'rose',
    summary: 'Focuses exclusively on pushing maximum oxygen uptake (VO2 max), cardiac output stroke volume, and holding high stroke rates under acute acidosis.',
    targetObjective: 'Maximize cardiovascular output through high-intensity 50m to 150m repeats at 90-95% max effort with disciplined 1:1 or 1:1.5 work-to-rest intervals.',
    physiologicalAdaptation: 'Maximum rate of oxygen consumption, left-ventricular cardiac stroke volume expansion, high-rate motor unit recruitment.',
    suggestedDurationWeeks: 6,
    weeklyStructureSummary: '2-3 high-intensity VO2 Max sessions per week balanced by deep aerobic recovery and technique flushes. Shorter overall weekly volume with acute intensity density.',
    defaultWeeklyVolumeBase: 16500,
    benchmarks: [
      {
        metric: '100m VO2 Max Repeat Velocity',
        targetDescription: 'Hold 8x100m @ 92-95% max velocity on 2:00 send-off.',
        testProtocol: '8x100m Free all-out average pace recording.'
      },
      {
        metric: 'Underwater Power Breakout',
        targetDescription: 'Complete 6x50m with 15m legal underwater kick and explosive breakout.',
        testProtocol: '6x50m Butterfly/Free with fins on 1:15.'
      },
      {
        metric: 'Acidosis Stroke Rate Retention',
        targetDescription: 'Maintain stroke rate above 38 strokes/min across final 50m of broken 200.',
        testProtocol: '4x50m on 10s rest with stroke rate tempo trainer.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'Aerobic Power Primer & Heart Rate Spike',
        phase: 'Base Phase',
        targetVolumeMeters: 16000,
        focus: 'Heart Rate Max Testing & 50m Power',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: '12x50m @ VO2 max on 1:05 (1:1 work-rest ratio)'
      },
      {
        weekNumber: 2,
        theme: '100m Repeat Overload & Acidosis Inoculation',
        phase: 'Build Phase',
        targetVolumeMeters: 17000,
        focus: 'High Oxygen Uptake Retention',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: '8x100m @ 92% effort on 2:15 with 30s rest'
      },
      {
        weekNumber: 3,
        theme: 'Broken 200s & High Stroke Rate Density',
        phase: 'Build Phase',
        targetVolumeMeters: 17500,
        focus: 'Race Pace Broken Repeats',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: '3x [4x50m on :10 rest] holding 200m race split velocity'
      },
      {
        weekNumber: 4,
        theme: 'Active Recovery & Underwater Tauchen Reset',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 13000,
        focus: 'Deload, Lung Capacity & Technique',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Tauchen breakouts, streamline efficiency & 2000m recovery'
      },
      {
        weekNumber: 5,
        theme: 'Maximum Aerobic Power Peak (75m & 100m Clusters)',
        phase: 'Threshold Peak',
        targetVolumeMeters: 18000,
        focus: 'Peak Cardiac Output Stimulation',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: '6x75m max effort on 1:45 + 4x100m fast pull with paddles'
      },
      {
        weekNumber: 6,
        theme: 'Cycle Power Test & 8x100 Benchmark Trial',
        phase: 'Threshold Peak',
        targetVolumeMeters: 15000,
        focus: 'Benchmark 8x100m VO2 Max Test',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: 'Official 8x100m all-out benchmark recording & team rankings'
      }
    ]
  },

  speed_power_focus: {
    id: 'speed_power_focus',
    name: 'Speed, Starts & Neuromuscular Power',
    shortLabel: 'Speed & Power Cycle',
    badge: 'Anaerobic Sprint (SP)',
    accentColor: 'purple',
    summary: 'Focuses entirely on maximum velocity, block reaction time, 15m underwater breakout speed, and ATP-CP power output.',
    targetObjective: 'Develop explosive speed for 50m and 100m events with full phosphagen system recovery intervals (1:4 to 1:6 work-to-rest ratio).',
    physiologicalAdaptation: 'Fast-twitch motor unit recruitment (Type IIx fibers), rate of force development (RFD), and ATP-PC replenishment speed.',
    suggestedDurationWeeks: 6,
    weeklyStructureSummary: 'High quality over quantity. Explosive 15-25m sprints from the blocks, parachute resistance, fin assisted overspeed, generous rest intervals.',
    defaultWeeklyVolumeBase: 15000,
    benchmarks: [
      {
        metric: '15m Underwater Breakout Time',
        targetDescription: 'Clock under 5.8s from start dive to 15m breakout buoy.',
        testProtocol: 'Block dive sprints with electronic timing/stopwatch to 15m mark.'
      },
      {
        metric: '25m Max Velocity Dive',
        targetDescription: 'Personal best 25m dive split with stroke count under 12.',
        testProtocol: '6x25m all-out dives from blocks with 2:30 full rest.'
      },
      {
        metric: 'Relay Takeoff Reaction',
        targetDescription: 'Clean legal relay reaction time between +0.08s and +0.22s.',
        testProtocol: '10 relay exchange trials on 50m sprints.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'Block Mechanics & 15m Dive Breakouts',
        phase: 'Base Phase',
        targetVolumeMeters: 14500,
        focus: 'Block Footwork & Angle of Entry',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: '10x25m dive starts with fins, 15m max underwater kick'
      },
      {
        weekNumber: 2,
        theme: 'Power Resistance & Assisted Overspeed',
        phase: 'Build Phase',
        targetVolumeMeters: 15500,
        focus: 'Parachute Drags & Fin Sprints',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: '6x25m with parachutes + 6x25m assisted fin overspeed'
      },
      {
        weekNumber: 3,
        theme: 'Turn Exit Acceleration & Push-Off Velocity',
        phase: 'Build Phase',
        targetVolumeMeters: 16000,
        focus: 'Flip Turn Speed & Push Force',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: '12x50m fast in/fast out around the turn flags'
      },
      {
        weekNumber: 4,
        theme: 'Deload & Neuromuscular Tuning',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 12000,
        focus: 'Nervous System Recovery & Mobility',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Light mobility, streamline drills, easy 2000m recovery'
      },
      {
        weekNumber: 5,
        theme: 'Anaerobic Lactic Acidosis Peak',
        phase: 'Threshold Peak',
        targetVolumeMeters: 15500,
        focus: 'Holding Speed Over Last 15m',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: '6x50m max all-out from blocks on 3:00 rest'
      },
      {
        weekNumber: 6,
        theme: 'Speed Showdown & Relay Battles',
        phase: 'Race Week',
        targetVolumeMeters: 13000,
        focus: 'Sprint Shootout & Timed Trials',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: 'Squad 50m elimination shootouts & 4x50 medley relays'
      }
    ]
  },

  technique_focus: {
    id: 'technique_focus',
    name: 'Technique, Mechanics & Stroke Economy',
    shortLabel: 'Technique Cycle',
    badge: 'Efficiency & SWOLF',
    accentColor: 'cyan',
    summary: 'Focuses entirely on motor learning, reducing hydrodynamic drag, perfecting EVF (early vertical forearm), and optimizing distance per stroke.',
    targetObjective: 'Eliminate technical stroke leakage, lower SWOLF scores squad-wide, and build bulletproof mechanics before high-intensity loads.',
    physiologicalAdaptation: 'Neuromuscular coordination, stroke rate to stroke length optimization, enhanced feel for water (sculling/EVF).',
    suggestedDurationWeeks: 6,
    weeklyStructureSummary: 'High drill concentration (40%+ of daily volume), video playback sets, snorkel alignment work, sculling, and varied stroke tempo trainers.',
    defaultWeeklyVolumeBase: 16000,
    benchmarks: [
      {
        metric: 'SWOLF Score (Time + Strokes)',
        targetDescription: 'Drop 50m SWOLF score by at least 3 points across primary stroke.',
        testProtocol: '8x50m continuous counting strokes + official split time.'
      },
      {
        metric: 'Distance Per Stroke (DPS)',
        targetDescription: 'Cover 50m freestyle in under 26 strokes with steady kick.',
        testProtocol: '4x50m DPS test holding maximum distance per pull cycle.'
      },
      {
        metric: 'Sculling & EVF Feel',
        targetDescription: 'Scull 4x25m head-first with unbroken propulsion and high elbows.',
        testProtocol: 'Front, middle, and dog-paddle scull sequence.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'Streamline Posture & Front-Quadrant Balance',
        phase: 'Base Phase',
        targetVolumeMeters: 15000,
        focus: 'Head Position & Spine Alignment',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Catch-up drills, zipper drills & snorkel balance sets'
      },
      {
        weekNumber: 2,
        theme: 'Catch Mechanics & Early Vertical Forearm (EVF)',
        phase: 'Build Phase',
        targetVolumeMeters: 16000,
        focus: 'Forearm Engagement (Fist & Scull)',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '6x50m Fist drill into open-hand feel + sculling progression'
      },
      {
        weekNumber: 3,
        theme: 'Rotational Power & Side Kick Streamlines',
        phase: 'Build Phase',
        targetVolumeMeters: 17000,
        focus: 'Hip-Driven Rotation (6-1-6 & 6-3-6)',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '8x50m 6-1-6 drill with fins, focus on sharp hip whip'
      },
      {
        weekNumber: 4,
        theme: 'Active Recovery & Medley Stroke Balance',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 12500,
        focus: 'Breaststroke & Butterfly Timing',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Breaststroke kick glide drills + 1-fly/2-free transition sets'
      },
      {
        weekNumber: 5,
        theme: 'SWOLF Pacing & Efficiency Ladders',
        phase: 'Build Phase',
        targetVolumeMeters: 16500,
        focus: 'Holding Low Stroke Count at Speed',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '8x50m Descend 1-4 holding exact same stroke count'
      },
      {
        weekNumber: 6,
        theme: 'Technical Graduation & SWOLF Benchmark Re-Test',
        phase: 'Threshold Peak',
        targetVolumeMeters: 14500,
        focus: 'Official SWOLF & Video Analysis Check',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '50m SWOLF final testing and stroke metric analysis'
      }
    ]
  },

  competition_peak: {
    id: 'competition_peak',
    name: 'Competition Peaking & Championship Taper',
    shortLabel: 'Competition Cycle',
    badge: 'Linear Periodization',
    accentColor: 'blue',
    summary: 'The classic 12-week championship periodization model transitioning methodically from Aerobic Base to Threshold, VO2 Max, Taper, and Race Week.',
    targetObjective: 'Achieve peak supercompensation and personal records at the targeted championship meet at the culmination of Week 12.',
    physiologicalAdaptation: 'Sequential conditioning of all bioenergetic pathways ending in muscle glycogen supercompensation and maximal neuromuscular freshness.',
    suggestedDurationWeeks: 12,
    weeklyStructureSummary: 'Traditional progressive macrocycle: 4w Base -> 3w Threshold Peak -> 2w Race Specificity -> 2w Progressive Taper -> 1w Championship Meet.',
    defaultWeeklyVolumeBase: 18000,
    benchmarks: [
      {
        metric: 'Championship Qualifying Standard',
        targetDescription: 'Achieve state or national qualifying cuts on targeted events.',
        testProtocol: 'Official championship timed finals.'
      },
      {
        metric: 'Taper Freshness Index',
        targetDescription: 'Feel explosive on race week dive sprints with low heart rate recovery.',
        testProtocol: 'Daily RPE checks, water feel sculls, and broken 50s.'
      }
    ],
    blueprints: [
      { weekNumber: 1, theme: 'Baseline & Aerobic Base', phase: 'Base Phase', targetVolumeMeters: 18000, focus: 'CSS Benchmarks', primaryEnergyZone: 'Aerobic (EN1)', keySessionHighlight: 'CSS 400/200 Baseline Test' },
      { weekNumber: 2, theme: 'Progressive Overload 1', phase: 'Build Phase', targetVolumeMeters: 19000, focus: 'Volume + CSS Ladders', primaryEnergyZone: 'Aerobic (EN1)', keySessionHighlight: 'Aerobic Ladder & Pull Sets' },
      { weekNumber: 3, theme: 'Threshold Expansion', phase: 'Build Phase', targetVolumeMeters: 20000, focus: 'EN2 Threshold Sets', primaryEnergyZone: 'Threshold (EN2)', keySessionHighlight: 'Dense CSS 100s with short rest' },
      { weekNumber: 4, theme: 'Active Recovery & Test', phase: 'Deload / Recovery', targetVolumeMeters: 14500, focus: 'Deload & 400m CSS Test', primaryEnergyZone: 'Recovery', keySessionHighlight: 'CSS Re-Test & Aerobic Flush' },
      { weekNumber: 5, theme: 'VO2Max Power Build', phase: 'Build Phase', targetVolumeMeters: 20500, focus: 'Aerobic Power + Kick', primaryEnergyZone: 'VO2Max (EN3)', keySessionHighlight: 'Broken 200s & VO2 max power' },
      { weekNumber: 6, theme: 'Peak Aerobic Volume', phase: 'Build Phase', targetVolumeMeters: 21500, focus: 'Highest Volume of Season', primaryEnergyZone: 'Aerobic (EN1)', keySessionHighlight: 'Aerobic ladder session' },
      { weekNumber: 7, theme: 'Threshold Density', phase: 'Threshold Peak', targetVolumeMeters: 20000, focus: 'Lactate Shuttling', primaryEnergyZone: 'Threshold (EN2)', keySessionHighlight: 'Over-Under 200s & negative splits' },
      { weekNumber: 8, theme: 'Mid-Season Deload', phase: 'Deload / Recovery', targetVolumeMeters: 15000, focus: 'Technique & Stroke Refinement', primaryEnergyZone: 'Recovery', keySessionHighlight: 'SWOLF check & technical tuneup' },
      { weekNumber: 9, theme: 'Race Pace Specificity', phase: 'Threshold Peak', targetVolumeMeters: 19000, focus: 'Broken 200s & Race Pace', primaryEnergyZone: 'Threshold (EN2)', keySessionHighlight: 'Broken race simulations' },
      { weekNumber: 10, theme: 'Taper Phase 1 - Volume Drop', phase: 'Taper Phase', targetVolumeMeters: 15500, focus: '-25% Volume, High Speed', primaryEnergyZone: 'Sprint (SP)', keySessionHighlight: 'Explosive breakouts & speed bursts' },
      { weekNumber: 11, theme: 'Taper Phase 2 - Power & Rest', phase: 'Taper Phase', targetVolumeMeters: 12000, focus: 'Starts, Relays & Speed', primaryEnergyZone: 'Sprint (SP)', keySessionHighlight: 'Dive starts & relay takeoffs' },
      { weekNumber: 12, theme: 'Championship Peak Week', phase: 'Race Week', targetVolumeMeters: 9000, focus: 'Championship Meet!', primaryEnergyZone: 'Sprint (SP)', keySessionHighlight: 'Championship Meet Day!' }
    ]
  }
};

/**
 * Reconfigures a season plan's macrocycle to match a chosen cycle focus
 */
export function applyCycleFocusToSeason(
  season: SeasonPlan,
  focusType: CycleFocusType,
  weeksCount?: number
): SeasonPlan {
  const preset = CYCLE_FOCUS_PRESETS[focusType] || CYCLE_FOCUS_PRESETS.competition_peak;
  const numWeeks = weeksCount || preset.suggestedDurationWeeks || season.totalWeeks || 8;

  // Build new or updated weeks matching the blueprints
  const newWeeks: WeekCycle[] = [];

  for (let w = 1; w <= numWeeks; w++) {
    // Check if blueprint exists for this week number, or cycle/interpolate
    const bpIndex = (w - 1) % preset.blueprints.length;
    const bp = preset.blueprints[bpIndex];

    // Find existing week data if any to preserve custom sessions
    const existingWeek = (season.weeks || []).find(ew => ew.weekNumber === w);

    let weekSessions: WorkoutSession[] = [];

    if (existingWeek && existingWeek.sessions && existingWeek.sessions.length > 0) {
      // Keep existing sessions but update theme and target volume
      weekSessions = existingWeek.sessions.map(s => ({
        ...s,
        weekNumber: w,
      }));
    } else {
      // Generate default sessions for this week based on schedule slots and inspiration plans
      const schedule = season.weeklySchedule || [];
      weekSessions = schedule.map((slot, sIdx) => {
        // Pick an inspiration plan matching the primary energy zone / focus
        let matchedInspiration = INSPIRATION_WORKOUTS.find(iw => {
          if (focusType === 'endurance_focus') return iw.totalDistance >= 4000 || iw.focus === 'Aerobic';
          if (focusType === 'threshold_focus') return iw.focus === 'Threshold';
          if (focusType === 'vo2max_focus') return iw.focus === 'Speed' || iw.tags?.includes('Tauchen');
          if (focusType === 'speed_power_focus') return iw.focus === 'Speed';
          return true;
        }) || INSPIRATION_WORKOUTS[sIdx % INSPIRATION_WORKOUTS.length];

        const session = convertInspirationToSession(matchedInspiration, w, slot.day);
        session.scheduledTime = `${slot.startTime} - ${slot.endTime}`;
        session.name = `W${w} ${slot.day}: ${bp.theme.split('&')[0].trim()} (${slot.primaryFocus})`;
        return session;
      });
    }

    const actualVol = weekSessions.reduce((sum, s) => sum + (s.totalDistance || 0), 0);

    newWeeks.push({
      weekNumber: w,
      theme: bp.theme,
      phase: bp.phase,
      targetVolumeMeters: bp.targetVolumeMeters,
      actualVolumeMeters: actualVol,
      sessions: weekSessions,
      isConfirmed: existingWeek ? existingWeek.isConfirmed : (w === 1),
      notes: `${preset.name} - ${bp.focus}. Key Highlight: ${bp.keySessionHighlight}`
    });
  }

  return {
    ...season,
    cycleFocus: focusType,
    cycleConfig: preset,
    totalWeeks: numWeeks,
    currentWeekNumber: Math.min(season.currentWeekNumber || 1, numWeeks),
    weeks: newWeeks,
    goal: `${preset.name}: ${preset.targetObjective}`,
    updatedAt: new Date().toISOString(),
  };
}
