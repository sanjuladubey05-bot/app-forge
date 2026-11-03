import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Play, 
  Download, 
  Save, 
  Check, 
  ZoomIn, 
  ZoomOut,
  Edit2,
  FileCode2,
  ChevronDown,
  Plus,
  Home
} from 'lucide-react';
import { Page, ViewportMode } from '../types/editor';

interface TopToolbarProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  onBackToDashboard: () => void;
  pages: Page[];
  activePageId: string;
  homePageId: string;
  onSwitchPage: (pageId: string) => void;
  onOpenCreatePage: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  viewport: ViewportMode;
  onChangeViewport: (mode: ViewportMode) => void;
  zoom: number;
  onChangeZoom: (zoom: number) => void;
  onSave: () => void;
  onOpenPreview: () => void;
  onOpenExport: () => void;
  isSaving: boolean;
  lastSavedText: string;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  projectName,
  onUpdateProjectName,
  onBackToDashboard,
  pages,
  activePageId,
  homePageId,
  onSwitchPage,
  onOpenCreatePage,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  viewport,
  onChangeViewport,
  zoom,
  onChangeZoom,
  onSave,
  onOpenPreview,
  onOpenExport,
  isSaving,
  lastSavedText,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectName);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateProjectName(titleInput.trim());
    } else {
      setTitleInput(projectName);
    }
  };

  return (
    <header className="h-12 border-b border-zinc-800 bg-zinc-950 px-3 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Brand + Navigation + Project Name + Page Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          title="Return to Dashboard"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        <div className="h-4 w-px bg-zinc-800"></div>

        {/* Project Name editable */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(projectName);
                  setIsEditingTitle(false);
                }
              }}
              className="bg-zinc-900 border border-blue-500 rounded px-2 py-0.5 text-xs text-white font-medium focus:outline-none"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(projectName);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-900 text-xs font-medium text-zinc-200 transition group cursor-pointer"
              title="Click to rename project"
            >
              <span>{projectName}</span>
              <Edit2 size={11} className="text-zinc-500 group-hover:text-blue-400 transition" />
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden md:block"></div>

        {/* Multi-Page Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition cursor-pointer"
          >
            <FileCode2 size={13} className="text-blue-400" />
            <span>Screen: {activePage?.name || 'Home'}</span>
            <ChevronDown size={12} className="text-zinc-400" />
          </button>

          {isPageDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase text-zinc-400 tracking-wider">
                Application Screens
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {pages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSwitchPage(p.id);
                      setIsPageDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition ${
                      p.id === activePageId
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {p.id === homePageId && <Home size={11} className="text-amber-400 shrink-0" />}
                      <span className="truncate">{p.name}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60 shrink-0">{p.path}</span>
                  </button>
                ))}
              </div>
              <div className="pt-1 mt-1 border-t border-zinc-800">
                <button
                  onClick={() => {
                    setIsPageDropdownOpen(false);
                    onOpenCreatePage();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-400 hover:bg-zinc-800 flex items-center gap-1.5 cursor-pointer transition"
                >
                  <Plus size={12} />
                  <span>Create New Screen</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Undo / Redo & Viewport Mode & Zoom Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo action"
            className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition cursor-pointer"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo action"
            className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 transition cursor-pointer"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>

        {/* Viewport switch */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => onChangeViewport('desktop')}
            title="Desktop view (1200px)"
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => onChangeViewport('tablet')}
            title="Tablet view (768px)"
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => onChangeViewport('mobile')}
            title="Mobile view (375px)"
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone size={14} />
          </button>
        </div>

        {/* Zoom */}
        <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-0.5 text-xs text-zinc-400 gap-1 font-mono">
          <button
            onClick={() => onChangeZoom(Math.max(50, zoom - 15))}
            className="hover:text-white transition cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut size={12} />
          </button>
          <span className="w-9 text-center text-[11px]">{zoom}%</span>
          <button
            onClick={() => onChangeZoom(Math.min(150, zoom + 15))}
            className="hover:text-white transition cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn size={12} />
          </button>
        </div>
      </div>

      {/* Right: Save, Preview, Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer"
          title="Save project changes"
        >
          {isSaving ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="hidden sm:inline text-emerald-400">Saving...</span>
            </>
          ) : (
            <>
              <Save size={13} />
              <span className="hidden sm:inline">Save</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition cursor-pointer"
          title="Preview interactive prototype"
        >
          <Play size={12} className="fill-emerald-400" />
          <span className="font-semibold">Preview</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition cursor-pointer"
          title="Export code and specifications"
        >
          <Download size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
