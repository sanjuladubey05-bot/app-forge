import React, { useState } from 'react';
import { 
  CanvasElement, 
  ComponentProps, 
  ComponentStyles, 
  Project 
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
  LayoutTemplate
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'props' | 'style' | 'layout'>('props');

  // Color preset swatches
  const colorPresets = [
    '#ffffff',
    '#a1a1aa',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#09090b',
    '#18181b',
    '#27272a',
  ];

  if (!selectedElement) {
    // Canvas / Root settings
    return (
      <aside className="w-72 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0 select-none">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <LayoutTemplate size={13} className="text-blue-400" />
            Canvas Properties
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Root Frame</span>
        </div>

        <div className="p-4 space-y-5 flex-1 overflow-y-auto">
          {/* Canvas Background Color */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Background Color
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
            {/* Presets */}
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

          {/* Canvas Padding */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
              Inner Padding
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

          {/* Project Details Info */}
          <div className="pt-4 border-t border-zinc-800 space-y-2.5 text-xs text-zinc-400">
            <div className="flex justify-between">
              <span>Elements on Canvas</span>
              <span className="font-mono text-white">{project.elements.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Target Viewport</span>
              <span className="font-mono text-white capitalize">{project.viewport}</span>
            </div>
            <div className="flex justify-between">
              <span>Zoom Scale</span>
              <span className="font-mono text-white">{project.zoom}%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-[11px] text-zinc-400 leading-relaxed">
            💡 Click any element on the central canvas to edit its properties, custom styles, and event triggers.
          </div>
        </div>
      </aside>
    );
  }

  const { props, styles } = selectedElement;

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

  return (
    <aside className="w-72 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0 select-none">
      {/* Element Header & Actions */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] uppercase font-bold shrink-0">
            {selectedElement.type}
          </span>
          <span className="text-xs font-semibold text-zinc-200 truncate">
            {selectedElement.name}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleVisibility(selectedElement.id)}
            title={selectedElement.hidden ? 'Show element' : 'Hide element'}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
          >
            {selectedElement.hidden ? <EyeOff size={13} className="text-amber-400" /> : <Eye size={13} />}
          </button>
          <button
            onClick={() => onToggleLock(selectedElement.id)}
            title={selectedElement.locked ? 'Unlock element' : 'Lock element'}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
          >
            {selectedElement.locked ? <Lock size={13} className="text-amber-400" /> : <Unlock size={13} />}
          </button>
          <button
            onClick={() => onDuplicateElement(selectedElement.id)}
            title="Duplicate"
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            title="Delete element"
            className="p-1 text-zinc-400 hover:text-red-400 rounded hover:bg-red-500/10 transition"
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
          onClick={() => setActiveTab('style')}
          className={`py-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
            activeTab === 'style'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Palette size={12} />
          <span>Style</span>
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`py-2 flex items-center justify-center gap-1.5 transition cursor-pointer border-b-2 ${
            activeTab === 'layout'
              ? 'border-blue-500 text-blue-400 bg-zinc-900/50 font-semibold'
              : 'border-transparent hover:text-zinc-200'
          }`}
        >
          <Maximize2 size={12} />
          <span>Layout</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* PROPS TAB */}
        {activeTab === 'props' && (
          <div className="space-y-4">
            {/* Primary Text / Label */}
            {(selectedElement.type === 'heading' ||
              selectedElement.type === 'text' ||
              selectedElement.type === 'button' ||
              selectedElement.type === 'card' ||
              selectedElement.type === 'badge') && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Text Content
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

            {/* Input / Textarea / Select Label */}
            {(selectedElement.type === 'input' ||
              selectedElement.type === 'textarea' ||
              selectedElement.type === 'select' ||
              selectedElement.type === 'toggle') && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Field Label
                </label>
                <input
                  type="text"
                  value={props.label || ''}
                  onChange={(e) => handlePropsChange({ label: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            )}

            {/* Placeholder */}
            {(selectedElement.type === 'input' || selectedElement.type === 'textarea') && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={props.placeholder || ''}
                  onChange={(e) => handlePropsChange({ placeholder: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            )}

            {/* Heading Level */}
            {selectedElement.type === 'heading' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Header Level
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['h1', 'h2', 'h3'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handlePropsChange({ headingLevel: lvl })}
                      className={`py-1.5 rounded-lg border text-xs font-mono uppercase transition cursor-pointer ${
                        props.headingLevel === lvl
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Button Variant */}
            {selectedElement.type === 'button' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Button Style Preset
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'primary', label: 'Primary Blue', bg: '#3b82f6', text: '#ffffff' },
                    { id: 'secondary', label: 'Dark Slate', bg: '#27272a', text: '#ffffff' },
                    { id: 'success', label: 'Emerald Win', bg: '#10b981', text: '#ffffff' },
                    { id: 'danger', label: 'Crimson Red', bg: '#ef4444', text: '#ffffff' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        handlePropsChange({ buttonVariant: preset.id as any });
                        handleStylesChange({ backgroundColor: preset.bg, textColor: preset.text });
                      }}
                      className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-left text-xs font-medium text-zinc-300 flex items-center gap-2 cursor-pointer"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.bg }}></span>
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Metric Fields */}
            {selectedElement.type === 'metric' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1">
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
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Metric Value
                  </label>
                  <input
                    type="text"
                    value={props.metricValue || ''}
                    onChange={(e) => handlePropsChange({ metricValue: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1">
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

            {/* Image URL */}
            {selectedElement.type === 'image' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                    Image Source URL
                  </label>
                  <input
                    type="text"
                    value={props.imageUrl || ''}
                    onChange={(e) => handlePropsChange({ imageUrl: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1">
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

            {/* Select Options */}
            {selectedElement.type === 'select' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1">
                  Options (comma separated)
                </label>
                <input
                  type="text"
                  value={(props.options || []).join(', ')}
                  onChange={(e) =>
                    handlePropsChange({
                      options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                />
              </div>
            )}
          </div>
        )}

        {/* STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Background Color */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Background Color
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={styles.backgroundColor || '#18181b'}
                  onChange={(e) => handleStylesChange({ backgroundColor: e.target.value })}
                  className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={styles.backgroundColor || '#18181b'}
                  onChange={(e) => handleStylesChange({ backgroundColor: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleStylesChange({ backgroundColor: c })}
                    style={{ backgroundColor: c }}
                    className="w-5 h-5 rounded border border-zinc-700 cursor-pointer hover:scale-110 transition"
                  />
                ))}
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Text Color
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="color"
                  value={styles.textColor || '#ffffff'}
                  onChange={(e) => handleStylesChange({ textColor: e.target.value })}
                  className="w-7 h-7 rounded border border-zinc-800 bg-transparent cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={styles.textColor || '#ffffff'}
                  onChange={(e) => handleStylesChange({ textColor: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleStylesChange({ textColor: c })}
                    style={{ backgroundColor: c }}
                    className="w-5 h-5 rounded border border-zinc-700 cursor-pointer hover:scale-110 transition"
                  />
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Font Size
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleStylesChange({ fontSize: sz })}
                    className={`py-1 rounded border text-[10px] font-mono transition cursor-pointer ${
                      styles.fontSize === sz
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Text Alignment
              </label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleStylesChange({ textAlign: 'left' })}
                  className={`py-1.5 flex items-center justify-center rounded border transition cursor-pointer ${
                    styles.textAlign === 'left' || !styles.textAlign
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStylesChange({ textAlign: 'center' })}
                  className={`py-1.5 flex items-center justify-center rounded border transition cursor-pointer ${
                    styles.textAlign === 'center'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleStylesChange({ textAlign: 'right' })}
                  className={`py-1.5 flex items-center justify-center rounded border transition cursor-pointer ${
                    styles.textAlign === 'right'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <AlignRight size={13} />
                </button>
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Border Radius
              </label>
              <div className="grid grid-cols-5 gap-1">
                {(['none', 'sm', 'md', 'lg', 'full'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleStylesChange({ borderRadius: r })}
                    className={`py-1 rounded border text-[10px] font-mono transition cursor-pointer ${
                      styles.borderRadius === r
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            {/* Width */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                Container Width
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'full', label: '100% Full Width' },
                  { id: 'auto', label: 'Auto (Fit Content)' },
                  { id: 'half', label: '50% Half' },
                  { id: 'third', label: '33% Third' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleStylesChange({ width: w.id as any })}
                    className={`p-2 rounded border text-xs text-left transition cursor-pointer ${
                      styles.width === w.id || (!styles.width && w.id === 'full')
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-semibold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Element Status Toggles */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <button
                type="button"
                onClick={() => onToggleVisibility(selectedElement.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 transition text-xs cursor-pointer"
              >
                <span className="text-zinc-300">Visibility on Canvas</span>
                <span className={`font-mono ${selectedElement.hidden ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedElement.hidden ? 'Hidden' : 'Visible'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggleLock(selectedElement.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 transition text-xs cursor-pointer"
              >
                <span className="text-zinc-300">Element Lock</span>
                <span className={`font-mono ${selectedElement.locked ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {selectedElement.locked ? 'Locked' : 'Unlocked'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
