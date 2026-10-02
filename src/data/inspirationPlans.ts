import { 
  SavedWorkoutItem, 
  WorkoutSession, 
  WorkoutBlock, 
  DayOfWeek 
} from '../types/swim';

export interface RawJsonPlan {
  plan_index: number;
  date_or_title: string;
  total_distance_km: number | null;
  workout_items: {
    description: string;
    distance_km: number | null;
  }[];
}

export const RAW_INSPIRATION_JSON: RawJsonPlan[] = [
  {
    plan_index: 1,
    date_or_title: "7/30/21",
    total_distance_km: 4.7,
    workout_items: [
      {
        description: "200 ein",
        distance_km: 0.2
      },
      {
        "description": "4x15 De Be vo oben",
        "distance_km": 0.1
      },
      {
        "description": "6x100 HS/NS Ar 100er",
        "distance_km": 0.6
      },
      {
        "description": "4x150 La 50/100",
        "distance_km": 0.6
      },
      {
        "description": "3x200 Flossen bel",
        "distance_km": 0.6
      },
      {
        "description": "Be/Ge/Be 200er",
        "distance_km": 0.8
      },
      {
        "description": "2x300 Rü/Kr 100er",
        "distance_km": 0.6
      },
      {
        "description": "200 aus",
        "distance_km": 0.2
      }
    ]
  },
  {
    plan_index: 2,
    date_or_title: "8/4/21",
    total_distance_km: 3.6,
    workout_items: [
      {
        description: "300 ein mit 2x25 tauschen",
        distance_km: 0.3
      },
      {
        description: "4x15 de Be 2Bauch/2Rücken",
        distance_km: 0.1
      },
      {
        description: "6x100 Lagen 25er P'20",
        distance_km: 0.6
      },
      {
        description: "4x200 Kraul GA1/GA2 Tempowechsel",
        distance_km: 0.8
      },
      {
        description: "8x50 Beine/Arme mit Brett",
        distance_km: 0.4
      },
      {
        description: "200 aus locker",
        distance_km: 0.2
      }
    ]
  }
];

