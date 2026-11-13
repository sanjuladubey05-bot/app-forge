/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ForgeNode, remapForgeNodeIds, validateForgeNodes } from './forge-schema';

export interface WireframeRegion {
  kind: 'navbar' | 'hero' | 'card-row' | 'form' | 'cta' | 'text-block' | 'table';
  yRatio: number;
  widthRatio: number;
  columnCount?: number;
  label?: string;
}

export interface WireframePalette {
  surfaceColor: string;
  accentColor: string;
  textColor: string;
  isLightTheme: boolean;
}

const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateWireframeFile(file: { type: string; size: number; name?: string }): {
  valid: boolean;
  error?: string;
} {
  if (!file || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload a PNG, JPEG, or WebP screenshot or wireframe.',
    };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      error: 'Image exceeds the 10 MB upload limit. Please use a smaller PNG, JPEG, or WebP image.',
    };
  }
  return { valid: true };
}

/**
 * Pure deterministic layout tree reconstructor from detected visual bands & palette.
 * Decoupled from browser DOM so it can be unit-tested in Node cleanly.
 */
export function reconstructLayoutFromRegions(
  regions: WireframeRegion[],
  palette: WireframePalette = {
    surfaceColor: '#18181b',
    accentColor: '#2563eb',
    textColor: '#ffffff',
    isLightTheme: false,
  },
  hintPrompt: string = ''
): ForgeNode[] {
  const safeRegions = regions.length > 0
    ? [...regions].sort((a, b) => a.yRatio - b.yRatio)
    : [
        { kind: 'navbar' as const, yRatio: 0.05, widthRatio: 0.95 },
        { kind: 'hero' as const, yRatio: 0.22, widthRatio: 0.85 },
        { kind: 'card-row' as const, yRatio: 0.52, widthRatio: 0.92, columnCount: 3 },
        { kind: 'cta' as const, yRatio: 0.82, widthRatio: 0.6 },
      ];

  const nodes: ForgeNode[] = [];
  const lowerHint = hintPrompt.toLowerCase();

  safeRegions.forEach((region, idx) => {
    switch (region.kind) {
      case 'navbar':
        nodes.push({
          id: `wf_nav_${idx}`,
          type: 'Navbar',
          props: {
            brandName: region.label || (lowerHint.includes('shop') ? 'Storefront' : 'AppForge Wireframe'),
            direction: 'row',
            navLinks: [
              { label: 'Overview' },
              { label: 'Features' },
              { label: 'Pricing' },
            ],
            ctaLabel: 'Get Started',
          },
          styles: {
            backgroundColor: palette.surfaceColor,
            textColor: palette.textColor,
            width: 'full',
          },
          children: [],
        });
        break;

      case 'hero':
        nodes.push({
          id: `wf_hero_${idx}`,
          type: 'Container',
          props: {
            direction: 'column',
            gap: 'md',
          },
          styles: {
            backgroundColor: palette.surfaceColor,
            padding: 'lg',
            borderRadius: 'xl',
            width: 'full',
          },
          children: [
            {
              id: `wf_hero_badge_${idx}`,
              type: 'Badge',
              props: {
                text: 'Reconstructed From Visual Layout',
                badgeVariant: 'info',
              },
              styles: { alignSelf: 'start' },
            },
            {
              id: `wf_hero_heading_${idx}`,
              type: 'Heading',
              props: {
                text: region.label || 'Primary Section Headline',
                headingLevel: 'h1',
                subtext:
                  hintPrompt.trim() ||
                  'Auto-reconstructed layout structure ready for visual styling and interactive actions.',
              },
              styles: { textColor: palette.textColor },
            },
            {
              id: `wf_hero_actions_${idx}`,
              type: 'Container',
              props: { direction: 'row', gap: 'sm' },
              styles: { width: 'full' },
              children: [
                {
                  id: `wf_hero_btn_1_${idx}`,
                  type: 'Button',
                  props: { text: 'Primary Action', buttonVariant: 'primary' },
                  styles: { backgroundColor: palette.accentColor, textColor: '#ffffff' },
                  events: { onClick: { action: 'TOAST', message: 'Primary CTA triggered' } },
                },
                {
                  id: `wf_hero_btn_2_${idx}`,
                  type: 'Button',
                  props: { text: 'Learn More', buttonVariant: 'outline' },
                  styles: { backgroundColor: '#27272a', textColor: '#ffffff' },
                  events: { onClick: { action: 'TOAST', message: 'Secondary CTA triggered' } },
                },
              ],
            },
          ],
        });
        break;

      case 'card-row': {
        const cols = Math.max(2, Math.min(3, region.columnCount || 3));
        const cards: ForgeNode[] = Array.from({ length: cols }).map((_, colIdx) => ({
          id: `wf_card_${idx}_${colIdx}`,
          type: 'Card',
          props: {
            text: `Feature Column ${colIdx + 1}`,
            subtext: 'Editable card container detected from multi-column grid band.',
          },
          styles: {
            width: cols === 2 ? 'half' : 'third',
            backgroundColor: palette.surfaceColor,
            padding: 'md',
            borderRadius: 'lg',
          },
          children: [
            {
              id: `wf_card_metric_${idx}_${colIdx}`,
              type: 'Metric',
              props: {
                metricLabel: `Block ${colIdx + 1}`,
                metricValue: `${(colIdx + 1) * 24}%`,
                metricTrend: 'Detected region',
              },
              styles: {},
            },
          ],
        }));

        nodes.push({
          id: `wf_row_${idx}`,
          type: 'Container',
          props: {
            direction: 'row',
            gap: 'md',
          },
          styles: { width: 'full' },
          children: cards,
        });
        break;
      }

      case 'form':
        nodes.push({
          id: `wf_form_${idx}`,
          type: 'Card',
          props: {
            text: region.label || 'Interactive Input Section',
            subtext: 'Reconstructed form inputs ready to bind to Data Studio collections.',
          },
          styles: { backgroundColor: palette.surfaceColor, padding: 'lg', borderRadius: 'xl' },
          children: [
            {
              id: `wf_input_name_${idx}`,
              type: 'Input',
              props: { label: 'Full Name', placeholder: 'Enter name...' },
              styles: {},
            },
            {
              id: `wf_input_email_${idx}`,
              type: 'Input',
              props: { label: 'Email Address', placeholder: 'name@company.com' },
              styles: {},
            },
            {
              id: `wf_form_submit_${idx}`,
              type: 'Button',
              props: { text: 'Submit Form', buttonVariant: 'primary', whenClicked: 'submitForm' },
              styles: { backgroundColor: palette.accentColor, textColor: '#ffffff', width: 'full' },
              events: { onClick: { action: 'SUBMIT', message: 'Form submitted successfully!' } },
            },
          ],
        });
        break;

      case 'table':
        nodes.push({
          id: `wf_table_${idx}`,
          type: 'Table',
          props: {
            tableHeaders: ['Item', 'Category', 'Status', 'Value'],
            tableRows: [
              ['Detected Row 1', 'Module', 'Active', '$120'],
              ['Detected Row 2', 'Service', 'Verified', '$240'],
            ],
          },
          styles: { width: 'full' },
        });
        break;

      case 'cta':
        nodes.push({
          id: `wf_cta_${idx}`,
          type: 'Button',
          props: {
            text: region.label || 'Continue',
            buttonVariant: 'primary',
          },
          styles: {
            backgroundColor: palette.accentColor,
            textColor: '#ffffff',
            alignSelf: 'center',
          },
          events: { onClick: { action: 'TOAST', message: 'CTA action clicked' } },
        });
        break;

      default:
        nodes.push({
          id: `wf_text_${idx}`,
          type: 'Text',
          props: {
            text: region.label || 'Reconstructed content paragraph block from uploaded image.',
          },
          styles: { textColor: '#a1a1aa' },
        });
        break;
    }
  });

  return remapForgeNodeIds(nodes);
}

