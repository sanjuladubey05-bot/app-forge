import React from 'react';
import { 
  CanvasElement, 
  ComponentType, 
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
  Lock
} from 'lucide-react';

interface CanvasAreaProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onMoveElement: (index: number, direction: 'up' | 'down') => void;
  onDropComponent: (type: ComponentType) => void;
  viewport: ViewportMode;
  zoom: number;
  canvasBg: string;
  canvasPadding: string;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onDeleteElement,
  onDuplicateElement,
  onMoveElement,
  onDropComponent,
  viewport,
  zoom,
  canvasBg,
  canvasPadding,
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain') as ComponentType;
    if (type) {
      onDropComponent(type);
    }
  };

  // Viewport width styling
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

  const renderComponentContent = (element: CanvasElement) => {
    const { type, props, styles } = element;

    switch (type) {
      case 'heading': {
        const Tag = props.headingLevel || 'h1';
        const sizeClass =
          styles.fontSize === '4xl'
            ? 'text-4xl'
            : styles.fontSize === '2xl'
            ? 'text-2xl'
            : styles.fontSize === 'xl'
            ? 'text-xl'
            : 'text-3xl';

        return (
          <div className="w-full">
            <Tag
              style={{
                color: styles.textColor || '#ffffff',
                textAlign: styles.textAlign || 'left',
              }}
              className={`${sizeClass} font-bold tracking-tight leading-tight`}
            >
              {props.text || 'Heading Text'}
            </Tag>
            {props.subtext && (
              <p
                style={{ textAlign: styles.textAlign || 'left' }}
                className="text-zinc-400 mt-1 text-sm leading-relaxed"
              >
                {props.subtext}
              </p>
            )}
          </div>
        );
      }

      case 'text':
        return (
          <p
            style={{
              color: styles.textColor || '#a1a1aa',
              textAlign: styles.textAlign || 'left',
            }}
            className="text-sm md:text-base leading-relaxed"
          >
            {props.text || 'Paragraph text content goes here...'}
          </p>
        );

      case 'button': {
        const bg = styles.backgroundColor || '#3b82f6';
        const color = styles.textColor || '#ffffff';
        return (
          <button
            type="button"
            style={{
              backgroundColor: bg,
              color: color,
            }}
            className="px-5 py-2.5 rounded-lg text-sm font-medium shadow-md transition pointer-events-none inline-flex items-center gap-1.5"
          >
            <span>{props.text || 'Button'}</span>
            <ArrowUpRight size={14} className="opacity-70" />
          </button>
        );
      }

      case 'card':
        return (
          <div
            style={{
              backgroundColor: styles.backgroundColor || '#18181b',
              borderColor: styles.borderColor || '#27272a',
            }}
            className="w-full p-5 rounded-xl border shadow-lg"
          >
            <h4 className="text-base font-semibold text-white mb-1.5">
              {props.text || 'Card Title'}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {props.subtext || 'Organize metrics, settings or data containers neatly inside this card.'}
            </p>
          </div>
        );

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
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 pointer-events-none"
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
              placeholder={props.placeholder || 'Enter message...'}
              className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 pointer-events-none resize-none"
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
            <span>{props.text || 'Badge Tag'}</span>
          </div>
        );

      case 'metric':
        return (
          <div className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-md">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              {props.metricLabel || 'Total Revenue'}
            </span>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {props.metricValue || '$42,500'}
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
              alt={props.imageAlt || 'Media preview'}
              className="w-full h-44 object-cover"
              onError={(e) => {
                // fallback if broken
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
        );

      case 'divider':
        return <hr className="w-full border-zinc-800 my-2" />;

      case 'toggle':
        return (
          <div className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900">
            <div>
              <div className="text-xs font-medium text-white">{props.label || 'Toggle Setting'}</div>
              {props.subtext && <div className="text-[10px] text-zinc-400 mt-0.5">{props.subtext}</div>}
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition ${props.toggleChecked ? 'bg-blue-600' : 'bg-zinc-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition ${props.toggleChecked ? 'translate-x-4' : 'translate-x-0'}`}></div>
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
        return <div className="text-xs text-zinc-400">Component: {element.name}</div>;
    }
  };

  return (
    <div
      onClick={() => onSelectElement(null)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-1 overflow-auto bg-[#09090b] flex items-start justify-center p-8 relative select-none"
      style={{
        backgroundImage: 'radial-gradient(#27272a 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Zoom wrapper */}
      <div
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
        className="w-full flex justify-center py-4"
      >
        {/* Device Frame */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            // clicking frame background unselects child
            onSelectElement(null);
          }}
          style={{ backgroundColor: canvasBg }}
          className={`w-full transition-all duration-200 ${getViewportWidthClass()} ${getPaddingClass()} flex flex-col space-y-4`}
        >
          {elements.length === 0 ? (
            /* Empty Canvas State */
            <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-zinc-800 rounded-2xl p-6 bg-zinc-950/40">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-blue-400 mb-3">
                <Sparkles size={22} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">Canvas is Ready</h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                Drag components from the library or click to insert. Customize styles and events in the right panel.
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
            /* Elements List */
            elements.map((element, index) => {
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
                      <span>{element.name} (Hidden)</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectElement(element.id);
                      }}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Inspect
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={element.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectElement(element.id);
                  }}
                  className={`relative group rounded-xl transition cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/10'
                      : 'hover:ring-1 hover:ring-zinc-600'
                  }`}
                >
                  {/* Floating Action HUD when selected */}
                  {isSelected && (
                    <div className="absolute -top-7 left-0 right-0 z-30 flex items-center justify-between px-1 pointer-events-auto">
                      {/* Component Tag */}
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-mono font-medium shadow-md">
                        <span>{element.type}</span>
                        <span className="opacity-70">#{element.id.slice(-4)}</span>
                        {element.locked && <Lock size={10} />}
                      </div>

                      {/* Quick Actions (Move up/down, duplicate, delete) */}
                      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700/80 rounded-md p-0.5 shadow-lg">
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
                          aria-label="Duplicate component"
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
                          aria-label="Delete component"
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

                  {/* Component Render Target */}
                  <div className="p-1.5">
                    {renderComponentContent(element)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
