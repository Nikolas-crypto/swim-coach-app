import React, { useState } from 'react';
import { WeekCycle, SeasonPlan } from '../types/swim';
import { SEASON_MACROCYCLE_TARGETS } from '../data/seedData';
import { 
  TrendingUp, 
  BarChart2, 
  ShieldAlert, 
  Award, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Flame,
  ArrowUpRight,
  Info,
  Edit3,
  Check,
  X
} from 'lucide-react';

interface SeasonProgressionProps {
  season: SeasonPlan;
  onSelectWeek: (weekNum: number) => void;
  onUpdateWeekVolumeTarget?: (weekNum: number, newTarget: number) => void;
}

export const SeasonProgression: React.FC<SeasonProgressionProps> = ({
  season,
  onSelectWeek,
  onUpdateWeekVolumeTarget,
}) => {
  const [editingWeekNum, setEditingWeekNum] = useState<number | null>(null);
  const [tempTargetVal, setTempTargetVal] = useState<number>(20000);

  const maxVolume = Math.max(
    30000,
    ...season.weeks.map(w => w.targetVolumeMeters || 0),
    ...season.weeks.map(w => w.actualVolumeMeters || 0),
    ...SEASON_MACROCYCLE_TARGETS.map(m => m.targetVolumeMeters)
  );

  const handleStartEdit = (e: React.MouseEvent, weekNum: number, currentTarget: number) => {
    e.stopPropagation();
    setEditingWeekNum(weekNum);
    setTempTargetVal(currentTarget);
  };

  const handleSaveEdit = (e: React.MouseEvent, weekNum: number) => {
    e.stopPropagation();
    const val = Number(tempTargetVal);
    if (!isNaN(val) && val >= 0 && onUpdateWeekVolumeTarget) {
      onUpdateWeekVolumeTarget(weekNum, Math.round(val));
    }
    setEditingWeekNum(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWeekNum(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950 border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Macrocycle Periodization & Progressive Overload</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {season.name} ({season.totalWeeks} Weeks)
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Target Goal: <span className="text-cyan-300 font-semibold">{season.goal}</span>
            </p>
          </div>

          <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 text-right">
            <span className="text-xs text-slate-400 block font-semibold">Active Macrocycle Status</span>
            <span className="text-lg font-black text-emerald-400">
              Week {season.currentWeekNumber} of {season.totalWeeks}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Volume Progression Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              <span>Weekly Volume Progression Curve ({season.poolLength})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparing Planned Actual Volume vs Macrocycle Target Volume
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              <span className="text-slate-300">Planned Sessions Volume</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-slate-700 border border-slate-600 border-dashed" />
              <span className="text-slate-400">Target Benchmark</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-64 flex items-end gap-2 sm:gap-3 px-2 border-b border-slate-800">
            {SEASON_MACROCYCLE_TARGETS.slice(0, season.totalWeeks).map((target) => {
              const weekData = season.weeks.find(w => w.weekNumber === target.weekNumber);
              const actualVol = weekData ? weekData.actualVolumeMeters : 0;
              const weekTargetVol = weekData?.targetVolumeMeters ?? target.targetVolumeMeters;
              const actualHeightPercent = Math.min(100, Math.round((actualVol / maxVolume) * 100));
              const targetHeightPercent = Math.min(100, Math.round((weekTargetVol / maxVolume) * 100));
              const isCurrent = target.weekNumber === season.currentWeekNumber;

              let phaseColor = 'bg-cyan-500';
              if (target.phase === 'Threshold Peak') phaseColor = 'bg-amber-500';
              else if (target.phase === 'Deload / Recovery') phaseColor = 'bg-emerald-500';
              else if (target.phase === 'Taper Phase') phaseColor = 'bg-purple-500';
              else if (target.phase === 'Race Week') phaseColor = 'bg-rose-500';

              return (
                <div
                  key={target.weekNumber}
                  onClick={() => onSelectWeek(target.weekNumber)}
                  className={`flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative p-1 rounded-t-lg transition ${
                    isCurrent ? 'bg-cyan-950/40 ring-1 ring-cyan-400/50' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-16 z-20 bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-[10px] whitespace-nowrap shadow-xl transition">
                    <div className="font-bold text-cyan-300">Week {target.weekNumber}: {target.theme}</div>
                    <div>Actual: {actualVol ? `${actualVol.toLocaleString()}${season.poolLength.slice(-1)}` : 'Not planned'}</div>
                    <div className="text-slate-400">Target Goal: {weekTargetVol.toLocaleString()}${season.poolLength.slice(-1)} ({target.phase})</div>
                  </div>

                  {/* Target line indicator */}
                  <div
                    className="absolute w-full border-t-2 border-dashed border-slate-500/50 pointer-events-none"
                    style={{ bottom: `${targetHeightPercent}%` }}
                  />

                  {/* Actual Volume Bar */}
                  <div className="w-full max-w-[28px] flex flex-col justify-end h-full">
                    {actualVol > 0 ? (
                      <div
                        className={`w-full rounded-t transition-all duration-500 ${phaseColor} ${
                          isCurrent ? 'shadow-lg shadow-cyan-500/40' : 'opacity-85 group-hover:opacity-100'
                        }`}
                        style={{ height: `${actualHeightPercent}%` }}
                      />
                    ) : (
                      <div
                        className="w-full bg-slate-800/60 rounded-t border-t border-slate-700 border-dashed"
                        style={{ height: `${targetHeightPercent}%` }}
                      />
                    )}
                  </div>

                  {/* Week label */}
                  <span className={`text-[10px] font-bold mt-2 ${isCurrent ? 'text-cyan-300' : 'text-slate-400'}`}>
                    W{target.weekNumber}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 pt-2 px-1">
            <span>Base & Aerobic Build</span>
            <span>Threshold Volume Peak</span>
            <span>Deload & Supercompensation</span>
            <span>Race Taper & Championship</span>
          </div>
        </div>
      </div>

      {/* Periodization Macrocycle Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Macrocycle Periodization Blueprint</span>
          </h3>
          <span className="text-xs text-slate-400">
            Click any row to jump to and edit that microcycle
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Week</th>
                <th className="py-2.5 px-3">Phase & Theme</th>
                <th className="py-2.5 px-3">Target Volume</th>
                <th className="py-2.5 px-3">Planned Volume</th>
                <th className="py-2.5 px-3">Progression / Status</th>
                <th className="py-2.5 px-3">Primary Training Focus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {SEASON_MACROCYCLE_TARGETS.slice(0, season.totalWeeks).map((target) => {
                const weekData = season.weeks.find(w => w.weekNumber === target.weekNumber);
                const isCurrent = target.weekNumber === season.currentWeekNumber;
                const actualVol = weekData ? weekData.actualVolumeMeters : 0;

                let phaseBadge = 'bg-cyan-950 text-cyan-300 border-cyan-800';
                if (target.phase === 'Threshold Peak') phaseBadge = 'bg-amber-950 text-amber-300 border-amber-800';
                else if (target.phase === 'Deload / Recovery') phaseBadge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                else if (target.phase === 'Taper Phase') phaseBadge = 'bg-purple-950 text-purple-300 border-purple-800';
                else if (target.phase === 'Race Week') phaseBadge = 'bg-rose-950 text-rose-300 border-rose-800';

                return (
                  <tr
                    key={target.weekNumber}
                    onClick={() => onSelectWeek(target.weekNumber)}
                    className={`hover:bg-slate-800/40 cursor-pointer transition ${
                      isCurrent ? 'bg-cyan-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                          isCurrent ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {target.weekNumber}
                        </span>
                        {isCurrent && <span className="text-[10px] text-cyan-400 font-bold">Active</span>}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="text-white font-bold">{target.theme}</span>
                        <div className="mt-0.5">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] border ${phaseBadge}`}>
                            {target.phase}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {editingWeekNum === target.weekNumber ? (
                        <div 
                          className="flex items-center space-x-1" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="number"
                            step="500"
                            min="0"
                            max="100000"
                            value={tempTargetVal}
                            onChange={(e) => setTempTargetVal(Number(e.target.value))}
                            className="w-24 bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={(e) => handleSaveEdit(e, target.weekNumber)}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                            title="Save Target Volume"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleStartEdit(e, target.weekNumber, weekData?.targetVolumeMeters ?? target.targetVolumeMeters)}
                          className="group flex items-center space-x-1.5 px-2 py-1 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition cursor-pointer text-left"
                          title="Click to edit weekly volume target"
                        >
                          <span className="font-mono text-slate-300 group-hover:text-cyan-300 font-bold">
                            {(weekData?.targetVolumeMeters ?? target.targetVolumeMeters).toLocaleString()}{season.poolLength.slice(-1)}
                          </span>
                          <Edit3 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition" />
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {actualVol > 0 ? (
                        <span className="font-pace font-bold text-cyan-300">
                          {actualVol.toLocaleString()}{season.poolLength.slice(-1)}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Not yet populated</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {weekData?.isConfirmed ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmed</span>
                        </span>
                      ) : actualVol > 0 ? (
                        <span className="text-amber-400 font-semibold">Draft</span>
                      ) : (
                        <span className="text-slate-500">Scheduled</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {target.focus}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
