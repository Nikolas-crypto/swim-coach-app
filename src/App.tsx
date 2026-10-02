import React, { useState, useEffect } from 'react';
import { 
  SeasonPlan, 
  WorkoutSession, 
  WeekCycle, 
  DrillLibraryItem, 
  LaneConfig,
  SavedWorkoutItem,
  CycleFocusType 
} from './types/swim';
import { AppUser } from './types/auth';
import { 
  INITIAL_SEASON, 
  INITIAL_DRILLS,
  SEASON_MACROCYCLE_TARGETS 
} from './data/seedData';
import { Navbar, ActiveTab } from './components/Navbar';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { WorkoutBuilder } from './components/WorkoutBuilder';
import { SeasonProgression } from './components/SeasonProgression';
import { WorkoutLibraryView } from './components/WorkoutLibraryView';
import { LaneManager } from './components/LaneManager';
import { PoolDeckWhiteboard } from './components/PoolDeckWhiteboard';
import { SeasonSettingsModal } from './components/SeasonSettingsModal';
import { ShareModal } from './components/ShareModal';
import { SquadLoginGate } from './components/SquadLoginGate';
import { SwimmerScheduleView } from './components/SwimmerScheduleView';
import { applyCycleFocusToSeason } from './data/cycleFocusPresets';
import { 
  initAuth, 
  testConnection 
} from './firebase';
import { 
  subscribeToActiveSeason, 
  persistSeasonToCloud, 
  SyncStatus 
} from './services/seasonSync';
import { 
  getStoredUser, 
  saveStoredUser, 
  logoutUser 
} from './services/authService';
import { 
  getStoredWorkouts, 
  saveWorkoutToLibrary, 
  deleteWorkoutFromLibrary, 
  subscribeToSavedWorkouts 
} from './services/workoutLibraryService';
import { normalizeSeason } from './utils/normalizeSeason';
import { Waves, Sparkles, RefreshCw, Radio, Shield, User as UserIcon } from 'lucide-react';

const STORAGE_KEY_SEASON = 'swim_coach_season_v2';
const STORAGE_KEY_DRILLS = 'swim_coach_drills_v2';

