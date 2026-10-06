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
    name: 'Ausdauer- & Grundlagenausdauerblock (GA1/GA2)',
    shortLabel: 'Ausdauer-Zyklus',
    badge: 'Aerobe Basis (GA1/GA2)',
    accentColor: 'emerald',
    summary: 'Konzentriert sich auf den Ausbau der mitochondrialen Dichte, der Bewegungseffizienz und der kontinuierlichen aeroben Leistungsfähigkeit ohne verfrühtes Tapering.',
    targetObjective: 'Nachhaltige Steigerung der wöchentlichen Kilometerleistung, Aufbau tiefer aerober Kapillarnetzwerke und Kräftigung der Beinkraft für 400m+ Strecken.',
    physiologicalAdaptation: 'Mitochondrien-Biogenese, vergrößertes Schlagvolumen des Herzens, optimierte Glykogenspeicherung und Laktatabbau im aeroben Gleichgewicht.',
    suggestedDurationWeeks: 8,
    weeklyStructureSummary: 'Verhältnis von 3 Belastungswochen : 1 Regenerationswoche. Hoher Anteil an aeroben Dauertreppen (300m–800m), Pullbuoy-Ausdauer und Beinschlagserien.',
    defaultWeeklyVolumeBase: 19500,
    benchmarks: [
      {
        metric: 'Kritische Schwimmgeschwindigkeit (CSS)',
        targetDescription: 'Ermittlung der verlässlichen Basis-CSS über 400m & 200m Zeitschwimmen.',
        testProtocol: '400m Kraul auf Zeit + 15 Min. aktive Pause + 200m Kraul auf Zeit.'
      },
      {
        metric: 'Aerobe Herzfrequenz-Stabilität',
        targetDescription: 'Herzfrequenz unter 145 bpm bei CSS + 6s über 3000m Gesamtarbeit halten.',
        testProtocol: '3x1000m oder 6x500m mit 20s Pause, Überwachung von Zugzahl und Puls.'
      },
      {
        metric: 'Beinschlag-Grundlagenausdauer',
        targetDescription: '10x100m Beine mit Abweichungen unter 5 Sekunden absolvieren.',
        testProtocol: '10x100m Beine mit Brett auf Abgang Basis + 25s.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'Aerobe Grundlage & Zugzahl-Benchmark',
        phase: 'Base Phase',
        targetVolumeMeters: 18000,
        focus: 'Aerobe Basis & SWOLF-Kontrolle',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '5x300m Kraul 1-5 steigernd + 6x50m Beine mit konstantem Tempo'
      },
      {
        weekNumber: 2,
        theme: 'Progressive aerobe Kilometer & Gleitweite pro Zug',
        phase: 'Build Phase',
        targetVolumeMeters: 19500,
        focus: 'Umfangsaufbau & Zuglänge',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '2400m Aerobe Pyramide (600-400-300-200) @ Basis + 10s'
      },
      {
        weekNumber: 3,
        theme: 'Ausdauerspitze & Armzug-Überlastung',
        phase: 'Build Phase',
        targetVolumeMeters: 21000,
        focus: 'Umfangsspitze 1 & Zugausdauer',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '6x300m Arme mit Paddles auf 4:15 + 4x150m Be/Ge/Be Beine/Schwimmen'
      },
      {
        weekNumber: 4,
        theme: 'Zwischenzyklus-Erholung & Laktat-Spülung',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 15000,
        focus: 'Zyklus-Halbzeit 400m/200m CSS-Test',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Offizieller CSS-Test (400m + 200m) + 1000m aktives Ausschwimmen'
      },
      {
        weekNumber: 5,
        theme: 'Erweiterter aerober Umfang & Langbahn-Simulation',
        phase: 'Build Phase',
        targetVolumeMeters: 20500,
        focus: 'Konstantes Pacing auf CSS + 4s',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '10x200m Kraul auf festem Abgang (Split-Schwankung max. 1.5s)'
      },
      {
        weekNumber: 6,
        theme: 'Maximaler aerober Umfang & Lagen-Ausdauer',
        phase: 'Build Phase',
        targetVolumeMeters: 22000,
        focus: 'Höchster Saisonumfang & Lagen-Balance',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '4x(300m Kraul + 150m Lagen + 100m Beine) – 3.6km Einheit'
      },
      {
        weekNumber: 7,
        theme: 'Ausdauerkonsolidierung & Schwellenbrücke',
        phase: 'Build Phase',
        targetVolumeMeters: 19500,
        focus: 'Untere Schwellendichte',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '6x300m Negative Split (erste 150m locker, zweite 150m forciert)'
      },
      {
        weekNumber: 8,
        theme: 'Zyklusabschluss & 30-Minuten-Dauertest',
        phase: 'Threshold Peak',
        targetVolumeMeters: 16500,
        focus: 'T-30 Dauerschwimm-Leistungstest',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '30-Minuten-Dauertest auf Gesamtmeter und Zugeffizienz'
      }
    ]
  },

  threshold_focus: {
    id: 'threshold_focus',
    name: 'Schwellen- & CSS-Entwicklungsblock (GA2/ANS)',
    shortLabel: 'Schwellen-Zyklus',
    badge: 'Anaerobe Schwelle (GA2)',
    accentColor: 'amber',
    summary: 'Verschiebung der individuellen anaeroben Schwelle nach rechts, Erhöhung der Laktat-Eliminationsrate und Beibehaltung des Renntempos unter Azidose.',
    targetObjective: 'Senkung der CSS-Durchschnittszeit des Kaders um 2–4 Sekunden pro 100m durch dichte Intervallserien, negative Splits und straffe Pausengestaltung.',
    physiologicalAdaptation: 'Laktat-Shuttling über Monocarboxylat-Transporter (MCT1/4), Ausbau der muskulären Pufferkapazität und mentale Härte bei brennender Muskulatur.',
    suggestedDurationWeeks: 8,
    weeklyStructureSummary: '3 gezielte Schwelleneinheiten pro Woche: (1) CSS-Intervallwiederholungen, (2) Negative-Split-Pacing, (3) Laktatabbau-Erholungsbrücke.',
    defaultWeeklyVolumeBase: 18000,
    benchmarks: [
      {
        metric: 'CSS-Abgangsintervall',
        targetDescription: '15x100m auf Basis-CSS + 5s Abgang mit unter 5s Pause halten.',
        testProtocol: '15x100m Kraul innerhalb von 1.0s der aktuellen CSS geschwommen.'
      },
      {
        metric: 'Laktattoleranz Teilstrecke 400m',
        targetDescription: 'Gebrochene 400m (4x100m mit 10s Pause) schneller als Einzelbestzeit schwimmen.',
        testProtocol: '4x100m @ CSS - 2s mit 10s Pause + 200m aktives Lockerschwimmen.'
      },
      {
        metric: 'Stufenserien 200m',
        targetDescription: '5x200m von Grundlagenausdauer bis All-Out-Schwelle steigern.',
        testProtocol: '5x200m Kraul auf Basis + 20s, 1 bis 5 steigernd.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'CSS-Kalibrierung & Synchronisation der Abgangszeiten',
        phase: 'Base Phase',
        targetVolumeMeters: 17500,
        focus: 'Bahnen-Basiszeiten & Abgangsüberprüfung',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '10x100m @ CSS auf bahnenskalierter Abgangszeit (5–8s Zielpause)'
      },
      {
        weekNumber: 2,
        theme: 'Schwellendichte & Kurzpausen-Cluster',
        phase: 'Build Phase',
        targetVolumeMeters: 18500,
        focus: 'Laktat-Gleichgewichtszustand (Steady State)',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '3x(4x100m CSS) auf 1:25 mit 1 Min. Serienpause'
      },
      {
        weekNumber: 3,
        theme: 'Stufenleitern & Negative Splits',
        phase: 'Build Phase',
        targetVolumeMeters: 19500,
        focus: 'Pacing-Disziplin unter Ermüdung',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '3x(200m CSS + 2x100m CSS-1s + 4x50m CSS-2s)'
      },
      {
        weekNumber: 4,
        theme: 'Entlastung & Laktat-Ausspülung',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 14000,
        focus: 'Laktatabbau & technische Neujustierung',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Technikübungen + 6x100m lockeres Ziehen mit Schnorchel'
      },
      {
        weekNumber: 5,
        theme: 'Schwellenvolumen-Spitze & lange Intervalle',
        phase: 'Threshold Peak',
        targetVolumeMeters: 20000,
        focus: 'Längere Schwellenintervalle (300m & 400m)',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '4x400m auf CSS-Tempo mit nur 15s Pause'
      },
      {
        weekNumber: 6,
        theme: 'Laktattoleranz & Tempohärte',
        phase: 'Threshold Peak',
        targetVolumeMeters: 19500,
        focus: 'Ziel: CSS minus 1 Sekunde',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '16x100m im Wechsel: ungerade @ CSS, gerade @ CSS - 2s'
      },
      {
        weekNumber: 7,
        theme: 'Over-Under Laktat-Kompensationsserien',
        phase: 'Threshold Peak',
        targetVolumeMeters: 18500,
        focus: 'Wechselspiel aerober/anaerober Grenzbereich',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '6x200m (50m Sprint / 150m CSS-Halten) kontinuierlich'
      },
      {
        weekNumber: 8,
        theme: 'Zyklus-Challenge & Re-Test der Kader-CSS',
        phase: 'Threshold Peak',
        targetVolumeMeters: 16000,
        focus: 'Offizieller CSS-Re-Test des Kaders',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: 'Re-Test 400m + 200m Zeitschwimmen und Tempogewinne vergleichen'
      }
    ]
  },

  vo2max_focus: {
    id: 'vo2max_focus',
    name: 'VO2max & Aerobe Spitzenleistungsblock',
    shortLabel: 'VO2max-Zyklus',
    badge: 'Aerobe Spitzenleistung (WSA)',
    accentColor: 'rose',
    summary: 'Ausbau der maximalen Sauerstoffaufnahme (VO2max), Vergrößerung des Herz-Schlagvolumens und Halten hoher Schlagfrequenzen unter anaerober Beanspruchung.',
    targetObjective: 'Maximierung des Herz-Kreislauf-Outputs durch intensive 50m bis 150m Wiederholungen bei 90–95% Maximalleistung mit disziplinierten 1:1 oder 1:1.5 Belastungs-Pausen-Verhältnissen.',
    physiologicalAdaptation: 'Maximale Sauerstoffaufnahmerate, Vergrößerung des linksventrikulären Herzschlagvolumens, Rekrutierung schneller motorischer Einheiten.',
    suggestedDurationWeeks: 6,
    weeklyStructureSummary: '2–3 hochintensive VO2max-Einheiten pro Woche, ergänzt durch tiefe aerobe Regeneration und Technikeinheiten. Reduzierter Gesamtwochenumfang bei akuter Intensitätsdichte.',
    defaultWeeklyVolumeBase: 16500,
    benchmarks: [
      {
        metric: '100m VO2max Wiederholungsgeschwindigkeit',
        targetDescription: '8x100m bei 92–95% Maximalgeschwindigkeit auf 2:00 Abgang halten.',
        testProtocol: '8x100m Kraul All-Out Durchschnittszeit dokumentieren.'
      },
      {
        metric: 'Unterwasser-Power-Breakout',
        targetDescription: '6x50m mit 15m legalem Unterwasser-Kick und explosivem Auftauchen.',
        testProtocol: '6x50m Delphin/Kraul mit Flossen auf 1:15 Abgang.'
      },
      {
        metric: 'Zugfrequenz-Konstanz bei Übersäuerung',
        targetDescription: 'Zugfrequenz über 38 Zügen/Min. auf den letzten 50m einer gebrochenen 200m halten.',
        testProtocol: '4x50m mit 10s Pause unter Einsatz des Tempo Trainers.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'Aerobe Leistungsaktivierung & Herzfrequenz-Spitzen',
        phase: 'Base Phase',
        targetVolumeMeters: 16000,
        focus: 'Maximalpuls-Aktivierung & 50m Schnellkraft',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: '12x50m @ VO2max auf 1:05 (1:1 Belastungs-Pausen-Verhältnis)'
      },
      {
        weekNumber: 2,
        theme: '100m Wiederholungsüberlastung & Laktattoleranz',
        phase: 'Build Phase',
        targetVolumeMeters: 17000,
        focus: 'Hohe Sauerstoffaufnahme unter Belastung',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: '8x100m @ 92% Leistung auf 2:15 mit 30s Pause'
      },
      {
        weekNumber: 3,
        theme: 'Gebrochene 200m & Hohe Schlagfrequenz',
        phase: 'Build Phase',
        targetVolumeMeters: 17500,
        focus: 'Renntempo auf Teilstrecken',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: '3x [4x50m mit :10 Pause] im 200m Renntempo'
      },
      {
        weekNumber: 4,
        theme: 'Aktive Erholung & Strecktauchen-Reset',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 13000,
        focus: 'Entlastung, Lungenvolumen & Technik',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Tauchphasen, Streamline-Effizienz & 2000m lockeres Schwimmen'
      },
      {
        weekNumber: 5,
        theme: 'Maximale aerobe Leistungsspitze (75m & 100m)',
        phase: 'Threshold Peak',
        targetVolumeMeters: 18000,
        focus: 'Spitzenreiz für das Herz-Kreislauf-System',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: '6x75m Vollgas auf 1:45 + 4x100m zügiges Ziehen mit Paddles'
      },
      {
        weekNumber: 6,
        theme: 'Leistungstest & 8x100 Benchmark-Prüfung',
        phase: 'Threshold Peak',
        targetVolumeMeters: 15000,
        focus: 'Offizieller 8x100m VO2max Leistungstest',
        primaryEnergyZone: 'VO2Max (EN3)',
        keySessionHighlight: 'Offizielle 8x100m All-Out Zeitnahme & Kader-Ranking'
      }
    ]
  },

  speed_power_focus: {
    id: 'speed_power_focus',
    name: 'Schnelligkeit, Starts & Neuromuskuläre Power',
    shortLabel: 'Sprint- & Kraftzyklus',
    badge: 'Anaerober Sprint (SP)',
    accentColor: 'purple',
    summary: 'Maximalgeschwindigkeit, Reaktionszeit am Startblock, 15m-Auftauchgeschwindigkeit und explosive ATP-CP-Leistungsentfaltung.',
    targetObjective: 'Explosivkraft für 50m und 100m Sprintstrecken mit vollständigen Phosphagensystem-Erholungszeiten (1:4 bis 1:6 Belastungs-Pausen-Verhältnis).',
    physiologicalAdaptation: 'Rekrutierung schneller Muskelfasern (Typ IIx), Steigerung der Kraftbildungsgeschwindigkeit (RFD) und Regeneration der ATP-Speicher.',
    suggestedDurationWeeks: 6,
    weeklyStructureSummary: 'Qualität vor Quantität. Explosive 15–25m Sprints vom Block, Widerstandsschwimmen mit Fallschirm, Übergeschwindigkeit mit Flossen, großzügige Pausen.',
    defaultWeeklyVolumeBase: 15000,
    benchmarks: [
      {
        metric: '15m Unterwasser-Auftauchzeit',
        targetDescription: 'Unter 5,8s vom Startsprung bis zur 15m-Auftauchboje erzielen.',
        testProtocol: 'Startsprünge vom Block mit elektronischer Zeitmessung/Stoppuhr bei 15m.'
      },
      {
        metric: '25m Höchstgeschwindigkeit mit Start',
        targetDescription: 'Persönliche Bestzeit auf 25m mit Startsprung und unter 12 Armzügen.',
        testProtocol: '6x25m All-Out vom Startblock mit je 2:30 Min. voller Erholungspause.'
      },
      {
        metric: 'Staffelwechsel-Reaktionszeit',
        targetDescription: 'Regelkonforme Staffelwechselzeit zwischen +0,08s und +0,22s.',
        testProtocol: '10 Staffelwechsel-Versuche bei 50m Sprintabstimmung.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'Startblock-Mechanik & 15m Eintauchphasen',
        phase: 'Base Phase',
        targetVolumeMeters: 14500,
        focus: 'Fußpositionierung & optimaler Eintauchwinkel',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: '10x25m Startsprünge mit Flossen, 15m maximaler Delphinkick'
      },
      {
        weekNumber: 2,
        theme: 'Widerstandskraft & Übergeschwindigkeit',
        phase: 'Build Phase',
        targetVolumeMeters: 15500,
        focus: 'Bremsschirme & Flossensprints',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: '6x25m mit Bremsschirm + 6x25m Flossen-Übergeschwindigkeit'
      },
      {
        weekNumber: 3,
        theme: 'Wendenbeschleunigung & Abstoßpower',
        phase: 'Build Phase',
        targetVolumeMeters: 16000,
        focus: 'Rollwendenschnelligkeit & Wandabstoß',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: '12x50m schnell rein / schnell raus an den Wendenfähnchen'
      },
      {
        weekNumber: 4,
        theme: 'Entlastung & neuromuskuläre Frische',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 12000,
        focus: 'Erholung des Nervensystems & Beweglichkeit',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Leichte Mobilität, Gleitübungen, 2000m lockeres Schwimmen'
      },
      {
        weekNumber: 5,
        theme: 'Laktazide Stehvermögensspitze',
        phase: 'Threshold Peak',
        targetVolumeMeters: 15500,
        focus: 'Geschwindigkeit auf den letzten 15m halten',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: '6x50m maximal All-Out vom Block mit 3:00 Min. Pause'
      },
      {
        weekNumber: 6,
        theme: 'Sprint-Showdown & Staffel-Duelle',
        phase: 'Race Week',
        targetVolumeMeters: 13000,
        focus: 'Sprint-Ausscheidungsrennen & Zeitschwimmen',
        primaryEnergyZone: 'Sprint (SP)',
        keySessionHighlight: 'Kader-Ausscheidungsrennen auf 50m & 4x50m Lagenstaffeln'
      }
    ]
  },

  technique_focus: {
    id: 'technique_focus',
    name: 'Technik, Biomechanik & Bewegungseffizienz',
    shortLabel: 'Technik-Zyklus',
    badge: 'Effizienz & SWOLF',
    accentColor: 'cyan',
    summary: 'Motorisches Lernen, Reduzierung des hydrodynamischen Formwiderstands, Perfektionierung des frühen vertikalen Unterarms (EVF) und Maximierung der Gleitstrecke pro Zug.',
    targetObjective: 'Beseitigung technischer Kraftverluste, Senkung der SWOLF-Werte im gesamten Kader und saubere Bewegungsmuster vor harten Belastungsphasen.',
    physiologicalAdaptation: 'Neuromuskuläre Koordination, Optimierung von Frequenz zu Zuglänge, gesteigertes Wassergefühl (Sculling / EVF).',
    suggestedDurationWeeks: 6,
    weeklyStructureSummary: 'Hohe Dichte an Technikübungen (40%+ des Tagesumfangs), Videoanalysen, Schnorchelübungen für Wasserlage, Sculling und Tempo Trainer.',
    defaultWeeklyVolumeBase: 16000,
    benchmarks: [
      {
        metric: 'SWOLF-Wert (Zeit + Zugzahl)',
        targetDescription: 'SWOLF-Wert auf 50m in der Hauptlage um mindestens 3 Punkte senken.',
        testProtocol: '8x50m mit genauer Zählung der Armzüge + offizieller Zeitmessung.'
      },
      {
        metric: 'Gleitweite pro Zug (DPS)',
        targetDescription: '50m Kraul in unter 26 Zügen mit konstantem 2er-Beinschlag bewältigen.',
        testProtocol: '4x50m DPS-Test zur maximalen Vortriebsausbeute je Armzug.'
      },
      {
        metric: 'Sculling & Wassergefühl (EVF)',
        targetDescription: '4x25m Wriggen kopfvoran mit unterbrechungsfreiem Vortrieb und hohem Ellbogen.',
        testProtocol: 'Wriggen in vorderer, mittlerer und hinterer Zugphase.'
      }
    ],
    blueprints: [
      {
        weekNumber: 1,
        theme: 'Streamline-Körperhaltung & Front-Quadrant-Balance',
        phase: 'Base Phase',
        targetVolumeMeters: 15000,
        focus: 'Kopfposition & gerade Wirbelsäulenachse',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Abschlag-Kraul, Reißverschluss-Übung & Schnorchel-Wasserlage'
      },
      {
        weekNumber: 2,
        theme: 'Wasserfassen & Früher vertikaler Unterarm (EVF)',
        phase: 'Build Phase',
        targetVolumeMeters: 16000,
        focus: 'Unterarm-Druckfläche (Faust & Wriggen)',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '6x50m Faustschwimmen im Übergang zu offener Hand + Wriggserie'
      },
      {
        weekNumber: 3,
        theme: 'Rotationspower & Seitenlage-Streamlines',
        phase: 'Build Phase',
        targetVolumeMeters: 17000,
        focus: 'Hüftgetriebene Rumpfrotation (6-1-6 & 6-3-6)',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '8x50m 6-1-6 Rotationsübung mit Flossen, Fokus auf schnellen Hüftimpuls'
      },
      {
        weekNumber: 4,
        theme: 'Aktive Erholung & Lagen-Harmonisierung',
        phase: 'Deload / Recovery',
        targetVolumeMeters: 12500,
        focus: 'Timing für Brust & Delphin',
        primaryEnergyZone: 'Recovery',
        keySessionHighlight: 'Brustbeinschlag-Gleitserien + Übergangsübungen 1x Delphin / 2x Kraul'
      },
      {
        weekNumber: 5,
        theme: 'SWOLF-Pacing & Effizienzleitern',
        phase: 'Build Phase',
        targetVolumeMeters: 16500,
        focus: 'Geringe Zugzahl auch bei höherem Tempo halten',
        primaryEnergyZone: 'Aerobic (EN1)',
        keySessionHighlight: '8x50m 1-4 steigernd bei exakt gleichbleibender Zugzahl'
      },
      {
        weekNumber: 6,
        theme: 'Technik-Abschluss & SWOLF-Re-Test',
        phase: 'Threshold Peak',
        targetVolumeMeters: 14500,
        focus: 'Offizielle SWOLF-Endprüfung & Videoanalyse',
        primaryEnergyZone: 'Threshold (EN2)',
        keySessionHighlight: '50m SWOLF-Abschlusstest und Analyse der Zuglängenkennwerte'
      }
    ]
  },

  competition_peak: {
    id: 'competition_peak',
    name: 'Wettkampf-Periodisierung & Meisterschafts-Taper',
    shortLabel: 'Wettkampf-Zyklus',
    badge: 'Lineare Periodisierung',
    accentColor: 'blue',
    summary: 'Klassisches 12-Wochen-Periodisierungsmodell: Gezielter Übergang von Grundlagenausdauer zu Schwellendichte, VO2max, Tapering und Meisterschaftswoche.',
    targetObjective: 'Maximale Superkompensation und persönliche Bestzeiten beim Saisonhöhepunkt in Woche 12 erzielen.',
    physiologicalAdaptation: 'Stufenweises Durchlaufen aller bioenergetischen Funktionssysteme mit Glykogenspeicher-Maximierung und optimaler Frische.',
    suggestedDurationWeeks: 12,
    weeklyStructureSummary: 'Traditioneller Makrozyklus: 4W Basis -> 3W Schwellenspitze -> 2W Wettkampftempo -> 2W progressives Tapering -> 1W Meisterschaft.',
    defaultWeeklyVolumeBase: 18000,
    benchmarks: [
      {
        metric: 'Meisterschafts-Pflichtzeiten',
        targetDescription: 'Erreichen der Qualifikationsnormen für Landes- oder Bundesmeisterschaften.',
        testProtocol: 'Offizielle Meisterschafts-Finalläufe auf Zeit.'
      },
      {
        metric: 'Tapering-Frische-Index',
        targetDescription: 'Explosives Wassergefühl bei Startsprüngen mit schneller Pulsberuhigung.',
        testProtocol: 'Tägliche Belastungseinstufung, Wassergefühl-Sculls und gebrochene 50m.'
      }
    ],
    blueprints: [
      { weekNumber: 1, theme: 'Grundlagen & Aerobe Basis', phase: 'Base Phase', targetVolumeMeters: 18000, focus: 'CSS-Leistungstest', primaryEnergyZone: 'Aerobic (EN1)', keySessionHighlight: 'CSS 400m/200m Basistest' },
      { weekNumber: 2, theme: 'Progressiver Aufbau 1', phase: 'Build Phase', targetVolumeMeters: 19000, focus: 'Umfang & CSS-Treppen', primaryEnergyZone: 'Aerobic (EN1)', keySessionHighlight: 'Aerobe Leiter & Armzugserien' },
      { weekNumber: 3, theme: 'Schwellenerweiterung', phase: 'Build Phase', targetVolumeMeters: 20000, focus: 'GA2-Schwellensätze', primaryEnergyZone: 'Threshold (EN2)', keySessionHighlight: 'Dichte CSS-100er mit kurzer Pause' },
      { weekNumber: 4, theme: 'Aktive Erholung & Test', phase: 'Deload / Recovery', targetVolumeMeters: 14500, focus: 'Entlastung & 400m CSS-Test', primaryEnergyZone: 'Recovery', keySessionHighlight: 'CSS Re-Test & Laktatspülung' },
      { weekNumber: 5, theme: 'VO2max Kraftaufbau', phase: 'Build Phase', targetVolumeMeters: 20500, focus: 'Aerobe Spitzenleistung & Beine', primaryEnergyZone: 'VO2Max (EN3)', keySessionHighlight: 'Gebrochene 200m & aerobe Power' },
      { weekNumber: 6, theme: 'Maximaler Saisonumfang', phase: 'Build Phase', targetVolumeMeters: 21500, focus: 'Höchster Trainingsumfang', primaryEnergyZone: 'Aerobic (EN1)', keySessionHighlight: 'Ausdauerleiter Langstrecke' },
      { weekNumber: 7, theme: 'Schwellendichte & Laktat', phase: 'Threshold Peak', targetVolumeMeters: 20000, focus: 'Laktat-Kompensation', primaryEnergyZone: 'Threshold (EN2)', keySessionHighlight: 'Over-Under 200er & negative Splits' },
      { weekNumber: 8, theme: 'Zwischenerholung & Technik', phase: 'Deload / Recovery', targetVolumeMeters: 15000, focus: 'Technikfeinschliff & SWOLF', primaryEnergyZone: 'Recovery', keySessionHighlight: 'SWOLF-Check & Technik-Feinabstimmung' },
      { weekNumber: 9, theme: 'Wettkampfspezifisches Tempo', phase: 'Threshold Peak', targetVolumeMeters: 19000, focus: 'Teilstreckentraining & Renntempo', primaryEnergyZone: 'Threshold (EN2)', keySessionHighlight: 'Gebrochene Rennsimulationen' },
      { weekNumber: 10, theme: 'Tapering 1 – Umfangreduktion', phase: 'Taper Phase', targetVolumeMeters: 15500, focus: '-25% Umfang, hohe Schnelligkeit', primaryEnergyZone: 'Sprint (SP)', keySessionHighlight: 'Explosive Auftauchphasen & Tempospitzen' },
      { weekNumber: 11, theme: 'Tapering 2 – Frische & Power', phase: 'Taper Phase', targetVolumeMeters: 12000, focus: 'Startsprünge, Staffeln & Sprint', primaryEnergyZone: 'Sprint (SP)', keySessionHighlight: 'Startsprünge & Staffelübergaben' },
      { weekNumber: 12, theme: 'Meisterschafts-Höhepunkt', phase: 'Race Week', targetVolumeMeters: 9000, focus: 'Wettkampfwoche – Bestzeiten!', primaryEnergyZone: 'Sprint (SP)', keySessionHighlight: 'Meisterschaftstag – Alles geben!' }
    ]
  }
};

