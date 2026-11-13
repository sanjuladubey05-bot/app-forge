/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  TrendingUp,
  ExternalLink,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { ActionStep, CanvasElement, Project } from '../types/editor';
import { ensureProjectPages, evaluateCondition, getPageTransitionClass, sanitizeUrl } from '../utils/project-engine';
import { ensureComplianceConfig } from '../utils/compliance-audit';
import { ComplianceHubModal, ComplianceTabId } from './ComplianceHubModal';
import { CookieConsentBanner } from './CookieConsentBanner';
import { Widget3DSandbox } from './Widget3DSandbox';

interface PublicViewerProps {
  project: Project;
  isLoading?: boolean;
  error?: string | null;
  onOpenInStudio: () => void;
}

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const PublicViewer: React.FC<PublicViewerProps> = ({
  project: rawProject,
  isLoading = false,
  error = null,
  onOpenInStudio,
}) => {
  const project = ensureProjectPages(rawProject);
  const [activePageId, setActivePageId] = useState<string>(project.homePageId || project.pages[0]?.id);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formConsentChecked, setFormConsentChecked] = useState<boolean>(false);
  const [formConsentError, setFormConsentError] = useState<string | null>(null);
  const [dynamicVisibility, setDynamicVisibility] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: '',
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [complianceTab, setComplianceTab] = useState<ComplianceTabId | null>(null);

  const compliance = ensureComplianceConfig(project);
  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];

  useEffect(() => {
    if (!activePage) return;
    const prevTitle = document.title;
    const seoTitle = activePage.seo?.title || `${activePage.name} · ${project.name}`;
    document.title = seoTitle;
    return () => {
      document.title = prevTitle;
    };
  }, [activePage, project.name]);

  const pageHasForm = React.useMemo(() => {
    const check = (els: CanvasElement[]): boolean =>
      els.some(
        (el) =>
          el.type === 'input' ||
          el.type === 'textarea' ||
          el.props.whenClicked === 'submitForm' ||
          (el.children && check(el.children))
      );
    return check(activePage?.elements || []);
  }, [activePage]);

  const validateFormConsent = (): boolean => {
    if (pageHasForm && compliance.requireFormConsent && !formConsentChecked) {
      const msg = compliance.collectsKidsData
        ? 'Please accept Privacy Policy, Terms, and verifiable Parental/Guardian Consent before submitting.'
        : `Please accept Privacy Policy, Terms, and confirm minimum age (${compliance.minimumAge}+) before submitting.`;
      setFormConsentError(msg);
      showToast(msg, 'warning');
      return false;
    }
    setFormConsentError(null);
    return true;
  };

  const showToast = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const executeStep = (step: ActionStep) => {
    switch (step.type) {
      case 'navigate':
        if (step.targetPageId) {
          const target = project.pages.find((p) => p.id === step.targetPageId);
          if (target) {
            setActivePageId(target.id);
            setMobileMenuOpen(false);
          }
        }
        break;
      case 'toast':
        showToast(step.toastMessage || 'Done!', step.toastType || 'info');
        break;
      case 'openModal':
        setModal({
          isOpen: true,
          title: step.modalTitle || 'Details',
          content: step.modalContent || 'Action completed.',
        });
        break;
      case 'closeModal':
        setModal({ isOpen: false, title: '', content: '' });
        break;
      case 'submitForm':
        if (!validateFormConsent()) break;
        showToast(step.toastMessage || 'Form submitted successfully!', 'success');
        break;
      case 'toggleVisibility':
        if (step.targetElementId) {
          setDynamicVisibility((prev) => ({
            ...prev,
            [step.targetElementId!]: !prev[step.targetElementId!],
          }));
        }
        break;
      case 'condition': {
        const res = evaluateCondition(step.condition, formValues);
        const branch = res ? step.thenActions : step.elseActions;
        branch?.forEach(executeStep);
        break;
      }
      default:
        break;
    }
  };

  const handleElementAction = (el: CanvasElement) => {
    const p = el.props;
    if (p.whenClicked && p.whenClicked !== 'none') {
      if (p.whenClicked === 'openPage' && p.targetPageId) {
        const target = project.pages.find((pg) => pg.id === p.targetPageId);
        if (target) {
          setActivePageId(target.id);
          return;
        }
      }
      if (p.whenClicked === 'openUrl' && p.targetUrl) {
        const safe = sanitizeUrl(p.targetUrl);
        if (safe !== '#') {
          window.location.assign(safe);
        }
        return;
      }
      if (p.whenClicked === 'showPopup') {
        setModal({
          isOpen: true,
          title: p.popupTitle || 'Notice',
          content: p.popupContent || 'Action executed.',
        });
        return;
      }
      if (p.whenClicked === 'showToast') {
        showToast(p.toastMessage || 'Action completed!', 'success');
        return;
      }
      if (p.whenClicked === 'submitForm') {
        if (!validateFormConsent()) return;
        showToast('Form submitted successfully!', 'success');
        return;
      }
    }

    if (el.interactions && el.interactions.length > 0) {
      const clickInter = el.interactions.find((i) => i.trigger === 'onClick');
      if (clickInter && clickInter.steps.length > 0) {
        clickInter.steps.forEach(executeStep);
        return;
      }
    }

    showToast(`${el.props.text || el.name}`, 'info');
  };

  const renderElement = (el: CanvasElement): React.ReactNode => {
    const hidden = dynamicVisibility[el.id] !== undefined ? dynamicVisibility[el.id] : el.hidden;
    if (hidden) return null;

    const { type, props, styles } = el;
    if (props.unknownType) {
      return (
        <div
          key={el.id}
          className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs flex items-center gap-2"
        >
          <AlertTriangle size={14} />
          <span>Unsupported node type preserved safely: {props.unknownType}</span>
        </div>
      );
    }

    switch (type) {
      case 'navbar':
        return (
          <nav
            key={el.id}
            style={{
              backgroundColor: styles.backgroundColor || '#121215',
              borderColor: styles.borderColor || '#27272a',
            }}
            className="w-full px-4 py-3 rounded-xl border flex flex-wrap items-center justify-between gap-3"
          >
            <span className="text-sm font-bold text-white">{props.brandName || project.name}</span>
            <div className="flex flex-wrap items-center gap-2">
              {(props.navLinks || []).map((link, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (link.targetPageId) setActivePageId(link.targetPageId);
                    else if (link.url) {
                      const safe = sanitizeUrl(link.url);
                      if (safe !== '#') window.location.assign(safe);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              {props.ctaLabel && (
                <button
                  type="button"
                  onClick={() => {
                    if (props.ctaTargetPageId) setActivePageId(props.ctaTargetPageId);
                    else showToast(props.ctaLabel || 'Action clicked', 'success');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  {props.ctaLabel}
                </button>
              )}
            </div>
            {el.children && el.children.length > 0 && el.children.map((c) => renderElement(c))}
          </nav>
        );

      case 'container':
      case 'card': {
        const isRow = props.direction === 'row';
        return (
          <div
            key={el.id}
            style={{
              backgroundColor: styles.backgroundColor || (type === 'card' ? '#18181b' : 'transparent'),
              borderColor: styles.borderColor || '#27272a',
            }}
            className={`w-full p-5 rounded-xl border flex ${
              isRow ? 'flex-row flex-wrap items-stretch' : 'flex-col'
            } gap-4`}
          >
            {type === 'card' && props.text && (
              <div className="w-full">
                <h3 className="text-base font-semibold text-white">{props.text}</h3>
                {props.subtext && <p className="text-xs text-zinc-400 mt-0.5">{props.subtext}</p>}
              </div>
            )}
            {(el.children || []).map((child) => (
              <div
                key={child.id}
                className={
                  isRow && child.styles?.width === 'third'
                    ? 'w-full md:w-[calc(33.333%-0.75rem)] min-w-0'
                    : isRow && child.styles?.width === 'half'
                    ? 'w-full sm:w-[calc(50%-0.5rem)] min-w-0'
                    : 'w-full min-w-0'
                }
              >
                {renderElement(child)}
              </div>
            ))}
          </div>
        );
      }

      case 'heading': {
        const Tag = props.headingLevel || 'h1';
        const sizeClass =
          styles.fontSize === '4xl' || Tag === 'h1'
            ? 'text-3xl sm:text-4xl'
            : Tag === 'h2'
            ? 'text-2xl'
            : 'text-xl';
        return (
          <div key={el.id} className={styles.textAlign === 'center' ? 'text-center' : 'text-left'}>
            <Tag style={{ color: styles.textColor || '#ffffff' }} className={`${sizeClass} font-bold tracking-tight`}>
              {props.text || 'Heading'}
            </Tag>
            {props.subtext && <p className="text-sm text-zinc-400 mt-1.5">{props.subtext}</p>}
          </div>
        );
      }

      case 'text':
        return (
          <p key={el.id} style={{ color: styles.textColor || '#a1a1aa' }} className="text-sm sm:text-base leading-relaxed">
            {props.text}
          </p>
        );

      case 'button':
        return (
          <button
            key={el.id}
            type="button"
            onClick={() => handleElementAction(el)}
            style={{
              backgroundColor: styles.backgroundColor || '#2563eb',
              color: styles.textColor || '#ffffff',
            }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:opacity-90 active:scale-95 transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>{props.text || 'Button'}</span>
            <ArrowUpRight size={14} />
          </button>
        );

      case 'badge':
        return (
          <span
            key={el.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30"
          >
            {props.text || 'Badge'}
          </span>
        );

      case 'metric':
        return (
          <div key={el.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="text-[11px] uppercase tracking-wider text-zinc-400">{props.metricLabel || 'Metric'}</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">{props.metricValue || '0'}</div>
            {props.metricTrend && (
              <div className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                <TrendingUp size={12} />
                <span>{props.metricTrend}</span>
              </div>
            )}
          </div>
        );

      case 'input':
        return (
          <label key={el.id} className="block space-y-1.5">
            {props.label && <span className="block text-xs font-medium text-zinc-300">{props.label}</span>}
            <input
              type="text"
              value={formValues[el.id] || ''}
              onChange={(e) => setFormValues({ ...formValues, [el.id]: e.target.value })}
              placeholder={props.placeholder || ''}
              className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </label>
        );

      case 'textarea':
        return (
          <label key={el.id} className="block space-y-1.5">
            {props.label && <span className="block text-xs font-medium text-zinc-300">{props.label}</span>}
            <textarea
              rows={3}
              value={formValues[el.id] || ''}
              onChange={(e) => setFormValues({ ...formValues, [el.id]: e.target.value })}
              placeholder={props.placeholder || ''}
              className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </label>
        );

      case 'select':
        return (
          <label key={el.id} className="block space-y-1.5">
            {props.label && <span className="block text-xs font-medium text-zinc-300">{props.label}</span>}
            <select
              value={formValues[el.id] || props.options?.[0] || ''}
              onChange={(e) => setFormValues({ ...formValues, [el.id]: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white"
            >
              {(props.options || []).map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        );

      case 'toggle': {
        const checked = formValues[el.id] !== undefined ? formValues[el.id] : props.toggleChecked ?? false;
        return (
          <button
            key={el.id}
            type="button"
            role="switch"
            aria-checked={Boolean(checked)}
            onClick={() => setFormValues({ ...formValues, [el.id]: !checked })}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900 text-left cursor-pointer"
          >
            <div>
              <div className="text-xs font-medium text-white">{props.label || 'Toggle'}</div>
              {props.subtext && <div className="text-[11px] text-zinc-400">{props.subtext}</div>}
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition ${checked ? 'bg-blue-600' : 'bg-zinc-700'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>
        );
      }

      case 'image':
        return (
          <div key={el.id} className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <img
              src={sanitizeUrl(props.imageUrl)}
              alt={props.imageAlt || 'Application visual asset'}
              className="w-full h-56 object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        );

      case 'divider':
        return <hr key={el.id} className="w-full border-zinc-800 my-3" />;

      case 'table':
        return (
          <div key={el.id} className="w-full border border-zinc-800 rounded-xl overflow-x-auto bg-zinc-900">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-800/80 text-[10px] uppercase text-zinc-400">
                <tr>
                  {(props.tableHeaders || []).map((h, i) => (
                    <th key={i} className="px-3.5 py-2.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {(props.tableRows || []).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'widget3d':
        return (
          <Widget3DSandbox
            key={el.id}
            config={props.widget3d}
            themeTokens={project.themeTokens}
            interactive={true}
          />
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center text-sm">
        Loading published AppForge experience...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle size={32} className="text-amber-400" />
        <h1 className="text-lg font-semibold text-white">Published Project Unavailable</h1>
        <p className="text-xs text-zinc-400 max-w-md">{error}</p>
        <button
          type="button"
          onClick={onOpenInStudio}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
        >
          Open AppForge Studio
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans" data-testid="public-viewer">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-xs font-semibold"
      >
        Skip to main content
      </a>
      {/* Clean Public Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-semibold text-sm text-white truncate">{project.name}</span>
          </div>

          {/* Desktop Multi-Page Routes */}
          <nav className="hidden sm:flex items-center gap-1" aria-label="Published Site Navigation">
            {project.pages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePageId(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  p.id === activePage?.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {p.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenInStudio}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
            >
              <span>Open in Studio</span>
              <ExternalLink size={12} />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              className="sm:hidden p-2 rounded-lg border border-zinc-800 text-zinc-300"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-zinc-800 px-4 py-3 flex flex-col gap-1 bg-zinc-900">
            {project.pages.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePageId(p.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                  p.id === activePage?.id ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {p.name}
              </button>
            ))}
            <button
              type="button"
              onClick={onOpenInStudio}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-blue-400 hover:bg-zinc-800 mt-1"
            >
              Open in AppForge Studio →
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div
          key={activePage?.id}
          style={{ backgroundColor: activePage?.canvasBg || project.themeTokens?.backgroundColor || project.canvasBg || '#0f0f12' }}
          className={`rounded-2xl border border-zinc-800/80 p-5 sm:p-8 space-y-5 shadow-2xl ${getPageTransitionClass(activePage?.transition)}`}
          data-testid="public-page-container"
          data-page-transition={activePage?.transition || 'fade'}
        >
          {activePage && activePage.elements.length > 0 ? (
            <>
              {activePage.elements.map((el) => renderElement(el))}
              {pageHasForm && compliance.requireFormConsent && (
                <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/90 space-y-1.5">
                  <label className="flex items-start gap-2.5 text-xs text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      data-testid="public-form-consent-checkbox"
                      checked={formConsentChecked}
                      onChange={(e) => {
                        setFormConsentChecked(e.target.checked);
                        if (e.target.checked) setFormConsentError(null);
                      }}
                      className="mt-0.5 accent-blue-500 cursor-pointer"
                    />
                    <span>
                      I agree to the{' '}
                      <button type="button" onClick={() => setComplianceTab('privacy')} className="underline text-blue-300 cursor-pointer">
                        Privacy Policy
                      </button>{' '}
                      &{' '}
                      <button type="button" onClick={() => setComplianceTab('terms')} className="underline text-blue-300 cursor-pointer">
                        Terms of Service
                      </button>
                      , and confirm I meet the {compliance.minimumAge}+ age requirement
                      {compliance.collectsKidsData ? ' (with verifiable parental/guardian consent)' : ''}.
                    </span>
                  </label>
                  {formConsentError && (
                    <p role="alert" data-testid="public-form-consent-error" className="text-[11px] text-amber-300">
                      {formConsentError}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-xs text-zinc-400">
              This screen has no components yet.
            </div>
          )}
        </div>
      </main>

      {/* Transparent Business & Legal Footer */}
      <footer className="border-t border-zinc-900 pt-5 pb-20 px-6 text-xs text-zinc-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="font-semibold text-zinc-200">{compliance.businessName}</span> · {compliance.businessAddress} ·{' '}
            <span>{compliance.supportEmail}</span>
          </div>
          <nav aria-label="Published site legal links" className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <button type="button" onClick={() => setComplianceTab('privacy')} className="hover:text-white underline cursor-pointer">Privacy</button>
            <button type="button" onClick={() => setComplianceTab('terms')} className="hover:text-white underline cursor-pointer">Terms</button>
            <button type="button" onClick={() => setComplianceTab('refund')} className="hover:text-white underline cursor-pointer">Refunds</button>
            <button type="button" onClick={() => setComplianceTab('cookies')} className="hover:text-white underline cursor-pointer">Cookies</button>
            <button type="button" onClick={() => setComplianceTab('licenses')} className="hover:text-white underline cursor-pointer">Licenses & SDKs</button>
            <button type="button" onClick={() => setComplianceTab('deletion')} className="hover:text-white underline cursor-pointer">Delete Data / Unsubscribe</button>
            <button type="button" onClick={onOpenInStudio} className="text-zinc-200 hover:text-white underline cursor-pointer">Edit in Studio</button>
          </nav>
        </div>
      </footer>

      <CookieConsentBanner
        enabled={compliance.includeCookieBanner}
        onOpenCookiePolicy={() => setComplianceTab('cookies')}
      />
      <ComplianceHubModal
        isOpen={complianceTab !== null}
        onClose={() => setComplianceTab(null)}
        initialTab={complianceTab || 'privacy'}
        project={project}
        readOnly
      />

      {/* Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">{modal.title}</h3>
              <button
                type="button"
                onClick={() => setModal({ isOpen: false, title: '', content: '' })}
                className="text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-zinc-300 mb-5">{modal.content}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setModal({ isOpen: false, title: '', content: '' })}
                className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white shadow-xl"
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            ) : (
              <Info size={14} className="text-blue-400 shrink-0" />
            )}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
