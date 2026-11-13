import React, { useMemo, useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  FileJson,
  Code,
  Archive,
  FolderArchive,
} from 'lucide-react';
import { Project } from '../types/editor';
import { exportProjectToHtml, exportProjectToJson } from '../utils/project-engine';
import { projectToForgeJson } from '../utils/forge-schema';
import {
  exportProjectAsZipBlob,
  generateReactBundleFiles,
  getZipManifestPaths,
  safeZipFilename,
} from '../utils/zip-exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project }) => {
  const [activeTab, setActiveTab] = useState<'zip' | 'html' | 'react' | 'forge' | 'json'>('zip');
  const [copied, setCopied] = useState(false);
  const [isBundlingZip, setIsBundlingZip] = useState(false);

  const htmlContent = useMemo(() => exportProjectToHtml(project), [project]);
  const jsonContent = useMemo(() => exportProjectToJson(project), [project]);
  const forgeJsonContent = useMemo(() => JSON.stringify(projectToForgeJson(project), null, 2), [project]);
  const reactFiles = useMemo(() => generateReactBundleFiles(project), [project]);
  const zipManifest = useMemo(() => getZipManifestPaths(project), [project]);

  if (!isOpen) return null;

  const totalComponents = project.pages?.reduce((acc, p) => acc + p.elements.length, 0) || project.elements?.length || 0;

  const reactContent = Array.from(reactFiles.entries())
    .map(([filePath, code]) => `// ===== ${filePath} =====\n${code}`)
    .join('\n');

  const currentSnippet =
    activeTab === 'html'
      ? htmlContent
      : activeTab === 'forge'
      ? forgeJsonContent
      : activeTab === 'json'
      ? jsonContent
      : activeTab === 'react'
      ? reactContent
      : zipManifest.join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
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
      await handleDownloadZip();
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
        className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[640px] max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        data-testid="export-modal"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div>
            <h2 id="export-modal-title" className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FileCode size={16} className="text-blue-400" />
              <span>Export Application Bundle & Source Code</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Multi-page HTML, React TSX components, and Forge JSON Schema for {project.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
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
                    : 'Download Full .ZIP'
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
            <span>Multi-Page ZIP Archive</span>
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
          <div className="flex-1 bg-zinc-950 p-6 overflow-auto space-y-5">
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <FolderArchive size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Complete Deployable ZIP Package</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Includes linked multi-page HTML files, modular React TSX source components, Forge Schema JSON, and full project backup.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isBundlingZip}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <Download size={14} />
                <span>{isBundlingZip ? 'Generating Archive...' : 'Download .ZIP Bundle'}</span>
              </button>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Included Archive Manifest ({zipManifest.length} files)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {zipManifest.map((filePath) => (
                  <div
                    key={filePath}
                    className="px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/70 font-mono text-xs text-zinc-200 flex items-center justify-between"
                  >
                    <span className="truncate">{filePath}</span>
                    <span className="text-[10px] text-emerald-400 shrink-0 ml-2">READY</span>
                  </div>
                ))}
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
          <span>License: MIT • Self-contained static & React targets</span>
          <span>
            {totalComponents} components across {project.pages?.length || 1} screens
          </span>
        </div>
      </div>
    </div>
  );
};

