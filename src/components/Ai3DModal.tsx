import React, { useState } from 'react';
import { X, Box, Sparkles, Loader2, Check, KeyRound, Plus } from 'lucide-react';
import { ThemeTokens, Widget3DConfig } from '../types/editor';
import { BUILTIN_3D_PRESETS } from '../utils/three-presets';
import { Widget3DSandbox } from './Widget3DSandbox';

interface Ai3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeTokens?: ThemeTokens;
  onInsertWidget: (config: Widget3DConfig) => void;
}

function buildProceduralPromptFallback(prompt: string, accentColor: string): Widget3DConfig {
  const q = prompt.toLowerCase();
  let preset = BUILTIN_3D_PRESETS[2]; // webgl-orbital-prism default
  if (q.includes('particle') || q.includes('star') || q.includes('dust') || q.includes('galaxy')) {
    preset = BUILTIN_3D_PRESETS[3];
  } else if (q.includes('terrain') || q.includes('wave') || q.includes('wireframe') || q.includes('topo')) {
    preset = BUILTIN_3D_PRESETS[4];
  } else if (q.includes('button') || q.includes('cube') || q.includes('iso') || q.includes('tactile')) {
    preset = BUILTIN_3D_PRESETS[1];
  } else if (q.includes('glass') || q.includes('card') || q.includes('tilt')) {
    preset = BUILTIN_3D_PRESETS[0];
  }

  const cleanTitle = prompt.trim().slice(0, 44) || preset.config.title;
  return {
    ...preset.config,
    title: cleanTitle,
    subtitle: `Procedural 3D preset (${preset.name}) tailored to your prompt`,
    accentColor,
    promptUsed: prompt.trim(),
  };
}

