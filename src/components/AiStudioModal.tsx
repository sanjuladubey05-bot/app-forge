/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  Sparkles,
  X,
  Code2,
  Copy,
  Check,
  ArrowRight,
  FileJson,
  Download,
  Upload,
  Layers,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import { Project } from '../types/editor';
import {
  ForgeNode,
  ForgeProject,
  FORGE_JSON_SCHEMA_DEFINITION,
  AI_PROMPT_PRESETS,
  generateForgeNodesFromPrompt,
  projectToForgeJson,
  remapForgeNodeIds,
  validateForgeNodes,
} from '../utils/forge-schema';
import { runDualModeImageToUi, validateWireframeFile } from '../utils/wireframe-parser';

interface AiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onInsertAiNodes: (
    nodes: ForgeNode[],
    targetMode: 'append' | 'replace' | 'new-page',
    newPageTitle?: string
  ) => void;
  onImportForgeProject: (forgeProject: ForgeProject) => void;
  onOpenAi3DModal?: () => void;
}

export const AiStudioModal: React.FC<AiStudioModalProps> = ({
  isOpen,
  onClose,
  project,
  onInsertAiNodes,
  onImportForgeProject,
  onOpenAi3DModal,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'image' | 'schema' | 'json'>('prompt');

  // Prompt-to-UI state
  const [prompt, setPrompt] = useState(
    'Create a modern SaaS Pricing comparison grid with Starter, Pro, and Enterprise cards and CTA buttons'
  );
  const [include3dHero, setInclude3dHero] = useState(false);
  const [targetMode, setTargetMode] = useState<'append' | 'replace' | 'new-page'>('append');
  const [newPageName, setNewPageName] = useState('AI Screen');
  const [generatedNodes, setGeneratedNodes] = useState<ForgeNode[]>(() =>
    remapForgeNodeIds(generateForgeNodesFromPrompt('pricing grid'))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Image-to-UI state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedMimeType, setUploadedMimeType] = useState<string>('image/png');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [imageHintPrompt, setImageHintPrompt] = useState<string>('');
  const [refineWithAi, setRefineWithAi] = useState<boolean>(true);
  const [isScanningImage, setIsScanningImage] = useState<boolean>(false);
  const [imageStatus, setImageStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [imageNodes, setImageNodes] = useState<ForgeNode[]>([]);

  // Schema & JSON Hub state
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(projectToForgeJson(project), null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setGenerationStatus({ type: 'error', message: 'Please enter a prompt describing what to build.' });
      return;
    }

    setIsGenerating(true);
    setGenerationStatus(null);

    try {
      const response = await fetch('/api/ai/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          pages: project.pages.map((p) => ({ id: p.id, name: p.name, path: p.path })),
        }),
      });
      const payload = await response.json();

      if (response.ok && payload?.ok && Array.isArray(payload.nodes)) {
        const check = validateForgeNodes(payload.nodes);
        if (!check.valid) {
          throw new Error(check.error || 'Invalid AI tree structure.');
        }
        const rawNodes = remapForgeNodeIds(check.nodes);
        if (include3dHero && !rawNodes.some((n) => n.type === 'widget3d')) {
          rawNodes.splice(Math.min(1, rawNodes.length), 0, {
            id: `node_3d_${Date.now().toString(36)}`,
            type: 'widget3d',
            props: {
              widget3d: {
                presetId: 'webgl-orbital-prism',
                presetMode: 'threejs-webgl',
                title: 'Interactive 3D Hero Block',
                subtitle: 'Drag to orbit · Generated with AppForge AI',
                accentColor: project.themeTokens?.primaryColor || '#38bdf8',
                heightPx: 300,
                autoRotate: true,
                interactiveTilt: true,
              },
            },
            styles: {},
          });
        }
        setGeneratedNodes(rawNodes);
        setGenerationStatus({
          type: 'success',
          message: 'Gemini Structured Outputs synthesized schema-compliant UI tree.',
        });
        return;
      }

      // Deterministic local structured synthesizer fallback
      const localNodes = remapForgeNodeIds(generateForgeNodesFromPrompt(trimmed));
      if (include3dHero && !localNodes.some((n) => n.type === 'widget3d')) {
        localNodes.splice(Math.min(1, localNodes.length), 0, {
          id: `node_3d_${Date.now().toString(36)}`,
          type: 'widget3d',
          props: {
            widget3d: {
              presetId: 'webgl-orbital-prism',
              presetMode: 'threejs-webgl',
              title: 'Interactive 3D Hero Block',
              subtitle: 'Drag to orbit · Procedural WebGL showcase',
              accentColor: project.themeTokens?.primaryColor || '#38bdf8',
              heightPx: 300,
              autoRotate: true,
              interactiveTilt: true,
            },
          },
          styles: {},
        });
      }
      setGeneratedNodes(localNodes);
      setGenerationStatus({
        type: 'success',
        message: payload?.error || 'Synthesized schema-compliant UI tree cleanly.',
      });
    } catch (err: any) {
      const localNodes = remapForgeNodeIds(generateForgeNodesFromPrompt(trimmed));
      setGeneratedNodes(localNodes);
      setGenerationStatus({
        type: 'success',
        message: err?.message
          ? `Used built-in structured synthesizer (${err.message})`
          : 'Built-in structured synthesizer generated editable UI tree.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = (file: File | undefined | null) => {
    if (!file) return;
    const validation = validateWireframeFile({ type: file.type, size: file.size, name: file.name });
    if (!validation.valid) {
      setImageStatus({ type: 'error', message: validation.error || 'Unsupported file.' });
      return;
    }

    setImageStatus(null);
    setUploadedFileName(file.name);
    setUploadedMimeType(file.type);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || '');
      setUploadedPreviewUrl(dataUrl);
      await handleRunImageReconstruction(dataUrl, file.type);
    };
    reader.onerror = () => {
      setImageStatus({ type: 'error', message: 'Failed to read selected image file.' });
    };
    reader.readAsDataURL(file);
  };

  const handleRunImageReconstruction = async (
    overrideUrl?: string,
    overrideMime?: string
  ) => {
    const dataUrl = overrideUrl || uploadedPreviewUrl;
    const mimeType = overrideMime || uploadedMimeType;
    if (!dataUrl) {
      setImageStatus({ type: 'error', message: 'Upload a PNG, JPEG, or WebP wireframe first.' });
      return;
    }

    setIsScanningImage(true);
    setImageStatus(null);
    try {
      const result = await runDualModeImageToUi({
        dataUrl,
        mimeType,
        hintPrompt: imageHintPrompt,
        refineWithAi,
      });
      setImageNodes(result.nodes);
      setImageStatus({
        type: 'success',
        message: result.note || 'Layout reconstructed into editable AppForge nodes.',
      });
    } catch (err: any) {
      setImageStatus({
        type: 'error',
        message: err?.message || 'Wireframe reconstruction failed.',
      });
    } finally {
      setIsScanningImage(false);
    }
  };

  const handleInsertPromptNodes = () => {
    if (!generatedNodes || generatedNodes.length === 0) return;
    onInsertAiNodes(generatedNodes, targetMode, newPageName);
    onClose();
  };

  const handleInsertImageNodes = () => {
    if (!imageNodes || imageNodes.length === 0) return;
    onInsertAiNodes(imageNodes, targetMode, newPageName);
    onClose();
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(FORGE_JSON_SCHEMA_DEFINITION, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-forge-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyJsonImport = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.pages || !Array.isArray(parsed.pages)) {
        throw new Error('Invalid Forge Schema: Root object must have a "pages" array.');
      }
      onImportForgeProject(parsed as ForgeProject);
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setJsonError(err.message || 'Failed to parse Forge JSON format');
    }
  };

  const countTotalNodes = (nodes: ForgeNode[]): number => {
    let count = 0;
    const walk = (items: ForgeNode[]) => {
      for (const it of items) {
        count++;
        if (it.children && it.children.length > 0) walk(it.children);
      }
    };
    walk(nodes);
    return count;
  };

  const renderPlacementControls = () => (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-400 font-medium">Target:</span>
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            type="button"
            onClick={() => setTargetMode('append')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              targetMode === 'append' ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            data-testid="target-mode-append"
          >
            Append to Page
          </button>
          <button
            type="button"
            onClick={() => setTargetMode('replace')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              targetMode === 'replace' ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            data-testid="target-mode-replace"
          >
            Replace Page
          </button>
          <button
            type="button"
            onClick={() => setTargetMode('new-page')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              targetMode === 'new-page' ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            data-testid="target-mode-new-page"
          >
            New Page
          </button>
        </div>
      </div>

      {targetMode === 'new-page' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Page Name:</span>
          <input
            type="text"
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="e.g. Analytics"
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 w-32 focus:outline-none focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );

  const renderNodeInspector = (nodes: ForgeNode[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 max-h-60 overflow-y-auto space-y-2">
        <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider mb-1">
          Element Tree Hierarchy
        </div>
        {nodes.map((node, i) => (
          <div key={node.id || i} className="p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-300 flex items-center gap-1.5">
                <Layers size={12} className="text-blue-400" />
                {node.type}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">#{node.id}</span>
            </div>
            {node.props && (
              <div className="text-[11px] text-zinc-400 truncate">
                {node.props.text || node.props.brandName || node.props.label || node.props.headingLevel || JSON.stringify(node.props)}
              </div>
            )}
            {node.children && node.children.length > 0 && (
              <div className="pl-3 border-l border-zinc-800 space-y-1 mt-1">
                {node.children.map((ch, idx) => (
                  <div key={ch.id || idx} className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                    <span className="text-indigo-400">↳ {ch.type}:</span>
                    <span className="text-zinc-300 truncate">{ch.props?.text || ch.props?.label || ch.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 max-h-60 overflow-y-auto font-mono text-[11px] text-emerald-400">
        <pre className="whitespace-pre-wrap">{JSON.stringify(nodes, null, 2)}</pre>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        data-testid="ai-studio-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white tracking-tight">AI Studio Generator</h2>
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono px-2 py-0.5 rounded-full">
                  Structured Outputs v1.0
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Generate pages from text prompts, reconstruct uploaded wireframes, or inspect Forge JSON
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            aria-label="Close AI Studio Modal"
            data-testid="close-ai-studio-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center overflow-x-auto gap-1 px-6 pt-3 border-b border-zinc-800 bg-zinc-900/20 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'prompt'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            data-testid="tab-prompt-generator"
          >
            <Sparkles size={14} />
            <span>Prompt to UI</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'image'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            data-testid="tab-image-to-ui"
          >
            <ImageIcon size={14} />
            <span>Image to UI (Wireframe)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'schema'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            data-testid="tab-forge-schema"
          >
            <Code2 size={14} />
            <span>Forge JSON Schema</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('json');
              setJsonText(JSON.stringify(projectToForgeJson(project), null, 2));
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'json'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
            data-testid="tab-import-export-json"
          >
            <FileJson size={14} />
            <span>Project JSON Hub</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: PROMPT TO UI GENERATOR */}
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="ai-prompt-textarea" className="text-xs font-medium text-zinc-300">
                    Describe what you want to build:
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold transition cursor-pointer disabled:opacity-50"
                    data-testid="generate-ai-nodes-btn"
                  >
                    <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} />
                    <span>{isGenerating ? 'Synthesizing...' : 'Generate UI Tree'}</span>
                  </button>
                </div>
                <textarea
                  id="ai-prompt-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  placeholder="E.g., Create an Analytics Dashboard with 4 KPI metric cards, data table, and CTA button..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition resize-none font-sans"
                  data-testid="ai-prompt-input"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <label className="inline-flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={include3dHero}
                      onChange={(e) => setInclude3dHero(e.target.checked)}
                      className="accent-blue-500 cursor-pointer"
                      data-testid="ai-include-3d-hero-checkbox"
                    />
                    <span>Include Interactive 3D Hero Block</span>
                  </label>
                  {onOpenAi3DModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAi3DModal();
                      }}
                      className="text-[11px] font-medium text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      Open Dedicated 3D Studio →
                    </button>
                  )}
                </div>

                {/* Prompt Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
                    Quick Templates & Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_PROMPT_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPrompt(p.prompt);
                          setGeneratedNodes(remapForgeNodeIds(generateForgeNodesFromPrompt(p.prompt)));
                          setGenerationStatus({
                            type: 'success',
                            message: `Loaded preset "${p.label}". Ready to insert or refine.`,
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                        data-testid={`prompt-preset-${p.id}`}
                      >
                        <Sparkles size={11} className="text-blue-400" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {renderPlacementControls()}

              {generationStatus && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    generationStatus.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-300'
                      : 'bg-red-950/40 border-red-800/70 text-red-300'
                  }`}
                >
                  {generationStatus.type === 'success' ? (
                    <CheckCircle2 size={14} className="shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="shrink-0" />
                  )}
                  <span>{generationStatus.message}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Generated Structured Tree ({countTotalNodes(generatedNodes)} nodes)
                  </span>
                </div>
                {renderNodeInspector(generatedNodes)}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleInsertPromptNodes}
                  disabled={generatedNodes.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  data-testid="insert-ai-nodes-btn"
                >
                  <Sparkles size={14} />
                  <span>Insert Tree into Canvas</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE-TO-UI WIREFRAME RECONSTRUCTION */}
          {activeTab === 'image' && (
            <div className="space-y-4" data-testid="image-to-ui-panel">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files?.[0]);
                }}
                className="border-2 border-dashed border-zinc-800 hover:border-blue-500/60 rounded-2xl p-5 bg-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Upload Wireframe, Sketch, or UI Screenshot
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Accepts PNG, JPEG, or WebP up to 10 MB. Reconstructs instant client layout + Gemini Vision refinement.
                    </p>
                    {uploadedFileName && (
                      <p className="text-[11px] text-blue-400 font-mono mt-1">
                        Loaded: {uploadedFileName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    data-testid="wireframe-file-input"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white border border-zinc-700 cursor-pointer transition"
                    data-testid="choose-wireframe-btn"
                  >
                    Choose Image
                  </button>
                </div>
              </div>

              {/* Preview + Hint Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col items-center justify-center min-h-[140px]">
                  {uploadedPreviewUrl ? (
                    <img
                      src={uploadedPreviewUrl}
                      alt="Uploaded wireframe preview"
                      className="max-h-40 rounded-lg object-contain border border-zinc-800"
                    />
                  ) : (
                    <span className="text-[11px] text-zinc-500 text-center">
                      No image uploaded yet. Upload a wireframe or screenshot above.
                    </span>
                  )}
                </div>

                <div className="md:col-span-2 space-y-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                      Optional Reconstruction Context Hint
                    </label>
                    <input
                      type="text"
                      value={imageHintPrompt}
                      onChange={(e) => setImageHintPrompt(e.target.value)}
                      placeholder="e.g. SaaS dashboard with 3 KPI cards and transaction table..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={refineWithAi}
                        onChange={(e) => setRefineWithAi(e.target.checked)}
                        className="accent-blue-500"
                      />
                      <span>Refine layout with Gemini multimodal AI (falls back to client scanner)</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRunImageReconstruction()}
                      disabled={!uploadedPreviewUrl || isScanningImage}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      data-testid="reconstruct-wireframe-btn"
                    >
                      <Wand2 size={13} className={isScanningImage ? 'animate-spin' : ''} />
                      <span>{isScanningImage ? 'Analyzing Layout...' : 'Reconstruct Layout'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {imageStatus && (
                <div
                  className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                    imageStatus.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800/70 text-emerald-300'
                      : 'bg-red-950/40 border-red-800/70 text-red-300'
                  }`}
                >
                  {imageStatus.type === 'success' ? (
                    <CheckCircle2 size={14} className="shrink-0" />
                  ) : (
                    <AlertCircle size={14} className="shrink-0" />
                  )}
                  <span>{imageStatus.message}</span>
                </div>
              )}

              {renderPlacementControls()}

              {imageNodes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Reconstructed Editable Nodes ({countTotalNodes(imageNodes)} nodes)
                  </span>
                  {renderNodeInspector(imageNodes)}
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleInsertImageNodes}
                  disabled={imageNodes.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50"
                  data-testid="insert-image-nodes-btn"
                >
                  <Sparkles size={14} />
                  <span>Insert Reconstructed UI into Canvas</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FORGE JSON SCHEMA INSPECTOR */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                    <Cpu size={14} className="text-blue-400" />
                    Official Draft-07 JSON Schema for Structured Outputs
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition cursor-pointer"
                    data-testid="copy-forge-schema-btn"
                  >
                    {copiedSchema ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedSchema ? 'Copied' : 'Copy Schema'}</span>
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  Defines the canonical 3-layer ForgeProject contract (Project Root → Page Object → Recursive Nodes) shared across Canvas, AI Studio, Preview, and ZIP Exporters.
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-[11px] text-zinc-300 max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{JSON.stringify(FORGE_JSON_SCHEMA_DEFINITION, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT JSON HUB */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white">Full Project Forge JSON</h3>
                  <p className="text-[11px] text-zinc-400">
                    Live bidirectional serializer connecting your drag-and-drop workspace to the production Forge format.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition cursor-pointer"
                    data-testid="copy-project-json-btn"
                  >
                    {copiedJson ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition cursor-pointer"
                    data-testid="download-project-json-btn"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {jsonError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>Forge project parsed and loaded successfully into canvas!</span>
                </div>
              )}

              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setJsonError(null);
                }}
                rows={13}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-blue-500 transition"
                data-testid="project-json-editor-textarea"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-zinc-400">
                  Tip: Edit or paste raw Forge JSON and click Apply to recreate the workspace.
                </div>
                <button
                  type="button"
                  onClick={handleApplyJsonImport}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition cursor-pointer shadow-md shadow-blue-500/20"
                  data-testid="apply-forge-json-import-btn"
                >
                  <Upload size={14} />
                  <span>Validate & Apply to Project</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

