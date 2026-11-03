import React, { useState } from 'react';
import { 
  CanvasElement, 
  ComponentProps, 
  ComponentStyles, 
  Project,
  ActionStep,
  ComponentInteraction
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
  Check
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
}) => {
  const [activeTab, setActiveTab] = useState<'props' | 'design' | 'interactions'>('props');
  const [activeTrigger, setActiveTrigger] = useState<'onClick' | 'onHover' | 'onChange'>('onClick');

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
      <div className="grid grid-cols-3 border-b border-zinc-800 text-[11px] font-medium text-zinc-400 bg-zinc-950">
        <button
          onClick={() => setActiveTab('props')}
          className={`py-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
            activeTab === 'props'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Sliders size={12} />
          <span>Props</span>
        </button>
        <button
          onClick={() => setActiveTab('design')}
          className={`py-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
            activeTab === 'design'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Palette size={12} />
          <span>Design</span>
        </button>
        <button
          onClick={() => setActiveTab('interactions')}
          className={`py-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
            activeTab === 'interactions'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Zap size={12} />
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
                          <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[10px] font-mono flex items-center justify-center font-bold">
                            {idx + 1}
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
