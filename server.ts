import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth, AuthenticatedRequest } from './src/middleware/auth';
import { encryptSecret, decryptSecret } from './src/lib/crypto-vault';
import { prepareVercelDeploymentFiles, buildVercelDeploymentManifest, toVercelSlug } from './src/utils/vercel-deployer';
import { validate3dAiOutput, sanitize3dHtml } from './src/utils/three-presets';
import type { ExportFramework } from './src/types/editor';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const PUBLISHED_STORE_FILE = path.join(__dirname, '.appforge-published.json');
const VERCEL_VAULT_FILE = path.join(__dirname, '.appforge-vercel-vault.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

interface FlatAiNode {
  id: string;
  parentId: string;
  type: string;
  text?: string;
  subtext?: string;
  label?: string;
  placeholder?: string;
  headingLevel?: string;
  direction?: string;
  imageUrl?: string;
  imageAlt?: string;
  metricLabel?: string;
  metricValue?: string;
  metricTrend?: string;
  brandName?: string;
  ctaLabel?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  padding?: string;
  borderRadius?: string;
  width?: string;
  fontSize?: string;
  textAlign?: string;
  actionType?: string;
  actionTarget?: string;
  actionMessage?: string;
}

interface PublishedRecord {
  id: string;
  appName: string;
  project: unknown;
  updatedAt: string;
}

const memoryPublishedStore = new Map<string, PublishedRecord>();

async function loadPublishedStore(): Promise<void> {
  try {
    const raw = await fs.readFile(PUBLISHED_STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, PublishedRecord>;
    if (parsed && typeof parsed === 'object') {
      Object.entries(parsed).forEach(([id, rec]) => {
        if (rec && rec.project) memoryPublishedStore.set(id, rec);
      });
    }
  } catch {
    // No store file yet
  }
}

async function persistPublishedStore(): Promise<void> {
  try {
    const obj: Record<string, PublishedRecord> = {};
    for (const [id, rec] of memoryPublishedStore.entries()) {
      obj[id] = rec;
    }
    await fs.writeFile(PUBLISHED_STORE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist published projects file:', err);
  }
}

interface EncryptedVercelEntry {
  encryptedToken: string;
  accountName: string;
  teamId?: string;
  updatedAt: string;
}

const memoryVercelVault = new Map<string, EncryptedVercelEntry>();
const oauthStateStore = new Map<string, { uid: string; expiresAt: number }>();
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxPerMin = 45): boolean {
  const now = Date.now();
  const entry = rateLimitBuckets.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= maxPerMin) return false;
  entry.count++;
  return true;
}

async function loadVercelVault(): Promise<void> {
  try {
    const raw = await fs.readFile(VERCEL_VAULT_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, EncryptedVercelEntry>;
    if (parsed && typeof parsed === 'object') {
      for (const [uid, entry] of Object.entries(parsed)) {
        if (entry?.encryptedToken) memoryVercelVault.set(uid, entry);
      }
    }
  } catch {
    // Vault file not created yet
  }
}

async function persistVercelVault(): Promise<void> {
  try {
    const obj: Record<string, EncryptedVercelEntry> = {};
    for (const [uid, entry] of memoryVercelVault.entries()) {
      obj[uid] = entry;
    }
    await fs.writeFile(VERCEL_VAULT_FILE, JSON.stringify(obj, null, 2), { encoding: 'utf-8', mode: 0o600 });
  } catch (err) {
    console.warn('Could not persist Vercel vault:', err);
  }
}

function getUserVercelCredentials(uid: string): { token: string; accountName: string; teamId?: string } | null {
  const entry = memoryVercelVault.get(uid);
  if (!entry?.encryptedToken) return null;
  try {
    const token = decryptSecret(entry.encryptedToken);
    return { token, accountName: entry.accountName, teamId: entry.teamId };
  } catch {
    return null;
  }
}

function getAiClient(byokHeader?: unknown): GoogleGenAI | null {
  const byok = typeof byokHeader === 'string' ? byokHeader.trim() : '';
  const apiKey = byok.length >= 12 ? byok : process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim().length < 8) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const FLAT_NODE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'Unique short node id, e.g. node_1' },
          parentId: { type: Type.STRING, description: 'Use "root" for top-level nodes or the id of a parent Container/Card/Navbar node' },
          type: {
            type: Type.STRING,
            description: 'One of: Container, Navbar, Card, Heading, Text, Button, Input, Textarea, Select, Toggle, Badge, Metric, Image, Table, Divider',
          },
          text: { type: Type.STRING, description: 'Primary text, heading, button label, or card title' },
          subtext: { type: Type.STRING, description: 'Secondary subtitle or description' },
          label: { type: Type.STRING, description: 'Form field or toggle label' },
          placeholder: { type: Type.STRING, description: 'Input placeholder text' },
          headingLevel: { type: Type.STRING, description: 'h1, h2, or h3' },
          direction: { type: Type.STRING, description: 'row or column for Container/Card/Navbar' },
          imageUrl: { type: Type.STRING, description: 'Optional placeholder image URL' },
          imageAlt: { type: Type.STRING, description: 'Accessible alt description for Image' },
          metricLabel: { type: Type.STRING, description: 'KPI metric label' },
          metricValue: { type: Type.STRING, description: 'KPI metric value' },
          metricTrend: { type: Type.STRING, description: 'KPI metric trend string' },
          brandName: { type: Type.STRING, description: 'Brand label for Navbar' },
          ctaLabel: { type: Type.STRING, description: 'CTA button text for Navbar' },
          backgroundColor: { type: Type.STRING, description: 'Hex background color, e.g. #18181b or #2563eb' },
          textColor: { type: Type.STRING, description: 'Hex text color, e.g. #ffffff or #a1a1aa' },
          borderColor: { type: Type.STRING, description: 'Hex border color, e.g. #27272a' },
          padding: { type: Type.STRING, description: 'none, xs, sm, md, lg, or xl' },
          borderRadius: { type: Type.STRING, description: 'none, sm, md, lg, xl, 2xl, or full' },
          width: { type: Type.STRING, description: 'auto, full, half, or third' },
          fontSize: { type: Type.STRING, description: 'xs, sm, base, lg, xl, 2xl, 3xl, or 4xl' },
          textAlign: { type: Type.STRING, description: 'left, center, or right' },
          actionType: { type: Type.STRING, description: 'NONE, NAVIGATE, TOAST, MODAL, or SUBMIT' },
          actionTarget: { type: Type.STRING, description: 'Target page route or name if NAVIGATE' },
          actionMessage: { type: Type.STRING, description: 'Message for TOAST, MODAL, or SUBMIT' },
        },
        required: ['id', 'parentId', 'type'],
      },
    },
  },
  required: ['nodes'],
};

