import { CanvasElement, ExportFramework, Page, Project, ThemeTokens } from '../types/editor';
import { ensureProjectPages, escapeHtml, sanitizeUrl } from './project-engine';
import { ensureThemeTokens, themeTokensToCss } from './theme-engine';
import { buildSandboxed3dSrcDoc } from './three-presets';
import { ensureComplianceConfig } from './compliance-audit';
import { FONT_AND_MEDIA_LICENSES, THIRD_PARTY_SDK_AUDIT } from './licensed-assets';
import { generateLegalHtmlPage, routeToHtmlFilename } from './zip-exporter';

export interface CompiledFrameworkBundle {
  framework: ExportFramework;
  vercelPreset: null | 'vite' | 'nextjs' | 'vue';
  entryFile: string;
  files: Record<string, string>;
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

function routeToNextSlug(route: string): string {
  const cleaned = (route || '/')
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9/-]+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/^-+|-+$/g, '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
  return cleaned;
}

function projectSlug(name: string): string {
  return (
    (name || 'appforge-app')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'appforge-app'
  );
}

function sharedCssSheet(tokens: ThemeTokens, stackBelowPx: number): string {
  return `${themeTokensToCss(tokens)}

* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  background: var(--af-bg);
  color: var(--af-text);
  font-family: var(--af-font);
  line-height: 1.55;
}
a { color: inherit; }
.af-shell { max-width: 1040px; margin: 0 auto; padding: 28px 18px; }
.af-header {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 12px; padding-bottom: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--af-border);
}
.af-brand { font-weight: 700; font-size: 15px; color: var(--af-text); text-decoration: none; }
.af-nav { display: flex; flex-wrap: wrap; gap: 8px; }
.af-nav-link {
  padding: 6px 12px; border-radius: var(--af-radius); font-size: 13px;
  color: var(--af-muted); text-decoration: none; border: 1px solid transparent; background: transparent; cursor: pointer;
}
.af-nav-link:hover, .af-nav-link.active {
  color: var(--af-text); background: var(--af-surface); border-color: var(--af-border);
}
.af-stack { display: flex; flex-direction: column; gap: 16px; }
.af-row { display: flex; flex-direction: row; flex-wrap: wrap; gap: 16px; align-items: stretch; }
.af-card {
  background: var(--af-surface); border: 1px solid var(--af-border);
  border-radius: var(--af-radius); padding: 20px; width: 100%;
}
.af-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 18px; border-radius: var(--af-radius); font-size: 14px; font-weight: 600;
  background: var(--af-primary); color: #ffffff; border: 1px solid transparent;
  cursor: pointer; text-decoration: none;
}
.af-btn-outline { background: transparent; color: var(--af-text); border-color: var(--af-border); }
.af-badge {
  display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 600; border: 1px solid var(--af-primary); color: var(--af-primary);
}
.af-input {
  width: 100%; padding: 10px 12px; border-radius: var(--af-radius);
  border: 1px solid var(--af-border); background: var(--af-bg); color: var(--af-text); font-size: 13px;
}
.af-3d-frame {
  width: 100%; border: 1px solid var(--af-border); border-radius: var(--af-radius);
  overflow: hidden; background: var(--af-surface);
}
.af-footer {
  margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--af-border);
  font-size: 12px; color: var(--af-muted); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px;
}
.sr-skip { position: absolute; left: -9999px; }
.sr-skip:focus { position: fixed; left: 16px; top: 16px; z-index: 99; padding: 8px 14px; background: var(--af-primary); color: #fff; border-radius: 8px; }
:focus-visible { outline: 2px solid var(--af-primary); outline-offset: 2px; }

@media (max-width: ${stackBelowPx}px) {
  .af-row { flex-direction: column !important; }
  .af-col-half, .af-col-third { width: 100% !important; }
}

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
`;
}

