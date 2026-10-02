import React, { useState } from 'react';
import { SavedWorkoutItem, DayOfWeek } from '../types/swim';
import { 
  Bookmark, 
  X, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers, 
  Filter,
  Flame,
  Check
} from 'lucide-react';

interface WorkoutPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkout: (workout: SavedWorkoutItem) => void;
  savedWorkouts: SavedWorkoutItem[];
  targetDay?: DayOfWeek;
  weekNumber?: number;
}

export const WorkoutPickerModal: React.FC<WorkoutPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectWorkout,
  savedWorkouts = [],
  targetDay,
  weekNumber,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'inspiration' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewWorkoutId, setPreviewWorkoutId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredWorkouts = savedWorkouts.filter(w => {
    if (activeTab === 'inspiration' && w.source !== 'coach_inspiration') return false;
    if (activeTab === 'completed' && !w.isCompleted) return false;
    if (selectedCategory !== 'All' && w.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name?.toLowerCase().includes(q);
      const matchTags = (w.tags || []).some(t => t.toLowerCase().includes(q));
      const matchFocus = w.focus?.toLowerCase().includes(q);
      const matchNotes = w.notes?.toLowerCase().includes(q);
      return matchName || matchTags || matchFocus || matchNotes;
    }
    return true;
  });

  const previewWorkout = savedWorkouts.find(w => w.id === previewWorkoutId) || filteredWorkouts[0];

  const handleApply = (workout: SavedWorkoutItem) => {
    onSelectWorkout(workout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl p-6 shadow-2xl relative flex flex-col max-h-[88vh]">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-900/40">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Workout & Base Plan Library</span>
              {targetDay && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  Target: {targetDay} {weekNumber ? `(Week ${weekNumber})` : ''}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Select from base squad inspiration plans or your library of completed workouts
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
          {/* Tab Selector */}
          <div className="sm:col-span-5 flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1.5 rounded-lg transition ${
                activeTab === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Plans ({savedWorkouts.length})
            </button>
            <button
              onClick={() => setActiveTab('inspiration')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                activeTab === 'inspiration' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Base Plans</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                activeTab === 'completed' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>Completed</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plans, sets, stroke..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Categories</option>
              <option value="Coach Inspiration">Coach Inspiration</option>
              <option value="Threshold">Threshold</option>
              <option value="Endurance">Endurance</option>
              <option value="Speed">Speed</option>
              <option value="IM / Medley">IM / Medley</option>
            </select>
          </div>
        </div>

        {/* Content: List + Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-[350px]">
          {/* Workouts List */}
          <div className="md:col-span-6 overflow-y-auto space-y-2.5 pr-2">
            {filteredWorkouts.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
                No workouts match your filter criteria.
              </div>
            ) : (
              filteredWorkouts.map((workout) => {
                const isSelected = previewWorkout?.id === workout.id;
                const isBase = workout.source === 'coach_inspiration';

                return (
                  <div
                    key={workout.id}
                    onClick={() => setPreviewWorkoutId(workout.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          {isBase ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80">
                              Base Plan {workout.originalPlanIndex ? `#${workout.originalPlanIndex}` : ''}
                            </span>
                          ) : workout.isCompleted ? (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center space-x-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              Template
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
                            {workout.focus}
                          </span>
                        </div>

                        <span className="font-mono font-black text-sm text-cyan-300">
                          {workout.totalDistance.toLocaleString()}m
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1 mt-1">
                        {workout.name}
                      </h4>
                      {workout.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                          "{workout.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-500">
                      <span>{workout.blocks?.length || 0} blocks • ~{workout.estimatedMinutes} min</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApply(workout);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center space-x-1"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Workout Detailed Preview */}
          <div className="md:col-span-6 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 overflow-y-auto flex flex-col justify-between">
            {previewWorkout ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-cyan-400">Workout Preview</span>
                    <span className="font-mono font-extrabold text-base text-cyan-300">
                      {previewWorkout.totalDistance.toLocaleString()}m (~{previewWorkout.estimatedMinutes} min)
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white mt-1">
                    {previewWorkout.name}
                  </h3>
                  {previewWorkout.notes && (
                    <p className="text-xs text-slate-300 italic mt-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      {previewWorkout.notes}
                    </p>
                  )}
                </div>

                {/* Blocks Breakdown */}
                <div className="space-y-2">
                  <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Workout Structure ({previewWorkout.blocks?.length || 0} Sets)
                  </h5>
                  {(previewWorkout.blocks || []).map((b, idx) => (
                    <div key={b.id || idx} className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-white mb-1">
                        <span className="text-cyan-300">{b.title}</span>
                        <span className="text-[10px] text-slate-400">{b.rounds > 1 ? `${b.rounds}x rounds` : ''}</span>
                      </div>
                      <div className="space-y-1">
                        {(b.items || []).map((it, iIdx) => (
                          <div key={it.id || iIdx} className="flex items-center justify-between text-[11px] text-slate-300">
                            <span className="font-mono text-cyan-400 font-semibold">{it.reps}x{it.distance}m {it.stroke}</span>
                            <span className="truncate max-w-[150px] text-slate-400">{it.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-xs text-slate-500">
                Select a workout to preview details
              </div>
            )}

            {previewWorkout && (
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApply(previewWorkout)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-900/40 flex items-center space-x-1.5"
                >
                  <span>Use This Workout Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
