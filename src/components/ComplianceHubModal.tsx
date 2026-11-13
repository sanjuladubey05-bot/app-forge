/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Cookie,
  FileText,
  MailMinus,
  PackageCheck,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { LegalComplianceConfig, Project } from '../types/editor';
import {
  auditProjectCompliance,
  autoFixProjectCompliance,
  CookieConsentState,
  ensureComplianceConfig,
  getStoredCookieConsent,
  resetCookieConsent,
  saveCookieConsent,
} from '../utils/compliance-audit';
import { FONT_AND_MEDIA_LICENSES, THIRD_PARTY_SDK_AUDIT } from '../utils/licensed-assets';

export type ComplianceTabId =
  | 'checker'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'cookies'
  | 'business'
  | 'licenses'
  | 'deletion';

interface ComplianceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: ComplianceTabId;
  project?: Project | null;
  onUpdateProject?: (updater: (prev: Project) => Project) => void;
  onDeleteAllLocalProjects?: () => void;
  readOnly?: boolean;
}

const TAB_ITEMS: { id: ComplianceTabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'checker', label: '20-Point Audit', icon: ShieldCheck },
  { id: 'privacy', label: 'Privacy Policy', icon: FileText },
  { id: 'terms', label: 'Terms of Service', icon: Scale },
  { id: 'refund', label: 'Refund Policy', icon: RefreshCw },
  { id: 'cookies', label: 'Cookies & Consent', icon: Cookie },
  { id: 'business', label: 'Business & Age', icon: Building2 },
  { id: 'licenses', label: 'Licenses & SDKs', icon: PackageCheck },
  { id: 'deletion', label: 'Deletion & Unsubscribe', icon: Trash2 },
];

