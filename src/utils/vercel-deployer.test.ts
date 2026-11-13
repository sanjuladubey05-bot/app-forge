import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialProject } from './project-engine';
import {
  toVercelSlug,
  getVercelFrameworkPreset,
  computeSha1Hex,
  prepareVercelDeploymentFiles,
  buildVercelDeploymentManifest,
} from './vercel-deployer';

test('toVercelSlug normalizes project titles into valid Vercel slugs', () => {
  assert.equal(toVercelSlug('My SaaS App 2026!'), 'my-saas-app-2026');
  assert.equal(toVercelSlug('---'), 'appforge-site');
});

test('getVercelFrameworkPreset maps frameworks cleanly', () => {
  assert.equal(getVercelFrameworkPreset('react-vite'), 'vite');
  assert.equal(getVercelFrameworkPreset('nextjs'), 'nextjs');
  assert.equal(getVercelFrameworkPreset('vue'), 'vue');
  assert.equal(getVercelFrameworkPreset('html'), null);
});

test('prepareVercelDeploymentFiles and manifest generate valid SHA-1 digests', async () => {
  const proj = createInitialProject('Vercel Test App', 'saas');
  const prepared = await prepareVercelDeploymentFiles(proj, 'react-vite');
  assert.equal(prepared.frameworkPreset, 'vite');
  assert.ok(prepared.files.length >= 4);

  const first = prepared.files[0];
  assert.equal(first.sha1.length, 40);
  assert.equal(first.sha1, await computeSha1Hex(first.data));

  const manifest = buildVercelDeploymentManifest({
    projectName: proj.name,
    framework: 'react-vite',
    files: prepared.files,
  });
  assert.equal(manifest.name, 'vercel-test-app');
  assert.equal(manifest.projectSettings.framework, 'vite');
  assert.equal(manifest.files.length, prepared.files.length);
});
