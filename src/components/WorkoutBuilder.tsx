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
  DayOfWeek 
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
  Calendar
} from 'lucide-react';

interface WorkoutBuilderProps {
  session: WorkoutSession;
  lanes: LaneConfig[];
  drillLibrary: DrillLibraryItem[];
  onSaveSession: (updatedSession: WorkoutSession) => void;
  onAddCustomDrill: (drill: DrillLibraryItem) => void;
  poolLength: '25m' | '50m' | '25y';
  onBackToPlanner?: () => void;
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
}) => {
  const [currentSession, setCurrentSession] = useState<WorkoutSession>(session);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isNewDrillModalOpen, setIsNewDrillModalOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

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
                  title="Return to weekly schedule matrix"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Weekly Planner</span>
                </button>
              )}
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Week {currentSession.weekNumber} • {currentSession.dayOfWeek}
              </span>
              <div className="flex items-center space-x-1 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-xs">
                <Clock className="w-3 h-3 text-cyan-400" />
                <input
                  type="text"
                  value={currentSession.scheduledTime || '06:00 - 07:30'}
                  onChange={e => handleUpdateSession({ scheduledTime: e.target.value })}
                  placeholder="06:00 - 07:30"
                  className="bg-transparent text-slate-300 font-semibold text-xs outline-none w-28 text-center"
                  title="Click to edit practice scheduled time"
                />
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {poolLength} Course
              </span>
              
              {/* Real-time sync badge */}
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                {saveStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                    <span className="text-amber-400 font-semibold">Auto-saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Saved to Cloud</span>
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
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Distance</div>
              <div className="text-xl font-pace font-bold text-cyan-300">
                {totalMeters.toLocaleString()}<span className="text-xs text-slate-500 font-sans ml-1">{poolLength.slice(-1)}</span>
              </div>
            </div>

            {/* Estimated Duration */}
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Duration</div>
              <div className="text-xl font-pace font-bold text-amber-300">
                {estimatedMins}<span className="text-xs text-slate-500 font-sans ml-1">min</span>
              </div>
            </div>

            {/* Focus Tag */}
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Primary Focus</div>
              <select
                value={currentSession.focus}
                onChange={e => handleUpdateSession({ focus: e.target.value as any })}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-bold outline-none cursor-pointer"
              >
                <option value="Aerobic">Aerobic</option>
                <option value="Threshold">Threshold</option>
                <option value="Speed">Speed</option>
                <option value="Technique">Technique</option>
                <option value="Recovery">Recovery</option>
                <option value="Test Set">Test Set</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
                title="Copy whiteboard workout to clipboard"
              >
                {copiedNotification ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedNotification ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleExplicitSave}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition cursor-pointer"
                title="Save session changes"
              >
                <Save className="w-4 h-4" />
                <span>Save Workout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Builder Grid: Drill Library (Left) + Workout Blocks Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drills Library Drawer */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[780px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-cyan-400" />
                  <span>Drill & Set Library</span>
                </h3>
                <p className="text-[11px] text-slate-400">Drag drills directly into any set block on the right</p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewDrillModalOpen(true)}
                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                title="Create custom drill"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[10px]">New Drill</span>
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
                  placeholder="Search drills, cues, strokes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                {['All', 'Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM', 'Kick', 'Pull'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-md whitespace-nowrap transition font-medium ${
                      filterCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Drills List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {(filteredDrills?.length || 0) === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">
                  No drills match your filter.
                </div>
              ) : (
                (filteredDrills || []).map((drill) => (
                  <div
                    key={drill.id}
                    draggable
                    onDragStart={() => handleDragStart(drill)}
                    className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition cursor-grab active:cursor-grabbing group shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                            {drill.name}
                          </h4>
                          <span className="text-[10px] text-cyan-400/80 font-mono">
                            {drill.stroke} • {drill.defaultDistance}m
                          </span>
                        </div>
                      </div>

                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {drill.intensity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1.5 italic line-clamp-2">
                      "{drill.focusCue}"
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-900">
                      <div className="flex items-center space-x-1">
                        {drill.equipment.map(eq => (
                          <span key={eq} className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-400">
                            {eq}
                          </span>
                        ))}
                      </div>

                      {/* Quick Add Dropdown */}
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] text-slate-500 mr-1">Add to:</span>
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
                            title={`Add to ${b.title}`}
                          >
                            {b.type === 'warmup' ? 'Warm' : b.type === 'preset' ? 'Pre' : b.type === 'main' ? 'Main' : b.type === 'secondary' ? 'Sec' : 'Cool'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
                          title="Move block up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={blockIdx === (currentSession?.blocks?.length || 0) - 1}
                          onClick={() => handleMoveBlock(blockIdx, 'down')}
                          className="p-1 text-slate-500 hover:text-white disabled:opacity-20 transition"
                          title="Move block down"
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
                        <span className="text-slate-400 text-[11px]">Rounds:</span>
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
                        <span>Add Rep</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateBlock(block)}
                        className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg transition cursor-pointer"
                        title="Duplicate entire set block"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(block.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                        title="Delete set block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Items (Drills / Repetitions) */}
                  <div className="space-y-3">
                    {(block.items?.length || 0) === 0 ? (
                      <div className="border border-dashed border-slate-800 rounded-xl py-6 text-center text-xs text-slate-500">
                        Drag drills from the left library here, or click "Add Rep"
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
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>

                              {/* Intensity */}
                              <select
                                value={item.intensity}
                                onChange={e => handleUpdateItem(block.id, item.id, { intensity: e.target.value as IntensityZone })}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-amber-300 font-medium cursor-pointer"
                              >
                                {INTENSITIES.map(i => (
                                  <option key={i} value={i}>{i}</option>
                                ))}
                              </select>

                              {/* Send-Off Mode */}
                              <select
                                value={item.sendOffMode}
                                onChange={e => handleUpdateItem(block.id, item.id, { sendOffMode: e.target.value as any })}
                                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 text-[11px] cursor-pointer"
                              >
                                <option value="lane-scaled">Lane-Scaled Send-Offs</option>
                                <option value="fixed-interval">Fixed Squad Send-Off</option>
                                <option value="rest-after">Fixed Rest Seconds</option>
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
                                    title="Send-off interval (e.g. 1:30)"
                                  />
                                </div>
                              )}

                              {item.sendOffMode === 'rest-after' && (
                                <div className="flex items-center space-x-1">
                                  <span className="text-[10px] text-slate-400 font-mono">Rest:</span>
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
                                  title="Duplicate rep"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(block.id, item.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 rounded"
                                  title="Delete rep"
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
                                placeholder="Coaching cue / set instruction (e.g. Descend 1-4, count strokes, 4 dolphins off wall)..."
                                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
                              />
                            </div>

                            {/* Equipment Badges Selector */}
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-slate-500 mr-1">Gear:</span>
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
                                    {eq}
                                  </button>
                                );
                              })}
                            </div>

                            {/* SQUAD MULTI-LANE SEND-OFF PREVIEW BAR */}
                            {item.sendOffMode === 'lane-scaled' && (
                              <div className="pt-2 border-t border-slate-800/80">
                                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-semibold mb-1">
                                  <Sparkles className="w-3 h-3 text-cyan-400" />
                                  <span>Squad Lane Send-Offs for this {item.distance}m effort:</span>
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
                                          L{l.laneNumber}:
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
              <span>+ Warm-Up Block</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('preset')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Pre-Set Block</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('main')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-red-500/30 text-red-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Main Set Block</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('secondary')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-blue-500/30 text-blue-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Secondary / Pull Block</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddBlock('cooldown')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Cool Down Block</span>
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
              <span>Add Custom Squad Drill to Library</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Drill Name</label>
                <input
                  type="text"
                  value={newDrillName}
                  onChange={e => setNewDrillName(e.target.value)}
                  placeholder="e.g. Fist to Finger Catch Progression"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={newDrillCategory}
                    onChange={e => setNewDrillCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    {['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'IM', 'Kick', 'Pull', 'Starts & Turns'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Stroke Type</label>
                  <select
                    value={newDrillStroke}
                    onChange={e => setNewDrillStroke(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                  >
                    {STROKES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Technical Cue / Focus Instruction</label>
                <textarea
                  value={newDrillCue}
                  onChange={e => setNewDrillCue(e.target.value)}
                  placeholder="e.g. Initiate high-elbow catch, keep hips high, breathe every 4th cycle"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Required Equipment</label>
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
                        {eq}
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
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomDrill}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
