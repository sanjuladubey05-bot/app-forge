import React, { useState, useRef, useCallback } from 'react';
import { 
  CanvasElement, 
  ComponentType, 
  Page, 
  ViewportMode 
} from '../types/editor';
import { 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  EyeOff,
  Lock,
  Box,
  FolderPlus
} from 'lucide-react';
import { QuickAddRadialMenu } from './QuickAddRadialMenu';

interface CanvasAreaProps {
  activePage: Page;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onMoveElement: (index: number, direction: 'up' | 'down') => void;
  onDropComponent: (type: ComponentType, targetContainerId?: string | null) => void;
  onGroupSelected?: (elementId: string) => void;
  viewport: ViewportMode;
  zoom: number;
  canvasBg: string;
  canvasPadding: string;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  activePage,
  elements,
  selectedElementId,
  onSelectElement,
  onDeleteElement,
  onDuplicateElement,
  onMoveElement,
  onDropComponent,
  onGroupSelected,
  viewport,
  zoom,
  canvasBg,
  canvasPadding,
}) => {
  // Mobile Circular 'Quick Add' Floating Action Menu state & long-press detection
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddPos, setQuickAddPos] = useState<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggeredRef = useRef(false);

  const triggerQuickAdd = useCallback((clientX: number, clientY: number) => {
    // Provide subtle haptic vibration if supported on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch {}
    }

    // Keep radial menu centered within visible viewport bounds
    const margin = 120;
    const clampedX = Math.max(margin, Math.min(window.innerWidth - margin, clientX));
    const clampedY = Math.max(margin, Math.min(window.innerHeight - margin, clientY));

    setQuickAddPos({ x: clampedX, y: clampedY });
    setIsQuickAddOpen(true);
    longPressTriggeredRef.current = true;
  }, []);

  const handleTouchStartEmpty = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    longPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      triggerQuickAdd(touch.clientX, touch.clientY);
    }, 450);
  };

  const handleTouchMoveEmpty = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current || !e.touches[0]) return;
    const dx = e.touches[0].clientX - touchStartPosRef.current.x;
    const dy = e.touches[0].clientY - touchStartPosRef.current.y;
    // If user is panning/scrolling the canvas, cancel the long-press timer
    if (Math.hypot(dx, dy) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleTouchEndEmpty = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMouseDownEmpty = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary mouse button
    touchStartPosRef.current = { x: e.clientX, y: e.clientY };
    longPressTriggeredRef.current = false;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    longPressTimerRef.current = setTimeout(() => {
      triggerQuickAdd(e.clientX, e.clientY);
    }, 450);
  };

  const handleMouseMoveEmpty = (e: React.MouseEvent) => {
    if (!touchStartPosRef.current) return;
    const dx = e.clientX - touchStartPosRef.current.x;
    const dy = e.clientY - touchStartPosRef.current.y;
    if (Math.hypot(dx, dy) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleMouseUpEmpty = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, containerId?: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.dataTransfer.getData('text/plain') as ComponentType;
    if (type) {
      onDropComponent(type, containerId || null);
    }
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px] min-h-[667px] shadow-2xl shadow-black/80 rounded-3xl border-4 border-zinc-800';
      case 'tablet':
        return 'max-w-[768px] min-h-[800px] shadow-2xl shadow-black/60 rounded-2xl border-2 border-zinc-800';
      default:
        return 'max-w-[960px] min-h-[700px] shadow-2xl shadow-black/50 rounded-xl border border-zinc-800/80';
    }
  };

  const getPaddingClass = () => {
    switch (canvasPadding) {
      case 'sm':
        return 'p-4';
      case 'xl':
        return 'p-10';
      default:
        return 'p-6';
    }
  };

  // Helper to compile Complete Design Control style object
  const buildElementStyle = (styles: CanvasElement['styles']) => {
    const s: React.CSSProperties = {};

    // Sizing
    if (styles.width === 'half') s.width = '50%';
    else if (styles.width === 'third') s.width = '33.333%';
    else if (styles.width === 'auto') s.width = 'auto';
    else if (styles.width === 'custom' && styles.customWidth) s.width = styles.customWidth;
    else s.width = '100%';

    if (styles.height === 'sm') s.height = '48px';
    else if (styles.height === 'md') s.height = '96px';
    else if (styles.height === 'lg') s.height = '160px';
    else if (styles.height === 'custom' && styles.customHeight) s.height = styles.customHeight;

    if (styles.minHeight) s.minHeight = styles.minHeight;

    // Colors & Backgrounds
    if (styles.backgroundGradient?.enabled) {
      const dirMap = {
        'to-r': 'to right',
        'to-b': 'to bottom',
        'to-br': 'to bottom right',
        'to-tr': 'to top right',
      };
      const dir = dirMap[styles.backgroundGradient.direction] || 'to right';
      s.background = `linear-gradient(${dir}, ${styles.backgroundGradient.fromColor}, ${styles.backgroundGradient.toColor})`;
    } else if (styles.backgroundColor) {
      s.backgroundColor = styles.backgroundColor;
    }

    if (styles.textColor) s.color = styles.textColor;
    if (typeof styles.opacity === 'number') s.opacity = styles.opacity / 100;

    // Typography
    if (styles.fontFamily === 'mono') s.fontFamily = 'monospace';
    else if (styles.fontFamily === 'serif') s.fontFamily = 'Georgia, serif';
    else if (styles.fontFamily === 'display') s.fontFamily = 'system-ui, sans-serif';

    if (styles.textAlign) s.textAlign = styles.textAlign;
    if (styles.textTransform) s.textTransform = styles.textTransform;

    // Alignment & Flex self positioning
    if (styles.alignSelf) {
      s.alignSelf = styles.alignSelf === 'start' ? 'flex-start' : styles.alignSelf === 'end' ? 'flex-end' : styles.alignSelf;
    }

    // Margin Spacing
    if (styles.marginMode === 'individual') {
      if (styles.marginTop) s.marginTop = styles.marginTop;
      if (styles.marginRight) s.marginRight = styles.marginRight;
      if (styles.marginBottom) s.marginBottom = styles.marginBottom;
      if (styles.marginLeft) s.marginLeft = styles.marginLeft;
    } else if (styles.margin && styles.margin !== 'none') {
      const marginMap: Record<string, string> = { xs: '4px', sm: '8px', md: '16px', lg: '24px' };
      s.margin = marginMap[styles.margin] || '0px';
    }

    // Spacing
    if (styles.paddingMode === 'individual') {
      if (styles.paddingTop) s.paddingTop = styles.paddingTop;
      if (styles.paddingRight) s.paddingRight = styles.paddingRight;
      if (styles.paddingBottom) s.paddingBottom = styles.paddingBottom;
      if (styles.paddingLeft) s.paddingLeft = styles.paddingLeft;
    }

    // Borders & Radii
    if (styles.borderWidth && styles.borderWidth !== 'none') {
      s.borderWidth = styles.borderWidth;
      s.borderStyle = styles.borderStyle || 'solid';
      s.borderColor = styles.borderColor || '#27272a';
    }

    // Shadows
    if (styles.shadow === 'glow-blue') s.boxShadow = '0 0 20px -3px rgba(59, 130, 246, 0.4)';
    else if (styles.shadow === 'glow-emerald') s.boxShadow = '0 0 20px -3px rgba(16, 185, 129, 0.4)';

    // Motion & Animation Engine
    if (styles.motion && styles.motion.effect && styles.motion.effect !== 'none') {
      const m = styles.motion;
      const easing = m.easing === 'bounce' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : m.easing || 'ease-out';
      const animName = `appforge-${m.effect}`;
      const count = m.trigger === 'infinite' ? 'infinite' : (m.iterationCount || '1');
      if (m.trigger === 'onMount' || m.trigger === 'infinite') {
        s.animation = `${animName} ${m.duration || 400}ms ${easing} ${m.delay || 0}ms ${count} both`;
      }
    }

    return s;
  };

  const renderComponent = (element: CanvasElement, index: number, isInsideContainer: boolean = false) => {
    // Check responsive visibility
    if (viewport === 'mobile' && element.styles.hideOnMobile) {
      return null;
    }
    if (viewport === 'desktop' && element.styles.hideOnDesktop) {
      return null;
    }

    const { type, props, styles } = element;
    const isSelected = selectedElementId === element.id;

    if (element.hidden) {
      return (
        <div
          key={element.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelectElement(element.id);
          }}
          className="p-2 border border-dashed border-zinc-800 rounded-lg text-xs text-zinc-500 flex items-center justify-between bg-zinc-950/60"
        >
          <span className="flex items-center gap-2">
            <EyeOff size={13} />
            <span>{element.name} (Hidden on Canvas)</span>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement(element.id);
            }}
            className="text-[10px] text-blue-400 hover:underline"
          >
            Select
          </button>
        </div>
      );
    }

    const elementStyle = buildElementStyle(styles);

    const renderInnerContent = () => {
      switch (type) {
        case 'heading': {
          const Tag = props.headingLevel || 'h1';
          const sizeClass =
            styles.fontSize === '4xl'
              ? 'text-4xl'
              : styles.fontSize === '3xl'
              ? 'text-3xl'
              : styles.fontSize === '2xl'
              ? 'text-2xl'
              : styles.fontSize === 'xl'
              ? 'text-xl'
              : 'text-3xl';

          return (
            <div className="w-full">
              <Tag style={{ color: styles.textColor || '#ffffff' }} className={`${sizeClass} font-bold tracking-tight leading-tight`}>
                {props.text || 'Heading Text'}
              </Tag>
              {props.subtext && (
                <p className="text-zinc-400 mt-1 text-sm leading-relaxed">
                  {props.subtext}
                </p>
              )}
            </div>
          );
        }

        case 'text':
          return (
            <p className="text-sm md:text-base leading-relaxed text-zinc-300">
              {props.text || 'Paragraph text content goes here...'}
            </p>
          );

        case 'button':
          return (
            <button
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md pointer-events-none inline-flex items-center gap-1.5 transition"
            >
              <span>{props.text || 'Action Button'}</span>
              <ArrowUpRight size={14} className="opacity-70" />
            </button>
          );

        case 'card':
        case 'container': {
          const isFlexRow = props.direction === 'row';
          const gapClass = props.gap === 'sm' ? 'gap-2' : props.gap === 'lg' ? 'gap-6' : 'gap-4';

          return (
            <div
              onDrop={(e) => handleDrop(e, element.id)}
              className={`w-full min-h-[60px] p-4 rounded-xl border flex ${
                isFlexRow ? 'flex-row items-center flex-wrap' : 'flex-col'
              } ${gapClass}`}
            >
              {type === 'card' && props.text && (
                <div className="w-full mb-1">
                  <h4 className="text-base font-semibold text-white">{props.text}</h4>
                  {props.subtext && <p className="text-xs text-zinc-400">{props.subtext}</p>}
                </div>
              )}

              {/* Nested Children */}
              {element.children && element.children.length > 0 ? (
                element.children.map((child, cIdx) =>
                  renderComponent(child, cIdx, true)
                )
              ) : (
                <div className="w-full py-4 border border-dashed border-zinc-800 rounded-lg text-center text-[11px] text-zinc-500">
                  <Box size={14} className="mx-auto mb-1 opacity-40" />
                  Empty Container • Drag or drop elements here
                </div>
              )}
            </div>
          );
        }

        case 'input':
          return (
            <div className="w-full">
              {props.label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  {props.label}
                </label>
              )}
              <input
                type="text"
                readOnly
                placeholder={props.placeholder || 'Enter value...'}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 pointer-events-none"
              />
            </div>
          );

        case 'textarea':
          return (
            <div className="w-full">
              {props.label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  {props.label}
                </label>
              )}
              <textarea
                readOnly
                rows={3}
                placeholder={props.placeholder || 'Type here...'}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 pointer-events-none resize-none"
              />
            </div>
          );

        case 'select':
          return (
            <div className="w-full">
              {props.label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                  {props.label}
                </label>
              )}
              <div className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 flex items-center justify-between pointer-events-none">
                <span>{props.options?.[0] || 'Select Option'}</span>
                <ChevronDown size={14} className="text-zinc-500" />
              </div>
            </div>
          );

        case 'badge':
          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{props.text || 'Badge'}</span>
            </div>
          );

        case 'metric':
          return (
            <div className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-md">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                {props.metricLabel || 'Active Metric'}
              </span>
              <div className="text-2xl font-bold text-white mt-1 font-mono">
                {props.metricValue || '1,280'}
              </div>
              {props.metricTrend && (
                <div className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>{props.metricTrend}</span>
                </div>
              )}
            </div>
          );

        case 'image':
          return (
            <div className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
              <img
                src={props.imageUrl}
                alt={props.imageAlt || 'Media'}
                className="w-full h-44 object-cover"
              />
            </div>
          );

        case 'divider':
          return <hr className="w-full border-zinc-800 my-2" />;

        case 'toggle':
          return (
            <div className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900">
              <div>
                <div className="text-xs font-medium text-white">{props.label || 'Toggle'}</div>
                {props.subtext && <div className="text-[10px] text-zinc-400 mt-0.5">{props.subtext}</div>}
              </div>
              <div className="w-8 h-4 rounded-full p-0.5 bg-blue-600 transition">
                <div className="w-3 h-3 rounded-full bg-white translate-x-4 transition"></div>
              </div>
            </div>
          );

        case 'table':
          return (
            <div className="w-full border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/60">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-800/80 text-[10px] uppercase text-zinc-400 font-semibold border-b border-zinc-800">
                  <tr>
                    {(props.tableHeaders || []).map((h, i) => (
                      <th key={i} className="px-3.5 py-2 font-mono">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-mono text-[11px]">
                  {(props.tableRows || []).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-800/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 text-zinc-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div
        key={element.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(element.id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
          }
        }}
        style={elementStyle}
        className={`relative group rounded-xl transition cursor-pointer ${
          isSelected
            ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/10'
            : 'hover:ring-1 hover:ring-zinc-600'
        }`}
      >
        {/* Floating HUD above selected element */}
        {isSelected && (
          <div className="absolute -top-7 left-0 right-0 z-30 flex items-center justify-between px-1 pointer-events-auto">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-mono font-medium shadow-md">
              <span>{element.type}</span>
              <span className="opacity-70">#{element.id.slice(-4)}</span>
              {element.locked && <Lock size={10} />}
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-md p-0.5 shadow-lg">
              {onGroupSelected && (
                <button
                  type="button"
                  aria-label="Group into container"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGroupSelected(element.id);
                  }}
                  className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                  title="Wrap in Flex Container"
                >
                  <FolderPlus size={11} />
                </button>
              )}
              <button
                type="button"
                aria-label="Move up"
                disabled={index === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveElement(index, 'up');
                }}
                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={index === elements.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveElement(index, 'down');
                }}
                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 rounded hover:bg-zinc-800 transition"
              >
                <ChevronDown size={12} />
              </button>
              <button
                type="button"
                aria-label="Duplicate"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateElement(element.id);
                }}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
              >
                <Copy size={12} />
              </button>
              <button
                type="button"
                aria-label="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteElement(element.id);
                }}
                className="p-1 text-zinc-400 hover:text-red-400 rounded hover:bg-red-500/10 transition"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="p-1.5">{renderInnerContent()}</div>
      </div>
    );
  };

  return (
    <div
      onClick={() => {
        if (!longPressTriggeredRef.current) {
          onSelectElement(null);
        }
        longPressTriggeredRef.current = false;
      }}
      onTouchStart={handleTouchStartEmpty}
      onTouchMove={handleTouchMoveEmpty}
      onTouchEnd={handleTouchEndEmpty}
      onTouchCancel={handleTouchEndEmpty}
      onMouseDown={handleMouseDownEmpty}
      onMouseMove={handleMouseMoveEmpty}
      onMouseUp={handleMouseUpEmpty}
      onContextMenu={(e) => {
        e.preventDefault();
        triggerQuickAdd(e.clientX, e.clientY);
      }}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, null)}
      className="flex-1 overflow-auto bg-[#09090b] flex flex-col items-center p-8 relative select-none"
      style={{
        backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      data-testid="canvas-area"
      data-empty-canvas="true"
    >
      {/* Canvas Top Screen Header Indicator */}
      <div className="mb-4 flex items-center justify-between w-full max-w-4xl px-2 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="font-semibold text-zinc-200">Screen: {activePage.name}</span>
          <span className="font-mono text-[10px] text-zinc-500">({activePage.path})</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-500">
          <span className="hidden sm:inline text-zinc-400">Long-press canvas for Quick Add</span>
          <span>{viewport.toUpperCase()} • {zoom}%</span>
        </div>
      </div>

      {/* Scaled Device Frame */}
      <div
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out',
        }}
        className="w-full flex justify-center"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!longPressTriggeredRef.current) {
              onSelectElement(null);
            }
            longPressTriggeredRef.current = false;
          }}
          onTouchStart={handleTouchStartEmpty}
          onTouchMove={handleTouchMoveEmpty}
          onTouchEnd={handleTouchEndEmpty}
          onTouchCancel={handleTouchEndEmpty}
          onMouseDown={handleMouseDownEmpty}
          onMouseMove={handleMouseMoveEmpty}
          onMouseUp={handleMouseUpEmpty}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerQuickAdd(e.clientX, e.clientY);
          }}
          style={{ backgroundColor: canvasBg }}
          className={`w-full transition-all duration-200 ${getViewportWidthClass()} ${getPaddingClass()} flex flex-col space-y-4`}
          data-testid="canvas-device-frame"
          data-empty-canvas="true"
        >
          {elements.length === 0 ? (
            /* Empty State */
            <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-950/40">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 mb-3">
                <Sparkles size={22} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">{activePage.name} Screen is Empty</h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                Insert components from the left library, long-press empty canvas to Quick Add, or drop containers.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDropComponent('heading');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-1 cursor-pointer transition"
                >
                  <Plus size={13} />
                  <span>Add Heading</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDropComponent('button');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Plus size={13} />
                  <span>Add Button</span>
                </button>
              </div>
            </div>
          ) : (
            elements.map((el, idx) => renderComponent(el, idx, false))
          )}
        </div>
      </div>

      {/* Mobile Quick Add Floating Action Trigger */}
      <div className="fixed bottom-16 left-4 z-40 sm:bottom-18">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            triggerQuickAdd(cx, cy);
          }}
          className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-xl shadow-blue-600/30 border border-blue-400/30 active:scale-95 transition-all cursor-pointer group"
          title="Quick Add (or long-press empty space on canvas)"
          data-testid="mobile-quick-add-fab"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Plus size={13} className="text-white group-hover:rotate-90 transition-transform duration-200" />
          </div>
          <span className="font-semibold text-xs tracking-wide">Quick Add</span>
        </button>
      </div>

      {/* Circular Quick Add Radial Menu */}
      <QuickAddRadialMenu
        isOpen={isQuickAddOpen}
        position={quickAddPos}
        onClose={() => setIsQuickAddOpen(false)}
        onSelectComponent={(type) => {
          onDropComponent(type, null);
          setIsQuickAddOpen(false);
        }}
        activePageName={activePage.name}
      />
    </div>
  );
};
