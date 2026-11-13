import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialProject,
  PAGE_TRANSITION_PRESETS,
  getPageTransitionClass,
  updatePageTransition,
  updatePageSeo,
} from './project-engine';
import { applyThemePreset, updateThemeTokens, ensureThemeTokens } from './theme-engine';

test('PAGE_TRANSITION_PRESETS and getPageTransitionClass cover all animation options', () => {
  assert.ok(PAGE_TRANSITION_PRESETS.some((p) => p.id === 'fade'));
  assert.ok(PAGE_TRANSITION_PRESETS.some((p) => p.id === 'slide-left'));
  assert.ok(PAGE_TRANSITION_PRESETS.some((p) => p.id === 'slide-right'));
  assert.ok(PAGE_TRANSITION_PRESETS.some((p) => p.id === 'slide-up'));
  assert.ok(PAGE_TRANSITION_PRESETS.some((p) => p.id === 'scale'));
  assert.ok(PAGE_TRANSITION_PRESETS.some((p) => p.id === 'none'));

  assert.equal(getPageTransitionClass('slide-left'), 'af-page-transition-slide-left');
  assert.equal(getPageTransitionClass('slide-right'), 'af-page-transition-slide-right');
  assert.equal(getPageTransitionClass('scale'), 'af-page-transition-scale');
  assert.equal(getPageTransitionClass('none'), 'af-page-transition-none');
  assert.equal(getPageTransitionClass(undefined), 'af-page-transition-fade');
});

test('updatePageSeo and updatePageTransition update target page cleanly without mutating siblings', () => {
  let proj = createInitialProject('SEO Test', 'saas');
  const pageId = proj.pages[0].id;
  proj = updatePageTransition(proj, pageId, 'scale');
  proj = updatePageSeo(proj, pageId, {
    title: 'Custom Meta Title',
    metaDescription: 'Custom Meta Description',
    ogTitle: 'OG Share Title',
    ogType: 'product',
  });

  assert.equal(proj.pages[0].transition, 'scale');
  assert.equal(proj.pages[0].seo?.title, 'Custom Meta Title');
  assert.equal(proj.pages[0].seo?.ogTitle, 'OG Share Title');
  assert.equal(proj.pages[0].seo?.ogType, 'product');
});

test('applyThemePreset and updateThemeTokens update global tokens consistently', () => {
  let proj = createInitialProject('Theme Test', 'blank');
  proj = applyThemePreset(proj, 'minimal-light');
  assert.equal(proj.themeTokens?.presetName, 'minimal-light');
  assert.equal(proj.canvasBg, '#F8FAFC');

  proj = updateThemeTokens(proj, { primaryColor: '#10B981', borderRadius: '16px' });
  const tokens = ensureThemeTokens(proj);
  assert.equal(tokens.presetName, 'custom');
  assert.equal(tokens.primaryColor, '#10B981');
  assert.equal(tokens.borderRadius, '16px');
});
