import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialProject, createNewElement } from './project-engine';
import { compileProjectForFramework } from './multi-framework-compiler';

function buildProjectWith3DAndSeo() {
  const project = createInitialProject('Solaris Studio', 'linkinbio');
  project.responsiveStackBelowPx = 640;
  project.themeTokens = {
    presetName: 'cyberpunk-neon',
    primaryColor: '#00f5d4',
    secondaryColor: '#22d3ee',
    backgroundColor: '#070510',
    surfaceColor: '#120d26',
    textColor: '#f8fafc',
    mutedTextColor: '#94a3b8',
    borderColor: '#2e1f5e',
    fontFamily: 'Space Grotesk',
    borderRadius: '12px',
  };
  project.pages[0].seo = {
    title: 'Solaris | Spatial Identity',
    metaDescription: 'Custom SEO description for Solaris link hub.',
  };
  const widget = createNewElement('widget3d');
  widget.props.widget3d = {
    presetId: 'webgl-orbital-prism',
    presetMode: 'threejs-webgl',
    title: 'Hero 3D Prism',
    subtitle: 'Interactive geometry',
    accentColor: '#00f5d4',
    heightPx: 320,
    autoRotate: true,
    interactiveTilt: true,
  };
  project.pages[0].elements.push(widget);
  return project;
}

test('compileProjectForFramework compiles HTML target with SEO, theme tokens, responsive breakpoint, and sandboxed 3D iframe', () => {
  const project = buildProjectWith3DAndSeo();
  const bundle = compileProjectForFramework(project, 'html');

  assert.equal(bundle.framework, 'html');
  assert.equal(bundle.vercelPreset, null);
  assert.equal(bundle.entryFile, 'index.html');
  assert.ok(bundle.files['index.html']);
  assert.ok(bundle.files['styles.css']);
  assert.ok(bundle.files['script.js']);
  assert.ok(bundle.files['legal.html']);

  const html = bundle.files['index.html'];
  assert.ok(html.includes('<title>Solaris | Spatial Identity</title>'));
  assert.ok(html.includes('Custom SEO description for Solaris link hub.'));
  assert.ok(html.includes('sandbox="allow-scripts"'));
  assert.ok(html.includes('Hero 3D Prism'));

  const css = bundle.files['styles.css'];
  assert.ok(css.includes('--af-primary: #00f5d4;'));
  assert.ok(css.includes('@media (max-width: 640px)'));
});

test('compileProjectForFramework compiles React + Vite bundle with Widget3DFrame and package.json', () => {
  const project = buildProjectWith3DAndSeo();
  const bundle = compileProjectForFramework(project, 'react-vite');

  assert.equal(bundle.framework, 'react-vite');
  assert.equal(bundle.vercelPreset, 'vite');
  assert.equal(bundle.entryFile, 'src/App.tsx');
  assert.ok(bundle.files['package.json']);
  assert.ok(bundle.files['vite.config.ts']);
  assert.ok(bundle.files['src/App.tsx']);
  assert.ok(bundle.files['src/components/Widget3DFrame.tsx']);
  assert.ok(bundle.files['src/index.css'].includes('@media (max-width: 640px)'));

  const pkg = JSON.parse(bundle.files['package.json']);
  assert.equal(pkg.scripts.build, 'vite build');
  assert.ok(pkg.dependencies.react);
  assert.ok(pkg.dependencies.three);

  const pageFile = Object.entries(bundle.files).find(([k]) => k.startsWith('src/pages/'))?.[1] || '';
  assert.ok(pageFile.includes('Widget3DFrame'));
});

test('compileProjectForFramework compiles Next.js App Router bundle with metadata and client pages', () => {
  const project = buildProjectWith3DAndSeo();
  const bundle = compileProjectForFramework(project, 'nextjs');

  assert.equal(bundle.framework, 'nextjs');
  assert.equal(bundle.vercelPreset, 'nextjs');
  assert.equal(bundle.entryFile, 'app/page.tsx');
  assert.ok(bundle.files['package.json']);
  assert.ok(bundle.files['next.config.mjs']);
  assert.ok(bundle.files['app/layout.tsx']);
  assert.ok(bundle.files['app/page.tsx']);
  assert.ok(bundle.files['components/AppShellClient.tsx']);
  assert.ok(bundle.files['components/Widget3DFrame.tsx']);

  const layout = bundle.files['app/layout.tsx'];
  assert.ok(layout.includes('Solaris | Spatial Identity'));
  assert.ok(layout.includes('Custom SEO description for Solaris link hub.'));

  const pkg = JSON.parse(bundle.files['package.json']);
  assert.equal(pkg.scripts.build, 'next build');
  assert.ok(pkg.dependencies.next);
});

test('compileProjectForFramework compiles Vue 3 + Vite bundle cleanly', () => {
  const project = buildProjectWith3DAndSeo();
  const bundle = compileProjectForFramework(project, 'vue');

  assert.equal(bundle.framework, 'vue');
  assert.equal(bundle.vercelPreset, 'vue');
  assert.equal(bundle.entryFile, 'src/App.vue');
  assert.ok(bundle.files['package.json']);
  assert.ok(bundle.files['vite.config.ts']);
  assert.ok(bundle.files['src/App.vue']);
  assert.ok(bundle.files['src/components/Widget3DFrame.vue']);
  assert.ok(bundle.files['src/style.css'].includes('--af-primary: #00f5d4;'));

  const pkg = JSON.parse(bundle.files['package.json']);
  assert.ok(pkg.dependencies.vue);
  assert.ok(pkg.devDependencies['@vitejs/plugin-vue']);
});
