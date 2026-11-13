/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LicensedMediaAsset {
  id: string;
  name: string;
  alt: string;
  url: string;
  cat: string;
  license: string;
  attribution: string;
}

function makeSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const LICENSED_STOCK_ASSETS: LicensedMediaAsset[] = [
  {
    id: 'asset_analytics_pulse',
    name: 'Analytics Overview Graphic',
    alt: 'Studio data analytics chart showing upward revenue trend bars and metric cards',
    cat: 'Analytics',
    license: 'CC0 1.0 Universal (No Attribution Required)',
    attribution: 'AppForge Studio Built-In Vector Pack',
    url: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">
        <defs>
          <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#18181b"/>
          </linearGradient>
          <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#60a5fa"/>
            <stop offset="100%" stop-color="#2563eb"/>
          </linearGradient>
        </defs>
        <rect width="800" height="420" fill="url(#bg1)"/>
        <g stroke="#27272a" stroke-width="1">
          <line x1="60" y1="90" x2="740" y2="90"/>
          <line x1="60" y1="170" x2="740" y2="170"/>
          <line x1="60" y1="250" x2="740" y2="250"/>
          <line x1="60" y1="330" x2="740" y2="330"/>
        </g>
        <rect x="90" y="210" width="64" height="120" rx="8" fill="url(#bar1)" opacity="0.65"/>
        <rect x="190" y="175" width="64" height="155" rx="8" fill="url(#bar1)" opacity="0.75"/>
        <rect x="290" y="140" width="64" height="190" rx="8" fill="url(#bar1)" opacity="0.85"/>
        <rect x="390" y="160" width="64" height="170" rx="8" fill="url(#bar1)" opacity="0.8"/>
        <rect x="490" y="105" width="64" height="225" rx="8" fill="url(#bar1)" opacity="0.92"/>
        <rect x="590" y="75" width="64" height="255" rx="8" fill="url(#bar1)"/>
        <path d="M122 195 L222 162 L322 126 L422 146 L522 92 L622 62" fill="none" stroke="#34d399" stroke-width="4" stroke-linecap="round"/>
        <circle cx="622" cy="62" r="7" fill="#34d399"/>
      </svg>
    `),
  },
  {
    id: 'asset_hardware_headphones',
    name: 'Studio Audio Product Illustration',
    alt: 'Minimalist studio wireless headphones product illustration on neutral dark surface',
    cat: 'Product',
    license: 'CC0 1.0 Universal (No Attribution Required)',
    attribution: 'AppForge Studio Built-In Vector Pack',
    url: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">
        <defs>
          <radialGradient id="spot" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stop-color="#27272a"/>
            <stop offset="100%" stop-color="#09090b"/>
          </radialGradient>
        </defs>
        <rect width="800" height="420" fill="url(#spot)"/>
        <circle cx="400" cy="210" r="145" fill="none" stroke="#3f3f46" stroke-width="1.5" stroke-dasharray="6 6"/>
        <path d="M275 230 C275 135, 525 135, 525 230" fill="none" stroke="#e4e4e7" stroke-width="18" stroke-linecap="round"/>
        <rect x="248" y="210" width="52" height="96" rx="22" fill="#2563eb" stroke="#93c5fd" stroke-width="3"/>
        <rect x="500" y="210" width="52" height="96" rx="22" fill="#2563eb" stroke="#93c5fd" stroke-width="3"/>
        <rect x="236" y="228" width="18" height="60" rx="8" fill="#a1a1aa"/>
        <rect x="546" y="228" width="18" height="60" rx="8" fill="#a1a1aa"/>
      </svg>
    `),
  },
  {
    id: 'asset_gradient_mesh',
    name: 'Editorial Surface Waves',
    alt: 'Layered indigo and slate geometric horizon waves background illustration',
    cat: 'Abstract',
    license: 'CC0 1.0 Universal (No Attribution Required)',
    attribution: 'AppForge Studio Built-In Vector Pack',
    url: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">
        <rect width="800" height="420" fill="#09090b"/>
        <path d="M0 290 Q 200 220 400 275 T 800 250 L 800 420 L 0 420 Z" fill="#1e293b" opacity="0.8"/>
        <path d="M0 330 Q 220 270 460 315 T 800 295 L 800 420 L 0 420 Z" fill="#1d4ed8" opacity="0.45"/>
        <path d="M0 365 Q 260 320 520 355 T 800 340 L 800 420 L 0 420 Z" fill="#0f172a"/>
      </svg>
    `),
  },
  {
    id: 'asset_workspace_architecture',
    name: 'Modular Interface Grid',
    alt: 'Modular application interface wireframe showing navigation sidebar and content cards',
    cat: 'Tech',
    license: 'CC0 1.0 Universal (No Attribution Required)',
    attribution: 'AppForge Studio Built-In Vector Pack',
    url: makeSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 420" width="800" height="420">
        <rect width="800" height="420" fill="#0f0f12"/>
        <rect x="64" y="54" width="672" height="312" rx="16" fill="#18181b" stroke="#27272a" stroke-width="2"/>
        <rect x="88" y="80" width="140" height="260" rx="10" fill="#121215" stroke="#27272a"/>
        <rect x="250" y="80" width="460" height="58" rx="10" fill="#121215" stroke="#27272a"/>
        <rect x="250" y="156" width="220" height="184" rx="10" fill="#1e293b" stroke="#334155"/>
        <rect x="490" y="156" width="220" height="184" rx="10" fill="#1e293b" stroke="#334155"/>
        <circle cx="114" cy="108" r="10" fill="#3b82f6"/>
      </svg>
    `),
  },
];

