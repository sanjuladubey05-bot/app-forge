/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanvasElement, ComponentType, Page, Project } from '../types/editor';

/**
 * Standard Forge Project JSON Specification (Production Schema)
 * Single source of truth connecting Canvas, Google AI Studio generator,
 * Live Preview, and Code Exporters.
 */
export interface ForgeTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface ForgeEventAction {
  action: 'NAVIGATE' | 'TOAST' | 'MODAL' | 'SUBMIT' | 'CUSTOM';
  target?: string;
  message?: string;
  payload?: Record<string, any>;
}

export interface ForgeNode {
  id: string;
  type: string; // 'Container' | 'Heading' | 'Button' | 'Text' | 'Card' | 'Input' | 'Table' | 'Metric' | 'Badge' | 'Divider' | 'Image' | 'Select' | 'Toggle'
  props: Record<string, any>;
  styles: Record<string, any>;
  events?: Record<string, ForgeEventAction>;
  children?: ForgeNode[];
}

export interface ForgePage {
  id: string;
  name: string;
  route: string;
  root: ForgeNode;
}

export interface ForgeProject {
  schemaVersion: '1.0';
  projectId: string;
  appName: string;
  platform: 'web' | 'mobile' | 'desktop';
  theme: ForgeTheme;
  pages: ForgePage[];
}

/**
 * Official JSON Schema definition for Google AI Studio Structured Outputs
 */
export const FORGE_JSON_SCHEMA_DEFINITION = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ForgeProject',
  description: 'Schema for AppForge drag-and-drop projects and UI component trees',
  type: 'object',
  required: ['schemaVersion', 'projectId', 'appName', 'platform', 'theme', 'pages'],
  properties: {
    schemaVersion: { type: 'string', enum: ['1.0'] },
    projectId: { type: 'string' },
    appName: { type: 'string' },
    platform: { type: 'string', enum: ['web', 'mobile', 'desktop'] },
    theme: {
      type: 'object',
      required: ['primaryColor', 'backgroundColor', 'textColor', 'fontFamily', 'borderRadius'],
      properties: {
        primaryColor: { type: 'string' },
        backgroundColor: { type: 'string' },
        textColor: { type: 'string' },
        fontFamily: { type: 'string' },
        borderRadius: { type: 'string' },
      },
    },
    pages: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'route', 'root'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          route: { type: 'string' },
          root: { $ref: '#/definitions/ForgeNode' },
        },
      },
    },
  },
  definitions: {
    ForgeNode: {
      type: 'object',
      required: ['id', 'type', 'props', 'styles'],
      properties: {
        id: { type: 'string' },
        type: {
          type: 'string',
          enum: [
            'Container',
            'Navbar',
            'Card',
            'Heading',
            'Text',
            'Button',
            'Input',
            'Textarea',
            'Select',
            'Toggle',
            'Badge',
            'Metric',
            'Image',
            'Table',
            'Divider',
          ],
        },
        props: { type: 'object' },
        styles: { type: 'object' },
        events: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            required: ['action'],
            properties: {
              action: { type: 'string', enum: ['NAVIGATE', 'TOAST', 'MODAL', 'SUBMIT', 'CUSTOM'] },
              target: { type: 'string' },
              message: { type: 'string' },
              payload: { type: 'object' },
            },
          },
        },
        children: {
          type: 'array',
          items: { $ref: '#/definitions/ForgeNode' },
        },
      },
    },
  },
};

// ----------------------------------------------------
// BIDIRECTIONAL CONVERTER FUNCTIONS
// ----------------------------------------------------

const KNOWN_TYPES = new Set<string>([
  'container',
  'navbar',
  'card',
  'heading',
  'text',
  'button',
  'input',
  'textarea',
  'select',
  'toggle',
  'badge',
  'metric',
  'image',
  'table',
  'divider',
]);

function capitalizeType(type: string): string {
  const map: Record<string, string> = {
    container: 'Container',
    navbar: 'Navbar',
    card: 'Card',
    heading: 'Heading',
    text: 'Text',
    button: 'Button',
    input: 'Input',
    textarea: 'Textarea',
    select: 'Select',
    toggle: 'Toggle',
    badge: 'Badge',
    metric: 'Metric',
    image: 'Image',
    table: 'Table',
    divider: 'Divider',
  };
  return map[type.toLowerCase()] || type;
}

