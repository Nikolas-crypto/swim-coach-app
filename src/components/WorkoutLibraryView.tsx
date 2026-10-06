import React, { useState } from 'react';
import { SavedWorkoutItem, WorkoutSession, DayOfWeek, SeasonPlan } from '../types/swim';
import { 
  Bookmark, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Layers, 
  Plus, 
  Trash2, 
  Calendar, 
  ArrowRight, 
  Dumbbell, 
  Filter, 
  Award, 
  Copy,
  ChevronDown,
  ChevronUp,
  Upload
} from 'lucide-react';
import { convertInspirationToSession } from '../data/inspirationPlans';
import { CsvImportModal } from './CsvImportModal';
import { 
  formatDayGerman, 
  formatStrokeGerman, 
  formatFocusGerman, 
  formatBlockTypeGerman 
} from '../utils/germanTranslations';

interface WorkoutLibraryViewProps {
  savedWorkouts: SavedWorkoutItem[];
  season: SeasonPlan;
  onOpenSessionInBuilder: (session: WorkoutSession) => void;
  onAddSessionToWeek: (weekNumber: number, session: WorkoutSession) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onSaveWorkout: (workout: SavedWorkoutItem) => void;
  onImportWorkouts?: (workouts: SavedWorkoutItem[]) => void;
}