const VALID_TYPES = new Set([
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
]);

function normalizeTypeName(raw: string): string {
  const lower = (raw || '').trim().toLowerCase();
  for (const t of VALID_TYPES) {
    if (t.toLowerCase() === lower) return t;
  }
  return 'Text';
}

function buildTreeFromFlatNodes(flatNodes: FlatAiNode[]): any[] {
  const suffix = Math.random().toString(36).substring(2, 7);
  const idMap = new Map<string, string>();
  flatNodes.forEach((n, idx) => {
    const cleanOrig = (n.id || `node_${idx}`).trim();
    idMap.set(cleanOrig, `ai_${cleanOrig.replace(/[^a-zA-Z0-9_-]/g, '')}_${suffix}_${idx}`);
  });

  const nodeByNewId = new Map<string, any>();
  const orderedNodes: { newId: string; parentNewId: string | null; node: any }[] = [];

  flatNodes.forEach((flat, idx) => {
    const newId = idMap.get((flat.id || `node_${idx}`).trim()) || `ai_node_${suffix}_${idx}`;
    const type = normalizeTypeName(flat.type);

    const props: Record<string, any> = {};
    if (flat.text) props.text = flat.text;
    if (flat.subtext) props.subtext = flat.subtext;
    if (flat.label) props.label = flat.label;
    if (flat.placeholder) props.placeholder = flat.placeholder;
    if (flat.headingLevel) props.headingLevel = flat.headingLevel;
    if (flat.direction) props.direction = flat.direction === 'row' ? 'row' : 'column';
    if (flat.imageUrl) props.imageUrl = flat.imageUrl;
    if (flat.imageAlt) props.imageAlt = flat.imageAlt;
    if (flat.metricLabel) props.metricLabel = flat.metricLabel;
    if (flat.metricValue) props.metricValue = flat.metricValue;
    if (flat.metricTrend) props.metricTrend = flat.metricTrend;
    if (flat.brandName) props.brandName = flat.brandName;
    if (flat.ctaLabel) props.ctaLabel = flat.ctaLabel;

    const styles: Record<string, any> = {};
    if (flat.backgroundColor) styles.backgroundColor = flat.backgroundColor;
    if (flat.textColor) styles.textColor = flat.textColor;
    if (flat.borderColor) styles.borderColor = flat.borderColor;
    if (flat.padding) styles.padding = flat.padding;
    if (flat.borderRadius) styles.borderRadius = flat.borderRadius;
    if (flat.width) styles.width = flat.width;
    if (flat.fontSize) styles.fontSize = flat.fontSize;
    if (flat.textAlign) styles.textAlign = flat.textAlign;

    const forgeNode: any = {
      id: newId,
      type,
      props,
      styles,
    };

    if (flat.actionType && flat.actionType !== 'NONE') {
      forgeNode.events = {
        onClick: {
          action: flat.actionType,
          target: flat.actionTarget,
          message: flat.actionMessage,
        },
      };
    }

    if (type === 'Container' || type === 'Card' || type === 'Navbar') {
      forgeNode.children = [];
    }

    nodeByNewId.set(newId, forgeNode);
    const parentRaw = (flat.parentId || 'root').trim();
    const mappedParent = parentRaw !== 'root' && idMap.has(parentRaw) ? idMap.get(parentRaw)! : null;
    orderedNodes.push({ newId, parentNewId: mappedParent, node: forgeNode });
  });

  const roots: any[] = [];
  for (const item of orderedNodes) {
    if (item.parentNewId && item.parentNewId !== item.newId) {
      const parent = nodeByNewId.get(item.parentNewId);
      if (parent && (parent.type === 'Container' || parent.type === 'Card' || parent.type === 'Navbar')) {
        parent.children = parent.children || [];
        parent.children.push(item.node);
        continue;
      }
    }
    roots.push(item.node);
  }
  return roots;
}

