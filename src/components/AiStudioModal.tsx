/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Project } from '../types/editor';
import { 
  ForgeNode, 
  ForgeProject, 
  FORGE_JSON_SCHEMA_DEFINITION, 
  AI_PROMPT_PRESETS, 
  generateForgeNodesFromPrompt,
  projectToForgeJson,
  forgeJsonToProject
} from '../utils/forge-schema';

interface AiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onInsertAiNodes: (nodes: ForgeNode[], targetMode: 'append' | 'new-page', newPageTitle?: string) => void;
  onImportForgeProject: (forgeProject: ForgeProject) => void;
}

export const AiStudioModal: React.FC<AiStudioModalProps> = ({
  isOpen,
  onClose,
  project,
  onInsertAiNodes,
  onImportForgeProject,
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'schema' | 'json'>('prompt');
  
  // Prompt-to-UI state
  const [prompt, setPrompt] = useState('Create a modern SaaS Pricing comparison grid with monthly/annual switch and CTA cards');
  const [targetMode, setTargetMode] = useState<'append' | 'new-page'>('append');
  const [newPageName, setNewPageName] = useState('AI Screen');
  const [generatedNodes, setGeneratedNodes] = useState<ForgeNode[]>(() => generateForgeNodesFromPrompt('pricing grid'));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // Schema state
  const [copiedSchema, setCopiedSchema] = useState(false);

  // JSON Import/Export state
  const [jsonText, setJsonText] = useState(() => JSON.stringify(projectToForgeJson(project), null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationSuccess(false);

    setTimeout(() => {
      const nodes = generateForgeNodesFromPrompt(prompt);
      setGeneratedNodes(nodes);
      setIsGenerating(false);
      setGenerationSuccess(true);
      setTimeout(() => setGenerationSuccess(false), 3000);
    }, 400);
  };

  const handleInsert = () => {
    if (!generatedNodes || generatedNodes.length === 0) return;
    onInsertAiNodes(generatedNodes, targetMode, newPageName);
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
      }, 800);
    } catch (err: any) {
      setJsonError(err.message || 'Failed to parse Forge JSON format');
    }
  };

  const countTotalNodes = (nodes: ForgeNode[]): number => {
    let count = 0;
    const walk = (items: ForgeNode[]) => {
      for (const it of items) {
        count++;
        if (it.children && it.children.length > 0) {
          walk(it.children);
        }
      }
    };
    walk(nodes);
    return count;
  };

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
                <h2 className="text-sm font-semibold text-white tracking-tight">Google AI Studio Generator</h2>
                <span className="text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono px-2 py-0.5 rounded-full">
                  Structured Outputs v1.0
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Single source of truth connecting Canvas, Gemini AI Studio generator, and Live Preview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close AI Studio Modal"
              data-testid="close-ai-studio-btn"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-zinc-800 bg-zinc-900/20">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
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
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
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
            onClick={() => {
              setActiveTab('json');
              setJsonText(JSON.stringify(projectToForgeJson(project), null, 2));
            }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition cursor-pointer ${
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PROMPT TO UI GENERATOR */}
          {activeTab === 'prompt' && (
            <div className="space-y-5">
              {/* Prompt Input Box */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Describe what you want to build:</span>
                  <span className="text-[10px] text-zinc-500">Gemini Structured Tree Generator</span>
                </label>
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    placeholder="E.g., Create an Analytics Dashboard with 3 KPI metric cards, revenue chart table, and filter buttons..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition resize-none font-sans"
                    data-testid="ai-prompt-input"
                  />
                </div>

                {/* Prompt Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">
                    Quick Templates & Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {AI_PROMPT_PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setPrompt(p.prompt);
                          const nodes = generateForgeNodesFromPrompt(p.prompt);
                          setGeneratedNodes(nodes);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
                        data-testid={`prompt-preset-${p.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Sparkles size={11} className="text-blue-400" />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Generation Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 font-medium">Target Placement:</span>
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setTargetMode('append')}
                      className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                        targetMode === 'append' ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      data-testid="target-mode-append"
                    >
                      Add to Current Page
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetMode('new-page')}
                      className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                        targetMode === 'new-page' ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                      data-testid="target-mode-new-page"
                    >
                      New Page Route
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

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition cursor-pointer disabled:opacity-50"
                    data-testid="generate-ai-nodes-btn"
                  >
                    <RefreshCw size={13} className={isGenerating ? 'animate-spin text-blue-400' : 'text-blue-400'} />
                    <span>{isGenerating ? 'Synthesizing...' : 'Re-generate'}</span>
                  </button>
                </div>
              </div>

              {/* Generated Nodes Preview Tree & JSON Inspector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      Generated Structured Tree
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                      {countTotalNodes(generatedNodes)} nodes generated
                    </span>
                  </div>
                  {generationSuccess && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Schema-compliant tree synthesized
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Left: Visual Node Stack */}
                  <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 max-h-64 overflow-y-auto space-y-2">
                    <div className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider mb-1">
                      Element Tree Hierarchy
                    </div>
                    {generatedNodes.map((node, i) => (
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
                            {node.props.text || node.props.label || node.props.headingLevel || JSON.stringify(node.props)}
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

                  {/* Right: Raw Structured JSON */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 max-h-64 overflow-y-auto font-mono text-[11px] text-emerald-400">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(generatedNodes, null, 2)}</pre>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleInsert}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-blue-500/20 active:scale-98"
                  data-testid="insert-ai-nodes-btn"
                >
                  <Sparkles size={14} />
                  <span>Insert Tree into Canvas</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FORGE JSON SCHEMA INSPECTOR */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                    <Cpu size={14} className="text-blue-400" />
                    Official Draft-07 JSON Schema for Google AI Studio Structured Outputs
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
                  Provide this schema to Gemini (Google AI Studio) under `responseSchema` or the system prompt. Gemini will generate valid, clean 3-layer trees (Project Root → Page Object → Recursive Nodes) that AppForge imports directly with zero compilation errors.
                </p>
              </div>

              {/* 3-Layer Explanation Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-mono text-blue-400 font-semibold">Layer 1: Project Root</div>
                  <div className="text-xs text-zinc-200 font-medium">Global Settings & Themes</div>
                  <div className="text-[11px] text-zinc-400">Holds projectId, appName, platform, theme colors, typography, and page routes.</div>
                </div>
                <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-mono text-indigo-400 font-semibold">Layer 2: Page Object</div>
                  <div className="text-xs text-zinc-200 font-medium">Route & Root Container</div>
                  <div className="text-[11px] text-zinc-400">Defines the route path (/home, /profile) and points to a root container node.</div>
                </div>
                <div className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-1">
                  <div className="text-[10px] uppercase font-mono text-cyan-400 font-semibold">Layer 3: Recursive Nodes</div>
                  <div className="text-xs text-zinc-200 font-medium">UI Component Trees</div>
                  <div className="text-[11px] text-zinc-400">Every node has an id, component type, props, styles, events, and children.</div>
                </div>
              </div>

              {/* Schema JSON Viewer */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-[11px] text-zinc-300 max-h-80 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{JSON.stringify(FORGE_JSON_SCHEMA_DEFINITION, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT JSON HUB (IMPORT & EXPORT) */}
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

              <div className="relative">
                <textarea
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setJsonError(null);
                  }}
                  rows={14}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-blue-500 transition"
                  data-testid="project-json-editor-textarea"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-zinc-400">
                  Tip: You can edit or paste raw Forge JSON and click apply to instantly recreate the workspace.
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