export const WorkoutLibraryView: React.FC<WorkoutLibraryViewProps> = ({
  savedWorkouts = [],
  season,
  onOpenSessionInBuilder,
  onAddSessionToWeek,
  onDeleteWorkout,
  onSaveWorkout,
  onImportWorkouts,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'inspiration' | 'Endurance' | 'Threshold' | 'VO2Max' | 'Speed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  
  // Schedule modal state
  const [schedulingWorkout, setSchedulingWorkout] = useState<SavedWorkoutItem | null>(null);
  const [targetWeekNum, setTargetWeekNum] = useState<number>(season.currentWeekNumber || 1);
  const [targetDay, setTargetDay] = useState<DayOfWeek>('Monday');

  const filteredWorkouts = savedWorkouts.filter(w => {
    if (activeFilter === 'completed' && !w.isCompleted) return false;
    if (activeFilter === 'inspiration' && w.source !== 'coach_inspiration') return false;
    if (activeFilter === 'Endurance' && w.category !== 'Endurance' && w.focus !== 'Aerobic') return false;
    if (activeFilter === 'Threshold' && w.category !== 'Threshold' && w.focus !== 'Threshold') return false;
    if (activeFilter === 'VO2Max' && !w.name.toLowerCase().includes('vo2') && !w.tags?.some(t => t.toLowerCase().includes('vo2'))) return false;
    if (activeFilter === 'Speed' && w.category !== 'Speed' && w.focus !== 'Speed') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name.toLowerCase().includes(q);
      const matchTags = (w.tags || []).some(t => t.toLowerCase().includes(q));
      const matchFocus = w.focus?.toLowerCase().includes(q);
      const matchNotes = w.notes?.toLowerCase().includes(q);
      const matchBlock = (w.blocks || []).some(b => 
        b.title.toLowerCase().includes(q) || 
        b.items.some(i => i.description.toLowerCase().includes(q) || i.stroke.toLowerCase().includes(q))
      );
      return matchName || matchTags || matchFocus || matchNotes || matchBlock;
    }

    return true;
  });

  const completedCount = savedWorkouts.filter(w => w.isCompleted).length;
  const inspirationCount = savedWorkouts.filter(w => w.source === 'coach_inspiration').length;

  const handleConfirmSchedule = () => {
    if (!schedulingWorkout) return;
    const session = convertInspirationToSession(schedulingWorkout, targetWeekNum, targetDay);
    const slot = season.weeklySchedule?.find(s => s.day === targetDay);
    if (slot) {
      session.scheduledTime = `${slot.startTime} - ${slot.endTime}`;
    }
    onAddSessionToWeek(targetWeekNum, session);
    setSchedulingWorkout(null);
  };

  const handleDuplicate = (workout: SavedWorkoutItem) => {
    const copy: SavedWorkoutItem = {
      ...workout,
      id: `saved-${Date.now()}`,
      name: `${workout.name} (Kopie)`,
      completedAt: undefined,
      isCompleted: false,
      source: 'custom_template'
    };
    onSaveWorkout(copy);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Bookmark className="w-4 h-4" />
              <span>Kader-Trainings- & Vorlagenbibliothek</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Gespeicherte Trainings & Basisplan-Vorlagen
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Speichere absolvierte Kadereinheiten und nutze bewährte Basistrainings als Vorlagen für Ausdauer-, Schwellen- und VO2max-Zyklen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCsvModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-900/40 cursor-pointer"
              title=".csv-Datei hochladen oder CSV-Text einfügen, um Einheiten zu importieren"
            >
              <Upload className="w-4 h-4" />
              <span>CSV-Pläne importieren</span>
            </button>
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Absolviert</span>
              <span className="text-lg font-black text-emerald-400">{completedCount}</span>
            </div>
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Basispläne</span>
              <span className="text-lg font-black text-cyan-400">{inspirationCount}</span>
            </div>
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Gesamt</span>
              <span className="text-lg font-black text-white">{savedWorkouts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/90 p-4 border border-slate-800 rounded-2xl shadow-lg">
        {/* Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `Alle (${savedWorkouts.length})` },
            { id: 'completed', label: `Absolvierte Einheiten (${completedCount})` },
            { id: 'inspiration', label: `Basispläne (${inspirationCount})` },
            { id: 'Endurance', label: 'Ausdauer' },
            { id: 'Threshold', label: 'Schwellenbereich (CSS)' },
            { id: 'VO2Max', label: 'VO2max' },
            { id: 'Speed', label: 'Sprint & Starts' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setActiveFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeFilter === pill.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Trainings, Lagen, Serien suchen..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Workout Grid */}
      {filteredWorkouts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Bookmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Keine Trainings gefunden</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Passe Suchbegriff oder Filter an. Du kannst auch externe Schwimmpläne per CSV importieren.
          </p>
          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-900/40 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Pläne aus CSV importieren</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWorkouts.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            const isCompleted = workout.isCompleted;
            const isInspiration = workout.source === 'coach_inspiration';

            let focusColor = 'border-cyan-500/40 text-cyan-300 bg-cyan-950/60';
            if (workout.focus === 'Threshold') focusColor = 'border-amber-500/40 text-amber-300 bg-amber-950/60';
            if (workout.focus === 'Speed') focusColor = 'border-purple-500/40 text-purple-300 bg-purple-950/60';
            if (workout.focus === 'Recovery') focusColor = 'border-emerald-500/40 text-emerald-300 bg-emerald-950/60';

            return (
              <div
                key={workout.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Metadata */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${focusColor}`}>
                        {formatFocusGerman(workout.focus)}
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-500/40 text-emerald-300 bg-emerald-950/60 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Absolvierte Einheit</span>
                        </span>
                      )}
                      {isInspiration && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-500/40 text-blue-300 bg-blue-950/60 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-blue-400" />
                          <span>Basis-Vorlage</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                        {workout.category}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-right">
                      <span className="text-base font-black font-mono text-cyan-400">
                        {workout.totalDistance.toLocaleString()}m
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400 font-semibold">
                        ~{workout.estimatedMinutes} Min
                      </span>
                    </div>
                  </div>

                  {/* Workout Title */}
                  <h3 className="text-base font-black text-white tracking-tight mb-1">
                    {workout.name}
                  </h3>

                  {/* Notes / Completed date */}
                  {workout.completedAt && (
                    <div className="text-[11px] text-emerald-400/90 font-medium mb-1">
                      Erfasst am: {new Date(workout.completedAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </div>
                  )}

                  {workout.notes && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {workout.notes}
                    </p>
                  )}

                  {/* Tags */}
                  {workout.tags && workout.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {workout.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 bg-slate-950 border border-slate-800/80 rounded text-[10px] text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Blocks summary / Expand */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                      <span className="flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Trainingsaufbau ({workout.blocks?.length || 0} Serien)</span>
                      </span>
                      <button
                        onClick={() => setExpandedWorkoutId(isExpanded ? null : workout.id)}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[10px]"
                      >
                        <span>{isExpanded ? 'Serien verbergen' : 'Alle Serien anzeigen'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {!isExpanded ? (
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-400">
                        {(workout.blocks || []).map((b, bIdx) => (
                          <span key={bIdx} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                            {b.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="pt-2 space-y-2 text-xs border-t border-slate-800/60">
                        {(workout.blocks || []).map((b, bIdx) => (
                          <div key={bIdx} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                            <div className="font-bold text-white text-xs flex justify-between">
                              <span className="text-cyan-300">{b.title}</span>
                              <span className="text-slate-400 text-[10px] uppercase font-bold">{formatBlockTypeGerman(b.type)}</span>
                            </div>
                            <div className="mt-1 space-y-1">
                              {(b.items || []).map((item, iIdx) => (
                                <div key={iIdx} className="text-[11px] text-slate-300 flex items-start justify-between gap-2">
                                  <span>
                                    <strong className="text-white">{item.reps}x{item.distance}m</strong> {formatStrokeGerman(item.stroke)} — {item.description}
                                  </span>
                                  {item.fixedInterval && (
                                    <span className="font-mono text-cyan-400 text-[10px] shrink-0 font-bold">
                                      @{item.fixedInterval}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDuplicate(workout)}
                      title="Als neue Vorlage duplizieren"
                      className="p-2 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {!isInspiration && (
                      <button
                        onClick={() => onDeleteWorkout(workout.id)}
                        title="Aus Bibliothek löschen"
                        className="p-2 rounded-lg bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSchedulingWorkout(workout)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
                    >
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>In Woche einplanen</span>
                    </button>

                    <button
                      onClick={() => {
                        const session = convertInspirationToSession(workout, season.currentWeekNumber || 1, 'Monday');
                        onOpenSessionInBuilder(session);
                      }}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-cyan-900/40 transition"
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      <span>Im Editor öffnen</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Workout Modal */}
      {schedulingWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Training in Wochenplan eintragen</h3>
                <p className="text-xs text-slate-400">Wähle Zielwoche und Wochentag für diese Einheit aus</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
              <div className="text-slate-400">Einheit:</div>
              <div className="font-bold text-white text-sm">{schedulingWorkout.name}</div>
              <div className="font-mono text-cyan-400 mt-0.5">{schedulingWorkout.totalDistance.toLocaleString()}m ({formatFocusGerman(schedulingWorkout.focus)})</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Zielwoche</label>
                <select
                  value={targetWeekNum}
                  onChange={(e) => setTargetWeekNum(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                >
                  {(season.weeks || []).map((w) => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      Woche {w.weekNumber} — {w.theme}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Wochentag</label>
                <select
                  value={targetDay}
                  onChange={(e) => setTargetDay(e.target.value as DayOfWeek)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                >
                  {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as DayOfWeek[]).map((d) => (
                    <option key={d} value={d}>
                      {formatDayGerman(d)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSchedulingWorkout(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-900/40"
              >
                <span>Einheit eintragen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportWorkouts={(importedWorkouts) => {
          if (onImportWorkouts) {
            onImportWorkouts(importedWorkouts);
          } else {
            importedWorkouts.forEach(w => onSaveWorkout(w));
          }
        }}
      />
    </div>
  );
};
