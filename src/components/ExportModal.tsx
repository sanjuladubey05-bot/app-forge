import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  FileJson,
  Code,
  Archive,
  FolderTree,
  FileText,
} from 'lucide-react';
import { ExportFramework, Project } from '../types/editor';
import { exportProjectToHtml, exportProjectToJson } from '../utils/project-engine';
import { projectToForgeJson } from '../utils/forge-schema';
import { compileProjectForFramework } from '../utils/multi-framework-compiler';
import {
  exportFrameworkAsZipBlob,
  exportProjectAsZipBlob,
  generateReactBundleFiles,
  safeZipFilename,
} from '../utils/zip-exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const FRAMEWORK_TARGETS: { id: ExportFramework; label: string; hint: string }[] = [
  { id: 'react-vite', label: 'React + Vite', hint: 'TypeScript TSX components + Vite config' },
  { id: 'nextjs', label: 'Next.js App Router', hint: 'App Router pages + Metadata SEO' },
  { id: 'vue', label: 'Vue 3 + Vite', hint: 'SFC views + reactive routing' },
  { id: 'html', label: 'HTML / CSS / JS', hint: 'Zero-build multi-page static site' },
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  const [activeTab, setActiveTab] = useState<'zip' | 'html' | 'react' | 'forge' | 'json'>('zip');
  const [targetFramework, setTargetFramework] = useState<ExportFramework>('react-vite');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isBundlingZip, setIsBundlingZip] = useState(false);

  const htmlContent = useMemo(() => exportProjectToHtml(project), [project]);
  const jsonContent = useMemo(() => exportProjectToJson(project), [project]);
  const forgeJsonContent = useMemo(() => JSON.stringify(projectToForgeJson(project), null, 2), [project]);
  const reactFiles = useMemo(() => generateReactBundleFiles(project), [project]);
  const compiledBundle = useMemo(
    () => compileProjectForFramework(project, targetFramework),
    [project, targetFramework]
  );

  const filePaths = useMemo(() => Object.keys(compiledBundle.files), [compiledBundle]);

  useEffect(() => {
    if (!filePaths.includes(selectedFilePath)) {
      setSelectedFilePath(compiledBundle.entryFile || filePaths[0] || '');
    }
  }, [compiledBundle.entryFile, filePaths, selectedFilePath]);

  if (!isOpen) return null;

  const totalComponents = project.pages?.reduce((acc, p) => acc + p.elements.length, 0) || project.elements?.length || 0;

  const reactContent = Array.from(reactFiles.entries())
    .map(([filePath, code]) => `// ===== ${filePath} =====\n${code}`)
    .join('\n');

  const currentFileCode = compiledBundle.files[selectedFilePath] || '';

  const currentSnippet =
    activeTab === 'zip'
      ? currentFileCode
      : activeTab === 'html'
      ? htmlContent
      : activeTab === 'forge'
      ? forgeJsonContent
      : activeTab === 'json'
      ? jsonContent
      : reactContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTargetZip = async () => {
    setIsBundlingZip(true);
    try {
      const blob = await exportFrameworkAsZipBlob(project, targetFramework);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeZipFilename(project.name)}-${targetFramework}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsBundlingZip(false);
    }
  };

  const handleDownloadLegacyZip = async () => {
    setIsBundlingZip(true);
    try {
      const blob = await exportProjectAsZipBlob(project);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeZipFilename(project.name)}-bundle.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsBundlingZip(false);
    }
  };

  const handleDownload = async () => {
    if (activeTab === 'zip') {
      await handleDownloadTargetZip();
      return;
    }

    const stem = safeZipFilename(project.name);
    const filename =
      activeTab === 'forge'
        ? `${stem}-forge-schema.json`
        : activeTab === 'json'
        ? `${stem}.json`
        : activeTab === 'react'
        ? `${stem}-App.tsx`
        : `${stem}.html`;

    const content = activeTab === 'react' ? reactFiles.get('react/App.tsx') || reactContent : currentSnippet;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[680px] max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        data-testid="export-modal"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div>
            <h2 id="export-modal-title" className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FileCode size={16} className="text-blue-400" />
              <span>Multi-Framework Code Compiler &amp; Export</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              HTML/CSS/JS, React + Vite, Next.js App Router, Vue 3, and Forge JSON Schema for {project.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : activeTab === 'zip' ? 'Copy File' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isBundlingZip}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition cursor-pointer disabled:opacity-50"
              data-testid="export-download-primary-btn"
            >
              <Download size={13} />
              <span>
                {activeTab === 'zip'
                  ? isBundlingZip
                    ? 'Packing ZIP...'
                    : `Download ${targetFramework} .ZIP`
                  : 'Download File'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close export dialog"
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center overflow-x-auto px-6 border-b border-zinc-800 bg-zinc-950/40 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('zip')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'zip'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="export-tab-zip"
          >
            <Archive size={13} />
            <span>Framework Bundle &amp; ZIP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'html'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="export-tab-html"
          >
            <FileCode size={13} />
            <span>Single-File HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('react')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'react'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="export-tab-react"
          >
            <Code size={13} />
            <span>React TSX Bundle ({reactFiles.size} files)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forge')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'forge'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="export-tab-forge-schema"
          >
            <FileJson size={13} className="text-blue-400" />
            <span>Forge Schema JSON</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 font-medium whitespace-nowrap transition cursor-pointer ${
              activeTab === 'json'
                ? 'border-blue-500 text-blue-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
            data-testid="export-tab-canvas-json"
          >
            <FileJson size={13} />
            <span>State Backup JSON</span>
          </button>
        </div>

        {/* Content Box */}
        {activeTab === 'zip' ? (
          <div className="flex-1 flex flex-col min-h-0 bg-zinc-950">
            {/* 4-Framework Switcher Bar */}
            <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Target export framework">
                {FRAMEWORK_TARGETS.map((fw) => (
                  <button
                    key={fw.id}
                    type="button"
                    onClick={() => setTargetFramework(fw.id)}
                    data-testid={`export-framework-${fw.id}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      targetFramework === fw.id
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {fw.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleDownloadLegacyZip}
                disabled={isBundlingZip}
                className="text-[11px] text-zinc-400 hover:text-white underline cursor-pointer"
              >
                Download Combined Legacy ZIP
              </button>
            </div>

            {/* Interactive File Tree + Code Viewer */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              <div
                className="w-64 border-r border-zinc-800 bg-zinc-950 overflow-y-auto p-3 space-y-1 shrink-0"
                data-testid="export-file-tree"
              >
                <div className="flex items-center gap-1.5 px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  <FolderTree size={12} className="text-blue-400" />
                  <span>Files ({filePaths.length})</span>
                </div>
                {filePaths.map((fp) => (
                  <button
                    key={fp}
                    type="button"
                    onClick={() => setSelectedFilePath(fp)}
                    data-testid={`export-file-${fp}`}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-mono flex items-center gap-2 transition cursor-pointer ${
                      selectedFilePath === fp
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
                    }`}
                  >
                    <FileText size={12} className="shrink-0 opacity-75" />
                    <span className="truncate">{fp}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 bg-zinc-950 p-4 overflow-auto font-mono text-xs text-zinc-300 leading-relaxed">
                <div className="mb-2 pb-2 border-b border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>{selectedFilePath}</span>
                  <span>
                    Vercel preset: {compiledBundle.vercelPreset || 'static'}
                  </span>
                </div>
                <pre className="whitespace-pre">{currentFileCode}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-zinc-950 p-4 overflow-auto font-mono text-xs text-zinc-300 leading-relaxed">
            <pre className="whitespace-pre">{currentSnippet}</pre>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>License: MIT · Generated clean code with theme tokens &amp; SEO metadata</span>
          <span>
            {totalComponents} components across {project.pages?.length || 1} screens
          </span>
        </div>
      </div>
    </div>
  );
};
