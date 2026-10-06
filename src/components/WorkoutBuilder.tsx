import React, { useState, useEffect } from 'react';
import { 
  WorkoutSession, 
  WorkoutBlock, 
  WorkoutItem, 
  DrillLibraryItem, 
  LaneConfig, 
  StrokeType, 
  IntensityZone, 
  EquipmentItem,
  DayOfWeek,
  SavedWorkoutItem 
} from '../types/swim';
import { 
  calculateBlockDistance, 
  calculateSessionDistance, 
  calculateSessionEstimatedMinutes,
  calculateLaneSendOff,
  formatSecondsToTime 
} from '../utils/swimCalculators';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Copy, 
  Search, 
  Sliders, 
  Layers, 
  Clock, 
  Flame, 
  Dumbbell, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  FileText, 
  Share2,
  Sparkles,
  HelpCircle,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Bookmark,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { SaveWorkoutModal } from './SaveWorkoutModal';
import { INSPIRATION_WORKOUTS } from '../data/inspirationPlans';
import { 
  formatDayGerman, 
  formatStrokeGerman, 
  formatIntensityGerman, 
  formatIntensityShortGerman, 
  formatEquipmentGerman, 
  formatFocusGerman,
  formatBlockTypeGerman,
  GERMAN_STROKES,
  GERMAN_EQUIPMENT
} from '../utils/germanTranslations';

interface WorkoutBuilderProps {
  session: WorkoutSession;
  lanes: LaneConfig[];
  drillLibrary: DrillLibraryItem[];
  onSaveSession: (updatedSession: WorkoutSession) => void;
  onAddCustomDrill: (drill: DrillLibraryItem) => void;
  poolLength: '25m' | '50m' | '25y';
  onBackToPlanner?: () => void;
  savedWorkouts?: SavedWorkoutItem[];
  onSaveWorkoutToLibrary?: (workout: SavedWorkoutItem) => void;
  onDeleteWorkoutFromLibrary?: (id: string) => void;
}

const STROKES: StrokeType[] = [
  'Freestyle', 
  'Backstroke', 
  'Breaststroke', 
  'Butterfly', 
  'IM', 
  'Choice', 
  'Kick', 
  'Pull', 
  'Drill'
];

const INTENSITIES: IntensityZone[] = [
  'Recovery', 
  'Aerobic (EN1)', 
  'Threshold (EN2)', 
  'VO2Max (EN3)', 
  'Sprint (SP)'
];