// ------------------------------------------------------------
// 1. Static HTML / CSS / JS Compiler
// ------------------------------------------------------------
function renderStaticHtmlElement(
  el: CanvasElement,
  pageFileById: Map<string, string>,
  tokens: ThemeTokens
): string {
  if (el.hidden) return '';
  const p = el.props || {};
  const s = el.styles || {};
  const styleParts: string[] = [];
  if (s.backgroundColor) styleParts.push(`background-color:${escapeHtml(s.backgroundColor)}`);
  if (s.textColor) styleParts.push(`color:${escapeHtml(s.textColor)}`);
  if (s.borderColor) styleParts.push(`border-color:${escapeHtml(s.borderColor)}`);
  const styleAttr = styleParts.length > 0 ? ` style="${styleParts.join(';')}"` : '';

  const resolveHref = (pid?: string) => (pid ? pageFileById.get(pid) || 'index.html' : '#');
  const childrenHtml = (el.children || [])
    .map((c) => renderStaticHtmlElement(c, pageFileById, tokens))
    .join('\n');

  switch (el.type) {
    case 'navbar': {
      const links = (p.navLinks || [])
        .map((l) => `<a href="${escapeHtml(l.targetPageId ? resolveHref(l.targetPageId) : sanitizeUrl(l.url))}" class="af-nav-link">${escapeHtml(l.label)}</a>`)
        .join('');
      const cta = p.ctaLabel
        ? `<a href="${escapeHtml(resolveHref(p.ctaTargetPageId))}" class="af-btn">${escapeHtml(p.ctaLabel)}</a>`
        : '';
      return `<nav${styleAttr} class="af-card af-row" style="justify-content:space-between;align-items:center;"><strong class="af-brand">${escapeHtml(p.brandName || 'AppForge')}</strong><div class="af-nav">${links}${cta}</div>${childrenHtml}</nav>`;
    }
    case 'container': {
      const cls = p.direction === 'row' ? 'af-row' : 'af-stack';
      const wCls = s.width === 'third' ? 'af-col-third' : s.width === 'half' ? 'af-col-half' : '';
      return `<div${styleAttr} class="${cls} ${wCls}">${childrenHtml}</div>`;
    }
    case 'card':
      return `<section${styleAttr} class="af-card af-stack">${p.text ? `<h3>${escapeHtml(p.text)}</h3>` : ''}${p.subtext ? `<p style="color:var(--af-muted);font-size:13px">${escapeHtml(p.subtext)}</p>` : ''}${childrenHtml}</section>`;
    case 'heading': {
      const tag = p.headingLevel === 'h2' ? 'h2' : p.headingLevel === 'h3' ? 'h3' : 'h1';
      return `<div style="text-align:${escapeHtml(s.textAlign || 'left')}"><${tag}${styleAttr} style="margin:0 0 6px">${escapeHtml(p.text || 'Heading')}</${tag}>${p.subtext ? `<p style="color:var(--af-muted);margin:0">${escapeHtml(p.subtext)}</p>` : ''}</div>`;
    }
    case 'text':
      return `<p${styleAttr} style="margin:0">${escapeHtml(p.text || '')}</p>`;
    case 'badge':
      return `<span${styleAttr} class="af-badge">${escapeHtml(p.text || 'Badge')}</span>`;
    case 'button': {
      if (p.whenClicked === 'openPage' && p.targetPageId) {
        return `<a href="${escapeHtml(resolveHref(p.targetPageId))}"${styleAttr} class="af-btn">${escapeHtml(p.text || 'Continue')}</a>`;
      }
      const msg = p.toastMessage || `Triggered ${p.text || 'Action'}`;
      return `<button type="button" data-af-toast="${escapeHtml(msg)}"${styleAttr} class="af-btn ${p.buttonVariant === 'outline' ? 'af-btn-outline' : ''}">${escapeHtml(p.text || 'Action')}</button>`;
    }
    case 'input':
      return `<label class="af-stack" style="gap:6px">${p.label ? `<span style="font-size:12px;font-weight:600">${escapeHtml(p.label)}</span>` : ''}<input type="text" placeholder="${escapeHtml(p.placeholder || '')}" class="af-input" /></label>`;
    case 'textarea':
      return `<label class="af-stack" style="gap:6px">${p.label ? `<span style="font-size:12px;font-weight:600">${escapeHtml(p.label)}</span>` : ''}<textarea rows="3" placeholder="${escapeHtml(p.placeholder || '')}" class="af-input"></textarea></label>`;
    case 'select':
      return `<label class="af-stack" style="gap:6px">${p.label ? `<span style="font-size:12px;font-weight:600">${escapeHtml(p.label)}</span>` : ''}<select class="af-input">${(p.options || ['Option 1']).map((o) => `<option>${escapeHtml(o)}</option>`).join('')}</select></label>`;
    case 'toggle':
      return `<label class="af-card" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer"><span>${escapeHtml(p.label || 'Toggle')}</span><input type="checkbox" ${p.toggleChecked ? 'checked' : ''} /></label>`;
    case 'metric':
      return `<div${styleAttr} class="af-card"><div style="font-size:11px;text-transform:uppercase;color:var(--af-muted)">${escapeHtml(p.metricLabel || 'Metric')}</div><div style="font-size:26px;font-weight:700;margin-top:4px">${escapeHtml(p.metricValue || '0')}</div>${p.metricTrend ? `<div style="font-size:12px;color:#34d399;margin-top:4px">${escapeHtml(p.metricTrend)}</div>` : ''}</div>`;
    case 'image':
      return `<div class="af-card" style="padding:0;overflow:hidden"><img src="${escapeHtml(sanitizeUrl(p.imageUrl))}" alt="${escapeHtml(p.imageAlt || 'Image')}" style="width:100%;height:240px;object-fit:cover;display:block" /></div>`;
    case 'divider':
      return `<hr style="border:0;border-top:1px solid var(--af-border);width:100%" />`;
    case 'table':
      return `<div class="af-card" style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left"><thead><tr>${(p.tableHeaders || []).map((h) => `<th style="padding:8px;border-bottom:1px solid var(--af-border)">${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${(p.tableRows || []).map((r) => `<tr>${r.map((c) => `<td style="padding:8px;border-bottom:1px solid var(--af-border)">${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'widget3d': {
      const cfg = p.widget3d || {
        presetId: 'webgl-orbital-prism',
        presetMode: 'threejs-webgl',
        title: '3D Interactive Element',
        heightPx: 280,
      };
      const srcDoc = buildSandboxed3dSrcDoc(cfg, tokens);
      const h = Math.max(180, Math.min(560, cfg.heightPx || 280));
      return `<div class="af-3d-frame"><iframe title="${escapeHtml(cfg.title)}" sandbox="allow-scripts" style="width:100%;height:${h}px;border:0;display:block" srcdoc="${escapeHtml(srcDoc)}"></iframe></div>`;
    }
    default:
      return '';
  }
}

function compileHtmlBundle(project: Project): CompiledFrameworkBundle {
  const proj = ensureProjectPages(project);
  const tokens = ensureThemeTokens(proj);
  const comp = ensureComplianceConfig(proj);
  const stackBelow = proj.responsiveStackBelowPx ?? 768;

  const used = new Set<string>(['legal.html']);
  const pageFileById = new Map<string, string>();
  for (const page of proj.pages) {
    pageFileById.set(page.id, routeToHtmlFilename(page.path, used));
  }

  const files: Record<string, string> = {};
  files['styles.css'] = sharedCssSheet(tokens, stackBelow);
  files['script.js'] = `document.addEventListener('click', function (e) {
  var btn = e.target && e.target.closest ? e.target.closest('[data-af-toast]') : null;
  if (!btn) return;
  var msg = btn.getAttribute('data-af-toast') || 'Action triggered';
  var el = document.getElementById('af-toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(window.__afToastTimer);
  window.__afToastTimer = setTimeout(function () { el.hidden = true; }, 2800);
});`;

  const navLinksHtml = proj.pages
    .map((p) => `<a href="${escapeHtml(pageFileById.get(p.id) || 'index.html')}" class="af-nav-link">${escapeHtml(p.name)}</a>`)
    .join('');

  for (const page of proj.pages) {
    const filename = pageFileById.get(page.id) || 'index.html';
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
    const bodyHtml = page.elements.map((el) => renderStaticHtmlElement(el, pageFileById, tokens)).join('\n      ');

    files[filename] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />${ogImgTag}${canonicalTag}${faviconTag}
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <a href="#main-content" class="sr-skip">Skip to main content</a>
  <div class="af-shell">
    <header class="af-header">
      <a href="index.html" class="af-brand">${escapeHtml(proj.name)}</a>
      <nav aria-label="Primary Navigation" class="af-nav">${navLinksHtml}</nav>
    </header>
    <main id="main-content" class="af-stack ${transitionCls}">
      ${bodyHtml}
    </main>
    <footer class="af-footer">
      <span>${escapeHtml(comp.businessName)} · ${escapeHtml(comp.supportEmail)}</span>
      <div class="af-nav">
        <a href="legal.html" class="af-nav-link">Privacy &amp; Terms</a>
        <a href="legal.html" class="af-nav-link">Refunds (${comp.refundWindowDays}d)</a>
        <a href="mailto:${escapeHtml(comp.unsubscribeEmail)}?subject=Unsubscribe" class="af-nav-link">Unsubscribe</a>
      </div>
    </footer>
  </div>
  <div id="af-toast" hidden style="position:fixed;right:20px;bottom:20px;padding:10px 16px;border-radius:10px;background:var(--af-surface);border:1px solid var(--af-border);color:var(--af-text);font-size:13px;box-shadow:0 12px 30px rgba(0,0,0,0.4)"></div>
  <script src="script.js"></script>
</body>
</html>`;
  }

  files['legal.html'] = generateLegalHtmlPage(proj);
  files['README.md'] = `# ${proj.name}\n\nGenerated by AppForge Studio (Static HTML/CSS/JS target).\n\nOpen \`index.html\` directly or deploy to Vercel with zero build step required.\n`;

  return {
    framework: 'html',
    vercelPreset: null,
    entryFile: 'index.html',
    files,
  };
}

// ------------------------------------------------------------
// Common JSX / Vue Helpers
// ------------------------------------------------------------
function jsxStr(v: unknown): string {
  return JSON.stringify(String(v ?? ''));
}

function renderReactTreeJsx(el: CanvasElement, tokens: ThemeTokens, indent = 6): string {
  if (el.hidden) return '';
  const pad = ' '.repeat(indent);
  const p = el.props || {};
  const s = el.styles || {};
  const childrenJsx = (el.children || [])
    .map((c) => renderReactTreeJsx(c, tokens, indent + 2))
    .filter(Boolean)
    .join('\n');

  switch (el.type) {
    case 'navbar':
      return `${pad}<nav className="af-card af-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
${pad}  <span className="af-brand">{${jsxStr(p.brandName || 'AppForge')}}</span>
${pad}  <div className="af-nav">
${(p.navLinks || [])
  .map((l) =>
    l.targetPageId
      ? `${pad}    <button type="button" onClick={() => onNavigate(${jsxStr(l.targetPageId)})} className="af-nav-link">{${jsxStr(l.label)}}</button>`
      : `${pad}    <span className="af-nav-link">{${jsxStr(l.label)}}</span>`
  )
  .join('\n')}
${p.ctaLabel ? `${pad}    <button type="button" onClick={() => ${p.ctaTargetPageId ? `onNavigate(${jsxStr(p.ctaTargetPageId)})` : `onNotify(${jsxStr(p.ctaLabel)})`}} className="af-btn">{${jsxStr(p.ctaLabel)}}</button>` : ''}
${pad}  </div>
${pad}</nav>`;
    case 'container':
      return `${pad}<div className="${p.direction === 'row' ? 'af-row' : 'af-stack'}${s.width === 'third' ? ' af-col-third' : s.width === 'half' ? ' af-col-half' : ''}">
${childrenJsx}
${pad}</div>`;
    case 'card':
      return `${pad}<section className="af-card af-stack">
${p.text ? `${pad}  <h3>{${jsxStr(p.text)}}</h3>` : ''}
${p.subtext ? `${pad}  <p style={{ color: 'var(--af-muted)', fontSize: '13px' }}>{${jsxStr(p.subtext)}}</p>` : ''}
${childrenJsx}
${pad}</section>`;
    case 'heading': {
      const Tag = p.headingLevel === 'h2' ? 'h2' : p.headingLevel === 'h3' ? 'h3' : 'h1';
      return `${pad}<div style={{ textAlign: ${jsxStr(s.textAlign || 'left')} }}>
${pad}  <${Tag}>{${jsxStr(p.text || 'Heading')}}</${Tag}>
${p.subtext ? `${pad}  <p style={{ color: 'var(--af-muted)' }}>{${jsxStr(p.subtext)}}</p>` : ''}
${pad}</div>`;
    }
    case 'text':
      return `${pad}<p>{${jsxStr(p.text || '')}}</p>`;
    case 'badge':
      return `${pad}<span className="af-badge">{${jsxStr(p.text || 'Badge')}}</span>`;
    case 'button': {
      const handler =
        p.whenClicked === 'openPage' && p.targetPageId
          ? `() => onNavigate(${jsxStr(p.targetPageId)})`
          : `() => onNotify(${jsxStr(p.toastMessage || `Triggered ${p.text || 'Action'}`)})`;
      return `${pad}<button type="button" onClick={${handler}} className="af-btn${p.buttonVariant === 'outline' ? ' af-btn-outline' : ''}">{${jsxStr(p.text || 'Action')}}</button>`;
    }
    case 'input':
      return `${pad}<label className="af-stack" style={{ gap: '6px' }}>${p.label ? `<span style={{ fontSize: '12px', fontWeight: 600 }}>{${jsxStr(p.label)}}</span>` : ''}<input type="text" placeholder={${jsxStr(p.placeholder || '')}} className="af-input" /></label>`;
    case 'textarea':
      return `${pad}<label className="af-stack" style={{ gap: '6px' }}>${p.label ? `<span style={{ fontSize: '12px', fontWeight: 600 }}>{${jsxStr(p.label)}}</span>` : ''}<textarea rows={3} placeholder={${jsxStr(p.placeholder || '')}} className="af-input" /></label>`;
    case 'select':
      return `${pad}<label className="af-stack" style={{ gap: '6px' }}>${p.label ? `<span style={{ fontSize: '12px', fontWeight: 600 }}>{${jsxStr(p.label)}}</span>` : ''}<select className="af-input">${(p.options || ['Option 1']).map((o) => `<option>{${jsxStr(o)}}</option>`).join('')}</select></label>`;
    case 'toggle':
      return `${pad}<label className="af-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>{${jsxStr(p.label || 'Toggle')}}</span><input type="checkbox" defaultChecked={${Boolean(p.toggleChecked)}} /></label>`;
    case 'metric':
      return `${pad}<div className="af-card"><div style={{ fontSize: '11px', color: 'var(--af-muted)', textTransform: 'uppercase' }}>{${jsxStr(p.metricLabel || 'Metric')}}</div><div style={{ fontSize: '26px', fontWeight: 700 }}>{${jsxStr(p.metricValue || '0')}}</div>${p.metricTrend ? `<div style={{ fontSize: '12px', color: '#34d399' }}>{${jsxStr(p.metricTrend)}}</div>` : ''}</div>`;
    case 'image':
      return `${pad}<img src={${jsxStr(sanitizeUrl(p.imageUrl))}} alt={${jsxStr(p.imageAlt || 'Image')}} style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--af-radius)' }} />`;
    case 'divider':
      return `${pad}<hr style={{ border: 0, borderTop: '1px solid var(--af-border)', width: '100%' }} />`;
    case 'table':
      return `${pad}<div className="af-card" style={{ overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}><thead><tr>${(p.tableHeaders || []).map((h) => `<th style={{ padding: '8px', borderBottom: '1px solid var(--af-border)' }}>{${jsxStr(h)}}</th>`).join('')}</tr></thead><tbody>${(p.tableRows || []).map((r) => `<tr>${r.map((c) => `<td style={{ padding: '8px', borderBottom: '1px solid var(--af-border)' }}>{${jsxStr(c)}}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'widget3d': {
      const cfg = p.widget3d || {
        presetId: 'webgl-orbital-prism',
        presetMode: 'threejs-webgl',
        title: '3D Interactive Element',
        heightPx: 280,
      };
      const srcDoc = buildSandboxed3dSrcDoc(cfg, tokens);
      const h = Math.max(180, Math.min(560, cfg.heightPx || 280));
      return `${pad}<Widget3DFrame title={${jsxStr(cfg.title)}} heightPx={${h}} srcDoc={${JSON.stringify(srcDoc)}} />`;
    }
    default:
      return '';
  }
}

// ------------------------------------------------------------
// 2. React + Vite Compiler
// ------------------------------------------------------------
function compileReactViteBundle(project: Project): CompiledFrameworkBundle {
  const proj = ensureProjectPages(project);
  const tokens = ensureThemeTokens(proj);
  const comp = ensureComplianceConfig(proj);
  const stackBelow = proj.responsiveStackBelowPx ?? 768;
  const slug = projectSlug(proj.name);
  const homePage = proj.pages.find((p) => p.id === proj.homePageId) || proj.pages[0];

  const files: Record<string, string> = {};
  files['package.json'] = JSON.stringify(
    {
      name: slug,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        react: '^19.0.1',
        'react-dom': '^19.0.1',
        three: '^0.187.0',
      },
      devDependencies: {
        '@types/react': '^19.0.1',
        '@types/react-dom': '^19.0.1',
        '@vitejs/plugin-react': '^4.3.4',
        typescript: '^5.7.2',
        vite: '^6.0.0',
      },
    },
    null,
    2
  );

  files['vite.config.ts'] = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;

  files['tsconfig.json'] = JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        skipLibCheck: true,
      },
      include: ['src'],
    },
    null,
    2
  );

  const homeTitle = escapeHtml(homePage?.seo?.title || proj.name);
  const homeDesc = escapeHtml(homePage?.seo?.metaDescription || proj.description || proj.name);
  const homeOgTitle = escapeHtml(homePage?.seo?.ogTitle || homePage?.seo?.title || proj.name);
  const homeOgDesc = escapeHtml(homePage?.seo?.ogDescription || homePage?.seo?.metaDescription || proj.description || proj.name);
  const homeOgType = escapeHtml(homePage?.seo?.ogType || 'website');
  const homeOgImg = homePage?.seo?.ogImage ? `\n  <meta property="og:image" content="${escapeHtml(homePage.seo.ogImage)}" />` : '';
  const homeCanon = homePage?.seo?.canonicalUrl ? `\n  <link rel="canonical" href="${escapeHtml(homePage.seo.canonicalUrl)}" />` : '';

  files['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${homeTitle}</title>
  <meta name="description" content="${homeDesc}" />
  <meta property="og:title" content="${homeOgTitle}" />
  <meta property="og:description" content="${homeOgDesc}" />
  <meta property="og:type" content="${homeOgType}" />${homeOgImg}${homeCanon}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`;

  files['src/index.css'] = sharedCssSheet(tokens, stackBelow);
  files['src/main.tsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  files['src/components/Widget3DFrame.tsx'] = `import React from 'react';

interface Widget3DFrameProps {
  title: string;
  heightPx?: number;
  srcDoc: string;
}

export const Widget3DFrame: React.FC<Widget3DFrameProps> = ({ title, heightPx = 280, srcDoc }) => {
  return (
    <div className="af-3d-frame">
      <iframe
        title={title}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        style={{ width: '100%', height: \`\${heightPx}px\`, border: 0, display: 'block' }}
      />
    </div>
  );
};
`;

  const usedNames = new Set<string>();
  const pageComponents = proj.pages.map((p, idx) => {
    let compName = toPascalIdentifier(p.name, `Screen${idx + 1}`);
    while (usedNames.has(compName)) compName = `${compName}${idx + 2}`;
    usedNames.add(compName);
    return { page: p, componentName: compName };
  });

  for (const { page, componentName } of pageComponents) {
    const jsxBody = page.elements.map((el) => renderReactTreeJsx(el, tokens, 6)).filter(Boolean).join('\n');
    const uses3D = jsxBody.includes('<Widget3DFrame');
    files[`src/pages/${componentName}.tsx`] = `import React from 'react';
${uses3D ? "import { Widget3DFrame } from '../components/Widget3DFrame';\n" : ''}
interface PageProps {
  onNavigate: (pageId: string) => void;
  onNotify: (msg: string) => void;
}

export const ${componentName}: React.FC<PageProps> = ({ onNavigate, onNotify }) => {
  return (
    <div className="af-stack">
${jsxBody || '      <p>Empty page</p>'}
    </div>
  );
};
`;
  }

  const imports = pageComponents.map((c) => `import { ${c.componentName} } from './pages/${c.componentName}';`).join('\n');
  const navBtns = pageComponents
    .map(
      ({ page }) =>
        `          <button key={${jsxStr(page.id)}} type="button" onClick={() => setActivePageId(${jsxStr(page.id)})} className={\`af-nav-link \${activePageId === ${jsxStr(page.id)} ? 'active' : ''}\`}>{${jsxStr(page.name)}}</button>`
    )
    .join('\n');
  const pageSwitches = pageComponents
    .map(
      ({ page, componentName }) =>
        `        {activePageId === ${jsxStr(page.id)} && <div key={${jsxStr(page.id)}} className={${jsxStr(`af-page-transition-${page.transition || 'fade'}`)}}><${componentName} onNavigate={setActivePageId} onNotify={showNotice} /></div>}`
    )
    .join('\n');

  const licensesText = FONT_AND_MEDIA_LICENSES.map((l) => `${l.name} (${l.license})`).join(' · ');
  const sdkText = THIRD_PARTY_SDK_AUDIT.map((s) => `${s.packageName}: ${s.status}`).join(' · ');

  files['src/App.tsx'] = `import React, { useState } from 'react';
${imports}

export default function App() {
  const [activePageId, setActivePageId] = useState(${jsxStr(proj.homePageId || proj.pages[0]?.id || 'page_home')});
  const [notice, setNotice] = useState<string | null>(null);
  const [legalOpen, setLegalOpen] = useState(false);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2600);
  };

  return (
    <div className="af-shell">
      <a href="#main-content" className="sr-skip">Skip to main content</a>
      <header className="af-header">
        <span className="af-brand">{${jsxStr(proj.name)}}</span>
        <nav aria-label="Primary pages" className="af-nav">
${navBtns}
        </nav>
      </header>
      <main id="main-content">
${pageSwitches}
      </main>
      <footer className="af-footer">
        <span>{${jsxStr(`${comp.businessName} · ${comp.supportEmail}`)}}</span>
        <button type="button" onClick={() => setLegalOpen(true)} className="af-nav-link">
          Privacy, Terms &amp; Refunds ({${comp.refundWindowDays}}d)
        </button>
      </footer>
      {legalOpen && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div className="af-card" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong>Legal &amp; Compliance</strong>
              <button type="button" onClick={() => setLegalOpen(false)} className="af-nav-link">Close</button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--af-muted)' }}>Privacy: {${jsxStr(comp.privacyEmail)}} · Unsubscribe: {${jsxStr(comp.unsubscribeEmail)}}</p>
            <p style={{ fontSize: '12px', color: 'var(--af-muted)' }}>Licenses: {${jsxStr(licensesText)}}</p>
            <p style={{ fontSize: '12px', color: 'var(--af-muted)' }}>SDKs: {${jsxStr(sdkText)}}</p>
          </div>
        </div>
      )}
      {notice && (
        <div role="status" style={{ position: 'fixed', right: '20px', bottom: '20px', padding: '10px 16px', borderRadius: '10px', background: 'var(--af-surface)', border: '1px solid var(--af-border)' }}>
          {notice}
        </div>
      )}
    </div>
  );
}
`;

  files['README.md'] = `# ${proj.name}\n\nGenerated by AppForge Studio (React + Vite target).\n\n\`\`\`bash\nnpm install\nnpm run dev\nnpm run build\n\`\`\`\n`;

  return {
    framework: 'react-vite',
    vercelPreset: 'vite',
    entryFile: 'src/App.tsx',
    files,
  };
}

// ------------------------------------------------------------
// 3. Next.js App Router Compiler
// ------------------------------------------------------------
function compileNextJsBundle(project: Project): CompiledFrameworkBundle {
  const proj = ensureProjectPages(project);
  const tokens = ensureThemeTokens(proj);
  const comp = ensureComplianceConfig(proj);
  const stackBelow = proj.responsiveStackBelowPx ?? 768;
  const slug = projectSlug(proj.name);
  const homePage = proj.pages.find((p) => p.id === proj.homePageId) || proj.pages[0];

  const files: Record<string, string> = {};
  files['package.json'] = JSON.stringify(
    {
      name: slug,
      private: true,
      version: '1.0.0',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
      dependencies: {
        next: '^15.1.0',
        react: '^19.0.1',
        'react-dom': '^19.0.1',
        three: '^0.187.0',
      },
      devDependencies: {
        '@types/node': '^22.10.0',
        '@types/react': '^19.0.1',
        '@types/react-dom': '^19.0.1',
        typescript: '^5.7.2',
      },
    },
    null,
    2
  );

  files['next.config.mjs'] = `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
`;

  files['app/globals.css'] = sharedCssSheet(tokens, stackBelow);

  files['components/Widget3DFrame.tsx'] = `'use client';

import React, { useEffect, useState } from 'react';

interface Widget3DFrameProps {
  title: string;
  heightPx?: number;
  srcDoc: string;
}

export const Widget3DFrame: React.FC<Widget3DFrameProps> = ({ title, heightPx = 280, srcDoc }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="af-3d-frame"
        style={{ height: \`\${heightPx}px\`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--af-muted)' }}
      >
        Initializing 3D Viewport...
      </div>
    );
  }

  return (
    <div className="af-3d-frame">
      <iframe
        title={title}
        sandbox="allow-scripts"
        srcDoc={srcDoc}
        style={{ width: '100%', height: \`\${heightPx}px\`, border: 0, display: 'block' }}
      />
    </div>
  );
};
`;

  const routeLinks = proj.pages.map((p) => ({
    id: p.id,
    name: p.name,
    href: p.id === homePage?.id || p.path === '/' ? '/' : `/${routeToNextSlug(p.path) || p.id}`,
  }));

  files['components/AppShellClient.tsx'] = `'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const ROUTES = ${JSON.stringify(routeLinks)};

export const AppShellClient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="af-shell">
      <a href="#main-content" className="sr-skip">Skip to main content</a>
      <header className="af-header">
        <Link href="/" className="af-brand">{${jsxStr(proj.name)}}</Link>
        <nav aria-label="Primary Navigation" className="af-nav">
          {ROUTES.map((r) => (
            <Link key={r.id} href={r.href} className="af-nav-link">{r.name}</Link>
          ))}
        </nav>
      </header>
      <main id="main-content">{children}</main>
      <footer className="af-footer">
        <span>{${jsxStr(`${comp.businessName} · ${comp.supportEmail}`)}}</span>
        <span>Refund Policy: {${comp.refundWindowDays}} days · Privacy: {${jsxStr(comp.privacyEmail)}}</span>
      </footer>
      {notice && (
        <div role="status" onClick={() => setNotice(null)} style={{ position: 'fixed', right: '20px', bottom: '20px', padding: '10px 16px', borderRadius: '10px', background: 'var(--af-surface)', border: '1px solid var(--af-border)' }}>
          {notice}
        </div>
      )}
    </div>
  );
};
`;

  files['app/layout.tsx'] = `import type { Metadata } from 'next';
import './globals.css';
import { AppShellClient } from '../components/AppShellClient';

export const metadata: Metadata = {
  title: ${jsxStr(homePage?.seo?.title || proj.name)},
  description: ${jsxStr(homePage?.seo?.metaDescription || proj.description || proj.name)},
  openGraph: {
    title: ${jsxStr(homePage?.seo?.ogTitle || homePage?.seo?.title || proj.name)},
    description: ${jsxStr(homePage?.seo?.ogDescription || homePage?.seo?.metaDescription || proj.description || proj.name)},
    type: ${jsxStr(homePage?.seo?.ogType || 'website')},
    ${homePage?.seo?.ogImage ? `images: [${jsxStr(sanitizeUrl(homePage.seo.ogImage))}],` : ''}
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShellClient>{children}</AppShellClient>
      </body>
    </html>
  );
}
`;

  const routeMapJs = Object.fromEntries(routeLinks.map((r) => [r.id, r.href]));

  proj.pages.forEach((page) => {
    const isHome = page.id === homePage?.id || page.path === '/';
    const subSlug = routeToNextSlug(page.path) || page.id;
    const filePath = isHome ? 'app/page.tsx' : `app/${subSlug}/page.tsx`;
    const prefixRel = isHome ? '../' : '../../';
    const jsxBody = page.elements.map((el) => renderReactTreeJsx(el, tokens, 6)).filter(Boolean).join('\n');
    const uses3D = jsxBody.includes('<Widget3DFrame');

    files[filePath] = `'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
${uses3D ? `import { Widget3DFrame } from '${prefixRel}components/Widget3DFrame';\n` : ''}
const PAGE_ROUTES: Record<string, string> = ${JSON.stringify(routeMapJs)};

export default function GeneratedPage() {
  const router = useRouter();
  const onNavigate = (pageId: string) => {
    router.push(PAGE_ROUTES[pageId] || '/');
  };
  const onNotify = (_msg: string) => {};

  return (
    <div className={${jsxStr(`af-stack af-page-transition-${page.transition || 'fade'}`)}}>
${jsxBody || '      <p>Empty page</p>'}
    </div>
  );
}
`;
  });

  files['README.md'] = `# ${proj.name}\n\nGenerated by AppForge Studio (Next.js App Router target).\n\n\`\`\`bash\nnpm install\nnpm run dev\nnpm run build\n\`\`\`\n`;

  return {
    framework: 'nextjs',
    vercelPreset: 'nextjs',
    entryFile: 'app/page.tsx',
    files,
  };
}

// ------------------------------------------------------------
// 4. Vue 3 + Vite Compiler
// ------------------------------------------------------------
function renderVueTemplate(el: CanvasElement, tokens: ThemeTokens, indent = 4): string {
  if (el.hidden) return '';
  const pad = ' '.repeat(indent);
  const p = el.props || {};
  const s = el.styles || {};
  const childrenHtml = (el.children || [])
    .map((c) => renderVueTemplate(c, tokens, indent + 2))
    .filter(Boolean)
    .join('\n');

  switch (el.type) {
    case 'navbar':
      return `${pad}<nav class="af-card af-row" style="justify-content:space-between;align-items:center">
${pad}  <span class="af-brand">${escapeHtml(p.brandName || 'AppForge')}</span>
${pad}  <div class="af-nav">
${(p.navLinks || [])
  .map((l) =>
    l.targetPageId
      ? `${pad}    <button type="button" class="af-nav-link" @click="$emit('navigate', ${jsxStr(l.targetPageId)})">${escapeHtml(l.label)}</button>`
      : `${pad}    <span class="af-nav-link">${escapeHtml(l.label)}</span>`
  )
  .join('\n')}
${p.ctaLabel ? `${pad}    <button type="button" class="af-btn" @click="${p.ctaTargetPageId ? `$emit('navigate', ${jsxStr(p.ctaTargetPageId)})` : `$emit('notify', ${jsxStr(p.ctaLabel)})`}">${escapeHtml(p.ctaLabel)}</button>` : ''}
${pad}  </div>
${pad}</nav>`;
    case 'container':
      return `${pad}<div class="${p.direction === 'row' ? 'af-row' : 'af-stack'}${s.width === 'third' ? ' af-col-third' : s.width === 'half' ? ' af-col-half' : ''}">
${childrenHtml}
${pad}</div>`;
    case 'card':
      return `${pad}<section class="af-card af-stack">
${p.text ? `${pad}  <h3>${escapeHtml(p.text)}</h3>` : ''}
${p.subtext ? `${pad}  <p style="color:var(--af-muted);font-size:13px">${escapeHtml(p.subtext)}</p>` : ''}
${childrenHtml}
${pad}</section>`;
    case 'heading': {
      const tag = p.headingLevel === 'h2' ? 'h2' : p.headingLevel === 'h3' ? 'h3' : 'h1';
      return `${pad}<div style="text-align:${escapeHtml(s.textAlign || 'left')}">
${pad}  <${tag}>${escapeHtml(p.text || 'Heading')}</${tag}>
${p.subtext ? `${pad}  <p style="color:var(--af-muted)">${escapeHtml(p.subtext)}</p>` : ''}
${pad}</div>`;
    }
    case 'text':
      return `${pad}<p>${escapeHtml(p.text || '')}</p>`;
    case 'badge':
      return `${pad}<span class="af-badge">${escapeHtml(p.text || 'Badge')}</span>`;
    case 'button': {
      const handler =
        p.whenClicked === 'openPage' && p.targetPageId
          ? `$emit('navigate', ${jsxStr(p.targetPageId)})`
          : `$emit('notify', ${jsxStr(p.toastMessage || `Triggered ${p.text || 'Action'}`)})`;
      return `${pad}<button type="button" class="af-btn${p.buttonVariant === 'outline' ? ' af-btn-outline' : ''}" @click="${escapeHtml(handler)}">${escapeHtml(p.text || 'Action')}</button>`;
    }
    case 'input':
      return `${pad}<label class="af-stack" style="gap:6px">${p.label ? `<span style="font-size:12px;font-weight:600">${escapeHtml(p.label)}</span>` : ''}<input type="text" placeholder="${escapeHtml(p.placeholder || '')}" class="af-input" /></label>`;
    case 'textarea':
      return `${pad}<label class="af-stack" style="gap:6px">${p.label ? `<span style="font-size:12px;font-weight:600">${escapeHtml(p.label)}</span>` : ''}<textarea rows="3" placeholder="${escapeHtml(p.placeholder || '')}" class="af-input"></textarea></label>`;
    case 'select':
      return `${pad}<label class="af-stack" style="gap:6px">${p.label ? `<span style="font-size:12px;font-weight:600">${escapeHtml(p.label)}</span>` : ''}<select class="af-input">${(p.options || ['Option 1']).map((o) => `<option>${escapeHtml(o)}</option>`).join('')}</select></label>`;
    case 'toggle':
      return `${pad}<label class="af-card" style="display:flex;justify-content:space-between;align-items:center"><span>${escapeHtml(p.label || 'Toggle')}</span><input type="checkbox" ${p.toggleChecked ? 'checked' : ''} /></label>`;
    case 'metric':
      return `${pad}<div class="af-card"><div style="font-size:11px;color:var(--af-muted);text-transform:uppercase">${escapeHtml(p.metricLabel || 'Metric')}</div><div style="font-size:26px;font-weight:700">${escapeHtml(p.metricValue || '0')}</div></div>`;
    case 'image':
      return `${pad}<img src="${escapeHtml(sanitizeUrl(p.imageUrl))}" alt="${escapeHtml(p.imageAlt || 'Image')}" style="width:100%;height:240px;object-fit:cover;border-radius:var(--af-radius)" />`;
    case 'divider':
      return `${pad}<hr style="border:0;border-top:1px solid var(--af-border);width:100%" />`;
    case 'table':
      return `${pad}<div class="af-card" style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left"><thead><tr>${(p.tableHeaders || []).map((h) => `<th style="padding:8px;border-bottom:1px solid var(--af-border)">${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${(p.tableRows || []).map((r) => `<tr>${r.map((c) => `<td style="padding:8px;border-bottom:1px solid var(--af-border)">${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    case 'widget3d': {
      const cfg = p.widget3d || {
        presetId: 'webgl-orbital-prism',
        presetMode: 'threejs-webgl',
        title: '3D Interactive Element',
        heightPx: 280,
      };
      const srcDoc = buildSandboxed3dSrcDoc(cfg, tokens);
      const h = Math.max(180, Math.min(560, cfg.heightPx || 280));
      return `${pad}<Widget3DFrame title="${escapeHtml(cfg.title)}" :height-px="${h}" :src-doc="${escapeHtml(JSON.stringify(srcDoc))}" />`;
    }
    default:
      return '';
  }
}

function compileVueBundle(project: Project): CompiledFrameworkBundle {
  const proj = ensureProjectPages(project);
  const tokens = ensureThemeTokens(proj);
  const comp = ensureComplianceConfig(proj);
  const stackBelow = proj.responsiveStackBelowPx ?? 768;
  const slug = projectSlug(proj.name);
  const homePage = proj.pages.find((p) => p.id === proj.homePageId) || proj.pages[0];

  const files: Record<string, string> = {};
  files['package.json'] = JSON.stringify(
    {
      name: slug,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        three: '^0.187.0',
        vue: '^3.5.13',
      },
      devDependencies: {
        '@vitejs/plugin-vue': '^5.2.1',
        typescript: '^5.7.2',
        vite: '^6.0.0',
      },
    },
    null,
    2
  );

  files['vite.config.ts'] = `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
`;

  const vueTitle = escapeHtml(homePage?.seo?.title || proj.name);
  const vueDesc = escapeHtml(homePage?.seo?.metaDescription || proj.description || proj.name);
  const vueOgTitle = escapeHtml(homePage?.seo?.ogTitle || homePage?.seo?.title || proj.name);
  const vueOgDesc = escapeHtml(homePage?.seo?.ogDescription || homePage?.seo?.metaDescription || proj.description || proj.name);
  const vueOgType = escapeHtml(homePage?.seo?.ogType || 'website');
  const vueOgImg = homePage?.seo?.ogImage ? `\n  <meta property="og:image" content="${escapeHtml(homePage.seo.ogImage)}" />` : '';
  const vueCanon = homePage?.seo?.canonicalUrl ? `\n  <link rel="canonical" href="${escapeHtml(homePage.seo.canonicalUrl)}" />` : '';

  files['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${vueTitle}</title>
  <meta name="description" content="${vueDesc}" />
  <meta property="og:title" content="${vueOgTitle}" />
  <meta property="og:description" content="${vueOgDesc}" />
  <meta property="og:type" content="${vueOgType}" />${vueOgImg}${vueCanon}
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
`;

  files['src/style.css'] = sharedCssSheet(tokens, stackBelow);
  files['src/main.ts'] = `import { createApp } from 'vue';
import './style.css';
import App from './App.vue';

createApp(App).mount('#app');
`;

  files['src/components/Widget3DFrame.vue'] = `<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineProps<{
  title: string;
  heightPx?: number;
  srcDoc: string;
}>();

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});
</script>

<template>
  <div class="af-3d-frame">
    <iframe
      v-if="mounted"
      :title="title"
      sandbox="allow-scripts"
      :srcdoc="srcDoc"
      :style="{ width: '100%', height: (heightPx || 280) + 'px', border: 0, display: 'block' }"
    />
  </div>
</template>
`;

  const usedNames = new Set<string>();
  const pageViews = proj.pages.map((p, idx) => {
    let viewName = toPascalIdentifier(p.name, `View${idx + 1}`);
    while (usedNames.has(viewName)) viewName = `${viewName}${idx + 2}`;
    usedNames.add(viewName);
    return { page: p, viewName };
  });

  for (const { page, viewName } of pageViews) {
    const templateBody = page.elements.map((el) => renderVueTemplate(el, tokens, 4)).filter(Boolean).join('\n');
    const uses3D = templateBody.includes('<Widget3DFrame');
    files[`src/views/${viewName}.vue`] = `<script setup lang="ts">
${uses3D ? "import Widget3DFrame from '../components/Widget3DFrame.vue';\n" : ''}defineEmits<{
  (e: 'navigate', pageId: string): void;
  (e: 'notify', message: string): void;
}>();
</script>

<template>
  <div class="af-stack">
${templateBody || '    <p>Empty page</p>'}
  </div>
</template>
`;
  }

  const viewImports = pageViews.map((v) => `import ${v.viewName} from './views/${v.viewName}.vue';`).join('\n');
  const navButtons = pageViews
    .map(
      ({ page }) =>
        `        <button type="button" :class="['af-nav-link', { active: activePageId === ${jsxStr(page.id)} }]" @click="activePageId = ${jsxStr(page.id)}">${escapeHtml(page.name)}</button>`
    )
    .join('\n');
  const viewSwitchers = pageViews
    .map(
      ({ page, viewName }) =>
        `      <div v-if="activePageId === ${jsxStr(page.id)}" class="${`af-page-transition-${page.transition || 'fade'}`}">
        <${viewName} @navigate="activePageId = $event" @notify="showNotice($event)" />
      </div>`
    )
    .join('\n');

  files['src/App.vue'] = `<script setup lang="ts">
import { ref } from 'vue';
${viewImports}

const activePageId = ref(${jsxStr(proj.homePageId || proj.pages[0]?.id || 'page_home')});
const notice = ref<string | null>(null);

function showNotice(msg: string) {
  notice.value = msg;
  setTimeout(() => {
    notice.value = null;
  }, 2600);
}
</script>

<template>
  <div class="af-shell">
    <a href="#main-content" class="sr-skip">Skip to main content</a>
    <header class="af-header">
      <span class="af-brand">${escapeHtml(proj.name)}</span>
      <nav aria-label="Primary pages" class="af-nav">
${navButtons}
      </nav>
    </header>
    <main id="main-content">
${viewSwitchers}
    </main>
    <footer class="af-footer">
      <span>${escapeHtml(comp.businessName)} · ${escapeHtml(comp.supportEmail)}</span>
      <span>Refund Policy: ${comp.refundWindowDays} days · Privacy: ${escapeHtml(comp.privacyEmail)}</span>
    </footer>
    <div v-if="notice" role="status" style="position:fixed;right:20px;bottom:20px;padding:10px 16px;border-radius:10px;background:var(--af-surface);border:1px solid var(--af-border)">
      {{ notice }}
    </div>
  </div>
</template>
`;

  files['README.md'] = `# ${proj.name}\n\nGenerated by AppForge Studio (Vue 3 + Vite target).\n\n\`\`\`bash\nnpm install\nnpm run dev\nnpm run build\n\`\`\`\n`;

  return {
    framework: 'vue',
    vercelPreset: 'vue',
    entryFile: 'src/App.vue',
    files,
  };
}

export function compileProjectForFramework(
  project: Project,
  framework: ExportFramework
): CompiledFrameworkBundle {
  switch (framework) {
    case 'react-vite':
      return compileReactViteBundle(project);
    case 'nextjs':
      return compileNextJsBundle(project);
    case 'vue':
      return compileVueBundle(project);
    case 'html':
    default:
      return compileHtmlBundle(project);
  }
}