export interface FontAndMediaLicenseEntry {
  name: string;
  category: 'Typography' | 'Icons' | 'Media' | 'Runtime Package';
  license: string;
  source: string;
  commercialUseAllowed: boolean;
  attributionRequired: boolean;
}

export const FONT_AND_MEDIA_LICENSES: FontAndMediaLicenseEntry[] = [
  {
    name: 'Plus Jakarta Sans',
    category: 'Typography',
    license: 'SIL Open Font License (OFL) 1.1',
    source: 'Google Fonts / Tokotype',
    commercialUseAllowed: true,
    attributionRequired: false,
  },
  {
    name: 'System Sans / UI Mono Fallbacks',
    category: 'Typography',
    license: 'OS Built-in Platform Fonts',
    source: 'User Device OS',
    commercialUseAllowed: true,
    attributionRequired: false,
  },
  {
    name: 'Lucide Icons',
    category: 'Icons',
    license: 'ISC License (MIT-compatible)',
    source: 'lucide-react (Open Source)',
    commercialUseAllowed: true,
    attributionRequired: false,
  },
  {
    name: 'AppForge Studio Built-in Vector Pack',
    category: 'Media',
    license: 'CC0 1.0 Universal (Public Domain Dedication)',
    source: 'Local SVG Data Assets (Zero external image trackers)',
    commercialUseAllowed: true,
    attributionRequired: false,
  },
];

export interface ThirdPartySdkAuditEntry {
  packageName: string;
  purpose: string;
  runsIn: 'Client Browser' | 'Server Only';
  license: string;
  collectsPersonalData: boolean;
  trackingOrAds: boolean;
  status: 'Verified Safe' | 'Server-Isolated' | 'Not Used';
}

export const THIRD_PARTY_SDK_AUDIT: ThirdPartySdkAuditEntry[] = [
  {
    packageName: 'react / react-dom',
    purpose: 'Core UI rendering framework',
    runsIn: 'Client Browser',
    license: 'MIT',
    collectsPersonalData: false,
    trackingOrAds: false,
    status: 'Verified Safe',
  },
  {
    packageName: 'lucide-react',
    purpose: 'SVG iconography',
    runsIn: 'Client Browser',
    license: 'ISC',
    collectsPersonalData: false,
    trackingOrAds: false,
    status: 'Verified Safe',
  },
  {
    packageName: 'jszip',
    purpose: 'Client-side ZIP bundle archive generation',
    runsIn: 'Client Browser',
    license: 'MIT / GPLv3',
    collectsPersonalData: false,
    trackingOrAds: false,
    status: 'Verified Safe',
  },
  {
    packageName: 'motion',
    purpose: 'Declarative UI animation utilities',
    runsIn: 'Client Browser',
    license: 'MIT',
    collectsPersonalData: false,
    trackingOrAds: false,
    status: 'Verified Safe',
  },
  {
    packageName: 'three',
    purpose: 'Interactive WebGL 3D procedural geometry rendering (zero external asset trackers)',
    runsIn: 'Client Browser',
    license: 'MIT',
    collectsPersonalData: false,
    trackingOrAds: false,
    status: 'Verified Safe',
  },
  {
    packageName: '@google/genai',
    purpose: 'Optional AI Studio structured layout generation when requested by user',
    runsIn: 'Server Only',
    license: 'Apache-2.0',
    collectsPersonalData: false,
    trackingOrAds: false,
    status: 'Server-Isolated',
  },
  {
    packageName: 'Ad Networks / Behavioral Trackers / Third-Party Fingerprinting',
    purpose: 'None installed — AppForge excludes ad pixels and invasive analytics SDKs',
    runsIn: 'Client Browser',
    license: 'N/A',
    collectsPersonalData: false,
    trackingOrAds: false,
    status: 'Not Used',
  },
];
