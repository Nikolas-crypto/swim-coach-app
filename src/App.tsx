import React, { useState, useEffect, useRef } from 'react';
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
import { ShareModal } from './components/ShareModal';
import { SquadLoginGate } from './components/SquadLoginGate';
import { 
  initAuth, 
  testConnection 
} from './firebase';
import { 
  subscribeToActiveSeason, 
  persistSeasonToCloud, 
  SyncStatus 
} from './services/seasonSync';
import { normalizeSeason } from './utils/normalizeSeason';
import { Waves, Sparkles, RefreshCw, CloudCheck, Radio } from 'lucide-react';

const STORAGE_KEY_SEASON = 'swim_coach_season_v2';
const STORAGE_KEY_DRILLS = 'swim_coach_drills_v2';
const STORAGE_KEY_AUTH = 'swim_coach_auth_v1';

export default function App() {
  // Passcode gate state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTH) === 'cambosquad_granted';
    } catch {
      return false;
    }
  });

  // Load initial state from localStorage or seed
  const [season, setSeason] = useState<SeasonPlan>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEASON);
      if (saved) return normalizeSeason(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load season from localStorage', e);
    }
    return normalizeSeason(INITIAL_SEASON);
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
    return season.weeks?.[0]?.sessions?.[0] || INITIAL_SEASON.weeks[0].sessions[0];
  });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Cloud sync states
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connected');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [cloudNotification, setCloudNotification] = useState<string | null>(null);

  // Initialize Firebase Auth & Real-Time Sync
  useEffect(() => {
    testConnection();

    // Automatically establish anonymous auth so any device can view and edit immediately
    const unsubscribeAuth = initAuth(() => {});

    const unsubscribeSeason = subscribeToActiveSeason(
      (cloudSeason, isRemoteUpdate) => {
        if (isRemoteUpdate) {
          // Received update from cloud from another user/device
          setSeason(cloudSeason);
          try {
            localStorage.setItem(STORAGE_KEY_SEASON, JSON.stringify(cloudSeason));
          } catch (e) {
            console.error('Storage cache error', e);
          }

          // Keep activeSession fresh if it exists in updated season
          setActiveSession(prev => {
            for (const week of cloudSeason.weeks) {
              const matched = week.sessions.find(s => s.id === prev.id);
              if (matched) return matched;
            }
            return cloudSeason.weeks[0]?.sessions[0] || prev;
          });

          // Show subtle notification of remote sync
          setCloudNotification('Squad updates synchronized from cloud');
          setTimeout(() => setCloudNotification(null), 3500);
        } else {
          // Local write acknowledging or initial server state
          try {
            localStorage.setItem(STORAGE_KEY_SEASON, JSON.stringify(cloudSeason));
          } catch (e) {
            // cache update
          }
        }
      },
      (status, lastSaved) => {
        setSyncStatus(status);
        if (lastSaved) setLastSyncedAt(lastSaved);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeSeason();
    };
  }, []);

  // Sync drill library to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRILLS, JSON.stringify(drillLibrary));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }, [drillLibrary]);

  // Central function to update season both locally and to Cloud Firestore
  const updateSeasonAndPersist = async (updatedSeason: SeasonPlan) => {
    setSeason(updatedSeason);
    try {
      localStorage.setItem(STORAGE_KEY_SEASON, JSON.stringify(updatedSeason));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }

    try {
      await persistSeasonToCloud(updatedSeason, (status, savedTime) => {
        setSyncStatus(status);
        if (savedTime) setLastSyncedAt(savedTime);
      });
    } catch (err) {
      console.error('Could not save to cloud:', err);
    }
  };

  // Current active week
  const activeWeek = season.weeks.find(w => w.weekNumber === currentWeekNumber) || season.weeks[0];

  // Handlers
  const handleUpdateWeek = (updatedWeek: WeekCycle) => {
    const weekExists = season.weeks.some(w => w.weekNumber === updatedWeek.weekNumber);
    const updatedWeeks = weekExists
      ? season.weeks.map(w => w.weekNumber === updatedWeek.weekNumber ? updatedWeek : w)
      : [...season.weeks, updatedWeek].sort((a, b) => a.weekNumber - b.weekNumber);

    const updatedSeason: SeasonPlan = {
      ...season,
      weeks: updatedWeeks,
    };
    updateSeasonAndPersist(updatedSeason);
  };

  const handleAddNextWeek = (newWeek: WeekCycle) => {
    const existingIdx = season.weeks.findIndex(w => w.weekNumber === newWeek.weekNumber);
    let updatedWeeks: WeekCycle[];
    if (existingIdx >= 0) {
      updatedWeeks = [...season.weeks];
      updatedWeeks[existingIdx] = newWeek;
    } else {
      updatedWeeks = [...season.weeks, newWeek].sort((a, b) => a.weekNumber - b.weekNumber);
    }

    const updatedSeason: SeasonPlan = {
      ...season,
      weeks: updatedWeeks,
      currentWeekNumber: newWeek.weekNumber,
    };
    updateSeasonAndPersist(updatedSeason);

    setCurrentWeekNumber(newWeek.weekNumber);
    if ((newWeek?.sessions?.length || 0) > 0) {
      setActiveSession(newWeek.sessions[0]);
    }
  };

  const handleSaveSessionFromBuilder = (updatedSession: WorkoutSession) => {
    const targetWeek = season.weeks.find(w => w.weekNumber === updatedSession.weekNumber);
    let updatedWeeks: WeekCycle[];

    if (!targetWeek) {
      const targetMacro = SEASON_MACROCYCLE_TARGETS.find(m => m.weekNumber === updatedSession.weekNumber);
      const newWeek: WeekCycle = {
        weekNumber: updatedSession.weekNumber,
        theme: targetMacro?.theme || `Week ${updatedSession.weekNumber}`,
        phase: targetMacro?.phase || 'Build Phase',
        targetVolumeMeters: targetMacro?.targetVolumeMeters || 22000,
        actualVolumeMeters: updatedSession.totalDistance || 0,
        sessions: [updatedSession],
        isConfirmed: false,
      };
      updatedWeeks = [...season.weeks, newWeek].sort((a, b) => a.weekNumber - b.weekNumber);
    } else {
      const exists = targetWeek.sessions.some(s => s.id === updatedSession.id);
      const updatedSessions = exists
        ? targetWeek.sessions.map(s => s.id === updatedSession.id ? updatedSession : s)
        : [...targetWeek.sessions, updatedSession];

      const newTotalVolume = updatedSessions.reduce((sum, s) => sum + (s.totalDistance || 0), 0);

      const updatedWeek: WeekCycle = {
        ...targetWeek,
        sessions: updatedSessions,
        actualVolumeMeters: newTotalVolume,
      };

      updatedWeeks = season.weeks.map(w => 
        w.weekNumber === updatedWeek.weekNumber ? updatedWeek : w
      );
    }

    const updatedSeason: SeasonPlan = {
      ...season,
      weeks: updatedWeeks,
    };

    updateSeasonAndPersist(updatedSeason);
    setActiveSession(updatedSession);
  };

  const handleOpenSessionInBuilder = (session: WorkoutSession) => {
    setActiveSession(session);
    setActiveTab('builder');
  };

  const handleUpdateLanes = (updatedLanes: LaneConfig[]) => {
    const updatedSeason: SeasonPlan = {
      ...season,
      lanes: updatedLanes,
    };
    updateSeasonAndPersist(updatedSeason);
  };

  const handleAddCustomDrill = (newDrill: DrillLibraryItem) => {
    setDrillLibrary(prev => [newDrill, ...prev]);
  };

  const handleChangePoolLength = (length: '25m' | '50m' | '25y') => {
    const updatedSeason: SeasonPlan = {
      ...season,
      poolLength: length,
    };
    updateSeasonAndPersist(updatedSeason);
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('Reset squad data to initial championship template across all devices?')) {
      const resetPlan = {
        ...INITIAL_SEASON,
        id: 'active_season',
      };
      await updateSeasonAndPersist(resetPlan);
      setDrillLibrary(INITIAL_DRILLS);
      setCurrentWeekNumber(1);
      setActiveSession(INITIAL_SEASON.weeks[0].sessions[0]);
    }
  };

  const handleUnlock = () => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'cambosquad_granted');
    } catch (e) {
      console.error('Storage error', e);
    }
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (e) {
      console.error('Storage error', e);
    }
    setIsAuthenticated(false);
  };

  // If passcode not entered, show passcode gate screen
  if (!isAuthenticated) {
    return <SquadLoginGate onUnlock={handleUnlock} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pool-tiles-deep selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        season={season}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        poolLength={season.poolLength}
        onChangePoolLength={handleChangePoolLength}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        onLockApp={handleLock}
      />

      {/* Real-time Cloud Update Toast Indicator */}
      {cloudNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-cyan-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>{cloudNotification}</span>
        </div>
      )}

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
            onBackToPlanner={() => setActiveTab('planner')}
          />
        )}

        {activeTab === 'progression' && (
          <SeasonProgression
            season={season}
            onSelectWeek={(weekNum) => {
              setCurrentWeekNumber(weekNum);
              setActiveTab('planner');
            }}
            onUpdateWeekVolumeTarget={(weekNum, newTarget) => {
              const weekExists = season.weeks.some(w => w.weekNumber === weekNum);
              let updatedWeeks: WeekCycle[];
              if (weekExists) {
                updatedWeeks = season.weeks.map(w =>
                  w.weekNumber === weekNum ? { ...w, targetVolumeMeters: newTarget } : w
                );
              } else {
                const targetMacro = SEASON_MACROCYCLE_TARGETS.find(m => m.weekNumber === weekNum);
                const newWeekCycle: WeekCycle = {
                  weekNumber: weekNum,
                  theme: targetMacro?.theme || `Week ${weekNum}`,
                  phase: targetMacro?.phase || 'Build Phase',
                  targetVolumeMeters: newTarget,
                  actualVolumeMeters: 0,
                  sessions: [],
                  isConfirmed: false,
                };
                updatedWeeks = [...season.weeks, newWeekCycle].sort((a, b) => a.weekNumber - b.weekNumber);
              }
              updateSeasonAndPersist({
                ...season,
                weeks: updatedWeeks,
              });
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
            <span>{season?.poolLength || '25m'} Pool</span>
            <span>{season?.lanes?.length || 0} Lanes Configured</span>
          </div>
        </div>
      </footer>

      {/* Season Settings Modal */}
      <SeasonSettingsModal
        season={season}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={(updated) => updateSeasonAndPersist(updated)}
      />

      {/* Share & Web Access Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        season={season}
        onImportSeason={(imported) => {
          updateSeasonAndPersist(imported);
          if (imported.weeks?.[0]?.sessions?.[0]) {
            setActiveSession(imported.weeks[0].sessions[0]);
          }
        }}
      />
    </div>
  );
}
