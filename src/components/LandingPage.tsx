import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ArrowRight, Code2, Box, Rocket, ShieldCheck, Check, LogIn, LogOut } from 'lucide-react';
import { ComplianceTabId } from './ComplianceHubModal';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onOpenStudio: () => void;
  onOpenDashboard: () => void;
  onQuickStart3D: () => void;
  onOpenCompliance: (tab: ComplianceTabId) => void;
  projectCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
  onOpenDashboard,
  onQuickStart3D,
  onOpenCompliance,
  projectCount,
}) => {
  const { user, signingIn, signInWithGoogle, signOut } = useAuth();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFallback, setWebglFallback] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let pmrem: THREE.PMREMGenerator | null = null;
    let envTarget: THREE.WebGLRenderTarget | null = null;
    let rig: THREE.Group | null = null;
    let rafId = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };
    const handleContextRestored = () => {
      setWebglFallback(false);
    };

    try {
      const probe = document.createElement('canvas');
      const glProbe = probe.getContext('webgl2') || probe.getContext('webgl');
      if (!glProbe) {
        setWebglFallback(true);
        return;
      }
      const dbg = glProbe.getExtension('WEBGL_debug_renderer_info');
      const rawRenderer = dbg ? glProbe.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '' : '';
      const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(String(rawRenderer));

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: isSoftwareGl ? 'low-power' : 'high-performance',
      });
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = false;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));

      const w = container.clientWidth || 520;
      const h = container.clientHeight || 400;
      renderer.setSize(w, h);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.set(0, 1.45, 5.95);
      camera.lookAt(0, -0.05, 0);

      pmrem = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envTarget = pmrem.fromScene(roomEnv, 0.04);
      scene.environment = envTarget.texture;
      roomEnv.dispose();

      // Studio lighting rig
      const hemi = new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.85);
      scene.add(hemi);
      const keyLight = new THREE.DirectionalLight(0xfff1e0, 1.85);
      keyLight.position.set(4, 6, 4);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
      rimLight.position.set(-4, 3, -3);
      scene.add(rimLight);

      // Composite multi-part architectural rig (7 components)
      rig = new THREE.Group();

      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        metalness: 0.55,
        roughness: 0.22,
      });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.35,
        roughness: 0.18,
      });
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        metalness: 0.48,
        roughness: 0.58,
      });

      const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.52, 0.18, 40), frameMat);
      basePlinth.position.y = -1.22;
      rig.add(basePlinth);

      const baseRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.42, 0.022, 12, 64),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      baseRim.rotation.x = Math.PI / 2;
      baseRim.position.y = -1.14;
      rig.add(baseRim);

      const coreIco = new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, 1), coreMat);
      coreIco.position.y = 0.28;
      rig.add(coreIco);

      const wireMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, wireframe: true });
      const outerCage = new THREE.Mesh(new THREE.OctahedronGeometry(1.38, 1), wireMat);
      outerCage.position.y = 0.2;
      rig.add(outerCage);

      const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.045, 16, 64), glassMat);
      orbitRing.rotation.x = Math.PI * 0.38;
      orbitRing.position.y = 0.2;
      rig.add(orbitRing);

      const pillarOffsets: [number, number][] = [
        [-1.35, -0.55],
        [1.35, -0.55],
        [0, 1.35],
      ];
      pillarOffsets.forEach(([px, pz]) => {
        const sat = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), glassMat);
        sat.position.set(px, 0.2, pz);
        sat.rotation.set(0.4, 0.6, 0.2);
        rig?.add(sat);
      });

      scene.add(rig);

      let pointerX = 0;
      let pointerY = 0;
      const onPointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      container.addEventListener('pointermove', onPointerMove);

      const resizeObserver = new ResizeObserver(() => {
        if (!container || !renderer || !camera || disposed) return;
        const cw = container.clientWidth || 520;
        const ch = container.clientHeight || 400;
        camera.aspect = cw / ch;
        camera.updateProjectionMatrix();
        renderer.setSize(cw, ch);
      });
      resizeObserver.observe(container);

      let angle = 0;
      const renderFrame = () => {
        if (disposed || !renderer || !scene || !camera || !rig) return;
        angle += isSoftwareGl ? 0.018 : 0.008;
        rig.rotation.y = angle + pointerX * 0.45;
        rig.rotation.x = pointerY * 0.2;
        outerCage.rotation.y = -angle * 0.7;
        orbitRing.rotation.z = angle * 0.5;
        renderer.render(scene, camera);

        if (isSoftwareGl) {
          timerId = setTimeout(() => {
            if (!disposed) rafId = requestAnimationFrame(renderFrame);
          }, 50);
        } else {
          rafId = requestAnimationFrame(renderFrame);
        }
      };

      renderFrame();

      return () => {
        disposed = true;
        cancelAnimationFrame(rafId);
        if (timerId) clearTimeout(timerId);
        resizeObserver.disconnect();
        container.removeEventListener('pointermove', onPointerMove);
        renderer?.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer?.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        envTarget?.dispose();
        pmrem?.dispose();
        scene?.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material?.dispose();
          }
        });
        renderer?.dispose();
      };
    } catch {
      setWebglFallback(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#07080d] text-zinc-100 font-sans flex flex-col">
      <a
        href="#landing-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar (3 Clean Zones) */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#07080d]/95">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand */}
          <button
            type="button"
            onClick={onOpenDashboard}
            className="flex items-center gap-2.5 text-left cursor-pointer shrink-0"
          >
            <span className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs tracking-wider">
              AF
            </span>
            <span className="text-base font-bold tracking-tight text-white">AppForge</span>
          </button>

          {/* Zone 2: Primary Navigation (single-line links) */}
          <nav aria-label="Landing Navigation" className="hidden md:flex items-center gap-7 text-sm text-zinc-300">
            <a href="#capabilities" className="hover:text-white transition whitespace-nowrap">
              Capabilities
            </a>
            <a href="#studio-3d" className="hover:text-white transition whitespace-nowrap">
              3D Studio
            </a>
            <a href="#pricing" className="hover:text-white transition whitespace-nowrap">
              Pricing
            </a>
            <button
              type="button"
              onClick={() => onOpenCompliance('privacy')}
              className="hover:text-white transition whitespace-nowrap cursor-pointer"
            >
              Privacy
            </button>
          </nav>

          {/* Zone 3: Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
                title={`Signed in as ${user.email || 'Creator'}`}
              >
                <span className="truncate max-w-[140px]">{user.displayName || user.email}</span>
                <LogOut size={13} />
              </button>
            ) : (
              <button
                type="button"
                disabled={signingIn}
                onClick={() => void signInWithGoogle()}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white cursor-pointer"
              >
                <LogIn size={13} />
                <span>{signingIn ? 'Signing in...' : 'Sign In'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenStudio}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
              data-testid="landing-open-studio-btn"
            >
              <span>Open Studio</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      <main id="landing-main" tabIndex={-1} className="flex-1">
        {/* Hero Split Section */}
        <section className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-mono tracking-widest uppercase text-cyan-400">
              Visual Canvas · Multi-Framework Export · Vercel Ready
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white text-balance leading-[1.08]">
              Build full-stack web apps and 3D interfaces without lock-in.
            </h1>
            <p className="text-base text-zinc-300 leading-relaxed max-w-xl">
              Design multi-page apps visually, drop interactive WebGL 3D scenes into sandboxed frames, export clean React, Next.js, Vue, or static HTML code, and deploy straight to your own Vercel account.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenStudio}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold inline-flex items-center gap-2 transition cursor-pointer"
                data-testid="hero-launch-studio-btn"
              >
                <span>Open Visual Studio</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={onQuickStart3D}
                className="px-5 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm font-medium inline-flex items-center gap-2 transition cursor-pointer"
                data-testid="hero-3d-template-btn"
              >
                <Box size={16} className="text-cyan-400" />
                <span>Start 3D Link-in-Bio</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span>{projectCount} workspace {projectCount === 1 ? 'project' : 'projects'} ready</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onOpenDashboard}
                className="text-zinc-200 hover:text-white underline cursor-pointer"
              >
                Browse Workspace Dashboard
              </button>
            </div>
          </div>

          {/* Interactive 3D Three.js Stage */}
          <div className="lg:col-span-6">
            <div className="relative h-[380px] sm:h-[420px] rounded-2xl border border-zinc-800 bg-[#0b1120] overflow-hidden">
              {webglFallback ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Box size={40} className="text-cyan-400" />
                  <div className="text-sm font-semibold text-white">AppForge Spatial Core</div>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Hardware acceleration unavailable in this view. Launch the editor to insert CSS 3D &amp; WebGL scenes.
                  </p>
                </div>
              ) : (
                <div ref={mountRef} className="w-full h-full" data-testid="landing-3d-canvas" />
              )}
              <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-200 bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 rounded-lg px-3 py-1.5">
                <span>Interactive Spatial Polyhedron · Move pointer to inspect</span>
                <span className="text-cyan-400 shrink-0">Three.js r187</span>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities Bento */}
        <section id="capabilities" className="border-t border-zinc-800/80 bg-zinc-950/60 py-16">
          <div className="max-w-6xl mx-auto px-6 space-y-8">
            <div className="max-w-xl space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Engineered for real code portability
              </h2>
              <p className="text-sm text-zinc-400">
                Every visual node maps to clean, standards-based HTML, React, Next.js, or Vue source files you own completely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <article className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>01. COMPILERS</span>
                  <Code2 size={16} className="text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">4 Target Frameworks</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inspect the live file tree and download ready-to-run ZIP bundles for Static HTML, React + Vite, Next.js App Router, and Vue 3.
                </p>
              </article>

              <article id="studio-3d" className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>02. 3D WIDGETS</span>
                  <Box size={16} className="text-cyan-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Free &amp; AI 3D Scenes</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Drop 5 free built-in CSS 3D &amp; WebGL presets or synthesize custom scenes safely inside isolated sandbox iframes.
                </p>
              </article>

              <article className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>03. HOSTING</span>
                  <Rocket size={16} className="text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Direct Vercel Deploy</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Connect your own Vercel account via OAuth or encrypted PAT, ship in one click, and attach verified custom domains.
                </p>
              </article>

              <article className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>04. COMPLIANCE</span>
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">20-Point Compliance Audit</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Includes WCAG contrast checks, keyboard navigation, cookie consent banner, license disclosure, and transparent legal exports.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Transparent Pricing */}
        <section id="pricing" className="border-t border-zinc-800/80 py-16">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Transparent pricing with zero hidden fees
              </h2>
              <p className="text-xs text-zinc-400">
                14-day full refund guarantee on paid plans · Cancel anytime with one click · Export your source code freely on all tiers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-zinc-400">Starter</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$0</span>
                    <span className="text-xs text-zinc-400">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Complete visual editor, 5 built-in 3D presets, multi-framework ZIP exports, and direct Vercel deployment using your own account.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300 pt-2">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Unlimited local projects</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> HTML, React, Next.js, Vue ZIP exports</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Bring your own Vercel &amp; Gemini API keys</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white cursor-pointer transition"
                >
                  Start Building Free
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-blue-500/40 bg-blue-950/20 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-blue-300">Studio Pro</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$29</span>
                    <span className="text-xs text-zinc-400">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    For teams syncing multi-page libraries across Firestore cloud workspaces with managed asset storage.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-200 pt-2">
                    <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Firebase Google Cloud workspace sync</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Shared design tokens &amp; SEO presets</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> 14-day unconditional refund policy</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer transition"
                >
                  Open Studio Workspace
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Compliant Footer */}
      <footer className="border-t border-zinc-800/80 pt-8 pb-24 px-6 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <div className="text-zinc-200 font-semibold">AppForge Studio LLC</div>
            <div>548 Market Street, Suite 41290, San Francisco, CA 94104 · support@appforge.studio</div>
          </div>
          <nav aria-label="Landing Legal Links" className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button type="button" onClick={() => onOpenCompliance('privacy')} className="hover:text-white underline cursor-pointer">Privacy Policy</button>
            <button type="button" onClick={() => onOpenCompliance('terms')} className="hover:text-white underline cursor-pointer">Terms of Service</button>
            <button type="button" onClick={() => onOpenCompliance('refund')} className="hover:text-white underline cursor-pointer">Refund Policy</button>
            <button type="button" onClick={() => onOpenCompliance('cookies')} className="hover:text-white underline cursor-pointer">Cookie Policy</button>
            <button type="button" onClick={() => onOpenCompliance('licenses')} className="hover:text-white underline cursor-pointer">Licenses &amp; SDKs</button>
            <button type="button" onClick={() => onOpenCompliance('deletion')} className="hover:text-white underline cursor-pointer">Data Deletion &amp; Unsubscribe</button>
          </nav>
        </div>
      </footer>
    </div>
  );
};
