import React, { useState } from 'react';
import { SavedWorkoutItem, WorkoutBlock, WorkoutItem, StrokeType, IntensityZone } from '../types/swim';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Download, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { calculateBlockDistance } from '../utils/swimCalculators';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportWorkouts: (workouts: SavedWorkoutItem[]) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportWorkouts,
}) => {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedWorkouts, setParsedWorkouts] = useState<SavedWorkoutItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  // Helper to parse a line describing swim items like "6x100m Freestyle @ 1:30" or "400m Choice loosen"
  const parseSwimItemText = (text: string, defaultBlockType: 'warmup' | 'preset' | 'main' | 'cooldown' = 'main'): WorkoutItem => {
    const trimmed = text.trim();
    let reps = 1;
    let distance = 100;
    let stroke: StrokeType = 'Choice';
    let intensity: IntensityZone = defaultBlockType === 'warmup' || defaultBlockType === 'cooldown' ? 'Recovery' : 'Aerobic (EN1)';
    let description = trimmed;

    // Detect Reps x Dist e.g. "6x100" or "8 x 50m"
    const repDistMatch = trimmed.match(/^(\d+)\s*[xX*]\s*(\d+)(?:m|y)?/i);
    if (repDistMatch) {
      reps = parseInt(repDistMatch[1], 10);
      distance = parseInt(repDistMatch[2], 10);
    } else {
      const singleDistMatch = trimmed.match(/^(\d+)(?:m|y)?/i);
      if (singleDistMatch) {
        distance = parseInt(singleDistMatch[1], 10);
      }
    }

    // Detect stroke
    const lower = trimmed.toLowerCase();
    if (lower.includes('free') || lower.includes('kraul')) stroke = 'Freestyle';
    else if (lower.includes('back') || lower.includes('rücken')) stroke = 'Backstroke';
    else if (lower.includes('breast') || lower.includes('brust')) stroke = 'Breaststroke';
    else if (lower.includes('fly') || lower.includes('delphin') || lower.includes('butt')) stroke = 'Butterfly';
    else if (lower.includes('im') || lower.includes('lagen') || lower.includes('medley')) stroke = 'IM';
    else if (lower.includes('kick') || lower.includes('beine')) stroke = 'Kick';
    else if (lower.includes('pull') || lower.includes('arm')) stroke = 'Pull';
    else if (lower.includes('drill') || lower.includes('technik')) stroke = 'Drill';

    // Detect intensity
    if (lower.includes('sprint') || lower.includes('max') || lower.includes('sp')) intensity = 'Sprint (SP)';
    else if (lower.includes('vo2') || lower.includes('en3')) intensity = 'VO2Max (EN3)';
    else if (lower.includes('threshold') || lower.includes('css') || lower.includes('en2') || lower.includes('ga2')) intensity = 'Threshold (EN2)';
    else if (lower.includes('recovery') || lower.includes('locker') || lower.includes('easy')) intensity = 'Recovery';

    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reps,
      distance,
      stroke,
      intensity,
      description,
      equipment: lower.includes('fin') || lower.includes('flossen') ? ['Fins'] : lower.includes('paddl') ? ['Paddles', 'Pull Buoy'] : lower.includes('brett') || lower.includes('board') ? ['Kickboard'] : [],
      sendOffMode: 'lane-scaled',
    };
  };

  // Robust CSV Parser that handles quoted newlines, commas, and varied schemas
  const handleParseCsv = (raw: string) => {
    setErrorMsg(null);
    if (!raw.trim()) {
      setErrorMsg('Please paste or upload CSV data first.');
      return;
    }

    try {
      // Split into CSV records respecting quotes
      const lines: string[] = [];
      let currentLine = '';
      let insideQuotes = false;

      for (let i = 0; i < raw.length; i++) {
        const char = raw[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
          currentLine += char;
        } else if ((char === '\n' || char === '\r') && !insideQuotes) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = '';
        } else {
          currentLine += char;
        }
      }
      if (currentLine.trim()) lines.push(currentLine.trim());

      if (lines.length < 1) {
        setErrorMsg('No valid rows found in CSV.');
        return;
      }

      // Helper to parse line cells
      const parseCells = (line: string): string[] => {
        const cells: string[] = [];
        let curr = '';
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
          const c = line[i];
          if (c === '"') inQ = !inQ;
          else if (c === ',' && !inQ) {
            cells.push(curr.replace(/^"|"$/g, '').trim());
            curr = '';
          } else {
            curr += c;
          }
        }
        cells.push(curr.replace(/^"|"$/g, '').trim());
        return cells;
      };

      const headerCells = parseCells(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      const hasHeader = headerCells.some(h => 
        h.includes('title') || h.includes('name') || h.includes('plan') || h.includes('workout') || h.includes('main')
      );

      const dataLines = hasHeader ? lines.slice(1) : lines;
      const workouts: SavedWorkoutItem[] = [];

      // Determine format:
      // Format A: Each row is a distinct Swim Plan (columns: Name, Focus, Warmup, Preset, Main, Cooldown, TotalDist, Notes)
      // Format B: Row by row items grouped by Plan ID or Plan Name
      const isMultiColumnPlan = headerCells.some(h => h.includes('main') || h.includes('warm') || h.includes('set'));

      if (isMultiColumnPlan || hasHeader) {
        const nameIdx = headerCells.findIndex(h => h.includes('name') || h.includes('title') || h.includes('plan'));
        const focusIdx = headerCells.findIndex(h => h.includes('focus') || h.includes('category'));
        const distIdx = headerCells.findIndex(h => h.includes('dist') || h.includes('total') || h.includes('meter'));
        const warmupIdx = headerCells.findIndex(h => h.includes('warm') || h.includes('ein'));
        const presetIdx = headerCells.findIndex(h => h.includes('pre') || h.includes('drill'));
        const mainIdx = headerCells.findIndex(h => h.includes('main') || h.includes('haupt'));
        const cooldownIdx = headerCells.findIndex(h => h.includes('cool') || h.includes('aus'));
        const notesIdx = headerCells.findIndex(h => h.includes('note') || h.includes('desc'));

        dataLines.forEach((line, idx) => {
          const cells = parseCells(line);
          if (cells.length === 0 || !cells.some(c => c.length > 0)) return;

          const planName = (nameIdx >= 0 ? cells[nameIdx] : cells[0]) || `Imported Swim Plan ${idx + 1}`;
          const rawFocus = (focusIdx >= 0 ? cells[focusIdx] : '') || 'Threshold';
          const notes = (notesIdx >= 0 ? cells[notesIdx] : '') || '';

          let focus: SavedWorkoutItem['focus'] = 'Threshold';
          if (/aerobic|en1|endur/i.test(rawFocus)) focus = 'Aerobic';
          else if (/speed|sprint|sp|vo2/i.test(rawFocus)) focus = 'Speed';
          else if (/tech|drill/i.test(rawFocus)) focus = 'Technique';
          else if (/recov/i.test(rawFocus)) focus = 'Recovery';

          const blocks: WorkoutBlock[] = [];

          // Warmup
          const warmupText = warmupIdx >= 0 ? cells[warmupIdx] : '';
          if (warmupText) {
            const items = warmupText.split(/;|\n/).map(t => parseSwimItemText(t, 'warmup')).filter(i => i.distance > 0);
            if (items.length > 0) {
              blocks.push({
                id: `b-warmup-${idx}`,
                type: 'warmup',
                title: 'Einschwimmen',
                rounds: 1,
                items,
              });
            }
          } else {
            blocks.push({
              id: `b-warmup-${idx}`,
              type: 'warmup',
              title: 'Einschwimmen',
              rounds: 1,
              items: [parseSwimItemText('400m Beliebig locker', 'warmup')],
            });
          }

          // Preset
          const presetText = presetIdx >= 0 ? cells[presetIdx] : '';
          if (presetText) {
            const items = presetText.split(/;|\n/).map(t => parseSwimItemText(t, 'preset')).filter(i => i.distance > 0);
            if (items.length > 0) {
              blocks.push({
                id: `b-preset-${idx}`,
                type: 'preset',
                title: 'Vorbereitungsserie',
                rounds: 1,
                items,
              });
            }
          }

          // Main
          const mainText = mainIdx >= 0 ? cells[mainIdx] : (cells[2] || cells[1] || '10x100m Schwellentraining');
          if (mainText) {
            const items = mainText.split(/;|\n/).map(t => parseSwimItemText(t, 'main')).filter(i => i.distance > 0);
            blocks.push({
              id: `b-main-${idx}`,
              type: 'main',
              title: 'Hauptserie',
              rounds: 1,
              items: items.length > 0 ? items : [parseSwimItemText('12x100m Schwelle', 'main')],
            });
          }

          // Cooldown
          const cooldownText = cooldownIdx >= 0 ? cells[cooldownIdx] : '';
          if (cooldownText) {
            const items = cooldownText.split(/;|\n/).map(t => parseSwimItemText(t, 'cooldown')).filter(i => i.distance > 0);
            if (items.length > 0) {
              blocks.push({
                id: `b-cool-${idx}`,
                type: 'cooldown',
                title: 'Ausschwimmen',
                rounds: 1,
                items,
              });
            }
          } else {
            blocks.push({
              id: `b-cool-${idx}`,
              type: 'cooldown',
              title: 'Ausschwimmen',
              rounds: 1,
              items: [parseSwimItemText('300m Beliebig locker', 'cooldown')],
            });
          }

          const calculatedDist = blocks.reduce((sum, b) => sum + calculateBlockDistance(b), 0);
          const parsedExplicitDist = distIdx >= 0 && parseInt(cells[distIdx], 10);
          const totalDist = parsedExplicitDist && parsedExplicitDist > 500 ? parsedExplicitDist : Math.max(1200, calculatedDist);

          workouts.push({
            id: `csv-plan-${Date.now()}-${idx}`,
            name: planName,
            category: /speed|sprint/i.test(rawFocus) ? 'Speed' : /aerobic|endur/i.test(rawFocus) ? 'Endurance' : 'Threshold',
            focus,
            totalDistance: totalDist,
            estimatedMinutes: Math.round(totalDist / 50),
            blocks,
            source: 'custom_template',
            isCompleted: false,
            notes: notes ? `CSV Imported: ${notes}` : 'Imported from CSV Swim Plan collection',
            tags: ['CSV Import', focus, `${totalDist}m`],
          });
        });
      } else {
        // Fallback for simple line-by-line plan list
        dataLines.forEach((line, idx) => {
          const cells = parseCells(line);
          const title = cells[0] || `Swim Workout ${idx + 1}`;
          const desc = cells.slice(1).join(' ');

          const workout: SavedWorkoutItem = {
            id: `csv-plan-${Date.now()}-${idx}`,
            name: title,
            category: 'Threshold',
            focus: 'Threshold',
            totalDistance: 3000,
            estimatedMinutes: 60,
            blocks: [
              {
                id: `b-w-${idx}`,
                type: 'warmup',
                title: 'Warm-Up',
                rounds: 1,
                items: [parseSwimItemText('400m Choice loosen', 'warmup')],
              },
              {
                id: `b-m-${idx}`,
                type: 'main',
                title: 'Main Set',
                rounds: 1,
                items: [parseSwimItemText(desc || '10x100m Threshold Pace hold', 'main')],
              },
              {
                id: `b-c-${idx}`,
                type: 'cooldown',
                title: 'Cool Down',
                rounds: 1,
                items: [parseSwimItemText('300m Choice easy flush', 'cooldown')],
              },
            ],
            source: 'custom_template',
            isCompleted: false,
            notes: desc || 'Imported from CSV list',
            tags: ['CSV Import', '3000m'],
          };
          workout.totalDistance = workout.blocks.reduce((sum, b) => sum + calculateBlockDistance(b), 0) || 3000;
          workouts.push(workout);
        });
      }

      if (workouts.length === 0) {
        setErrorMsg('Could not parse any valid workouts. Please verify the CSV format.');
        return;
      }

      setParsedWorkouts(workouts);
      setSelectedIndices(new Set(workouts.map((_, i) => i)));
    } catch (err: any) {
      console.error('CSV parse error', err);
      setErrorMsg(`Failed to parse CSV: ${err.message || 'Invalid format'}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      handleParseCsv(content);
    };
    reader.readAsText(file);
  };

  const handleToggleSelectAll = () => {
    if (selectedIndices.size === parsedWorkouts.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(parsedWorkouts.map((_, i) => i)));
    }
  };

  const handleToggleSelectIndex = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  };

  const handleConfirmImport = () => {
    const toImport = parsedWorkouts.filter((_, i) => selectedIndices.has(i));
    if (toImport.length === 0) {
      setErrorMsg('Please select at least one workout to import.');
      return;
    }
    onImportWorkouts(toImport);
    onClose();
  };

  const handleLoadSampleCsv = () => {
    const sample = `Plan Name,Focus,Total Distance,Warmup,Preset,Main Set,Cooldown,Notes
"Sprint & Startblock-Explosivität","Speed",2600,"400m Beliebig locker","6x50m Delphinkicks mit Flossen","12x25m Startsprünge vom Block; 8x50m Sprint @ 1:30","300m Pullbuoy locker","Fokus auf Startreaktion und 15m Tauchphasen"
"Schwellentraining CSS-Stufenleiter","Threshold",3200,"400m Kraul 3er/5er Atmung","4x50m Abschlag-Kraul mit Schnorchel","4x300m Kraul @ CSS; 8x100m Lagen @ GA2","300m Locker Rücken","CSS-Bahnenbasis auf unter 1s Abweichung halten"
"Aerobe Ausdauergrundlage (GA1)","Aerobic",3500,"500m Kraul & Rücken","8x50m Beine mit Brett","600m Kraul; 2x400m Arme mit Paddles; 4x200m Lagen","300m Ausspülen","Kontinuierlicher aerober Kapillarenaufbau"
"VO2max Spitzenleistung & WSA","Speed",3100,"400m Beliebig","8x50m Hypoxische Auftauchphasen","12x100m VO2max @ 92% Leistung; 8x50m Beine max","300m Beliebig locker","Maximale Sauerstoffaufnahme und Frequenzdisziplin"`;
    setCsvText(sample);
    setFileName('beispiel_schwimmplaene.csv');
    handleParseCsv(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 shadow-2xl relative flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Schwimmpläne per CSV importieren</h2>
              <p className="text-xs text-slate-400">
                Lade eine .csv-Datei hoch oder füge CSV-Text ein, um Einheiten automatisch zu parsen und in deine Bibliothek zu übernehmen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* File Upload / Paste Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* File Upload Box */}
            <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 bg-slate-950/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center group">
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 mb-2 transition" />
              <span className="font-bold text-white text-xs">
                {fileName ? fileName : 'CSV-Datei hochladen'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">Klicken oder .csv-Datei hierher ziehen</span>
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Quick Sample Button */}
            <div className="border border-slate-800 bg-slate-950/60 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="font-bold text-white text-xs block mb-1">Beispielformat benötigt?</span>
                <p className="text-[11px] text-slate-400">
                  Lade eine vorformatierte Schwimmplan-Vorlage mit Spalten für Einschwimmen, Vorbereitung, Hauptserie und Ausschwimmen.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleCsv}
                className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Beispiel-CSV laden</span>
              </button>
            </div>
          </div>

          {/* Raw Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-300">Oder CSV-Text direkt einfügen:</label>
              {csvText && (
                <button
                  type="button"
                  onClick={() => handleParseCsv(csvText)}
                  className="text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  Parsen & Vorschau aktualisieren
                </button>
              )}
            </div>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                if (e.target.value.trim().length > 10) {
                  handleParseCsv(e.target.value);
                }
              }}
              placeholder={`Plan Name,Focus,Total Distance,Warmup,Main Set,Cooldown\n"Schwellentest CSS","Threshold",3000,"400m Beliebig","12x100m @ CSS","200m Locker"`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-white focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 p-3 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Workouts Preview */}
          {parsedWorkouts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{parsedWorkouts.length} Einheiten bereit zum Importieren</span>
                </span>

                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px]"
                >
                  {selectedIndices.size === parsedWorkouts.length ? 'Alle abwählen' : 'Alle auswählen'}
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {parsedWorkouts.map((w, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleSelectIndex(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-slate-950 border-cyan-500/60 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950/50 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          isSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{w.name}</div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="text-cyan-300 font-semibold">{w.focus}</span>
                            <span>•</span>
                            <span>{w.blocks.length} Serien</span>
                            {w.notes && (
                              <>
                                <span>•</span>
                                <span className="line-clamp-1">{w.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-cyan-400">{w.totalDistance.toLocaleString()}m</div>
                        <div className="text-[10px] text-slate-500">~{w.estimatedMinutes} Min</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-3">
          <div className="text-slate-400 text-[11px]">
            {parsedWorkouts.length > 0
              ? `${selectedIndices.size} von ${parsedWorkouts.length} Einheiten ausgewählt`
              : 'CSV-Text einfügen oder Datei hochladen zum Parsen'}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={selectedIndices.size === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-cyan-900/40 transition"
            >
              <span>{selectedIndices.size} Einheiten importieren</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
