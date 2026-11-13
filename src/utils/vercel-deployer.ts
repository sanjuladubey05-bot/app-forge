import { ExportFramework, Project } from '../types/editor';
import { compileProjectForFramework } from './multi-framework-compiler';

export interface VercelPreparedFile {
  file: string;
  data: string;
  sha1: string;
  size: number;
}

export function toVercelSlug(name: string): string {
  const cleaned = (name || 'appforge-site')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 64);
  return cleaned || 'appforge-site';
}

export function getVercelFrameworkPreset(
  framework: ExportFramework
): null | 'vite' | 'nextjs' | 'vue' {
  switch (framework) {
    case 'react-vite':
      return 'vite';
    case 'nextjs':
      return 'nextjs';
    case 'vue':
      return 'vue';
    case 'html':
    default:
      return null;
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeSha1Hex(content: string): Promise<string> {
  const encoded = new TextEncoder().encode(content);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-1', encoded);
    return bytesToHex(new Uint8Array(hashBuffer));
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha1').update(encoded).digest('hex');
}

export async function prepareVercelDeploymentFiles(
  project: Project,
  framework: ExportFramework
): Promise<{
  frameworkPreset: null | 'vite' | 'nextjs' | 'vue';
  files: VercelPreparedFile[];
}> {
  const bundle = compileProjectForFramework(project, framework);
  const entries = Object.entries(bundle.files);
  const files: VercelPreparedFile[] = [];

  for (const [filePath, content] of entries) {
    const normalizedPath = filePath.replace(/^\/+/, '');
    const sha1 = await computeSha1Hex(content);
    const size = new TextEncoder().encode(content).byteLength;
    files.push({
      file: normalizedPath,
      data: content,
      sha1,
      size,
    });
  }

  return {
    frameworkPreset: bundle.vercelPreset,
    files,
  };
}

export function buildVercelDeploymentManifest(params: {
  projectName: string;
  framework: ExportFramework;
  files: Pick<VercelPreparedFile, 'file' | 'sha1' | 'size'>[];
  target?: 'production' | 'preview';
}) {
  const preset = getVercelFrameworkPreset(params.framework);
  return {
    name: toVercelSlug(params.projectName),
    target: params.target || 'production',
    files: params.files.map((f) => ({
      file: f.file,
      sha: f.sha1,
      size: f.size,
    })),
    projectSettings: {
      framework: preset,
    },
  };
}