/**
 * Konfiguriert den Makrozyklus eines Saisonplans entsprechend dem gewählten Zyklus-Schwerpunkt
 */
export function applyCycleFocusToSeason(
  season: SeasonPlan,
  focusType: CycleFocusType,
  weeksCount?: number
): SeasonPlan {
  const preset = CYCLE_FOCUS_PRESETS[focusType] || CYCLE_FOCUS_PRESETS.competition_peak;
  const numWeeks = weeksCount || preset.suggestedDurationWeeks || season.totalWeeks || 8;

  const newWeeks: WeekCycle[] = [];

  for (let w = 1; w <= numWeeks; w++) {
    const bpIndex = (w - 1) % preset.blueprints.length;
    const bp = preset.blueprints[bpIndex];

    const existingWeek = (season.weeks || []).find(ew => ew.weekNumber === w);
    let weekSessions: WorkoutSession[] = [];

    if (existingWeek && existingWeek.sessions && existingWeek.sessions.length > 0) {
      weekSessions = existingWeek.sessions.map(s => ({
        ...s,
        weekNumber: w,
      }));
    } else {
      const schedule = season.weeklySchedule || [];
      weekSessions = schedule.map((slot, sIdx) => {
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
      notes: `${preset.name} – ${bp.focus}. Kern-Schwerpunkt: ${bp.keySessionHighlight}`
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
