/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project } from '../types/editor';
import { ensureProjectPages } from './project-engine';

const LOCAL_PUBLISHED_KEY = 'appforge_published_snapshots';

export interface PublishResult {
  id: string;
  shareUrl: string;
  source: 'server' | 'local';
  updatedAt: string;
}

/**
 * Unicode-safe base64url encoder for compact share links.
 */
export function encodeProjectShareToken(project: Project): string {
  const normalized = ensureProjectPages(project);
  const json = JSON.stringify(normalized);
  if (typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return Buffer.from(json, 'utf-8').toString('base64url');
}

/**
 * Unicode-safe base64url decoder for public share links.
 */
export function decodeProjectShareToken(token: string): Project | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLength);
    let json = '';
    if (typeof TextDecoder !== 'undefined' && typeof atob !== 'undefined') {
      const binary = atob(padded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      json = new TextDecoder().decode(bytes);
    } else {
      json = Buffer.from(padded, 'base64').toString('utf-8');
    }
    const parsed = JSON.parse(json) as Project;
    if (!parsed || !Array.isArray(parsed.pages)) return null;
    return ensureProjectPages(parsed);
  } catch {
    return null;
  }
}

function saveLocalPublishedSnapshot(id: string, project: Project, updatedAt: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_PUBLISHED_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, { project: Project; updatedAt: string }>) : {};
    map[id] = { project, updatedAt };
    localStorage.setItem(LOCAL_PUBLISHED_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

function getLocalPublishedSnapshot(id: string): { project: Project; updatedAt: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_PUBLISHED_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, { project: Project; updatedAt: string }>;
    return map[id] || null;
  } catch {
    return null;
  }
}

/**
 * Publishes an interactive snapshot to Express backend + localStorage registry
 * and returns a clean public viewer URL.
 */
export async function publishProjectLive(project: Project): Promise<PublishResult> {
  const normalized = ensureProjectPages(project);
  const safeId = (normalized.id || `pub_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
  const updatedAt = new Date().toISOString();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  saveLocalPublishedSnapshot(safeId, normalized, updatedAt);

  try {
    const response = await fetch('/api/projects/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: normalized }),
    });
    const data = await response.json();
    if (response.ok && data?.ok) {
      const id = data.id || safeId;
      return {
        id,
        shareUrl: `${origin}/?published=${encodeURIComponent(id)}`,
        source: 'server',
        updatedAt: data.updatedAt || updatedAt,
      };
    }
  } catch {
    // Fall back to encoded hash token URL below
  }

  const token = encodeProjectShareToken(normalized);
  const useHashShare = token.length < 14000;
  return {
    id: safeId,
    shareUrl: useHashShare
      ? `${origin}/?published=${encodeURIComponent(safeId)}#share=${token}`
      : `${origin}/?published=${encodeURIComponent(safeId)}`,
    source: 'local',
    updatedAt,
  };
}

/**
 * Loads a published snapshot by server ID, local registry, or `#share=<token>`.
 */
export async function loadPublishedProject(publishedId?: string | null, shareToken?: string | null): Promise<{
  project: Project | null;
  updatedAt?: string;
  error?: string;
}> {
  if (publishedId) {
    try {
      const res = await fetch(`/api/projects/published/${encodeURIComponent(publishedId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data.project) {
          return {
            project: ensureProjectPages(data.project),
            updatedAt: data.updatedAt,
          };
        }
      }
    } catch {
      // Fallback to local registry
    }

    const local = getLocalPublishedSnapshot(publishedId);
    if (local?.project) {
      return {
        project: ensureProjectPages(local.project),
        updatedAt: local.updatedAt,
      };
    }
  }

  if (shareToken) {
    const decoded = decodeProjectShareToken(shareToken);
    if (decoded) {
      return { project: decoded };
    }
  }

  return {
    project: null,
    error: 'This published snapshot could not be found or has expired.',
  };
}
