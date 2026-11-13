import React, { useState } from 'react';
import { Box, Check, KeyRound, Loader2, Sparkles, Wand2, X } from 'lucide-react';
import { ThemeTokens, Widget3DConfig } from '../types/editor';
import { BUILTIN_3D_PRESETS } from '../utils/three-presets';
import { Widget3DSandbox } from './Widget3DSandbox';

interface Ai3DModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeTokens?: ThemeTokens;
  onInsertWidget: (config: Widget3DConfig) => void;
}

export const Ai3DModal: React.FC<Ai3DModalProps> = ({
  isOpen,
  onClose,
  themeTokens,
  onInsertWidget,
}) => {
  const [mode, setMode] = useState<'presets' | 'ai'>('presets');
  const [selectedConfig, setSelectedConfig] = useState<Widget3DConfig>(BUILTIN_3D_PRESETS[2].config);
  const [prompt, setPrompt] = useState('Floating metallic prism showcase with interactive tilt and glow');
  const [accentColor, setAccentColor] = useState(themeTokens?.primaryColor || '#38bdf8');
  const [heightPx, setHeightPx] = useState<number>(300);
  // Session memory only — never written to localStorage
  const [byokGeminiKey, setByokGeminiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAi3D = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = prompt.trim();
    if (!cleaned) return;
    setIsGenerating(true);
    setStatusNote(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (byokGeminiKey.trim()) {
        headers['x-gemini-api-key'] = byokGeminiKey.trim();
      }
      const resp = await fetch('/api/ai/generate-3d', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: cleaned,
          accentColor,
        }),
      });
      const data = await resp.json().catch(() => null);
      if (resp.ok && data?.ok && data.widget) {
        const w = data.widget;
        setSelectedConfig({
          presetId: 'ai-custom',
          presetMode: w.presetMode === 'threejs-webgl' ? 'threejs-webgl' : 'css-3d',
          title: w.title || cleaned.slice(0, 48),
          subtitle: 'AI-synthesized isolated 3D widget',
          accentColor,
          heightPx,
          autoRotate: true,
          interactiveTilt: true,
          htmlSnippet: w.htmlSnippet,
          cssSnippet: w.cssSnippet,
          jsSnippet: w.jsSnippet,
          promptUsed: cleaned,
        });
        setStatusNote(
          data.mode === 'gemini'
            ? 'Synthesized custom 3D widget using Gemini AI.'
            : 'Synthesized deterministic 3D widget using built-in engine.'
        );
        return;
      }

      // Deterministic local preset customization fallback
      const lower = cleaned.toLowerCase();
      const chosen = lower.includes('particle') || lower.includes('star')
        ? BUILTIN_3D_PRESETS[3]
        : lower.includes('terrain') || lower.includes('wave') || lower.includes('mesh')
        ? BUILTIN_3D_PRESETS[4]
        : lower.includes('card') || lower.includes('glass')
        ? BUILTIN_3D_PRESETS[0]
        : lower.includes('cube') || lower.includes('button')
        ? BUILTIN_3D_PRESETS[1]
        : BUILTIN_3D_PRESETS[2];

      setSelectedConfig({
        ...chosen.config,
        title: cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned,
        subtitle: `Procedural ${chosen.category} · Accent ${accentColor}`,
        accentColor,
        heightPx,
        promptUsed: cleaned,
      });
      setStatusNote(data?.error || 'Generated interactive 3D preset matched to your prompt.');
    } catch {
      setSelectedConfig({
        ...BUILTIN_3D_PRESETS[2].config,
        title: cleaned.slice(0, 42),
        accentColor,
        heightPx,
        promptUsed: cleaned,
      });
      setStatusNote('Generated local 3D showcase preset.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-3d-modal-title"
        data-testid="ai-3d-modal"
        className="w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Box size={18} />
            </div>
            <div>
              <h2 id="ai-3d-modal-title" className="text-sm font-semibold text-white">
                3D Component Studio &amp; Sandbox
              </h2>
              <p className="text-xs text-zinc-400">
                Insert free CSS 3D / WebGL presets or synthesize custom 3D widgets inside a sandboxed iframe
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close 3D Studio modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex border-b border-zinc-800 px-5 gap-2 bg-zinc-900/20 text-xs">
          <button
            type="button"
            onClick={() => setMode('presets')}
            className={`py-2.5 px-3 border-b-2 font-medium cursor-pointer transition ${
              mode === 'presets' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="ai3d-tab-presets"
          >
            Free Built-in 3D Presets ({BUILTIN_3D_PRESETS.length})
          </button>
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`py-2.5 px-3 border-b-2 font-medium cursor-pointer transition flex items-center gap-1.5 ${
              mode === 'ai' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="ai3d-tab-prompt"
          >
            <Sparkles size={13} />
            <span>AI Prompt-to-3D</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Controls */}
          <div className="lg:col-span-6 space-y-4">
            {mode === 'presets' ? (
              <div className="grid grid-cols-1 gap-2.5">
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
                        setStatusNote(null);
                      }}
                      data-testid={`preset-3d-${preset.id}`}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        isActive
                          ? 'border-blue-500 bg-blue-950/30 text-white'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{preset.name}</span>
                        <span className="text-[10px] font-mono text-zinc-400">{preset.category}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{preset.description}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleGenerateAi3D} className="space-y-3">
                <div>
                  <label htmlFor="ai3d-prompt-box" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Describe your interactive 3D element
                  </label>
                  <textarea
                    id="ai3d-prompt-box"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Rotating crystal card with glass refraction and cyan rim light"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none"
                    data-testid="ai3d-prompt-input"
                  />
                </div>

                {/* Optional Session-Only BYOK Key */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyInput((v) => !v)}
                    className="w-full flex items-center justify-between text-[11px] font-medium text-zinc-300 hover:text-white cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <KeyRound size={12} className="text-zinc-400" />
                      <span>Optional: Use your own Gemini API key (memory only)</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">{showKeyInput ? 'Hide' : 'Configure'}</span>
                  </button>
                  {showKeyInput && (
                    <div className="space-y-1.5 pt-1">
                      <input
                        type="password"
                        value={byokGeminiKey}
                        onChange={(e) => setByokGeminiKey(e.target.value)}
                        placeholder="AIza... (never stored in browser storage or server logs)"
                        aria-label="Optional Gemini API key in memory"
                        className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        Held strictly in React session memory for this request only. Leave blank to use the built-in 3D engine or server key.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  data-testid="ai3d-generate-btn"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  <span>{isGenerating ? 'Synthesizing 3D Scene...' : 'Generate 3D Component'}</span>
                </button>
              </form>
            )}

            {/* Shared appearance controls */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => {
                      const next = e.target.value;
                      setAccentColor(next);
                      setSelectedConfig((prev) => ({ ...prev, accentColor: next }));
                    }}
                    className="w-8 h-8 rounded border border-zinc-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => {
                      const next = e.target.value;
                      setAccentColor(next);
                      setSelectedConfig((prev) => ({ ...prev, accentColor: next }));
                    }}
                    className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs font-mono text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                  Height ({heightPx}px)
                </label>
                <input
                  type="range"
                  min={200}
                  max={440}
                  step={10}
                  value={heightPx}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    setHeightPx(h);
                    setSelectedConfig((prev) => ({ ...prev, heightPx: h }));
                  }}
                  className="w-full accent-blue-500 mt-2"
                />
              </div>
            </div>

            {statusNote && (
              <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <Check size={14} className="shrink-0" />
                <span>{statusNote}</span>
              </div>
            )}
          </div>

          {/* Right Live Sandboxed Preview */}
          <div className="lg:col-span-6 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-200">Live Sandboxed Preview</span>
              <span className="text-[11px] font-mono text-zinc-400">
                iframe sandbox=&quot;allow-scripts&quot;
              </span>
            </div>
            <Widget3DSandbox
              config={selectedConfig}
              themeTokens={themeTokens}
              interactive={true}
              onResetPreset={() => setSelectedConfig(BUILTIN_3D_PRESETS[2].config)}
            />
            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>Widget: {selectedConfig.title}</span>
              <span className="font-mono">{selectedConfig.presetMode}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onInsertWidget(selectedConfig);
              onClose();
            }}
            data-testid="ai3d-insert-btn"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Box size={14} />
            <span>Insert 3D Widget into Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
