import React, { useState } from 'react';
import { WorkoutSession, SavedWorkoutItem } from '../types/swim';
import { calculateSessionDistance, calculateSessionEstimatedMinutes } from '../utils/swimCalculators';
import { 
  Bookmark, 
  X, 
  CheckCircle2, 
  Clock, 
  Award, 
  Tag, 
  FileText, 
  Sparkles 
} from 'lucide-react';
import { formatDayGerman } from '../utils/germanTranslations';

interface SaveWorkoutModalProps {
  session: WorkoutSession;
  isOpen: boolean;
  onClose: () => void;
  onSave: (workout: SavedWorkoutItem) => void;
}

export const SaveWorkoutModal: React.FC<SaveWorkoutModalProps> = ({
  session,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(session.name || 'Absolviertes Training');
  const [category, setCategory] = useState<SavedWorkoutItem['category']>('Threshold');
  const [isCompleted, setIsCompleted] = useState(true);
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('Kadertraining, Hohe Intensität');

  if (!isOpen) return null;

  const totalDist = calculateSessionDistance(session);
  const estMins = calculateSessionEstimatedMinutes(session);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const savedWorkout: SavedWorkoutItem = {
      id: `saved-${Date.now()}`,
      name: name.trim() || 'Gespeichertes Training',
      category,
      focus: session.focus,
      totalDistance: totalDist,
      estimatedMinutes: estMins,
      blocks: JSON.parse(JSON.stringify(session.blocks || [])),
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      isCompleted,
      notes: notes.trim(),
      tags: tags.length > 0 ? tags : [session.focus, `${totalDist}m`],
      source: isCompleted ? 'completed_session' : 'custom_template'
    };

    onSave(savedWorkout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 shadow-inner">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Training in Bibliothek speichern</h2>
            <p className="text-xs text-slate-400">Speichere diese absolvierte Einheit oder Vorlage für künftige Kader-Mikrozyklen</p>
          </div>
        </div>

        {/* Distance & Blocks Summary */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400">Einheit: </span>
            <span className="font-bold text-white">{formatDayGerman(session.dayOfWeek)} (Woche {session.weekNumber})</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="font-mono font-extrabold text-cyan-400">{totalDist.toLocaleString()}m</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-semibold">{estMins} Min</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-semibold">{session.blocks?.length || 0} Serien</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Titel des Trainings in der Bibliothek
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Kategorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SavedWorkoutItem['category'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Threshold">Schwellenbereich (CSS / ANS)</option>
                <option value="Endurance">Grundlagenausdauer (GA1)</option>
                <option value="Speed">Schnelligkeit & Sprint</option>
                <option value="IM / Medley">Lagen</option>
                <option value="Technique">Technik & Rumpf</option>
                <option value="Recovery">Regeneration & Kompensation</option>
                <option value="Test Set">CSS-Leistungstest</option>
                <option value="Coach Inspiration">Trainer-Inspiration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-500/30"
                />
                <span className="text-xs font-bold text-emerald-400">Als absolviert markieren</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Trainerhinweise & Serien-Feedback
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="z.B. Alle Schwimmer hielten die CSS auf unter 1s Abweichung. Starke Tauchphasen nach Brustwenden..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Schlagwörter / Tags (kommagetrennt)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="z.B. Flossen, Pullbuoy, 100er, Meisterschaft"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-cyan-950/40 transition flex items-center space-x-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>In Trainingsbibliothek speichern</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
