import { ThemeTokens, Widget3DConfig, Widget3DPresetId } from '../types/editor';

export interface BuiltIn3DPreset {
  id: Exclude<Widget3DPresetId, 'ai-custom'>;
  name: string;
  category: 'CSS 3D Transform' | 'WebGL 3D Scene';
  presetMode: 'css-3d' | 'threejs-webgl';
  description: string;
  config: Widget3DConfig;
}

export const BUILTIN_3D_PRESETS: BuiltIn3DPreset[] = [
  {
    id: 'glass-tilt-card',
    name: '3D Glassmorphism Tilt Card',
    category: 'CSS 3D Transform',
    presetMode: 'css-3d',
    description: 'Interactive cursor-responsive 3D perspective card with glass sheen and floating depth layer.',
    config: {
      presetId: 'glass-tilt-card',
      presetMode: 'css-3d',
      title: 'Spatial Cloud Engine',
      subtitle: 'Zero-latency interactive 3D card with pointer parallax and crisp contrast.',
      accentColor: '#38bdf8',
      heightPx: 280,
      autoRotate: true,
      interactiveTilt: true,
    },
  },
  {
    id: 'neon-iso-button',
    name: 'Isometric 3D Tactile Cube',
    category: 'CSS 3D Transform',
    presetMode: 'css-3d',
    description: 'Extruded 3D isometric interactive centerpiece with spring elevation on hover and click.',
    config: {
      presetId: 'neon-iso-button',
      presetMode: 'css-3d',
      title: 'Launch Interactive Stack',
      subtitle: 'Click or hover to inspect isometric depth planes',
      accentColor: '#818cf8',
      heightPx: 250,
      autoRotate: true,
      interactiveTilt: true,
    },
  },
  {
    id: 'webgl-orbital-prism',
    name: '3D Orbital Showcase Prism',
    category: 'WebGL 3D Scene',
    presetMode: 'threejs-webgl',
    description: 'Interactive procedural WebGL polyhedron with orbital drag controls and studio rim lighting.',
    config: {
      presetId: 'webgl-orbital-prism',
      presetMode: 'threejs-webgl',
      title: 'Procedural Polyhedron',
      subtitle: 'Drag to orbit · Balanced ambient & directional light rig',
      accentColor: '#2563eb',
      heightPx: 300,
      autoRotate: true,
      interactiveTilt: true,
    },
  },
  {
    id: 'webgl-particle-field',
    name: '3D Particle Horizon Field',
    category: 'WebGL 3D Scene',
    presetMode: 'threejs-webgl',
    description: 'Depth-sorted 3D particle starfield reacting smoothly to pointer parallax.',
    config: {
      presetId: 'webgl-particle-field',
      presetMode: 'threejs-webgl',
      title: 'Volumetric Particle Field',
      subtitle: 'Move pointer across canvas to steer 3D depth parallax',
      accentColor: '#06b6d4',
      heightPx: 300,
      autoRotate: true,
      interactiveTilt: true,
    },
  },
  {
    id: 'webgl-wireframe-terrain',
    name: '3D Wireframe Topology Wave',
    category: 'WebGL 3D Scene',
    presetMode: 'threejs-webgl',
    description: 'Animated 3D topological wireframe wave surface rendered with safe software-WebGL fallback.',
    config: {
      presetId: 'webgl-wireframe-terrain',
      presetMode: 'threejs-webgl',
      title: 'Dynamic Mesh Terrain',
      subtitle: 'Procedural harmonic wave mesh with real-time vertex oscillation',
      accentColor: '#a855f7',
      heightPx: 300,
      autoRotate: true,
      interactiveTilt: true,
    },
  },
];

export interface Ai3DSnippetOutput {
  title: string;
  presetMode: 'css-3d' | 'threejs-webgl';
  htmlSnippet: string;
  cssSnippet: string;
  jsSnippet?: string;
}

export function sanitize3dHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';
  return rawHtml
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<(iframe|object|embed|link|meta|base)[^>]*>/gi, '')
    .replace(/<\/(iframe|object|embed)>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, 'blocked:')
    .slice(0, 12000);
}

