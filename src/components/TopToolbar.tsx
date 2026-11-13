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
  Home,
  Layout,
  GitBranch,
  Database,
  Search,
  Sun,
  Moon,
  Keyboard,
  Sparkles,
  Globe
} from 'lucide-react';
import { Page, ViewportMode, WorkspaceMode, StudioTheme } from '../types/editor';

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
  onOpenPublish?: () => void;
  onOpenAiStudio?: () => void;
  isSaving: boolean;
  lastSavedText: string;
  workspaceMode: WorkspaceMode;
  onChangeWorkspaceMode: (mode: WorkspaceMode) => void;
  onOpenCommandPalette: () => void;
  onOpenShortcutsModal?: () => void;
  theme: StudioTheme;
  onToggleTheme: () => void;
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
  onOpenPublish,
  onOpenAiStudio,
  isSaving,
  lastSavedText,
  workspaceMode,
  onChangeWorkspaceMode,
  onOpenCommandPalette,
  onOpenShortcutsModal,
  theme,
  onToggleTheme,
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
    <header className="h-12 border-b border-zinc-800 bg-zinc-950 px-2 sm:px-3 flex items-center justify-between gap-2 select-none z-30 shrink-0 overflow-hidden">
      {/* Left: Brand + Navigation + Project Name + Page Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer whitespace-nowrap shrink-0"
          title="Return to Dashboard"
        >
          <ArrowLeft size={14} />
          <span className="hidden xl:inline">Dashboard</span>
        </button>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block shrink-0"></div>

        {/* Project Name editable */}
        <div className="flex items-center min-w-0">
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
              className="bg-zinc-900 border border-blue-500 rounded px-2 py-0.5 text-xs text-white font-medium focus:outline-none w-28 sm:w-40"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(projectName);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 rounded hover:bg-zinc-900 text-xs font-medium text-zinc-200 transition group cursor-pointer whitespace-nowrap min-w-0"
              title="Click to rename project"
            >
              <span className="truncate max-w-[95px] sm:max-w-[140px] xl:max-w-[180px]">{projectName}</span>
              <Edit2 size={11} className="text-zinc-500 group-hover:text-blue-400 transition shrink-0 hidden sm:inline" />
            </button>
          )}
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden lg:block shrink-0"></div>

        {/* Multi-Page Switcher Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition cursor-pointer whitespace-nowrap"
          >
            <FileCode2 size={13} className="text-blue-400 shrink-0" />
            <span className="hidden sm:inline text-zinc-400">Screen:</span>
            <span className="truncate max-w-[68px] sm:max-w-[100px]">{activePage?.name || 'Home'}</span>
            <ChevronDown size={12} className="text-zinc-400 shrink-0" />
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

      {/* Middle: Workspace Modes (Design, Logic, Data) */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium">
          <button
            onClick={() => onChangeWorkspaceMode('design')}
            title="Design Mode: Visual styling and responsive layouts (Alt+1)"
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer whitespace-nowrap ${
              workspaceMode === 'design'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layout size={13} />
            <span className="hidden lg:inline">Design</span>
          </button>
          <button
            onClick={() => onChangeWorkspaceMode('logic')}
            title="Logic Mode: Visual workflows and interactive triggers (Alt+2)"
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer whitespace-nowrap ${
              workspaceMode === 'logic'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GitBranch size={13} />
            <span className="hidden lg:inline">Logic</span>
          </button>
          <button
            onClick={() => onChangeWorkspaceMode('data')}
            title="Data Mode: Database collections and reactive state (Alt+3)"
            className={`px-2 py-1 rounded-md flex items-center gap-1 transition cursor-pointer whitespace-nowrap ${
              workspaceMode === 'data'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Database size={13} />
            <span className="hidden lg:inline">Data</span>
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden xl:block"></div>

        {/* Undo / Redo */}
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

        {/* Viewport switch (Desktop, Tablet, Mobile) */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => onChangeViewport('desktop')}
            title="Desktop view (1200px)"
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => onChangeViewport('tablet')}
            title="Tablet view (768px)"
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => onChangeViewport('mobile')}
            title="Mobile view (390px)"
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone size={14} />
          </button>
        </div>

        {/* Zoom */}
        <div className="hidden xl:flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-0.5 text-xs text-zinc-400 gap-1 font-mono">
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

      {/* Right: Search + Theme + Save + Preview + Export + Publish */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Quick Search & Command Palette (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer whitespace-nowrap"
          title="Quick Actions (Ctrl+K)"
        >
          <Search size={13} />
          <kbd className="px-1 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400">
            ⌘K
          </kbd>
        </button>

        {/* AI Studio Generator (Ctrl+J) */}
        {onOpenAiStudio && (
          <button
            onClick={onOpenAiStudio}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 hover:text-white transition cursor-pointer text-xs font-medium shadow-xs whitespace-nowrap"
            title="Google AI Studio Structured Generator (⌘J)"
            data-testid="toolbar-ai-studio-btn"
          >
            <Sparkles size={13} className="text-blue-400 shrink-0" />
            <span className="hidden xl:inline">AI Studio</span>
            <kbd className="hidden 2xl:inline px-1 py-0.2 rounded bg-blue-900/60 border border-blue-700/50 text-[9px] font-mono text-blue-200">
              ⌘J
            </kbd>
          </button>
        )}

        {/* Hotkeys / Shortcuts Manager */}
        {onOpenShortcutsModal && (
          <button
            onClick={onOpenShortcutsModal}
            className="hidden sm:inline-flex p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            title="Keyboard Shortcuts & Hotkeys Settings"
            data-testid="toolbar-shortcuts-btn"
          >
            <Keyboard size={13} />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="hidden sm:inline-flex p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-blue-400" />}
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition cursor-pointer whitespace-nowrap"
          title="Save project changes"
        >
          {isSaving ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="hidden sm:inline text-emerald-400">Saved</span>
            </>
          ) : (
            <>
              <Save size={13} />
              <span className="hidden xl:inline">Save</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenPreview}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:border-zinc-600 text-xs font-medium transition cursor-pointer whitespace-nowrap"
          title="Preview interactive prototype"
        >
          <Play size={12} className="fill-emerald-400 text-emerald-400" />
          <span>Preview</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-xs font-medium transition cursor-pointer whitespace-nowrap"
          title="Export code, ZIP archive, and specifications"
          data-testid="toolbar-export-btn"
        >
          <Download size={13} />
          <span className="hidden lg:inline">Export</span>
        </button>

        {onOpenPublish && (
          <button
            onClick={onOpenPublish}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition cursor-pointer whitespace-nowrap shrink-0"
            title="Publish live interactive web viewer and copy share link"
            data-testid="toolbar-publish-btn"
          >
            <Globe size={13} />
            <span>Publish</span>
          </button>
        )}
      </div>
    </header>
  );
};
