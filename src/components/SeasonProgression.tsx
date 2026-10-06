import React, { useState } from 'react';
import { WeekCycle, SeasonPlan, CycleFocusType } from '../types/swim';
import { 
  CYCLE_FOCUS_PRESETS, 
  applyCycleFocusToSeason 
} from '../data/cycleFocusPresets';
import { 
  TrendingUp, 
  BarChart2, 
  Award, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Info, 
  Edit3, 
  Check, 
  X,
  Sparkles,
  Zap,
  Activity,
  Compass,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface SeasonProgressionProps {
  season: SeasonPlan;
  onSelectWeek: (weekNum: number) => void;
  onUpdateWeekVolumeTarget?: (weekNum: number, newTarget: number) => void;
  onChangeCycleFocus?: (focusType: CycleFocusType, weeksCount?: number) => void;
}

export const SeasonProgression: React.FC<SeasonProgressionProps> = ({
  season,
  onSelectWeek,
  onUpdateWeekVolumeTarget,
  onChangeCycleFocus,
}) => {
  const currentFocusType: CycleFocusType = season.cycleFocus || 'competition_peak';
  const currentPreset = CYCLE_FOCUS_PRESETS[currentFocusType] || CYCLE_FOCUS_PRESETS.competition_peak;

  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [selectedModalFocus, setSelectedModalFocus] = useState<CycleFocusType>(currentFocusType);
  const [selectedDurationWeeks, setSelectedDurationWeeks] = useState<number>(currentPreset.suggestedDurationWeeks || 8);

  const [editingWeekNum, setEditingWeekNum] = useState<number | null>(null);
  const [tempTargetVal, setTempTargetVal] = useState<number>(20000);

  // Active blueprints for this cycle
  const activeBlueprints = currentPreset.blueprints.slice(0, season.totalWeeks || 8);

  const maxVolume = Math.max(
    30000,
    ...(season?.weeks || []).map(w => w.targetVolumeMeters || 0),
    ...(season?.weeks || []).map(w => w.actualVolumeMeters || 0),
    ...activeBlueprints.map(m => m.targetVolumeMeters)
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

  const handleApplyFocusChange = () => {
    if (onChangeCycleFocus) {
      onChangeCycleFocus(selectedModalFocus, selectedDurationWeeks);
    }
    setIsFocusModalOpen(false);
  };

  // Color mappings
  const getAccentBorder = (type: CycleFocusType) => {
    switch (type) {
      case 'endurance_focus': return 'border-emerald-500/40 text-emerald-300';
      case 'threshold_focus': return 'border-amber-500/40 text-amber-300';
      case 'vo2max_focus': return 'border-rose-500/40 text-rose-300';
      case 'speed_power_focus': return 'border-purple-500/40 text-purple-300';
      case 'technique_focus': return 'border-cyan-500/40 text-cyan-300';
      default: return 'border-blue-500/40 text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Cycle Focus Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950 border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center space-x-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Makrozyklus-Periodisierungsarchitektur</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getAccentBorder(currentFocusType)} bg-slate-950/80`}>
                Aktiver Schwerpunkt: {currentPreset.name}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              {season.name} ({season.totalWeeks} Wochen)
            </h2>

            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              {currentPreset.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-slate-950 px-5 py-3 rounded-xl border border-slate-800 text-right">
              <span className="text-xs text-slate-400 block font-semibold">Zyklus-Fortschritt</span>
              <span className="text-lg font-black text-emerald-400">
                Woche {season.currentWeekNumber} von {season.totalWeeks}
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedModalFocus(currentFocusType);
                setSelectedDurationWeeks(season.totalWeeks || 8);
                setIsFocusModalOpen(true);
              }}
              className="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-900/40 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Zyklus-Schwerpunkt wechseln</span>
            </button>
          </div>
        </div>

        {/* Quick Focus Switcher Pills */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center space-x-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Schwerpunkt-Vorlagen:</span>
          </span>
          {(Object.keys(CYCLE_FOCUS_PRESETS) as CycleFocusType[]).map((focusKey) => {
            const preset = CYCLE_FOCUS_PRESETS[focusKey];
            const isActive = currentFocusType === focusKey;

            return (
              <button
                key={focusKey}
                onClick={() => {
                  if (onChangeCycleFocus && !isActive) {
                    onChangeCycleFocus(focusKey, preset.suggestedDurationWeeks);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{preset.shortLabel}</span>
                {isActive && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cycle Scientific Blueprint Details & Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Objectives & Physiology */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Physiologische Anpassung</span>
          </div>
          <h4 className="text-sm font-bold text-white">Biologische Zielanpassung</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {currentPreset.physiologicalAdaptation}
          </p>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
            <strong className="text-cyan-300 block mb-0.5">Zyklus-Struktur:</strong>
            {currentPreset.weeklyStructureSummary}
          </div>
        </div>

        {/* Benchmarks (Middle & Right Columns) */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Leistungs-Benchmarks & Testprotokolle</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">Standardisierte Kader-Meilensteine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentPreset.benchmarks.map((bm, bIdx) => (
              <div key={bIdx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                    Benchmark #{bIdx + 1}
                  </span>
                  <div className="text-xs font-extrabold text-white mt-0.5">{bm.metric}</div>
                  <p className="text-[11px] text-slate-400 mt-1">{bm.targetDescription}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                  Testprotokoll: {bm.testProtocol}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Volume Progression Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              <span>Wöchentliche Umfangs-Progressionskurve ({season.poolLength})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Vergleich des geplanten Volumens mit dem {currentPreset.shortLabel} Soll-Benchmark
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-cyan-500 shadow-sm shadow-cyan-500/50" />
              <span className="text-slate-300">Geplantes Trainingsvolumen</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-sm bg-slate-700 border border-slate-600 border-dashed" />
              <span className="text-slate-400">Soll-Vorgabe (Benchmark)</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-64 flex items-end gap-2 sm:gap-3 px-2 border-b border-slate-800">
            {activeBlueprints.map((target) => {
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
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-20 z-20 bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-[10px] whitespace-nowrap shadow-xl transition">
                    <div className="font-bold text-cyan-300">Woche {target.weekNumber}: {target.theme}</div>
                    <div>Geplant: {actualVol ? `${actualVol.toLocaleString()}${season.poolLength.slice(-1)}` : 'Nicht geplant'}</div>
                    <div className="text-slate-400">Soll: {weekTargetVol.toLocaleString()}${season.poolLength.slice(-1)} ({target.phase})</div>
                    <div className="text-amber-300 text-[9px] mt-0.5">{target.focus}</div>
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
            <span>Zyklusstart / Kalibrierung</span>
            <span>Progression & Belastung</span>
            <span>Regeneration & Spülung</span>
            <span>Spitzenform & Überprüfung</span>
          </div>
        </div>
      </div>

      {/* Periodization Macrocycle Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{currentPreset.name} — Wöchentlicher Mikrozyklus-Plan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klicke auf eine Zeile, um zur Woche im Planer zu springen oder das Soll-Volumen zu bearbeiten
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-2.5 px-3">Woche</th>
                <th className="py-2.5 px-3">Thema & Schwerpunkt</th>
                <th className="py-2.5 px-3">Soll-Umfang</th>
                <th className="py-2.5 px-3">Ist-Planung</th>
                <th className="py-2.5 px-3">Primäre Energiezone</th>
                <th className="py-2.5 px-3">Kern-Trainingseinheit (Schlüsseleinheit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {activeBlueprints.map((target) => {
                const weekData = season.weeks.find(w => w.weekNumber === target.weekNumber);
                const isCurrent = target.weekNumber === season.currentWeekNumber;
                const actualVol = weekData ? weekData.actualVolumeMeters : 0;
                const targetVol = weekData?.targetVolumeMeters ?? target.targetVolumeMeters;
                const isEditing = editingWeekNum === target.weekNumber;

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
                        {isCurrent && <span className="text-[10px] text-cyan-400 font-bold">Aktiv</span>}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div>
                        <span className="text-white font-bold">{target.theme}</span>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] border ${phaseBadge}`}>
                            {target.phase}
                          </span>
                          <span className="text-slate-400 text-[11px]">• {target.focus}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isEditing ? (
                        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            step="500"
                            value={tempTargetVal}
                            onChange={(e) => setTempTargetVal(Number(e.target.value))}
                            className="w-20 bg-slate-950 border border-cyan-500 rounded px-1.5 py-0.5 text-xs text-white"
                          />
                          <button
                            onClick={(e) => handleSaveEdit(e, target.weekNumber)}
                            className="p-1 rounded bg-cyan-600 text-white hover:bg-cyan-500"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 group/edit">
                          <span className="font-mono font-bold text-slate-300">
                            {targetVol.toLocaleString()}{season.poolLength.slice(-1)}
                          </span>
                          {onUpdateWeekVolumeTarget && (
                            <button
                              onClick={(e) => handleStartEdit(e, target.weekNumber, targetVol)}
                              className="opacity-0 group-hover/edit:opacity-100 p-1 text-slate-400 hover:text-cyan-300 transition"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-mono font-bold ${
                          actualVol > 0 ? 'text-cyan-400' : 'text-slate-500'
                        }`}>
                          {actualVol > 0 ? `${actualVol.toLocaleString()}${season.poolLength.slice(-1)}` : '—'}
                        </span>
                        {actualVol > 0 && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({Math.round((actualVol / targetVol) * 100)}%)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-300 font-semibold text-[11px]">
                        {target.primaryEnergyZone}
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <span className="text-slate-400 text-[11px] line-clamp-1 group-hover:text-slate-200">
                        {target.keySessionHighlight}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cycle Focus Switcher Modal */}
      {isFocusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Saisonzyklus-Schwerpunkt auswählen</h3>
                  <p className="text-xs text-slate-400">
                    Wähle eine Periodisierungsarchitektur, um den gesamten Trainingsblock auf einen spezifischen Reiz auszurichten
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFocusModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(CYCLE_FOCUS_PRESETS) as CycleFocusType[]).map((focusKey) => {
                const preset = CYCLE_FOCUS_PRESETS[focusKey];
                const isSelected = selectedModalFocus === focusKey;

                return (
                  <div
                    key={focusKey}
                    onClick={() => {
                      setSelectedModalFocus(focusKey);
                      setSelectedDurationWeeks(preset.suggestedDurationWeeks);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 ring-1 ring-cyan-500 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                          {preset.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </div>
                      <h4 className="text-sm font-black text-white">{preset.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">
                        {preset.summary}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between">
                      <span>Empfohlen: {preset.suggestedDurationWeeks} Wochen</span>
                      <span>Basis-Umfang: ~{preset.defaultWeeklyVolumeBase.toLocaleString()}m</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Duration Selector */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <strong className="text-white block">Zyklusdauer in Wochen:</strong>
                <span className="text-slate-400 text-[11px]">
                  Über wie viele wöchentliche Mikrozyklen soll sich dieser Schwerpunktblock erstrecken?
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {[4, 6, 8, 10, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedDurationWeeks(num)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      selectedDurationWeeks === num
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {num}W
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsFocusModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleApplyFocusChange}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-900/40 cursor-pointer"
              >
                <span>Schwerpunkt anwenden & Saisonziele aktualisieren</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
