import React, { useState } from 'react';
import { Waves, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SquadLoginGateProps {
  onUnlock: () => void;
}

const CORRECT_PASSWORD = 'cambosquad';

export const SquadLoginGate: React.FC<SquadLoginGateProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    const cleanInput = password.trim().toLowerCase();

    setTimeout(() => {
      if (cleanInput === CORRECT_PASSWORD) {
        onUnlock();
      } else {
        setError(true);
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden pool-tiles-deep selection:bg-cyan-500 selection:text-white">
      {/* Background ambient water glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 shadow-lg shadow-cyan-950/50">
            <Waves className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center space-x-2">
            <span>Swim Coach</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest font-bold">
              Squad
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Championship Season Planner & Live Whiteboard
          </p>
        </div>

        {/* Access Protection Notice */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-6 flex items-start space-x-3">
          <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Squad Protected Portal:</span> Enter the squad passcode to access and edit workout plans, lane pacing, and macrocycle progressions.
          </div>
        </div>

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Squad Passcode
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter squad passcode..."
                autoFocus
                autoComplete="current-password"
                className={`w-full bg-slate-950/80 border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition pr-11 ${
                  error
                    ? 'border-rose-500/80 focus:ring-rose-500/40 text-rose-200'
                    : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-rose-400 text-xs bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Incorrect passcode. Please check with your coach.</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-900/30 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            <span>{isSubmitting ? 'Verifying...' : 'Unlock Squad Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Real-time Cloud Sync & Multi-Device Access</span>
        </div>
      </div>
    </div>
  );
};