/**
 * Browser canvas scanner that inspects horizontal edge density, contrast bands,
 * and split columns in an uploaded wireframe/screenshot to produce immediate structured nodes.
 */
export async function analyzeWireframeImageClient(
  dataUrl: string,
  hintPrompt: string = ''
): Promise<{ nodes: ForgeNode[]; palette: WireframePalette }> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    const fallbackPalette: WireframePalette = {
      surfaceColor: '#18181b',
      accentColor: '#2563eb',
      textColor: '#ffffff',
      isLightTheme: false,
    };
    return {
      nodes: reconstructLayoutFromRegions([], fallbackPalette, hintPrompt),
      palette: fallbackPalette,
    };
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Could not decode uploaded image for layout scanning.'));
    el.src = dataUrl;
  });

  const sampleW = 160;
  const sampleH = Math.max(80, Math.min(240, Math.round((img.height / Math.max(1, img.width)) * sampleW)));
  const canvas = document.createElement('canvas');
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const palette: WireframePalette = {
      surfaceColor: '#18181b',
      accentColor: '#2563eb',
      textColor: '#ffffff',
      isLightTheme: false,
    };
    return { nodes: reconstructLayoutFromRegions([], palette, hintPrompt), palette };
  }

  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const { data } = ctx.getImageData(0, 0, sampleW, sampleH);

  // Sample average luminance + dominant vivid accent color
  let totalLum = 0;
  let accentR = 37;
  let accentG = 99;
  let accentB = 235;
  let maxChroma = 20;

  const rowActivity: number[] = new Array(sampleH).fill(0);
  const leftActivity: number[] = new Array(sampleH).fill(0);
  const midActivity: number[] = new Array(sampleH).fill(0);
  const rightActivity: number[] = new Array(sampleH).fill(0);

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const i = (y * sampleW + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      totalLum += lum;

      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      if (chroma > maxChroma && chroma > 55) {
        maxChroma = chroma;
        accentR = r;
        accentG = g;
        accentB = b;
      }

      if (x > 0) {
        const pi = (y * sampleW + (x - 1)) * 4;
        const diff = Math.abs(r - data[pi]) + Math.abs(g - data[pi + 1]) + Math.abs(b - data[pi + 2]);
        if (diff > 32) {
          rowActivity[y]++;
          if (x < sampleW * 0.33) leftActivity[y]++;
          else if (x < sampleW * 0.66) midActivity[y]++;
          else rightActivity[y]++;
        }
      }
    }
  }

  const avgLum = totalLum / (sampleW * sampleH);
  const isLightTheme = avgLum > 0.62;
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  const palette: WireframePalette = {
    surfaceColor: '#18181b',
    accentColor: `#${toHex(accentR)}${toHex(accentG)}${toHex(accentB)}`,
    textColor: '#ffffff',
    isLightTheme,
  };

  // Group active horizontal bands
  const regions: WireframeRegion[] = [];
  const topBandActive = rowActivity.slice(0, Math.floor(sampleH * 0.14)).some((v) => v > 4);
  if (topBandActive) {
    regions.push({ kind: 'navbar', yRatio: 0.05, widthRatio: 0.96 });
  }

  // Hero / Header band (14% - 42%)
  regions.push({ kind: 'hero', yRatio: 0.22, widthRatio: 0.9 });

  // Middle band (42% - 75%): check for 2-3 side-by-side columns
  const midStart = Math.floor(sampleH * 0.42);
  const midEnd = Math.floor(sampleH * 0.76);
  const leftSum = leftActivity.slice(midStart, midEnd).reduce((a, b) => a + b, 0);
  const midSum = midActivity.slice(midStart, midEnd).reduce((a, b) => a + b, 0);
  const rightSum = rightActivity.slice(midStart, midEnd).reduce((a, b) => a + b, 0);

  if (hintPrompt.toLowerCase().includes('form') || hintPrompt.toLowerCase().includes('login')) {
    regions.push({ kind: 'form', yRatio: 0.55, widthRatio: 0.65 });
  } else if (hintPrompt.toLowerCase().includes('table') || hintPrompt.toLowerCase().includes('dashboard')) {
    regions.push({ kind: 'card-row', yRatio: 0.48, widthRatio: 0.92, columnCount: 3 });
    regions.push({ kind: 'table', yRatio: 0.78, widthRatio: 0.95 });
  } else if (leftSum > 18 && midSum > 18 && rightSum > 18) {
    regions.push({ kind: 'card-row', yRatio: 0.56, widthRatio: 0.94, columnCount: 3 });
  } else if (leftSum > 18 && rightSum > 18) {
    regions.push({ kind: 'card-row', yRatio: 0.56, widthRatio: 0.94, columnCount: 2 });
  } else {
    regions.push({ kind: 'form', yRatio: 0.62, widthRatio: 0.75 });
  }

  return {
    nodes: reconstructLayoutFromRegions(regions, palette, hintPrompt),
    palette,
  };
}