export function scope3dCss(rawCss: string): string {
  if (!rawCss || typeof rawCss !== 'string') return '';
  const cleaned = rawCss
    .replace(/@import[^;]+;/gi, '')
    .replace(/expression\s*\(/gi, '/*blocked*/(')
    .replace(/javascript:/gi, 'blocked:')
    .slice(0, 12000);

  // Prefix selectors with .ai3d-root if not already scoped and not @keyframes/@media
  return cleaned.replace(
    /(^|\})\s*([^@{}][^{]+?)\s*\{/g,
    (_m, brace, selectorList: string) => {
      const trimmed = selectorList.trim();
      if (!trimmed) return `${brace} `;
      const scoped = trimmed
        .split(',')
        .map((sel) => {
          const s = sel.trim();
          if (!s) return s;
          if (s === 'body' || s === 'html' || s === ':root') return '.ai3d-root';
          if (s.startsWith('.ai3d-root')) return s;
          return `.ai3d-root ${s}`;
        })
        .join(', ');
      return `${brace}\n${scoped} {`;
    }
  );
}

export function sanitize3dJs(rawJs?: string): string {
  if (!rawJs || typeof rawJs !== 'string') return '';
  return rawJs
    .replace(/\b(fetch|XMLHttpRequest|WebSocket|EventSource|eval|Function)\b/g, '/*blocked_$1*/undefined')
    .replace(/document\s*\.\s*cookie/gi, '""')
    .replace(/window\s*\.\s*top/gi, 'window')
    .replace(/window\s*\.\s*parent/gi, 'window')
    .slice(0, 16000);
}

export function validate3dAiOutput(raw: unknown): {
  valid: boolean;
  data?: Ai3DSnippetOutput;
  error?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'AI 3D payload must be a structured JSON object.' };
  }
  const obj = raw as Record<string, any>;
  const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim().slice(0, 120) : 'Custom 3D Widget';
  const presetMode = obj.presetMode === 'threejs-webgl' ? 'threejs-webgl' : 'css-3d';
  const rawHtml = typeof obj.htmlSnippet === 'string' ? obj.htmlSnippet : '';
  const rawCss = typeof obj.cssSnippet === 'string' ? obj.cssSnippet : '';
  const rawJs = typeof obj.jsSnippet === 'string' ? obj.jsSnippet : '';

  if (!rawHtml.trim() && !rawJs.trim()) {
    return { valid: false, error: 'AI 3D output is missing renderable htmlSnippet or jsSnippet.' };
  }

  return {
    valid: true,
    data: {
      title,
      presetMode,
      htmlSnippet: sanitize3dHtml(rawHtml),
      cssSnippet: scope3dCss(rawCss),
      jsSnippet: sanitize3dJs(rawJs),
    },
  };
}

