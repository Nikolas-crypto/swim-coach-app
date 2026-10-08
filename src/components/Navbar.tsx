import React from 'react';
import { SeasonPlan } from '../types/swim';
import { SyncStatus } from '../services/seasonSync';
import { AppUser } from '../types/auth';
import { 
  Waves, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  Gauge, 
  Clipboard, 
  Settings, 
  Users,
  Target,
  Share2,
  RefreshCw,
  AlertCircle,
  Lock,
  LogOut,
  Crown,
  User as UserIcon,
  Eye,
  Bookmark
} from 'lucide-react';

export type ActiveTab = 'planner' | 'builder' | 'progression' | 'lanes' | 'whiteboard' | 'library';

interface NavbarProps {
  season: SeasonPlan;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  poolLength: '25m' | '50m' | '25y';
  onChangePoolLength: (length: '25m' | '50m' | '25y') => void;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  user: AppUser;
  onSwitchRole?: () => void;
  onLogout: () => void;
  onForceSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  season,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenShare,
  poolLength,
  onChangePoolLength,
  syncStatus,
  lastSyncedAt,
  user,
  onSwitchRole,
  onLogout,
  onForceSync,
}) => {
  const isAdmin = user.role === 'admin';

  const adminTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'planner',
      label: 'Wochenplaner',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'builder',
      label: 'Trainings-Editor',
      icon: <Dumbbell className="w-4 h-4" />,
      badge: 'Baukasten',
    },
    {
      id: 'progression',
      label: 'Saisonverlauf',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'lanes',
      label: 'Bahnen & Kader',
      icon: <Gauge className="w-4 h-4" />,
      badge: `${season?.lanes?.length || 0} Bahnen`,
    },
    {
      id: 'whiteboard',
      label: 'Beckenrand-Whiteboard',
      icon: <Clipboard className="w-4 h-4" />,
    },
    {
      id: 'library',
      label: 'Trainingsbibliothek',
      icon: <Bookmark className="w-4 h-4" />,
      badge: 'Vorlagen',
    },
  ];

  const swimmerTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'planner',
      label: `Woche ${season?.currentWeekNumber || 1} Trainingsplan`,
      icon: <Calendar className="w-4 h-4" />,
      badge: 'Aktuelle Woche',
    },
  ];

  const visibleTabs = isAdmin ? adminTabs : swimmerTabs;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 shadow-lg no-print">
      {/* Decorative Pool Lane Top Strip */}
      <div className="lane-rope-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Season Status */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
              isAdmin
                ? 'bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-500 shadow-cyan-500/30'
                : 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 shadow-emerald-500/30'
            }`}>
              <Waves className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-tight text-white">
                  SWIM <span className={isAdmin ? "text-cyan-400" : "text-emerald-400"}>COACH</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                  isAdmin
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}>
                  {isAdmin ? 'TRAINER-BEREICH' : 'ATHLETEN-PORTAL'}
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-xs flex items-center space-x-1">
                <span className="truncate">{season?.name || 'Wettkampfkader'}</span>
                {!isAdmin && (
                  <span className="text-[11px] text-emerald-400 font-medium">
                    • Woche {season?.currentWeekNumber || 1}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? isAdmin
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive 
                        ? isAdmin ? 'bg-cyan-950 text-cyan-200' : 'bg-emerald-950 text-emerald-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: User Profile, Sync Status, Course Switcher & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Real-time Cloud Sync Indicator & Force Sync */}
            <button 
              type="button"
              onClick={isAdmin && onForceSync ? onForceSync : undefined}
              disabled={syncStatus === 'saving'}
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-semibold shadow-inner transition cursor-pointer ${
                syncStatus === 'synced'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/70'
                  : syncStatus === 'saving'
                  ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                  : syncStatus === 'error'
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-300 hover:bg-rose-950/70'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
              title={
                isAdmin
                  ? syncStatus === 'synced'
                    ? `Cloud-Datenbank verbunden. Zuletzt synchronisiert: ${lastSyncedAt ? lastSyncedAt.toLocaleTimeString('de-DE') : 'soeben'}. Klicken zum manuellen Neusichern.`
                    : syncStatus === 'saving'
                    ? 'Speichere Änderungen in der Cloud...'
                    : syncStatus === 'error'
                    ? 'Offline oder Verbindungsfehler. Klicken zum erneuten Versuch.'
                    : 'Klicken zum Sichern in die Cloud'
                  : 'Echtzeit-Synchronisierung aktiv'
              }
            >
              {syncStatus === 'connected' && (
                <>
                  <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span className="text-[11px] text-cyan-400 font-bold">Verbinde...</span>
                </>
              )}
              {syncStatus === 'synced' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold">Cloud gesichert</span>
                </>
              )}
              {syncStatus === 'saving' && (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-[11px] font-bold">Speichert...</span>
                </>
              )}
              {syncStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  <span className="text-[11px] font-bold">Offline • Erneut sichern</span>
                </>
              )}
            </button>

            {/* Pool Course Switcher (Admin editable, Swimmer read-only view) */}
            {isAdmin ? (
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                {(['25m', '50m', '25y'] as const).map((len) => (
                  <button
                    key={len}
                    onClick={() => onChangePoolLength(len)}
                    className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                      poolLength === len
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={`${len === '25m' ? '25m Kurzbahn (SCM)' : len === '50m' ? '50m Langbahn (LCM)' : '25y Kurzbahn Yards (SCY)'}`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-extrabold text-cyan-300">
                {poolLength === '25m' ? '25m Kurzbahn' : poolLength === '50m' ? '50m Langbahn' : '25y Yardbahn'}
              </span>
            )}

            {/* Admin-only Share & Settings Buttons */}
            {isAdmin && (
              <>
                <button
                  onClick={onOpenShare}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-cyan-950"
                  title="App-Link teilen oder Trainingspläne exportieren"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Teilen</span>
                </button>

                <button
                  onClick={onOpenSettings}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition cursor-pointer"
                  title="Saisonziele & Trainingszeiten einrichten"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            )}

            {/* User Profile Badge & Role Indicator */}
            <div 
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${
                isAdmin 
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' 
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              }`}
              title={isAdmin ? 'Angemeldet als Trainer (Voller Zugriff)' : 'Angemeldet als Schwimmer (Nur Ansicht der aktuellen Woche)'}
            >
              {isAdmin ? (
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-emerald-300" />
              )}
              <span className="hidden sm:inline max-w-[100px] truncate">
                {user.displayName || (isAdmin ? 'Trainer' : 'Schwimmer')}
              </span>
            </div>

            {/* Quick Switch Role Toggle (for effortless testing/switching) */}
            {onSwitchRole && (
              <button
                onClick={onSwitchRole}
                className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
                title={isAdmin ? "Zur Athleten-Ansicht wechseln, um Schwimmer-Perspektive zu testen" : "Zum Trainer-Modus wechseln"}
              >
                <Eye className="w-3 h-3 text-cyan-400" />
                <span>{isAdmin ? "Athleten-Ansicht" : "Trainer-Modus"}</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
              title="Abmelden / Portal sperren"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        {isAdmin && (
          <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/80 gap-1 no-scrollbar">
            {adminTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