function normalizeType(type: string): ComponentType {
  const map: Record<string, ComponentType> = {
    container: 'container',
    navbar: 'navbar',
    card: 'card',
    heading: 'heading',
    text: 'text',
    button: 'button',
    input: 'input',
    textarea: 'textarea',
    select: 'select',
    toggle: 'toggle',
    badge: 'badge',
    metric: 'metric',
    image: 'image',
    table: 'table',
    divider: 'divider',
  };
  return map[(type || '').toLowerCase()] || 'text';
}

/**
 * Validates and sanitizes an array of AI-generated or imported ForgeNodes (CR-AI-08).
 * Rejects empty, non-array, or structurally invalid inputs safely without throwing uncaught errors.
 */
export function validateForgeNodes(raw: unknown): { valid: boolean; nodes: ForgeNode[]; error?: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { valid: false, nodes: [], error: 'AI output returned zero valid UI nodes.' };
  }

  const sanitizeNode = (item: any, index: number): ForgeNode | null => {
    if (!item || typeof item !== 'object') return null;
    const rawType = typeof item.type === 'string' && item.type.trim() ? item.type.trim() : '';
    if (!rawType) return null;

    const props = item.props && typeof item.props === 'object' ? { ...item.props } : {};
    const styles = item.styles && typeof item.styles === 'object' ? { ...item.styles } : {};

    const node: ForgeNode = {
      id: typeof item.id === 'string' && item.id.trim() ? item.id.trim() : `node_${index}`,
      type: rawType,
      props,
      styles,
    };

    if (item.events && typeof item.events === 'object') {
      node.events = item.events;
    }

    if (Array.isArray(item.children)) {
      const cleanChildren = item.children
        .map((c: any, idx: number) => sanitizeNode(c, idx))
        .filter((c: ForgeNode | null): c is ForgeNode => c !== null);
      if (cleanChildren.length > 0 || KNOWN_TYPES.has(rawType.toLowerCase())) {
        node.children = cleanChildren;
      }
    }

    return node;
  };

  const sanitized = raw
    .map((item, idx) => sanitizeNode(item, idx))
    .filter((n): n is ForgeNode => n !== null);

  if (sanitized.length === 0) {
    return { valid: false, nodes: [], error: 'No structurally valid ForgeNode objects found in response.' };
  }

  return { valid: true, nodes: sanitized };
}

/**
 * Remaps all IDs in a ForgeNode tree to guarantee collision-free uniqueness before canvas insertion (CR-AI-09).
 */
export function remapForgeNodeIds(nodes: ForgeNode[], existingIds: Set<string> = new Set()): ForgeNode[] {
  const seen = new Set<string>(existingIds);

  const nextUniqueId = (prefix: string): string => {
    let candidate = `${prefix}_${Math.random().toString(36).substring(2, 8)}`;
    while (seen.has(candidate)) {
      candidate = `${prefix}_${Math.random().toString(36).substring(2, 8)}`;
    }
    seen.add(candidate);
    return candidate;
  };

  const remap = (node: ForgeNode): ForgeNode => {
    const newId = nextUniqueId('fg');
    const cloned: ForgeNode = {
      ...node,
      id: newId,
      props: { ...(node.props || {}) },
      styles: { ...(node.styles || {}) },
    };
    if (node.events) {
      cloned.events = JSON.parse(JSON.stringify(node.events));
    }
    if (Array.isArray(node.children)) {
      cloned.children = node.children.map(remap);
    }
    return cloned;
  };

  return nodes.map(remap);
}

/**
 * Converts internal CanvasElement node into ForgeNode
 */