const ALL_EQUIPMENT: EquipmentItem[] = [
  'Kickboard', 
  'Pull Buoy', 
  'Paddles', 
  'Fins', 
  'Snorkel', 
  'Band'
];

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  session,
  lanes,
  drillLibrary,
  onSaveSession,
  onAddCustomDrill,
  poolLength,
  onBackToPlanner,
  savedWorkouts = [],
  onSaveWorkoutToLibrary,
  onDeleteWorkoutFromLibrary,
}) => {
  const [currentSession, setCurrentSession] = useState<WorkoutSession>(session);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isNewDrillModalOpen, setIsNewDrillModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Saved Workouts & Inspiration plans state
  const [sidebarTab, setSidebarTab] = useState<'drills' | 'saved' | 'base'>('drills');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [workoutSearchQuery, setWorkoutSearchQuery] = useState('');
  const [workoutFilterCategory, setWorkoutFilterCategory] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync component state whenever selected workout session changes
  useEffect(() => {
    setCurrentSession(session);
    setSaveStatus('saved');
  }, [session.id, session.weekNumber, session.name, session.totalDistance]);

  // New drill form state
  const [newDrillName, setNewDrillName] = useState('');
  const [newDrillCategory, setNewDrillCategory] = useState<DrillLibraryItem['category']>('Freestyle');
  const [newDrillStroke, setNewDrillStroke] = useState<StrokeType>('Freestyle');
  const [newDrillDistance, setNewDrillDistance] = useState(50);
  const [newDrillCue, setNewDrillCue] = useState('');
  const [newDrillIntensity, setNewDrillIntensity] = useState<IntensityZone>('Aerobic (EN1)');
  const [newDrillEquipment, setNewDrillEquipment] = useState<EquipmentItem[]>([]);

  // Calculate live stats
  const totalMeters = calculateSessionDistance(currentSession);
  const estimatedMins = calculateSessionEstimatedMinutes(currentSession, lanes[0]?.basePace100mSeconds || 85);

  // Drag and drop state
  const [draggedDrill, setDraggedDrill] = useState<DrillLibraryItem | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);

  const handleUpdateSession = (updates: Partial<WorkoutSession>) => {
    const updated = { ...currentSession, ...updates };
    updated.totalDistance = calculateSessionDistance(updated);
    updated.estimatedMinutes = calculateSessionEstimatedMinutes(updated, lanes[0]?.basePace100mSeconds || 85);
    setCurrentSession(updated);
    setSaveStatus('saving');
    onSaveSession(updated);
    setTimeout(() => setSaveStatus('saved'), 400);
  };

  const handleLoadWorkout = (workout: SavedWorkoutItem) => {
    const clonedBlocks = JSON.parse(JSON.stringify(workout.blocks || [])).map((b: WorkoutBlock, bIdx: number) => ({
      ...b,
      id: `loaded-block-${Date.now()}-${bIdx}`,
      items: (b.items || []).map((it: WorkoutItem, iIdx: number) => ({
        ...it,
        id: `loaded-item-${Date.now()}-${bIdx}-${iIdx}`,
      }))
    }));

    const prefix = currentSession.name.includes(':') 
      ? currentSession.name.split(':')[0] 
      : `W${currentSession.weekNumber} ${currentSession.dayOfWeek}`;

    handleUpdateSession({
      name: `${prefix}: ${workout.name}`,
      focus: workout.focus,
      blocks: clonedBlocks
    });

    showToast(`Loaded "${workout.name}" into session!`);
  };

  const handleAppendWorkout = (workout: SavedWorkoutItem) => {
    const clonedBlocks = JSON.parse(JSON.stringify(workout.blocks || [])).map((b: WorkoutBlock, bIdx: number) => ({
      ...b,
      id: `appended-block-${Date.now()}-${bIdx}`,
      title: `${b.title}`,
      items: (b.items || []).map((it: WorkoutItem, iIdx: number) => ({
        ...it,
        id: `appended-item-${Date.now()}-${bIdx}-${iIdx}`,
      }))
    }));

    handleUpdateSession({
      blocks: [...(currentSession.blocks || []), ...clonedBlocks]
    });

    showToast(`Appended ${clonedBlocks.length} blocks to current workout!`);
  };

  const handleQuickMarkCompleted = () => {
    const dist = calculateSessionDistance(currentSession);
    const est = calculateSessionEstimatedMinutes(currentSession, lanes[0]?.basePace100mSeconds || 85);
    const completedWorkout: SavedWorkoutItem = {
      id: `completed-${Date.now()}`,
      name: currentSession.name || `Completed Workout (${currentSession.dayOfWeek})`,
      category: 'Threshold',
      focus: currentSession.focus,
      totalDistance: dist,
      estimatedMinutes: est,
      blocks: JSON.parse(JSON.stringify(currentSession.blocks || [])),
      completedAt: new Date().toISOString(),
      isCompleted: true,
      notes: `Squad completed on pool deck (${poolLength} course).`,
      tags: ['Completed', currentSession.focus, `${dist}m`],
      source: 'completed_session'
    };

    if (onSaveWorkoutToLibrary) {
      onSaveWorkoutToLibrary(completedWorkout);
    }
    showToast('Saved to Completed Workouts Library!');
  };

  const handleExplicitSave = () => {
    const finalSession = {
      ...currentSession,
      totalDistance: calculateSessionDistance(currentSession),
      estimatedMinutes: calculateSessionEstimatedMinutes(currentSession, lanes[0]?.basePace100mSeconds || 85)
    };
    onSaveSession(finalSession);
    setSaveStatus('saved');
  };

  const handleMoveBlock = (blockIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (targetIndex < 0 || targetIndex >= (currentSession?.blocks?.length || 0)) return;
    const newBlocks = [...(currentSession?.blocks || [])];
    const temp = newBlocks[blockIndex];
    newBlocks[blockIndex] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    handleUpdateSession({ blocks: newBlocks });
  };

  const handleDuplicateBlock = (block: WorkoutBlock) => {
    const clonedBlock: WorkoutBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${block.title} (Copy)`,
      items: block.items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
      }))
    };
    const blockIndex = currentSession.blocks.findIndex(b => b.id === block.id);
    const newBlocks = [...currentSession.blocks];
    newBlocks.splice(blockIndex + 1, 0, clonedBlock);
    handleUpdateSession({ blocks: newBlocks });
  };

  const handleAddBlock = (type: WorkoutBlock['type']) => {
    let title = 'New Set Block';
    if (type === 'warmup') title = 'Warm-Up';
    else if (type === 'preset') title = 'Pre-Set / Activation';
    else if (type === 'main') title = 'Main Set';
    else if (type === 'secondary') title = 'Secondary Set / Pull';
    else if (type === 'cooldown') title = 'Cool Down';

    const newBlock: WorkoutBlock = {
      id: `block-${Date.now()}`,
      type,
      title,
      rounds: 1,
      items: [
        {
          id: `item-${Date.now()}`,
          reps: 4,
          distance: 100,
          stroke: 'Freestyle',
          intensity: 'Aerobic (EN1)',
          description: 'Smooth aerobic pacing',
          equipment: [],
          sendOffMode: 'lane-scaled',
        },
      ],
    };

    handleUpdateSession({
      blocks: [...currentSession.blocks, newBlock],
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    handleUpdateSession({
      blocks: currentSession.blocks.filter(b => b.id !== blockId),
    });
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<WorkoutBlock>) => {
    handleUpdateSession({
      blocks: currentSession.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b),
    });
  };

  const handleAddItemToBlock = (blockId: string, itemTemplate?: Partial<WorkoutItem>) => {
    const newItem: WorkoutItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reps: itemTemplate?.reps ?? 4,
      distance: itemTemplate?.distance ?? 100,
      stroke: itemTemplate?.stroke ?? 'Freestyle',
      intensity: itemTemplate?.intensity ?? 'Aerobic (EN1)',
      description: itemTemplate?.description ?? '',
      equipment: itemTemplate?.equipment ?? [],
      sendOffMode: itemTemplate?.sendOffMode ?? 'lane-scaled',
      ...(itemTemplate?.fixedInterval ? { fixedInterval: itemTemplate.fixedInterval } : {}),
      ...(itemTemplate?.restSeconds ? { restSeconds: itemTemplate.restSeconds } : {}),
      ...(itemTemplate?.notes ? { notes: itemTemplate.notes } : {}),
    };

    handleUpdateSession({
      blocks: currentSession.blocks.map(b => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          items: [...b.items, newItem],
        };
      }),
    });
  };

  const handleRemoveItem = (blockId: string, itemId: string) => {
    handleUpdateSession({
      blocks: currentSession.blocks.map(b => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          items: b.items.filter(i => i.id !== itemId),
        };
      }),
    });
  };

  const handleUpdateItem = (blockId: string, itemId: string, updates: Partial<WorkoutItem>) => {
    handleUpdateSession({
      blocks: currentSession.blocks.map(b => {
        if (b.id !== blockId) return b;
        return {
          ...b,
          items: b.items.map(i => i.id === itemId ? { ...i, ...updates } : i),
        };
      }),
    });
  };

  const handleDuplicateItem = (blockId: string, item: WorkoutItem) => {
    const cloned: WorkoutItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    handleUpdateSession({
      blocks: currentSession.blocks.map(b => {
        if (b.id !== blockId) return b;
        const idx = b.items.findIndex(i => i.id === item.id);
        const newItems = [...b.items];
        newItems.splice(idx + 1, 0, cloned);
        return { ...b, items: newItems };
      }),
    });
  };

  const handleMoveItem = (blockId: string, itemIndex: number, direction: 'up' | 'down') => {
    handleUpdateSession({
      blocks: (currentSession?.blocks || []).map(b => {
        if (b.id !== blockId) return b;
        const newItems = [...(b.items || [])];
        const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return b;
        const temp = newItems[itemIndex];
        newItems[itemIndex] = newItems[targetIndex];
        newItems[targetIndex] = temp;
        return { ...b, items: newItems };
      }),
    });
  };

  // Drag and Drop handlers
  const handleDragStart = (drill: DrillLibraryItem) => {
    setDraggedDrill(drill);
  };

  const handleDragOver = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    setDragOverBlockId(blockId);
  };

  const handleDragLeave = () => {
    setDragOverBlockId(null);
  };

  const handleDrop = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    setDragOverBlockId(null);
    if (!draggedDrill) return;

    handleAddItemToBlock(blockId, {
      reps: 4,
      distance: draggedDrill.defaultDistance,
      stroke: draggedDrill.stroke,
      intensity: draggedDrill.intensity,
      description: `${draggedDrill.name}: ${draggedDrill.focusCue}`,
      equipment: draggedDrill.equipment,
      sendOffMode: 'lane-scaled',
    });

    setDraggedDrill(null);
  };

  const handleCreateCustomDrill = () => {
    if (!newDrillName.trim()) return;
    const drill: DrillLibraryItem = {
      id: `drill-custom-${Date.now()}`,
      name: newDrillName.trim(),
      category: newDrillCategory,
      stroke: newDrillStroke,
      defaultDistance: newDrillDistance,
      equipment: newDrillEquipment,
      focusCue: newDrillCue.trim(),
      intensity: newDrillIntensity,
      description: newDrillCue.trim() || 'Custom squad drill',
    };
    onAddCustomDrill(drill);
    setIsNewDrillModalOpen(false);
    setNewDrillName('');
    setNewDrillCue('');
  };

  const handleCopyToClipboard = () => {
    let text = `🏊 ${currentSession.name.toUpperCase()} (${poolLength})\n`;
    text += `Focus: ${currentSession.focus} | Total Volume: ${totalMeters}${poolLength.slice(-1)} | Est. Time: ${estimatedMins} min\n\n`;

    (currentSession?.blocks || []).forEach(b => {
      text += `--- ${b.title.toUpperCase()} ${b.rounds > 1 ? `(${b.rounds} Rounds)` : ''} ---\n`;
      (b.items || []).forEach(i => {
        text += `• ${i.reps} x ${i.distance}m ${i.stroke} [${i.intensity}]`;
        if ((i.equipment?.length || 0) > 0) text += ` w/ ${i.equipment.join(', ')}`;
        if (i.description) text += ` - "${i.description}"\n`;
        else text += '\n';

        // Lane intervals
        const laneIntervals = lanes.map(l => {
          const pace = calculateLaneSendOff(l, i.distance, i.intensity, i.stroke);
          return `L${l.laneNumber}: @${pace.sendOffStr}`;
        }).join(' | ');
        text += `   Send-offs: ${laneIntervals}\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Filtered drills
  const filteredDrills = drillLibrary.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.focusCue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'All' || d.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Session Header & Live Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {onBackToPlanner && (
                <button
                  type="button"
                  onClick={onBackToPlanner}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
                  title="Zurück zum Wochenplaner"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Wochenplaner</span>
                </button>
              )}
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Woche {currentSession.weekNumber} • {formatDayGerman(currentSession.dayOfWeek)}
              </span>
              <div className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-xs">
                <Clock className="w-3 h-3 text-cyan-400" />
                <input
                  type="text"
                  value={currentSession.scheduledTime || '06:00 - 07:30'}
                  onChange={e => handleUpdateSession({ scheduledTime: e.target.value })}
                  placeholder="06:00 - 07:30"
                  className="bg-transparent text-slate-300 font-semibold text-xs outline-none w-28 text-center"
                  title="Trainingszeit bearbeiten"
                />
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {poolLength === '25m' ? '25m Kurzbahn' : poolLength === '50m' ? '50m Langbahn' : '25y Yardbahn'}
              </span>
              
              {/* Real-time sync badge */}
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                    <span className="text-amber-400 font-semibold">Wird gespeichert...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">In Cloud gespeichert</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <input
                type="text"
                value={currentSession.name}
                onChange={e => handleUpdateSession({ name: e.target.value })}
                className="bg-transparent text-xl md:text-2xl font-black text-white border-b border-dashed border-slate-700 focus:border-cyan-400 outline-none pb-0.5 w-full max-w-xl"
              />
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Total Distance */}
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gesamtdistanz</div>
              <div className="text-xl font-pace font-bold text-cyan-300">
                {totalMeters.toLocaleString()}<span className="text-xs text-slate-500 font-sans ml-1">{poolLength.slice(-1)}</span>
              </div>
            </div>

            {/* Estimated Duration */}
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Geschätzte Dauer</div>
              <div className="text-xl font-pace font-bold text-amber-300">
                {estimatedMins}<span className="text-xs text-slate-500 font-sans ml-1">Min.</span>
              </div>
            </div>

            {/* Focus Tag */}
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Hauptschwerpunkt</div>
              <select
                value={currentSession.focus}
                onChange={e => handleUpdateSession({ focus: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-bold outline-none cursor-pointer"
              >
                <option value="Aerobic">Grundlagenausdauer (GA1)</option>
                <option value="Threshold">Schwellenbereich (CSS)</option>
                <option value="Speed">Schnelligkeit & Sprint</option>
                <option value="Technique">Technik & Rumpf</option>
                <option value="Recovery">Regeneration</option>
                <option value="Test Set">Leistungstest</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsSaveModalOpen(true)}
                className="px-3 py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-xl transition flex items-center space-x-1.5 text-xs font-bold cursor-pointer shadow-sm shadow-cyan-950"
                title="Einheit in der Trainingsbibliothek speichern"
              >
                <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">In Bibliothek</span>
              </button>

              <button
                type="button"
                onClick={handleQuickMarkCompleted}
                className="p-2 sm:px-3 sm:py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 rounded-xl transition flex items-center space-x-1.5 text-xs font-bold cursor-pointer shadow-sm shadow-emerald-950"
                title="Training als absolviert markieren und in Bibliothek ablegen"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Absolviert</span>
              </button>

              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
                title="Whiteboard-Training in die Zwischenablage kopieren"
              >
                {copiedNotification ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedNotification ? 'Kopiert!' : 'Text kopieren'}</span>
              </button>

              <button
                type="button"
                onClick={handleExplicitSave}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition cursor-pointer"
                title="Änderungen am Training speichern"
              >
                <Save className="w-4 h-4" />
                <span>Training speichern</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Builder Grid: Drill Library (Left) + Workout Blocks Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drills & Workout Library Drawer */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[780px]">
            {/* Drawer Tabs: Drills, Saved Workouts, Base Inspiration Plans */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-3 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSidebarTab('drills')}
                className={`py-1.5 px-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                  sidebarTab === 'drills'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3 text-amber-300" />
                <span>Technik</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('saved')}
                className={`py-1.5 px-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                  sidebarTab === 'saved'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bookmark className="w-3 h-3 text-cyan-300" />
                <span>Gespeichert ({savedWorkouts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('base')}
                className={`py-1.5 px-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                  sidebarTab === 'base'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Basispläne</span>
              </button>
            </div>

            {/* TAB 1: DRILLS LIBRARY */}
            {sidebarTab === 'drills' && (
              <>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Übungsbibliothek ({drillLibrary?.length || 0})</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Übungen per Drag & Drop rechts in Serien ziehen</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsNewDrillModalOpen(true)}
                    className="p-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                    title="Eigene Technikübung erstellen"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-[10px]">Neu</span>
                  </button>
                </div>

                {/* Search and Category Filter */}
                <div className="space-y-2 mb-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Übungen, Schwerpunkte, Lagen suchen..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    {[
                      { id: 'All', label: 'Alle' },
                      { id: 'Freestyle', label: 'Kraul' },
                      { id: 'Backstroke', label: 'Rücken' },
                      { id: 'Breaststroke', label: 'Brust' },
                      { id: 'Butterfly', label: 'Delphin' },
                      { id: 'IM', label: 'Lagen' },
                      { id: 'Kick', label: 'Beine' },
                      { id: 'Pull', label: 'Armzug' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFilterCategory(cat.id)}
                        className={`px-2 py-0.5 rounded-md whitespace-nowrap transition text-[10px] font-semibold ${
                          filterCategory === cat.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drills List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {(filteredDrills?.length || 0) === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">
                      Keine Übungen gefunden.
                    </div>
                  ) : (
                    (filteredDrills || []).map((drill) => (
                      <div
                        key={drill.id}
                        draggable
                        onDragStart={() => handleDragStart(drill)}
                        className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition cursor-grab active:cursor-grabbing group shadow-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 flex-shrink-0" />
                            <div>
                              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                                {drill.name}
                              </h4>
                              <span className="text-[10px] text-cyan-400/80 font-mono">
                                {formatStrokeGerman(drill.stroke)} • {drill.defaultDistance}m
                              </span>
                            </div>
                          </div>

                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {formatIntensityShortGerman(drill.intensity)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1 italic line-clamp-2">
                          "{drill.focusCue}"
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-900">
                          <div className="flex items-center space-x-1">
                            {drill.equipment.map(eq => (
                              <span key={eq} className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-400">
                                {formatEquipmentGerman(eq)}
                              </span>
                            ))}
                          </div>

                          {/* Quick Add Dropdown */}
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-500 mr-1">+ Serie:</span>
                            {currentSession.blocks.map(b => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => handleAddItemToBlock(b.id, {
                                  reps: 4,
                                  distance: drill.defaultDistance,
                                  stroke: drill.stroke,
                                  intensity: drill.intensity,
                                  description: `${drill.name}: ${drill.focusCue}`,
                                  equipment: drill.equipment,
                                })}
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white rounded text-[9px] transition"
                                title={`Zu "${b.title}" hinzufügen`}
                              >
                                {b.type === 'warmup' ? 'Ein' : b.type === 'preset' ? 'Vor' : b.type === 'main' ? 'Haupt' : b.type === 'secondary' ? 'Neben' : 'Aus'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* TAB 2: SAVED WORKOUTS LIBRARY */}
            {sidebarTab === 'saved' && (
              <>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Gespeicherte Trainings ({savedWorkouts.length})</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Absolvierte Einheiten & Kadervorlagen</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsSaveModalOpen(true)}
                    className="p-1 px-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                    title="Aktuelle Einheit in Bibliothek speichern"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="text-[10px]">Aktuelles speichern</span>
                  </button>
                </div>

                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={workoutSearchQuery}
                    onChange={e => setWorkoutSearchQuery(e.target.value)}
                    placeholder="Trainings, Tags, Fokus suchen..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                  {savedWorkouts
                    .filter(w => {
                      if (!workoutSearchQuery.trim()) return true;
                      const q = workoutSearchQuery.toLowerCase();
                      return w.name.toLowerCase().includes(q) || (w.tags || []).some(t => t.toLowerCase().includes(q));
                    })
                    .map((workout) => (
                      <div
                        key={workout.id}
                        className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition shadow-sm space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-1.5 mb-1">
                              {workout.isCompleted && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Erledigt</span>
                                </span>
                              )}
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                {formatFocusGerman(workout.focus)}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {workout.name}
                            </h4>
                          </div>

                          <span className="font-mono font-bold text-xs text-cyan-300 shrink-0">
                            {workout.totalDistance.toLocaleString()}m
                          </span>
                        </div>

                        {workout.notes && (
                          <p className="text-[10px] text-slate-400 italic line-clamp-2">
                            "{workout.notes}"
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-900 text-[10px]">
                          <span className="text-slate-500">{workout.blocks?.length || 0} Serien</span>

                          <div className="flex items-center space-x-1.5">
                            {onDeleteWorkoutFromLibrary && workout.source !== 'coach_inspiration' && (
                              <button
                                type="button"
                                onClick={() => onDeleteWorkoutFromLibrary(workout.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 transition"
                                title="Aus Bibliothek löschen"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleAppendWorkout(workout)}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition"
                              title="Serien an aktuelles Training anhängen"
                            >
                              + Anhängen
                            </button>

                            <button
                              type="button"
                              onClick={() => handleLoadWorkout(workout)}
                              className="px-2 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold transition flex items-center space-x-0.5"
                              title="Aktuelles Training mit dieser Vorlage ersetzen"
                            >
                              <span>Laden</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* TAB 3: BASE INSPIRATION PLANS */}
            {sidebarTab === 'base' && (
              <>
                <div className="pb-2.5 border-b border-slate-800 mb-2.5">
                  <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Basis-Inspirationspläne ({INSPIRATION_WORKOUTS.length})</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Wettkampf-Basisserien mit Delphinkicks, Armzug & Lagen</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {INSPIRATION_WORKOUTS.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-xl transition space-y-2 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/80">
                            Basisplan {plan.originalPlanIndex ? `#${plan.originalPlanIndex}` : ''}
                          </span>
                          <h4 className="text-xs font-black text-white mt-1">
                            {plan.name}
                          </h4>
                        </div>
                        <span className="font-mono font-black text-xs text-amber-300">
                          {plan.totalDistance.toLocaleString()}m
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-300 italic bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        {plan.notes}
                      </p>

                      {/* Blocks bullet summary */}
                      <div className="space-y-1 text-[10px] text-slate-400 pl-1">
                        {(plan.blocks || []).slice(0, 4).map((b, bIdx) => (
                          <div key={b.id || bIdx} className="truncate">
                            • <strong className="text-slate-300">{b.title}:</strong> {b.items?.[0]?.description || ''}
                          </div>
                        ))}
                        {(plan.blocks?.length || 0) > 4 && (
                          <div className="text-[9px] text-slate-500">+ {(plan.blocks?.length || 0) - 4} weitere Serien</div>
                        )}
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-900">
                        <button
                          type="button"
                          onClick={() => handleAppendWorkout(plan)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition"
                        >
                          + Anhängen
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLoadWorkout(plan)}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-[10px] transition flex items-center space-x-1 shadow-sm"
                        >
                          <span>Plan laden</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Workout Blocks Canvas */}
        <div className="lg:col-span-8 space-y-4">
          {/* Blocks Container */}
          <div className="space-y-4">
            {currentSession.blocks.map((block, blockIdx) => {
              const blockDist = calculateBlockDistance(block);
              const isOver = dragOverBlockId === block.id;

              return (
                <div
                  key={block.id}
                  onDragOver={(e) => handleDragOver(e, block.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, block.id)}
                  className={`bg-slate-900 border rounded-2xl p-4 shadow-xl transition relative ${
                    isOver 
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-cyan-950/20' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Block Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-3 gap-2">
                    <div className="flex items-center space-x-2">
                      {/* Block Move Controls */}
                      <div className="flex items-center space-x-0.5">
                        <button
                          type="button"
                          disabled={blockIdx === 0}
                          onClick={() => handleMoveBlock(blockIdx, 'up')}
                          className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition"
                          title="Serie nach oben verschieben"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={blockIdx === (currentSession?.blocks?.length || 0) - 1}
                          onClick={() => handleMoveBlock(blockIdx, 'down')}
                          className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition"
                          title="Serie nach unten verschieben"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className={`w-3 h-3 rounded-full ${
                        block.type === 'warmup' ? 'bg-emerald-500' :
                        block.type === 'preset' ? 'bg-amber-500' :
                        block.type === 'main' ? 'bg-red-500' :
                        block.type === 'secondary' ? 'bg-blue-500' : 'bg-purple-500'
                      }`} />
                      <input
                        type="text"
                        value={block.title}
                        onChange={e => handleUpdateBlock(block.id, { title: e.target.value })}
                        className="bg-transparent font-bold text-sm text-white focus:border-b focus:border-cyan-400 outline-none"
                      />
                      <span className="text-xs text-slate-400 font-mono">
                        ({blockDist}{poolLength.slice(-1)})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Rounds Multiplier */}
                      <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
                        <span className="text-slate-400 text-[11px]">Durchgänge:</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={block.rounds || 1}
                          onChange={e => handleUpdateBlock(block.id, { rounds: Math.max(1, Number(e.target.value) || 1) })}
                          className="w-8 text-center bg-slate-900 text-cyan-300 font-bold rounded"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddItemToBlock(block.id)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Wdh. hinzufügen</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateBlock(block)}
                        className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg transition cursor-pointer"
                        title="Ganze Serie duplizieren"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(block.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                        title="Serie löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Items (Drills / Repetitions) */}
                  <div className="space-y-3">
                    {(block.items?.length || 0) === 0 ? (
                      <div className="border border-dashed border-slate-800 rounded-xl py-6 text-center text-xs text-slate-500">
                        Übungen aus der linken Bibliothek hierher ziehen oder auf „Wdh. hinzufügen“ klicken
                      </div>
                    ) : (
                      (block.items || []).map((item, itemIdx) => {
                        return (
                          <div
                            key={item.id}
                            className="bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 rounded-xl p-3 space-y-2.5 transition"
                          >
                            {/* Reps, Distance, Stroke, Intensity */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {/* Move Controls */}
                              <div className="flex flex-col space-y-0.5">
                                <button
                                  type="button"
                                  disabled={itemIdx === 0}
                                  onClick={() => handleMoveItem(block.id, itemIdx, 'up')}
                                  className="text-slate-500 hover:text-white disabled:opacity-30"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={itemIdx === (block.items?.length || 0) - 1}
                                  onClick={() => handleMoveItem(block.id, itemIdx, 'down')}
                                  className="text-slate-500 hover:text-white disabled:opacity-30"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Reps */}
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  min={1}
                                  max={50}
                                  value={item.reps}
                                  onChange={e => handleUpdateItem(block.id, item.id, { reps: Math.max(1, Number(e.target.value) || 1) })}
                                  className="w-12 bg-slate-900 border border-slate-700 text-center rounded px-1 py-1 text-white font-bold"
                                />
                                <span className="text-slate-400 font-bold">×</span>
                              </div>

                              {/* Distance */}
                              <select
                                value={item.distance}
                                onChange={e => handleUpdateItem(block.id, item.id, { distance: Number(e.target.value) })}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono font-bold cursor-pointer"
                              >
                                {[25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 800, 1000, 1500].map(d => (
                                  <option key={d} value={d}>{d}{poolLength.slice(-1)}</option>
                                ))}
                              </select>

                              {/* Stroke */}
                              <select
                                value={item.stroke}
                                onChange={e => handleUpdateItem(block.id, item.id, { stroke: e.target.value as StrokeType })}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-cyan-300 font-semibold cursor-pointer"
                              >
                                {STROKES.map(s => (
                                  <option key={s} value={s}>{formatStrokeGerman(s)}</option>
                                ))}
                              </select>

                              {/* Intensity */}
                              <select
                                value={item.intensity}
                                onChange={e => handleUpdateItem(block.id, item.id, { intensity: e.target.value as IntensityZone })}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-300 font-medium cursor-pointer"
                              >
                                {INTENSITIES.map(i => (
                                  <option key={i} value={i}>{formatIntensityShortGerman(i)}</option>
                                ))}
                              </select>

                              {/* Send-Off Mode */}
                              <select
                                value={item.sendOffMode}
                                onChange={e => handleUpdateItem(block.id, item.id, { sendOffMode: e.target.value as any })}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-[11px] cursor-pointer"
                              >
                                <option value="lane-scaled">Bahnen-CSS Abgangszeiten</option>
                                <option value="fixed-interval">Fester Abgang (Min:Sek)</option>
                                <option value="rest-after">Feste Pause (Sekunden)</option>
                              </select>

                              {item.sendOffMode === 'fixed-interval' && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-[10px] text-slate-400 font-mono">@</span>
                                  <input
                                    type="text"
                                    value={item.fixedInterval || '1:30'}
                                    onChange={e => handleUpdateItem(block.id, item.id, { fixedInterval: e.target.value })}
                                    placeholder="1:30"
                                    className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-center font-mono text-cyan-300"
                                    title="Abgangszeit (z.B. 1:30)"
                                  />
                                </div>
                              )}

                              {item.sendOffMode === 'rest-after' && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-[10px] text-slate-400 font-mono">Pause:</span>
                                  <select
                                    value={item.restSeconds || 15}
                                    onChange={e => handleUpdateItem(block.id, item.id, { restSeconds: Number(e.target.value) })}
                                    className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-cyan-300 font-mono cursor-pointer"
                                  >
                                    {[5, 10, 15, 20, 30, 45, 60, 90, 120].map(s => (
                                      <option key={s} value={s}>:{s < 10 ? `0${s}` : s}s</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              <div className="ml-auto flex items-center space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateItem(block.id, item)}
                                  className="p-1 text-slate-500 hover:text-white rounded"
                                  title="Wiederholung duplizieren"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(block.id, item.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 rounded"
                                  title="Wiederholung löschen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Description and Focus Cue */}
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={e => handleUpdateItem(block.id, item.id, { description: e.target.value })}
                                placeholder="Trainingshinweis / Fokus (z.B. 1-4 steigernd, Züge zählen, 4 Delphinkicks nach Wende)..."
                                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
                              />
                            </div>

                            {/* Equipment Badges Selector */}
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-slate-500 mr-1">Material:</span>
                              {ALL_EQUIPMENT.map(eq => {
                                const currentEq = Array.isArray(item.equipment) ? item.equipment : [];
                                const hasEq = currentEq.includes(eq);
                                return (
                                  <button
                                    key={eq}
                                    type="button"
                                    onClick={() => {
                                      const updatedEq = hasEq
                                        ? currentEq.filter(e => e !== eq)
                                        : [...currentEq, eq];
                                      handleUpdateItem(block.id, item.id, { equipment: updatedEq });
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[10px] transition ${
                                      hasEq
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                                        : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
                                    }`}
                                  >
                                    {formatEquipmentGerman(eq)}
                                  </button>
                                );
                              })}
                            </div>

                            {/* SQUAD MULTI-LANE SEND-OFF PREVIEW BAR */}
                            {item.sendOffMode === 'lane-scaled' && (
                              <div className="pt-2 border-t border-slate-800/80">
                                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-semibold mb-1">
                                  <Sparkles className="w-3 h-3 text-cyan-400" />
                                  <span>Bahnen-Abgangszeiten für diese {item.distance}m Belastung:</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                                  {lanes.map((l) => {
                                    const sendOff = calculateLaneSendOff(
                                      l,
                                      item.distance,
                                      item.intensity,
                                      item.stroke
                                    );
                                    return (
                                      <div
                                        key={l.id}
                                        className="bg-slate-900/90 px-2 py-1 rounded-md border border-slate-800 flex items-center justify-between text-[11px]"
                                      >
                                        <span className="font-semibold truncate text-slate-300" style={{ color: l.color }}>
                                          B{l.laneNumber}:
                                        </span>
                                        <span className="font-pace font-bold text-cyan-300">
                                          @{sendOff.sendOffStr}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Set Block Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleAddBlock('warmup')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Einschwimm-Serie</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('preset')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Vorbereitungsserie</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('main')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Hauptserie</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('secondary')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nebenserie / Armzug</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('cooldown')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Ausschwimm-Serie</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Create Custom Drill */}
      {isNewDrillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>Neue Technikübung zur Kaderbibliothek hinzufügen</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Name der Übung</label>
                <input
                  type="text"
                  value={newDrillName}
                  onChange={e => setNewDrillName(e.target.value)}
                  placeholder="z.B. Faust-zu-Fingerspitzen Wasserfassen"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Kategorie</label>
                  <select
                    value={newDrillCategory}
                    onChange={e => setNewDrillCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    {[
                      { id: 'Freestyle', label: 'Kraul' },
                      { id: 'Backstroke', label: 'Rücken' },
                      { id: 'Breaststroke', label: 'Brust' },
                      { id: 'Butterfly', label: 'Delphin' },
                      { id: 'IM', label: 'Lagen' },
                      { id: 'Kick', label: 'Beine' },
                      { id: 'Pull', label: 'Armzug' },
                      { id: 'Starts & Turns', label: 'Starts & Wenden' },
                    ].map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Schwimmart</label>
                  <select
                    value={newDrillStroke}
                    onChange={e => setNewDrillStroke(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    {STROKES.map(s => (
                      <option key={s} value={s}>{formatStrokeGerman(s)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Technischer Fokus & Bewegungshinweis</label>
                <textarea
                  value={newDrillCue}
                  onChange={e => setNewDrillCue(e.target.value)}
                  placeholder="z.B. Frühes Wasserfassen mit hohem Ellbogen, Hüfte an der Oberfläche, 4er-Atmung"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Benötigtes Material</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_EQUIPMENT.map(eq => {
                    const selected = newDrillEquipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => {
                          setNewDrillEquipment(selected ? newDrillEquipment.filter(e => e !== eq) : [...newDrillEquipment, eq]);
                        }}
                        className={`px-2 py-1 rounded text-xs transition ${
                          selected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {formatEquipmentGerman(eq)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewDrillModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleCreateCustomDrill}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
              >
                In Bibliothek speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Save Workout to Library */}
      <SaveWorkoutModal
        session={currentSession}
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={(workout) => {
          if (onSaveWorkoutToLibrary) {
            onSaveWorkoutToLibrary(workout);
          }
          showToast(`„${workout.name}“ in Trainingsbibliothek gespeichert!`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
