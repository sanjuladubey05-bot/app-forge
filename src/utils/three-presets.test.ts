import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILTIN_3D_PRESETS,
  buildSandboxed3dSrcDoc,
  sanitize3dHtml,
  scope3dCss,
  sanitize3dJs,
  validate3dAiOutput,
} from './three-presets';

test('BUILTIN_3D_PRESETS exposes 5 valid CSS-3D and WebGL presets', () => {
  assert.equal(BUILTIN_3D_PRESETS.length, 5);
  const ids = new Set(BUILTIN_3D_PRESETS.map((p) => p.id));
  assert.ok(ids.has('glass-tilt-card'));
  assert.ok(ids.has('neon-iso-button'));
  assert.ok(ids.has('webgl-orbital-prism'));
  assert.ok(ids.has('webgl-particle-field'));
  assert.ok(ids.has('webgl-wireframe-terrain'));
});

test('sanitize3dHtml strips scripts, iframes, inline handlers, and javascript URLs', () => {
  const dirty = '<div onclick="alert(1)" class="box"><script>evil()</script><iframe src="https://evil.com"></iframe><a href="javascript:steal()">go</a></div>';
  const clean = sanitize3dHtml(dirty);
  assert.equal(clean.includes('<script'), false);
  assert.equal(clean.includes('<iframe'), false);
  assert.equal(/onclick/i.test(clean), false);
  assert.equal(/javascript:/i.test(clean), false);
  assert.ok(clean.includes('blocked:steal()'));
  assert.ok(clean.includes('<div  class="box">') || clean.includes('class="box"'));
});

test('scope3dCss strips @import and scopes selectors under .ai3d-root', () => {
  const css = `@import url("https://evil.com/x.css");\nbody { color: red; }\n.card, h2 { transform: rotateX(10deg); }`;
  const scoped = scope3dCss(css);
  assert.equal(scoped.includes('@import'), false);
  assert.ok(scoped.includes('.ai3d-root {'));
  assert.ok(scoped.includes('.ai3d-root .card, .ai3d-root h2 {'));
});

test('sanitize3dJs blocks network, eval, cookies, and parent/top access', () => {
  const js = `fetch('/secret'); eval('1+1'); new Function('x'); const c = document.cookie; window.top.location = '/';`;
  const clean = sanitize3dJs(js);
  assert.equal(/\bfetch\(/.test(clean), false);
  assert.equal(/\beval\(/.test(clean), false);
  assert.equal(/\bFunction\(/.test(clean), false);
  assert.equal(/document\s*\.\s*cookie/.test(clean), false);
  assert.equal(/window\s*\.\s*top/.test(clean), false);
});

test('validate3dAiOutput rejects invalid payloads and sanitizes valid structured 3D output', () => {
  assert.equal(validate3dAiOutput(null).valid, false);
  assert.equal(validate3dAiOutput({ title: 'Empty' }).valid, false);

  const ok = validate3dAiOutput({
    title: 'Holo Orb',
    presetMode: 'css-3d',
    htmlSnippet: '<div class="orb" onload="hack()">Orb</div>',
    cssSnippet: '.orb { border-radius: 50%; }',
    jsSnippet: 'console.log("ok");',
  });
  assert.equal(ok.valid, true);
  assert.equal(ok.data?.title, 'Holo Orb');
  assert.equal(ok.data?.htmlSnippet.includes('onload'), false);
  assert.ok(ok.data?.cssSnippet.includes('.ai3d-root .orb'));
});

test('buildSandboxed3dSrcDoc renders built-in and ai-custom scenes with AF_3D_ERROR bridge and XSS escaping', () => {
  const srcDoc = buildSandboxed3dSrcDoc(
    {
      presetId: 'webgl-orbital-prism',
      presetMode: 'threejs-webgl',
      title: 'Orbital <script>alert(1)</script>',
      subtitle: 'Safe Subtitle',
      accentColor: '#38bdf8',
    },
    { backgroundColor: '#09090b', primaryColor: '#38bdf8' }
  );

  assert.ok(srcDoc.includes('AF_3D_ERROR'));
  assert.ok(srcDoc.includes('Orbital &lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.equal(srcDoc.includes('<script>alert(1)</script>'), false);

  const customSrcDoc = buildSandboxed3dSrcDoc({
    presetId: 'ai-custom',
    presetMode: 'css-3d',
    title: 'Custom Scene',
    htmlSnippet: '<div class="cube">Cube</div>',
    cssSnippet: '.cube { width: 80px; }',
    jsSnippet: 'var el = document.querySelector(".cube");',
  });
  assert.ok(customSrcDoc.includes('id="ai3d-root"'));
  assert.ok(customSrcDoc.includes('.ai3d-root .cube'));
  assert.ok(customSrcDoc.includes('AF_3D_ERROR'));
});
