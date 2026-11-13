import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const PUBLISHED_STORE_FILE = path.join(__dirname, '.appforge-published.json');

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

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
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
  const app = express();

  app.use(express.json({ limit: '15mb' }));

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
