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
    name: 'Plan 1 (30.07.21) – Lagen, Armzug & Flossenausdauer',
    category: 'Coach Inspiration',
    focus: 'Threshold',
    totalDistance: 4700,
    estimatedMinutes: 90,
    source: 'coach_inspiration',
    originalPlanIndex: 1,
    tags: ['Kader-Grundlage', 'Lagen', 'Flossen', 'Be/Ge/Be', '4.7km'],
    notes: 'Klassische Meisterschafts-Grundlage mit Startsprüngen, Haupt-/Nebenlagen-Zug und Beine/Gesamt/Beine.',
    blocks: [
      {
        id: 'insp-1-b1',
        type: 'warmup',
        title: 'Einschwimmen (200m ein)',
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
            notes: 'Ruhige Gleitphase'
          }
        ]
      },
      {
        id: 'insp-1-b2',
        type: 'preset',
        title: 'Startblock & Delphinkicks (4x15 De Be vo oben)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i2',
            reps: 4,
            distance: 25,
            stroke: 'Butterfly',
            intensity: 'Sprint (SP)',
            description: '4x15 De Be vo oben (Delphin-Beine Sprint vom Startblock/oben mit Flossen, austrudeln)',
            equipment: ['Fins'],
            sendOffMode: 'fixed-interval',
            fixedInterval: '0:45',
            notes: 'Hohe Kickfrequenz & enge Streamline'
          }
        ]
      },
      {
        id: 'insp-1-b3',
        type: 'main',
        title: 'Hauptlagen & Nebenlagen Armzug (6x100 HS/NS Ar)',
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
            notes: 'Hoher Ellbogen, stabiler Rumpf'
          }
        ]
      },
      {
        id: 'insp-1-b4',
        type: 'secondary',
        title: 'Lagenwechsel (4x150 La 50/100)',
        rounds: 1,
        items: [
          {
            id: 'insp-1-i4',
            reps: 4,
            distance: 150,
            stroke: 'IM',
            intensity: 'Aerobic (EN1)',
            description: '4x150 La 50/100 (50m Delphin/Rücken + 100m Brust/Kraul)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Flüssige Wendenübergänge'
          }
        ]
      },
      {
        id: 'insp-1-b5',
        type: 'secondary',
        title: 'Flossenausdauer (3x200 Flossen bel)',
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
            notes: 'Konstanter Beinschlagrhythmus'
          }
        ]
      },
      {
        id: 'insp-1-b6',
        type: 'secondary',
        title: 'Beine / Gesamt / Beine Lagen (4x200 Be/Ge/Be)',
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
            notes: 'Puls hochhalten auf dem Beine-Abschluss'
          }
        ]
      },
      {
        id: 'insp-1-b7',
        type: 'secondary',
        title: 'Rücken / Kraul Wechsel (2x300 Rü/Kr 100er)',
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
            notes: 'Gleichmäßige Rumpfrotation'
          }
        ]
      },
      {
        id: 'insp-1-b8',
        type: 'cooldown',
        title: 'Ausschwimmen (200m aus)',
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
            notes: 'Laktat abbauen'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-2',
    name: 'Plan 2 (04.08.21) – Strecktauchen & Lagen 25er',
    category: 'Coach Inspiration',
    focus: 'Speed',
    totalDistance: 3600,
    estimatedMinutes: 75,
    source: 'coach_inspiration',
    originalPlanIndex: 2,
    tags: ['Kader-Grundlage', 'Tauchen', 'Delphin Bauch/Rücken', 'Lagen P20', '3.6km'],
    notes: 'Unterwasser-Tauchphasen, Delphinlage-Wechsel (Bauch & Rücken) und zügige 25m Lagenübergänge.',
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
            notes: 'Streamline & Atemdisziplin'
          }
        ]
      },
      {
        id: 'insp-2-b2',
        type: 'preset',
        title: 'Delphin-Positionsübung (4x15 de Be 2Bauch/2Rücken)',
        rounds: 1,
        items: [
          {
            id: 'insp-2-i2',
            reps: 4,
            distance: 25,
            stroke: 'Butterfly',
            intensity: 'Sprint (SP)',
            description: '4x15 de Be (2 Bauch / 2 Rücken – Delphinbeine 2x in Bauchlage, 2x in Rückenlage explosiv)',
            equipment: ['Fins'],
            sendOffMode: 'fixed-interval',
            fixedInterval: '0:50',
            notes: 'Gleiche Kraft im Auf- und Abwärtsschlag'
          }
        ]
      },
      {
        id: 'insp-2-b3',
        type: 'main',
        title: 'Lagen-Präzisionsserie (6x100 Lagen 25er P\'20)',
        rounds: 1,
        items: [
          {
            id: 'insp-2-i3',
            reps: 6,
            distance: 100,
            stroke: 'IM',
            intensity: 'Threshold (EN2)',
            description: '6x100 Lagen 25er P\'20 (25 Delphin, 25 Rücken, 25 Brust, 25 Kraul mit exakt 20s Pause)',
            equipment: [],
            sendOffMode: 'rest-after',
            restSeconds: 20,
            notes: 'Wendenübergänge & Tauchphasen'
          }
        ]
      },
      {
        id: 'insp-2-b4',
        type: 'secondary',
        title: 'Schwellenvolumen & Tempowechsel (4x200 GA1/GA2)',
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
            notes: 'Zugzahl auf schnellen 50ern halten'
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
    name: 'Plan 3 – Startsprünge, Wendenübergänge & Lagen-Cluster',
    category: 'Coach Inspiration',
    focus: 'Speed',
    totalDistance: 3800,
    estimatedMinutes: 80,
    source: 'coach_inspiration',
    originalPlanIndex: 3,
    tags: ['Startsprünge', 'Starts & Wenden', 'Lagen', '3.8km'],
    notes: 'Kombiniert Schnelligkeitselemente: Explosive Starts vom Block, 15m Tauchphasen und Lagen-Sprintcluster mit kurzer Pause.',
    blocks: [
      {
        id: 'insp-3-b1',
        type: 'warmup',
        title: 'Einschwimmen (400 ein mit 4x25 Tauchen)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i1',
            reps: 1,
            distance: 400,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '400m Einschwimmen Lagenwechsel, 4 Unterwasser-Auftauchphasen',
            equipment: ['Snorkel'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-3-b2',
        type: 'preset',
        title: 'Explosive Starts & Wenden (6x15m De Be vo oben)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i2',
            reps: 6,
            distance: 25,
            stroke: 'Butterfly',
            intensity: 'Sprint (SP)',
            description: '6x15m Delphin-Beine vom Startblock voll, locker zur Wende schwimmen',
            equipment: ['Fins'],
            sendOffMode: 'fixed-interval',
            fixedInterval: '1:00'
          }
        ]
      },
      {
        id: 'insp-3-b3',
        type: 'main',
        title: 'Haupt-Sprintcluster (8x100 Lagen / Kraul)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i3',
            reps: 8,
            distance: 100,
            stroke: 'IM',
            intensity: 'Threshold (EN2)',
            description: '8x100 Lagen (25er Wechsel mit 20s Pause)',
            equipment: [],
            sendOffMode: 'rest-after',
            restSeconds: 20
          }
        ]
      },
      {
        id: 'insp-3-b4',
        type: 'secondary',
        title: 'Beine / Schwimmen Erholungsleiter (3x300 Rü/Kr)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i4',
            reps: 3,
            distance: 300,
            stroke: 'Freestyle',
            intensity: 'Aerobic (EN1)',
            description: '3x300m Rü/Kr im 100er Wechsel (GA1 Tempo)',
            equipment: ['Pull Buoy'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-3-b5',
        type: 'cooldown',
        title: 'Ausschwimmen (300m aus)',
        rounds: 1,
        items: [
          {
            id: 'insp-3-i5',
            reps: 1,
            distance: 300,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '300m Ausschwimmen locker Doppelarm-Rücken & beliebig',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-4',
    name: 'Plan 4 – VO2max Aerobe Power & Tauchphasen',
    category: 'Coach Inspiration',
    focus: 'Speed',
    totalDistance: 4200,
    estimatedMinutes: 85,
    source: 'coach_inspiration',
    originalPlanIndex: 4,
    tags: ['VO2max', 'Tauchen', 'Aerobe Power', '4.2km'],
    notes: 'VO2max-Leistung (WSA), hypoxische Unterwasserintervalle und Beibehaltung hoher Frequenz unter Laktat.',
    blocks: [
      {
        id: 'insp-4-b1',
        type: 'warmup',
        title: 'Einschwimmen (400 ein mit 4x25 Tauchen)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i1',
            reps: 1,
            distance: 400,
            stroke: 'Freestyle',
            intensity: 'Recovery',
            description: '400m lockeres Einschwimmen mit Schnorchel & Abschlag-Kraul',
            equipment: ['Snorkel'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-4-b2',
        type: 'preset',
        title: 'Unterwasser-Hypoxie-Sprint (6x15m De Be vo oben)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i2',
            reps: 6,
            distance: 25,
            stroke: 'Butterfly',
            intensity: 'Sprint (SP)',
            description: '6x25m explosive Delphinbeine vom Block, lockeres Ausschwimmen',
            equipment: ['Fins'],
            sendOffMode: 'fixed-interval',
            fixedInterval: '1:00'
          }
        ]
      },
      {
        id: 'insp-4-b3',
        type: 'main',
        title: 'Hauptserie VO2max-Wiederholungen (12x100m @ 92% Leistung)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i3',
            reps: 12,
            distance: 100,
            stroke: 'Freestyle',
            intensity: 'VO2Max (EN3)',
            description: '12x100m VO2max halten auf 1:45 (30s Pause, Frequenz > 38 SPM)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Maximaler Herzfrequenz-Reiz, Frequenz halten'
          }
        ]
      },
      {
        id: 'insp-4-b4',
        type: 'secondary',
        title: 'Beine / Schwimmen / Beine aerobe Spülung (4x200m Be/Ge/Be)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i4',
            reps: 4,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Aerobic (EN1)',
            description: '200m Be/Ge/Be (50m Beine / 100m Gesamt / 50m Beine)',
            equipment: ['Kickboard'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-4-b5',
        type: 'cooldown',
        title: 'Ausschwimmen (300m aus)',
        rounds: 1,
        items: [
          {
            id: 'insp-4-i5',
            reps: 1,
            distance: 300,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '300m lockeres Ausschwimmen mit bilateraler Atmung',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-5',
    name: 'Plan 5 – 5km Reine Grundlagenausdauer & Armzug-Leiter',
    category: 'Endurance',
    focus: 'Aerobic',
    totalDistance: 5000,
    estimatedMinutes: 95,
    source: 'coach_inspiration',
    originalPlanIndex: 5,
    tags: ['Ausdauer', '5km', 'Armzug-Leiter', 'Aerobe Basis'],
    notes: 'Klassische Kader-Grundlagenausdauer mit 3000m aerober Leiter, Armzugbelastung und hohem Beinschlagvolumen.',
    blocks: [
      {
        id: 'insp-5-b1',
        type: 'warmup',
        title: 'Einschwimmen (600m ein)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i1',
            reps: 1,
            distance: 600,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '200 Kraul / 200 Rücken / 200 Beine mit Brett',
            equipment: ['Kickboard'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-5-b2',
        type: 'preset',
        title: 'Flossen-Dauerschwimmen (4x200m Flossen bel)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i2',
            reps: 4,
            distance: 200,
            stroke: 'Choice',
            intensity: 'Aerobic (EN1)',
            description: '4x200m mit Flossen im Wechsel Kraul und Rücken',
            equipment: ['Fins'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-5-b3',
        type: 'main',
        title: 'Aerobe Leiter (2400m kontinuierliche Ausdauer)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i3',
            reps: 1,
            distance: 800,
            stroke: 'Freestyle',
            intensity: 'Aerobic (EN1)',
            description: '800m Kraul gleichmäßiger aerober Rhythmus (Basis + 12s)',
            equipment: [],
            sendOffMode: 'lane-scaled'
          },
          {
            id: 'insp-5-i4',
            reps: 2,
            distance: 400,
            stroke: 'Pull',
            intensity: 'Aerobic (EN1)',
            description: '2x400m Arme mit Paddles & Pullbuoy',
            equipment: ['Pull Buoy', 'Paddles'],
            sendOffMode: 'lane-scaled'
          },
          {
            id: 'insp-5-i5',
            reps: 4,
            distance: 200,
            stroke: 'IM',
            intensity: 'Threshold (EN2)',
            description: '4x200m Lagenübergänge 1 bis 4 steigernd',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-5-b4',
        type: 'secondary',
        title: 'Beinschlag-Abschluss (8x100m Beine mit Brett)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i6',
            reps: 8,
            distance: 100,
            stroke: 'Kick',
            intensity: 'Aerobic (EN1)',
            description: '8x100m Beine mit konstanten Zwischenzeiten',
            equipment: ['Kickboard'],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-5-b5',
        type: 'cooldown',
        title: 'Ausschwimmen (400m aus)',
        rounds: 1,
        items: [
          {
            id: 'insp-5-i7',
            reps: 1,
            distance: 400,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '400m Arme lockern und aktive Regeneration',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      }
    ]
  },
  {
    id: 'insp-plan-6',
    name: 'Plan 6 – Schwellentraining (CSS) & Laktat-Kompensation',
    category: 'Threshold',
    focus: 'Threshold',
    totalDistance: 4500,
    estimatedMinutes: 90,
    source: 'coach_inspiration',
    originalPlanIndex: 6,
    tags: ['Schwellentraining', 'CSS-Pacing', 'Laktattoleranz', '4.5km'],
    notes: 'Kritische Schwimmgeschwindigkeit (CSS) mit kurzen Pausen und Over-Under Tempowechseln.',
    blocks: [
      {
        id: 'insp-6-b1',
        type: 'warmup',
        title: 'Einschwimmen (500m ein)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i1',
            reps: 1,
            distance: 500,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '300 Kraul / 100 Rücken / 100 Lagen-Technik',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-6-b2',
        type: 'preset',
        title: 'Lagen-Präzisionsserie (6x100 Lagen 25er P20)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i2',
            reps: 6,
            distance: 100,
            stroke: 'IM',
            intensity: 'Threshold (EN2)',
            description: '6x100m Lagen mit je 20 Sekunden Pause',
            equipment: [],
            sendOffMode: 'rest-after',
            restSeconds: 20
          }
        ]
      },
      {
        id: 'insp-6-b3',
        type: 'main',
        title: 'Hauptserie Schwellenhärte (16x100m @ CSS auf 1:30)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i3',
            reps: 16,
            distance: 100,
            stroke: 'Freestyle',
            intensity: 'Threshold (EN2)',
            description: '16x100m exaktes CSS-Tempo halten auf bahnenskaliertem Abgang (5-8s Pause)',
            equipment: [],
            sendOffMode: 'lane-scaled',
            notes: 'Zugzahl unter 38 Zügen pro 50m halten'
          }
        ]
      },
      {
        id: 'insp-6-b4',
        type: 'secondary',
        title: 'Laktat-Kompensation Over-Under (4x200m GA1/GA2)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i4',
            reps: 4,
            distance: 200,
            stroke: 'Freestyle',
            intensity: 'Threshold (EN2)',
            description: '50m Sprint / 50m CSS / 50m Sprint / 50m Locker',
            equipment: [],
            sendOffMode: 'lane-scaled'
          }
        ]
      },
      {
        id: 'insp-6-b5',
        type: 'cooldown',
        title: 'Ausschwimmen (300m aus)',
        rounds: 1,
        items: [
          {
            id: 'insp-6-i5',
            reps: 1,
            distance: 300,
            stroke: 'Choice',
            intensity: 'Recovery',
            description: '300m lockeres Ausspülen und Dehnen am Beckenrand',
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
