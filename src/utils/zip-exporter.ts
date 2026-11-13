/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { CanvasElement, ExportFramework, Page, Project } from '../types/editor';
import { ensureProjectPages, escapeHtml, sanitizeUrl } from './project-engine';
import { projectToForgeJson } from './forge-schema';
import { ensureComplianceConfig } from './compliance-audit';
import { FONT_AND_MEDIA_LICENSES, THIRD_PARTY_SDK_AUDIT } from './licensed-assets';
import { buildSandboxed3dSrcDoc } from './three-presets';
import { compileProjectForFramework } from './multi-framework-compiler';

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
    case 'widget3d': {
      const cfg = p.widget3d || { presetId: 'webgl-orbital-prism', presetMode: 'threejs-webgl', title: '3D Interactive Element', heightPx: 280 };
      const srcDoc = buildSandboxed3dSrcDoc(cfg);
      return `<div class="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900"><iframe title="${escapeHtml(cfg.title)}" sandbox="allow-scripts" srcdoc="${escapeHtml(srcDoc)}" class="w-full border-0 block" style="height:${cfg.heightPx || 280}px"></iframe></div>`;
    }
    default:
      return '';
  }
}

export function generateLegalHtmlPage(project: Project): string {
  const proj = ensureProjectPages(project);
  const comp = ensureComplianceConfig(proj);
  const licensesList = FONT_AND_MEDIA_LICENSES.map(
    (l) => `<li><strong>${escapeHtml(l.name)}</strong> (${escapeHtml(l.category)}): ${escapeHtml(l.license)} — ${escapeHtml(l.source)}</li>`
  ).join('\n');
  const sdkList = THIRD_PARTY_SDK_AUDIT.map(
    (s) => `<li><strong>${escapeHtml(s.packageName)}</strong> [${escapeHtml(s.runsIn)}]: ${escapeHtml(s.status)} — ${escapeHtml(s.purpose)}</li>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Legal &amp; Compliance · ${escapeHtml(proj.name)}</title>
  <style>
    body { margin: 0; background: #09090b; color: #f4f4f5; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; padding: 32px 16px; }
    main { max-width: 820px; margin: 0 auto; }
    section { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    h1 { font-size: 24px; margin-top: 0; }
    h2 { font-size: 16px; color: #fff; margin-top: 0; }
    p, li { color: #d4d4d8; font-size: 13px; }
    a { color: #93c5fd; }
  </style>
</head>
<body>
  <main>
    <p><a href="index.html">← Back to ${escapeHtml(proj.name)}</a></p>
    <h1>Legal, Privacy, Accessibility &amp; Business Disclosures</h1>
    <section>
      <h2>1. Business Details</h2>
      <p><strong>Entity:</strong> ${escapeHtml(comp.businessName)} (${escapeHtml(comp.registrationId)})<br/>
      <strong>Address:</strong> ${escapeHtml(comp.businessAddress)}<br/>
      <strong>Support:</strong> <a href="mailto:${escapeHtml(comp.supportEmail)}">${escapeHtml(comp.supportEmail)}</a></p>
    </section>
    <section>
      <h2>2. Privacy Policy, Age Gate &amp; Data Deletion</h2>
      <p>We collect only necessary data explicitly consented to by users (minimum age ${comp.minimumAge}+). For GDPR/CCPA data deletion requests, email <a href="mailto:${escapeHtml(comp.privacyEmail)}">${escapeHtml(comp.privacyEmail)}</a>.</p>
    </section>
    <section>
      <h2>3. Terms of Service &amp; Refund Policy</h2>
      <p>Transparent pricing with zero hidden fees. Paid subscriptions are eligible for a full refund within ${comp.refundWindowDays} days of purchase by contacting ${escapeHtml(comp.supportEmail)}.</p>
    </section>
    <section>
      <h2>4. Cookie Policy &amp; Email Unsubscribe</h2>
      <p>Only essential storage is active by default; non-essential cookies remain disabled unless accepted. Opt out of any emails via <a href="mailto:${escapeHtml(comp.unsubscribeEmail)}?subject=Unsubscribe">${escapeHtml(comp.unsubscribeEmail)}</a>.</p>
    </section>
    <section>
      <h2>5. Font, Image Licenses &amp; SDK Audit</h2>
      <ul>${licensesList}</ul>
      <ul>${sdkList}</ul>
    </section>
  </main>
</body>
</html>`;
}

/**
 * Generates separate static HTML files for every page/route in the project.
 */
export function generateMultiPageHtmlFiles(project: Project): Map<string, string> {
  const proj = ensureProjectPages(project);
  const comp = ensureComplianceConfig(proj);
  const usedNames = new Set<string>(['legal.html']);
  const pageFileById = new Map<string, string>();

  for (const page of proj.pages) {
    const filename = routeToHtmlFilename(page.path, usedNames);
    pageFileById.set(page.id, filename);
  }

  const files = new Map<string, string>();
  const navHtml = proj.pages
    .map((p) => {
      const href = pageFileById.get(p.id) || 'index.html';
      return `<a href="${escapeHtml(href)}" class="px-3 py-1 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800 transition">${escapeHtml(p.name)}</a>`;
    })
    .join('');

  for (const page of proj.pages) {
    const filename = pageFileById.get(page.id) || 'index.html';
    const bodyHtml = page.elements.map((el) => renderHtmlElement(el, pageFileById)).join('\n      ');
    const seoTitle = escapeHtml(page.seo?.title || `${page.name} · ${proj.name}`);
    const seoDesc = escapeHtml(page.seo?.metaDescription || proj.description || `${proj.name} built with AppForge`);
    const ogTitle = escapeHtml(page.seo?.ogTitle || seoTitle);
    const ogDesc = escapeHtml(page.seo?.ogDescription || seoDesc);
    const ogType = escapeHtml(page.seo?.ogType || 'website');
    const ogImgTag = page.seo?.ogImage
      ? `\n  <meta property="og:image" content="${escapeHtml(sanitizeUrl(page.seo.ogImage))}" />`
      : '';
    const canonicalTag = page.seo?.canonicalUrl
      ? `\n  <link rel="canonical" href="${escapeHtml(sanitizeUrl(page.seo.canonicalUrl))}" />`
      : '';
    const faviconTag = page.seo?.faviconUrl
      ? `\n  <link rel="icon" href="${escapeHtml(sanitizeUrl(page.seo.faviconUrl))}" />`
      : '';
    const transitionCls = `af-page-transition-${page.transition || 'fade'}`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />${ogImgTag}${canonicalTag}${faviconTag}
  <style>
    .sr-skip { position: absolute; left: -9999px; }
    .sr-skip:focus { position: fixed; left: 16px; top: 16px; z-index: 99; padding: 8px 14px; background: #2563eb; color: #fff; border-radius: 8px; }
    :focus-visible { outline: 2px solid #60a5fa; outline-offset: 2px; }
    .af-page-transition-fade { animation: afFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-slide-left { animation: afSlideLeft 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-slide-right { animation: afSlideRight 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-slide-up { animation: afSlideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-scale { animation: afScaleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .af-page-transition-none { animation: none; }
    @keyframes afFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes afSlideLeft { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes afSlideRight { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes afSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes afScaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen py-8 px-4 font-sans">
  <a href="#main-content" class="sr-skip">Skip to main content</a>
  <div class="max-w-4xl mx-auto space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <span class="text-sm font-bold text-white">${escapeHtml(proj.name)}</span>
      </div>
      <nav aria-label="Primary Navigation" class="flex flex-wrap items-center gap-1">${navHtml}</nav>
    </header>
    <main id="main-content" tabindex="-1" class="space-y-4 ${transitionCls}">
      ${bodyHtml}
    </main>
    <footer class="pt-6 border-t border-zinc-800 text-xs text-zinc-400 flex flex-wrap items-center justify-between gap-3">
      <span>${escapeHtml(comp.businessName)} · ${escapeHtml(comp.supportEmail)}</span>
      <nav aria-label="Legal Navigation" class="flex flex-wrap items-center gap-3">
        <a href="legal.html" class="text-blue-300 underline">Privacy &amp; Terms</a>
        <a href="legal.html" class="text-blue-300 underline">Refund Policy (${comp.refundWindowDays}d)</a>
        <a href="legal.html" class="text-blue-300 underline">Cookies &amp; Data Deletion</a>
        <a href="mailto:${escapeHtml(comp.unsubscribeEmail)}?subject=Unsubscribe" class="text-blue-300 underline">Unsubscribe</a>
      </nav>
    </footer>
  </div>
  <div id="af-toast" aria-live="polite" class="hidden fixed bottom-5 right-5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white shadow-xl"></div>
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

  files.set('legal.html', generateLegalHtmlPage(proj));
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
    case 'widget3d': {
      const cfg = p.widget3d || { presetId: 'webgl-orbital-prism', presetMode: 'threejs-webgl', title: '3D Interactive Element', heightPx: 280 };
      const srcDoc = buildSandboxed3dSrcDoc(cfg);
      return `${pad}<div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900"><iframe title={${jsxText(cfg.title)}} sandbox="allow-scripts" srcDoc={${JSON.stringify(srcDoc)}} className="w-full border-0 block" style={{ height: '${cfg.heightPx || 280}px' }} /></div>`;
    }
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

  const comp = ensureComplianceConfig(proj);
  const licenseList = FONT_AND_MEDIA_LICENSES.map((l) => `${l.name} (${l.license})`).join(' · ');
  const sdkSummary = THIRD_PARTY_SDK_AUDIT.map((s) => `${s.packageName}: ${s.status}`).join(' · ');

  const appTsx = `import React, { useState } from 'react';
${imports}

export default function App() {
  const [activePageId, setActivePageId] = useState<string>(${jsxText(proj.homePageId || proj.pages[0]?.id || 'page_home')});
  const [notice, setNotice] = useState<string | null>(null);
  const [legalOpen, setLegalOpen] = useState<boolean>(false);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2600);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 px-4 font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-xs font-semibold">
        Skip to main content
      </a>
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <h1 className="text-sm font-bold text-white">{${jsxText(proj.name)}}</h1>
          <nav aria-label="Primary pages" className="flex flex-wrap items-center gap-1">
${navButtons}
          </nav>
        </header>
        <main id="main-content" tabIndex={-1}>
${routeBranches}
        </main>
        <footer className="mt-10 pt-6 border-t border-zinc-800 text-xs text-zinc-400 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-zinc-200">{${jsxText(comp.businessName)}}</span>
            <button
              type="button"
              onClick={() => setLegalOpen(true)}
              className="px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
            >
              Privacy, Terms, Refunds & Data Deletion
            </button>
          </div>
          <p>{${jsxText(comp.businessAddress)}} · Support: {${jsxText(comp.supportEmail)}}</p>
          <p>Refund Window: {${comp.refundWindowDays}} days · Age Policy: {${comp.minimumAge}}+ {${comp.collectsKidsData} ? '(Parental consent required)' : ''}</p>
        </footer>
      </div>
      {legalOpen && (
        <div role="dialog" aria-modal="true" aria-label="Legal & Compliance Information" className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-3 text-xs text-zinc-300">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Legal, Privacy & Compliance</h2>
              <button type="button" onClick={() => setLegalOpen(false)} className="px-2 py-1 rounded border border-zinc-700 text-zinc-200 hover:bg-zinc-800 cursor-pointer">Close</button>
            </div>
            <p><strong className="text-white">Privacy & Minimal Collection:</strong> Only strictly necessary fields are collected. Privacy contact: {${jsxText(comp.privacyEmail)}}.</p>
            <p><strong className="text-white">Terms & Refund Policy:</strong> Upfront pricing with zero hidden fees. Full refund within {${comp.refundWindowDays}} days via {${jsxText(comp.supportEmail)}}.</p>
            <p><strong className="text-white">Data Deletion & Email Unsubscribe:</strong> Email {${jsxText(comp.privacyEmail)}} for account erasure or {${jsxText(comp.unsubscribeEmail)}} to opt out of emails anytime.</p>
            <p><strong className="text-white">Licenses & SDK Audit:</strong> {${jsxText(licenseList)}} · SDKs: {${jsxText(sdkSummary)}}</p>
          </div>
        </div>
      )}
      {notice && (
        <div role="status" className="fixed bottom-5 right-5 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white shadow-xl">
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

export async function exportFrameworkAsZipBlob(
  project: Project,
  framework: ExportFramework
): Promise<Blob> {
  const proj = ensureProjectPages(project);
  const compiled = compileProjectForFramework(proj, framework);
  const zip = new JSZip();

  for (const [filePath, content] of Object.entries(compiled.files)) {
    zip.file(filePath, content);
  }
  zip.file('forge-project.json', JSON.stringify(projectToForgeJson(proj), null, 2));
  return zip.generateAsync({ type: 'blob' });
}
