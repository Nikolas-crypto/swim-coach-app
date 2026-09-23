import React from 'react';
import { SeasonPlan } from '../types/swim';
import { 
  Waves, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  Gauge, 
  Clipboard, 
  Settings, 
  Users,
  Target
} from 'lucide-react';

export type ActiveTab = 'planner' | 'builder' | 'progression' | 'lanes' | 'whiteboard';

interface NavbarProps {
  season: SeasonPlan;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  poolLength: '25m' | '50m' | '25y';
  onChangePoolLength: (length: '25m' | '50m' | '25y') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  season,
  activeTab,
  onSelectTab,
  onOpenSettings,
  poolLength,
  onChangePoolLength,
}) => {
  const totalSwimmers = season.lanes.reduce((sum, l) => sum + l.swimmers.length, 0);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'planner',
      label: 'Weekly Planner',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'builder',
      label: 'Workout Builder',
      icon: <Dumbbell className="w-4 h-4" />,
      badge: 'Drag & Drop',
    },
    {
      id: 'progression',
      label: 'Season Progression',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'lanes',
      label: 'Lane Rosters & Paces',
      icon: <Gauge className="w-4 h-4" />,
      badge: `${season.lanes.length} Lanes`,
    },
    {
      id: 'whiteboard',
      label: 'Poolside Whiteboard',
      icon: <Clipboard className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 shadow-lg no-print">
      {/* Decorative Pool Lane Top Strip */}
      <div className="lane-rope-divider" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Season Status */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Waves className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-tight text-white">
                  SWIM <span className="text-cyan-400">COACH</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  SQUAD PRO
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs flex items-center space-x-1">
                <span className="truncate">{season.name}</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      isActive ? 'bg-cyan-950 text-cyan-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Pool Length Toggle & Settings */}
          <div className="flex items-center space-x-3">
            {/* Pool Course Switcher */}
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
                  title={`${len === '25m' ? 'Short Course Meters' : len === '50m' ? 'Long Course Meters' : 'Short Course Yards'}`}
                >
                  {len}
                </button>
              ))}
            </div>

            {/* Season Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition cursor-pointer"
              title="Season Goals & Training Schedule Setup"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/80 gap-1 no-scrollbar">
          {tabs.map((tab) => {
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
      </div>
    </header>
  );
};
