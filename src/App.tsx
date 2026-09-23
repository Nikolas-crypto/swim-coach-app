import React, { useState, useEffect } from 'react';
import { 
  SeasonPlan, 
  WorkoutSession, 
  WeekCycle, 
  DrillLibraryItem, 
  LaneConfig 
} from './types/swim';
import { 
  INITIAL_SEASON, 
  INITIAL_DRILLS,
  SEASON_MACROCYCLE_TARGETS 
} from './data/seedData';
import { Navbar, ActiveTab } from './components/Navbar';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { WorkoutBuilder } from './components/WorkoutBuilder';
import { SeasonProgression } from './components/SeasonProgression';
import { LaneManager } from './components/LaneManager';
import { PoolDeckWhiteboard } from './components/PoolDeckWhiteboard';
import { SeasonSettingsModal } from './components/SeasonSettingsModal';
import { Waves, Sparkles, RefreshCw } from 'lucide-react';

const STORAGE_KEY_SEASON = 'swim_coach_season_v2';
const STORAGE_KEY_DRILLS = 'swim_coach_drills_v2';

export default function App() {
  // Load state from localStorage or seed
  const [season, setSeason] = useState<SeasonPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEASON);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load season from localStorage', e);
    }
    return INITIAL_SEASON;
  });

  const [drillLibrary, setDrillLibrary] = useState<DrillLibraryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRILLS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load drills from localStorage', e);
    }
    return INITIAL_DRILLS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('planner');
  const [currentWeekNumber, setCurrentWeekNumber] = useState<number>(season.currentWeekNumber || 1);
  const [activeSession, setActiveSession] = useState<WorkoutSession>(() => {
    return season.weeks[0]?.sessions[0] || INITIAL_SEASON.weeks[0].sessions[0];
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEASON, JSON.stringify(season));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }, [season]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRILLS, JSON.stringify(drillLibrary));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }, [drillLibrary]);

  // Current active week
  const activeWeek = season.weeks.find(w => w.weekNumber === currentWeekNumber) || season.weeks[0];

  // Handlers
  const handleUpdateWeek = (updatedWeek: WeekCycle) => {
    const updatedWeeks = season.weeks.map(w => 
      w.weekNumber === updatedWeek.weekNumber ? updatedWeek : w
    );
    setSeason({
      ...season,
      weeks: updatedWeeks,
    });
  };

  const handleAddNextWeek = (newWeek: WeekCycle) => {
    // If week already exists, replace it, otherwise append and sort
    const existingIdx = season.weeks.findIndex(w => w.weekNumber === newWeek.weekNumber);
    let updatedWeeks: WeekCycle[];
    if (existingIdx >= 0) {
      updatedWeeks = [...season.weeks];
      updatedWeeks[existingIdx] = newWeek;
    } else {
      updatedWeeks = [...season.weeks, newWeek].sort((a, b) => a.weekNumber - b.weekNumber);
    }

    setSeason({
      ...season,
      weeks: updatedWeeks,
      currentWeekNumber: newWeek.weekNumber,
    });
    setCurrentWeekNumber(newWeek.weekNumber);
    if (newWeek.sessions.length > 0) {
      setActiveSession(newWeek.sessions[0]);
    }
  };

  const handleSaveSessionFromBuilder = (updatedSession: WorkoutSession) => {
    // Save into the corresponding week
    const targetWeek = season.weeks.find(w => w.weekNumber === updatedSession.weekNumber);
    if (!targetWeek) return;

    const updatedSessions = targetWeek.sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    );
    const newTotalVolume = updatedSessions.reduce((sum, s) => sum + s.totalDistance, 0);

    const updatedWeek: WeekCycle = {
      ...targetWeek,
      sessions: updatedSessions,
      actualVolumeMeters: newTotalVolume,
    };

    handleUpdateWeek(updatedWeek);
    setActiveSession(updatedSession);
  };

  const handleOpenSessionInBuilder = (session: WorkoutSession) => {
    setActiveSession(session);
    setActiveTab('builder');
  };

  const handleUpdateLanes = (updatedLanes: LaneConfig[]) => {
    setSeason({
      ...season,
      lanes: updatedLanes,
    });
  };

  const handleAddCustomDrill = (newDrill: DrillLibraryItem) => {
    setDrillLibrary(prev => [newDrill, ...prev]);
  };

  const handleChangePoolLength = (length: '25m' | '50m' | '25y') => {
    setSeason(prev => ({
      ...prev,
      poolLength: length,
    }));
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset squad data to initial championship template?')) {
      setSeason(INITIAL_SEASON);
      setDrillLibrary(INITIAL_DRILLS);
      setCurrentWeekNumber(1);
      setActiveSession(INITIAL_SEASON.weeks[0].sessions[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pool-tiles-deep selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        season={season}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        poolLength={season.poolLength}
        onChangePoolLength={handleChangePoolLength}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'planner' && (
          <WeeklyPlanner
            weeks={season.weeks}
            currentWeekNumber={currentWeekNumber}
            lanes={season.lanes}
            scheduleSlots={season.weeklySchedule}
            poolLength={season.poolLength}
            onSelectWeek={setCurrentWeekNumber}
            onUpdateWeek={handleUpdateWeek}
            onAddNextWeek={handleAddNextWeek}
            onOpenSessionInBuilder={handleOpenSessionInBuilder}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}

        {activeTab === 'builder' && (
          <WorkoutBuilder
            session={activeSession}
            lanes={season.lanes}
            drillLibrary={drillLibrary}
            onSaveSession={handleSaveSessionFromBuilder}
            onAddCustomDrill={handleAddCustomDrill}
            poolLength={season.poolLength}
          />
        )}

        {activeTab === 'progression' && (
          <SeasonProgression
            season={season}
            onSelectWeek={(weekNum) => {
              setCurrentWeekNumber(weekNum);
              setActiveTab('planner');
            }}
          />
        )}

        {activeTab === 'lanes' && (
          <LaneManager
            lanes={season.lanes}
            onUpdateLanes={handleUpdateLanes}
            poolLength={season.poolLength}
          />
        )}

        {activeTab === 'whiteboard' && (
          <PoolDeckWhiteboard
            sessions={activeWeek?.sessions || []}
            selectedSessionId={activeSession.id}
            onSelectSession={(id) => {
              const s = activeWeek?.sessions.find(x => x.id === id);
              if (s) setActiveSession(s);
            }}
            lanes={season.lanes}
            poolLength={season.poolLength}
          />
        )}
      </main>

      {/* Bottom Floating Lane Visual & Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-semibold text-slate-400">Swim Coach</span>
            <span>• Squad Pace Scaling & Macrocycle Periodization Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleResetToDefaults}
              className="text-slate-500 hover:text-cyan-400 transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
            <span>{season.poolLength} Pool</span>
            <span>{season.lanes.length} Lanes Configured</span>
          </div>
        </div>
      </footer>

      {/* Season Settings Modal */}
      <SeasonSettingsModal
        season={season}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={(updated) => setSeason(updated)}
      />
    </div>
  );
}
