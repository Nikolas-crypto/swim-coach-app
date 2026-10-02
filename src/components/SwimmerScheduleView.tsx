import React, { useState } from 'react';
import { 
  WeekCycle, 
  WorkoutSession, 
  LaneConfig, 
  WorkoutBlock, 
  EquipmentItem 
} from '../types/swim';
import { AppUser } from '../types/auth';
import { calculateBlockDistance } from '../utils/swimCalculators';
import { 
  Calendar, 
  Clock, 
  Flame, 
  Award, 
  Layers, 
  ShieldCheck, 
  Gauge, 
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp,
  Droplets,
  Timer,
  Sparkles
} from 'lucide-react';

interface SwimmerScheduleViewProps {
  currentWeek: WeekCycle;
  lanes: LaneConfig[];
  poolLength: '25m' | '50m' | '25y';
  user: AppUser;
}

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const SwimmerScheduleView: React.FC<SwimmerScheduleViewProps> = ({
  currentWeek,
  lanes = [],
  poolLength = '25m',
  user,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() => {
    return currentWeek.sessions?.[0]?.id || null;
  });
  const [selectedLaneId, setSelectedLaneId] = useState<string>(() => {
    // If swimmer has assigned lane, default to that lane
    if (user.assignedLane && lanes.length > 0) {
      const matched = lanes.find(l => l.laneNumber === user.assignedLane);
      if (matched) return matched.id;
    }
    return lanes[0]?.id || '';
  });

  const activeLane = lanes.find(l => l.id === selectedLaneId) || lanes[0];

  // Group sessions by day
  const sessionsByDay = DAYS_ORDER.map(day => {
    const session = (currentWeek.sessions || []).find(s => s.dayOfWeek === day);
    return {
      day,
      session,
    };
  });

  const selectedSession = (currentWeek.sessions || []).find(s => s.id === selectedSessionId) 
    || currentWeek.sessions?.[0] 
    || null;

  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  const getEquipmentBadgeColor = (item: EquipmentItem) => {
    switch (item) {
      case 'Kickboard': return 'bg-amber-950/80 text-amber-300 border-amber-800/80';
      case 'Pull Buoy': return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
      case 'Paddles': return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80';
      case 'Fins': return 'bg-blue-950/80 text-blue-300 border-blue-800/80';
      case 'Snorkel': return 'bg-purple-950/80 text-purple-300 border-purple-800/80';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getFocusBadgeColor = (focus: string) => {
    switch (focus) {
      case 'Threshold': return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'Speed': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Aerobic': return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'Technique': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Recovery': return 'bg-teal-950 text-teal-300 border-teal-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner: Swimmer Portal Status */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900/90 to-blue-950/70 border border-cyan-500/30 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-500/40 shadow-inner">
            <Droplets className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                Swimmer Schedule Portal
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Read-Only Access
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Current Week: Week {currentWeek.weekNumber} Schedule
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              {currentWeek.theme} • <span className="text-cyan-300 font-semibold">{currentWeek.phase}</span>
            </p>
          </div>
        </div>

        {/* Volume & Status Pills */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Target Volume</div>
            <div className="text-sm font-extrabold text-cyan-300">
              {(currentWeek.targetVolumeMeters || 0).toLocaleString()} {poolLength === '25y' ? 'yd' : 'm'}
            </div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Planned Mileage</div>
            <div className="text-sm font-extrabold text-emerald-400">
              {(currentWeek.actualVolumeMeters || 0).toLocaleString()} {poolLength === '25y' ? 'yd' : 'm'}
            </div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Scheduled Sessions</div>
            <div className="text-sm font-extrabold text-white">
              {currentWeek.sessions?.length || 0} Workouts
            </div>
          </div>
        </div>
      </div>

      {/* Swimmer's Personal Lane Selector & CSS Pace Bar */}
      {lanes.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-lg text-cyan-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>Your Squad Lane Pace:</span>
                <span className="text-cyan-400 font-extrabold">{activeLane?.name || `Lane 1`}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Base CSS Pace: <span className="font-mono text-cyan-300 font-bold">{Math.floor(activeLane?.basePace100mSeconds / 60)}:{String(activeLane?.basePace100mSeconds % 60).padStart(2, '0')}</span> / 100{poolLength === '25y' ? 'y' : 'm'}
                {activeLane?.swimmers?.length ? ` • Swimmers: ${activeLane.swimmers.join(', ')}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-400 font-semibold mr-1">Switch Lane:</span>
            {lanes.map((lane) => (
              <button
                key={lane.id}
                onClick={() => setSelectedLaneId(lane.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedLaneId === lane.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                L{lane.laneNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Week Schedule Overview Cards (Mon - Sun) */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>Week {currentWeek.weekNumber} Schedule by Day</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {sessionsByDay.map(({ day, session }) => {
            const isToday = day.toLowerCase() === todayName.toLowerCase();
            const isSelected = session && selectedSessionId === session.id;

            return (
              <div
                key={day}
                onClick={() => session && setSelectedSessionId(session.id)}
                className={`rounded-2xl border p-3.5 transition flex flex-col justify-between min-h-[140px] relative ${
                  session
                    ? isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/50 cursor-pointer ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 cursor-pointer'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    isToday ? 'text-cyan-400' : 'text-slate-300'
                  }`}>
                    {day.substring(0, 3)}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-extrabold bg-cyan-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase">
                      Today
                    </span>
                  )}
                </div>

                {/* Session Content or Rest */}
                {session ? (
                  <div className="space-y-1.5 flex-1">
                    <div className="text-xs font-bold text-white line-clamp-2 leading-tight">
                      {session.name}
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{session.scheduledTime || '06:00 AM'}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getFocusBadgeColor(session.focus)}`}>
                        {session.focus}
                      </span>
                      <span className="text-[11px] font-mono font-extrabold text-cyan-300">
                        {(session.totalDistance || 0).toLocaleString()}{poolLength === '25y' ? 'y' : 'm'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                    <span className="text-xs text-slate-500 font-semibold">Rest / Recovery</span>
                    <span className="text-[10px] text-slate-600">No scheduled squad session</span>
                  </div>
                )}

                {/* View Details hint */}
                {session && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{session.blocks?.length || 0} sets</span>
                    <span className={`font-bold ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {isSelected ? 'Viewing' : 'View'} →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Workout Deep Dive (Sets, Reps, Drills, Intervals & Equipment) */}
      {selectedSession ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          {/* Workout Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
                  {selectedSession.dayOfWeek} Workout
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getFocusBadgeColor(selectedSession.focus)}`}>
                  {selectedSession.focus} Focus
                </span>
                {selectedSession.scheduledTime && (
                  <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedSession.scheduledTime}</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1.5">
                {selectedSession.name}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Distance</div>
                <div className="text-lg font-black text-cyan-400 font-mono">
                  {(selectedSession.totalDistance || 0).toLocaleString()} {poolLength === '25y' ? 'yd' : 'm'}
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Estimated Duration</div>
                <div className="text-lg font-black text-slate-200 font-mono">
                  {selectedSession.estimatedMinutes || 60} mins
                </div>
              </div>
            </div>
          </div>

          {/* Workout Blocks List (Warmup, Preset, Main Set, etc.) */}
          <div className="mt-6 space-y-6">
            {(selectedSession.blocks || []).map((block: WorkoutBlock, idx: number) => {
              const blockDist = calculateBlockDistance(block);
              const isMain = block.type === 'main';

              return (
                <div
                  key={block.id || idx}
                  className={`rounded-2xl border p-5 ${
                    isMain
                      ? 'bg-gradient-to-r from-cyan-950/30 to-slate-900 border-cyan-500/40 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  {/* Block Title & Rounds */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        block.type === 'warmup' ? 'bg-amber-400' :
                        block.type === 'preset' ? 'bg-blue-400' :
                        block.type === 'main' ? 'bg-rose-500' :
                        block.type === 'secondary' ? 'bg-purple-400' : 'bg-teal-400'
                      }`} />
                      <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                        {block.title || `${block.type.toUpperCase()} BLOCK`}
                      </h3>
                      {block.rounds > 1 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {block.rounds}x Rounds
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {blockDist.toLocaleString()}{poolLength === '25y' ? 'y' : 'm'}
                    </span>
                  </div>

                  {/* Items in Block */}
                  <div className="space-y-2.5">
                    {(block.items || []).map((item, itemIdx) => (
                      <div
                        key={item.id || itemIdx}
                        className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="font-mono text-sm font-black text-cyan-400 min-w-[70px] pt-0.5">
                            {item.reps} × {item.distance}{poolLength === '25y' ? 'y' : 'm'}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-extrabold text-white">
                                {item.stroke}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {item.intensity}
                              </span>

                              {/* Equipment Tags */}
                              {(item.equipment || []).map((eq) => (
                                <span
                                  key={eq}
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${getEquipmentBadgeColor(eq)}`}
                                >
                                  {eq}
                                </span>
                              ))}
                            </div>

                            {item.description && (
                              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                {item.description}
                              </p>
                            )}

                            {item.notes && (
                              <p className="text-[11px] text-cyan-300/90 italic">
                                Focus Cue: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Intervals / Send-off */}
                        <div className="sm:text-right shrink-0">
                          {item.sendOffMode === 'fixed-interval' && item.fixedInterval && (
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Interval</span>
                              <span className="font-mono font-extrabold text-sm text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                @ {item.fixedInterval}
                              </span>
                            </div>
                          )}

                          {item.sendOffMode === 'rest-after' && (
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Rest Interval</span>
                              <span className="font-mono font-extrabold text-sm text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                :{item.restSeconds || 15}s Rest
                              </span>
                            </div>
                          )}

                          {item.sendOffMode === 'lane-scaled' && (
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                              <span className="text-[10px] uppercase font-bold text-cyan-400">Lane Scaled</span>
                              <span className="font-mono font-extrabold text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                                {activeLane ? `L${activeLane.laneNumber} Pace` : 'Base Pace'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Workout Selected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Select any day from the schedule above to view full workout sets, intervals, and coach focus notes.
          </p>
        </div>
      )}
    </div>
  );
};
