import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { ThemeTokens, Widget3DConfig } from '../types/editor';
import { buildSandboxed3dSrcDoc } from '../utils/three-presets';

interface Widget3DSandboxProps {
  config: Widget3DConfig;
  themeTokens?: ThemeTokens;
  interactive?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
  onResetPreset?: () => void;
  className?: string;
}

export const Widget3DSandbox: React.FC<Widget3DSandboxProps> = ({
  config,
  themeTokens,
  interactive = true,
  onSelect,
  onResetPreset,
  className = '',
}) => {
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const heightPx = Math.max(160, Math.min(640, Number(config.heightPx) || 280));

  const srcDoc = useMemo(
    () => buildSandboxed3dSrcDoc(config, themeTokens),
    [config, themeTokens]
  );

  useEffect(() => {
    setRuntimeError(null);
  }, [srcDoc]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AF_3D_ERROR') {
        const msg = typeof event.data.message === 'string' ? event.data.message : '3D sandbox runtime error.';
        setRuntimeError(msg);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 ${className}`}
      style={{ height: `${heightPx}px` }}
      data-testid="widget3d-sandbox"
    >
      <iframe
        title={config.title || 'Interactive 3D Widget'}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        className="w-full h-full border-0 block bg-transparent"
      />

      {!interactive && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(e);
          }}
          aria-label={`Select 3D widget: ${config.title || 'Interactive 3D Widget'}`}
          data-testid="canvas-widget3d-overlay"
          className="absolute inset-0 z-10 w-full h-full bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
        />
      )}

      {runtimeError && (
        <div
          role="alert"
          className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-zinc-950/95 px-3 py-2 text-xs text-amber-200 shadow-lg"
        >
          <span className="flex items-center gap-1.5 truncate">
            <AlertTriangle size={14} className="shrink-0 text-amber-400" />
            <span className="truncate">{runtimeError}</span>
          </span>
          {onResetPreset && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRuntimeError(null);
                onResetPreset();
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 text-[11px] font-medium shrink-0 cursor-pointer"
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
