import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialProject, createPage, updatePageSeo, updatePageTransition, createNewElement, addElement } from './project-engine';
import { compileProjectForFramework } from './multi-framework-compiler';

function createRichTestProject() {
  let proj = createInitialProject('LaunchForge SaaS', 'saas');
  const firstPageId = proj.pages[0].id;
  proj = updatePageTransition(proj, firstPageId, 'slide-left');
  proj = updatePageSeo(proj, firstPageId, {
    title: 'LaunchForge Home',
    metaDescription: 'Build multi-page apps visually.',
    ogTitle: 'LaunchForge OG Title',
    ogDescription: 'OG share description',
    ogImage: 'https://example.com/og.png',
    ogType: 'website',
    canonicalUrl: 'https://launchforge.app/',
  });

  proj = createPage(proj, 'Pricing', '/pricing', 'scale');
  const pricingId = proj.activePageId;
  proj = updatePageSeo(proj, pricingId, {
    title: 'Transparent Pricing',
    metaDescription: 'Simple monthly plans.',
  });

  const w3d = createNewElement('widget3d');
  proj = addElement(proj, w3d);
  return proj;
}

test('compiles HTML bundle with OG tags, CSS transitions, and sandboxed 3D iframe', () => {
  const proj = createRichTestProject();
  const bundle = compileProjectForFramework(proj, 'html');
  assert.equal(bundle.framework, 'html');
  assert.equal(bundle.vercelPreset, null);
  const html = bundle.files['index.html'];
  assert.ok(html, 'index.html should exist');
  assert.ok(html.includes('og:title'), 'Should emit og:title');
  assert.ok(html.includes('LaunchForge OG Title'), 'Should include custom OG title');
  assert.ok(html.includes('https://example.com/og.png'), 'Should include OG image');
  assert.ok(html.includes('af-page-transition-slide-left'), 'Should include slide-left transition class');
  const pricingHtml = bundle.files['pricing.html'];
  assert.ok(pricingHtml && pricingHtml.includes('af-page-transition-scale'), 'Should include scale transition class on Pricing HTML');
  assert.ok(pricingHtml.includes('sandbox="allow-scripts"'), 'Should isolate 3D widget in sandboxed iframe');
});

test('compiles React + Vite project with package.json, App.tsx, and CSS transitions', () => {
  const proj = createRichTestProject();
  const bundle = compileProjectForFramework(proj, 'react-vite');
  assert.equal(bundle.framework, 'react-vite');
  assert.equal(bundle.vercelPreset, 'vite');
  assert.ok(bundle.files['package.json'].includes('"vite"'));
  assert.ok(bundle.files['index.html'].includes('LaunchForge OG Title'));
  assert.ok(bundle.files['src/App.tsx'].includes('af-page-transition-'));
  assert.ok(bundle.files['src/index.css'].includes('@keyframes afSlideLeft'));
});

test('compiles Next.js App Router project with layout, per-page routes, and metadata', () => {
  const proj = createRichTestProject();
  const bundle = compileProjectForFramework(proj, 'nextjs');
  assert.equal(bundle.framework, 'nextjs');
  assert.equal(bundle.vercelPreset, 'nextjs');
  assert.ok(bundle.files['package.json'].includes('"next"'));
  assert.ok(bundle.files['app/layout.tsx'].includes('openGraph'));
  assert.ok(bundle.files['app/page.tsx']);
  assert.ok(bundle.files['app/pricing/page.tsx']);
});

test('compiles Vue 3 + Vite project with SFC pages and transition wrapper', () => {
  const proj = createRichTestProject();
  const bundle = compileProjectForFramework(proj, 'vue');
  assert.equal(bundle.framework, 'vue');
  assert.equal(bundle.vercelPreset, 'vue');
  assert.ok(bundle.files['package.json'].includes('"vue"'));
  assert.ok(bundle.files['src/App.vue'].includes('af-page-transition-'));
  assert.ok(bundle.files['index.html'].includes('og:title'));
});
