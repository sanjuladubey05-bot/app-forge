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

test('toVercelSlug normalizes arbitrary app names to valid Vercel project slugs', () => {
  assert.equal(toVercelSlug('My Awesome App!! 2025'), 'my-awesome-app-2025');
  assert.equal(toVercelSlug('---Hello___World---'), 'hello-world');
  assert.equal(toVercelSlug(''), 'appforge-site');
  assert.ok(toVercelSlug('a'.repeat(120)).length <= 64);
});

test('getVercelFrameworkPreset maps internal ExportFramework to Vercel API presets', () => {
  assert.equal(getVercelFrameworkPreset('html'), null);
  assert.equal(getVercelFrameworkPreset('react-vite'), 'vite');
  assert.equal(getVercelFrameworkPreset('nextjs'), 'nextjs');
  assert.equal(getVercelFrameworkPreset('vue'), 'vue');
});

test('computeSha1Hex produces deterministic 40-char lowercase SHA-1 digest', async () => {
  const hash1 = await computeSha1Hex('hello appforge');
  const hash2 = await computeSha1Hex('hello appforge');
  assert.equal(hash1.length, 40);
  assert.match(hash1, /^[a-f0-9]{40}$/);
  assert.equal(hash1, hash2);
});

test('prepareVercelDeploymentFiles & buildVercelDeploymentManifest produce complete deploy manifest', async () => {
  const project = createInitialProject('Edge Launch', 'saas');
  const prepared = await prepareVercelDeploymentFiles(project, 'react-vite');

  assert.equal(prepared.frameworkPreset, 'vite');
  assert.ok(prepared.files.length >= 6);
  assert.ok(prepared.files.some((f) => f.file === 'package.json'));
  assert.ok(prepared.files.some((f) => f.file === 'src/App.tsx'));
  assert.ok(prepared.files.every((f) => f.sha1.length === 40 && f.size > 0 && !f.file.startsWith('/')));

  const manifest = buildVercelDeploymentManifest({
    projectName: 'Edge Launch Pro',
    framework: 'react-vite',
    files: prepared.files,
    target: 'production',
  });

  assert.equal(manifest.name, 'edge-launch-pro');
  assert.equal(manifest.target, 'production');
  assert.equal(manifest.projectSettings.framework, 'vite');
  assert.equal(manifest.files.length, prepared.files.length);
  assert.ok(manifest.files[0].sha);
});