export const Ai3DModal: React.FC<Ai3DModalProps> = ({
  isOpen,
  onClose,
  themeTokens,
  onInsertWidget,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'ai'>('presets');
  const [selectedConfig, setSelectedConfig] = useState<Widget3DConfig>({
    ...BUILTIN_3D_PRESETS[2].config,
    accentColor: themeTokens?.primaryColor || BUILTIN_3D_PRESETS[2].config.accentColor,
  });
  const [prompt, setPrompt] = useState('Floating metallic orbital prism for hero product showcase');
  const [accentColor, setAccentColor] = useState(themeTokens?.primaryColor || '#38bdf8');
  const [heightPx, setHeightPx] = useState<number>(280);
  const [byokKey, setByokKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAi3d = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) {
      setStatusMessage('Enter a 3D prompt to synthesize.');
      return;
    }

    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (byokKey.trim()) {
        headers['x-gemini-api-key'] = byokKey.trim();
      }
      const resp = await fetch('/api/ai/generate-3d', {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: trimmed, accentColor }),
      });
      const data = await resp.json().catch(() => null);

      if (resp.ok && data?.ok && data.widget) {
        const w = data.widget;
        setSelectedConfig({
          presetId: 'ai-custom',
          presetMode: w.presetMode === 'css-3d' ? 'css-3d' : 'threejs-webgl',
          title: w.title || trimmed.slice(0, 44),
          subtitle: `AI Generated 3D (${data.mode || 'gemini'})`,
          accentColor,
          heightPx,
          autoRotate: true,
          interactiveTilt: true,
          htmlSnippet: w.htmlSnippet,
          cssSnippet: w.cssSnippet,
          jsSnippet: w.jsSnippet,
          promptUsed: trimmed,
        });
        setStatusMessage('Synthesized custom sandboxed 3D widget.');
      } else {
        const fallback = buildProceduralPromptFallback(trimmed, accentColor);
        setSelectedConfig({ ...fallback, heightPx });
        setStatusMessage('Generated procedural Three.js/CSS 3D scene locally.');
      }
    } catch {
      const fallback = buildProceduralPromptFallback(trimmed, accentColor);
      setSelectedConfig({ ...fallback, heightPx });
      setStatusMessage('Generated local procedural 3D widget.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = () => {
    onInsertWidget({
      ...selectedConfig,
      accentColor,
      heightPx,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-3d-modal-title"
        className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        data-testid="ai-3d-modal"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Box size={18} />
            </div>
            <div>
              <h2 id="ai-3d-modal-title" className="text-sm font-semibold text-white">
                3D UI &amp; AI Scene Studio
              </h2>
              <p className="text-xs text-zinc-400">
                Choose a free built-in WebGL / CSS 3D preset or synthesize an isolated 3D widget
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close 3D Studio"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-5 pt-2 border-b border-zinc-800 flex items-center gap-2 bg-zinc-900/20 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 border-b-2 font-medium transition cursor-pointer ${
              activeTab === 'presets'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="ai3d-tab-presets"
          >
            Built-in 3D Presets ({BUILTIN_3D_PRESETS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-2 border-b-2 font-medium flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'ai'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="ai3d-tab-ai"
          >
            <Sparkles size={13} />
            <span>AI Prompt-to-3D</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Controls */}
          <div className="space-y-4">
            {activeTab === 'presets' ? (
              <div className="space-y-2.5">
                {BUILTIN_3D_PRESETS.map((preset) => {
                  const isActive = selectedConfig.presetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedConfig({
                          ...preset.config,
                          accentColor,
                          heightPx,
                        });
                        setStatusMessage(`Loaded preset: ${preset.name}`);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                        isActive
                          ? 'border-cyan-500 bg-cyan-950/30 text-white'
                          : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-300'
                      }`}
                      data-testid={`preset-3d-${preset.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white">{preset.name}</span>
                        <span className="text-[10px] font-mono text-cyan-300">{preset.category}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleGenerateAi3d} className="space-y-3.5">
                <div>
                  <label htmlFor="ai3d-prompt-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Describe your 3D UI component or WebGL scene
                  </label>
                  <textarea
                    id="ai3d-prompt-input"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Glowing orbital polyhedron hero with clean telemetry labels"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 resize-none"
                    data-testid="ai3d-prompt-input"
                  />
                </div>

                <div>
                  <label htmlFor="ai3d-byok-input" className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 mb-1">
                    <KeyRound size={12} />
                    <span>Optional Gemini API Key (Memory-only for this request)</span>
                  </label>
                  <input
                    id="ai3d-byok-input"
                    type="password"
                    autoComplete="off"
                    value={byokKey}
                    onChange={(e) => setByokKey(e.target.value)}
                    placeholder="Leave blank to use server key or local procedural engine"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Never saved to disk or localStorage. If using a personal Gemini key, standard Google AI API billing applies to your account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  data-testid="ai3d-generate-btn"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  <span>{isGenerating ? 'Synthesizing 3D Scene...' : 'Synthesize Sandboxed 3D Widget'}</span>
                </button>
              </form>
            )}

            {/* Accent Color & Height */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
              <div>
                <label htmlFor="ai3d-accent-color" className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="ai3d-accent-color"
                    type="color"
                    value={accentColor}
                    onChange={(e) => {
                      const next = e.target.value;
                      setAccentColor(next);
                      setSelectedConfig((prev) => ({ ...prev, accentColor: next }));
                    }}
                    className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-zinc-300">{accentColor}</span>
                </div>
              </div>
              <div>
                <label htmlFor="ai3d-height-input" className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Height ({heightPx}px)
                </label>
                <input
                  id="ai3d-height-input"
                  type="range"
                  min={180}
                  max={480}
                  step={10}
                  value={heightPx}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setHeightPx(next);
                    setSelectedConfig((prev) => ({ ...prev, heightPx: next }));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {statusMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-1.5">
                <Check size={13} className="shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Right Live Sandboxed Preview */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">Live Sandboxed Preview</span>
              <span className="font-mono text-[10px]">iframe sandbox=&quot;allow-scripts&quot;</span>
            </div>
            <Widget3DSandbox
              config={{ ...selectedConfig, accentColor, heightPx }}
              themeTokens={themeTokens}
              interactive={true}
              onResetPreset={() => setSelectedConfig({ ...BUILTIN_3D_PRESETS[2].config, accentColor, heightPx })}
            />
            <div className="text-[11px] text-zinc-400">
              Selected: <span className="text-zinc-200 font-medium">{selectedConfig.title}</span> ({selectedConfig.presetMode})
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-600/20"
            data-testid="ai3d-insert-btn"
          >
            <Plus size={14} />
            <span>Insert 3D Widget into Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
