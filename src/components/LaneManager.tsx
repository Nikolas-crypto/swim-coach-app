import React, { useState } from 'react';
import { LaneConfig, IntensityZone, StrokeType } from '../types/swim';
import { 
  formatSecondsToTime, 
  parseTimeToSeconds, 
  calculateLaneSendOff 
} from '../utils/swimCalculators';
import { 
  Users, 
  Plus, 
  Trash2, 
  Timer, 
  Gauge, 
  Sparkles, 
  UserPlus, 
  X,
  Info
} from 'lucide-react';

interface LaneManagerProps {
  lanes: LaneConfig[];
  onUpdateLanes: (lanes: LaneConfig[]) => void;
  poolLength: '25m' | '50m' | '25y';
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

export const LaneManager: React.FC<LaneManagerProps> = ({
  lanes,
  onUpdateLanes,
  poolLength,
}) => {
  const [selectedLaneId, setSelectedLaneId] = useState<string>(lanes[0]?.id || '');
  const [newSwimmerName, setNewSwimmerName] = useState('');
  const [previewDistance, setPreviewDistance] = useState<number>(100);
  const [previewStroke, setPreviewStroke] = useState<StrokeType>('Freestyle');

  const selectedLane = lanes.find(l => l.id === selectedLaneId) || lanes[0];

  const handleUpdateLane = (id: string, updates: Partial<LaneConfig>) => {
    onUpdateLanes(lanes.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleAddLane = () => {
    const nextNumber = (lanes?.length || 0) + 1;
    const colorIndex = (nextNumber - 1) % PRESET_COLORS.length;
    const lastLane = lanes && lanes.length > 0 ? lanes[lanes.length - 1] : undefined;
    const newBase = lastLane ? lastLane.basePace100mSeconds + 10 : 90;

    const newLane: LaneConfig = {
      id: `lane-${Date.now()}`,
      laneNumber: nextNumber,
      name: `Lane ${nextNumber}: Squad Group`,
      color: PRESET_COLORS[colorIndex],
      basePace100mSeconds: newBase,
      swimmers: [],
      maxSwimmers: 8,
      notes: `${formatSecondsToTime(newBase)} base CSS pace.`,
    };

    const updated = [...(lanes || []), newLane];
    onUpdateLanes(updated);
    setSelectedLaneId(newLane.id);
  };

  const handleDeleteLane = (id: string) => {
    if ((lanes?.length || 0) <= 1) return;
    const updated = (lanes || []).filter(l => l.id !== id).map((l, idx) => ({
      ...l,
      laneNumber: idx + 1,
    }));
    onUpdateLanes(updated);
    if (selectedLaneId === id && updated.length > 0) {
      setSelectedLaneId(updated[0].id);
    }
  };

  const handleAddSwimmer = (laneId: string) => {
    if (!newSwimmerName.trim()) return;
    const lane = lanes.find(l => l.id === laneId);
    if (!lane) return;
    handleUpdateLane(laneId, {
      swimmers: [...lane.swimmers, newSwimmerName.trim()],
    });
    setNewSwimmerName('');
  };

  const handleRemoveSwimmer = (laneId: string, swimmerIndex: number) => {
    const lane = lanes.find(l => l.id === laneId);
    if (!lane) return;
    const updatedSwimmers = [...lane.swimmers];
    updatedSwimmers.splice(swimmerIndex, 1);
    handleUpdateLane(laneId, { swimmers: updatedSwimmers });
  };

  const zones: IntensityZone[] = [
    'Recovery',
    'Aerobic (EN1)',
    'Threshold (EN2)',
    'VO2Max (EN3)',
    'Sprint (SP)',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950 border border-cyan-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Gauge className="w-4 h-4" />
              <span>Squad Speed Differentiation & Multi-Lane Pacing</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Lane Rosters & 100m Base Intervals</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Configure each lane's Critical Swim Speed (CSS / 100m base interval). The app automatically adjusts send-off cycles, work-to-rest ratios, and target splits across all workouts.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddLane}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pool Lane</span>
            </button>
          </div>
        </div>

        {/* Lane Float Graphic Banner */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold">
            <span>Pool Deck Layout ({poolLength} Course - {lanes?.length || 0} Active Lanes)</span>
            <span>Total Squad Swimmers: {(lanes || []).reduce((acc, l) => acc + (l?.swimmers?.length || 0), 0)}</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {(lanes || []).map((lane) => {
              const isSelected = lane.id === selectedLaneId;
              return (
                <button
                  key={lane.id}
                  onClick={() => setSelectedLaneId(lane.id)}
                  className={`text-left p-3 rounded-xl border transition relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: lane.color }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow"
                      style={{ backgroundColor: lane.color }}
                    >
                      {lane.laneNumber}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/50">
                      {formatSecondsToTime(lane.basePace100mSeconds)}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white mt-1.5 truncate">
                    {lane.name.replace(/Lane \d+: /, '')}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{lane?.swimmers?.length || 0} swimmers</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Lane Deep Dive Config & Send-off Table */}
      {selectedLane && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lane Configuration Form */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md"
                    style={{ backgroundColor: selectedLane.color }}
                  >
                    {selectedLane.laneNumber}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Lane {selectedLane.laneNumber} Profile</h3>
                    <p className="text-xs text-slate-400">Configure base interval & swimmer assignments</p>
                  </div>
                </div>

                {lanes.length > 1 && (
                  <button
                    onClick={() => handleDeleteLane(selectedLane.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                    title="Delete lane"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-4 text-xs">
                {/* Lane Name */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lane Title / Group</label>
                  <input
                    type="text"
                    value={selectedLane.name}
                    onChange={e => handleUpdateLane(selectedLane.id, { name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white font-medium outline-none"
                    placeholder="e.g. Senior A / Distance"
                  />
                </div>

                {/* 100m Base Pace (CSS) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-cyan-300 font-bold uppercase tracking-wider flex items-center space-x-1">
                      <Timer className="w-3.5 h-3.5 text-cyan-400" />
                      <span>100m Base Pace (CSS / Threshold)</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Seconds: <span className="text-white font-mono">{selectedLane.basePace100mSeconds}s</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateLane(selectedLane.id, { 
                        basePace100mSeconds: Math.max(50, selectedLane.basePace100mSeconds - 5) 
                      })}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-mono font-bold transition"
                    >
                      -5s
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateLane(selectedLane.id, { 
                        basePace100mSeconds: Math.max(50, selectedLane.basePace100mSeconds - 1) 
                      })}
                      className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-mono text-xs transition"
                    >
                      -1s
                    </button>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={formatSecondsToTime(selectedLane.basePace100mSeconds)}
                        onChange={e => {
                          const secs = parseTimeToSeconds(e.target.value);
                          if (secs > 0) {
                            handleUpdateLane(selectedLane.id, { basePace100mSeconds: secs });
                          }
                        }}
                        className="w-full text-center bg-slate-950 border-2 border-cyan-500/40 rounded-lg py-1.5 text-lg font-pace font-bold text-cyan-300 shadow-inner"
                      />
                      <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 font-mono">/100m</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUpdateLane(selectedLane.id, { 
                        basePace100mSeconds: selectedLane.basePace100mSeconds + 1 
                      })}
                      className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-mono text-xs transition"
                    >
                      +1s
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateLane(selectedLane.id, { 
                        basePace100mSeconds: selectedLane.basePace100mSeconds + 5 
                      })}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-mono font-bold transition"
                    >
                      +5s
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Universal yardstick: The baseline time this lane completes a steady 100m effort on.
                  </p>
                </div>

                {/* Lane Color */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5">Lane Rope / Marker Color</label>
                  <div className="flex items-center space-x-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleUpdateLane(selectedLane.id, { color: c })}
                        className={`w-6 h-6 rounded-full transition transform ${
                          selectedLane.color === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Swimmers Roster */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-300 font-semibold flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Swimmer Roster ({selectedLane?.swimmers?.length || 0} athletes)</span>
                    </label>
                  </div>

                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={newSwimmerName}
                      onChange={e => setNewSwimmerName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSwimmer(selectedLane.id)}
                      placeholder="Add swimmer name..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSwimmer(selectedLane.id)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs flex items-center space-x-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
                    {(selectedLane?.swimmers?.length || 0) === 0 ? (
                      <span className="text-[11px] text-slate-500 italic p-1">No swimmers assigned yet</span>
                    ) : (
                      (selectedLane?.swimmers || []).map((swimmer, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center space-x-1 bg-slate-800/80 text-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-700"
                        >
                          <span>{swimmer}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSwimmer(selectedLane.id, idx)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Coaching Notes</label>
                  <input
                    type="text"
                    value={selectedLane.notes || ''}
                    onChange={e => handleUpdateLane(selectedLane.id, { notes: e.target.value })}
                    placeholder="Focus cues, target stroke, qualification goals..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lane Auto Send-Off & Pace Chart Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Auto-Calculated Send-Off Intervals for Lane {selectedLane.laneNumber}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated for base pace <span className="font-mono text-cyan-300 font-bold">{formatSecondsToTime(selectedLane.basePace100mSeconds)}/100m</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  {/* Distance Selector */}
                  <select
                    value={previewDistance}
                    onChange={e => setPreviewDistance(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-semibold"
                  >
                    {[25, 50, 75, 100, 150, 200, 300, 400, 800].map(d => (
                      <option key={d} value={d}>{d}{poolLength.slice(-1)} Rep</option>
                    ))}
                  </select>

                  {/* Stroke Selector */}
                  <select
                    value={previewStroke}
                    onChange={e => setPreviewStroke(e.target.value as StrokeType)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-cyan-300 text-xs font-semibold"
                  >
                    {['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM', 'Kick', 'Pull'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Energy Zones Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="py-2.5 px-3">Energy Zone</th>
                      <th className="py-2.5 px-3">Target Swim Time</th>
                      <th className="py-2.5 px-3 text-cyan-400">Send-Off Interval</th>
                      <th className="py-2.5 px-3">Rest Margin</th>
                      <th className="py-2.5 px-3">Heart Rate / Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {zones.map((zone) => {
                      const paceInfo = calculateLaneSendOff(
                        selectedLane,
                        previewDistance,
                        zone,
                        previewStroke
                      );

                      let zoneBadgeColor = 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
                      let purpose = 'Aerobic capillary base';
                      if (zone === 'Recovery') {
                        zoneBadgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
                        purpose = 'Lactate clearance & tech';
                      } else if (zone === 'Threshold (EN2)') {
                        zoneBadgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800';
                        purpose = 'CSS Anaerobic threshold';
                      } else if (zone === 'VO2Max (EN3)') {
                        zoneBadgeColor = 'text-red-400 bg-red-950/60 border-red-800';
                        purpose = 'Max aerobic power & pain';
                      } else if (zone === 'Sprint (SP)') {
                        zoneBadgeColor = 'text-purple-400 bg-purple-950/60 border-purple-800';
                        purpose = 'Alactic speed & explosive dive';
                      }

                      return (
                        <tr key={zone} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${zoneBadgeColor}`}>
                              {zone}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-200">
                            {paceInfo.swimTimeStr}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-pace text-sm font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/60">
                              @{paceInfo.sendOffStr}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono">
                            ~{paceInfo.restSec}s rest
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px]">
                            {purpose}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Multi-Lane Quick Cross Comparison */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Cross-Squad Send-Off Comparison for: {previewDistance}m {previewStroke} (Threshold EN2)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
                  {lanes.map(l => {
                    const lPace = calculateLaneSendOff(l, previewDistance, 'Threshold (EN2)', previewStroke);
                    return (
                      <div 
                        key={l.id}
                        className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center"
                      >
                        <div className="text-[11px] font-bold truncate text-slate-300">
                          {l.name.split(':')[0]}
                        </div>
                        <div className="font-pace text-sm font-bold text-cyan-300 mt-1">
                          @{lPace.sendOffStr}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Swim: {lPace.swimTimeStr}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
