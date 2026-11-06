import React, { useState } from 'react';
import { 
  CanvasElement, 
  ComponentProps, 
  ComponentStyles, 
  Project,
  ActionStep,
  ComponentInteraction,
  MotionSettings,
  MotionEffect,
  MotionEasing,
  MotionCategory,
  MotionPresetView
} from '../types/editor';
import { 
  Sliders, 
  Palette, 
  Maximize2, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  LayoutTemplate,
  Zap,
  Plus,
  Play,
  Split,
  ChevronDown,
  Sparkles,
  Link,
  Unlink,
  Check,
  Film,
  Clock,
  Activity,
  RotateCcw,
  Repeat,
  LogIn,
  LogOut,
  ArrowRightLeft,
  AlertCircle,
  Keyboard
} from 'lucide-react';
import { createDefaultActionStep, getActivePage } from '../utils/project-engine';

interface PropertiesPanelProps {
  selectedElement: CanvasElement | null;
  project: Project;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateProjectSettings: (settings: { canvasBg?: string; canvasPadding?: Project['canvasPadding'] }) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onOpenShortcutsModal?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  project,
  onUpdateElement,
  onUpdateProjectSettings,
  onDeleteElement,
  onDuplicateElement,
  onToggleVisibility,
  onToggleLock,
  onOpenShortcutsModal,
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'design' | 'motion' | 'interactions'>('props');
  const [activeTrigger, setActiveTrigger] = useState<'onClick' | 'onHover' | 'onChange'>('onClick');
  const [isTestingMotion, setIsTestingMotion] = useState(false);
  const [presetCategory, setPresetCategory] = useState<MotionPresetView>('pairs');

  const activePage = getActivePage(project);

  const colorPresets = [
    '#ffffff',
    '#a1a1aa',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#09090b',
    '#18181b',
    '#27272a',
  ];

