import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeContrastRatio,
  meetsWcagAA,
  ensureComplianceConfig,
  auditProjectCompliance,
  autoFixProjectCompliance,
  saveCookieConsent,
  getStoredCookieConsent,
  resetCookieConsent,
} from './compliance-audit';
import { createInitialProject, createNewElement } from './project-engine';

test('WCAG 2.1 contrast calculation distinguishes passing and failing pairs', () => {
  const whiteOnDark = computeContrastRatio('#ffffff', '#09090b');
  assert.ok(whiteOnDark >= 19, `Expected >= 19:1, got ${whiteOnDark}`);
  assert.equal(meetsWcagAA('#ffffff', '#09090b'), true);

  const zinc500OnDark = computeContrastRatio('#71717a', '#09090b');
  assert.ok(zinc500OnDark < 4.5, `Expected < 4.5:1 for #71717a on #09090b, got ${zinc500OnDark}`);
  assert.equal(meetsWcagAA('#71717a', '#09090b'), false);

  const zinc400OnDark = computeContrastRatio('#a1a1aa', '#09090b');
  assert.ok(zinc400OnDark >= 7, `Expected >= 7:1 for #a1a1aa on #09090b, got ${zinc400OnDark}`);
  assert.equal(meetsWcagAA('#a1a1aa', '#09090b'), true);
});

test('auditProjectCompliance runs all 20 legal, privacy, fairness, accessibility, and transparency checks', () => {
  const proj = createInitialProject('Compliance Audit Test', 'saas');
  const report = auditProjectCompliance(proj);
  assert.equal(report.checks.length, 20);
  assert.ok(report.score >= 85, `Clean starter should score high, got ${report.score}`);
});

test('auditProjectCompliance flags violations and autoFixProjectCompliance resolves them', () => {
  const proj = createInitialProject('Violation App', 'blank');
  const badImg = createNewElement('image');
  badImg.props.imageUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71';
  badImg.props.imageAlt = '';
  delete badImg.props.imageLicense;

  const badToggle = createNewElement('toggle');
  badToggle.props.toggleChecked = true;

  const badText = createNewElement('text');
  badText.props.text = 'Rated 4.9/5 by 1,280 verified buyers with SOC2 compliance!';
  badText.styles.textColor = '#3f3f46';
  badText.styles.backgroundColor = '#18181b';

  proj.pages[0].elements.push(badImg, badToggle, badText);
  proj.compliance = {
    ...ensureComplianceConfig(proj),
    includeCookieBanner: false,
    marketingSubscribed: true,
  };

  const before = auditProjectCompliance(proj);
  assert.ok(before.failedCount >= 5, `Expected at least 5 failures, got ${before.failedCount}`);

  const fixed = autoFixProjectCompliance(proj);
  const after = auditProjectCompliance(fixed);
  assert.equal(after.failedCount, 0, `Expected 0 failures after auto-fix, remaining: ${after.checks.filter(c => c.status === 'fail').map(c => c.id).join(', ')}`);
  assert.equal(after.score, 100);
});

test('cookie consent storage helper works cleanly in non-DOM environments', () => {
  const saved = saveCookieConsent({
    preferences: true,
    analytics: false,
    marketing: false,
    choice: 'custom',
  });
  assert.equal(saved.essential, true);
  assert.equal(saved.preferences, true);
  assert.equal(saved.analytics, false);
  assert.equal(saved.marketing, false);
  assert.equal(getStoredCookieConsent(), null); // no window in node test
  resetCookieConsent();
});
