import React, { useState, useEffect } from 'react';
import { 
  WeekCycle, 
  WorkoutSession, 
  LaneConfig, 
  SessionScheduleSlot, 
  DayOfWeek,
  SavedWorkoutItem,
  CycleFocusType 
} from '../types/swim';
import { 
  calculateSessionDistance, 
  autoPopulateNextWeek, 
  ProgressionMode 
} from '../utils/swimCalculators';
import { 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Flame, 
  Clock, 
  Award,
  Layers,
  AlertCircle,
  Bookmark
} from 'lucide-react';
import { WorkoutPickerModal } from './WorkoutPickerModal';
import { SaveWorkoutModal } from './SaveWorkoutModal';
import { INSPIRATION_WORKOUTS } from '../data/inspirationPlans';
import { 
  formatDayGerman, 
  formatFocusGerman, 
  formatPhaseGerman 
} from '../utils/germanTranslations';

interface WeeklyPlannerProps {
  weeks: WeekCycle[];
  currentWeekNumber: number;
  lanes: LaneConfig[];
  scheduleSlots: SessionScheduleSlot[];
  poolLength: '25m' | '50m' | '25y';
  onSelectWeek: (weekNum: number) => void;
  onUpdateWeek: (updatedWeek: WeekCycle) => void;
  onAddNextWeek: (newWeek: WeekCycle) => void;
  onOpenSessionInBuilder: (session: WorkoutSession) => void;
  onOpenSettings: () => void;
  savedWorkouts?: SavedWorkoutItem[];
  onSaveWorkoutToLibrary?: (workout: SavedWorkoutItem) => void;
  cycleFocus?: CycleFocusType;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  weeks = [],
  currentWeekNumber,
  lanes = [],
  scheduleSlots,
  poolLength = '25m',
  onSelectWeek,
  onUpdateWeek,
  onAddNextWeek,
  onOpenSessionInBuilder,
  onOpenSettings,
  savedWorkouts = [],
  onSaveWorkoutToLibrary,
  cycleFocus,
}) => {
  const safeWeeks = Array.isArray(weeks) && weeks.length > 0 ? weeks : [];
  const currentWeek: WeekCycle = safeWeeks.find(w => w.weekNumber === currentWeekNumber) || safeWeeks[0] || {
    weekNumber: currentWeekNumber || 1,
    theme: `Week ${currentWeekNumber || 1}`,
    phase: 'Build Phase',
    targetVolumeMeters: 20000,
    actualVolumeMeters: 0,
    sessions: [],
    isConfirmed: false,
  };
  const prevWeek = safeWeeks.find(w => w.weekNumber === currentWeekNumber - 1);
  const nextWeekExists = safeWeeks.some(w => w.weekNumber === currentWeekNumber + 1);

  const [isAutoPopulateModalOpen, setIsAutoPopulateModalOpen] = useState(false);
  const [selectedProgressionMode, setSelectedProgressionMode] = useState<ProgressionMode>('overload_volume');

  // Workout Library & Picker state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTargetDay, setPickerTargetDay] = useState<DayOfWeek | undefined>(undefined);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [sessionToSave, setSessionToSave] = useState<WorkoutSession | null>(null);

  const handleOpenPickerForDay = (day: DayOfWeek) => {
    setPickerTargetDay(day);
    setIsPickerOpen(true);
  };

  const handleApplyWorkoutFromPicker = (workout: SavedWorkoutItem) => {
    const targetDay = pickerTargetDay || 'Monday';
    const slot = scheduleSlots.find(s => s.day === targetDay);
    
    const newSession: WorkoutSession = {
      id: `w${currentWeek.weekNumber}-s-${Date.now()}`,
      weekNumber: currentWeek.weekNumber,
      dayOfWeek: targetDay,
      scheduledTime: slot ? `${slot.startTime} - ${slot.endTime}` : '06:00 - 07:30',
      name: `W${currentWeek.weekNumber} ${targetDay}: ${workout.name}`,
      focus: workout.focus,
      totalDistance: workout.totalDistance,
      estimatedMinutes: workout.estimatedMinutes,
      confirmed: false,
      blocks: JSON.parse(JSON.stringify(workout.blocks || [])),
    };

    const updatedSessions = [...(currentWeek.sessions || []), newSession];
    const newVolume = updatedSessions.reduce((sum, s) => sum + (s.totalDistance || 0), 0);

    onUpdateWeek({
      ...currentWeek,
      sessions: updatedSessions,
      actualVolumeMeters: newVolume,
    });
  };

  const handleOpenSaveModalForSession = (session: WorkoutSession) => {
    setSessionToSave(session);
    setIsSaveModalOpen(true);
  };

  // Weekly volume target editing
  const [isEditingTargetVolume, setIsEditingTargetVolume] = useState(false);
  const [targetVolumeInput, setTargetVolumeInput] = useState<number>(currentWeek.targetVolumeMeters || 20000);

  useEffect(() => {
    setTargetVolumeInput(currentWeek.targetVolumeMeters || 20000);
    setIsEditingTargetVolume(false);
  }, [currentWeek.weekNumber, currentWeek.targetVolumeMeters]);

  const handleSaveTargetVolume = () => {
    const val = Number(targetVolumeInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateWeek({
        ...currentWeek,
        targetVolumeMeters: Math.round(val),
      });
    }
    setIsEditingTargetVolume(false);
  };

  // Confirmation toggle
  const handleToggleConfirmWeek = () => {
    const isNowConfirmed = !currentWeek.isConfirmed;
    onUpdateWeek({
      ...currentWeek,
      isConfirmed: isNowConfirmed,
    });
  };

  // Add empty session to a day
  const handleAddSessionToDay = (day: DayOfWeek) => {
    const slot = scheduleSlots.find(s => s.day === day);
    const newSession: WorkoutSession = {
      id: `w${currentWeek.weekNumber}-s-${Date.now()}`,
      weekNumber: currentWeek.weekNumber,
      dayOfWeek: day,
      scheduledTime: slot ? `${slot.startTime} - ${slot.endTime}` : '06:00 - 07:30',
      name: `W${currentWeek.weekNumber} ${formatDayGerman(day)}: ${slot?.sessionTitle || 'Kadertraining'}`,
      focus: slot?.primaryFocus || 'Aerobic',
      totalDistance: 3000,
      estimatedMinutes: 60,
      confirmed: false,
      blocks: [
        {
          id: `b-warmup-${Date.now()}`,
          type: 'warmup',
          title: 'Einschwimmen & Körperaktivierung',
          rounds: 1,
          items: [
            {
              id: `item-${Date.now()}-1`,
              reps: 1,
              distance: 400,
              stroke: 'Choice',
              intensity: 'Recovery',
              description: 'Locker nach Wahl mit ruhiger Gleitphase & 3er-Atmung',
              equipment: [],
              sendOffMode: 'lane-scaled',
            },
          ],
        },
        {
          id: `b-preset-${Date.now()}`,
          type: 'preset',
          title: 'Vorbereitungsserie: Technik & Beine',
          rounds: 1,
          items: [
            {
              id: `item-${Date.now()}-2`,
              reps: 6,
              distance: 50,
              stroke: 'Kick',
              intensity: 'Aerobic (EN1)',
              description: 'Streamline-Kicks mit Brett, Fokus auf Beckenstabilität',
              equipment: ['Kickboard'],
              sendOffMode: 'lane-scaled',
            },
          ],
        },
        {
          id: `b-main-${Date.now()}`,
          type: 'main',
          title: 'Hauptserie',
          rounds: 1,
          items: [
            {
              id: `item-${Date.now()}-3`,
              reps: 5,
              distance: 200,
              stroke: 'Freestyle',
              intensity: 'Threshold (EN2)',
              description: 'Konstantes CSS-Pacing der Bahn halten',
              equipment: [],
              sendOffMode: 'lane-scaled',
            },
            {
              id: `item-${Date.now()}-4`,
              reps: 10,
              distance: 100,
              stroke: 'Choice',
              intensity: 'Aerobic (EN1)',
              description: 'Aerobes Dahingleiten mit gleichmäßiger Zugzahl',
              equipment: [],
              sendOffMode: 'lane-scaled',
            },
          ],
        },
        {
          id: `b-cool-${Date.now()}`,
          type: 'cooldown',
          title: 'Ausschwimmen',
          rounds: 1,
          items: [
            {
              id: `item-${Date.now()}-5`,
              reps: 1,
              distance: 300,
              stroke: 'Choice',
              intensity: 'Recovery',
              description: 'Locker ausschwimmen & tiefe Ausatmung ins Wasser',
              equipment: [],
              sendOffMode: 'lane-scaled',
            },
          ],
        },
      ],
    };

    newSession.totalDistance = calculateSessionDistance(newSession);

    const updatedSessions = [...currentWeek.sessions, newSession];
    const newTotal = updatedSessions.reduce((sum, s) => sum + s.totalDistance, 0);

    onUpdateWeek({
      ...currentWeek,
      sessions: updatedSessions,
      actualVolumeMeters: newTotal,
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    const updated = currentWeek.sessions.filter(s => s.id !== sessionId);
    const newTotal = updated.reduce((sum, s) => sum + s.totalDistance, 0);
    onUpdateWeek({
      ...currentWeek,
      sessions: updated,
      actualVolumeMeters: newTotal,
    });
  };

  const handleDuplicateSession = (session: WorkoutSession) => {
    const cloned: WorkoutSession = {
      ...session,
      id: `w${currentWeek.weekNumber}-s-${Date.now()}`,
      name: `${session.name} (Copy)`,
    };
    const updated = [...currentWeek.sessions, cloned];
    const newTotal = updated.reduce((sum, s) => sum + s.totalDistance, 0);
    onUpdateWeek({
      ...currentWeek,
      sessions: updated,
      actualVolumeMeters: newTotal,
    });
  };

  // Auto-populate trigger
  const handleExecuteAutoPopulate = () => {
    const nextWeekNumber = currentWeek.weekNumber + 1;
    const generatedWeek = autoPopulateNextWeek(currentWeek, nextWeekNumber, selectedProgressionMode, cycleFocus);
    onAddNextWeek(generatedWeek);
    setIsAutoPopulateModalOpen(false);
    onSelectWeek(nextWeekNumber);
  };

  // Progression delta vs previous week
  const actualVolume = (currentWeek.sessions || []).reduce((sum, s) => sum + (s.totalDistance || 0), 0);
  let volumeDeltaPercent = 0;
  if (prevWeek && prevWeek.actualVolumeMeters > 0) {
    volumeDeltaPercent = Math.round(((actualVolume - prevWeek.actualVolumeMeters) / prevWeek.actualVolumeMeters) * 100);
  }

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Week Selector Bar & Progression Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          {/* Week navigation */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              disabled={currentWeekNumber <= 1}
              onClick={() => onSelectWeek(currentWeekNumber - 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Vorherige Woche"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Mikrozyklus-Planung
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                  currentWeek.isConfirmed 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {currentWeek.isConfirmed ? '✓ Woche bestätigt' : 'Entwurf'}
                </span>
                {cycleFocus && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-cyan-500/40 bg-cyan-950/60 text-cyan-300">
                    Schwerpunkt: {cycleFocus === 'endurance_focus' ? 'Ausdauer' : cycleFocus === 'threshold_focus' ? 'Schwelle (CSS)' : cycleFocus === 'vo2max_focus' ? 'VO2max' : cycleFocus === 'speed_power_focus' ? 'Sprint & Kraft' : 'Wettkampf'}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white flex items-center space-x-2">
                <span>{currentWeek.theme}</span>
              </h2>
            </div>

            <button
              type="button"
              disabled={!nextWeekExists && currentWeekNumber >= (safeWeeks?.length || 0)}
              onClick={() => onSelectWeek(currentWeekNumber + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Nächste Woche"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Confirm button */}
            <button
              type="button"
              onClick={handleToggleConfirmWeek}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 border cursor-pointer ${
                currentWeek.isConfirmed
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{currentWeek.isConfirmed ? 'Struktur bestätigt' : 'Wochenstruktur bestätigen'}</span>
            </button>

            {/* Auto Populate Next Week Trigger */}
            <button
              type="button"
              onClick={() => setIsAutoPopulateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Woche {currentWeek.weekNumber + 1} auto-generieren</span>
            </button>
          </div>
        </div>

        {/* Weekly Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
          {/* Actual Volume & Editable Target Goal */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold block text-[11px]">Wochenumfang (Ist)</span>
                {!isEditingTargetVolume && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetVolumeInput(currentWeek.targetVolumeMeters || 20000);
                      setIsEditingTargetVolume(true);
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer"
                    title="Wochenziel anpassen"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Ziel anpassen</span>
                  </button>
                )}
              </div>
              <div className="text-xl font-pace font-bold text-cyan-300 mt-0.5">
                {actualVolume.toLocaleString()}<span className="text-xs text-slate-500 font-sans ml-1">{poolLength.slice(-1)}</span>
              </div>
            </div>

            {isEditingTargetVolume ? (
              <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    step="500"
                    min="0"
                    max="100000"
                    value={targetVolumeInput}
                    onChange={(e) => setTargetVolumeInput(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-cyan-500/50 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    autoFocus
                  />
                  <span className="text-[11px] text-slate-400">{poolLength.slice(-1)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setTargetVolumeInput(v => Math.max(0, v - 1000))}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 transition"
                  >
                    -1k
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetVolumeInput(v => v + 1000)}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 transition"
                  >
                    +1k
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetVolumeInput(actualVolume)}
                    className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 transition"
                    title="Ziel auf aktuell geplanten Umfang setzen"
                  >
                    = Ist-Umfang
                  </button>
                </div>
                <div className="flex items-center space-x-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveTargetVolume}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded py-1 font-bold text-[10px] transition cursor-pointer"
                  >
                    Ziel speichern
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTargetVolume(false)}
                    className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded py-1 text-[10px] transition cursor-pointer"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => {
                  setTargetVolumeInput(currentWeek.targetVolumeMeters || 20000);
                  setIsEditingTargetVolume(true);
                }}
                className="text-[10px] text-slate-400 hover:text-cyan-300 cursor-pointer flex items-center space-x-1 group mt-1"
                title="Klicken, um Wochenziel zu bearbeiten"
              >
                <span>Ziel: <strong className="text-slate-300 group-hover:text-cyan-300">{(currentWeek.targetVolumeMeters || 20000).toLocaleString()}{poolLength.slice(-1)}</strong></span>
                <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition text-cyan-400" />
              </div>
            )}
          </div>

          {/* Volume Progression Overload */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Progressions-Delta</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              {volumeDeltaPercent >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-amber-400" />
              )}
              <span className={`text-xl font-pace font-bold ${volumeDeltaPercent >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {volumeDeltaPercent > 0 ? `+${volumeDeltaPercent}%` : `${volumeDeltaPercent}%`}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              im Vgl. zu Woche {currentWeek.weekNumber - 1 || 1}
            </span>
          </div>

          {/* Planned Sessions */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Geplante Einheiten</span>
            <div className="text-xl font-pace font-bold text-white mt-0.5">
              {currentWeek.sessions?.length || 0} <span className="text-xs text-slate-500 font-sans font-normal">Einheiten</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Über {lanes?.length || 0} Kaderbahnen
            </span>
          </div>

          {/* Season Phase */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Periodisierungsphase</span>
            <div className="text-sm font-bold text-amber-300 mt-1 truncate">
              {formatPhaseGerman(currentWeek.phase)}
            </div>
            <span className="text-[10px] text-slate-500">
              Woche {currentWeek.weekNumber} des Saison-Makrozyklus
            </span>
          </div>
        </div>
      </div>

      {/* Days of Week Session Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Wöchentliche Trainingsmatrix</span>
          </h3>
          <span className="text-xs text-slate-400">
            Klicke auf eine Einheit, um sie im Trainings-Editor zu öffnen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => {
            const daySessions = (currentWeek.sessions || []).filter(s => s.dayOfWeek === day);

            return (
              <div 
                key={day}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group"
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">{formatDayGerman(day)}</h4>
                      <span className="text-[11px] text-slate-500">
                        {daySessions.length} {daySessions.length === 1 ? 'Einheit' : 'Einheiten'} geplant
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenPickerForDay(day)}
                        className="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white rounded-lg text-xs transition flex items-center space-x-1"
                        title={`Vorlage oder Inspiration aus Bibliothek für ${formatDayGerman(day)} wählen`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddSessionToDay(day)}
                        className="p-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-lg text-xs transition"
                        title={`Neue leere Einheit für ${formatDayGerman(day)} anlegen`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Sessions in this day */}
                  <div className="space-y-3">
                    {daySessions.length === 0 ? (
                      <div className="py-7 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl space-y-1">
                        <span>Ruhe- & Regenerationstag</span>
                        <div className="flex items-center justify-center space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleAddSessionToDay(day)}
                            className="text-cyan-400 hover:text-cyan-300 font-semibold"
                          >
                            + Leer
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleOpenPickerForDay(day)}
                            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Aus Bibliothek</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      daySessions.map((session) => {
                        const dist = calculateSessionDistance(session);

                        let focusBadgeColor = 'text-cyan-400 bg-cyan-950/80 border-cyan-800';
                        if (session.focus === 'Threshold') focusBadgeColor = 'text-amber-400 bg-amber-950/80 border-amber-800';
                        else if (session.focus === 'Speed') focusBadgeColor = 'text-purple-400 bg-purple-950/80 border-purple-800';
                        else if (session.focus === 'Technique') focusBadgeColor = 'text-emerald-400 bg-emerald-950/80 border-emerald-800';
                        else if (session.focus === 'Recovery') focusBadgeColor = 'text-blue-400 bg-blue-950/80 border-blue-800';

                        return (
                          <div
                            key={session.id}
                            className="bg-slate-950 border border-slate-800/90 hover:border-cyan-500/50 rounded-xl p-3 space-y-2.5 transition group/card"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mb-1">
                                  <Clock className="w-3 h-3 text-cyan-400" />
                                  <span>{session.scheduledTime || '06:00 - 07:30'}</span>
                                  <span>•</span>
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${focusBadgeColor}`}>
                                    {formatFocusGerman(session.focus)}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-white group-hover/card:text-cyan-300 transition">
                                  {session.name}
                                </h5>
                              </div>
                            </div>

                            {/* Block summary pills */}
                            <div className="space-y-1">
                              {session.blocks.map(b => (
                                <div key={b.id} className="text-[11px] text-slate-400 flex items-center justify-between">
                                  <span className="truncate max-w-[170px]">• {b.title}</span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {b.items.reduce((s, i) => s + (i.reps * i.distance), 0) * (b.rounds || 1)}m
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Distance & Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                              <span className="font-pace font-bold text-sm text-cyan-400">
                                {dist.toLocaleString()}{poolLength.slice(-1)}
                              </span>

                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenSaveModalForSession(session)}
                                  className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded transition"
                                  title="Einheit in Trainingsbibliothek speichern"
                                >
                                  <Bookmark className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateSession(session)}
                                  className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                                  title="Einheit duplizieren"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition"
                                  title="Einheit löschen"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenSessionInBuilder(session)}
                                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Bearbeiten</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AUTO-POPULATE NEXT WEEK MODAL */}
      {isAutoPopulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-wide">
                  Woche {currentWeek.weekNumber + 1} auto-generieren
                </h3>
                <p className="text-xs text-cyan-300/80">
                  Erstelle den nächsten Mikrozyklus basierend auf der bestätigten Struktur von Woche {currentWeek.weekNumber}
                </p>
              </div>
            </div>

            {/* Progression Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Progressionsmuster wählen
              </label>

              <div className="space-y-2">
                {[
                  {
                    id: 'overload_volume' as ProgressionMode,
                    title: 'Progressive Überlastung (+8% Umfang)',
                    desc: 'Erhöht Wiederholungen in Hauptserien (z.B. 4x200 -> 5x200), baut aerobe Basiskapazität aus.',
                    badge: 'Empfohlen für Aufbauwochen',
                  },
                  {
                    id: 'sharpen_threshold' as ProgressionMode,
                    title: 'Schwellenschärfung & Pacing',
                    desc: 'Verkürzt Abgangszeiten um 2-5s, erhöht die Dichte im CSS-Schwellenbereich.',
                    badge: 'CSS-Fokus',
                  },
                  {
                    id: 'deload_recovery' as ProgressionMode,
                    title: 'Stufenweise Entlastung (-22% Umfang)',
                    desc: 'Reduziert Serien & Umfang für Superkompensation vor dem nächsten Block.',
                    badge: 'Jede 3.–4. Woche',
                  },
                  {
                    id: 'taper_speed' as ProgressionMode,
                    title: 'Wettkampf-Tapering (-30% Umfang)',
                    desc: 'Senkt Gesamtstrecke, schärft Wenden, Startsprünge und maximale Sprintpower.',
                    badge: 'Meisterschafts-Prep',
                  },
                ].map(mode => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedProgressionMode(mode.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-start justify-between cursor-pointer ${
                      selectedProgressionMode === mode.id
                        ? 'bg-cyan-950/40 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{mode.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium">
                          {mode.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{mode.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Projection */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-white flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Vorschau nächste Woche:</span>
              </div>
              <div className="text-slate-400 text-xs">
                • Zielumfang: ~{Math.round(actualVolume * (selectedProgressionMode === 'overload_volume' ? 1.08 : selectedProgressionMode === 'deload_recovery' ? 0.78 : 1.02)).toLocaleString()}{poolLength.slice(-1)}
              </div>
              <div className="text-slate-400 text-xs">
                • Übernimmt automatisch alle Bahnen (Bahn 1 bis {lanes?.length || 0}) und Trainingszeiten.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAutoPopulateModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleExecuteAutoPopulate}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Woche {currentWeek.weekNumber + 1} erstellen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout & Base Plan Picker Modal */}
      <WorkoutPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectWorkout={handleApplyWorkoutFromPicker}
        savedWorkouts={savedWorkouts.length > 0 ? savedWorkouts : INSPIRATION_WORKOUTS}
        targetDay={pickerTargetDay}
        weekNumber={currentWeek.weekNumber}
      />

      {/* Save Workout to Library Modal */}
      {sessionToSave && (
        <SaveWorkoutModal
          session={sessionToSave}
          isOpen={isSaveModalOpen}
          onClose={() => {
            setIsSaveModalOpen(false);
            setSessionToSave(null);
          }}
          onSave={(workout) => {
            if (onSaveWorkoutToLibrary) {
              onSaveWorkoutToLibrary(workout);
            }
          }}
        />
      )}
    </div>
  );
};
