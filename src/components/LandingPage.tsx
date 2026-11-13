import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ArrowRight, Box, Check, Code2, Globe, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ComplianceTabId } from './ComplianceHubModal';

interface LandingPageProps {
  onOpenStudio: () => void;
  onQuickStartTemplate: (templateId: string) => void;
  onOpenCompliance: (tab: ComplianceTabId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudio,
  onQuickStartTemplate,
  onOpenCompliance,
}) => {
  const { user, signingIn, signInWithGoogle } = useAuth();
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let rafId = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    let pmremGenerator: THREE.PMREMGenerator | null = null;
    let envTarget: THREE.WebGLRenderTarget | null = null;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
      if (!gl) {
        setWebglUnavailable(true);
        return;
      }

      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const rawRenderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(rawRenderer);

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: isSoftwareGl ? 'low-power' : 'high-performance',
        alpha: true,
      });

      const width = container.clientWidth || 520;
      const height = container.clientHeight || 420;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = false;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
      camera.position.set(3.2, 2.35, 4.3);
      camera.lookAt(0, 0.1, 0);

      // Balanced Environment & Studio Lighting
      pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
      scene.environment = envTarget.texture;
      roomEnv.dispose();

      const hemi = new THREE.HemisphereLight(0xdbeafe, 0x18181b, 0.9);
      scene.add(hemi);
      const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
      keyLight.position.set(4.5, 6, 3.5);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.3);
      rimLight.position.set(-4, -2, -3);
      scene.add(rimLight);

      // Composite Multi-Part Architectural Prism Assembly
      const rig = new THREE.Group();
      scene.add(rig);

      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        roughness: 0.24,
        metalness: 0.72,
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.18,
        metalness: 0.85,
      });
      const slateMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.42,
        metalness: 0.55,
      });
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x60a5fa,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });

      const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.65, 0.22, 6), slateMat);
      basePlinth.position.y = -1.05;
      rig.add(basePlinth);

      const corePoly = new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, 0), coreMat);
      corePoly.position.y = 0.05;
      rig.add(corePoly);

      const outerCage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.22, 0), wireMat);
      outerCage.position.y = 0.05;
      rig.add(outerCage);

      const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.038, 16, 72), accentMat);
      ringA.rotation.x = Math.PI * 0.38;
      ringA.rotation.y = Math.PI * 0.16;
      rig.add(ringA);

      const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.025, 14, 72), slateMat);
      ringB.rotation.x = -Math.PI * 0.32;
      ringB.rotation.z = Math.PI * 0.22;
      rig.add(ringB);

      // 3 Satellite Nodes orbiting the core
      const satellites: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const sat = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), accentMat);
        const angle = (i / 3) * Math.PI * 2;
        sat.position.set(Math.cos(angle) * 1.55, 0.12 * Math.sin(i), Math.sin(angle) * 1.55);
        satellites.push(sat);
        rig.add(sat);
      }

      let pointerX = 0;
      let pointerY = 0;
      const onPointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      container.addEventListener('pointermove', onPointerMove);

      const handleResize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || 520;
        const h = container.clientHeight || 420;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      const onContextLost = (e: Event) => {
        e.preventDefault();
        setWebglUnavailable(true);
      };
      const onContextRestored = () => {
        setWebglUnavailable(false);
      };
      renderer.domElement.addEventListener('webglcontextlost', onContextLost);
      renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

      let t = 0;
      const drawOnce = () => {
        if (disposed || !renderer) return;
        if (!prefersReduced) {
          t += 0.012;
          corePoly.rotation.y = t * 0.65 + pointerX * 0.35;
          corePoly.rotation.x = Math.sin(t * 0.4) * 0.2 + pointerY * 0.25;
          outerCage.rotation.y = -t * 0.35;
          ringA.rotation.z = t * 0.45;
          ringB.rotation.y = -t * 0.3;
          rig.position.y = Math.sin(t * 1.2) * 0.08;
          satellites.forEach((sat, idx) => {
            const a = t * 0.8 + (idx / 3) * Math.PI * 2;
            sat.position.x = Math.cos(a) * 1.55;
            sat.position.z = Math.sin(a) * 1.55;
            sat.position.y = Math.sin(t * 1.4 + idx) * 0.26;
            sat.rotation.y = t * 1.3;
          });
        }
        renderer.render(scene, camera);

        if (!prefersReduced) {
          if (isSoftwareGl) {
            timerId = setTimeout(() => {
              rafId = requestAnimationFrame(drawOnce);
            }, 64);
          } else {
            rafId = requestAnimationFrame(drawOnce);
          }
        }
      };

      drawOnce();

      return () => {
        disposed = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (timerId) clearTimeout(timerId);
        container.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('resize', handleResize);
        renderer?.domElement.removeEventListener('webglcontextlost', onContextLost);
        renderer?.domElement.removeEventListener('webglcontextrestored', onContextRestored);
        envTarget?.dispose();
        pmremGenerator?.dispose();
        renderer?.dispose();
        container.innerHTML = '';
      };
    } catch {
      setWebglUnavailable(true);
      return () => {
        disposed = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (timerId) clearTimeout(timerId);
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <a
        href="#landing-main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* Clean 3-Zone Header */}
      <header className="border-b border-zinc-800/80 bg-[#09090b] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            AppForge
          </span>

          <nav aria-label="Primary landing navigation" className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#capabilities" className="hover:text-white transition whitespace-nowrap">
              Capabilities
            </a>
            <a href="#three-studio" className="hover:text-white transition whitespace-nowrap">
              3D Studio
            </a>
            <a href="#pricing" className="hover:text-white transition whitespace-nowrap">
              Pricing
            </a>
            <button
              type="button"
              onClick={() => onOpenCompliance('privacy')}
              className="hover:text-white transition cursor-pointer whitespace-nowrap"
            >
              Legal &amp; Privacy
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <span className="hidden sm:inline text-xs text-zinc-400 truncate max-w-[160px]">
                {user.email || user.displayName}
              </span>
            ) : (
              <button
                type="button"
                disabled={signingIn}
                onClick={signInWithGoogle}
                className="hidden sm:inline-flex text-xs font-medium text-zinc-300 hover:text-white transition cursor-pointer whitespace-nowrap"
              >
                {signingIn ? 'Signing in...' : 'Sign in with Google'}
              </button>
            )}
            <button
              type="button"
              onClick={onOpenStudio}
              data-testid="landing-open-studio-btn"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <span>Open Studio</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      <main id="landing-main" tabIndex={-1} className="flex-1">
        {/* Hero Split */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
              Visual App Builder · Multi-Framework Compiler
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-[1.08] text-balance">
              Build interactive 3D web apps and ship directly to your Vercel account.
            </h1>
            <p className="text-base text-zinc-300 leading-relaxed max-w-xl">
              Design multi-page applications visually, drop sandboxed Three.js and CSS 3D components, configure per-page SEO and transitions, and compile clean HTML, React, Next.js, or Vue 3 source bundles.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onOpenStudio}
                data-testid="hero-start-building-btn"
                className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <span>Open Visual Studio</span>
                <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => onQuickStartTemplate('linkinbio')}
                data-testid="hero-3d-template-btn"
                className="px-5 py-3 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-sm font-medium flex items-center gap-2 transition cursor-pointer"
              >
                <Box size={15} className="text-blue-400" />
                <span>Try 3D Link-in-Bio</span>
              </button>
            </div>
            <div className="pt-2 text-xs text-zinc-400 flex flex-wrap items-center gap-2">
              <span>HTML / CSS / JS</span>
              <span aria-hidden="true">·</span>
              <span>React + Vite</span>
              <span aria-hidden="true">·</span>
              <span>Next.js App Router</span>
              <span aria-hidden="true">·</span>
              <span>Vue 3</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden relative min-h-[380px] sm:min-h-[420px]">
              {webglUnavailable ? (
                <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-3 bg-gradient-to-br from-zinc-900 to-zinc-950">
                  <Box size={36} className="text-blue-400" />
                  <h2 className="text-sm font-semibold text-white">Interactive 3D Viewport</h2>
                  <p className="text-xs text-zinc-400 max-w-xs">
                    Hardware WebGL is unavailable in this environment; CSS 3D transforms and studio builders remain active inside the editor.
                  </p>
                </div>
              ) : (
                <div
                  ref={mountRef}
                  data-testid="landing-threejs-canvas"
                  className="w-full h-[380px] sm:h-[420px] cursor-grab active:cursor-grabbing"
                />
              )}
            </div>
          </div>
        </section>

        {/* Capabilities Bento */}
        <section id="capabilities" className="border-t border-zinc-800/80 py-16 bg-zinc-950/60">
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Core Architecture
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                One structured project schema compiled into four production targets.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>01.</span>
                  <Code2 size={16} className="text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  HTML, React, Next.js &amp; Vue 3 Compilers
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Inspect generated files side by side with an interactive source tree, copy individual files, or download a deployable .ZIP package tailored to your framework.
                </p>
              </article>

              <article id="three-studio" className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>02.</span>
                  <Sparkles size={16} className="text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Free &amp; AI-Generated 3D Sandbox
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Insert five built-in CSS 3D and Three.js presets or describe a scene in plain English. Every 3D block renders inside an isolated sandboxed iframe to protect the studio.
                </p>
              </article>

              <article className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>03.</span>
                  <Globe size={16} className="text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Own-Account Vercel Deployments &amp; Custom Domains
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Connect your own Vercel account via OAuth or encrypted token, track live build states, attach custom apex or subdomains, and verify A/CNAME DNS records.
                </p>
              </article>

              <article className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>04.</span>
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  Built-in SEO, Page Transitions &amp; 20-Point Compliance
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Edit per-page meta titles, descriptions, Open Graph tags, and slide/fade/scale navigation transitions alongside WCAG AA contrast checks and full legal policies.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* Transparent Pricing (Zero Dark Patterns, Zero Fake Reviews) */}
        <section id="pricing" className="border-t border-zinc-800/80 py-16">
          <div className="max-w-5xl mx-auto px-6 space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Upfront Pricing
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Transparent plans with zero hidden fees.
              </h2>
              <p className="text-xs text-zinc-400">
                All paid subscriptions include an unconditional 14-day full refund window and instant self-service cancellation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Starter</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$0</span>
                    <span className="text-xs text-zinc-400">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Full visual canvas, 5 free 3D presets, multi-framework ZIP export, and interactive preview.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300 pt-2">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> HTML, React, Next.js &amp; Vue 3 export</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Per-page SEO, Open Graph &amp; transitions</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-400" /> Own-account Vercel deployment</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white cursor-pointer transition"
                >
                  Launch Free Workspace
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-blue-500/40 bg-blue-950/15 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">Studio Pro</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$29</span>
                    <span className="text-xs text-zinc-400">/ month · Billed monthly, cancel anytime</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Cloud project synchronization across devices, encrypted cloud media hosting, and priority 3D synthesis.
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300 pt-2">
                    <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Everything in Starter with zero hidden charges</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> Firebase cloud workspace sync &amp; version backups</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-blue-400" /> 14-day full refund guarantee via support@appforge.studio</li>
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

      {/* Compliant Business & Legal Footer */}
      <footer className="border-t border-zinc-800/80 pt-6 pb-20 px-6 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <span className="font-semibold text-zinc-200">AppForge Studio LLC</span> · 548 Market Street, Suite 41290, San Francisco, CA 94104 · Support:{' '}
            <span className="text-zinc-300">support@appforge.studio</span>
          </div>
          <nav aria-label="Footer legal links" className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <button type="button" onClick={() => onOpenCompliance('privacy')} className="hover:text-white underline cursor-pointer">
              Privacy Policy
            </button>
            <button type="button" onClick={() => onOpenCompliance('terms')} className="hover:text-white underline cursor-pointer">
              Terms of Service
            </button>
            <button type="button" onClick={() => onOpenCompliance('refund')} className="hover:text-white underline cursor-pointer">
              Refund Policy
            </button>
            <button type="button" onClick={() => onOpenCompliance('cookies')} className="hover:text-white underline cursor-pointer">
              Cookie Settings
            </button>
            <button type="button" onClick={() => onOpenCompliance('licenses')} className="hover:text-white underline cursor-pointer">
              Licenses &amp; SDKs
            </button>
            <button type="button" onClick={() => onOpenCompliance('deletion')} className="hover:text-white underline cursor-pointer">
              Data Deletion &amp; Unsubscribe
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};