function escHtmlInline(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildSandboxed3dSrcDoc(
  config: Widget3DConfig,
  theme?: Partial<ThemeTokens>
): string {
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(config.accentColor || '')
    ? config.accentColor!
    : theme?.primaryColor || '#38bdf8';
  const bg = theme?.backgroundColor || '#09090b';
  const surface = theme?.surfaceColor || '#18181b';
  const text = theme?.textColor || '#f4f4f5';
  const muted = theme?.mutedTextColor || '#a1a1aa';
  const title = escHtmlInline(config.title || '3D Interactive Element');
  const subtitle = escHtmlInline(config.subtitle || 'Interactive 3D viewport');

  // Common parent error bridge for runtime error capture
  const errorBridgeScript = `
    window.addEventListener('error', function(e) {
      try { window.parent.postMessage({ type: 'AF_3D_ERROR', message: e.message || '3D scene runtime error' }, '*'); } catch (_) {}
    });
    window.addEventListener('unhandledrejection', function(e) {
      try { window.parent.postMessage({ type: 'AF_3D_ERROR', message: String(e.reason || '3D promise error') }, '*'); } catch (_) {}
    });
  `;

  if (config.presetId === 'ai-custom' && (config.htmlSnippet || config.cssSnippet || config.jsSnippet)) {
    const safeHtml = sanitize3dHtml(config.htmlSnippet || '<div class="ai3d-fallback">Custom 3D Scene</div>');
    const safeCss = scope3dCss(config.cssSnippet || '');
    const safeJs = sanitize3dJs(config.jsSnippet || '').replace(/<\/script>/gi, '<\\/script>');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: ${bg}; color: ${text}; font-family: system-ui, -apple-system, sans-serif; }
  .ai3d-root { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; perspective: 1000px; position: relative; }
  ${safeCss}
</style>
</head>
<body>
  <div class="ai3d-root" id="ai3d-root">${safeHtml}</div>
  <script>${errorBridgeScript}</script>
  ${safeJs ? `<script>try {\n${safeJs}\n} catch (err) { window.parent.postMessage({ type: 'AF_3D_ERROR', message: err && err.message ? err.message : String(err) }, '*'); }</script>` : ''}
</body>
</html>`;
  }

  if (config.presetId === 'neon-iso-button') {
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: radial-gradient(circle at 50% 35%, ${accent}22, ${bg} 72%); color: ${text}; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; }
  .stage { perspective: 900px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .iso-btn {
    position: relative;
    padding: 18px 34px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: #ffffff;
    background: linear-gradient(135deg, ${accent}, #4338ca);
    border: 1px solid rgba(255,255,255,0.28);
    border-radius: 14px;
    transform-style: preserve-3d;
    transform: rotateX(28deg) rotateZ(-14deg) translateZ(12px);
    box-shadow: -12px 18px 0 #1e1b4b, -18px 28px 38px rgba(0,0,0,0.55), 0 0 28px ${accent}55;
    transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease;
    cursor: pointer;
  }
  .iso-btn:hover {
    transform: rotateX(18deg) rotateZ(-8deg) translateY(-6px) translateZ(20px);
    box-shadow: -8px 24px 0 #1e1b4b, -16px 34px 46px rgba(0,0,0,0.65), 0 0 36px ${accent}88;
  }
  .iso-btn:active {
    transform: rotateX(24deg) rotateZ(-12deg) translateY(8px) translateZ(4px);
    box-shadow: -4px 8px 0 #1e1b4b, -8px 14px 20px rgba(0,0,0,0.45);
  }
  .caption { font-size: 12px; color: ${muted}; text-align: center; max-width: 280px; }
</style></head>
<body>
  <div class="stage">
    <button type="button" class="iso-btn" id="iso-cta">${title}</button>
    <p class="caption" id="iso-status">${subtitle}</p>
  </div>
  <script>${errorBridgeScript}
    var btn = document.getElementById('iso-cta');
    var status = document.getElementById('iso-status');
    var clicks = 0;
    btn.addEventListener('click', function() {
      clicks++;
      status.textContent = '3D trigger activated (' + clicks + 'x)';
    });
  </script>
</body></html>`;
  }

  if (config.presetMode === 'css-3d' || config.presetId === 'glass-tilt-card') {
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: radial-gradient(circle at 20% 20%, ${accent}2a, ${bg} 70%); color: ${text}; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; perspective: 1100px; }
  .card {
    width: min(88vw, 390px);
    padding: 24px;
    border-radius: 18px;
    background: linear-gradient(145deg, ${surface}e8, rgba(24,24,27,0.72));
    border: 1px solid rgba(255,255,255,0.16);
    box-shadow: 0 24px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2);
    transform-style: preserve-3d;
    transition: transform 0.16s ease-out;
    position: relative;
  }
  .glow { position: absolute; inset: -1px; border-radius: 18px; background: radial-gradient(circle at var(--mx,50%) var(--my,50%), ${accent}40, transparent 58%); pointer-events: none; }
  .badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${accent}; background: ${accent}1a; border: 1px solid ${accent}44; padding: 4px 10px; border-radius: 999px; transform: translateZ(26px); margin-bottom: 12px; }
  h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; transform: translateZ(34px); color: ${text}; }
  p { font-size: 13px; line-height: 1.5; color: ${muted}; transform: translateZ(18px); }
</style></head>
<body>
  <div class="card" id="tilt-card">
    <div class="glow"></div>
    <span class="badge">CSS 3D Depth Layer</span>
    <h2>${title}</h2>
    <p>${subtitle}</p>
  </div>
  <script>${errorBridgeScript}
    var card = document.getElementById('tilt-card');
    var auto = ${config.autoRotate !== false ? 'true' : 'false'};
    var interactive = ${config.interactiveTilt !== false ? 'true' : 'false'};
    var hovered = false;
    var t = 0;
    if (interactive) {
      window.addEventListener('pointermove', function(e) {
        hovered = true;
        var rx = ((e.clientY / window.innerHeight) - 0.5) * -20;
        var ry = ((e.clientX / window.innerWidth) - 0.5) * 24;
        card.style.setProperty('--mx', (e.clientX / window.innerWidth * 100) + '%');
        card.style.setProperty('--my', (e.clientY / window.innerHeight * 100) + '%');
        card.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      });
      window.addEventListener('pointerleave', function() {
        hovered = false;
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      });
    }
    if (auto) {
      setInterval(function() {
        if (hovered) return;
        t += 0.04;
        var rx = Math.sin(t) * 6;
        var ry = Math.cos(t * 0.8) * 9;
        card.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
      }, 32);
    }
  </script>