  if (!selectedElement) {
    // Canvas / Root Frame Properties
    return (
      <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0 select-none">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <LayoutTemplate size={13} className="text-blue-400" />
            Canvas Properties
          </span>
          <span className="text-[10px] font-mono text-zinc-400">{activePage.name} Frame</span>
        </div>

        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          {/* Active Screen Background */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Screen Background
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={project.canvasBg}
                onChange={(e) => onUpdateProjectSettings({ canvasBg: e.target.value })}
                className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={project.canvasBg}
                onChange={(e) => onUpdateProjectSettings({ canvasBg: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['#09090b', '#0f0f12', '#18181b', '#0f172a', '#022c22', '#1e1b4b'].map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => onUpdateProjectSettings({ canvasBg: bg })}
                  style={{ backgroundColor: bg }}
                  className={`w-6 h-6 rounded-md border transition cursor-pointer ${
                    project.canvasBg === bg ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Padding */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Canvas Inner Padding
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['sm', 'md', 'lg', 'xl'] as const).map((pad) => (
                <button
                  key={pad}
                  type="button"
                  onClick={() => onUpdateProjectSettings({ canvasPadding: pad })}
                  className={`py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer uppercase ${
                    project.canvasPadding === pad
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {pad}
                </button>
              ))}
            </div>
          </div>

          {/* Project Stats */}
          <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Active Screen</span>
              <span className="font-mono text-white">{activePage.name} ({activePage.path})</span>
            </div>
            <div className="flex justify-between">
              <span>Total Screens</span>
              <span className="font-mono text-white">{project.pages.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Elements on Page</span>
              <span className="font-mono text-white">{activePage.elements.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Target Viewport</span>
              <span className="font-mono text-white capitalize">{project.viewport}</span>
            </div>
          </div>

          {/* Keyboard Shortcuts & Hotkeys Configuration */}
          <div className="pt-4 border-t border-zinc-800 space-y-3" data-testid="settings-keyboard-shortcuts">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                <Keyboard size={13} className="text-blue-400" />
                <span>Hotkeys & Shortcuts</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Settings</span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Define custom key combinations for common operations like deleting elements, previewing, and saving.
            </p>

            <div className="divide-y divide-zinc-850 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs">
              <div className="p-2 flex items-center justify-between">
                <span className="text-zinc-300">Delete Element</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                  {project.customShortcuts?.deleteElement || 'Delete'}
                </kbd>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-zinc-300">Preview Application</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                  {project.customShortcuts?.previewApp || 'Ctrl+P'}
                </kbd>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-zinc-300">Save Project</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                  {project.customShortcuts?.saveProject || 'Ctrl+S'}
                </kbd>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="text-zinc-300">Quick Add Menu</span>
                <kbd className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                  {project.customShortcuts?.quickAdd || 'Ctrl+A'}
                </kbd>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenShortcutsModal}
              className="w-full py-2 px-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer shadow-xs active:scale-[0.98]"
              data-testid="open-shortcuts-settings-btn"
            >
              <Keyboard size={13} className="text-blue-400" />
              <span>Configure Custom Hotkeys</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-zinc-400 leading-relaxed">
            💡 Select any component on the canvas to configure its content, complete design control styles, and interactive button actions.
          </div>
        </div>
      </aside>
    );
  }

  const { props, styles, interactions = [] } = selectedElement;

  const handlePropsChange = (partial: Partial<ComponentProps>) => {
    onUpdateElement(selectedElement.id, {
      props: { ...props, ...partial },
    });
  };

  const handleStylesChange = (partial: Partial<ComponentStyles>) => {
    onUpdateElement(selectedElement.id, {
      styles: { ...styles, ...partial },
    });
  };

  // Interaction handlers
  const currentInteraction = interactions.find((i) => i.trigger === activeTrigger) || {
    id: `inter_${activeTrigger}`,
    trigger: activeTrigger,
    steps: [],
  };

  const handleAddActionStep = (type: ActionStep['type']) => {
    const newStep = createDefaultActionStep(type);
    const existingIndex = interactions.findIndex((i) => i.trigger === activeTrigger);
    let updatedInteractions = [...interactions];

    if (existingIndex >= 0) {
      updatedInteractions[existingIndex] = {
        ...updatedInteractions[existingIndex],
        steps: [...updatedInteractions[existingIndex].steps, newStep],
      };
    } else {
      updatedInteractions.push({
        id: `inter_${activeTrigger}_${Math.random().toString(36).substring(2, 6)}`,
        trigger: activeTrigger,
        steps: [newStep],
      });
    }

    onUpdateElement(selectedElement.id, { interactions: updatedInteractions });
  };

  const handleUpdateActionStep = (stepId: string, partial: Partial<ActionStep>) => {
    const updated = interactions.map((inter) => {
      if (inter.trigger !== activeTrigger) return inter;
      return {
        ...inter,
        steps: inter.steps.map((st) => (st.id === stepId ? { ...st, ...partial } : st)),
      };
    });
    onUpdateElement(selectedElement.id, { interactions: updated });
  };

  const handleDeleteActionStep = (stepId: string) => {
    const updated = interactions.map((inter) => {
      if (inter.trigger !== activeTrigger) return inter;
      return {
        ...inter,
        steps: inter.steps.filter((st) => st.id !== stepId),
      };
    });
    onUpdateElement(selectedElement.id, { interactions: updated });
  };

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0 select-none">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] uppercase font-bold shrink-0">
            {selectedElement.type}
          </span>
          <span className="text-xs font-semibold text-zinc-200 truncate">
            {selectedElement.name}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={() => onToggleVisibility(selectedElement.id)}
            title={selectedElement.hidden ? 'Show' : 'Hide'}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            {selectedElement.hidden ? <EyeOff size={13} className="text-amber-400" /> : <Eye size={13} />}
          </button>
          <button
            onClick={() => onToggleLock(selectedElement.id)}
            title={selectedElement.locked ? 'Unlock' : 'Lock'}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            {selectedElement.locked ? <Lock size={13} className="text-amber-400" /> : <Unlock size={13} />}
          </button>
          <button
            onClick={() => onDuplicateElement(selectedElement.id)}
            title="Duplicate"
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            title="Delete"
            className="p-1 text-zinc-400 hover:text-red-400 rounded"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 border-b border-zinc-800 text-[11px] font-medium text-zinc-400 bg-zinc-950">
        <button
          onClick={() => setActiveTab('props')}
          className={`py-2 flex items-center justify-center gap-1 transition cursor-pointer border-b-2 ${
            activeTab === 'props'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Sliders size={11} />
          <span>Props</span>
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`py-2 flex items-center justify-center gap-1 transition cursor-pointer border-b-2 ${
            activeTab === 'design'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Palette size={11} />
          <span>Design</span>
        </button>
        <button
          onClick={() => setActiveTab('motion')}
          className={`py-2 flex items-center justify-center gap-1 transition cursor-pointer border-b-2 ${
            activeTab === 'motion'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Film size={11} />
          <span>Motion</span>
        </button>
        <button
          onClick={() => setActiveTab('interactions')}
          className={`py-2 flex items-center justify-center gap-1 transition cursor-pointer border-b-2 ${
            activeTab === 'interactions'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Zap size={11} />
          <span>Actions</span>
        </button>
      </div>

      {/* Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= PROPS TAB ================= */}
        {activeTab === 'props' && (
          <div className="space-y-4">
            {/* Primary Text Content */}
            {(selectedElement.type === 'heading' ||
              selectedElement.type === 'text' ||
              selectedElement.type === 'button' ||
              selectedElement.type === 'card' ||
              selectedElement.type === 'badge') && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Content Text
                </label>
                <input
                  type="text"
                  value={props.text || ''}
                  onChange={(e) => handlePropsChange({ text: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            )}

            {/* Subtext */}
            {(selectedElement.type === 'heading' ||
              selectedElement.type === 'card' ||
              selectedElement.type === 'toggle') && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Subtext / Description
                </label>
                <textarea
                  rows={2}
                  value={props.subtext || ''}
                  onChange={(e) => handlePropsChange({ subtext: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>
            )}

            {/* Form Inputs (Label & Placeholder) */}
            {(selectedElement.type === 'input' ||
              selectedElement.type === 'textarea' ||
              selectedElement.type === 'select' ||
              selectedElement.type === 'toggle') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={props.label || ''}
                    onChange={(e) => handlePropsChange({ label: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
                {selectedElement.type !== 'select' && selectedElement.type !== 'toggle' && (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={props.placeholder || ''}
                      onChange={(e) => handlePropsChange({ placeholder: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Container Direction & Gap */}
            {selectedElement.type === 'container' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Layout Direction
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['column', 'row'] as const).map((dir) => (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => handlePropsChange({ direction: dir })}
                        className={`py-1.5 rounded-lg border text-xs font-mono uppercase transition cursor-pointer ${
                          (props.direction || 'column') === dir
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                    Child Element Gap
                  </label>
                  <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
                    {(['none', 'xs', 'sm', 'md', 'lg'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handlePropsChange({ gap: g })}
                        className={`py-1 rounded border uppercase transition cursor-pointer ${
                          (props.gap || 'md') === g
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metric Card */}
            {selectedElement.type === 'metric' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                    Metric Label
                  </label>
                  <input
                    type="text"
                    value={props.metricLabel || ''}
                    onChange={(e) => handlePropsChange({ metricLabel: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                    Value Display
                  </label>
                  <input
                    type="text"
                    value={props.metricValue || ''}
                    onChange={(e) => handlePropsChange({ metricValue: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                    Trend Indicator
                  </label>
                  <input
                    type="text"
                    value={props.metricTrend || ''}
                    onChange={(e) => handlePropsChange({ metricTrend: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Image Box */}
            {selectedElement.type === 'image' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                    Source URL
                  </label>
                  <input
                    type="text"
                    value={props.imageUrl || ''}
                    onChange={(e) => handlePropsChange({ imageUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-zinc-300 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={props.imageAlt || ''}
                    onChange={(e) => handlePropsChange({ imageAlt: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                  />
                </div>
              </div>
            )}

            {/* Button Size Control */}
            {selectedElement.type === 'button' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Button Size
                </label>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                  {(['sm', 'md', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handlePropsChange({ buttonSize: sz })}
                      className={`py-1.5 rounded-lg border uppercase transition cursor-pointer ${
                        (props.buttonSize || 'md') === sz
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* When Clicked / Link To - Zero-Code Action Connector */}
            {(selectedElement.type === 'button' ||
              selectedElement.type === 'card' ||
              selectedElement.type === 'badge' ||
              selectedElement.type === 'image' ||
              selectedElement.type === 'heading') && (
              <div className="pt-3 border-t border-zinc-800 space-y-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                    <Link size={13} className="text-blue-400" />
                    <span>When Clicked / Link To</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">Click interaction</span>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                    Action Type
                  </label>
                  <select
                    value={props.whenClicked || 'none'}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      const updatedProps = { ...props, whenClicked: val };

                      // Auto-sync with interaction steps
                      const existingInteractions = (selectedElement.interactions || []).filter(i => i.trigger !== 'onClick');
                      let newClickInter: ComponentInteraction | null = null;

                      if (val === 'openPage') {
                        const targetPage = project.pages.find(p => p.id !== activePage.id) || project.pages[0];
                        updatedProps.targetPageId = updatedProps.targetPageId || targetPage?.id || '';
                        newClickInter = {
                          id: 'inter_click_' + Math.random().toString(36).substring(2, 7),
                          trigger: 'onClick',
                          steps: [{
                            id: 'step_nav_' + Math.random().toString(36).substring(2, 7),
                            type: 'navigate',
                            targetPageId: updatedProps.targetPageId,
                          }],
                        };
                      } else if (val === 'openUrl') {
                        updatedProps.targetUrl = updatedProps.targetUrl || 'https://';
                        newClickInter = {
                          id: 'inter_click_' + Math.random().toString(36).substring(2, 7),
                          trigger: 'onClick',
                          steps: [{
                            id: 'step_url_' + Math.random().toString(36).substring(2, 7),
                            type: 'toast',
                            toastMessage: 'Opening external web link...',
                            toastType: 'info',
                          }],
                        };
                      } else if (val === 'showPopup') {
                        updatedProps.popupTitle = updatedProps.popupTitle || 'Information Dialog';
                        updatedProps.popupContent = updatedProps.popupContent || 'Action completed via AppForge!';
                        newClickInter = {
                          id: 'inter_click_' + Math.random().toString(36).substring(2, 7),
                          trigger: 'onClick',
                          steps: [{
                            id: 'step_modal_' + Math.random().toString(36).substring(2, 7),
                            type: 'openModal',
                            modalTitle: updatedProps.popupTitle,
                            modalContent: updatedProps.popupContent,
                          }],
                        };
                      } else if (val === 'showToast') {
                        updatedProps.toastMessage = updatedProps.toastMessage || 'Action successful!';
                        newClickInter = {
                          id: 'inter_click_' + Math.random().toString(36).substring(2, 7),
                          trigger: 'onClick',
                          steps: [{
                            id: 'step_toast_' + Math.random().toString(36).substring(2, 7),
                            type: 'toast',
                            toastMessage: updatedProps.toastMessage,
                            toastType: 'success',
                          }],
                        };
                      } else if (val === 'submitForm') {
                        newClickInter = {
                          id: 'inter_click_' + Math.random().toString(36).substring(2, 7),
                          trigger: 'onClick',
                          steps: [{
                            id: 'step_sub_' + Math.random().toString(36).substring(2, 7),
                            type: 'submitForm',
                            toastMessage: 'Form submitted successfully!',
                          }],
                        };
                      }

                      onUpdateElement(selectedElement.id, {
                        props: updatedProps,
                        interactions: newClickInter ? [...existingInteractions, newClickInter] : existingInteractions,
                      });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="none">None (Standard Element)</option>
                    <option value="openPage">Open Page (Navigate to Screen)</option>
                    <option value="openUrl">Open External Website</option>
                    <option value="showPopup">Show Popup (Modal Dialog)</option>
                    <option value="showToast">Show Notification (Toast)</option>
                    <option value="submitForm">Submit Form</option>
                  </select>
                </div>

                {/* Sub-options based on whenClicked */}
                {props.whenClicked === 'openPage' && (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                      Destination Page
                    </label>
                    <select
                      value={props.targetPageId || ''}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        const updatedProps = { ...props, targetPageId: targetId };
                        // Sync with interactions onClick navigate step
                        const existingInteractions = (selectedElement.interactions || []).filter(i => i.trigger !== 'onClick');
                        const newInter: ComponentInteraction = {
                          id: 'inter_click_' + Math.random().toString(36).substring(2, 7),
                          trigger: 'onClick',
                          steps: [{
                            id: 'step_nav_' + Math.random().toString(36).substring(2, 7),
                            type: 'navigate',
                            targetPageId: targetId,
                          }],
                        };
                        onUpdateElement(selectedElement.id, {
                          props: updatedProps,
                          interactions: [...existingInteractions, newInter],
                        });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Select Destination Screen --</option>
                      {project.pages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.id === project.homePageId ? '(Starting Screen)' : ''} {p.id === activePage.id ? '(Current Screen)' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Broken link warning */}
                    {props.targetPageId && !project.pages.some(p => p.id === props.targetPageId) && (
                      <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] flex items-center gap-1.5">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>Warning: Selected screen no longer exists. Please re-select a destination.</span>
                      </div>
                    )}
                  </div>
                )}

                {props.whenClicked === 'openUrl' && (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={props.targetUrl || ''}
                      placeholder="https://example.com"
                      onChange={(e) => handlePropsChange({ targetUrl: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                )}

                {props.whenClicked === 'showPopup' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                        Popup Title
                      </label>
                      <input
                        type="text"
                        value={props.popupTitle || ''}
                        placeholder="Notice or Title"
                        onChange={(e) => handlePropsChange({ popupTitle: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                        Popup Message
                      </label>
                      <textarea
                        rows={2}
                        value={props.popupContent || ''}
                        placeholder="Details displayed in the popup modal..."
                        onChange={(e) => handlePropsChange({ popupContent: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                )}

                {props.whenClicked === 'showToast' && (
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                      Notification Message
                    </label>
                    <input
                      type="text"
                      value={props.toastMessage || ''}
                      placeholder="e.g. Profile updated successfully!"
                      onChange={(e) => handlePropsChange({ toastMessage: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= COMPLETE DESIGN CONTROL TAB ================= */}
        {activeTab === 'design' && (
          <div className="space-y-5">
            {/* 1. Sizing & Dimensions */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 block mb-2">
                Dimensions & Sizing
              </span>
              <div className="space-y-2.5">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Width</span>
                  <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                    {[
                      { id: 'full', label: '100%' },
                      { id: 'auto', label: 'Auto' },
                      { id: 'half', label: '50%' },
                      { id: 'third', label: '33%' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => handleStylesChange({ width: w.id as any })}
                        className={`py-1 rounded border transition cursor-pointer ${
                          styles.width === w.id || (!styles.width && w.id === 'full')
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Height</span>
                  <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                    {[
                      { id: 'auto', label: 'Auto' },
                      { id: 'sm', label: 'Small' },
                      { id: 'md', label: 'Medium' },
                      { id: 'lg', label: 'Large' },
                    ].map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleStylesChange({ height: h.id as any })}
                        className={`py-1 rounded border transition cursor-pointer ${
                          styles.height === h.id || (!styles.height && h.id === 'auto')
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Colors, Gradients & Opacity */}
            <div className="pt-3 border-t border-zinc-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 block mb-2">
                Colors & Backgrounds
              </span>

              {/* Background Color */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-300">
                  <span>Background Color</span>
                  <input
                    type="text"
                    value={styles.backgroundColor || '#18181b'}
                    onChange={(e) => handleStylesChange({ backgroundColor: e.target.value })}
                    className="w-20 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white font-mono text-right"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.backgroundColor || '#18181b'}
                    onChange={(e) => handleStylesChange({ backgroundColor: e.target.value })}
                    className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer p-0.5 shrink-0"
                  />
                  <div className="flex flex-wrap gap-1 flex-1">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleStylesChange({ backgroundColor: c })}
                        style={{ backgroundColor: c }}
                        className="w-4 h-4 rounded border border-zinc-700 hover:scale-110 transition cursor-pointer"
                      />
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div className="flex items-center justify-between text-[11px] text-zinc-300 pt-1">
                  <span>Text Color</span>
                  <input
                    type="text"
                    value={styles.textColor || '#ffffff'}
                    onChange={(e) => handleStylesChange({ textColor: e.target.value })}
                    className="w-20 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white font-mono text-right"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={styles.textColor || '#ffffff'}
                    onChange={(e) => handleStylesChange({ textColor: e.target.value })}
                    className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer p-0.5 shrink-0"
                  />
                  <div className="flex flex-wrap gap-1 flex-1">
                    {colorPresets.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleStylesChange({ textColor: c })}
                        style={{ backgroundColor: c }}
                        className="w-4 h-4 rounded border border-zinc-700 hover:scale-110 transition cursor-pointer"
                      />
                    ))}
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-zinc-300 mb-1">
                    <span>Opacity</span>
                    <span className="font-mono text-zinc-400">{styles.opacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={styles.opacity ?? 100}
                    onChange={(e) => handleStylesChange({ opacity: Number(e.target.value) })}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 3. Typography */}
            <div className="pt-3 border-t border-zinc-800">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 block mb-2">
                Typography
              </span>
              <div className="space-y-2.5">
                {/* Font Family */}
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Font Family</span>
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    {(['sans', 'mono', 'serif', 'display'] as const).map((fam) => (
                      <button
                        key={fam}
                        type="button"
                        onClick={() => handleStylesChange({ fontFamily: fam })}
                        className={`py-1 rounded border capitalize transition cursor-pointer ${
                          (styles.fontFamily || 'sans') === fam
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {fam}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono block mb-1">Font Size</span>
                  <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                    {(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleStylesChange({ fontSize: sz })}
                        className={`py-1 rounded border transition cursor-pointer ${
                          styles.fontSize === sz
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-1 pt-1">
                  {[
                    { id: 'left', icon: AlignLeft },
                    { id: 'center', icon: AlignCenter },
                    { id: 'right', icon: AlignRight },
                    { id: 'justify', icon: AlignJustify },
                  ].map((al) => {
                    const Icon = al.icon;
                    return (
                      <button
                        key={al.id}
                        type="button"
                        onClick={() => handleStylesChange({ textAlign: al.id as any })}
                        className={`flex-1 py-1.5 flex items-center justify-center rounded border transition cursor-pointer ${
                          (styles.textAlign || 'left') === al.id
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        <Icon size={13} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Spacing (Padding & Margin) */}
            <div className="pt-3 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                  Spacing & Layout
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleStylesChange({
                      paddingMode: styles.paddingMode === 'individual' ? 'linked' : 'individual',
                    })
                  }
                  className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
                >
                  {styles.paddingMode === 'individual' ? <Unlink size={11} /> : <Link size={11} />}
                  <span>{styles.paddingMode === 'individual' ? '4 Sides' : 'Linked'}</span>
                </button>
              </div>

              {styles.paddingMode === 'individual' ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono">Padding Top</span>
                    <input
                      type="text"
                      placeholder="16px"
                      value={styles.paddingTop || ''}
                      onChange={(e) => handleStylesChange({ paddingTop: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono">Padding Right</span>
                    <input
                      type="text"
                      placeholder="16px"
                      value={styles.paddingRight || ''}
                      onChange={(e) => handleStylesChange({ paddingRight: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono">Padding Bottom</span>
                    <input
                      type="text"
                      placeholder="16px"
                      value={styles.paddingBottom || ''}
                      onChange={(e) => handleStylesChange({ paddingBottom: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono">Padding Left</span>
                    <input
                      type="text"
                      placeholder="16px"
                      value={styles.paddingLeft || ''}
                      onChange={(e) => handleStylesChange({ paddingLeft: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-1 font-mono text-[10px]">
                  {(['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const).map((pad) => (
                    <button
                      key={pad}
                      type="button"
                      onClick={() => handleStylesChange({ padding: pad })}
                      className={`py-1 rounded border uppercase transition cursor-pointer ${
                        (styles.padding || 'md') === pad
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {pad}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Borders & Radius */}
            <div className="pt-3 border-t border-zinc-800 space-y-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 block">
                Borders & Radii
              </span>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Width</span>
                  <select
                    value={styles.borderWidth || '1px'}
                    onChange={(e) => handleStylesChange({ borderWidth: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                  >
                    <option value="none">None</option>
                    <option value="1px">1px</option>
                    <option value="2px">2px</option>
                    <option value="4px">4px</option>
                  </select>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Style</span>
                  <select
                    value={styles.borderStyle || 'solid'}
                    onChange={(e) => handleStylesChange({ borderStyle: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono block mb-1">Corner Radius</span>
                <div className="grid grid-cols-5 gap-1 font-mono text-[10px]">
                  {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleStylesChange({ borderRadius: r })}
                      className={`py-1 rounded border uppercase transition cursor-pointer ${
                        (styles.borderRadius || 'md') === r
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Shadows, Effects & Animations */}
            <div className="pt-3 border-t border-zinc-800 space-y-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400 block">
                Shadows & Motion
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Shadow</span>
                  <select
                    value={styles.shadow || 'none'}
                    onChange={(e) => handleStylesChange({ shadow: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Elevated</option>
                    <option value="glow-blue">Blue Glow</option>
                    <option value="glow-emerald">Emerald Glow</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">Hover Animation</span>
                  <select
                    value={styles.animationHover || 'none'}
                    onChange={(e) => handleStylesChange({ animationHover: e.target.value as any })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                  >
                    <option value="none">None</option>
                    <option value="lift">Lift Up</option>
                    <option value="scale">Scale Up</option>
                    <option value="glow">Glow</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MOTION & ANIMATIONS TAB ================= */}
        {activeTab === 'motion' && (
          <div className="space-y-4">
            {/* Header & Live Motion Test Bar */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Film size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-white">CSS Motion Engine</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleStylesChange({
                        motion: {
                          effect: 'none',
                          duration: 400,
                          easing: 'ease-out',
                          delay: 0,
                          trigger: 'onMount',
                          iterationCount: '1',
                        },
                      });
                    }}
                    title="Reset to default"
                    className="p-1 text-zinc-400 hover:text-zinc-200 text-[10px] flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800"
                  >
                    <RotateCcw size={10} />
                    <span>Reset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTestingMotion(false);
                      setTimeout(() => {
                        setIsTestingMotion(true);
                        setTimeout(() => {
                          setIsTestingMotion(false);
                        }, (styles.motion?.duration || 400) + (styles.motion?.delay || 0) + 200);
                      }, 20);
                    }}
                    className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow transition cursor-pointer"
                  >
                    <Play size={11} fill="currentColor" />
                    <span>Test Motion</span>
                  </button>
                </div>
              </div>

              {/* Interactive Preview Canvas Box */}
              <div className="h-20 bg-zinc-950/80 border border-zinc-800/80 rounded-lg flex items-center justify-center overflow-hidden relative">
                <div className="absolute top-1.5 left-2 text-[9px] font-mono text-zinc-500 uppercase">
                  Live Preview
                </div>
                <div
                  key={isTestingMotion ? 'active-test' : 'idle-test'}
                  style={{
                    animation: (styles.motion?.effect && styles.motion.effect !== 'none')
                      ? `appforge-${styles.motion.effect} ${styles.motion.duration || 400}ms ${
                          styles.motion.easing === 'bounce'
                            ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                            : styles.motion.easing || 'ease-out'
                        } ${styles.motion.delay || 0}ms ${
                          styles.motion.trigger === 'infinite' ? 'infinite' : (styles.motion.iterationCount || '1')
                        } both`
                      : 'none',
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-md border border-blue-400/30 flex items-center gap-1.5 select-none"
                >
                  <Activity size={12} />
                  <span>{selectedElement.name}</span>
                </div>
              </div>
            </div>

            {/* 1. Predefined Entrance & Exit Animation Presets with Grouped Pairs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                  Animation Presets
                </label>
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className="text-zinc-500">Active:</span>
                  <span className={`px-1.5 py-0.5 rounded uppercase font-semibold ${
                    styles.motion?.effect && styles.motion.effect !== 'none'
                      ? styles.motion.effect.includes('out')
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : ['pulse', 'bounce', 'rotate', 'flip'].includes(styles.motion.effect)
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {styles.motion?.effect || 'none'}
                  </span>
                </div>
              </div>

              {/* View Selector Tabs */}
              <div className="grid grid-cols-5 gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setPresetCategory('pairs')}
                  className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    presetCategory === 'pairs'
                      ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Grouped related Entrance & Exit pairs"
                >
                  <ArrowRightLeft size={11} className="shrink-0" />
                  <span className="truncate">Pairs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategory('all')}
                  className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    presetCategory === 'all'
                      ? 'bg-zinc-700/50 border border-zinc-600 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="View all clearly labeled sections"
                >
                  <span>All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategory('entrance')}
                  className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    presetCategory === 'entrance'
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Entrance presets only"
                >
                  <LogIn size={11} className="text-emerald-400 shrink-0" />
                  <span className="truncate">In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategory('exit')}
                  className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    presetCategory === 'exit'
                      ? 'bg-rose-600/20 border border-rose-500/40 text-rose-300 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Exit presets only"
                >
                  <LogOut size={11} className="text-rose-400 shrink-0" />
                  <span className="truncate">Out</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPresetCategory('emphasis')}
                  className={`py-1 px-1 rounded-lg flex items-center justify-center gap-1 transition cursor-pointer ${
                    presetCategory === 'emphasis'
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Loop & Continuous presets"
                >
                  <Sparkles size={11} className="text-indigo-400 shrink-0" />
                  <span className="truncate">Loop</span>
                </button>
              </div>

              {/* SECTION: GROUPED RELATED ANIMATION PAIRS (Fade In ⇄ Fade Out, Slide Up ⇄ Slide Up Out, etc.) */}
              {presetCategory === 'pairs' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono px-0.5">
                    <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                      <ArrowRightLeft size={10} className="text-blue-400" />
                      Related Motion Pairs
                    </span>
                    <span className="text-zinc-500">Entrance (In) vs Exit (Out)</span>
                  </div>

                  <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
                    {[
                      {
                        family: 'Fade (Opacity)',
                        in: { id: 'fade-in', name: 'Fade In', desc: '0 → 1', dur: 400, eas: 'ease-out' as const, cat: 'entrance' as const },
                        out: { id: 'fade-out', name: 'Fade Out', desc: '1 → 0', dur: 400, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                      {
                        family: 'Slide Up (Vertical)',
                        in: { id: 'slide-up', name: 'Slide Up', desc: '+28px → 0', dur: 450, eas: 'ease-out' as const, cat: 'entrance' as const },
                        out: { id: 'slide-up-out', name: 'Slide Up Out', desc: '0 → -28px', dur: 400, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                      {
                        family: 'Zoom (Scale)',
                        in: { id: 'zoom-in', name: 'Zoom In', desc: '0.65 → 1', dur: 400, eas: 'ease-out' as const, cat: 'entrance' as const },
                        out: { id: 'zoom-out', name: 'Zoom Out', desc: '1 → 0.65', dur: 400, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                      {
                        family: 'Slide Down (Vertical)',
                        in: { id: 'slide-down', name: 'Slide Down', desc: '-28px → 0', dur: 450, eas: 'ease-out' as const, cat: 'entrance' as const },
                        out: { id: 'slide-down-out', name: 'Slide Down Out', desc: '0 → +28px', dur: 400, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                      {
                        family: 'Slide Left (Horizontal)',
                        in: { id: 'slide-left', name: 'Slide Left', desc: '+28px → 0', dur: 450, eas: 'ease-out' as const, cat: 'entrance' as const },
                        out: { id: 'slide-left-out', name: 'Slide Left Out', desc: '0 → -28px', dur: 400, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                      {
                        family: 'Slide Right (Horizontal)',
                        in: { id: 'slide-right', name: 'Slide Right', desc: '-28px → 0', dur: 450, eas: 'ease-out' as const, cat: 'entrance' as const },
                        out: { id: 'slide-right-out', name: 'Slide Right Out', desc: '0 → +28px', dur: 400, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                      {
                        family: 'Bounce (Elastic Spring)',
                        in: { id: 'bounce-in', name: 'Bounce In', desc: 'Spring Pop', dur: 600, eas: 'bounce' as const, cat: 'entrance' as const },
                        out: { id: 'bounce-out', name: 'Bounce Out', desc: 'Pop & Drop', dur: 500, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                      {
                        family: '3D Flip (Perspective)',
                        in: { id: 'flip-in', name: 'Flip In', desc: 'Y Turn In', dur: 500, eas: 'ease-out' as const, cat: 'entrance' as const },
                        out: { id: 'flip-out', name: 'Flip Out', desc: 'Y Turn Out', dur: 450, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                      {
                        family: 'Rotate (Spin Angle)',
                        in: { id: 'rotate-in', name: 'Rotate In', desc: '-180° In', dur: 500, eas: 'ease-out' as const, cat: 'entrance' as const },
                        out: { id: 'rotate-out', name: 'Rotate Out', desc: '+180° Out', dur: 500, eas: 'ease-in' as const, cat: 'exit' as const },
                      },
                    ].map((pair) => {
                      const isInSelected = (styles.motion?.effect === pair.in.id) ||
                        (pair.in.id === 'fade-in' && styles.motion?.effect === 'fade') ||
                        (pair.in.id === 'zoom-in' && styles.motion?.effect === 'scale');
                      const isOutSelected = styles.motion?.effect === pair.out.id;

                      return (
                        <div
                          key={pair.family}
                          className="p-1.5 rounded-lg border border-zinc-800/90 bg-zinc-900/50 hover:border-zinc-700/80 transition space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] px-1 font-mono text-zinc-400">
                            <span className="font-semibold text-zinc-300">{pair.family}</span>
                            <span className="text-[9px] text-zinc-500">Pair Selection</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            {/* Entrance half */}
                            <button
                              type="button"
                              onClick={() => {
                                const current = styles.motion || {
                                  effect: 'none',
                                  duration: 400,
                                  easing: 'ease-out',
                                  delay: 0,
                                  trigger: 'onMount',
                                  iterationCount: '1',
                                };
                                handleStylesChange({
                                  motion: {
                                    ...current,
                                    effect: pair.in.id as MotionEffect,
                                    duration: pair.in.dur,
                                    easing: pair.in.eas,
                                    trigger: 'onMount',
                                    iterationCount: '1',
                                  },
                                });
                                setIsTestingMotion(false);
                                setTimeout(() => {
                                  setIsTestingMotion(true);
                                  setTimeout(() => setIsTestingMotion(false), pair.in.dur + (current.delay || 0) + 150);
                                }, 20);
                              }}
                              className={`p-1.5 rounded-md border text-left transition cursor-pointer flex items-center justify-between ${
                                isInSelected
                                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <div className="truncate">
                                <div className="text-[10px] font-semibold flex items-center gap-1">
                                  <LogIn size={9} className="text-emerald-400 shrink-0" />
                                  <span className="truncate">{pair.in.name}</span>
                                </div>
                                <span className="text-[8.5px] text-zinc-500 block truncate">{pair.in.desc}</span>
                              </div>
                              <span className="text-[8px] font-mono text-emerald-400/80 shrink-0 ml-1">IN</span>
                            </button>

                            {/* Exit half */}
                            <button
                              type="button"
                              onClick={() => {
                                const current = styles.motion || {
                                  effect: 'none',
                                  duration: 400,
                                  easing: 'ease-in',
                                  delay: 0,
                                  trigger: 'onMount',
                                  iterationCount: '1',
                                };
                                handleStylesChange({
                                  motion: {
                                    ...current,
                                    effect: pair.out.id as MotionEffect,
                                    duration: pair.out.dur,
                                    easing: pair.out.eas,
                                    trigger: current.trigger || 'onMount',
                                    iterationCount: '1',
                                  },
                                });
                                setIsTestingMotion(false);
                                setTimeout(() => {
                                  setIsTestingMotion(true);
                                  setTimeout(() => setIsTestingMotion(false), pair.out.dur + (current.delay || 0) + 150);
                                }, 20);
                              }}
                              className={`p-1.5 rounded-md border text-left transition cursor-pointer flex items-center justify-between ${
                                isOutSelected
                                  ? 'border-rose-500 bg-rose-500/20 text-rose-300 font-semibold shadow-sm'
                                  : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}
                            >
                              <div className="truncate">
                                <div className="text-[10px] font-semibold flex items-center gap-1">
                                  <LogOut size={9} className="text-rose-400 shrink-0" />
                                  <span className="truncate">{pair.out.name}</span>
                                </div>
                                <span className="text-[8.5px] text-zinc-500 block truncate">{pair.out.desc}</span>
                              </div>
                              <span className="text-[8px] font-mono text-rose-400/80 shrink-0 ml-1">OUT</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CLEARLY LABELED SECTION: ENTRANCE PRESETS */}
              {(presetCategory === 'all' || presetCategory === 'entrance') && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <LogIn size={11} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-300 block leading-tight">
                          Entrance Presets
                        </span>
                        <span className="text-[9px] text-emerald-400/70 font-mono block">
                          Plays on page load / element mount
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      9 Presets
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                    {[
                      { id: 'fade-in', name: 'Fade In', desc: 'Opacity 0 → 1', dur: 400, eas: 'ease-out' as const },
                      { id: 'zoom-in', name: 'Zoom In', desc: 'Scale 0.65 → 1', dur: 400, eas: 'ease-out' as const },
                      { id: 'slide-up', name: 'Slide Up', desc: 'Y: +28px → 0', dur: 450, eas: 'ease-out' as const },
                      { id: 'slide-down', name: 'Slide Down', desc: 'Y: -28px → 0', dur: 450, eas: 'ease-out' as const },
                      { id: 'slide-left', name: 'Slide Left', desc: 'X: +28px → 0', dur: 450, eas: 'ease-out' as const },
                      { id: 'slide-right', name: 'Slide Right', desc: 'X: -28px → 0', dur: 450, eas: 'ease-out' as const },
                      { id: 'bounce-in', name: 'Bounce In', desc: 'Spring pop-in', dur: 600, eas: 'bounce' as const },
                      { id: 'flip-in', name: 'Flip In', desc: '3D Y-axis flip', dur: 500, eas: 'ease-out' as const },
                      { id: 'rotate-in', name: 'Rotate In', desc: 'Spin -180° into place', dur: 500, eas: 'ease-out' as const },
                    ].map((p) => {
                      const isSelected = (styles.motion?.effect === p.id) || 
                        (p.id === 'fade-in' && styles.motion?.effect === 'fade') ||
                        (p.id === 'zoom-in' && styles.motion?.effect === 'scale');
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const current = styles.motion || {
                              effect: 'none',
                              duration: 400,
                              easing: 'ease-out',
                              delay: 0,
                              trigger: 'onMount',
                              iterationCount: '1',
                            };
                            handleStylesChange({
                              motion: {
                                ...current,
                                effect: p.id as MotionEffect,
                                duration: p.dur,
                                easing: p.eas,
                                trigger: 'onMount',
                                iterationCount: '1',
                              },
                            });
                            setIsTestingMotion(false);
                            setTimeout(() => {
                              setIsTestingMotion(true);
                              setTimeout(() => setIsTestingMotion(false), p.dur + (current.delay || 0) + 150);
                            }, 20);
                          }}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] truncate font-semibold">{p.name}</span>
                            <LogIn size={10} className="text-emerald-400 opacity-80 shrink-0" />
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1 truncate">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CLEARLY LABELED SECTION: EXIT PRESETS */}
              {(presetCategory === 'all' || presetCategory === 'exit') && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-950/30 border border-rose-500/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                        <LogOut size={11} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-rose-300 block leading-tight">
                          Exit Presets
                        </span>
                        <span className="text-[9px] text-rose-400/70 font-mono block">
                          Plays on dismissal / click / removal
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                      9 Presets
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                    {[
                      { id: 'fade-out', name: 'Fade Out', desc: 'Opacity 1 → 0', dur: 400, eas: 'ease-in' as const },
                      { id: 'zoom-out', name: 'Zoom Out', desc: 'Scale 1 → 0.65', dur: 400, eas: 'ease-in' as const },
                      { id: 'slide-up-out', name: 'Slide Up Out', desc: 'Y: 0 → -28px', dur: 400, eas: 'ease-in' as const },
                      { id: 'slide-down-out', name: 'Slide Down Out', desc: 'Y: 0 → +28px', dur: 400, eas: 'ease-in' as const },
                      { id: 'slide-left-out', name: 'Slide Left Out', desc: 'X: 0 → -28px', dur: 400, eas: 'ease-in' as const },
                      { id: 'slide-right-out', name: 'Slide Right Out', desc: 'X: 0 → +28px', dur: 400, eas: 'ease-in' as const },
                      { id: 'bounce-out', name: 'Bounce Out', desc: 'Pop up & drop away', dur: 500, eas: 'ease-in' as const },
                      { id: 'flip-out', name: 'Flip Out', desc: '3D Y-axis turn out', dur: 450, eas: 'ease-in' as const },
                      { id: 'rotate-out', name: 'Rotate Out', desc: 'Spin out +180°', dur: 500, eas: 'ease-in' as const },
                    ].map((p) => {
                      const isSelected = styles.motion?.effect === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const current = styles.motion || {
                              effect: 'none',
                              duration: 400,
                              easing: 'ease-in',
                              delay: 0,
                              trigger: 'onMount',
                              iterationCount: '1',
                            };
                            handleStylesChange({
                              motion: {
                                ...current,
                                effect: p.id as MotionEffect,
                                duration: p.dur,
                                easing: p.eas,
                                trigger: current.trigger || 'onMount',
                                iterationCount: '1',
                              },
                            });
                            setIsTestingMotion(false);
                            setTimeout(() => {
                              setIsTestingMotion(true);
                              setTimeout(() => setIsTestingMotion(false), p.dur + (current.delay || 0) + 150);
                            }, 20);
                          }}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-rose-500 bg-rose-500/20 text-rose-300 font-semibold shadow-sm'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] truncate font-semibold">{p.name}</span>
                            <LogOut size={10} className="text-rose-400 opacity-80 shrink-0" />
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1 truncate">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CLEARLY LABELED SECTION: LOOP & EMPHASIS PRESETS */}
              {(presetCategory === 'all' || presetCategory === 'emphasis') && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Sparkles size={11} />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-indigo-300 block leading-tight">
                          Loop & Emphasis
                        </span>
                        <span className="text-[9px] text-indigo-400/70 font-mono block">
                          Continuous ambient animations
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                      5 Presets
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                    {[
                      { id: 'pulse', name: 'Pulse', desc: 'Heartbeat glow', dur: 800, eas: 'ease-in-out' as const },
                      { id: 'bounce', name: 'Bounce Loop', desc: 'Elastic vertical jump', dur: 900, eas: 'bounce' as const },
                      { id: 'rotate', name: 'Spin 360°', desc: 'Continuous rotation', dur: 1200, eas: 'linear' as const },
                      { id: 'flip', name: 'Flip Loop', desc: '3D Perspective flip', dur: 1000, eas: 'ease-in-out' as const },
                      { id: 'none', name: 'None', desc: 'Static (No Motion)', dur: 400, eas: 'ease-out' as const },
                    ].map((p) => {
                      const isSelected = styles.motion?.effect === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const current = styles.motion || {
                              effect: 'none',
                              duration: 400,
                              easing: 'ease-out',
                              delay: 0,
                              trigger: 'infinite',
                              iterationCount: 'infinite',
                            };
                            handleStylesChange({
                              motion: {
                                ...current,
                                effect: p.id as MotionEffect,
                                duration: p.dur,
                                easing: p.eas,
                                trigger: p.id === 'none' ? 'onMount' : 'infinite',
                                iterationCount: p.id === 'none' ? '1' : 'infinite',
                              },
                            });
                            setIsTestingMotion(false);
                            setTimeout(() => {
                              setIsTestingMotion(true);
                              setTimeout(() => setIsTestingMotion(false), p.dur + (current.delay || 0) + 150);
                            }, 20);
                          }}
                          className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-semibold shadow-sm'
                              : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] truncate font-semibold">{p.name}</span>
                            <Sparkles size={10} className="text-indigo-400 opacity-80 shrink-0" />
                          </div>
                          <span className="text-[9px] text-zinc-500 mt-1 truncate">{p.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Duration Slider & Presets */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
                  <Clock size={11} className="text-blue-400" />
                  <span>Duration</span>
                </label>
                <span className="text-xs font-mono font-bold text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  {styles.motion?.duration ?? 400} ms
                </span>
              </div>

              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={styles.motion?.duration ?? 400}
                onChange={(e) => {
                  const current = styles.motion || {
                    effect: 'fade',
                    duration: 400,
                    easing: 'ease-out',
                    delay: 0,
                    trigger: 'onMount',
                    iterationCount: '1',
                  };
                  handleStylesChange({
                    motion: { ...current, duration: Number(e.target.value) },
                  });
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Fast (100ms)</span>
                <span>Normal (400ms)</span>
                <span>Slow (3000ms)</span>
              </div>

              {/* Quick preset chips */}
              <div className="grid grid-cols-4 gap-1 pt-1 font-mono text-[10px]">
                {[150, 300, 600, 1200].map((ms) => (
                  <button
                    key={ms}
                    type="button"
                    onClick={() => {
                      const current = styles.motion || {
                        effect: 'fade',
                        duration: 400,
                        easing: 'ease-out',
                        delay: 0,
                        trigger: 'onMount',
                        iterationCount: '1',
                      };
                      handleStylesChange({
                        motion: { ...current, duration: ms },
                      });
                    }}
                    className={`py-1 rounded border transition ${
                      (styles.motion?.duration ?? 400) === ms
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {ms}ms
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Easing Function */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                  Easing & Timing
                </label>
                <span className="text-[10px] font-mono text-zinc-400 capitalize">
                  {styles.motion?.easing || 'ease-out'}
                </span>
              </div>

              <select
                value={styles.motion?.easing || 'ease-out'}
                onChange={(e) => {
                  const current = styles.motion || {
                    effect: 'fade',
                    duration: 400,
                    easing: 'ease-out',
                    delay: 0,
                    trigger: 'onMount',
                    iterationCount: '1',
                  };
                  handleStylesChange({
                    motion: { ...current, easing: e.target.value as MotionEasing },
                  });
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="ease-out">ease-out (Smooth deceleration, natural entrance)</option>
                <option value="ease-in">ease-in (Acceleration from rest)</option>
                <option value="ease-in-out">ease-in-out (Accelerate and decelerate)</option>
                <option value="ease">ease (General purpose)</option>
                <option value="linear">linear (Uniform mechanical speed)</option>
                <option value="bounce">bounce (Elastic spring physics)</option>
              </select>

              <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
                {(['ease-out', 'linear', 'bounce'] as const).map((eas) => (
                  <button
                    key={eas}
                    type="button"
                    onClick={() => {
                      const current = styles.motion || {
                        effect: 'fade',
                        duration: 400,
                        easing: 'ease-out',
                        delay: 0,
                        trigger: 'onMount',
                        iterationCount: '1',
                      };
                      handleStylesChange({
                        motion: { ...current, easing: eas },
                      });
                    }}
                    className={`py-1 rounded border transition ${
                      (styles.motion?.easing || 'ease-out') === eas
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {eas}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Delay Slider */}
            <div className="pt-3 border-t border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                  Delay Before Start
                </label>
                <span className="text-xs font-mono font-bold text-white bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                  {styles.motion?.delay ?? 0} ms
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={styles.motion?.delay ?? 0}
                onChange={(e) => {
                  const current = styles.motion || {
                    effect: 'fade',
                    duration: 400,
                    easing: 'ease-out',
                    delay: 0,
                    trigger: 'onMount',
                    iterationCount: '1',
                  };
                  handleStylesChange({
                    motion: { ...current, delay: Number(e.target.value) },
                  });
                }}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                {[0, 100, 250, 500].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const current = styles.motion || {
                        effect: 'fade',
                        duration: 400,
                        easing: 'ease-out',
                        delay: 0,
                        trigger: 'onMount',
                        iterationCount: '1',
                      };
                      handleStylesChange({
                        motion: { ...current, delay: d },
                      });
                    }}
                    className={`py-1 rounded border transition ${
                      (styles.motion?.delay ?? 0) === d
                        ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {d}ms
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Trigger & Repetition */}
            <div className="pt-3 border-t border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 block">
                  Animation Event Trigger
                </label>
                <span className="text-[10px] font-mono text-blue-400 capitalize">
                  {styles.motion?.trigger === 'onMount' ? 'On Load' : styles.motion?.trigger === 'onHover' ? 'On Hover' : styles.motion?.trigger === 'onClick' ? 'On Click' : 'Continuous Loop'}
                </span>
              </div>

              {/* Dropdown Selector for Trigger */}
              <select
                value={styles.motion?.trigger || 'onMount'}
                onChange={(e) => {
                  const newTrigger = e.target.value as 'onMount' | 'onHover' | 'onClick' | 'infinite';
                  const current = styles.motion || {
                    effect: 'fade',
                    duration: 400,
                    easing: 'ease-out',
                    delay: 0,
                    trigger: 'onMount',
                    iterationCount: '1',
                  };
                  const updatedMotion = { ...current, trigger: newTrigger };
                  handleStylesChange({ motion: updatedMotion });

                  // Update element's interaction logic accordingly if On Click is selected
                  if (newTrigger === 'onClick') {
                    const existing = selectedElement.interactions || [];
                    const hasClick = existing.some((i) => i.trigger === 'onClick');
                    if (!hasClick) {
                      const newInter: ComponentInteraction = {
                        id: 'inter_motion_' + Math.random().toString(36).substring(2, 7),
                        trigger: 'onClick',
                        steps: [{
                          id: 'step_anim_' + Math.random().toString(36).substring(2, 7),
                          type: 'toast',
                          toastMessage: `${selectedElement.name} animated on click (${updatedMotion.effect})`,
                          toastType: 'info',
                        }],
                      };
                      onUpdateElement(selectedElement.id, {
                        styles: { ...selectedElement.styles, motion: updatedMotion },
                        interactions: [...existing, newInter],
                      });
                    }
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="onMount">On Load (When screen opens)</option>
                <option value="onHover">On Hover (When mouse enters)</option>
                <option value="onClick">On Click (When user clicks)</option>
                <option value="infinite">Continuous Loop (Always animating)</option>
              </select>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {([
                  { id: 'onMount', label: 'On Load', desc: 'When page opens' },
                  { id: 'onHover', label: 'On Hover', desc: 'When mouse enters' },
                  { id: 'onClick', label: 'On Click', desc: 'When clicked' },
                  { id: 'infinite', label: 'Loop Always', desc: 'Continuous loop' },
                ] as const).map((tr) => {
                  const isSelected = (styles.motion?.trigger || 'onMount') === tr.id;
                  return (
                    <button
                      key={tr.id}
                      type="button"
                      onClick={() => {
                        const current = styles.motion || {
                          effect: 'fade',
                          duration: 400,
                          easing: 'ease-out',
                          delay: 0,
                          trigger: 'onMount',
                          iterationCount: '1',
                        };
                        const updatedMotion = { ...current, trigger: tr.id };
                        handleStylesChange({
                          motion: updatedMotion,
                        });

                        if (tr.id === 'onClick') {
                          const existing = selectedElement.interactions || [];
                          const hasClick = existing.some((i) => i.trigger === 'onClick');
                          if (!hasClick) {
                            const newInter: ComponentInteraction = {
                              id: 'inter_motion_' + Math.random().toString(36).substring(2, 7),
                              trigger: 'onClick',
                              steps: [{
                                id: 'step_anim_' + Math.random().toString(36).substring(2, 7),
                                type: 'toast',
                                toastMessage: `${selectedElement.name} animated on click (${updatedMotion.effect})`,
                                toastType: 'info',
                              }],
                            };
                            onUpdateElement(selectedElement.id, {
                              styles: { ...selectedElement.styles, motion: updatedMotion },
                              interactions: [...existing, newInter],
                            });
                          }
                        }
                      }}
                      className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-semibold'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-semibold">{tr.label}</div>
                      <div className="text-[9px] text-zinc-500">{tr.desc}</div>
                    </button>
                  );
                })}
              </div>

              {styles.motion?.trigger !== 'infinite' && (
                <div className="pt-2">
                  <span className="text-[10px] text-zinc-500 font-mono block mb-1">
                    Repeat Count
                  </span>
                  <div className="grid grid-cols-4 gap-1 font-mono text-[10px]">
                    {(['1', '2', '3', 'infinite'] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => {
                          const current = styles.motion || {
                            effect: 'fade',
                            duration: 400,
                            easing: 'ease-out',
                            delay: 0,
                            trigger: 'onMount',
                            iterationCount: '1',
                          };
                          handleStylesChange({
                            motion: { ...current, iterationCount: cnt },
                          });
                        }}
                        className={`py-1 rounded border transition ${
                          (styles.motion?.iterationCount || '1') === cnt
                            ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-bold'
                            : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {cnt === 'infinite' ? '∞ Loop' : `${cnt}x`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= BUTTON ACTION BUILDER TAB ================= */}
        {activeTab === 'interactions' && (
          <div className="space-y-4">
            {/* Trigger Selector */}
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300 block mb-1.5">
                Event Trigger
              </span>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                {(['onClick', 'onHover', 'onChange'] as const).map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setActiveTrigger(tr)}
                    className={`py-1.5 rounded border transition cursor-pointer font-mono ${
                      activeTrigger === tr
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Pipeline Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                  Action Pipeline ({currentInteraction.steps.length})
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Play size={10} />
                  Sequential
                </span>
              </div>

              {currentInteraction.steps.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-zinc-500 py-6">
                  No actions configured for {activeTrigger}. Add an action below to build interactions.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentInteraction.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono text-zinc-400 font-medium">
                            {idx + 1}.
                          </span>
                          <span className="font-semibold text-zinc-200 capitalize">
                            {step.type === 'openModal' ? 'Open Popup' : step.type === 'submitForm' ? 'Submit Form' : step.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteActionStep(step.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition"
                          title="Remove action"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Action Type Specific Inputs */}
                      {step.type === 'navigate' && (
                        <div>
                          <label className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">
                            Destination Screen
                          </label>
                          <select
                            value={step.targetPageId || project.homePageId}
                            onChange={(e) => handleUpdateActionStep(step.id, { targetPageId: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                          >
                            {project.pages.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.path})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {step.type === 'toast' && (
                        <div className="space-y-1.5">
                          <div>
                            <label className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">
                              Toast Style
                            </label>
                            <select
                              value={step.toastType || 'success'}
                              onChange={(e) => handleUpdateActionStep(step.id, { toastType: e.target.value as any })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                            >
                              <option value="success">Success (Emerald)</option>
                              <option value="error">Error (Red)</option>
                              <option value="info">Info (Blue)</option>
                              <option value="warning">Warning (Amber)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">
                              Message Content
                            </label>
                            <input
                              type="text"
                              value={step.toastMessage || ''}
                              onChange={(e) => handleUpdateActionStep(step.id, { toastMessage: e.target.value })}
                              placeholder="e.g. Action completed!"
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                        </div>
                      )}

                      {step.type === 'openModal' && (
                        <div className="space-y-1.5">
                          <div>
                            <label className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">
                              Modal Dialog Title
                            </label>
                            <input
                              type="text"
                              value={step.modalTitle || ''}
                              onChange={(e) => handleUpdateActionStep(step.id, { modalTitle: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 uppercase font-mono mb-1">
                              Modal Body Text
                            </label>
                            <textarea
                              rows={2}
                              value={step.modalContent || ''}
                              onChange={(e) => handleUpdateActionStep(step.id, { modalContent: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {step.type === 'condition' && (
                        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                            <Split size={12} />
                            <span>IF / ELSE Branching Rule</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <span className="text-[10px] text-zinc-500 font-mono block">Operator</span>
                              <select
                                value={step.condition?.operator || 'isNotEmpty'}
                                onChange={(e) =>
                                  handleUpdateActionStep(step.id, {
                                    condition: {
                                      field: step.condition?.field || 'input',
                                      operator: e.target.value as any,
                                      value: step.condition?.value || '',
                                    },
                                  })
                                }
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                              >
                                <option value="isNotEmpty">Is Not Empty</option>
                                <option value="isEmpty">Is Empty</option>
                                <option value="equals">Equals</option>
                                <option value="contains">Contains</option>
                              </select>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 font-mono block">Match Value</span>
                              <input
                                type="text"
                                value={step.condition?.value || ''}
                                onChange={(e) =>
                                  handleUpdateActionStep(step.id, {
                                    condition: {
                                      field: step.condition?.field || 'input',
                                      operator: step.condition?.operator || 'equals',
                                      value: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Value..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Step Dropdown */}
              <div className="pt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  + Add Action Step
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { type: 'navigate' as const, label: 'Navigate Page' },
                    { type: 'toast' as const, label: 'Show Toast' },
                    { type: 'openModal' as const, label: 'Open Popup' },
                    { type: 'closeModal' as const, label: 'Close Popup' },
                    { type: 'submitForm' as const, label: 'Submit Form' },
                    { type: 'condition' as const, label: 'IF / ELSE Logic' },
                  ].map((act) => (
                    <button
                      key={act.type}
                      type="button"
                      onClick={() => handleAddActionStep(act.type)}
                      className="px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-left text-xs font-medium text-zinc-300 flex items-center justify-between cursor-pointer transition"
                    >
                      <span>{act.label}</span>
                      <Plus size={12} className="text-blue-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