export default function App() {
  // User Authentication State (Admin vs Swimmer)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    return getStoredUser();
  });

  // Saved Workouts & Inspiration base plans library
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkoutItem[]>(() => {
    return getStoredWorkouts();
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

    // Automatically establish auth connection so any device can view and edit immediately
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

    const unsubscribeWorkouts = subscribeToSavedWorkouts((cloudWorkouts) => {
      setSavedWorkouts(cloudWorkouts);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSeason();
      unsubscribeWorkouts();
    };
  }, []);

  // Handlers for Workout Library
  const handleSaveWorkoutToLibrary = async (workout: SavedWorkoutItem) => {
    if (currentUser?.role !== 'admin') return;
    const saved = await saveWorkoutToLibrary(workout);
    setSavedWorkouts(prev => {
      const idx = prev.findIndex(w => w.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleteWorkoutFromLibrary = async (id: string) => {
    if (currentUser?.role !== 'admin') return;
    await deleteWorkoutFromLibrary(id);
    setSavedWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const handleChangeCycleFocus = (focusType: CycleFocusType, weeksCount?: number) => {
    if (currentUser?.role !== 'admin') return;
    const updatedSeason = applyCycleFocusToSeason(season, focusType, weeksCount);
    updateSeasonAndPersist(updatedSeason);
    setCloudNotification(`Cycle focus updated: ${focusType.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => setCloudNotification(null), 3500);
  };

  const handleAddSessionToWeek = (weekNumber: number, session: WorkoutSession) => {
    if (currentUser?.role !== 'admin') return;
    const week = season.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;
    const updatedSessions = [...(week.sessions || []), session];
    const newVolume = updatedSessions.reduce((sum, s) => sum + (s.totalDistance || 0), 0);
    const updatedWeek: WeekCycle = {
      ...week,
      sessions: updatedSessions,
      actualVolumeMeters: newVolume,
    };
    handleUpdateWeek(updatedWeek);
    setCurrentWeekNumber(weekNumber);
    setActiveTab('planner');
    setCloudNotification(`Session added to Week ${weekNumber} (${session.dayOfWeek})`);
    setTimeout(() => setCloudNotification(null), 3000);
  };

  // Sync drill library to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRILLS, JSON.stringify(drillLibrary));
    } catch (e) {
      console.error('Storage save error', e);
    }
  }, [drillLibrary]);

  // If user is a swimmer, enforce that they only view the current week and cannot edit
  const isSwimmer = currentUser?.role === 'swimmer';
  const effectiveCurrentWeekNumber = isSwimmer ? (season.currentWeekNumber || 1) : currentWeekNumber;

  // Central function to update season both locally and to Cloud Firestore
  // STRICT PERMISSION GATE: Only admin users can mutate season data
  const updateSeasonAndPersist = async (updatedSeason: SeasonPlan) => {
    if (currentUser?.role !== 'admin') {
      console.warn('Unauthorized write attempt: Swimmer user cannot make edits.');
      return;
    }

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
  const activeWeek = season.weeks.find(w => w.weekNumber === effectiveCurrentWeekNumber) || season.weeks[0];

  // Handlers (strictly admin guarded)
  const handleUpdateWeek = (updatedWeek: WeekCycle) => {
    if (currentUser?.role !== 'admin') return;

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
    if (currentUser?.role !== 'admin') return;

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
    if (currentUser?.role !== 'admin') return;

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
    if (currentUser?.role !== 'admin') return;
    setActiveSession(session);
    setActiveTab('builder');
  };

  const handleUpdateLanes = (updatedLanes: LaneConfig[]) => {
    if (currentUser?.role !== 'admin') return;
    const updatedSeason: SeasonPlan = {
      ...season,
      lanes: updatedLanes,
    };
    updateSeasonAndPersist(updatedSeason);
  };

  const handleAddCustomDrill = (newDrill: DrillLibraryItem) => {
    if (currentUser?.role !== 'admin') return;
    setDrillLibrary(prev => [newDrill, ...prev]);
  };

  const handleChangePoolLength = (length: '25m' | '50m' | '25y') => {
    if (currentUser?.role !== 'admin') return;
    const updatedSeason: SeasonPlan = {
      ...season,
      poolLength: length,
    };
    updateSeasonAndPersist(updatedSeason);
  };

  const handleResetToDefaults = async () => {
    if (currentUser?.role !== 'admin') return;
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

  // Role switching helper for quick previewing / testing
  const handleSwitchRole = () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      const swimmerUser: AppUser = {
        ...currentUser,
        role: 'swimmer',
        displayName: 'Sarah M. (Swimmer Mode)',
      };
      saveStoredUser(swimmerUser);
      setCurrentUser(swimmerUser);
      setActiveTab('planner');
    } else {
      // Prompt or switch back to admin
      const adminUser: AppUser = {
        ...currentUser,
        role: 'admin',
        displayName: 'Coach Nikolas',
      };
      saveStoredUser(adminUser);
      setCurrentUser(adminUser);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  // If user is not authenticated, show Squad Authentication Portal
  if (!currentUser) {
    return (
      <SquadLoginGate 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'swimmer') {
            setCurrentWeekNumber(season.currentWeekNumber || 1);
            setActiveTab('planner');
          }
        }} 
        lanes={season.lanes}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pool-tiles-deep selection:bg-cyan-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        season={season}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          // If swimmer, only allow planner tab (current week schedule)
          if (isSwimmer) {
            setActiveTab('planner');
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenSettings={() => {
          if (!isSwimmer) setIsSettingsModalOpen(true);
        }}
        onOpenShare={() => {
          if (!isSwimmer) setIsShareModalOpen(true);
        }}
        poolLength={season.poolLength}
        onChangePoolLength={handleChangePoolLength}
        syncStatus={syncStatus}
        lastSyncedAt={lastSyncedAt}
        user={currentUser}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
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
        {/* SWIMMER USER VIEW: Only sees the schedule of the current week, strictly read-only */}
        {isSwimmer ? (
          <SwimmerScheduleView
            currentWeek={activeWeek}
            lanes={season.lanes}
            poolLength={season.poolLength}
            user={currentUser}
          />
        ) : (
          /* ADMIN USER VIEW: All functionalities as exist at the moment */
          <>
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
                savedWorkouts={savedWorkouts}
                onSaveWorkoutToLibrary={handleSaveWorkoutToLibrary}
                cycleFocus={season.cycleFocus}
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
                savedWorkouts={savedWorkouts}
                onSaveWorkoutToLibrary={handleSaveWorkoutToLibrary}
                onDeleteWorkoutFromLibrary={handleDeleteWorkoutFromLibrary}
              />
            )}

            {activeTab === 'progression' && (
              <SeasonProgression
                season={season}
                onSelectWeek={(weekNum) => {
                  setCurrentWeekNumber(weekNum);
                  setActiveTab('planner');
                }}
                onChangeCycleFocus={handleChangeCycleFocus}
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

            {activeTab === 'library' && (
              <WorkoutLibraryView
                savedWorkouts={savedWorkouts}
                season={season}
                onOpenSessionInBuilder={handleOpenSessionInBuilder}
                onAddSessionToWeek={handleAddSessionToWeek}
                onDeleteWorkout={handleDeleteWorkoutFromLibrary}
                onSaveWorkout={handleSaveWorkoutToLibrary}
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
                onSaveWorkoutToLibrary={handleSaveWorkoutToLibrary}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Floating Lane Visual & Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isSwimmer ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
            <span className="font-semibold text-slate-400">Swim Coach</span>
            <span>• Squad Pace Scaling & Macrocycle Periodization Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            {!isSwimmer ? (
              <button
                onClick={handleResetToDefaults}
                className="text-slate-500 hover:text-cyan-400 transition flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            ) : (
              <span className="text-emerald-400/90 font-medium flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Swimmer Portal (Read-Only)</span>
              </span>
            )}
            <span>{season?.poolLength || '25m'} Pool</span>
            <span>{season?.lanes?.length || 0} Lanes Configured</span>
          </div>
        </div>
      </footer>

      {/* Admin Modals (Only rendered for Admin) */}
      {!isSwimmer && (
        <>
          <SeasonSettingsModal
            season={season}
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={(updated) => updateSeasonAndPersist(updated)}
          />

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
        </>
      )}
    </div>
  );
}