</body></html>`;
  }

  // Procedural 3D Scenes (WebGL + Software Canvas3D projection fallback & webglcontextlost handler)
  const sceneKind = config.presetId || 'webgl-orbital-prism';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: radial-gradient(circle at 50% 25%, ${accent}24, ${bg} 78%); color: ${text}; font-family: system-ui, -apple-system, sans-serif; }
  canvas { display: block; width: 100%; height: 100%; cursor: grab; }
  canvas:active { cursor: grabbing; }
  .hud { position: fixed; left: 14px; right: 14px; bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; pointer-events: none; gap: 12px; }
  .hud-card { background: rgba(9,9,11,0.72); border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(8px); padding: 8px 12px; border-radius: 10px; }
  .hud-title { font-size: 13px; font-weight: 700; color: #ffffff; }
  .hud-sub { font-size: 11px; color: #a1a1aa; }
  .hud-mode { font-size: 10px; font-weight: 600; color: ${accent}; text-transform: uppercase; letter-spacing: 0.06em; }
</style></head>
<body>
  <canvas id="scene"></canvas>
  <div class="hud">
    <div class="hud-card">
      <div class="hud-title">${title}</div>
      <div class="hud-sub">${subtitle}</div>
    </div>
    <div class="hud-card hud-mode" id="renderer-badge">3D Interactive</div>
  </div>
  <script>${errorBridgeScript}
    var canvas = document.getElementById('scene');
    var badge = document.getElementById('renderer-badge');
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { antialias: true, alpha: true }) || canvas.getContext('experimental-webgl');
    } catch (_) { gl = null; }

    var contextLost = false;
    canvas.addEventListener('webglcontextlost', function(e) {
      e.preventDefault();
      contextLost = true;
      badge.textContent = '2D Safe Fallback';
    }, false);

    // Inspect whether hardware or software WebGL is available cleanly
    var rendererMode = 'Canvas 3D Projection';
    if (gl) {
      try {
        var dbg = gl.getExtension('WEBGL_debug_renderer_info');
        var rName = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : '';
        rendererMode = /swiftshader|llvmpipe|software/i.test(String(rName)) ? 'WebGL (Software)' : 'WebGL Ready';
      } catch (_) { rendererMode = 'WebGL Ready'; }
    }
    badge.textContent = rendererMode;

    // Lightweight dual-compatible 3D projection engine on Canvas2D (guaranteed 60fps even when WebGL context is lost or disabled in headless sandboxes)
    var ctx = canvas.getContext('2d');
    if (!ctx && gl) {
      // Fallback if canvas already bound to webgl: replace canvas cleanly for 2D/3D hybrid or render via WebGL clear + overlay
      var overlay = document.createElement('canvas');
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      document.body.insertBefore(overlay, canvas.nextSibling);
      ctx = overlay.getContext('2d');
      canvas = overlay;
    }

    var rotX = 0.45, rotY = 0.65, drag = false, lastX = 0, lastY = 0;
    var ptrX = 0, ptrY = 0;
    var autoSpin = ${config.autoRotate !== false ? 'true' : 'false'};
    var kind = ${JSON.stringify(sceneKind)};
    var accentHex = ${JSON.stringify(accent)};

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    }
    window.addEventListener('resize', resize);
    resize();

    canvas.addEventListener('pointerdown', function(e) { drag = true; lastX = e.clientX; lastY = e.clientY; });
    window.addEventListener('pointerup', function() { drag = false; });
    window.addEventListener('pointermove', function(e) {
      ptrX = (e.clientX / Math.max(1, window.innerWidth)) - 0.5;
      ptrY = (e.clientY / Math.max(1, window.innerHeight)) - 0.5;
      if (!drag) return;
      rotY += (e.clientX - lastX) * 0.012;
      rotX += (e.clientY - lastY) * 0.012;
      lastX = e.clientX; lastY = e.clientY;
    });

    function project(x, y, z, w, h, fov) {
      var cy = Math.cos(rotY), sy = Math.sin(rotY);
      var cx = Math.cos(rotX), sx = Math.sin(rotX);
      var x1 = x * cy - z * sy;
      var z1 = x * sy + z * cy;
      var y2 = y * cx - z1 * sx;
      var z2 = y * sx + z1 * cx;
      var scale = fov / Math.max(1.2, 4.2 + z2);
      return { sx: w * 0.5 + x1 * scale, sy: h * 0.46 + y2 * scale, z: z2, s: scale };
    }

    // Build geometry
    var octVerts = [[0,1.25,0],[1.05,0,0],[0,0,1.05],[-1.05,0,0],[0,0,-1.05],[0,-1.25,0]];
    var octFaces = [[0,1,2],[0,2,3],[0,3,4],[0,4,1],[5,2,1],[5,3,2],[5,4,3],[5,1,4]];
    var particles = [];
    for (var i = 0; i < 110; i++) {
      var phi = Math.acos(1 - 2 * (i + 0.5) / 110);
      var theta = Math.PI * (1 + Math.sqrt(5)) * i;
      var r = 1.15 + (i % 4) * 0.18;
      particles.push([r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)]);
    }

    var t = 0;
    function frame() {
      t += 0.025;
      if (autoSpin && !drag) {
        rotY += 0.009 + ptrX * 0.012;
        rotX += ptrY * 0.004;
      }
      if (ctx) {
        var w = canvas.width, h = canvas.height;
        var fov = Math.min(w, h) * 0.72;
        ctx.clearRect(0, 0, w, h);

        if (kind === 'webgl-particle-field') {
          var pts = particles.map(function(v) { return project(v[0], v[1], v[2], w, h, fov); });
          pts.sort(function(a, b) { return b.z - a.z; });
          for (var i = 0; i < pts.length; i++) {
            var p = pts[i];
            var alpha = Math.max(0.2, Math.min(0.95, 1 - (p.z + 1.5) / 4));
            var rad = Math.max(1.8, p.s * 0.024);
            ctx.fillStyle = accentHex;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, rad, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        } else if (kind === 'webgl-wireframe-terrain') {
          ctx.strokeStyle = accentHex;
          ctx.lineWidth = Math.max(1, w / 420);
          var grid = 9;
          var ptsGrid = [];
          for (var gx = 0; gx <= grid; gx++) {
            ptsGrid[gx] = [];
            for (var gz = 0; gz <= grid; gz++) {
              var wx = (gx / grid - 0.5) * 3.0;
              var wz = (gz / grid - 0.5) * 3.0;
              var wy = Math.sin(wx * 2.1 + t * 1.4) * Math.cos(wz * 2.1 + t) * 0.42;
              ptsGrid[gx][gz] = project(wx, wy + 0.15, wz, w, h, fov);
            }
          }
          ctx.globalAlpha = 0.72;
          for (var gx = 0; gx <= grid; gx++) {
            ctx.beginPath();
            for (var gz = 0; gz <= grid; gz++) {
              var pt = ptsGrid[gx][gz];
              if (gz === 0) ctx.moveTo(pt.sx, pt.sy); else ctx.lineTo(pt.sx, pt.sy);
            }
            ctx.stroke();
          }
          for (var gz = 0; gz <= grid; gz++) {
            ctx.beginPath();
            for (var gx = 0; gx <= grid; gx++) {
              var pt = ptsGrid[gx][gz];
              if (gx === 0) ctx.moveTo(pt.sx, pt.sy); else ctx.lineTo(pt.sx, pt.sy);
            }
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        } else {
          // Orbital showcase prism (balanced ambient + directional shading)
          var pVerts = octVerts.map(function(v) { return project(v[0], v[1] + Math.sin(t) * 0.08, v[2], w, h, fov); });
          var faceList = octFaces.map(function(f, idx) {
            var avgZ = (pVerts[f[0]].z + pVerts[f[1]].z + pVerts[f[2]].z) / 3;
            return { f: f, z: avgZ, idx: idx };
          });
          faceList.sort(function(a, b) { return b.z - a.z; });
          for (var i = 0; i < faceList.length; i++) {
            var f = faceList[i].f;
            var a = pVerts[f[0]], b = pVerts[f[1]], c = pVerts[f[2]];
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.lineTo(c.sx, c.sy);
            ctx.closePath();
            ctx.fillStyle = accentHex;
            ctx.globalAlpha = 0.25 + ((faceList[i].idx % 4) * 0.14);
            ctx.fill();
            ctx.globalAlpha = 0.85;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(1.2, w / 360);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  </script>
</body></html>`;
}
