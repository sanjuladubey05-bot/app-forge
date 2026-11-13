import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILTIN_3D_PRESETS,
  sanitize3dHtml,
  scope3dCss,
  sanitize3dJs,
  validate3dAiOutput,
  buildSandboxed3dSrcDoc,
} from './three-presets';

test('BUILTIN_3D_PRESETS includes both CSS 3D and WebGL 3D presets', () => {
  assert.ok(BUILTIN_3D_PRESETS.length >= 5);
  assert.ok(BUILTIN_3D_PRESETS.some((p) => p.presetMode === 'css-3d'));
  assert.ok(BUILTIN_3D_PRESETS.some((p) => p.presetMode === 'threejs-webgl'));
});

test('sanitize3dHtml strips scripts, iframes, inline event handlers, and javascript: URIs', () => {
  const dirty = '<div onclick="alert(1)"><script>steal()</script><a href="javascript:evil()">Hi</a><iframe src="x"></iframe></div>';
  const clean = sanitize3dHtml(dirty);
  assert.equal(clean.includes('<script'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('<iframe'), false);
  assert.equal(clean.includes('javascript:'), false);
});

test('scope3dCss blocks @import and scopes selectors inside .ai3d-root', () => {
  const css = '@import url("https://evil.com/x.css"); body { color: red; } .card { border: 1px solid #fff; }';
  const scoped = scope3dCss(css);
  assert.equal(scoped.includes('@import'), false);
  assert.ok(scoped.includes('.ai3d-root'));
  assert.ok(scoped.includes('.ai3d-root .card'));
});

test('sanitize3dJs neutralizes network primitives and parent/top/cookie access', () => {
  const js = 'fetch("/x"); const c = document.cookie; window.top.postMessage("hi", "*");';
  const clean = sanitize3dJs(js);
  assert.ok(clean.includes('/*blocked_fetch*/undefined'));
  assert.equal(clean.includes('document.cookie'), false);
  assert.equal(clean.includes('window.top'), false);
});

test('validate3dAiOutput rejects invalid payloads and sanitizes valid payloads', () => {
  assert.equal(validate3dAiOutput(null).valid, false);
  assert.equal(validate3dAiOutput({ title: 'Empty' }).valid, false);

  const valid = validate3dAiOutput({
    title: 'Orbit Cube',
    presetMode: 'css-3d',
    htmlSnippet: '<div class="cube" onmouseover="alert(1)">Cube</div>',
    cssSnippet: '.cube { transform: rotateY(45deg); }',
    jsSnippet: 'console.log("ok");',
  });
  assert.equal(valid.valid, true);
  assert.ok(valid.data);
  assert.equal(valid.data?.htmlSnippet.includes('onmouseover'), false);
});

test('buildSandboxed3dSrcDoc embeds AF_3D_ERROR bridge and renders custom & preset widgets', () => {
  const presetDoc = buildSandboxed3dSrcDoc(BUILTIN_3D_PRESETS[0].config);
  assert.ok(presetDoc.includes('AF_3D_ERROR'));
  assert.ok(presetDoc.includes(BUILTIN_3D_PRESETS[0].config.title));

  const customDoc = buildSandboxed3dSrcDoc({
    presetId: 'ai-custom',
    presetMode: 'css-3d',
    title: 'Custom Ring',
    htmlSnippet: '<div class="ring">Ring</div>',
    cssSnippet: '.ring { color: cyan; }',
  });
  assert.ok(customDoc.includes('AF_3D_ERROR'));
  assert.ok(customDoc.includes('ai3d-root'));
});
