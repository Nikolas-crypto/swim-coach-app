import React, { useState } from 'react';
import { SeasonPlan, SessionScheduleSlot, DayOfWeek } from '../types/swim';
import { X, Calendar, Target, Clock, Plus, Trash2, CheckCircle2, Dumbbell, Sparkles } from 'lucide-react';
import { scaleSeasonSessionsToTarget } from '../utils/volumeScaler';

interface SeasonSettingsModalProps {
  season: SeasonPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSeason: SeasonPlan) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SeasonSettingsModal: React.FC<SeasonSettingsModalProps> = ({
  season,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(season.name);
  const [goal, setGoal] = useState(season.goal);
  const [poolLength, setPoolLength] = useState(season.poolLength);
  const [totalWeeks, setTotalWeeks] = useState(season.totalWeeks);
  const [schedule, setSchedule] = useState<SessionScheduleSlot[]>(season.weeklySchedule);
  const [targetSessionVolume, setTargetSessionVolume] = useState<number>(
    season.targetSessionVolumeMeters || 3000
  );
  const [shouldRescaleSessions, setShouldRescaleSessions] = useState<boolean>(true);

  const handleAddSlot = () => {
    const newSlot: SessionScheduleSlot = {
      id: `slot-${Date.now()}`,
      day: 'Monday',
      startTime: '06:00',
      endTime: '07:30',
      sessionTitle: 'Squad Session',
      primaryFocus: 'Aerobic',
      poolLength: poolLength,
    };
    setSchedule([...schedule, newSlot]);
  };

  const handleRemoveSlot = (id: string) => {
    setSchedule(schedule.filter(s => s.id !== id));
  };

  const handleUpdateSlot = (id: string, updates: Partial<SessionScheduleSlot>) => {
    setSchedule(schedule.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleSave = () => {
    let updatedSeason: SeasonPlan = {
      ...season,
      name,
      goal,
      poolLength,
      totalWeeks,
      targetSessionVolumeMeters: targetSessionVolume,
      weeklySchedule: schedule,
    };

    if (shouldRescaleSessions) {
      updatedSeason = scaleSeasonSessionsToTarget(updatedSeason, targetSessionVolume);
    }

    onSave(updatedSeason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Season Setup & Training Schedule</h2>
              <p className="text-xs text-cyan-300/80">Configure squad season buildup goals and weekly pool slots</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Season Basics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Season Name / Campaign
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white outline-none"
                placeholder="e.g. Winter State Championship 2026"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Pool Course
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['25m', '50m', '25y'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPoolLength(p)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                      poolLength === p 
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p === '25m' ? '25m (SCM)' : p === '50m' ? '50m (LCM)' : '25y (SCY)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Season Buildup Goal & Peak Event
              </label>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white outline-none resize-none"
                placeholder="e.g. Peak squad aerobic threshold & qualify 8 swimmers for National Championships in Week 12"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Total Buildup Duration (Weeks)
              </label>
              <select
                value={totalWeeks}
                onChange={e => setTotalWeeks(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white outline-none"
              >
                {[8, 10, 12, 14, 16, 20].map(w => (
                  <option key={w} value={w}>{w} Weeks (Periodized Macrocycle)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Session Volume Calibration */}
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="flex items-center space-x-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <Dumbbell className="w-4 h-4 text-cyan-400" />
                  <span>Target Average Session Volume</span>
                </label>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  Calibrate your squad workouts around <strong className="text-white">~3,000m average per session</strong>, with natural variation: longer endurance/aerobic sessions around 3,200–3,500m and shorter recovery/sprint sessions around 2,500–2,800m.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <input
                  type="number"
                  step="100"
                  min="1500"
                  max="6000"
                  value={targetSessionVolume}
                  onChange={e => setTargetSessionVolume(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-right font-mono font-bold text-white text-sm"
                />
                <span className="text-xs text-slate-400 font-bold">{poolLength.slice(-1)}</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900">
              <span className="text-[11px] text-slate-500 font-semibold">Presets:</span>
              {[
                { label: 'Shorter (~2,500m)', val: 2500 },
                { label: 'Standard (~3,000m)', val: 3000 },
                { label: 'Extended (~3,500m)', val: 3500 },
                { label: 'High Volume (~4,200m)', val: 4200 },
              ].map(p => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setTargetSessionVolume(p.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    targetSessionVolume === p.val
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Re-scale existing sessions checkbox */}
            <label className="flex items-center space-x-2.5 pt-1 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shouldRescaleSessions}
                onChange={e => setShouldRescaleSessions(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900"
              />
              <span>
                Proportionately scale existing season sessions to average <strong className="text-cyan-300">{targetSessionVolume.toLocaleString()}{poolLength.slice(-1)}</strong> (some longer, some shorter)
              </span>
            </label>
          </div>

          {/* Weekly Practice Schedule Slots */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Weekly Squad Practice Slots</span>
                </h3>
                <p className="text-xs text-slate-400">Regular training days and pool hours used to populate weekly cycles</p>
              </div>
              <button
                type="button"
                onClick={handleAddSlot}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Training Slot</span>
              </button>
            </div>

            <div className="space-y-2">
              {schedule.map((slot) => (
                <div 
                  key={slot.id} 
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-wrap items-center gap-3"
                >
                  <div className="w-32">
                    <select
                      value={slot.day}
                      onChange={e => handleUpdateSlot(slot.id, { day: e.target.value as DayOfWeek })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={e => handleUpdateSlot(slot.id, { startTime: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white text-xs"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={e => handleUpdateSlot(slot.id, { endTime: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white text-xs"
                    />
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <input
                      type="text"
                      value={slot.sessionTitle}
                      onChange={e => handleUpdateSlot(slot.id, { sessionTitle: e.target.value })}
                      placeholder="Session title"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
                    />
                  </div>

                  <div className="w-32">
                    <select
                      value={slot.primaryFocus}
                      onChange={e => handleUpdateSlot(slot.id, { primaryFocus: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-cyan-300 font-medium"
                    >
                      <option value="Aerobic">Aerobic Base</option>
                      <option value="Threshold">Threshold (CSS)</option>
                      <option value="Speed">Speed / Sprint</option>
                      <option value="Technique">Technique / Medley</option>
                      <option value="Recovery">Recovery</option>
                      <option value="Test Set">Test Set</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Season Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
