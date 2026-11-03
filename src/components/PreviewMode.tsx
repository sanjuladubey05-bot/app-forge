import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Info,
  X, 
  ArrowUpRight, 
  TrendingUp, 
  ChevronDown,
  Home,
  Compass,
  FileCode2,
  Box
} from 'lucide-react';
import { ActionStep, CanvasElement, Project, ViewportMode } from '../types/editor';
import { ensureProjectPages, evaluateCondition } from '../utils/project-engine';

interface PreviewModeProps {
  project: Project;
  onExitPreview: () => void;
  onLogExecution?: (source: string, message: string, type: any, status: any) => void;
}

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ModalState {
  isOpen: boolean;
  title: string;
  content: string;
}

export const PreviewMode: React.FC<PreviewModeProps> = ({ 
  project: rawProject, 
  onExitPreview,
  onLogExecution 
}) => {
  const project = ensureProjectPages(rawProject);
  const [activePageId, setActivePageId] = useState<string>(project.homePageId);
  const [viewport, setViewport] = useState<ViewportMode>(project.viewport);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, title: '', content: '' });
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [dynamicVisibility, setDynamicVisibility] = useState<Record<string, boolean>>({});

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  const showToast = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const log = (source: string, msg: string, type: any = 'action', status: any = 'success') => {
    if (onLogExecution) onLogExecution(source, msg, type, status);
  };

  // Execute an action pipeline
  const executeActionStep = (step: ActionStep, sourceName: string) => {
    switch (step.type) {
      case 'navigate': {
        if (step.targetPageId) {
          const target = project.pages.find((p) => p.id === step.targetPageId);
          if (target) {
            setActivePageId(target.id);
            showToast(`Navigated to: ${target.name}`, 'info');
            log(sourceName, `Navigated to screen "${target.name}" (${target.path})`, 'navigation', 'success');
          }
        }
        break;
      }

      case 'toast': {
        const msg = step.toastMessage || 'Action executed';
        showToast(msg, step.toastType || 'info');
        log(sourceName, `Triggered toast: "${msg}"`, 'action', 'success');
        break;
      }

      case 'openModal': {
        setModal({
          isOpen: true,
          title: step.modalTitle || 'Popup Dialog',
          content: step.modalContent || 'This popup was triggered by an AppForge action.',
        });
        log(sourceName, `Opened modal "${step.modalTitle}"`, 'modal', 'info');
        break;
      }

      case 'closeModal': {
        setModal({ isOpen: false, title: '', content: '' });
        log(sourceName, 'Closed modal dialog', 'modal', 'info');
        break;
      }

      case 'submitForm': {
        showToast(step.toastMessage || 'Form submitted successfully!', 'success');
        log(sourceName, 'Form validated & submitted', 'form', 'success');
        break;
      }

      case 'toggleVisibility': {
        if (step.targetElementId) {
          setDynamicVisibility((prev) => ({
            ...prev,
            [step.targetElementId!]: !prev[step.targetElementId!],
          }));
          log(sourceName, `Toggled visibility for element #${step.targetElementId}`, 'action', 'info');
        }
        break;
      }

      case 'downloadFile': {
        const blob = new Blob([step.fileData || 'AppForge Export'], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = step.fileName || 'export.txt';
        a.click();
        URL.revokeObjectURL(url);
        showToast(`Downloaded ${step.fileName || 'file'}`, 'success');
        log(sourceName, `Downloaded file "${step.fileName}"`, 'action', 'success');
        break;
      }

      case 'condition': {
        const result = evaluateCondition(step.condition, formValues);
        log(sourceName, `Evaluated IF condition: ${result ? 'TRUE' : 'FALSE'}`, 'condition', result ? 'success' : 'warning');
        const branch = result ? step.thenActions : step.elseActions;
        if (branch && branch.length > 0) {
          branch.forEach((subStep) => executeActionStep(subStep, sourceName));
        }
        break;
      }

      default:
        showToast('Action triggered');
    }
  };

  const handleElementClick = (element: CanvasElement) => {
    // Check modern interactions
    if (element.interactions && element.interactions.length > 0) {
      const clickInter = element.interactions.find((i) => i.trigger === 'onClick');
      if (clickInter && clickInter.steps.length > 0) {
        clickInter.steps.forEach((step) => executeActionStep(step, element.name));
        return;
      }
    }

    // Fallback to legacy events
    if (element.events && element.events.length > 0) {
      element.events.forEach((ev) => {
        showToast(ev.actionPayload || 'Action fired', 'info');
      });
      return;
    }

    showToast(`Clicked ${element.name} (No interaction configured)`);
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

  const renderComponent = (element: CanvasElement) => {
    // Check responsive visibility
    if (viewport === 'mobile' && element.styles.hideOnMobile) return null;
    if (viewport === 'desktop' && element.styles.hideOnDesktop) return null;

    // Check dynamic visibility state
    const isHidden = dynamicVisibility[element.id] !== undefined ? dynamicVisibility[element.id] : element.hidden;
    if (isHidden) return null;

    const { type, props, styles } = element;

    switch (type) {
      case 'heading': {
        const Tag = props.headingLevel || 'h1';
        const sizeClass =
          styles.fontSize === '4xl' ? 'text-4xl' : styles.fontSize === '3xl' ? 'text-3xl' : styles.fontSize === '2xl' ? 'text-2xl' : 'text-xl';
        return (
          <div key={element.id} className="w-full">
            <Tag style={{ color: styles.textColor || '#ffffff' }} className={`${sizeClass} font-bold tracking-tight leading-tight`}>
              {props.text || 'Heading'}
            </Tag>
            {props.subtext && <p className="text-zinc-400 mt-1 text-sm leading-relaxed">{props.subtext}</p>}
          </div>
        );
      }

      case 'text':
        return (
          <p key={element.id} style={{ color: styles.textColor || '#a1a1aa' }} className="text-sm md:text-base leading-relaxed">
            {props.text || 'Paragraph text'}
          </p>
        );

      case 'button':
        return (
          <button
            key={element.id}
            type="button"
            onClick={() => handleElementClick(element)}
            style={{ backgroundColor: styles.backgroundColor || '#3b82f6', color: styles.textColor || '#ffffff' }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition hover:opacity-90 active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{props.text || 'Button'}</span>
            <ArrowUpRight size={14} className="opacity-70" />
          </button>
        );

      case 'card':
      case 'container': {
        const isFlexRow = props.direction === 'row';
        const gapClass = props.gap === 'sm' ? 'gap-2' : props.gap === 'lg' ? 'gap-6' : 'gap-4';

        return (
          <div
            key={element.id}
            style={{ backgroundColor: styles.backgroundColor || '#18181b', borderColor: styles.borderColor || '#27272a' }}
            className={`w-full p-5 rounded-xl border shadow-lg flex ${isFlexRow ? 'flex-row items-center flex-wrap' : 'flex-col'} ${gapClass}`}
          >
            {type === 'card' && props.text && (
              <div className="w-full mb-1">
                <h4 className="text-base font-semibold text-white">{props.text}</h4>
                {props.subtext && <p className="text-xs text-zinc-400">{props.subtext}</p>}
              </div>
            )}
            {element.children && element.children.length > 0 && element.children.map((c) => renderComponent(c))}
          </div>
        );
      }

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
              onChange={(e) => setFormValues({ ...formValues, [element.id]: e.target.value })}
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
              onChange={(e) => setFormValues({ ...formValues, [element.id]: e.target.value })}
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
              onChange={(e) => setFormValues({ ...formValues, [element.id]: e.target.value })}
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
          <div key={element.id} className="w-full p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-md">
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
            <img src={props.imageUrl} alt={props.imageAlt || 'Media'} className="w-full h-48 object-cover" />
          </div>
        );

      case 'divider':
        return <hr key={element.id} className="w-full border-zinc-800 my-2" />;

      case 'toggle': {
        const isChecked = formValues[element.id] !== undefined ? formValues[element.id] : props.toggleChecked ?? true;
        return (
          <div
            key={element.id}
            onClick={() => setFormValues({ ...formValues, [element.id]: !isChecked })}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900 cursor-pointer hover:bg-zinc-800/80 transition"
          >
            <div>
              <div className="text-xs font-medium text-white">{props.label || 'Toggle'}</div>
              {props.subtext && <div className="text-[10px] text-zinc-400 mt-0.5">{props.subtext}</div>}
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition ${isChecked ? 'bg-blue-600' : 'bg-zinc-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition ${isChecked ? 'translate-x-4' : 'translate-x-0'}`}></div>
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
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col select-none">
      {/* Top Prototype Navigation Bar */}
      <header className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-200 transition cursor-pointer border border-zinc-800"
          >
            <ArrowLeft size={14} />
            <span>Exit Studio</span>
          </button>

          <div className="h-4 w-px bg-zinc-800"></div>

          {/* Screen Pills for Multi-Page Jumping */}
          <div className="flex items-center gap-1.5">
            {project.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePageId(p.id);
                  showToast(`Switched screen to ${p.name}`);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  p.id === activePageId
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {p.id === project.homePageId && <Home size={11} className="text-amber-400" />}
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Viewport switch and reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewport('desktop')}
              title="Desktop"
              className={`p-1 rounded transition cursor-pointer ${
                viewport === 'desktop' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              title="Tablet"
              className={`p-1 rounded transition cursor-pointer ${
                viewport === 'tablet' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Tablet size={14} />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              title="Mobile"
              className={`p-1 rounded transition cursor-pointer ${
                viewport === 'mobile' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
            </button>
          </div>

          <button
            onClick={() => {
              setFormValues({});
              setDynamicVisibility({});
              setActivePageId(project.homePageId);
              showToast('Prototype state restored to start screen.', 'info');
            }}
            title="Reset prototype state"
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </header>

      {/* Main Surface */}
      <main className="flex-1 overflow-auto flex items-center justify-center p-6 bg-zinc-950">
        <div
          style={{ backgroundColor: activePage.canvasBg || project.canvasBg }}
          className={`w-full transition-all duration-200 ${getViewportWidthClass()} ${getPaddingClass()} flex flex-col space-y-4`}
        >
          {activePage.elements.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 text-sm">
              Screen {activePage.name} has no visible components.
            </div>
          ) : (
            activePage.elements.map((el) => renderComponent(el))
          )}
        </div>
      </main>

      {/* Popup Modal Dialog Overlay */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">{modal.title}</h3>
              <button
                onClick={() => setModal({ isOpen: false, title: '', content: '' })}
                className="text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{modal.content}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModal({ isOpen: false, title: '', content: '' })}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900 border shadow-2xl text-xs font-medium pointer-events-auto ${
              toast.type === 'success'
                ? 'border-emerald-500/50 text-emerald-300'
                : toast.type === 'error'
                ? 'border-red-500/50 text-red-300'
                : toast.type === 'warning'
                ? 'border-amber-500/50 text-amber-300'
                : 'border-blue-500/50 text-blue-300'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            ) : toast.type === 'error' ? (
              <AlertCircle size={15} className="shrink-0 text-red-400" />
            ) : (
              <Info size={15} className="shrink-0 text-blue-400" />
            )}
            <span className="flex-1 text-white">{toast.text}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-zinc-500 hover:text-white cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