export function canvasElementToForgeNode(el: CanvasElement): ForgeNode {
  const node: ForgeNode = {
    id: el.id,
    type: capitalizeType(el.type),
    props: { ...el.props },
    styles: { ...el.styles },
  };

  // Convert simple whenClicked setting
  if (el.props?.whenClicked === 'openPage' && el.props?.targetPageId) {
    if (!node.events) node.events = {};
    node.events.onClick = {
      action: 'NAVIGATE',
      target: el.props.targetPageId,
    };
  }

  // Convert interactions to events map
  if (el.interactions && el.interactions.length > 0) {
    if (!node.events) node.events = {};
    for (const inter of el.interactions) {
      if (inter.steps && inter.steps.length > 0) {
        const firstStep = inter.steps[0];
        if (firstStep.type === 'navigate') {
          node.events[inter.trigger] = {
            action: 'NAVIGATE',
            target: firstStep.targetPageId || '',
          };
        } else if (firstStep.type === 'toast') {
          node.events[inter.trigger] = {
            action: 'TOAST',
            message: firstStep.toastMessage,
          };
        } else if (firstStep.type === 'openModal') {
          node.events[inter.trigger] = {
            action: 'MODAL',
            message: firstStep.modalTitle,
            payload: { content: firstStep.modalContent },
          };
        } else if (firstStep.type === 'submitForm') {
          node.events[inter.trigger] = {
            action: 'SUBMIT',
            message: firstStep.toastMessage,
          };
        }
      }
    }
  }

  if (el.children && el.children.length > 0) {
    node.children = el.children.map(canvasElementToForgeNode);
  }

  return node;
}

/**
 * Converts ForgeNode into internal CanvasElement
 */
export function forgeNodeToCanvasElement(node: ForgeNode): CanvasElement {
  const rawTypeLower = (node.type || '').toLowerCase();
  const isKnown = KNOWN_TYPES.has(rawTypeLower);
  const type = normalizeType(node.type);
  const element: CanvasElement = {
    id: node.id || `el_${Math.random().toString(36).substring(2, 9)}`,
    type,
    name: node.props?.text || node.props?.label || node.props?.brandName || node.props?.name || `${capitalizeType(type)} Element`,
    props: {
      ...(node.props || {}),
      ...(!isKnown && node.type ? { unknownType: node.type } : {}),
    },
    styles: { ...(node.styles || {}) },
    events: [],
    interactions: [],
    hidden: false,
    locked: false,
  };

  // Convert events back to interactions and props
  if (node.events) {
    for (const [trigger, eventAction] of Object.entries(node.events)) {
      if (eventAction.action === 'NAVIGATE') {
        if (trigger === 'onClick') {
          element.props.whenClicked = 'openPage';
          element.props.targetPageId = eventAction.target;
        }
        element.interactions = [
          ...(element.interactions || []),
          {
            id: `inter_${Math.random().toString(36).substring(2, 7)}`,
            trigger: trigger as 'onClick' | 'onHover' | 'onChange',
            name: `Navigate to ${eventAction.target}`,
            steps: [
              {
                id: `step_${Math.random().toString(36).substring(2, 7)}`,
                type: 'navigate',
                targetPageId: eventAction.target,
              },
            ],
          },
        ];
      } else if (eventAction.action === 'TOAST') {
        element.interactions = [
          ...(element.interactions || []),
          {
            id: `inter_${Math.random().toString(36).substring(2, 7)}`,
            trigger: trigger as 'onClick' | 'onHover' | 'onChange',
            name: 'Show Notification',
            steps: [
              {
                id: `step_${Math.random().toString(36).substring(2, 7)}`,
                type: 'toast',
                toastMessage: eventAction.message || 'Action executed',
                toastType: 'success',
              },
            ],
          },
        ];
      }
    }
  }

  if (node.children && node.children.length > 0) {
    element.children = node.children.map(forgeNodeToCanvasElement);
  }

  return element;
}

/**
 * Converts entire internal Project to standardized ForgeProject JSON
 */