/**
 * Dual-mode Image-to-UI orchestrator:
 * 1. Runs instant client-side layout reconstruction immediately.
 * 2. When `refineWithAi` is true, requests `/api/ai/image-to-ui` Gemini Vision refinement
 *    and merges/replaces with validated, remapped nodes if available.
 */
export async function runDualModeImageToUi(params: {
  dataUrl: string;
  mimeType: string;
  hintPrompt?: string;
  refineWithAi?: boolean;
}): Promise<{
  nodes: ForgeNode[];
  source: 'gemini' | 'client';
  note?: string;
}> {
  const { dataUrl, mimeType, hintPrompt = '', refineWithAi = true } = params;
  const clientResult = await analyzeWireframeImageClient(dataUrl, hintPrompt);

  if (!refineWithAi) {
    return {
      nodes: clientResult.nodes,
      source: 'client',
      note: 'Instant client layout reconstruction complete.',
    };
  }

  try {
    const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    const response = await fetch('/api/ai/image-to-ui', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType, hintPrompt }),
    });

    const payload = await response.json();
    if (response.ok && payload.ok && Array.isArray(payload.nodes)) {
      const check = validateForgeNodes(payload.nodes);
      if (check.valid) {
        return {
          nodes: remapForgeNodeIds(check.nodes),
          source: 'gemini',
          note: 'Refined using Gemini multimodal layout reconstruction.',
        };
      }
    }

    return {
      nodes: clientResult.nodes,
      source: 'client',
      note: payload?.error || 'Client wireframe scanner produced editable layout nodes.',
    };
  } catch {
    return {
      nodes: clientResult.nodes,
      source: 'client',
      note: 'Client wireframe scanner produced editable layout nodes.',
    };
  }
}