export const INSPIRATION_WORKOUTS: SavedWorkoutItem[] = [
  {
    id: 'insp-plan-1',
    name: 'Plan 1 (7/30/21) - Medley, Pull & Fin Endurance',
    category: 'Coach Inspiration',
    focus: 'Threshold',
    totalDistance: 4700,
    estimatedMinutes: 90,
    source: 'coach_inspiration',
    originalPlanIndex: 1,
    tags: ['German Squad Base', 'Lagen / IM', 'Flossen', 'Be/Ge/Be', '4.7km'],
    notes: 'Classic championship endurance microcycle base with dolphin dives, stroke pull, and kick/swim sets.',
    blocks: [
      {
        id: 'insp-1-b1',
        type: 'warmup',
        title: 'Einschwimmen (Warm-Up)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i1',
            reps: 1,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '200 ein (Einschwimmen ruhig, langer Zug)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Easy stroke extension'
          }
        ]
      },
      {
        id: 'insp-1-b2',
        type: 'preset',
        title: 'Start & Dolphin Breakouts (4x15 De Be vo oben)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i2',
            reps: 4,
            distance: 25,
            stroke: 'Butterfly',
            intensity: 'Sprint (SP)',
            description: '4x15 De Be vo oben (Delphin-Beine Sprint vom Startblock/oben mit Fins, austrudeln)',
            equipment: ['Fins'],
            sendOffMode: 'fixed-interval',
            fixedInterval: '0:45',
            notes: 'Fast underwater kick rate & tight streamline'
          }
        ]
      },
      {
        id: 'insp-1-b3',
        type: 'main',
        title: 'Stroke Pull & Power (6x100 HS/NS Ar)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i3',
            reps: 6,
            distance: 100,
            stroke: 'Pull',
            intensity: 'Threshold (EN2)',
            description: '6x100 HS/NS Ar 100er (Hauptlage / Nebenlage Armzug im Wechsel)',
            equipment: ['Pull Buoy', 'Paddles'],
            sendOffMode: 'lane-scaled',
            notes: 'Strong EVF pull, clean body alignment'
          }
        ]
      },
      {
        id: 'insp-1-b4',
        type: 'secondary',
        title: 'Medley Transition (4x150 La 50/100)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i4',
            reps: 4,
            distance: 150,
            stroke: 'IM',
            intensity: 'Aerobic (EN1)',
            description: '4x150 La 50/100 (50m Fly/Back + 100m Breast/Free)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Smooth stroke transitions'
          }
        ]
      },
      {
        id: 'insp-1-b5',
        type: 'secondary',
        title: 'Fin Aerobic Pacing (3x200 Flossen bel)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i5',
            reps: 3,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Aerobic (EN1)',
            description: '3x200 Flossen beliebig (GA1 Tempo, lange Unterwasserphase)',
            equipment: ['Fins'],
            sendOffMode: 'lane-scaled',
            notes: 'Consistent kick rhythm'
          }
        ]
      },
      {
        id: 'insp-1-b6',
        type: 'secondary',
        title: 'Kick / Swim / Kick Medley (4x200 Be/Ge/Be)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i6',
            reps: 4,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Threshold (EN2)',
            description: 'Be/Ge/Be 200er (50m Beine / 100m Gesamt / 50m Beine)',
            equipment: ['Kickboard'],
            sendOffMode: 'lane-scaled',
            notes: 'High heart rate on kick finish'
          }
        ]
      },
      {
        id: 'insp-1-b7',
        type: 'secondary',
        title: 'Back / Free Alternator (2x300 Rü/Kr 100er)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i7',
            reps: 2,
            distance: 300,
            stroke: 'Choice',
            intensity: 'Aerobic (EN1)',
            description: '2x300 Rü/Kr 100er (100m Rücken / 100m Kraul / 100m Rücken)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Rotational power & steady kick'
          }
        ]
      },
      {
        id: 'insp-1-b8',
        type: 'cooldown',
        title: 'Ausschwimmen (Cool-Down)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i8',
            reps: 1,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '200 aus (Ausschwimmen ganz locker, Atmung normalisieren)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Flush lactic acid'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-2',
    name: 'Plan 2 (8/4/21) - Underwater Tauchen & IM 25er',
    category: 'Coach Inspiration',
    focus: 'Speed',
    totalDistance: 3600,
    estimatedMinutes: 75,
    source: 'coach_inspiration',
    originalPlanIndex: 2,
    tags: ['German Squad Base', 'Tauchen', 'Dolphin Belly/Back', 'Lagen P20', '3.6km'],
    notes: 'Underwater breakout lung capacity, dolphin position variation (belly & back), and fast 25m interval transitions.',
    blocks: [
      {
        id: 'insp-2-b1',
        type: 'warmup',
        title: 'Einschwimmen mit Tauchen (300 ein mit 2x25 tauchen)',
        rounds: 1,
        items: [
          {
            id: 'insp-2-i1',
            reps: 1,
            distance: 300,
            stroke: 'Freestyle',
            intensity: 'Aerobic (EN1)',
            description: '300 ein mit 2x25 tauchen (Unterwasser Delphinbeine / Streckentauchen)',
            equipment: ['Snorkel'],
            sendOffMode: 'lane-scaled',
            notes: 'Streamline & breath control'
          }
        ]
      },
      {
        id: 'insp-2-b2',
        type: 'preset',
        title: 'Dolphin Position Drills (4x15 de Be 2Bauch/2Rücken)',
        rounds: 1,
        items: [
          {
            id: 'insp-2-i2',
            reps: 4,
            distance: 25,
            stroke: 'Butterfly',
            intensity: 'Sprint (SP)',
            description: '4x15 de Be (2 Bauch / 2 Rücken - Delphinbeine 2x in Bauchlage, 2x in Rückenlage explosiv)',
            equipment: ['Fins'],
            sendOffMode: 'fixed-interval',
            fixedInterval: '0:50',
            notes: 'Equal up-kick and down-kick power'
          }
        ]
      },
      {
        id: 'insp-2-b3',
        type: 'main',
        title: 'IM Precision Set (6x100 Lagen 25er P\'20)',
        rounds: 1,
        items: [
          {
            id: 'insp-2-i3',
            reps: 6,
            distance: 100,
            stroke: 'IM',
            intensity: 'Threshold (EN2)',
            description: '6x100 Lagen 25er P\'20 (25 Fly, 25 Back, 25 Breast, 25 Free mit exakt 20s Pause)',
            equipment: [],
            sendOffMode: 'rest-after',
            restSeconds: 20,
            notes: 'Race turn transitions & underwater pullouts'
          }
        ]
      },
      {
        id: 'insp-2-b4',
        type: 'secondary',
        title: 'Threshold Volume & Pace Switch (4x200 GA1/GA2)',
        rounds: 1,
        items: [
          {
            id: 'insp-2-i4',
            reps: 4,
            distance: 200,
            stroke: 'Freestyle',
            intensity: 'Threshold (EN2)',
            description: '4x200 Kraul GA1/GA2 Tempowechsel (50m locker / 50m Renntempo)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Hold stroke count on fast 50s'
          }
        ]
      },
      {
        id: 'insp-2-b5',
        type: 'secondary',
        title: 'Kick & Arm Power (8x50 Beine/Arme mit Brett)',
        rounds: 1,
        items: [
          {
            id: 'insp-2-i5',
            reps: 8,
            distance: 50,
            stroke: 'Choice',
            intensity: 'Threshold (EN2)',
            description: '8x50 Beine/Arme mit Brett (Ungerade Beine hart, Gerade Arme Zug)',
            equipment: ['Kickboard', 'Paddles'],
            sendOffMode: 'lane-scaled',
            notes: 'Maximum kick cadence'
          }
        ]
      },
      {
        id: 'insp-2-b6',
        type: 'cooldown',
        title: 'Ausschwimmen (Cool-Down)',
        rounds: 1,
        items: [
          {
            id: 'insp-2-i6',
            reps: 1,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '200 aus locker (Rücken/Brust lang ziehen)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Full recovery'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-3',
    name: 'Plan 3 (Derived) - Speed Starts & Turn Transitions',
    category: 'Coach Inspiration',
    focus: 'Speed',
    totalDistance: 3800,
    estimatedMinutes: 80,
    source: 'coach_inspiration',
    originalPlanIndex: 3,
    tags: ['Start Breakouts', 'Starts & Turns', 'Medley', '3.8km'],
    notes: 'Derived from Plan 1 & 2 speed elements: explosive block starts, 15m breakout marks, and short-rest IM sprint clusters.',
    blocks: [
      {
        id: 'insp-3-b1',
        type: 'warmup',
        title: 'Warm-Up (400 ein mit 4x25 Tauchen)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i1',
            reps: 1,
            distance: 400,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '400m Einschwimmen mixed strokes, 4 underwater breakout dives',
            equipment: ['Snorkel'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-3-b2',
        type: 'preset',
        title: 'Explosive Dives & Turns (6x15m De Be vo oben)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i2',
            reps: 6,
            distance: 25,
            stroke: 'Butterfly',
            intensity: 'Sprint (SP)',
            description: '6x15m Delphin Beine vom Startblock voll, easy schwimmen zur Wende',
            equipment: ['Fins'],
            sendOffMode: 'fixed-interval',
            fixedInterval: '1:00'
          }
        ]
      },
      {
        id: 'insp-3-b3',
        type: 'main',
        title: 'Main Sprint Clusters (8x100 Lagen / Kraul)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i3',
            reps: 8,
            distance: 100,
            stroke: 'IM',
            intensity: 'Threshold (EN2)',
            description: '8x100 Lagen (25er Wechsel P\'20)',
            equipment: [],
            sendOffMode: 'rest-after',
            restSeconds: 20
          }
        ]
      },
      {
        id: 'insp-3-b4',
        type: 'secondary',
        title: 'Kick / Swim Recovery Ladder (3x300 Rü/Kr)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i4',
            reps: 3,
            distance: 300,
            stroke: 'Freestyle',
            intensity: 'Aerobic (EN1)',
            description: '3x300m Rü/Kr im 100er Wechsel (GA1 Pace)',
            equipment: ['Pull Buoy'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-3-b5',
        type: 'cooldown',
        title: 'Cool-Down (300 aus)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i5',
            reps: 1,
            distance: 300,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '300m Ausschwimmen easy double arm backstroke & choice',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-4',
    name: 'Plan 4 - VO2 Max Aerobic Power & Tauchen Breakouts',
    category: 'Coach Inspiration',
    focus: 'Speed',
    totalDistance: 4200,
    estimatedMinutes: 85,
    source: 'coach_inspiration',
    originalPlanIndex: 4,
    tags: ['VO2 Max', 'Tauchen', 'Aerobic Power', '4.2km'],
    notes: 'Derived from base plans focusing on VO2 Max (EN3), underwater hypoxic intervals, and high stroke rate retention under acidosis.',
    blocks: [
      {
        id: 'insp-4-b1',
        type: 'warmup',
        title: 'Warm-Up (400 ein mit 4x25 Tauchen)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i1',
            reps: 1,
            distance: 400,
            stroke: 'Freestyle',
            intensity: 'Recovery',
            description: '400m easy swim with snorkel & catch-up',
            equipment: ['Snorkel'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-4-b2',
        type: 'preset',
        title: 'Underwater Hypoxic Sprint (6x15m De Be vo oben)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i2',
            reps: 6,
            distance: 25,
            stroke: 'Butterfly',
            intensity: 'Sprint (SP)',
            description: '6x25m explosive dolphin kick from the block, easy swim finish',
            equipment: ['Fins'],
            sendOffMode: 'fixed-interval',
            fixedInterval: '1:00'
          }
        ]
      },
      {
        id: 'insp-4-b3',
        type: 'main',
        title: 'Main VO2 Max Repeats (12x100m @ 92% Effort)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i3',
            reps: 12,
            distance: 100,
            stroke: 'Freestyle',
            intensity: 'VO2Max (EN3)',
            description: '12x100m VO2 Max hold on 1:45 (30s rest, stroke rate > 38 SPM)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Max heart rate stimulation, hold stroke cadence'
          }
        ]
      },
      {
        id: 'insp-4-b4',
        type: 'secondary',
        title: 'Kick / Swim / Kick Aerobic Flush (4x200m Be/Ge/Be)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i4',
            reps: 4,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Aerobic (EN1)',
            description: '200m Be/Ge/Be (50m Kick / 100m Swim / 50m Kick)',
            equipment: ['Kickboard'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-4-b5',
        type: 'cooldown',
        title: 'Ausschwimmen (300m Cool-Down)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i5',
            reps: 1,
            distance: 300,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '300m easy flush and bilateral breathing',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-5',
    name: 'Plan 5 - 5km Pure Aerobic Foundation & Pull Ladder',
    category: 'Endurance',
    focus: 'Aerobic',
    totalDistance: 5000,
    estimatedMinutes: 95,
    source: 'coach_inspiration',
    originalPlanIndex: 5,
    tags: ['Endurance', '5km', 'Pull Ladder', 'Aerobic Engine'],
    notes: 'Classic squad endurance base with 3000m aerobic ladder, stroke pull overload, and kick volume.',
    blocks: [
      {
        id: 'insp-5-b1',
        type: 'warmup',
        title: 'Warm-Up (600 ein)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i1',
            reps: 1,
            distance: 600,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '200 Free / 200 Back / 200 Kick with board',
            equipment: ['Kickboard'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-5-b2',
        type: 'preset',
        title: 'Fin Aerobic Flow (4x200m Flossen bel)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i2',
            reps: 4,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Aerobic (EN1)',
            description: '4x200m with fins alternating freestyle and backstroke',
            equipment: ['Fins'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-5-b3',
        type: 'main',
        title: 'Aerobic Ladder Set (2400m Continuous Engine)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i3',
            reps: 1,
            distance: 800,
            stroke: 'Freestyle',
            intensity: 'Aerobic (EN1)',
            description: '800m Free steady aerobic rhythm (Base + 12s)',
            equipment: [],
            sendOffMode: 'lane-scaled'
          },
          {
            id: 'insp-5-i4',
            reps: 2,
            distance: 400,
            stroke: 'Pull',
            intensity: 'Aerobic (EN1)',
            description: '2x400m Pull with paddles & buoy',
            equipment: ['Pull Buoy', 'Paddles'],
            sendOffMode: 'lane-scaled'
          },
          {
            id: 'insp-5-i5',
            reps: 4,
            distance: 200,
            stroke: 'IM',
            intensity: 'Threshold (EN2)',
            description: '4x200m Medley transition descend 1 to 4',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-5-b4',
        type: 'secondary',
        title: 'Kick Aerobic Finisher (8x100m Beine mit Brett)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i6',
            reps: 8,
            distance: 100,
            stroke: 'Kick',
            intensity: 'Aerobic (EN1)',
            description: '8x100m kick holding steady split times',
            equipment: ['Kickboard'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-5-b5',
        type: 'cooldown',
        title: 'Cool-Down (400 aus)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i7',
            reps: 1,
            distance: 400,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '400m loosen arms and active recovery',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-6',
    name: 'Plan 6 - Threshold CSS Density & Lactate Clearance',
    category: 'Threshold',
    focus: 'Threshold',
    totalDistance: 4500,
    estimatedMinutes: 90,
    source: 'coach_inspiration',
    originalPlanIndex: 6,
    tags: ['Threshold', 'CSS Pacing', 'Lactate Clearance', '4.5km'],
    notes: 'Designed for Critical Swim Speed (CSS) density with short rest intervals and over-under pace variation.',
    blocks: [
      {
        id: 'insp-6-b1',
        type: 'warmup',
        title: 'Warm-Up (500 ein)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i1',
            reps: 1,
            distance: 500,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '300 Free / 100 Back / 100 IM Drill',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-6-b2',
        type: 'preset',
        title: 'IM Precision Set (6x100 Lagen 25er P20)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i2',
            reps: 6,
            distance: 100,
            stroke: 'IM',
            intensity: 'Threshold (EN2)',
            description: '6x100m Medley with 20 seconds rest between',
            equipment: [],
            sendOffMode: 'rest-after',
            restSeconds: 20
          }
        ]
      },
      {
        id: 'insp-6-b3',
        type: 'main',
        title: 'Main Threshold Challenge (16x100m @ CSS on 1:30)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i3',
            reps: 16,
            distance: 100,
            stroke: 'Freestyle',
            intensity: 'Threshold (EN2)',
            description: '16x100m holding exact CSS pace on lane-scaled intervals (5-8s rest)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Hold stroke count under 38 per 50m'
          }
        ]
      },
      {
        id: 'insp-6-b4',
        type: 'secondary',
        title: 'Lactate Clearance Over-Under (4x200m GA1/GA2)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i4',
            reps: 4,
            distance: 200,
            stroke: 'Freestyle',
            intensity: 'Threshold (EN2)',
            description: '50m Sprint / 50m CSS / 50m Sprint / 50m Easy',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-6-b5',
        type: 'cooldown',
        title: 'Cool-Down (300 aus)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i5',
            reps: 1,
            distance: 300,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '300m easy flush and deck stretches',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      }
    ]
  }
];

export function convertInspirationToSession(
  item: SavedWorkoutItem,
  weekNumber: number,
  dayOfWeek: DayOfWeek = 'Monday'
): WorkoutSession {
  return {
    id: `w${weekNumber}-s-${Date.now()}`,
    weekNumber,
    dayOfWeek,
    scheduledTime: '06:00 - 07:30',
    name: item.name,
    focus: item.focus,
    totalDistance: item.totalDistance,
    estimatedMinutes: item.estimatedMinutes,
    confirmed: false,
    blocks: JSON.parse(JSON.stringify(item.blocks))
  };
}