export function projectToForgeJson(project: Project): ForgeProject {
  const pages: ForgePage[] = project.pages.map((p) => {
    // If elements exist, wrap in root Container if not already single root
    let rootNode: ForgeNode;
    if (p.elements.length === 1 && normalizeType(p.elements[0].type) === 'container') {
      rootNode = canvasElementToForgeNode(p.elements[0]);
    } else {
      rootNode = {
        id: `root_${p.id}`,
        type: 'Container',
        props: {
          direction: 'column',
          gap: '16px',
        },
        styles: {
          padding: '24px',
          backgroundColor: p.canvasBg || project.canvasBg || '#09090b',
          maxWidth: '1200px',
          margin: '0 auto',
        },
        children: p.elements.map(canvasElementToForgeNode),
      };
    }

    return {
      id: p.id,
      name: p.name,
      route: p.path.startsWith('/') ? p.path : `/${p.path}`,
      root: rootNode,
    };
  });

  return {
    schemaVersion: '1.0',
    projectId: project.id,
    appName: project.name,
    platform: project.viewport === 'mobile' ? 'mobile' : 'web',
    theme: {
      primaryColor: '#2563EB',
      backgroundColor: project.canvasBg || '#09090b',
      textColor: '#FFFFFF',
      fontFamily: 'Inter',
      borderRadius: '8px',
    },
    pages,
  };
}

/**
 * Converts imported ForgeProject JSON into internal Project state
 */
