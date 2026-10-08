import React, { useState, useEffect } from 'react';
import { SeasonPlan, SessionScheduleSlot, DayOfWeek } from '../types/swim';
import { X, Calendar, Target, Clock, Plus, Trash2, CheckCircle2, Dumbbell, ShieldCheck, History, RotateCcw, AlertTriangle } from 'lucide-react';
import { scaleSeasonSessionsToTarget } from '../utils/volumeScaler';
import { formatDayGerman } from '../utils/germanTranslations';
import { fetchSeasonBackups, restoreSeasonFromBackup, SeasonBackupSummary } from '../services/seasonSync';

interface SeasonSettingsModalProps {
  season: SeasonPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSeason: SeasonPlan) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SeasonSettingsModal: React.FC<SeasonSettingsModalProps> = ({
  season,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(season.name);
  const [goal, setGoal] = useState(season.goal);
  const [poolLength, setPoolLength] = useState(season.poolLength);
  const [totalWeeks, setTotalWeeks] = useState(season.totalWeeks);
  const [schedule, setSchedule] = useState<SessionScheduleSlot[]>(season.weeklySchedule);
  const [targetSessionVolume, setTargetSessionVolume] = useState<number>(
    season.targetSessionVolumeMeters || 3000
  );
  // Default to false so opening settings never accidentally mutates custom session distances
  const [shouldRescaleSessions, setShouldRescaleSessions] = useState<boolean>(false);

  // Cloud Backups state
  const [backups, setBackups] = useState<SeasonBackupSummary[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && showBackups) {
      loadBackups();
    }
  }, [isOpen, showBackups]);

  const loadBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const list = await fetchSeasonBackups(8);
      setBackups(list);
    } catch {
      // Ignored
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleRestore = async (backupItem: SeasonBackupSummary) => {
    if (!window.confirm(`Möchtest du den Saisonstand vom ${new Date(backupItem.timestamp).toLocaleString('de-DE')} wirklich wiederherstellen? Dies überschreibt den aktuellen Stand in der Cloud.`)) {
      return;
    }
    setRestoringId(backupItem.id);
    try {
      await restoreSeasonFromBackup(backupItem.seasonData);
      setBackupNotice(`Saisonstand (${new Date(backupItem.timestamp).toLocaleTimeString('de-DE')}) erfolgreich wiederhergestellt!`);
      setTimeout(() => {
        setBackupNotice(null);
        onClose();
      }, 1500);
    } catch (err) {
      alert('Fehler beim Wiederherstellen: ' + String(err));
    } finally {
      setRestoringId(null);
    }
  };

  const handleAddSlot = () => {
    const newSlot: SessionScheduleSlot = {
      id: `slot-${Date.now()}`,
      day: 'Monday',
      startTime: '06:00',
      endTime: '07:30',
      sessionTitle: 'Kader-Trainingseinheit',
      primaryFocus: 'Aerobic',
      poolLength: poolLength,
    };
    setSchedule([...schedule, newSlot]);
  };

  const handleRemoveSlot = (id: string) => {
    setSchedule(schedule.filter(s => s.id !== id));
  };

  const handleUpdateSlot = (id: string, updates: Partial<SessionScheduleSlot>) => {
    setSchedule(schedule.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleSave = () => {
    let updatedSeason: SeasonPlan = {
      ...season,
      name,
      goal,
      poolLength,
      totalWeeks,
      targetSessionVolumeMeters: targetSessionVolume,
      weeklySchedule: schedule,
    };

    if (shouldRescaleSessions) {
      updatedSeason = scaleSeasonSessionsToTarget(updatedSeason, targetSessionVolume);
    }

    onSave(updatedSeason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Saison-Konfiguration & Trainingszeiten</h2>
              <p className="text-xs text-cyan-300/80">Saisonziele, Makrozyklus-Dauer und wöchentliche Trainingszeiten konfigurieren</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm">
          {/* Season Basics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Saisonname / Wettkampfphase
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white outline-none"
                placeholder="z.B. Meisterschafts-Aufbau Wintersaison 2026"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Bahnenlänge / Wettkampfbahn
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['25m', '50m', '25y'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPoolLength(p)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      poolLength === p 
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p === '25m' ? '25m (Kurzbahn)' : p === '50m' ? '50m (Langbahn)' : '25y (Yards)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Saisonziel & Saisonhöhepunkt
              </label>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white outline-none resize-none"
                placeholder="z.B. Spitzenform des Kaders & Erreichen der Meisterschafts-Pflichtzeiten in Woche 12"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                Gesamtdauer des Aufbaus (Wochen)
              </label>
              <select
                value={totalWeeks}
                onChange={e => setTotalWeeks(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-white outline-none cursor-pointer"
              >
                {[8, 10, 12, 14, 16, 20].map(w => (
                  <option key={w} value={w}>{w} Wochen (Periodisierter Makrozyklus)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Session Volume Calibration */}
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="flex items-center space-x-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  <Dumbbell className="w-4 h-4 text-cyan-400" />
                  <span>Soll-Durchschnittsumfang pro Einheit</span>
                </label>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">
                  Kalibriere die Kadertrainings auf einen Durchschnitt von <strong className="text-white">~3.000m pro Einheit</strong>, mit natürlicher Varianz: längere Grundlageneinheiten ca. 3.200–3.500m, kürzere Sprint-/Regenerationseinheiten ca. 2.500–2.800m.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <input
                  type="number"
                  step="100"
                  min="1500"
                  max="6000"
                  value={targetSessionVolume}
                  onChange={e => setTargetSessionVolume(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-right font-mono font-bold text-white text-sm"
                />
                <span className="text-xs text-slate-400 font-bold">{poolLength.slice(-1)}</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-900">
              <span className="text-[11px] text-slate-500 font-semibold">Schnellauswahl:</span>
              {[
                { label: 'Kürzer (~2.500m)', val: 2500 },
                { label: 'Standard (~3.000m)', val: 3000 },
                { label: 'Erweitert (~3.500m)', val: 3500 },
                { label: 'Hoher Umfang (~4.200m)', val: 4200 },
              ].map(p => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setTargetSessionVolume(p.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    targetSessionVolume === p.val
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Re-scale existing sessions checkbox */}
            <label className="flex items-center space-x-2.5 pt-1 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={shouldRescaleSessions}
                onChange={e => setShouldRescaleSessions(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900"
              />
              <span>
                Bestehende Saisoneinheiten proportional auf durchschnittlich <strong className="text-cyan-300">{targetSessionVolume.toLocaleString()}{poolLength.slice(-1)}</strong> anpassen (manche länger, manche kürzer)
              </span>
            </label>
          </div>

          {/* Weekly Practice Schedule Slots */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Wöchentliche Kadertrainingszeiten</span>
                </h3>
                <p className="text-xs text-slate-400">Reguläre Wochentage und Wasserzeiten zur Generierung wöchentlicher Mikrozyklen</p>
              </div>
              <button
                type="button"
                onClick={handleAddSlot}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Trainingszeit hinzufügen</span>
              </button>
            </div>

            <div className="space-y-2">
              {schedule.map((slot) => (
                <div 
                  key={slot.id} 
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-wrap items-center gap-3"
                >
                  <div className="w-32">
                    <select
                      value={slot.day}
                      onChange={e => handleUpdateSlot(slot.id, { day: e.target.value as DayOfWeek })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white cursor-pointer"
                    >
                      {DAYS.map(d => (
                        <option key={d} value={d}>{formatDayGerman(d)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={e => handleUpdateSlot(slot.id, { startTime: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white text-xs"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={e => handleUpdateSlot(slot.id, { endTime: e.target.value })}
                      className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white text-xs"
                    />
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <input
                      type="text"
                      value={slot.sessionTitle}
                      onChange={e => handleUpdateSlot(slot.id, { sessionTitle: e.target.value })}
                      placeholder="Titel der Trainingseinheit"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white"
                    />
                  </div>

                  <div className="w-36">
                    <select
                      value={slot.primaryFocus}
                      onChange={e => handleUpdateSlot(slot.id, { primaryFocus: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-cyan-300 font-medium cursor-pointer"
                    >
                      <option value="Aerobic">Grundlagenausdauer (GA1)</option>
                      <option value="Threshold">Schwellenbereich (CSS)</option>
                      <option value="Speed">Schnelligkeit & Sprint</option>
                      <option value="Technique">Lagentechnik</option>
                      <option value="Recovery">Regeneration</option>
                      <option value="Test Set">Leistungstest</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Backups & Version History */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Automatische Cloud-Sicherungen (Backups)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Jeder gespeicherte Saison- und Bahnenstand wird zusätzlich als Snapshot versioniert gesichert.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBackups(!showBackups);
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer border border-slate-700"
              >
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showBackups ? 'Ausblenden' : 'Sicherungen anzeigen'}</span>
              </button>
            </div>

            {backupNotice && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 rounded-xl text-xs flex items-center space-x-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{backupNotice}</span>
              </div>
            )}

            {showBackups && (
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2">
                {isLoadingBackups ? (
                  <div className="p-4 text-center text-xs text-slate-400">Lade Cloud-Sicherungen...</div>
                ) : backups.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Bisher wurden keine historischen Snapshots archiviert. Neue Sicherungen werden bei jeder Änderung automatisch erstellt.
                  </div>
                ) : (
                  backups.map((b) => (
                    <div 
                      key={b.id} 
                      className="flex items-center justify-between p-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 rounded-lg text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white flex items-center space-x-2">
                          <span>{new Date(b.timestamp).toLocaleString('de-DE')}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                            {b.lanesCount} Bahnen • {b.totalWeeks} Wo.
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {b.name} • Gespeichert von {b.updatedBy}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRestore(b)}
                        disabled={restoringId === b.id}
                        className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{restoringId === b.id ? 'Stelle wieder her...' : 'Wiederherstellen'}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Saisoneinstellungen speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
};