async function startServer() {
  await loadPublishedStore();
  await loadVercelVault();
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const app = express();

  app.use(express.json({ limit: '15mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      aiConfigured: Boolean(getAiClient()),
      publishedCount: memoryPublishedStore.size,
    });
  });

  // 1. Prompt-to-UI (Gemini Structured Outputs)
  app.post('/api/ai/generate-ui', async (req, res) => {
    const { prompt, pages } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ ok: false, error: 'Prompt text is required.' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.json({
        ok: false,
        fallback: true,
        error: 'Gemini server key not active in this environment; using built-in structured synthesizer.',
      });
      return;
    }

    try {
      const pageSummary = Array.isArray(pages)
        ? pages.map((p: any) => `${p.name} (${p.path})`).join(', ')
        : 'Home (/)';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Design a clean, modern, well-spaced UI layout for a dark-mode studio app canvas based on this request:\n"${prompt.trim()}"\n\nExisting pages in project: ${pageSummary}.\n\nRules:\n- Use only Container, Navbar, Card, Heading, Text, Button, Input, Textarea, Select, Toggle, Badge, Metric, Image, Table, Divider.\n- Top-level blocks MUST have parentId: "root".\n- Nested elements inside Container/Card/Navbar use the parent's id as parentId.\n- Use dark studio hex colors (#09090b, #121215, #18181b, #ffffff, #a1a1aa, #2563eb).\n- Keep copy concise, realistic, and helpful.`,
        config: {
          systemInstruction:
            'You are the AppForge UI Architect. Return a flat array of UI nodes matching the schema with valid parentId references.',
          responseMimeType: 'application/json',
          responseSchema: FLAT_NODE_SCHEMA,
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ ok: false, error: 'Gemini returned an empty response.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
        res.status(422).json({ ok: false, error: 'AI output did not contain any valid UI nodes.' });
        return;
      }

      const tree = buildTreeFromFlatNodes(parsed.nodes);
      res.json({ ok: true, mode: 'gemini', nodes: tree });
    } catch (err: any) {
      console.error('Gemini generate-ui error:', err);
      res.status(500).json({
        ok: false,
        fallback: true,
        error: err?.message || 'Gemini UI generation failed.',
      });
    }
  });

  // 2. Multimodal Image-to-UI (Wireframe, Sketch, Screenshot Reconstruction)
  app.post('/api/ai/image-to-ui', async (req, res) => {
    const { base64Data, mimeType, hintPrompt } = req.body || {};
    const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);
    if (!base64Data || typeof base64Data !== 'string' || !allowedTypes.has(mimeType)) {
      res.status(400).json({
        ok: false,
        error: 'Valid PNG, JPEG, or WebP base64 image data is required.',
      });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.json({
        ok: false,
        fallback: true,
        error: 'Gemini server key not active in this environment; using client layout scanner.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: `Analyze this UI wireframe, sketch, or screenshot and reconstruct its visual hierarchy, row/column groupings, headings, text, buttons, inputs, cards, and navigation bar into editable AppForge UI nodes. ${
                hintPrompt ? `Additional context: ${hintPrompt}` : ''
              }\nPreserve visual order from top to bottom. Use direction: "row" for side-by-side columns and direction: "column" for stacked blocks.`,
            },
          ],
        },
        config: {
          systemInstruction:
            'You are a UI reverse-engineering computer vision architect. Output structured flat nodes matching the schema with accurate parentId hierarchy.',
          responseMimeType: 'application/json',
          responseSchema: FLAT_NODE_SCHEMA,
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ ok: false, error: 'Gemini Vision returned an empty response.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      if (!parsed || !Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
        res.status(422).json({ ok: false, error: 'Could not extract UI nodes from image.' });
        return;
      }

      const tree = buildTreeFromFlatNodes(parsed.nodes);
      res.json({ ok: true, mode: 'gemini', nodes: tree });
    } catch (err: any) {
      console.error('Gemini image-to-ui error:', err);
      res.status(500).json({
        ok: false,
        fallback: true,
        error: err?.message || 'Gemini multimodal wireframe reconstruction failed.',
      });
    }
  });

  // 3. Contextual Selected-Element AI Assistant
  app.post('/api/ai/edit-element', async (req, res) => {
    const { element, instruction } = req.body || {};
    if (!element || !instruction || typeof instruction !== 'string') {
      res.status(400).json({ ok: false, error: 'Selected element and instruction are required.' });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.json({
        ok: false,
        fallback: true,
        error: 'Using deterministic element refiner.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Update the following UI element JSON according to this instruction: "${instruction.trim()}"\n\nCurrent element:\n${JSON.stringify(
          {
            type: element.type,
            name: element.name,
            props: element.props,
            styles: element.styles,
          },
          null,
          2
        )}`,
        config: {
          systemInstruction:
            'Return improved props and style overrides (using hex colors like #2563eb or #ffffff, and borderRadius tokens like lg/xl) for the selected UI element. Apply requested accent colors, contrast upgrades, or copy improvements directly.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              text: { type: Type.STRING },
              subtext: { type: Type.STRING },
              label: { type: Type.STRING },
              placeholder: { type: Type.STRING },
              backgroundColor: { type: Type.STRING },
              textColor: { type: Type.STRING },
              borderColor: { type: Type.STRING },
              padding: { type: Type.STRING },
              borderRadius: { type: Type.STRING },
              fontSize: { type: Type.STRING },
              fontWeight: { type: Type.STRING },
              textAlign: { type: Type.STRING },
            },
            required: ['name'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      const patch = JSON.parse(rawText || '{}');
      res.json({ ok: true, mode: 'gemini', patch });
    } catch (err: any) {
      res.status(500).json({
        ok: false,
        fallback: true,
        error: err?.message || 'Element edit failed.',
      });
    }
  });

  // 4. Smart Data / Logic Wiring Assistant (CR-AI-06)
  app.post('/api/ai/wire-data', async (req, res) => {
    const { prompt, collections, pages } = req.body || {};
    const ai = getAiClient();
    if (!ai) {
      res.json({
        ok: false,
        fallback: true,
        error: 'Using built-in smart data/logic wiring.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Suggest a smart wiring configuration for prompt "${prompt || 'Connect form to collection'}".\nCollections: ${JSON.stringify(
          (collections || []).map((c: any) => ({ id: c.id, name: c.name, fields: c.fields }))
        )}\nPages: ${JSON.stringify((pages || []).map((p: any) => ({ id: p.id, name: p.name, path: p.path })))}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              targetCollectionId: { type: Type.STRING },
              targetPageId: { type: Type.STRING },
              toastMessage: { type: Type.STRING },
            },
            required: ['summary', 'toastMessage'],
          },
        },
      });
      const data = JSON.parse((response.text ?? '{}').trim());
      res.json({ ok: true, mode: 'gemini', wiring: data });
    } catch (err: any) {
      res.status(500).json({ ok: false, fallback: true, error: err?.message || 'Smart wiring failed' });
    }
  });

  // 5. Publish & Fetch Public Project Snapshots (CR-OUT-07, CR-OUT-08)
  app.post('/api/projects/publish', async (req, res) => {
    const { project } = req.body || {};
    if (!project || typeof project !== 'object' || !Array.isArray(project.pages)) {
      res.status(400).json({ ok: false, error: 'Valid project snapshot with pages is required.' });
      return;
    }

    const safeId = (project.id || `pub_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
    const record: PublishedRecord = {
      id: safeId,
      appName: String(project.name || 'Untitled AppForge App'),
      project,
      updatedAt: new Date().toISOString(),
    };
    memoryPublishedStore.set(safeId, record);
    await persistPublishedStore();

    res.json({
      ok: true,
      id: safeId,
      updatedAt: record.updatedAt,
    });
  });

  app.get('/api/projects/published/:id', async (req, res) => {
    const safeId = (req.params.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const found = memoryPublishedStore.get(safeId);
    if (!found) {
      res.status(404).json({ ok: false, error: 'Published project not found.' });
      return;
    }
    res.json({ ok: true, id: found.id, project: found.project, updatedAt: found.updatedAt });
  });

  // 6. Data Deletion & Email Unsubscribe Compliance Endpoints
  app.delete('/api/projects/published/:id', async (req, res) => {
    const safeId = (req.params.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const existed = memoryPublishedStore.delete(safeId);
    if (existed) {
      await persistPublishedStore();
    }
    res.json({
      ok: true,
      id: safeId,
      deleted: existed,
      processedAt: new Date().toISOString(),
    });
  });

  app.post('/api/compliance/request', async (req, res) => {
    const { type, email, projectId } = req.body || {};
    if (type !== 'data_deletion' && type !== 'unsubscribe') {
      res.status(400).json({ ok: false, error: 'Invalid compliance request type.' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ ok: false, error: 'A valid email address is required.' });
      return;
    }
    if (type === 'data_deletion' && projectId && typeof projectId === 'string') {
      const safeId = projectId.replace(/[^a-zA-Z0-9_-]/g, '');
      if (memoryPublishedStore.delete(safeId)) {
        await persistPublishedStore();
      }
    }
    const receiptId = `CMP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    res.json({
      ok: true,
      type,
      receiptId,
      processedAt: new Date().toISOString(),
    });
  });

  // 7. AI 3D UI Generator (Prompt -> Validated Isolated 3D Snippet, optional BYOK header)
  app.post('/api/ai/generate-3d', async (req, res) => {
    const { prompt, accentColor } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ ok: false, error: 'Prompt text is required to generate a 3D widget.' });
      return;
    }

    const ai = getAiClient(req.headers['x-gemini-api-key']);
    if (!ai) {
      res.json({
        ok: false,
        fallback: true,
        error: 'Gemini API key not configured; using built-in procedural 3D synthesizer.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate a self-contained interactive 3D UI component for "${prompt.trim()}". Accent color: ${accentColor || '#38bdf8'}.
Rules:
- Return clean HTML/CSS/JS that runs inside an isolated iframe viewport (100% width/height).
- Do NOT fetch external URLs, scripts, fonts, or .glb/.gltf models. Use CSS 3D transforms (perspective, transform-style: preserve-3d) or self-contained Canvas 2D/WebGL procedural geometry.
- Keep HTML clean without <script> tags (put any animation/pointer tilt logic inside jsSnippet).`,
        config: {
          systemInstruction: 'Return strict JSON matching the schema with safe, self-contained HTML/CSS/JS for an interactive 3D UI card or showcase.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              presetMode: { type: Type.STRING, description: 'css-3d or threejs-webgl' },
              htmlSnippet: { type: Type.STRING },
              cssSnippet: { type: Type.STRING },
              jsSnippet: { type: Type.STRING },
            },
            required: ['title', 'presetMode', 'htmlSnippet', 'cssSnippet'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const validated = validate3dAiOutput(parsed);
      if (!validated.valid || !validated.data) {
        res.status(422).json({ ok: false, fallback: true, error: validated.error || 'Invalid 3D AI output.' });
        return;
      }
      res.json({ ok: true, mode: 'gemini', widget: validated.data });
    } catch (err: any) {
      res.status(500).json({ ok: false, fallback: true, error: err?.message || 'AI 3D generation failed.' });
    }
  });

  // 8. 1-Click AI Copy Rewrite (Punchy, Professional, Friendly)
  app.post('/api/ai/rewrite-copy', async (req, res) => {
    const { text, tone } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ ok: false, error: 'Text to rewrite is required.' });
      return;
    }
    const safeTone = tone === 'punchy' || tone === 'friendly' ? tone : 'professional';
    const ai = getAiClient(req.headers['x-gemini-api-key']);
    if (!ai) {
      res.json({ ok: false, fallback: true, error: 'Using local copy polisher.' });
      return;
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Rewrite the following UI copy in a "${safeTone}" tone while keeping it concise and honest (no fake claims or hype):\n"${text.trim()}"`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              rewritten: { type: Type.STRING },
            },
            required: ['rewritten'],
          },
        },
      });
      const parsed = JSON.parse((response.text ?? '{}').trim());
      if (!parsed?.rewritten) {
        res.json({ ok: false, fallback: true, error: 'Empty rewrite returned.' });
        return;
      }
      res.json({ ok: true, mode: 'gemini', rewritten: String(parsed.rewritten).trim() });
    } catch (err: any) {
      res.status(500).json({ ok: false, fallback: true, error: err?.message || 'Copy rewrite failed.' });
    }
  });

  // 9. Cloud Media Asset Upload (Auth-Protected, <= 2MB PNG/JPEG/WebP/SVG)
  app.post('/api/assets/upload', requireAuth, async (req: AuthenticatedRequest, res) => {
    const uid = req.authUser!.uid;
    if (!checkRateLimit(`upload:${uid}`, 30)) {
      res.status(429).json({ ok: false, error: 'Upload rate limit reached. Please wait a minute.' });
      return;
    }
    const { filename, mimeType, base64Data, projectId } = req.body || {};
    const allowedMimes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
    if (!mimeType || !allowedMimes.has(mimeType)) {
      res.status(400).json({ ok: false, error: 'Only PNG, JPEG, WebP, and SVG files are allowed.' });
      return;
    }
    if (!base64Data || typeof base64Data !== 'string') {
      res.status(400).json({ ok: false, error: 'Missing file base64 content.' });
      return;
    }
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    let buffer = Buffer.from(cleanBase64, 'base64');
    if (buffer.byteLength === 0 || buffer.byteLength > 2 * 1024 * 1024) {
      res.status(400).json({ ok: false, error: 'Image must be between 1 byte and 2MB.' });
      return;
    }
    if (mimeType === 'image/svg+xml') {
      const sanitizedSvg = sanitize3dHtml(buffer.toString('utf-8'));
      buffer = Buffer.from(sanitizedSvg, 'utf-8');
    }

    const extMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
    };
    const stem = String(filename || 'asset')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .slice(0, 48) || 'asset';
    const assetId = `asset_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    const storedName = `${stem}-${assetId}${extMap[mimeType]}`;
    const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '_');
    const userDir = path.join(UPLOADS_DIR, safeUid);
    await fs.mkdir(userDir, { recursive: true });
    await fs.writeFile(path.join(userDir, storedName), buffer);

    res.json({
      ok: true,
      asset: {
        id: assetId,
        projectId: String(projectId || 'default'),
        filename: storedName,
        mimeType,
        sizeBytes: buffer.byteLength,
        url: `/uploads/${safeUid}/${storedName}`,
        createdAt: new Date().toISOString(),
      },
    });
  });

  // 10. Vercel Own-Account Connection, OAuth, Deployment, Polling & Custom Domains
  app.get('/api/vercel/connection', requireAuth, (req: AuthenticatedRequest, res) => {
    const uid = req.authUser!.uid;
    const creds = getUserVercelCredentials(uid);
    res.json({
      ok: true,
      connected: Boolean(creds),
      accountName: creds?.accountName || null,
      teamId: creds?.teamId || null,
      oauthEnabled: Boolean(process.env.VERCEL_CLIENT_ID && process.env.VERCEL_CLIENT_SECRET),
    });
  });

  app.post('/api/vercel/connection', requireAuth, async (req: AuthenticatedRequest, res) => {
    const uid = req.authUser!.uid;
    if (!checkRateLimit(`vercel-conn:${uid}`, 20)) {
      res.status(429).json({ ok: false, error: 'Too many connection attempts. Try again shortly.' });
      return;
    }
    const { accessToken, teamId } = req.body || {};
    const token = typeof accessToken === 'string' ? accessToken.trim() : '';
    if (!token || token.length < 12) {
      res.status(400).json({ ok: false, error: 'A valid Vercel Personal Access Token is required.' });
      return;
    }

    try {
      const userResp = await fetch('https://api.vercel.com/v2/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!userResp.ok) {
        const errBody = await userResp.json().catch(() => ({}));
        res.status(401).json({
          ok: false,
          error: (errBody as any)?.error?.message || 'Vercel rejected this access token.',
        });
        return;
      }
      const userJson = (await userResp.json()) as { user?: { username?: string; email?: string; name?: string } };
      const accountName = userJson.user?.username || userJson.user?.name || userJson.user?.email || 'Vercel Account';

      memoryVercelVault.set(uid, {
        encryptedToken: encryptSecret(token),
        accountName,
        teamId: typeof teamId === 'string' && teamId.trim() ? teamId.trim() : undefined,
        updatedAt: new Date().toISOString(),
      });
      await persistVercelVault();

      res.json({
        ok: true,
        connected: true,
        accountName,
        teamId: memoryVercelVault.get(uid)?.teamId || null,
      });
    } catch (err: any) {
      res.status(502).json({ ok: false, error: err?.message || 'Unable to verify Vercel credentials.' });
    }
  });

  app.delete('/api/vercel/connection', requireAuth, async (req: AuthenticatedRequest, res) => {
    const uid = req.authUser!.uid;
    memoryVercelVault.delete(uid);
    await persistVercelVault();
    res.json({ ok: true, connected: false });
  });

  app.get('/api/vercel/oauth/url', requireAuth, (req: AuthenticatedRequest, res) => {
    const clientId = process.env.VERCEL_CLIENT_ID?.trim();
    if (!clientId || !process.env.VERCEL_CLIENT_SECRET?.trim()) {
      res.status(400).json({
        ok: false,
        oauthEnabled: false,
        error: 'Vercel OAuth App is not configured in environment. Connect securely using your Vercel Personal Access Token instead.',
      });
      return;
    }
    const state = crypto.randomBytes(24).toString('hex');
    oauthStateStore.set(state, { uid: req.authUser!.uid, expiresAt: Date.now() + 10 * 60_000 });
    const appOrigin = process.env.APP_URL?.trim() || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${appOrigin.replace(/\/$/, '')}/api/vercel/oauth/callback`;
    const url = `https://vercel.com/oauth/authorize?client_id=${encodeURIComponent(clientId)}&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    res.cookie?.('af_vercel_oauth_state', state, { httpOnly: true, sameSite: 'lax', maxAge: 600_000 });
    res.json({ ok: true, oauthEnabled: true, url });
  });

  app.get('/api/vercel/oauth/callback', async (req, res) => {
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    const stateRecord = oauthStateStore.get(state);
    oauthStateStore.delete(state);

    if (!code || !stateRecord || stateRecord.expiresAt < Date.now()) {
      res.status(400).send('<html><body style="font-family:sans-serif;background:#09090b;color:#fff;padding:24px"><h2>Invalid or expired Vercel OAuth state</h2></body></html>');
      return;
    }

    try {
      const appOrigin = process.env.APP_URL?.trim() || `${req.protocol}://${req.get('host')}`;
      const redirectUri = `${appOrigin.replace(/\/$/, '')}/api/vercel/oauth/callback`;
      const bodyParams = new URLSearchParams({
        client_id: process.env.VERCEL_CLIENT_ID || '',
        client_secret: process.env.VERCEL_CLIENT_SECRET || '',
        code,
        redirect_uri: redirectUri,
      });

      const tokenResp = await fetch('https://api.vercel.com/v2/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyParams.toString(),
      });
      const tokenJson = (await tokenResp.json()) as { access_token?: string; team_id?: string };
      if (!tokenResp.ok || !tokenJson.access_token) {
        res.status(400).send('<html><body style="font-family:sans-serif;background:#09090b;color:#fff;padding:24px"><h2>Vercel OAuth exchange failed</h2></body></html>');
        return;
      }

      const userResp = await fetch('https://api.vercel.com/v2/user', {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      });
      const userJson = (await userResp.json().catch(() => ({}))) as { user?: { username?: string; email?: string } };
      const accountName = userJson.user?.username || userJson.user?.email || 'Vercel Account';

      memoryVercelVault.set(stateRecord.uid, {
        encryptedToken: encryptSecret(tokenJson.access_token),
        accountName,
        teamId: tokenJson.team_id || undefined,
        updatedAt: new Date().toISOString(),
      });
      await persistVercelVault();

      res.send(`<!DOCTYPE html><html><body style="font-family:sans-serif;background:#09090b;color:#fff;padding:24px">
        <p>Vercel account connected. You can close this window.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'AF_VERCEL_OAUTH_OK', accountName: ${JSON.stringify(accountName)} }, window.location.origin);
          }
          window.close();
        </script>
      </body></html>`);
    } catch {
      res.status(500).send('<html><body style="font-family:sans-serif;background:#09090b;color:#fff;padding:24px"><h2>OAuth connection error</h2></body></html>');
    }
  });

  app.get('/api/vercel/projects', requireAuth, async (req: AuthenticatedRequest, res) => {
    const creds = getUserVercelCredentials(req.authUser!.uid);
    if (!creds) {
      res.status(400).json({ ok: false, error: 'Vercel account is not connected.' });
      return;
    }
    try {
      const teamQuery = creds.teamId ? `?teamId=${encodeURIComponent(creds.teamId)}&limit=20` : '?limit=20';
      const resp = await fetch(`https://api.vercel.com/v9/projects${teamQuery}`, {
        headers: { Authorization: `Bearer ${creds.token}` },
      });
      const json = (await resp.json()) as { projects?: Array<{ id: string; name: string; framework?: string }> };
      if (!resp.ok) {
        res.status(resp.status).json({ ok: false, error: 'Failed to load Vercel projects.' });
        return;
      }
      res.json({
        ok: true,
        projects: (json.projects || []).map((p) => ({ id: p.id, name: p.name, framework: p.framework || null })),
      });
    } catch (err: any) {
      res.status(502).json({ ok: false, error: err?.message || 'Could not list Vercel projects.' });
    }
  });

  app.post('/api/vercel/deploy', requireAuth, async (req: AuthenticatedRequest, res) => {
    const uid = req.authUser!.uid;
    if (!checkRateLimit(`vercel-deploy:${uid}`, 12)) {
      res.status(429).json({ ok: false, error: 'Deploy rate limit exceeded. Please wait a minute.' });
      return;
    }
    const creds = getUserVercelCredentials(uid);
    if (!creds) {
      res.status(400).json({ ok: false, error: 'Connect your Vercel account first.' });
      return;
    }

    const { project, framework, vercelProjectName, target } = req.body || {};
    if (!project || !Array.isArray(project.pages)) {
      res.status(400).json({ ok: false, error: 'Valid AppForge project is required.' });
      return;
    }
    const safeFramework: ExportFramework =
      framework === 'react-vite' || framework === 'nextjs' || framework === 'vue' ? framework : 'html';

    try {
      const prepared = await prepareVercelDeploymentFiles(project, safeFramework);
      const teamQuery = creds.teamId ? `?teamId=${encodeURIComponent(creds.teamId)}` : '';

      // Upload each file blob to Vercel /v2/files
      for (const fileEntry of prepared.files) {
        const buf = Buffer.from(fileEntry.data, 'utf-8');
        const uploadResp = await fetch(`https://api.vercel.com/v2/files${teamQuery}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${creds.token}`,
            'Content-Type': 'application/octet-stream',
            'x-vercel-digest': fileEntry.sha1,
            'Content-Length': String(buf.byteLength),
          },
          body: buf,
        });
        if (!uploadResp.ok && uploadResp.status !== 409) {
          const errData = await uploadResp.json().catch(() => ({}));
          res.status(uploadResp.status).json({
            ok: false,
            error: (errData as any)?.error?.message || `Failed uploading file ${fileEntry.file} to Vercel.`,
          });
          return;
        }
      }

      const deploySlug = toVercelSlug(vercelProjectName || project.name || 'appforge-site');
      const manifest = buildVercelDeploymentManifest({
        projectName: deploySlug,
        framework: safeFramework,
        files: prepared.files,
        target: target === 'preview' ? 'preview' : 'production',
      });

      const deployResp = await fetch(`https://api.vercel.com/v13/deployments${teamQuery}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manifest),
      });

      const deployJson = (await deployResp.json()) as any;
      if (!deployResp.ok) {
        res.status(deployResp.status).json({
          ok: false,
          error: deployJson?.error?.message || 'Vercel deployment creation failed.',
        });
        return;
      }

      const liveUrl = deployJson.url ? `https://${deployJson.url}` : '';
      res.json({
        ok: true,
        deploymentId: deployJson.id,
        url: liveUrl,
        state: deployJson.readyState || deployJson.status || 'QUEUED',
        projectId: deployJson.projectId || deploySlug,
        projectName: deploySlug,
        inspectorUrl: deployJson.inspectorUrl || '',
      });
    } catch (err: any) {
      res.status(502).json({ ok: false, error: err?.message || 'Deployment failed.' });
    }
  });

  app.get('/api/vercel/deployments/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    const creds = getUserVercelCredentials(req.authUser!.uid);
    if (!creds) {
      res.status(400).json({ ok: false, error: 'Vercel account is not connected.' });
      return;
    }
    const deployId = (req.params.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    try {
      const teamQuery = creds.teamId ? `?teamId=${encodeURIComponent(creds.teamId)}` : '';
      const resp = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(deployId)}${teamQuery}`, {
        headers: { Authorization: `Bearer ${creds.token}` },
      });
      const data = (await resp.json()) as any;
      if (!resp.ok) {
        res.status(resp.status).json({ ok: false, error: data?.error?.message || 'Failed to poll deployment.' });
        return;
      }
      res.json({
        ok: true,
        id: data.id,
        state: data.readyState || data.status || 'QUEUED',
        url: data.url ? `https://${data.url}` : '',
        inspectorUrl: data.inspectorUrl || '',
      });
    } catch (err: any) {
      res.status(502).json({ ok: false, error: err?.message || 'Failed polling Vercel deployment.' });
    }
  });

  app.post('/api/vercel/domains', requireAuth, async (req: AuthenticatedRequest, res) => {
    const creds = getUserVercelCredentials(req.authUser!.uid);
    if (!creds) {
      res.status(400).json({ ok: false, error: 'Vercel account is not connected.' });
      return;
    }
    const { vercelProjectId, domain } = req.body || {};
    const cleanDomain = String(domain || '').trim().toLowerCase();
    if (!vercelProjectId || !cleanDomain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(cleanDomain)) {
      res.status(400).json({ ok: false, error: 'Valid Vercel project and domain name (e.g. app.example.com) required.' });
      return;
    }

    try {
      const teamQuery = creds.teamId ? `?teamId=${encodeURIComponent(creds.teamId)}` : '';
      const addResp = await fetch(
        `https://api.vercel.com/v10/projects/${encodeURIComponent(vercelProjectId)}/domains${teamQuery}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${creds.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: cleanDomain }),
        }
      );
      const addJson = (await addResp.json()) as any;
      if (!addResp.ok && addJson?.error?.code !== 'domain_already_exists') {
        res.status(addResp.status).json({ ok: false, error: addJson?.error?.message || 'Failed adding domain.' });
        return;
      }

      const cfgResp = await fetch(
        `https://api.vercel.com/v6/domains/${encodeURIComponent(cleanDomain)}/config${teamQuery}`,
        { headers: { Authorization: `Bearer ${creds.token}` } }
      );
      const cfgJson = (await cfgResp.json().catch(() => ({}))) as any;

      res.json({
        ok: true,
        domain: cleanDomain,
        verified: Boolean(addJson.verified) && !cfgJson.misconfigured,
        misconfigured: Boolean(cfgJson.misconfigured),
        verification: addJson.verification || [],
        recommendedDns: {
          apexA: '76.76.21.21',
          cname: 'cname.vercel-dns.com',
        },
      });
    } catch (err: any) {
      res.status(502).json({ ok: false, error: err?.message || 'Domain attachment failed.' });
    }
  });

  app.get('/api/vercel/domains/:domain/verify', requireAuth, async (req: AuthenticatedRequest, res) => {
    const creds = getUserVercelCredentials(req.authUser!.uid);
    if (!creds) {
      res.status(400).json({ ok: false, error: 'Vercel account is not connected.' });
      return;
    }
    const domain = String(req.params.domain || '').trim().toLowerCase();
    const projectId = String(req.query.projectId || '').trim();
    if (!domain || !projectId) {
      res.status(400).json({ ok: false, error: 'projectId and domain are required.' });
      return;
    }
    try {
      const teamQuery = creds.teamId ? `?teamId=${encodeURIComponent(creds.teamId)}` : '';
      const verifyResp = await fetch(
        `https://api.vercel.com/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}/verify${teamQuery}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${creds.token}` },
        }
      );
      const verifyJson = (await verifyResp.json()) as any;
      const cfgResp = await fetch(
        `https://api.vercel.com/v6/domains/${encodeURIComponent(domain)}/config${teamQuery}`,
        { headers: { Authorization: `Bearer ${creds.token}` } }
      );
      const cfgJson = (await cfgResp.json().catch(() => ({}))) as any;

      res.json({
        ok: true,
        domain,
        verified: Boolean(verifyJson.verified) && !cfgJson.misconfigured,
        misconfigured: Boolean(cfgJson.misconfigured),
        verification: verifyJson.verification || [],
      });
    } catch (err: any) {
      res.status(502).json({ ok: false, error: err?.message || 'Verification failed.' });
    }
  });

  // Vite dev middleware or static production serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AppForge server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AppForge server:', err);
  process.exit(1);
});
