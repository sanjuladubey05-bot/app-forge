/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { CanvasElement, Page, Project } from '../types/editor';
import { ensureProjectPages, escapeHtml, sanitizeUrl } from './project-engine';
import { projectToForgeJson } from './forge-schema';

/**
 * Generates a safe, filesystem-friendly ZIP filename stem.
 */
export function safeZipFilename(name: string): string {
  const cleaned = (name || 'appforge-project')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'appforge-project';
}

/**
 * Maps a page route to a deterministic, unique `.html` filename.
 * `/` -> `index.html`, `/pricing` -> `pricing.html`, `/docs/api` -> `docs-api.html`
 */
export function routeToHtmlFilename(route: string, used: Set<string> = new Set()): string {
  const normalized = (route || '/').trim();
  let base = 'index';
  if (normalized !== '/' && normalized !== '') {
    base = normalized
      .replace(/^\/+/, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'page';
  }
  let candidate = `${base}.html`;
  let counter = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${counter}.html`;
    counter++;
  }
  used.add(candidate);
  return candidate;
}

function renderHtmlElement(
  el: CanvasElement,
  pageFileById: Map<string, string>
): string {
  if (el.hidden) return '';
  const p = el.props || {};
  const s = el.styles || {};

  if (p.unknownType) {
    return `<div class="p-3 rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-200 text-xs">Unsupported node type preserved safely: ${escapeHtml(p.unknownType)}</div>`;
  }

  const inlineStyleParts: string[] = [];
  if (s.backgroundColor) inlineStyleParts.push(`background-color:${escapeHtml(s.backgroundColor)}`);
  if (s.textColor) inlineStyleParts.push(`color:${escapeHtml(s.textColor)}`);
  if (s.borderColor) inlineStyleParts.push(`border-color:${escapeHtml(s.borderColor)}`);
  if (s.maxWidth) inlineStyleParts.push(`max-width:${escapeHtml(s.maxWidth)}`);
  const styleAttr = inlineStyleParts.length > 0 ? ` style="${inlineStyleParts.join(';')}"` : '';

  const childrenHtml = (el.children || [])
    .map((child) => renderHtmlElement(child, pageFileById))
    .join('\n');

  const resolvePageHref = (targetPageId?: string): string => {
    if (!targetPageId) return '#';
    return pageFileById.get(targetPageId) || 'index.html';
  };

  switch (el.type) {
    case 'navbar': {
      const links = (p.navLinks || []).map((link) => {
        const href = link.targetPageId ? resolvePageHref(link.targetPageId) : sanitizeUrl(link.url);
        return `<a href="${escapeHtml(href)}" class="text-xs text-zinc-300 hover:text-white transition px-2 py-1">${escapeHtml(link.label)}</a>`;
      }).join('');
      const ctaBtn = p.ctaLabel
        ? `<a href="${escapeHtml(resolvePageHref(p.ctaTargetPageId))}" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition">${escapeHtml(p.ctaLabel)}</a>`
        : '';
      return `<nav${styleAttr} class="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900">
        <span class="font-bold text-sm text-white">${escapeHtml(p.brandName || 'AppForge')}</span>
        <div class="flex items-center gap-2">${links}${ctaBtn}</div>
        ${childrenHtml}
      </nav>`;
    }
    case 'container': {
      const dirClass = p.direction === 'row' ? 'flex-row flex-wrap items-stretch' : 'flex-col';
      const wClass =
        s.width === 'third'
          ? 'w-full md:w-[calc(33.333%-0.75rem)] min-w-0'
          : s.width === 'half'
          ? 'w-full sm:w-[calc(50%-0.5rem)] min-w-0'
          : 'w-full min-w-0';
      return `<div${styleAttr} class="${wClass} flex ${dirClass} gap-4 p-4 rounded-xl border border-zinc-800/80">${childrenHtml}</div>`;
    }
    case 'card': {
      const wClass =
        s.width === 'third'
          ? 'w-full md:w-[calc(33.333%-0.75rem)] min-w-0'
          : s.width === 'half'
          ? 'w-full sm:w-[calc(50%-0.5rem)] min-w-0'
          : 'w-full min-w-0';
      return `<section${styleAttr} class="${wClass} p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 shadow">
        ${p.text ? `<h3 class="text-base font-semibold text-white">${escapeHtml(p.text)}</h3>` : ''}
        ${p.subtext ? `<p class="text-xs text-zinc-400 leading-relaxed">${escapeHtml(p.subtext)}</p>` : ''}
        ${childrenHtml}
      </section>`;
    }
    case 'heading': {
      const tag = p.headingLevel === 'h2' ? 'h2' : p.headingLevel === 'h3' ? 'h3' : 'h1';
      const sizeClass =
        tag === 'h1' ? 'text-3xl font-bold' : tag === 'h2' ? 'text-2xl font-bold' : 'text-xl font-semibold';
      const alignClass = s.textAlign === 'center' ? 'text-center' : s.textAlign === 'right' ? 'text-right' : 'text-left';
      return `<div class="${alignClass} space-y-1">
        <${tag}${styleAttr} class="${sizeClass} tracking-tight text-white">${escapeHtml(p.text || 'Heading')}</${tag}>
        ${p.subtext ? `<p class="text-sm text-zinc-400">${escapeHtml(p.subtext)}</p>` : ''}
      </div>`;
    }
    case 'text':
      return `<p${styleAttr} class="text-sm text-zinc-300 leading-relaxed">${escapeHtml(p.text || '')}</p>`;
    case 'badge':
      return `<span${styleAttr} class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">${escapeHtml(p.text || 'Badge')}</span>`;
    case 'button': {
      if (p.whenClicked === 'openPage' && p.targetPageId) {
        return `<a href="${escapeHtml(resolvePageHref(p.targetPageId))}"${styleAttr} class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow">${escapeHtml(p.text || 'Continue')}</a>`;
      }
      const msg = p.whenClicked === 'submitForm' ? 'Form submitted successfully!' : p.toastMessage || `Triggered ${p.text || 'Button'}`;
      return `<button type="button" onclick="window.__afNotify('${escapeHtml(msg)}')"${styleAttr} class="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow cursor-pointer">${escapeHtml(p.text || 'Action')}</button>`;
    }
    case 'input':
      return `<label class="block space-y-1.5">
        ${p.label ? `<span class="block text-xs font-medium text-zinc-300">${escapeHtml(p.label)}</span>` : ''}
        <input type="text" placeholder="${escapeHtml(p.placeholder || '')}" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500" />
      </label>`;
    case 'textarea':
      return `<label class="block space-y-1.5">
        ${p.label ? `<span class="block text-xs font-medium text-zinc-300">${escapeHtml(p.label)}</span>` : ''}
        <textarea rows="3" placeholder="${escapeHtml(p.placeholder || '')}" class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500"></textarea>
      </label>`;
    case 'select':
      return `<label class="block space-y-1.5">
        ${p.label ? `<span class="block text-xs font-medium text-zinc-300">${escapeHtml(p.label)}</span>` : ''}
        <select class="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white">
          ${(p.options || ['Option 1']).map((opt) => `<option>${escapeHtml(opt)}</option>`).join('')}
        </select>
      </label>`;
    case 'toggle':
      return `<label class="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer">
        <span class="text-xs font-medium text-zinc-200">${escapeHtml(p.label || 'Toggle Option')}</span>
        <input type="checkbox" ${p.toggleChecked ? 'checked' : ''} class="w-4 h-4 accent-blue-500" />
      </label>`;
    case 'metric':
      return `<div${styleAttr} class="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-1 shadow">
        <div class="text-xs text-zinc-400 uppercase tracking-wider">${escapeHtml(p.metricLabel || 'Metric')}</div>
        <div class="text-2xl font-bold text-white">${escapeHtml(p.metricValue || '0')}</div>
        ${p.metricTrend ? `<div class="text-xs text-emerald-400">${escapeHtml(p.metricTrend)}</div>` : ''}
      </div>`;
    case 'image':
      return `<div class="w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <img src="${escapeHtml(sanitizeUrl(p.imageUrl))}" alt="${escapeHtml(p.imageAlt || 'Image')}" class="w-full h-56 object-cover" />
      </div>`;
    case 'divider':
      return `<hr class="border-zinc-800 my-4" />`;
    case 'table':
      return `<div class="border border-zinc-800 rounded-xl overflow-x-auto bg-zinc-900">
        <table class="w-full text-left text-xs text-zinc-300">
          <thead class="bg-zinc-800/80 text-zinc-400 uppercase">
            <tr>${(p.tableHeaders || []).map((h) => `<th class="px-3.5 py-2.5">${escapeHtml(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${(p.tableRows || []).map((row) => `<tr class="border-t border-zinc-800">${row.map((c) => `<td class="px-3.5 py-2.5">${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    default:
      return '';
  }
}

/**
 * Generates separate static HTML files for every page/route in the project.
 */
export function generateMultiPageHtmlFiles(project: Project): Map<string, string> {
  const proj = ensureProjectPages(project);
  const usedNames = new Set<string>();
  const pageFileById = new Map<string, string>();

  for (const page of proj.pages) {
    const filename = routeToHtmlFilename(page.path, usedNames);
    pageFileById.set(page.id, filename);
  }

  const files = new Map<string, string>();
  const navHtml = proj.pages
    .map((p) => {
      const href = pageFileById.get(p.id) || 'index.html';
      return `<a href="${escapeHtml(href)}" class="px-3 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition">${escapeHtml(p.name)}</a>`;
    })
    .join('');

  for (const page of proj.pages) {
    const filename = pageFileById.get(page.id) || 'index.html';
    const bodyHtml = page.elements.map((el) => renderHtmlElement(el, pageFileById)).join('\n      ');
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.name)} · ${escapeHtml(proj.name)}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen py-8 px-4 font-sans">
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <span class="text-sm font-bold text-white">${escapeHtml(proj.name)}</span>
      </div>
      <nav class="flex flex-wrap items-center gap-1">${navHtml}</nav>
    </header>
    <main class="space-y-4">
      ${bodyHtml}
    </main>
  </div>
  <div id="af-toast" class="hidden fixed bottom-5 right-5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white shadow-xl"></div>
  <script>
    window.__afNotify = function(msg) {
      var el = document.getElementById('af-toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.remove('hidden');
      setTimeout(function() { el.classList.add('hidden'); }, 2800);
    };
  </script>
</body>
</html>`;
    files.set(filename, html);
  }

  return files;
}

function toPascalIdentifier(raw: string, fallback: string): string {
  const cleaned = (raw || '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  if (!cleaned) return fallback;
  return /^[0-9]/.test(cleaned) ? `Page${cleaned}` : cleaned;
}

function jsxText(val: unknown): string {
  return JSON.stringify(String(val ?? ''));
}

function renderReactElementJsx(el: CanvasElement, indent = 6): string {
  if (el.hidden) return '';
  const pad = ' '.repeat(indent);
  const p = el.props || {};
  const s = el.styles || {};

  if (p.unknownType) {
    return `${pad}<div className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/30 text-amber-200 text-xs">{${jsxText(`Unsupported node: ${p.unknownType}`)}}</div>`;
  }

  const childrenJsx = (el.children || [])
    .map((child) => renderReactElementJsx(child, indent + 2))
    .filter(Boolean)
    .join('\n');

  switch (el.type) {
    case 'navbar':
      return `${pad}<nav className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900">
${pad}  <span className="font-bold text-sm text-white">{${jsxText(p.brandName || 'AppForge')}}</span>
${pad}  <div className="flex items-center gap-2">
${(p.navLinks || [])
  .map((l) =>
    l.targetPageId
      ? `${pad}    <button type="button" onClick={() => onNavigate(${jsxText(l.targetPageId)})} className="px-2 py-1 text-xs text-zinc-300 hover:text-white cursor-pointer">{${jsxText(l.label)}}</button>`
      : `${pad}    <span className="px-2 py-1 text-xs text-zinc-300">{${jsxText(l.label)}}</span>`
  )
  .join('\n')}
${p.ctaLabel ? `${pad}    <button type="button" onClick={() => ${p.ctaTargetPageId ? `onNavigate(${jsxText(p.ctaTargetPageId)})` : `onNotify(${jsxText(p.ctaLabel)})`}} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer">{${jsxText(p.ctaLabel)}}</button>` : ''}
${pad}  </div>
${pad}</nav>`;
    case 'container': {
      const wClass =
        s.width === 'third'
          ? 'w-full md:w-[calc(33.333%-0.75rem)] min-w-0'
          : s.width === 'half'
          ? 'w-full sm:w-[calc(50%-0.5rem)] min-w-0'
          : 'w-full min-w-0';
      return `${pad}<div className="${wClass} flex ${p.direction === 'row' ? 'flex-row flex-wrap items-stretch' : 'flex-col'} gap-4 p-4 rounded-xl border border-zinc-800/80">
${childrenJsx}
${pad}</div>`;
    }
    case 'card': {
      const wClass =
        s.width === 'third'
          ? 'w-full md:w-[calc(33.333%-0.75rem)] min-w-0'
          : s.width === 'half'
          ? 'w-full sm:w-[calc(50%-0.5rem)] min-w-0'
          : 'w-full min-w-0';
      return `${pad}<section className="${wClass} p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3 shadow">
${p.text ? `${pad}  <h3 className="text-base font-semibold text-white">{${jsxText(p.text)}}</h3>` : ''}
${p.subtext ? `${pad}  <p className="text-xs text-zinc-400">{${jsxText(p.subtext)}}</p>` : ''}
${childrenJsx}
${pad}</section>`;
    }
    case 'heading': {
      const Tag = p.headingLevel === 'h2' ? 'h2' : p.headingLevel === 'h3' ? 'h3' : 'h1';
      const sizeClass = Tag === 'h1' ? 'text-3xl font-bold' : Tag === 'h2' ? 'text-2xl font-bold' : 'text-xl font-semibold';
      return `${pad}<div className="${s.textAlign === 'center' ? 'text-center' : 'text-left'} space-y-1">
${pad}  <${Tag} className="${sizeClass} tracking-tight text-white">{${jsxText(p.text || 'Heading')}}</${Tag}>
${p.subtext ? `${pad}  <p className="text-sm text-zinc-400">{${jsxText(p.subtext)}}</p>` : ''}
${pad}</div>`;
    }
    case 'text':
      return `${pad}<p className="text-sm text-zinc-300 leading-relaxed">{${jsxText(p.text || '')}}</p>`;
    case 'badge':
      return `${pad}<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">{${jsxText(p.text || 'Badge')}}</span>`;
    case 'button': {
      const clickHandler =
        p.whenClicked === 'openPage' && p.targetPageId
          ? `() => onNavigate(${jsxText(p.targetPageId)})`
          : `() => onNotify(${jsxText(p.toastMessage || `Triggered ${p.text || 'Button'}`)})`;
      return `${pad}<button type="button" onClick={${clickHandler}} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition shadow cursor-pointer">{${jsxText(p.text || 'Action')}}</button>`;
    }
    case 'input':
      return `${pad}<label className="block space-y-1.5">
${p.label ? `${pad}  <span className="block text-xs font-medium text-zinc-300">{${jsxText(p.label)}}</span>` : ''}
${pad}  <input type="text" placeholder={${jsxText(p.placeholder || '')}} className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white" />
${pad}</label>`;
    case 'textarea':
      return `${pad}<label className="block space-y-1.5">
${p.label ? `${pad}  <span className="block text-xs font-medium text-zinc-300">{${jsxText(p.label)}}</span>` : ''}
${pad}  <textarea rows={3} placeholder={${jsxText(p.placeholder || '')}} className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white" />
${pad}</label>`;
    case 'select':
      return `${pad}<label className="block space-y-1.5">
${p.label ? `${pad}  <span className="block text-xs font-medium text-zinc-300">{${jsxText(p.label)}}</span>` : ''}
${pad}  <select className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white">
${(p.options || ['Option 1']).map((opt) => `${pad}    <option>{${jsxText(opt)}}</option>`).join('\n')}
${pad}  </select>
${pad}</label>`;
    case 'toggle':
      return `${pad}<label className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800">
${pad}  <span className="text-xs font-medium text-zinc-200">{${jsxText(p.label || 'Toggle')}}</span>
${pad}  <input type="checkbox" defaultChecked={${Boolean(p.toggleChecked)}} className="w-4 h-4 accent-blue-500" />
${pad}</label>`;
    case 'metric':
      return `${pad}<div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900 space-y-1">
${pad}  <div className="text-xs text-zinc-400 uppercase">{${jsxText(p.metricLabel || 'Metric')}}</div>
${pad}  <div className="text-2xl font-bold text-white">{${jsxText(p.metricValue || '0')}}</div>
${p.metricTrend ? `${pad}  <div className="text-xs text-emerald-400">{${jsxText(p.metricTrend)}}</div>` : ''}
${pad}</div>`;
    case 'image':
      return `${pad}<img src={${jsxText(sanitizeUrl(p.imageUrl))}} alt={${jsxText(p.imageAlt || 'Image')}} className="w-full h-56 object-cover rounded-xl border border-zinc-800" />`;
    case 'divider':
      return `${pad}<hr className="border-zinc-800 my-4" />`;
    case 'table':
      return `${pad}<div className="border border-zinc-800 rounded-xl overflow-x-auto bg-zinc-900">
${pad}  <table className="w-full text-left text-xs text-zinc-300">
${pad}    <thead className="bg-zinc-800/80 text-zinc-400 uppercase">
${pad}      <tr>${(p.tableHeaders || []).map((h) => `<th className="px-3.5 py-2.5">{${jsxText(h)}}</th>`).join('')}</tr>
${pad}    </thead>
${pad}    <tbody>
${(p.tableRows || []).map((row) => `${pad}      <tr className="border-t border-zinc-800">${row.map((c) => `<td className="px-3.5 py-2.5">{${jsxText(c)}}</td>`).join('')}</tr>`).join('\n')}
${pad}    </tbody>
${pad}  </table>
${pad}</div>`;
    default:
      return '';
  }
}

/**
 * Generates real typed React TSX source files (`App.tsx` and `pages/*.tsx`) reflecting all pages & elements.
 */
export function generateReactBundleFiles(project: Project): Map<string, string> {
  const proj = ensureProjectPages(project);
  const files = new Map<string, string>();
  const usedComponentNames = new Set<string>();
  const pageComponents: { page: Page; componentName: string }[] = proj.pages.map((p, idx) => {
    let compName = toPascalIdentifier(p.name, `Screen${idx + 1}`);
    while (usedComponentNames.has(compName)) {
      compName = `${compName}${idx + 2}`;
    }
    usedComponentNames.add(compName);
    return { page: p, componentName: compName };
  });

  for (const { page, componentName } of pageComponents) {
    const elementsJsx = page.elements
      .map((el) => renderReactElementJsx(el, 6))
      .filter(Boolean)
      .join('\n');

    const pageCode = `import React from 'react';

interface PageProps {
  onNavigate: (pageId: string) => void;
  onNotify: (message: string) => void;
}

export const ${componentName}: React.FC<PageProps> = ({ onNavigate, onNotify }) => {
  return (
    <div className="space-y-4">
${elementsJsx || '      <p className="text-sm text-zinc-400">Empty screen</p>'}
    </div>
  );
};
`;
    files.set(`react/pages/${componentName}.tsx`, pageCode);
  }

  const imports = pageComponents
    .map(({ componentName }) => `import { ${componentName} } from './pages/${componentName}';`)
    .join('\n');

  const routeBranches = pageComponents
    .map(
      ({ page, componentName }) =>
        `        {activePageId === ${jsxText(page.id)} && <${componentName} onNavigate={setActivePageId} onNotify={showNotice} />}`
    )
    .join('\n');

  const navButtons = pageComponents
    .map(
      ({ page }) =>
        `            <button key={${jsxText(page.id)}} type="button" onClick={() => setActivePageId(${jsxText(page.id)})} className={\`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer \${activePageId === ${jsxText(page.id)} ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'}\`}>{${jsxText(page.name)}}</button>`
    )
    .join('\n');

  const appTsx = `import React, { useState } from 'react';
${imports}

export default function App() {
  const [activePageId, setActivePageId] = useState<string>(${jsxText(proj.homePageId || proj.pages[0]?.id || 'page_home')});
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <h1 className="text-sm font-bold text-white">{${jsxText(proj.name)}}</h1>
          <nav className="flex flex-wrap items-center gap-1">
${navButtons}
          </nav>
        </header>
        <main>
${routeBranches}
        </main>
      </div>
      {notice && (
        <div className="fixed bottom-5 right-5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white shadow-xl">
          {notice}
        </div>
      )}
    </div>
  );
}
`;
  files.set('react/App.tsx', appTsx);
  return files;
}

/**
 * Generates an itemized file manifest + real `.zip` archive Blob using JSZip.
 */
export function getZipManifestPaths(project: Project): string[] {
  const htmlFiles = generateMultiPageHtmlFiles(project);
  const reactFiles = generateReactBundleFiles(project);
  return [
    ...Array.from(htmlFiles.keys()).map((f) => `html/${f}`),
    ...Array.from(reactFiles.keys()),
    'forge-project.json',
    'appforge-backup.json',
    'README.md',
  ];
}

export async function exportProjectAsZipBlob(project: Project): Promise<Blob> {
  const proj = ensureProjectPages(project);
  const zip = new JSZip();

  const htmlFiles = generateMultiPageHtmlFiles(proj);
  htmlFiles.forEach((content, name) => {
    zip.file(`html/${name}`, content);
  });

  const reactFiles = generateReactBundleFiles(proj);
  reactFiles.forEach((content, path) => {
    zip.file(path, content);
  });

  zip.file('forge-project.json', JSON.stringify(projectToForgeJson(proj), null, 2));
  zip.file('appforge-backup.json', JSON.stringify(proj, null, 2));
  zip.file(
    'README.md',
    `# ${proj.name}\n\nExported from AppForge Studio.\n\n## Included Targets\n- \`html/\`: Multi-page static Tailwind HTML bundle (\`${htmlFiles.size}\` routes)\n- \`react/\`: Typed React + TSX source components (\`${reactFiles.size}\` files)\n- \`forge-project.json\`: Standardized Forge JSON schema v1.0\n- \`appforge-backup.json\`: Complete AppForge project backup\n`
  );

  return zip.generateAsync({ type: 'blob' });
}
