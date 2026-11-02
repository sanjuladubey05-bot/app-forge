import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  ArrowUpRight, 
  TrendingUp, 
  ChevronDown
} from 'lucide-react';
import { Project, ViewportMode } from '../types/editor';

interface PreviewModeProps {
  project: Project;
  onExitPreview: () => void;
}

interface ToastMessage {
  id: string;
  text: string;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({ project, onExitPreview }) => {
  const [viewport, setViewport] = useState<ViewportMode>(project.viewport);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  const showToast = (text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const handleElementAction = (events: typeof project.elements[0]['events']) => {
    if (!events || events.length === 0) {
      showToast('Interaction triggered (No custom event configured).');
      return;
    }

    events.forEach((ev) => {
      if (ev.action === 'toast' || ev.action === 'alert') {
        showToast(ev.actionPayload || 'Event executed!');
      } else if (ev.action === 'link') {
        showToast(`Navigating to: ${ev.actionPayload || 'https://example.com'}`);
      } else {
        showToast(`Event: ${ev.action}`);
      }
    });
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
    switch (project.canvasPadding) {
      case 'sm':
        return 'p-4';
      case 'xl':
        return 'p-10';
      default:
        return 'p-6';
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col select-none">
      {/* Top Preview Bar */}
      <header className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition cursor-pointer border border-zinc-800"
          >
            <ArrowLeft size={14} />
            <span>Exit Preview</span>
          </button>

          <div className="h-4 w-px bg-zinc-800"></div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-xs font-semibold text-zinc-100">{project.name}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              LIVE PREVIEW MODE
            </span>
          </div>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewport('desktop')}
              title="Desktop"
              className={`p-1 rounded transition ${
                viewport === 'desktop' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              title="Tablet"
              className={`p-1 rounded transition ${
                viewport === 'tablet' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Mobile"
              className={`p-1 rounded transition ${
                viewport === 'mobile' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              setFormValues({});
              showToast('Preview state reset.');
            }}
            title="Reset form values"
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </header>

      {/* Main Preview Surface */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-6 bg-zinc-950">
        <div
          style={{ backgroundColor: project.canvasBg }}
          className={`w-full transition-all duration-200 ${getViewportWidthClass()} ${getPaddingClass()} flex flex-col space-y-4`}
        >
          {project.elements.filter((el) => !el.hidden).length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-sm">
              This application has no visible components.
            </div>
          ) : (
            project.elements
              .filter((el) => !el.hidden)
              .map((element) => {
                const { type, props, styles, events } = element;

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
                      <div key={element.id} className="w-full">
                        <Tag
                          style={{
                            color: styles.textColor || '#ffffff',
                            textAlign: styles.textAlign || 'left',
                          }}
                          className={`${sizeClass} font-bold tracking-tight leading-tight`}
                        >
                          {props.text || 'Heading'}
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
                        key={element.id}
                        style={{
                          color: styles.textColor || '#a1a1aa',
                          textAlign: styles.textAlign || 'left',
                        }}
                        className="text-sm md:text-base leading-relaxed"
                      >
                        {props.text || 'Text block'}
                      </p>
                    );

                  case 'button': {
                    const bg = styles.backgroundColor || '#3b82f6';
                    const color = styles.textColor || '#ffffff';
                    return (
                      <button
                        key={element.id}
                        type="button"
                        onClick={() => handleElementAction(events)}
                        style={{
                          backgroundColor: bg,
                          color: color,
                        }}
                        className="px-5 py-2.5 rounded-lg text-sm font-medium shadow-md transition hover:opacity-90 active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{props.text || 'Button'}</span>
                        <ArrowUpRight size={14} className="opacity-70" />
                      </button>
                    );
                  }

                  case 'card':
                    return (
                      <div
                        key={element.id}
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
                          {props.subtext || 'Card description content.'}
                        </p>
                      </div>
                    );

                  case 'input':
                    return (
                      <div key={element.id} className="w-full">
                        {props.label && (
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                            {props.label}
                          </label>
                        )}
                        <input
                          type="text"
                          value={formValues[element.id] || ''}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [element.id]: e.target.value })
                          }
                          placeholder={props.placeholder || 'Type here...'}
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    );

                  case 'textarea':
                    return (
                      <div key={element.id} className="w-full">
                        {props.label && (
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                            {props.label}
                          </label>
                        )}
                        <textarea
                          rows={3}
                          value={formValues[element.id] || ''}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [element.id]: e.target.value })
                          }
                          placeholder={props.placeholder || 'Type your message...'}
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                        />
                      </div>
                    );

                  case 'select':
                    return (
                      <div key={element.id} className="w-full">
                        {props.label && (
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
                            {props.label}
                          </label>
                        )}
                        <select
                          value={formValues[element.id] || props.options?.[0] || ''}
                          onChange={(e) =>
                            setFormValues({ ...formValues, [element.id]: e.target.value })
                          }
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-blue-500 transition"
                        >
                          {(props.options || []).map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    );

                  case 'badge':
                    return (
                      <div key={element.id} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span>{props.text || 'Badge'}</span>
                      </div>
                    );

                  case 'metric':
                    return (
                      <div
                        key={element.id}
                        className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-md"
                      >
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                          {props.metricLabel || 'Metric'}
                        </span>
                        <div className="text-2xl font-bold text-white mt-1 font-mono">
                          {props.metricValue || '0'}
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
                      <div key={element.id} className="w-full overflow-hidden rounded-xl border border-zinc-800">
                        <img
                          src={props.imageUrl}
                          alt={props.imageAlt || 'Media'}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    );

                  case 'divider':
                    return <hr key={element.id} className="w-full border-zinc-800 my-2" />;

                  case 'toggle': {
                    const isChecked =
                      formValues[element.id] !== undefined
                        ? formValues[element.id]
                        : props.toggleChecked ?? true;
                    return (
                      <div
                        key={element.id}
                        onClick={() =>
                          setFormValues({ ...formValues, [element.id]: !isChecked })
                        }
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900 cursor-pointer hover:bg-zinc-800/80 transition"
                      >
                        <div>
                          <div className="text-xs font-medium text-white">{props.label || 'Toggle'}</div>
                          {props.subtext && (
                            <div className="text-[10px] text-zinc-400 mt-0.5">{props.subtext}</div>
                          )}
                        </div>
                        <div
                          className={`w-8 h-4 rounded-full p-0.5 transition ${
                            isChecked ? 'bg-blue-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white transition ${
                              isChecked ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          ></div>
                        </div>
                      </div>
                    );
                  }

                  case 'table':
                    return (
                      <div key={element.id} className="w-full border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/60">
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
              })
          )}
        </div>
      </main>

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border border-blue-500/40 text-white shadow-2xl text-xs font-medium animate-in slide-in-from-bottom-2 fade-in duration-150 pointer-events-auto"
          >
            <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
            <span className="flex-1">{toast.text}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-zinc-500 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