export function forgeJsonToProject(forge: ForgeProject): Project {
  const pages: Page[] = forge.pages.map((fp) => {
    let elements: CanvasElement[] = [];
    if (fp.root) {
      if (fp.root.children && fp.root.children.length > 0) {
        // Flatten direct children of root container for seamless canvas manipulation
        elements = fp.root.children.map(forgeNodeToCanvasElement);
      } else {
        elements = [forgeNodeToCanvasElement(fp.root)];
      }
    }

    return {
      id: fp.id,
      name: fp.name,
      path: fp.route,
      elements,
      transition: 'fade',
      canvasBg: fp.root?.styles?.backgroundColor || forge.theme?.backgroundColor || '#09090b',
    };
  });

  return {
    id: forge.projectId || `proj_${Date.now()}`,
    name: forge.appName || 'Imported Forge App',
    description: `Imported from Forge schema v${forge.schemaVersion || '1.0'}`,
    pages: pages.length > 0 ? pages : [
      {
        id: 'page_home',
        name: 'Home',
        path: '/',
        transition: 'fade',
        elements: [],
      },
    ],
    activePageId: pages[0]?.id || 'page_home',
    homePageId: pages[0]?.id || 'page_home',
    viewport: forge.platform === 'mobile' ? 'mobile' : 'desktop',
    zoom: 100,
    canvasBg: forge.theme?.backgroundColor || '#09090b',
    canvasPadding: 'md',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ----------------------------------------------------
// SMART AI STUDIO PROMPT GENERATION ENGINE
// ----------------------------------------------------

export interface AiPromptTemplate {
  id: string;
  label: string;
  category: 'Landing Page' | 'Dashboard' | 'Forms & Auth' | 'E-Commerce';
  prompt: string;
}

export const AI_PROMPT_PRESETS: AiPromptTemplate[] = [
  {
    id: 'pricing-tiers',
    label: 'Pricing Grid (3 Tiers)',
    category: 'Landing Page',
    prompt: 'Create a modern pricing section with 3 tiers: Starter ($19), Professional ($49 with popular badge), and Enterprise ($149). Each tier should have a heading, price metric, feature list, and primary CTA button.',
  },
  {
    id: 'saas-dashboard',
    label: 'SaaS Analytics Dashboard',
    category: 'Dashboard',
    prompt: 'Create an executive SaaS analytics dashboard with 4 KPI cards (MRR, Active Users, Conversion Rate, Churn Rate), followed by an interactive data table of recent enterprise transactions.',
  },
  {
    id: 'auth-card',
    label: 'Sign In & Authentication Card',
    category: 'Forms & Auth',
    prompt: 'Create a clean, focused user login card with an app title, email text input, password field, remember me toggle switch, and a full-width "Sign In to Account" button.',
  },
  {
    id: 'product-showcase',
    label: 'E-Commerce Product Showcase',
    category: 'E-Commerce',
    prompt: 'Create a sleek product showcase card featuring a high-res product image box, status tag badge "In Stock", star rating text, price metric ($249), and an "Add to Cart" action button.',
  },
  {
    id: 'lead-contact',
    label: 'Enterprise Lead Intake Form',
    category: 'Forms & Auth',
    prompt: 'Create a professional lead capture section with a bold heading, full name input, work email field, service interest dropdown select, project description textarea, and a submit CTA button.',
  },
  {
    id: 'hero-banner',
    label: 'High-Impact Hero Banner',
    category: 'Landing Page',
    prompt: 'Create a high-impact startup hero section with an announcement pill badge, bold H1 heading, descriptive paragraph text, and two action buttons side-by-side.',
  },
];

/**
 * Intelligent synthesis engine that produces standard Forge JSON nodes from plain-language prompts
 */
export function generateForgeNodesFromPrompt(prompt: string): ForgeNode[] {
  const p = prompt.toLowerCase();

  // 1. Pricing Tiers
  if (p.includes('pricing') || p.includes('tier') || p.includes('plan')) {
    return [
      {
        id: `node_price_heading_${Date.now()}`,
        type: 'Heading',
        props: {
          text: 'Simple, Transparent Pricing',
          headingLevel: 'h2',
          subtext: 'Choose the ideal plan to scale your software engineering and product velocity.',
        },
        styles: {
          textAlign: 'center',
          alignSelf: 'center',
          marginBottom: '24px',
        },
      },
      {
        id: `node_price_container_${Date.now()}`,
        type: 'Container',
        props: {
          direction: 'row',
          gap: '16px',
        },
        styles: {
          width: 'full',
          justifyContent: 'center',
        },
        children: [
          {
            id: `node_tier_starter_${Date.now()}`,
            type: 'Card',
            props: {
              text: 'Starter Plan',
              subtext: 'Ideal for solo developers and early-stage prototypes.',
            },
            styles: {
              width: 'third',
              backgroundColor: '#18181b',
              padding: '24px',
              borderRadius: '12px',
            },
            children: [
              {
                id: `node_m1_${Date.now()}`,
                type: 'Metric',
                props: { metricLabel: 'Monthly', metricValue: '$19/mo' },
                styles: {},
              },
              {
                id: `node_b1_${Date.now()}`,
                type: 'Button',
                props: { text: 'Choose Starter', buttonVariant: 'outline' },
                styles: { width: 'full', marginTop: '16px' },
                events: { onClick: { action: 'TOAST', message: 'Selected Starter plan' } },
              },
            ],
          },
          {
            id: `node_tier_pro_${Date.now()}`,
            type: 'Card',
            props: {
              text: 'Professional Plan',
              subtext: 'For growing development teams building high-scale frontends.',
            },
            styles: {
              width: 'third',
              backgroundColor: '#1e1b4b',
              borderColor: '#6366f1',
              borderWidth: '2px',
              padding: '24px',
              borderRadius: '12px',
            },
            children: [
              {
                id: `node_badge_pop_${Date.now()}`,
                type: 'Badge',
                props: { text: '★ MOST POPULAR', badgeVariant: 'primary' },
                styles: { marginBottom: '8px' },
              },
              {
                id: `node_m2_${Date.now()}`,
                type: 'Metric',
                props: { metricLabel: 'Monthly', metricValue: '$49/mo' },
                styles: {},
              },
              {
                id: `node_b2_${Date.now()}`,
                type: 'Button',
                props: { text: 'Start 14-Day Pro Trial', buttonVariant: 'primary' },
                styles: { width: 'full', marginTop: '16px' },
                events: { onClick: { action: 'TOAST', message: 'Starting Pro trial checkout' } },
              },
            ],
          },
          {
            id: `node_tier_ent_${Date.now()}`,
            type: 'Card',
            props: {
              text: 'Enterprise',
              subtext: 'Dedicated cloud infrastructure, SOC2 compliance, and SLAs.',
            },
            styles: {
              width: 'third',
              backgroundColor: '#18181b',
              padding: '24px',
              borderRadius: '12px',
            },
            children: [
              {
                id: `node_m3_${Date.now()}`,
                type: 'Metric',
                props: { metricLabel: 'Custom Contract', metricValue: '$149/mo' },
                styles: {},
              },
              {
                id: `node_b3_${Date.now()}`,
                type: 'Button',
                props: { text: 'Contact Enterprise Sales', buttonVariant: 'secondary' },
                styles: { width: 'full', marginTop: '16px' },
                events: { onClick: { action: 'TOAST', message: 'Connecting to enterprise account executive' } },
              },
            ],
          },
        ],
      },
    ];
  }

  // 2. Dashboard / Analytics
  if (p.includes('dashboard') || p.includes('kpi') || p.includes('analytics') || p.includes('metrics')) {
    return [
      {
        id: `node_dash_head_${Date.now()}`,
        type: 'Heading',
        props: {
          text: 'Executive Performance Dashboard',
          headingLevel: 'h1',
          subtext: 'Real-time telemetry of system health, monthly revenue, and conversion metrics.',
        },
        styles: { marginBottom: '16px' },
      },
      {
        id: `node_kpi_row_${Date.now()}`,
        type: 'Container',
        props: { direction: 'row', gap: '16px' },
        styles: { width: 'full', marginBottom: '24px' },
        children: [
          {
            id: `kpi_1_${Date.now()}`,
            type: 'Metric',
            props: { metricLabel: 'Monthly Recurring Revenue', metricValue: '$48,250', metricTrend: '+18.4% vs last month' },
            styles: { width: 'fourth' },
          },
          {
            id: `kpi_2_${Date.now()}`,
            type: 'Metric',
            props: { metricLabel: 'Active Workspaces', metricValue: '1,420', metricTrend: '+12.1% growth' },
            styles: { width: 'fourth' },
          },
          {
            id: `kpi_3_${Date.now()}`,
            type: 'Metric',
            props: { metricLabel: 'Checkout Conversion', metricValue: '4.82%', metricTrend: '+0.6% uplift' },
            styles: { width: 'fourth' },
          },
          {
            id: `kpi_4_${Date.now()}`,
            type: 'Metric',
            props: { metricLabel: 'Net Churn Rate', metricValue: '0.41%', metricTrend: '-0.12% drop' },
            styles: { width: 'fourth' },
          },
        ],
      },
      {
        id: `node_table_${Date.now()}`,
        type: 'Table',
        props: {
          tableHeaders: ['Account Name', 'Plan Tier', 'Seat Count', 'Billing Status'],
          tableRows: [
            ['Stripe Technologies', 'Enterprise SLA', '120 Seats', 'Paid - Verified'],
            ['Vercel Infrastructure', 'Pro Platform', '45 Seats', 'Paid - Verified'],
            ['Linear Systems', 'Pro Platform', '30 Seats', 'Paid - Verified'],
            ['Supabase Database', 'Custom Cloud', '80 Seats', 'Pending Invoice'],
          ],
        },
        styles: { width: 'full' },
      },
    ];
  }

  // 3. Login / Auth Form
  if (p.includes('login') || p.includes('auth') || p.includes('sign in') || p.includes('register')) {
    return [
      {
        id: `node_auth_card_${Date.now()}`,
        type: 'Card',
        props: {
          text: 'Welcome Back to Forge',
          subtext: 'Enter your credentials to access your studio workspaces and live projects.',
        },
        styles: {
          maxWidth: '480px',
          alignSelf: 'center',
          backgroundColor: '#18181b',
          borderColor: '#27272a',
          padding: '32px',
          borderRadius: '16px',
          margin: '0 auto',
        },
        children: [
          {
            id: `node_auth_email_${Date.now()}`,
            type: 'Input',
            props: { label: 'Work Email Address', placeholder: 'engineer@company.com' },
            styles: { marginBottom: '16px' },
          },
          {
            id: `node_auth_pass_${Date.now()}`,
            type: 'Input',
            props: { label: 'Account Password', placeholder: '••••••••••••' },
            styles: { marginBottom: '16px' },
          },
          {
            id: `node_auth_remember_${Date.now()}`,
            type: 'Toggle',
            props: { label: 'Remember this browser for 30 days', subtext: 'Enables instant authentication tokens' },
            styles: { marginBottom: '20px' },
          },
          {
            id: `node_auth_submit_${Date.now()}`,
            type: 'Button',
            props: { text: 'Sign In to Studio →', buttonVariant: 'primary' },
            styles: { width: 'full', alignSelf: 'center' },
            events: { onClick: { action: 'TOAST', message: 'Authentication token verified. Redirecting...' } },
          },
        ],
      },
    ];
  }

  // 4. E-Commerce Product Card
  if (p.includes('product') || p.includes('store') || p.includes('commerce') || p.includes('shop') || p.includes('cart')) {
    return [
      {
        id: `node_prod_card_${Date.now()}`,
        type: 'Card',
        props: {
          text: 'Studio Wireless Pro Headphones',
          subtext: 'Audiophile active noise cancelling with spatial audio calibration.',
        },
        styles: {
          maxWidth: '520px',
          alignSelf: 'center',
          backgroundColor: '#18181b',
          padding: '24px',
          borderRadius: '16px',
          margin: '0 auto',
        },
        children: [
          {
            id: `node_prod_img_${Date.now()}`,
            type: 'Image',
            props: {
              imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
              imageAlt: 'Wireless Pro Headphones',
            },
            styles: { borderRadius: '12px', marginBottom: '16px' },
          },
          {
            id: `node_prod_badge_${Date.now()}`,
            type: 'Badge',
            props: { text: '✓ IN STOCK · FREE EXPRESS SHIPPING', badgeVariant: 'success' },
            styles: { marginBottom: '12px' },
          },
          {
            id: `node_prod_metric_${Date.now()}`,
            type: 'Metric',
            props: { metricLabel: 'Retail Price', metricValue: '$249.00', metricTrend: 'Save $50 today' },
            styles: { marginBottom: '16px' },
          },
          {
            id: `node_prod_btn_${Date.now()}`,
            type: 'Button',
            props: { text: 'Add to Cart — $249', buttonVariant: 'primary' },
            styles: { width: 'full' },
            events: { onClick: { action: 'TOAST', message: 'Item added to your shopping cart' } },
          },
        ],
      },
    ];
  }

  // 5. Default Hero Banner / Showcase
  return [
    {
      id: `node_hero_badge_${Date.now()}`,
      type: 'Badge',
      props: { text: '✨ GENERATED VIA FORGE AI STUDIO', badgeVariant: 'primary' },
      styles: { alignSelf: 'center', marginBottom: '12px' },
    },
    {
      id: `node_hero_h1_${Date.now()}`,
      type: 'Heading',
      props: {
        text: prompt.length > 5 ? prompt.slice(0, 60) : 'Build Modern Frontend Applications',
        headingLevel: 'h1',
        subtext: 'Powered by the structured Forge JSON schema, Google AI Studio integration, and drag-and-drop precision.',
      },
      styles: {
        textAlign: 'center',
        alignSelf: 'center',
        marginBottom: '20px',
      },
    },
    {
      id: `node_hero_btn_group_${Date.now()}`,
      type: 'Container',
      props: { direction: 'row', gap: '12px' },
      styles: { alignSelf: 'center', justifyContent: 'center', marginBottom: '24px' },
      children: [
        {
          id: `node_btn_primary_${Date.now()}`,
          type: 'Button',
          props: { text: 'Explore Studio Workspace', buttonVariant: 'primary' },
          styles: {},
          events: { onClick: { action: 'TOAST', message: 'Welcome to Forge Studio!' } },
        },
        {
          id: `node_btn_secondary_${Date.now()}`,
          type: 'Button',
          props: { text: 'Inspect JSON Schema', buttonVariant: 'outline' },
          styles: {},
          events: { onClick: { action: 'TOAST', message: 'Opening Forge Schema Inspector' } },
        },
      ],
    },
    {
      id: `node_card_info_${Date.now()}`,
      type: 'Card',
      props: {
        text: 'Production-Grade Architecture',
        subtext: 'Every node in Forge follows strict schemas for props, visual styles, and event triggers, guaranteeing reliable compilation across Web and Mobile.',
      },
      styles: {
        width: 'full',
        backgroundColor: '#18181b',
        padding: '20px',
        borderRadius: '12px',
      },
    },
  ];
}
