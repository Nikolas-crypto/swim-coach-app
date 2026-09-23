import React, { useState, useEffect } from 'react';
import { WorkoutSession, LaneConfig } from '../types/swim';
import { calculateLaneSendOff } from '../utils/swimCalculators';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Printer, 
  Volume2, 
  VolumeX, 
  Check, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface PoolDeckWhiteboardProps {
  sessions: WorkoutSession[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  lanes: LaneConfig[];
  poolLength: '25m' | '50m' | '25y';
}

export const PoolDeckWhiteboard: React.FC<PoolDeckWhiteboardProps> = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  lanes,
  poolLength,
}) => {
  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  // Pace clock state (0 to 59 seconds loop)
  const [clockSeconds, setClockSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setClockSeconds(prev => (prev + 1) % 60);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleResetClock = () => {
    setClockSeconds(0);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!currentSession) {
    return (
      <div className="p-8 text-center text-slate-400">
        No session selected.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Poolside Control & Digital Pace Clock Banner */}
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden pool-tiles no-print">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Title & Session Selector */}
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Poolside Whiteboard & Digital Pace Clock</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {currentSession.name}
            </h2>
            <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
              <span>{currentSession.dayOfWeek} • {currentSession.scheduledTime}</span>
              <span>•</span>
              <span className="font-bold text-cyan-300">{currentSession.totalDistance.toLocaleString()}{poolLength.slice(-1)}</span>
              <span>•</span>
              <span>{currentSession.estimatedMinutes} min duration</span>
            </div>

            {/* Switch Session Dropdown */}
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-semibold">Select Practice:</span>
              <select
                value={currentSession.id}
                onChange={e => onSelectSession(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-bold outline-none"
              >
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.dayOfWeek}: {s.name} ({s.totalDistance}m)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Digital Pace Clock Box */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/90 border-2 border-cyan-500/40 rounded-2xl p-4 shadow-inner">
            {/* Visual Digital Display */}
            <div className="text-center px-4 py-2 bg-black/80 rounded-xl border border-cyan-900 shadow-2xl min-w-[140px]">
              <div className="text-[10px] uppercase font-bold text-cyan-500/80 tracking-widest mb-0.5">
                SWIM PACE CLOCK
              </div>
              <div className="font-pace text-5xl font-black text-amber-400 tracking-wider">
                {clockSeconds < 10 ? `0${clockSeconds}` : clockSeconds}
              </div>
              <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                SEC • CONTINUOUS SWEEP
              </div>
            </div>

            {/* Clock Controls */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`p-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                    isRunning 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? 'Pause' : 'Start'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetClock}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                  title="Reset clock to :00"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Print Deck Sheet</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable / Poolside Multi-Lane Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 print-area">
        {/* Print Header (Only visible on print or whiteboard) */}
        <div className="border-b border-slate-800 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">
              {currentSession.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Focus: <span className="text-cyan-300 font-bold">{currentSession.focus}</span> | Total Volume: <span className="font-bold">{currentSession.totalDistance}{poolLength.slice(-1)}</span> | Estimated Time: {currentSession.estimatedMinutes} min
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono">
            {poolLength} Course
          </div>
        </div>

        {/* Multi-Lane Columns Header Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pb-2 border-b border-slate-800">
          <div className="md:col-span-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Set Drill / Exercise
          </div>
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {lanes.map(l => (
              <div 
                key={l.id} 
                className="text-center p-1.5 rounded-lg border border-slate-800 bg-slate-950"
              >
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-1 flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ backgroundColor: l.color }}
                >
                  {l.laneNumber}
                </div>
                <div className="text-[11px] font-bold text-white truncate">{l.name.replace(/Lane \d+: /, '')}</div>
                <div className="text-[10px] font-mono text-cyan-400">Base {l.basePace100mSeconds}s</div>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Blocks List */}
        <div className="space-y-6">
          {currentSession.blocks.map((block) => (
            <div key={block.id} className="space-y-2">
              <div className="flex items-center space-x-2 pt-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  block.type === 'warmup' ? 'bg-emerald-500' :
                  block.type === 'preset' ? 'bg-amber-500' :
                  block.type === 'main' ? 'bg-red-500' :
                  block.type === 'secondary' ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {block.title} {block.rounds > 1 ? `(${block.rounds} Rounds)` : ''}
                </h3>
              </div>

              <div className="space-y-2">
                {block.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl items-center"
                  >
                    {/* Drill Details */}
                    <div className="md:col-span-4 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">
                          {item.reps} × {item.distance}m {item.stroke}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-amber-300 font-semibold border border-slate-800">
                          {item.intensity}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-400 italic">
                          "{item.description}"
                        </p>
                      )}

                      {item.equipment.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.equipment.map(eq => (
                            <span key={eq} className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-400">
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lane Specific Send-offs */}
                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                      {lanes.map((lane) => {
                        const sendOff = calculateLaneSendOff(
                          lane,
                          item.distance,
                          item.intensity,
                          item.stroke
                        );

                        return (
                          <div
                            key={lane.id}
                            className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center"
                          >
                            <div className="font-pace text-sm font-bold text-cyan-300">
                              @{sendOff.sendOffStr}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Swim: {sendOff.swimTimeStr}
                            </div>
                            <div className="text-[9px] text-slate-500">
                              +{sendOff.restSec}s rest
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
