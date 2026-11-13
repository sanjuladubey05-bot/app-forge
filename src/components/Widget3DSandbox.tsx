import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { ThemeTokens, Widget3DConfig } from '../types/editor';
import { buildSandboxed3dSrcDoc } from '../utils/three-presets';

interface Widget3DSandboxProps {
  config?: Widget3DConfig;
  themeTokens?: ThemeTokens;
  interactive?: boolean;
  onSelect?: () => void;
  onResetPreset?: () => void;
  className?: string;
}

const DEFAULT_CONFIG: Widget3DConfig = {
  presetId: 'webgl-orbital-prism',
  presetMode: 'threejs-webgl',
  title: 'Interactive 3D Showcase',
  subtitle: 'Drag to orbit · Procedural WebGL scene',
  accentColor: '#38bdf8',
  heightPx: 280,
  autoRotate: true,
  interactiveTilt: true,
};

export const Widget3DSandbox: React.FC<Widget3DSandboxProps> = ({
  config,
  themeTokens,
  interactive = true,
  onSelect,
  onResetPreset,
  className = '',
}) => {
  const effectiveConfig = config || DEFAULT_CONFIG;
  const heightPx = Math.max(180, Math.min(560, effectiveConfig.heightPx || 280));
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const srcDoc = useMemo(
    () => buildSandboxed3dSrcDoc(effectiveConfig, themeTokens),
    [effectiveConfig, themeTokens]
  );

  useEffect(() => {
    setRuntimeError(null);
  }, [srcDoc]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      const payload = event.data;
      if (payload && typeof payload === 'object' && payload.type === 'AF_3D_ERROR') {
        setRuntimeError(String(payload.message || '3D scene runtime error detected.'));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 ${className}`}
      data-testid="widget3d-sandbox"
    >
      <iframe
        ref={iframeRef}
        title={effectiveConfig.title || 'AppForge 3D Widget'}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        style={{ height: `${heightPx}px` }}
        className="w-full border-0 block bg-zinc-950"
      />

      {!interactive && onSelect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          aria-label={`Select 3D widget: ${effectiveConfig.title}`}
          data-testid="canvas-widget3d-overlay"
          className="absolute inset-0 z-10 w-full h-full bg-transparent cursor-pointer focus:outline-none"
        />
      )}

      {runtimeError && (
        <div
          role="alert"
          className="absolute inset-x-3 bottom-3 z-20 p-2.5 rounded-lg bg-red-950/95 border border-red-500/40 text-xs text-red-100 flex items-center justify-between gap-2 shadow-lg"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <span className="truncate">{runtimeError}</span>
          </div>
          {onResetPreset && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRuntimeError(null);
                onResetPreset();
              }}
              className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-medium flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset Preset</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
