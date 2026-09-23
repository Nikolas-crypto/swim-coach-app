import React, { useState, useEffect } from 'react';
import { 
  WeekCycle, 
  WorkoutSession, 
  LaneConfig, 
  SessionScheduleSlot, 
  DayOfWeek 
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
  AlertCircle
} from 'lucide-react';

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
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  weeks,
  currentWeekNumber,
  lanes,
  scheduleSlots,
  poolLength,
  onSelectWeek,
  onUpdateWeek,
  onAddNextWeek,
  onOpenSessionInBuilder,
  onOpenSettings,
}) => {
  const currentWeek = weeks.find(w => w.weekNumber === currentWeekNumber) || weeks[0];
  const prevWeek = weeks.find(w => w.weekNumber === currentWeekNumber - 1);
  const nextWeekExists = weeks.some(w => w.weekNumber === currentWeekNumber + 1);

  const [isAutoPopulateModalOpen, setIsAutoPopulateModalOpen] = useState(false);
  const [selectedProgressionMode, setSelectedProgressionMode] = useState<ProgressionMode>('overload_volume');

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
      name: `W${currentWeek.weekNumber} ${day}: ${slot?.sessionTitle || 'Squad Practice'}`,
      focus: slot?.primaryFocus || 'Aerobic',
      totalDistance: 3200,
      estimatedMinutes: 70,
      confirmed: false,
      blocks: [
        {
          id: `b-warmup-${Date.now()}`,
          type: 'warmup',
          title: 'Warm-Up',
          rounds: 1,
          items: [
            {
              id: `item-${Date.now()}`,
              reps: 1,
              distance: 400,
              stroke: 'Choice',
              intensity: 'Recovery',
              description: 'Smooth loosen up',
              equipment: [],
              sendOffMode: 'lane-scaled',
            },
          ],
        },
        {
          id: `b-main-${Date.now()}`,
          type: 'main',
          title: 'Main Set',
          rounds: 1,
          items: [
            {
              id: `item-${Date.now()}-2`,
              reps: 6,
              distance: 200,
              stroke: 'Freestyle',
              intensity: 'Threshold (EN2)',
              description: 'CSS pacing hold',
              equipment: [],
              sendOffMode: 'lane-scaled',
            },
          ],
        },
        {
          id: `b-cool-${Date.now()}`,
          type: 'cooldown',
          title: 'Cool Down',
          rounds: 1,
          items: [
            {
              id: `item-${Date.now()}-3`,
              reps: 1,
              distance: 200,
              stroke: 'Choice',
              intensity: 'Recovery',
              description: 'Easy recovery',
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
    const generatedWeek = autoPopulateNextWeek(currentWeek, nextWeekNumber, selectedProgressionMode);
    onAddNextWeek(generatedWeek);
    setIsAutoPopulateModalOpen(false);
    onSelectWeek(nextWeekNumber);
  };

  // Progression delta vs previous week
  const actualVolume = currentWeek.sessions.reduce((sum, s) => sum + s.totalDistance, 0);
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
              title="Previous Week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Microcycle Planning
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                  currentWeek.isConfirmed 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {currentWeek.isConfirmed ? '✓ Cycle Confirmed' : 'Draft Cycle'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white flex items-center space-x-2">
                <span>{currentWeek.theme}</span>
              </h2>
            </div>

            <button
              type="button"
              disabled={!nextWeekExists && currentWeekNumber >= weeks.length}
              onClick={() => onSelectWeek(currentWeekNumber + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="Next Week"
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
              <span>{currentWeek.isConfirmed ? 'Structure Confirmed' : 'Confirm Week Structure'}</span>
            </button>

            {/* Auto Populate Next Week Trigger */}
            <button
              type="button"
              onClick={() => setIsAutoPopulateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Auto-Populate Week {currentWeek.weekNumber + 1}</span>
            </button>
          </div>
        </div>

        {/* Weekly Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
          {/* Actual Volume & Editable Target Goal */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold block text-[11px]">Total Week Volume</span>
                {!isEditingTargetVolume && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetVolumeInput(currentWeek.targetVolumeMeters || 20000);
                      setIsEditingTargetVolume(true);
                    }}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer"
                    title="Change weekly volume goal"
                  >
                    <Edit3 className="w-2.5 h-2.5" />
                    <span>Edit Goal</span>
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
                    title="Set goal equal to currently planned session volume"
                  >
                    = Actual
                  </button>
                </div>
                <div className="flex items-center space-x-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveTargetVolume}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded py-1 font-bold text-[10px] transition cursor-pointer"
                  >
                    Save Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingTargetVolume(false)}
                    className="px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded py-1 text-[10px] transition cursor-pointer"
                  >
                    Cancel
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
                title="Click to edit target volume goal"
              >
                <span>Target: <strong className="text-slate-300 group-hover:text-cyan-300">{(currentWeek.targetVolumeMeters || 20000).toLocaleString()}{poolLength.slice(-1)}</strong></span>
                <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition text-cyan-400" />
              </div>
            )}
          </div>

          {/* Volume Progression Overload */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Progression Delta</span>
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
              vs Week {currentWeek.weekNumber - 1 || 1} volume
            </span>
          </div>

          {/* Planned Sessions */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Planned Sessions</span>
            <div className="text-xl font-pace font-bold text-white mt-0.5">
              {currentWeek.sessions.length} <span className="text-xs text-slate-500 font-sans font-normal">practices</span>
            </div>
            <span className="text-[10px] text-slate-500">
              Across {lanes.length} squad lanes
            </span>
          </div>

          {/* Season Phase */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block text-[11px]">Periodization Phase</span>
            <div className="text-sm font-bold text-amber-300 mt-1 truncate">
              {currentWeek.phase}
            </div>
            <span className="text-[10px] text-slate-500">
              Week {currentWeek.weekNumber} of season macrocycle
            </span>
          </div>
        </div>
      </div>

      {/* Days of Week Session Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Weekly Training Matrix</span>
          </h3>
          <span className="text-xs text-slate-400">
            Click any session to open in the interactive workout builder
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map((day) => {
            const daySessions = currentWeek.sessions.filter(s => s.dayOfWeek === day);

            return (
              <div 
                key={day}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative group"
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-wide">{day}</h4>
                      <span className="text-[11px] text-slate-500">
                        {daySessions.length} {daySessions.length === 1 ? 'session' : 'sessions'} planned
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddSessionToDay(day)}
                      className="p-1.5 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded-lg text-xs transition"
                      title={`Add session to ${day}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sessions in this day */}
                  <div className="space-y-3">
                    {daySessions.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
                        <span>Rest & Recovery Day</span>
                        <button
                          type="button"
                          onClick={() => handleAddSessionToDay(day)}
                          className="block mx-auto mt-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          + Schedule Practice
                        </button>
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
                                    {session.focus}
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
                                  onClick={() => handleDuplicateSession(session)}
                                  className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded transition"
                                  title="Duplicate session"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition"
                                  title="Delete session"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenSessionInBuilder(session)}
                                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Edit</span>
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
                  Auto-Populate Week {currentWeek.weekNumber + 1}
                </h3>
                <p className="text-xs text-cyan-300/80">
                  Generate the next microcycle from Week {currentWeek.weekNumber}'s confirmed structure
                </p>
              </div>
            </div>

            {/* Progression Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Progression Pattern
              </label>

              <div className="space-y-2">
                {[
                  {
                    id: 'overload_volume' as ProgressionMode,
                    title: 'Progressive Overload (+8% Volume)',
                    desc: 'Increases reps in main sets (e.g. 4x200 -> 5x200), expands aerobic base capacity.',
                    badge: 'Recommended for Build Weeks',
                  },
                  {
                    id: 'sharpen_threshold' as ProgressionMode,
                    title: 'Threshold Sharpening & Pacing',
                    desc: 'Tightens send-off intervals by 2-5s, increases quality threshold density.',
                    badge: 'CSS Focus',
                  },
                  {
                    id: 'deload_recovery' as ProgressionMode,
                    title: 'Stepped Deload (-22% Volume)',
                    desc: 'Cuts reps and volume for supercompensation & muscular recovery before the next block.',
                    badge: 'Every 3rd-4th Week',
                  },
                  {
                    id: 'taper_speed' as ProgressionMode,
                    title: 'Championship Taper (-30% Volume)',
                    desc: 'Drops total distance, sharpens race breakouts, dive starts, and max sprint speed.',
                    badge: 'Championship Prep',
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
                <span>Next Week Projection:</span>
              </div>
              <div className="text-slate-400 text-xs">
                • Target Volume: ~{Math.round(actualVolume * (selectedProgressionMode === 'overload_volume' ? 1.08 : selectedProgressionMode === 'deload_recovery' ? 0.78 : 1.02)).toLocaleString()}{poolLength.slice(-1)}
              </div>
              <div className="text-slate-400 text-xs">
                • Automatically retains squad lanes (Lanes 1 to {lanes.length}) and time schedules.
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAutoPopulateModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAutoPopulate}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Week {currentWeek.weekNumber + 1}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
