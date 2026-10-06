import React, { useState } from 'react';
import { 
  Waves, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  User as UserIcon, 
  Crown, 
  Sparkles, 
  Calendar,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { AppUser, UserRole } from '../types/auth';
import { LaneConfig } from '../types/swim';
import { 
  loginAsAdmin, 
  loginAsSwimmer, 
  signInWithGoogle, 
  quickDemoLogin 
} from '../services/authService';

interface SquadLoginGateProps {
  onLoginSuccess: (user: AppUser) => void;
  lanes?: LaneConfig[];
}

export const SquadLoginGate: React.FC<SquadLoginGateProps> = ({ 
  onLoginSuccess,
  lanes = [] 
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'swimmer'>('admin');
  
  // Admin form state
  const [adminPasscode, setAdminPasscode] = useState('');
  const [coachName, setCoachName] = useState('Trainer Nikolas');
  
  // Swimmer form state
  const [swimmerName, setSwimmerName] = useState('Sarah M.');
  const [assignedLane, setAssignedLane] = useState<number>(1);

  // Common UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gather existing swimmers from squad lanes for convenient quick-pick
  const rosterSwimmers: { name: string; lane: number }[] = [];
  lanes.forEach(lane => {
    (lane.swimmers || []).forEach(s => {
      rosterSwimmers.push({ name: s, lane: lane.laneNumber });
    });
  });

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const user = await loginAsAdmin(adminPasscode, coachName);
      onLoginSuccess(user);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj?.message || 'Ungültiges Trainer-Passwort.');
      setIsSubmitting(false);
    }
  };

  const handleSwimmerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const user = await loginAsSwimmer(swimmerName, assignedLane);
      onLoginSuccess(user);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj?.message || 'Fehler beim Öffnen des Athleten-Portals.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (role: UserRole) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const user = await signInWithGoogle(role);
      onLoginSuccess(user);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMsg(errObj?.message || 'Anmeldung mit Google konnte nicht abgeschlossen werden.');
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    setErrorMsg(null);
    const user = quickDemoLogin(
      role, 
      role === 'admin' ? 'Trainer Nikolas' : (swimmerName || 'Sarah M.')
    );
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden pool-tiles-deep selection:bg-cyan-500 selection:text-white">
      {/* Background ambient water glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-500 text-white mb-3 shadow-lg shadow-cyan-900/40">
            <Waves className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
            <span>Swim Coach</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest font-extrabold">
              Kader
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Saison-Periodisierung, Mehrbahnen-Pacing & Beckenrand-Whiteboard
          </p>
        </div>

        {/* User Group Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>Trainer / Coach</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('swimmer');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'swimmer'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4 text-emerald-300" />
            <span>Schwimmer / Athlet</span>
          </button>
        </div>

        {/* Role Permissions Summary Box */}
        {activeTab === 'admin' ? (
          <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3">
            <Crown className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white">Trainer-Berechtigung:</span> Voller Zugriff auf Wochenplaner, Trainings-Editor, Saisonverlauf, Bahnen & Kader, Beckenrand-Whiteboard und Saisoneinstellungen.
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 mb-6 flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-white">Athleten-Berechtigung:</span> Nur-Lese-Ansicht des aktuellen Trainingsplans der Woche, Einheiten, Serien, Abgangszeiten und individueller Bahnenzeiten. Bearbeitung ist deaktiviert.
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center space-x-2 text-rose-400 text-xs bg-rose-950/40 border border-rose-900/60 p-3 rounded-xl mb-4 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ADMIN LOGIN FORM */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Trainer-Anzeigename
              </label>
              <input
                type="text"
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Trainer Nikolas"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Admin-Passwort
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => {
                    setAdminPasscode(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Trainer-Passwort eingeben..."
                  autoFocus
                  autoComplete="current-password"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting || !adminPasscode.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-950/40 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Prüfe Passwort...' : 'Als Trainer anmelden'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sofort-Zugang (Trainer-Demo)</span>
              </button>
            </div>
          </form>
        )}

        {/* SWIMMER LOGIN FORM */}
        {activeTab === 'swimmer' && (
          <form onSubmit={handleSwimmerSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Name des Schwimmers
              </label>
              <input
                type="text"
                value={swimmerName}
                onChange={(e) => setSwimmerName(e.target.value)}
                placeholder="z.B. Sarah M., Jonas K., Marcus T."
                autoFocus
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            {/* Quick Roster Selection if available */}
            {rosterSwimmers.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">
                  Oder aus dem Kader wählen:
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {rosterSwimmers.map(({ name, lane }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => {
                        setSwimmerName(name);
                        setAssignedLane(lane);
                      }}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition border ${
                        swimmerName === name
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {name} (Bahn {lane})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Zugewiesene Bahn (für CSS-Pacing)
              </label>
              <select
                value={assignedLane}
                onChange={(e) => setAssignedLane(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {lanes.map((lane) => (
                  <option key={lane.id} value={lane.laneNumber}>
                    Bahn {lane.laneNumber}: {lane.name} ({Math.floor(lane.basePace100mSeconds / 60)}:{String(lane.basePace100mSeconds % 60).padStart(2, '0')} Basis)
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting || !swimmerName.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-950/40 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Öffne Portal...' : 'Trainingsplan der Woche ansehen'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('swimmer')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-700/60"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sofort-Zugang (Schwimmer-Demo)</span>
              </button>
            </div>
          </form>
        )}

        {/* Divider for Google Sign-in */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
            Oder mit Google anmelden
          </span>
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={() => handleGoogleSignIn(activeTab)}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition flex items-center justify-center space-x-2.5 shadow-sm cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Mit Google fortfahren ({activeTab === 'admin' ? 'Trainer' : 'Schwimmer'})</span>
        </button>

        {/* Footer info */}
        <div className="mt-6 text-center pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Rollenbasierte Kadersicherheit • Firebase Cloud Synchronisation</span>
        </div>
      </div>
    </div>
  );
};
