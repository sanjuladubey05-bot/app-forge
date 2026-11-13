/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Cookie, SlidersHorizontal, X } from 'lucide-react';
import {
  CookieConsentState,
  getStoredCookieConsent,
  saveCookieConsent,
} from '../utils/compliance-audit';

interface CookieConsentBannerProps {
  enabled?: boolean;
  onOpenCookiePolicy?: () => void;
  onConsentChange?: (consent: CookieConsentState) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  enabled = true,
  onOpenCookiePolicy,
  onConsentChange,
}) => {
  const [consent, setConsent] = useState<CookieConsentState | null>(() => getStoredCookieConsent());
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const handler = () => {
      setConsent(getStoredCookieConsent());
    };
    window.addEventListener('appforge-cookie-consent-updated', handler);
    return () => window.removeEventListener('appforge-cookie-consent-updated', handler);
  }, []);

  if (!enabled || consent !== null) {
    return null;
  }

  const commit = (
    next: Pick<CookieConsentState, 'preferences' | 'analytics' | 'marketing' | 'choice'>
  ) => {
    const saved = saveCookieConsent(next);
    setConsent(saved);
    setShowCustomize(false);
    onConsentChange?.(saved);
    window.dispatchEvent(new Event('appforge-cookie-consent-updated'));
  };

  return (
    <aside
      role="region"
      aria-label="Cookie consent preferences"
      data-testid="cookie-consent-banner"
      className="fixed bottom-2 left-2 right-2 sm:left-4 sm:right-4 sm:bottom-3 z-50 mx-auto max-w-3xl rounded-xl border border-zinc-700 bg-zinc-900/95 backdrop-blur-md shadow-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-zinc-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <Cookie className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[11px] leading-snug text-zinc-200">
            Essential cookies keep your workspace functional. Optional cookies stay off unless you opt in.{' '}
            {onOpenCookiePolicy && (
              <button
                type="button"
                onClick={onOpenCookiePolicy}
                className="underline text-blue-300 hover:text-blue-200 font-medium cursor-pointer"
              >
                Cookie Policy
              </button>
            )}
          </p>
        </div>

        {/* Equal-prominence action controls — zero dark patterns */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-testid="cookie-reject-btn"
            onClick={() =>
              commit({
                preferences: false,
                analytics: false,
                marketing: false,
                choice: 'rejected_non_essential',
              })
            }
            className="px-2.5 py-1 rounded-lg border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-[11px] font-semibold transition cursor-pointer"
          >
            Reject Non-Essential
          </button>
          <button
            type="button"
            data-testid="cookie-customize-btn"
            aria-expanded={showCustomize}
            onClick={() => setShowCustomize((prev) => !prev)}
            className="px-2.5 py-1 rounded-lg border border-zinc-600 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" aria-hidden="true" />
            Customize
          </button>
          <button
            type="button"
            data-testid="cookie-accept-btn"
            onClick={() =>
              commit({
                preferences: true,
                analytics: true,
                marketing: true,
                choice: 'accepted_all',
              })
            }
            className="px-2.5 py-1 rounded-lg border border-blue-500 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>

      {showCustomize && (
        <div className="mt-2.5 pt-2.5 border-t border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-100">
              Granular Cookie Controls (optional categories default off)
            </span>
            <button
              type="button"
              aria-label="Collapse cookie customization"
              onClick={() => setShowCustomize(false)}
              className="p-1 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
            <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-800/70 border border-zinc-700/80 text-zinc-200">
              <span>Essential (Required)</span>
              <input type="checkbox" checked disabled aria-label="Essential cookies always active" className="accent-blue-500" />
            </label>
            <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-800/70 border border-zinc-700/80 text-zinc-200 cursor-pointer">
              <span>Preferences</span>
              <input
                type="checkbox"
                checked={preferences}
                onChange={(e) => setPreferences(e.target.checked)}
                className="accent-blue-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-800/70 border border-zinc-700/80 text-zinc-200 cursor-pointer">
              <span>Analytics (No ad pixels)</span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="accent-blue-500 cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-800/70 border border-zinc-700/80 text-zinc-200 cursor-pointer">
              <span>Marketing Emails</span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="accent-blue-500 cursor-pointer"
              />
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              data-testid="cookie-save-custom-btn"
              onClick={() =>
                commit({
                  preferences,
                  analytics,
                  marketing,
                  choice: 'custom',
                })
              }
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition cursor-pointer"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