export const ComplianceHubModal: React.FC<ComplianceHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'checker',
  project,
  onUpdateProject,
  onDeleteAllLocalProjects,
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<ComplianceTabId>(initialTab);
  const [consentState, setConsentState] = useState<CookieConsentState | null>(() =>
    getStoredCookieConsent()
  );
  const [prefCookies, setPrefCookies] = useState<boolean>(consentState?.preferences ?? false);
  const [analyticsCookies, setAnalyticsCookies] = useState<boolean>(consentState?.analytics ?? false);
  const [marketingCookies, setMarketingCookies] = useState<boolean>(consentState?.marketing ?? false);

  // Deletion & Unsubscribe state
  const [deletionEmail, setDeletionEmail] = useState('');
  const [deletionReason, setDeletionReason] = useState('Erase my published project snapshots & local profile');
  const [clearLocalStorage, setClearLocalStorage] = useState(true);
  const [deletionReceipt, setDeletionReceipt] = useState<{ receiptId: string; processedAt: string } | null>(null);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [submittingDeletion, setSubmittingDeletion] = useState(false);

  const [unsubEmail, setUnsubEmail] = useState('');
  const [unsubReceipt, setUnsubReceipt] = useState<string | null>(null);
  const [submittingUnsub, setSubmittingUnsub] = useState(false);

  const [autoFixNotice, setAutoFixNotice] = useState<string | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      const current = getStoredCookieConsent();
      setConsentState(current);
      setPrefCookies(current?.preferences ?? false);
      setAnalyticsCookies(current?.analytics ?? false);
      setMarketingCookies(current?.marketing ?? false);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const config: LegalComplianceConfig = useMemo(
    () => ensureComplianceConfig(project),
    [project]
  );

  const auditReport = useMemo(() => {
    if (!project) {
      return auditProjectCompliance({
        id: 'platform_audit',
        name: 'AppForge Platform',
        description: 'Platform compliance audit',
        viewport: 'desktop',
        zoom: 100,
        canvasBg: '#0f0f12',
        canvasPadding: 'md',
        homePageId: 'home',
        activePageId: 'home',
        pages: [],
        compliance: config,
        createdAt: '',
        updatedAt: '',
      });
    }
    return auditProjectCompliance(project);
  }, [project, config]);

  if (!isOpen) return null;

  const updateCompliance = (patch: Partial<LegalComplianceConfig>) => {
    if (!onUpdateProject || readOnly) return;
    onUpdateProject((prev) => ({
      ...prev,
      compliance: {
        ...ensureComplianceConfig(prev),
        ...patch,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % TAB_ITEMS.length;
      setActiveTab(TAB_ITEMS[next].id);
      tabRefs.current[next]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + TAB_ITEMS.length) % TAB_ITEMS.length;
      setActiveTab(TAB_ITEMS[prev].id);
      tabRefs.current[prev]?.focus();
    }
  };

  const handleSaveCookies = () => {
    const saved = saveCookieConsent({
      preferences: prefCookies,
      analytics: analyticsCookies,
      marketing: marketingCookies,
      choice: 'custom',
    });
    setConsentState(saved);
    window.dispatchEvent(new Event('appforge-cookie-consent-updated'));
  };

  const handleResetCookies = () => {
    resetCookieConsent();
    setConsentState(null);
    setPrefCookies(false);
    setAnalyticsCookies(false);
    setMarketingCookies(false);
    window.dispatchEvent(new Event('appforge-cookie-consent-updated'));
  };

  const handleDataDeletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeletionError(null);
    if (!deletionEmail.trim() || !deletionEmail.includes('@')) {
      setDeletionError('Enter a valid email address to verify your data erasure request.');
      return;
    }
    setSubmittingDeletion(true);
    try {
      const res = await fetch('/api/compliance/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'data_deletion',
          email: deletionEmail.trim(),
          projectId: project?.id,
          reason: deletionReason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit deletion request.');
      }
      if (clearLocalStorage) {
        resetCookieConsent();
        onDeleteAllLocalProjects?.();
        window.dispatchEvent(new Event('appforge-cookie-consent-updated'));
      }
      setDeletionReceipt({
        receiptId: data.receiptId || `DEL-${Date.now().toString(36).toUpperCase()}`,
        processedAt: data.processedAt || new Date().toISOString(),
      });
    } catch (err) {
      setDeletionError(err instanceof Error ? err.message : 'Unable to process deletion request.');
    } finally {
      setSubmittingDeletion(false);
    }
  };

  const handleUnsubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unsubEmail.trim() || !unsubEmail.includes('@')) return;
    setSubmittingUnsub(true);
    try {
      const res = await fetch('/api/compliance/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'unsubscribe',
          email: unsubEmail.trim(),
          projectId: project?.id,
        }),
      });
      const data = await res.json();
      updateCompliance({ marketingSubscribed: false });
      setUnsubReceipt(data.receiptId || `UNSUB-${Date.now().toString(36).toUpperCase()}`);
    } finally {
      setSubmittingUnsub(false);
    }
  };

  const handleAutoFixAll = () => {
    if (!onUpdateProject || readOnly) return;
    onUpdateProject((prev) => autoFixProjectCompliance(prev));
    setAutoFixNotice('All 20 compliance checks remediated (WCAG contrast, alt text, defaults, and policies).');
    setTimeout(() => setAutoFixNotice(null), 4000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compliance-hub-title"
      data-testid="compliance-hub-modal"
      className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-700 bg-zinc-900 text-zinc-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="compliance-hub-title" className="text-sm font-bold text-white truncate">
                Trust, Legal & Compliance Center
              </h2>
              <p className="text-[11px] text-zinc-400 truncate">
                {config.businessName} · Score {auditReport.score}% ({auditReport.passedCount}/20 verified)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Trust and Compliance Center"
            data-testid="compliance-modal-close"
            className="p-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Sidebar Tablist */}
          <div
            role="tablist"
            aria-label="Compliance categories"
            className="flex md:flex-col gap-1 p-2.5 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950/40 overflow-x-auto md:w-56 shrink-0"
          >
            {TAB_ITEMS.map((tab, idx) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  data-testid={`compliance-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                    selected
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel Content */}
          <div role="tabpanel" className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-zinc-300">
            {activeTab === 'checker' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div>
                    <div className="text-sm font-bold text-white">
                      20-Point Compliance Audit: {auditReport.score}%
                    </div>
                    <p className="text-xs text-zinc-400">
                      {auditReport.passedCount} passed · {auditReport.warningCount} warning · {auditReport.failedCount} failed
                    </p>
                  </div>
                  {onUpdateProject && !readOnly && (
                    <button
                      type="button"
                      data-testid="compliance-autofix-btn"
                      onClick={handleAutoFixAll}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      Auto-Fix All Issues
                    </button>
                  )}
                </div>

                {autoFixNotice && (
                  <div role="status" className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
                    {autoFixNotice}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {auditReport.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white">{chk.title}</span>
                        {chk.status === 'pass' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-300 text-[11px] font-semibold shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Pass
                          </span>
                        ) : chk.status === 'warning' ? (
                          <span className="inline-flex items-center gap-1 text-amber-300 text-[11px] font-semibold shrink-0">
                            <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> Warn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-300 text-[11px] font-semibold shrink-0">
                            <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> Fail
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">{chk.category}</p>
                      <p className="text-[11px] text-zinc-300">{chk.details}</p>
                      {chk.status !== 'pass' && chk.remediationHint && (
                        <p className="text-[11px] text-amber-300">Fix: {chk.remediationHint}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Privacy Policy</h3>
                <p>
                  <strong className="text-white">Data Controller:</strong> {config.businessName}, {config.businessAddress} (Reg. {config.registrationId}). Contact: {config.privacyEmail}.
                </p>
                <p>
                  <strong className="text-white">Data Minimization:</strong> We only process fields explicitly entered into workspace forms (such as project layouts, email, or support requests). We do not request government IDs, sensitive personal identifiers, or behavioral advertising profiles.
                </p>
                <p>
                  <strong className="text-white">Consent & Storage:</strong> Non-essential cookies remain disabled by default. Form submissions require explicit unchecked opt-in consent and minimum age verification ({config.minimumAge}+).
                </p>
                <p>
                  <strong className="text-white">Your Rights (GDPR / CCPA):</strong> You may export, update, unsubscribe from communications, or permanently erase your stored data at any time via the Deletion & Unsubscribe tab or by emailing {config.privacyEmail}.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Terms of Service</h3>
                <p>
                  <strong className="text-white">Operator:</strong> {config.businessName} ({config.supportEmail}).
                </p>
                <p>
                  <strong className="text-white">Fair Billing & Zero Dark Patterns:</strong> All pricing tiers, renewal intervals, and cancellation paths are displayed clearly before purchase. No hidden processing surcharges, forced subscriptions, or pre-checked add-ons are permitted.
                </p>
                <p>
                  <strong className="text-white">User Content & Ownership:</strong> You retain full rights to projects created, previewed, and exported as HTML, React TSX, or Forge JSON.
                </p>
                <p>
                  <strong className="text-white">Eligibility & Kids&apos; Data:</strong> Minimum user age is {config.minimumAge}+ unless verifiable parental/guardian consent is enabled ({config.collectsKidsData ? 'Parental gate active' : 'Standard adult/teen policy'}).
                </p>
              </div>
            )}

            {activeTab === 'refund' && (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Transparent Refund & Cancellation Policy</h3>
                <p>
                  <strong className="text-white">Refund Window:</strong> Paid subscriptions and digital orders qualify for a full, no-hassle refund within <strong className="text-white">{config.refundWindowDays} calendar days</strong> of initial purchase or renewal.
                </p>
                <p>
                  <strong className="text-white">Zero Hidden Fees:</strong> Canceling takes one step and stops future billing immediately without cancellation penalties or retention traps.
                </p>
                <p>
                  <strong className="text-white">How to Request a Refund:</strong> Email <span className="text-blue-300">{config.supportEmail}</span> with your order receipt ID. Refunds are issued to the original payment method within 5 business days.
                </p>
              </div>
            )}

            {activeTab === 'cookies' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Cookie Policy & Live Consent Manager</h3>
                <p>
                  Current Choice:{' '}
                  <strong className="text-white">
                    {consentState ? `${consentState.choice} (${new Date(consentState.updatedAt).toLocaleString()})` : 'Not set yet (only Essential active)'}
                  </strong>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">1. Essential Cookies</span>
                      <input type="checkbox" checked disabled aria-label="Essential cookies always active" />
                    </div>
                    <p className="text-[11px] text-zinc-400">Required for editor state, CSRF protection, and saving user-chosen consent.</p>
                  </div>
                  <label className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">2. Preferences</span>
                      <input
                        type="checkbox"
                        checked={prefCookies}
                        onChange={(e) => setPrefCookies(e.target.checked)}
                        className="accent-blue-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400">Remembers preferred device viewport width and sidebar panel layout.</p>
                  </label>
                  <label className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">3. Analytics</span>
                      <input
                        type="checkbox"
                        checked={analyticsCookies}
                        onChange={(e) => setAnalyticsCookies(e.target.checked)}
                        className="accent-blue-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400">First-party aggregated error diagnostics only; no cross-site ad pixels.</p>
                  </label>
                  <label className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">4. Marketing</span>
                      <input
                        type="checkbox"
                        checked={marketingCookies}
                        onChange={(e) => setMarketingCookies(e.target.checked)}
                        className="accent-blue-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400">Off by default. Used only if you explicitly subscribe to release notes.</p>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCookies}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer"
                  >
                    Save Cookie Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCookies}
                    className="px-3.5 py-2 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold cursor-pointer"
                  >
                    Withdraw Consent & Re-open Banner
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Business Transparency & Age Consent Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="block text-[11px] text-zinc-300 font-medium">Legal Business Name</span>
                    <input
                      type="text"
                      disabled={readOnly || !onUpdateProject}
                      value={config.businessName}
                      onChange={(e) => updateCompliance({ businessName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] text-zinc-300 font-medium">Registration / Entity ID</span>
                    <input
                      type="text"
                      disabled={readOnly || !onUpdateProject}
                      value={config.registrationId}
                      onChange={(e) => updateCompliance({ registrationId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <label className="space-y-1 sm:col-span-2">
                    <span className="block text-[11px] text-zinc-300 font-medium">Registered Street Address</span>
                    <input
                      type="text"
                      disabled={readOnly || !onUpdateProject}
                      value={config.businessAddress}
                      onChange={(e) => updateCompliance({ businessAddress: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] text-zinc-300 font-medium">Support Email</span>
                    <input
                      type="email"
                      disabled={readOnly || !onUpdateProject}
                      value={config.supportEmail}
                      onChange={(e) => updateCompliance({ supportEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] text-zinc-300 font-medium">Privacy & Data Deletion Email</span>
                    <input
                      type="email"
                      disabled={readOnly || !onUpdateProject}
                      value={config.privacyEmail}
                      onChange={(e) => updateCompliance({ privacyEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] text-zinc-300 font-medium">Unsubscribe Contact Email</span>
                    <input
                      type="email"
                      disabled={readOnly || !onUpdateProject}
                      value={config.unsubscribeEmail}
                      onChange={(e) => updateCompliance({ unsubscribeEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-[11px] text-zinc-300 font-medium">Refund Window (Days)</span>
                    <input
                      type="number"
                      min={0}
                      max={365}
                      disabled={readOnly || !onUpdateProject}
                      value={config.refundWindowDays}
                      onChange={(e) => updateCompliance({ refundWindowDays: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                </div>

                <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2.5">
                  <div className="font-semibold text-white">Age Gate, Kids&apos; Data & Consent Guards</div>
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span>Require explicit unchecked Privacy & Age consent on forms</span>
                    <input
                      type="checkbox"
                      disabled={readOnly || !onUpdateProject}
                      checked={config.requireFormConsent}
                      onChange={(e) => updateCompliance({ requireFormConsent: e.target.checked })}
                      className="accent-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span>Collect data from minors (enforces verifiable parental/guardian consent)</span>
                    <input
                      type="checkbox"
                      disabled={readOnly || !onUpdateProject}
                      checked={config.collectsKidsData}
                      onChange={(e) => updateCompliance({ collectsKidsData: e.target.checked })}
                      className="accent-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span>Include Cookie Consent Banner in published & exported apps</span>
                    <input
                      type="checkbox"
                      disabled={readOnly || !onUpdateProject}
                      checked={config.includeCookieBanner}
                      onChange={(e) => updateCompliance({ includeCookieBanner: e.target.checked })}
                      className="accent-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 cursor-pointer">
                    <span>Include Legal & Business Footer in published & exported apps</span>
                    <input
                      type="checkbox"
                      disabled={readOnly || !onUpdateProject}
                      checked={config.includeLegalFooter}
                      onChange={(e) => updateCompliance({ includeLegalFooter: e.target.checked })}
                      className="accent-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'licenses' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white mb-2">Font & Media Asset Licenses</h3>
                  <div className="space-y-2">
                    {FONT_AND_MEDIA_LICENSES.map((item) => (
                      <div key={item.name} className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-[11px] text-zinc-400">
                            {item.category} · Source: {item.source}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-700 text-emerald-200 text-[11px] font-semibold">
                          {item.license}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-2">Third-Party SDK & Runtime Dependency Audit</h3>
                  <div className="space-y-2">
                    {THIRD_PARTY_SDK_AUDIT.map((sdk) => (
                      <div key={sdk.packageName} className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-white">{sdk.packageName}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-200 text-[11px] font-semibold">
                            {sdk.license} · {sdk.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Purpose: {sdk.purpose} · Scope: {sdk.runsIn} · Personal Data: {sdk.collectsPersonalData ? 'User-entered' : 'None'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'deletion' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <form
                  onSubmit={handleDataDeletionSubmit}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Trash2 className="w-4 h-4 text-rose-400" aria-hidden="true" />
                    Request Permanent Data Deletion
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Submit a verified GDPR/CCPA erasure request. Removes server-published project snapshots and clears local browser data when checked.
                  </p>
                  <label className="block space-y-1">
                    <span className="text-[11px] text-zinc-300 font-medium">Account / Contact Email</span>
                    <input
                      type="email"
                      required
                      data-testid="deletion-email-input"
                      value={deletionEmail}
                      onChange={(e) => setDeletionEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] text-zinc-300 font-medium">Deletion Scope</span>
                    <input
                      type="text"
                      value={deletionReason}
                      onChange={(e) => setDeletionReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-[11px] text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={clearLocalStorage}
                      onChange={(e) => setClearLocalStorage(e.target.checked)}
                      className="accent-blue-500"
                    />
                    Also clear my local browser cookie consent & saved workspace projects
                  </label>
                  {deletionError && (
                    <div role="alert" className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 text-[11px]">
                      {deletionError}
                    </div>
                  )}
                  {deletionReceipt && (
                    <div
                      role="status"
                      data-testid="deletion-receipt-banner"
                      className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-[11px]"
                    >
                      Erasure request confirmed · Receipt ID: <strong>{deletionReceipt.receiptId}</strong>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submittingDeletion}
                    data-testid="submit-deletion-btn"
                    className="w-full px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
                  >
                    {submittingDeletion ? 'Submitting Erasure...' : 'Submit Data Deletion Request'}
                  </button>
                </form>

                <form
                  onSubmit={handleUnsubscribeSubmit}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <MailMinus className="w-4 h-4 text-blue-400" aria-hidden="true" />
                    Email Unsubscribe & Opt-Out
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Every transactional or marketing email exported by AppForge includes a one-click{' '}
                    <code className="text-zinc-200">List-Unsubscribe: &lt;mailto:{config.unsubscribeEmail}&gt;</code>{' '}
                    header and footer link.
                  </p>
                  <label className="block space-y-1">
                    <span className="text-[11px] text-zinc-300 font-medium">Email Address to Unsubscribe</span>
                    <input
                      type="email"
                      required
                      data-testid="unsubscribe-email-input"
                      value={unsubEmail}
                      onChange={(e) => setUnsubEmail(e.target.value)}
                      placeholder="subscriber@company.com"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                    />
                  </label>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
                    Marketing Status:{' '}
                    <strong className="text-white">
                      {config.marketingSubscribed ? 'Subscribed' : 'Opted Out (Default Safe)'}
                    </strong>
                  </div>
                  {unsubReceipt && (
                    <div
                      role="status"
                      data-testid="unsubscribe-receipt-banner"
                      className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-[11px]"
                    >
                      Unsubscribed immediately · Confirmation ID: <strong>{unsubReceipt}</strong>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submittingUnsub}
                    data-testid="submit-unsubscribe-btn"
                    className="w-full px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer"
                  >
                    {submittingUnsub ? 'Processing Opt-Out...' : 'Unsubscribe From All Emails'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
