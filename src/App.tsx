/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  CanvasElement, 
  ComponentType, 
  ViewportMode, 
  LeftPanelTab,
  BottomDrawerTab,
  PageTransition,
  AppExecutionLog,
  WorkspaceMode,
  StudioTheme
} from './types/editor';
import { 
  createInitialProject, 
  createNewElement, 
  ensureProjectPages,
  createPage,
  duplicatePage,
  deletePage,
  renamePage,
  setHomePage,
  switchActivePage,
  updatePageTransition,
  addElement, 
  updateElement, 
  deleteElement, 
  duplicateElement, 
  reorderElements, 
  toggleElementVisibility, 
  toggleElementLock,
  groupElementsIntoContainer,
  ungroupContainer,
  getActivePage
} from './utils/project-engine';
import { 
  getStoredProjects, 
  saveStoredProjects, 
  saveProject, 
  getActiveProjectId, 
  setActiveProjectId 
} from './utils/storage';
import { Dashboard } from './components/Dashboard';
import { TopToolbar } from './components/TopToolbar';
import { LeftSidebar } from './components/LeftSidebar';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';
import { BottomPanel } from './components/BottomPanel';
import { PreviewMode } from './components/PreviewMode';
import { ProjectCreateModal } from './components/ProjectCreateModal';
import { ExportModal } from './components/ExportModal';
import { CommandPalette } from './components/CommandPalette';
import { DataStudio } from './components/DataStudio';
import { TutorialQuestWidget } from './components/TutorialQuestWidget';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { 
  ShortcutActionId, 
  getActiveShortcuts, 
  persistShortcutsToStorage, 
  clearStoredShortcuts, 
  matchesShortcut, 
  getDefaultShortcuts 
} from './utils/shortcut-manager';
import { 
  Box, 
  FileCode2, 
  Layers as LayersIcon, 
  Sliders, 
  Play, 
  X 
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [activeProjectId, setActiveId] = useState<string | null>(() => getActiveProjectId());
  const [view, setView] = useState<'dashboard' | 'editor' | 'preview'>('dashboard');
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('design');
  const [theme, setTheme] = useState<StudioTheme>('dark');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftPanelTab>('components');
  const [bottomTab, setBottomTab] = useState<BottomDrawerTab>('logic');
  const [mobileDrawer, setMobileDrawer] = useState<'none' | 'left' | 'properties'>('none');
  
  // History for Undo / Redo
  const [past, setPast] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  // Execution logs recorded from user interactions and preview events
  const [logs, setLogs] = useState<AppExecutionLog[]>([]);

  // Modals & Save Telemetry
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('All changes saved');

  const rawActiveProject = projects.find((p) => p.id === activeProjectId) || null;
  const activeProject = rawActiveProject ? ensureProjectPages(rawActiveProject) : null;

  // Persist projects whenever they change
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  // Keep active project ID in sync
  useEffect(() => {
    setActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  // Log an event to the bottom console
  const handleLogExecution = useCallback((source: string, message: string, type: any = 'action', status: any = 'success') => {
    const newLog: AppExecutionLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 8),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      sourceElement: source,
      message,
      status,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  // Push state to undo history before applying change
  const applyProjectMutation = useCallback(
    (mutator: (current: Project) => Project) => {
      if (!activeProject) return;
      setPast((prev) => [...prev.slice(-25), JSON.parse(JSON.stringify(activeProject))]);
      setFuture([]);

      const updated = mutator(activeProject);
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      // Trigger saving indicator
      setIsSaving(true);
      setTimeout(() => {
        setIsSaving(false);
        setLastSavedText(`Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      }, 250);
    },
    [activeProject]
  );

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (past.length === 0 || !activeProject) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture((prev) => [JSON.parse(JSON.stringify(activeProject)), ...prev]);
    setPast(newPast);
    setProjects((prev) =>
      prev.map((p) => (p.id === previous.id ? previous : p))
    );
    handleLogExecution('Undo', 'Reverted previous action', 'action', 'info');
  }, [past, activeProject, handleLogExecution]);

  // Redo Handler
  const handleRedo = useCallback(() => {
    if (future.length === 0 || !activeProject) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast((prev) => [...prev, JSON.parse(JSON.stringify(activeProject))]);
    setFuture(newFuture);
    setProjects((prev) =>
      prev.map((p) => (p.id === next.id ? next : p))
    );
    handleLogExecution('Redo', 'Reapplied action', 'action', 'info');
  }, [future, activeProject, handleLogExecution]);


  // Navigation & Project Handlers
  const handleOpenProject = (id: string) => {
    setActiveId(id);
    setSelectedElementId(null);
    setPast([]);
    setFuture([]);
    setView('editor');
  };

  const handleCreateProject = (name: string, templateId: string, viewport: ViewportMode) => {
    const newProj = createInitialProject(name, templateId);
    newProj.viewport = viewport;
    saveProject(newProj);
    setProjects((prev) => [newProj, ...prev]);
    setActiveId(newProj.id);
    setSelectedElementId(null);
    setPast([]);
    setFuture([]);
    setIsCreateModalOpen(false);
    setView('editor');
  };

  const handleQuickCreate = (templateId: string) => {
    const titles: Record<string, string> = {
      practice: 'Practice Project (Play-to-Build)',
      saas: 'Executive Analytics Hub',
      mobile: 'Mobile Commerce App',
      contact: 'Enterprise Lead Portal',
      card: 'Product Showcase Card',
      blank: 'Blank Canvas App',
    };
    const viewport: ViewportMode = templateId === 'mobile' ? 'mobile' : 'desktop';
    handleCreateProject(titles[templateId] || 'New AppForge App', templateId, viewport);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveId(null);
      setView('dashboard');
    }
  };

  const handleDuplicateProject = (id: string) => {
    const source = projects.find((p) => p.id === id);
    if (!source) return;
    const duplicated: Project = {
      ...JSON.parse(JSON.stringify(source)),
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      name: `${source.name} (Copy)`,
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [duplicated, ...prev]);
  };

  // Multi-Page Actions
  const handleSwitchPage = (pageId: string) => {
    applyProjectMutation((proj) => switchActivePage(proj, pageId));
    setSelectedElementId(null);
    handleLogExecution('Router', `Switched active editing screen to ${pageId}`, 'navigation', 'info');
  };

  const handleCreatePage = (name: string, path?: string, transition?: PageTransition) => {
    applyProjectMutation((proj) => createPage(proj, name, path, transition));
    setSelectedElementId(null);
    handleLogExecution('Pages', `Created new screen "${name}"`, 'action', 'success');
  };

  const handleDuplicatePage = (pageId: string) => {
    applyProjectMutation((proj) => duplicatePage(proj, pageId));
    handleLogExecution('Pages', 'Duplicated screen layout and elements', 'action', 'success');
  };

  const handleDeletePage = (pageId: string) => {
    applyProjectMutation((proj) => deletePage(proj, pageId));
    handleLogExecution('Pages', 'Deleted screen', 'action', 'warning');
  };

  const handleRenamePage = (pageId: string, name: string) => {
    applyProjectMutation((proj) => renamePage(proj, pageId, name));
  };

  const handleSetHomePage = (pageId: string) => {
    applyProjectMutation((proj) => setHomePage(proj, pageId));
    handleLogExecution('Pages', `Set starting screen to ${pageId}`, 'action', 'info');
  };

  const handleUpdatePageTransition = (pageId: string, transition: PageTransition) => {
    applyProjectMutation((proj) => updatePageTransition(proj, pageId, transition));
  };

  // Element Actions
  const handleAddComponent = (
    type: ComponentType, 
    customProps?: Record<string, any>, 
    targetContainerId?: string | null
  ) => {
    const newEl = createNewElement(type);
    if (customProps) {
      newEl.props = { ...newEl.props, ...customProps };
    }
    applyProjectMutation((proj) => addElement(proj, newEl, targetContainerId));
    setSelectedElementId(newEl.id);
    handleLogExecution('Library', `Added ${newEl.name} to active screen`, 'action', 'success');
  };

  const handleAddSection = (sectionElements: CanvasElement[]) => {
    applyProjectMutation((proj) => {
      const active = getActivePage(proj);
      const updatedElements = [...active.elements, ...sectionElements];
      return {
        ...proj,
        pages: proj.pages.map((p) => (p.id === active.id ? { ...p, elements: updatedElements } : p)),
        updatedAt: new Date().toISOString(),
      };
    });
    handleLogExecution('Section Library', `Inserted prebuilt section (${sectionElements.length} elements)`, 'action', 'success');
    if (sectionElements.length > 0) {
      setSelectedElementId(sectionElements[0].id);
    }
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    applyProjectMutation((proj) => updateElement(proj, id, updates));
  };

  const handleDeleteElement = (id: string) => {
    applyProjectMutation((proj) => deleteElement(proj, id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    handleLogExecution('Canvas', `Deleted element #${id.slice(-4)}`, 'action', 'warning');
  };

  const handleDuplicateElement = (id: string) => {
    applyProjectMutation((proj) => duplicateElement(proj, id));
    handleLogExecution('Canvas', 'Cloned element', 'action', 'success');
  };

  const handleMoveElement = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    applyProjectMutation((proj) => reorderElements(proj, index, targetIndex));
  };

  const handleToggleVisibility = (id: string) => {
    applyProjectMutation((proj) => toggleElementVisibility(proj, id));
  };

  const handleToggleLock = (id: string) => {
    applyProjectMutation((proj) => toggleElementLock(proj, id));
  };

  const handleRenameElement = (id: string, name: string) => {
    applyProjectMutation((proj) => updateElement(proj, id, { name }));
  };

  const handleGroupSelected = () => {
    if (!selectedElementId || !activeProject) return;
    const activePage = getActivePage(activeProject);
    const newElements = groupElementsIntoContainer(activePage.elements, [selectedElementId]);
    applyProjectMutation((proj) => ({
      ...proj,
      pages: proj.pages.map((p) => (p.id === activePage.id ? { ...p, elements: newElements } : p)),
    }));
    handleLogExecution('Layers', 'Grouped element into Flex Container', 'action', 'success');
  };

  const handleUngroupContainer = (containerId: string) => {
    if (!activeProject) return;
    const activePage = getActivePage(activeProject);
    const newElements = ungroupContainer(activePage.elements, containerId);
    applyProjectMutation((proj) => ({
      ...proj,
      pages: proj.pages.map((p) => (p.id === activePage.id ? { ...p, elements: newElements } : p)),
    }));
    handleLogExecution('Layers', 'Ungrouped container into root elements', 'action', 'info');
  };

  const handleManualSave = () => {
    if (!activeProject) return;
    setIsSaving(true);
    saveProject(activeProject);
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedText(`Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 250);
  };

  // Resolve active shortcuts (merging defaults, localStorage, and project custom overrides)
  const activeShortcuts = getActiveShortcuts(activeProject);

  const handleSaveShortcuts = (updated: Record<ShortcutActionId, string>) => {
    persistShortcutsToStorage(updated);
    if (activeProject) {
      applyProjectMutation((proj) => ({
        ...proj,
        customShortcuts: updated,
      }));
    }
    handleLogExecution('Shortcuts', 'Saved custom keyboard shortcuts', 'action', 'success');
  };

  const handleResetShortcuts = () => {
    clearStoredShortcuts();
    const defaults = getDefaultShortcuts();
    if (activeProject) {
      applyProjectMutation((proj) => ({
        ...proj,
        customShortcuts: defaults,
      }));
    }
    handleLogExecution('Shortcuts', 'Reset shortcuts to defaults', 'action', 'info');
  };

  // Global Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger global actions if modal is open and user might be recording keys
      if (isShortcutsModalOpen) return;

      const target = e.target as HTMLElement;
      const isTyping = target && (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      );

      const shortcuts = getActiveShortcuts(activeProject);

      // 1. Delete Element (respecting input typing guard)
      if (matchesShortcut(e, shortcuts.deleteElement)) {
        if (!isTyping && selectedElementId) {
          e.preventDefault();
          handleDeleteElement(selectedElementId);
          return;
        }
      }

      // 2. Duplicate Element (respecting input typing guard)
      if (matchesShortcut(e, shortcuts.duplicateElement)) {
        if (!isTyping && selectedElementId) {
          e.preventDefault();
          handleDuplicateElement(selectedElementId);
          return;
        }
      }

      // 3. Command Palette
      if (matchesShortcut(e, shortcuts.commandPalette)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // 4. Preview Application
      if (matchesShortcut(e, shortcuts.previewApp)) {
        e.preventDefault();
        if (activeProject) {
          setView('preview');
        }
        return;
      }

      // 5. Save Project
      if (matchesShortcut(e, shortcuts.saveProject)) {
        e.preventDefault();
        handleManualSave();
        return;
      }

      // 6. Export Application
      if (matchesShortcut(e, shortcuts.exportApp)) {
        e.preventDefault();
        setIsExportModalOpen(true);
        return;
      }

      // 7. Quick Add
      if (matchesShortcut(e, shortcuts.quickAdd)) {
        e.preventDefault();
        setLeftTab('components');
        return;
      }

      // 8. Modes
      if (matchesShortcut(e, shortcuts.modeDesign)) {
        e.preventDefault();
        setWorkspaceMode('design');
        return;
      } else if (matchesShortcut(e, shortcuts.modeLogic)) {
        e.preventDefault();
        setWorkspaceMode('logic');
        setBottomTab('logic');
        return;
      } else if (matchesShortcut(e, shortcuts.modeData)) {
        e.preventDefault();
        setWorkspaceMode('data');
        return;
      }

      // 9. Undo / Redo
      if (matchesShortcut(e, shortcuts.undo)) {
        e.preventDefault();
        handleUndo();
        return;
      } else if (matchesShortcut(e, shortcuts.redo)) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeProject,
    selectedElementId,
    isShortcutsModalOpen,
    handleDeleteElement,
    handleDuplicateElement,
    handleUndo,
    handleRedo,
    handleManualSave,
  ]);

  // If in Preview Mode
  if (view === 'preview' && activeProject) {
    return (
      <PreviewMode
        project={activeProject}
        onExitPreview={() => setView('editor')}
        onLogExecution={handleLogExecution}
      />
    );
  }

  // If on Dashboard
  if (view === 'dashboard' || !activeProject) {
    return (
      <>
        <Dashboard
          projects={projects}
          onOpenProject={handleOpenProject}
          onNewProjectClick={() => setIsCreateModalOpen(true)}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
          onQuickCreate={handleQuickCreate}
        />
        <ProjectCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
        />
      </>
    );
  }

  // Active Selected Element and Page
  const activePage = getActivePage(activeProject);
  const selectedElement = activePage.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className={`h-screen w-screen flex flex-col ${theme === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-950 text-zinc-100'} overflow-hidden select-none`}>
      {/* 1. Top Toolbar */}
      <TopToolbar
        projectName={activeProject.name}
        onUpdateProjectName={(name) => {
          applyProjectMutation((proj) => ({ ...proj, name, updatedAt: new Date().toISOString() }));
        }}
        onBackToDashboard={() => setView('dashboard')}
        pages={activeProject.pages}
        activePageId={activeProject.activePageId}
        homePageId={activeProject.homePageId}
        onSwitchPage={handleSwitchPage}
        onOpenCreatePage={() => {
          setLeftTab('pages');
        }}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        viewport={activeProject.viewport}
        onChangeViewport={(viewport) => {
          applyProjectMutation((proj) => ({ ...proj, viewport }));
        }}
        zoom={activeProject.zoom}
        onChangeZoom={(zoom) => {
          applyProjectMutation((proj) => ({ ...proj, zoom }));
        }}
        onSave={handleManualSave}
        onOpenPreview={() => setView('preview')}
        onOpenExport={() => setIsExportModalOpen(true)}
        isSaving={isSaving}
        lastSavedText={lastSavedText}
        workspaceMode={workspaceMode}
        onChangeWorkspaceMode={(mode) => {
          setWorkspaceMode(mode);
          if (mode === 'logic') {
            setBottomTab('logic');
          }
          handleLogExecution('Mode', `Switched workspace to ${mode.toUpperCase()} mode`, 'action', 'info');
        }}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        theme={theme}
        onToggleTheme={() => {
          setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
          handleLogExecution('Theme', `Toggled studio theme`, 'action', 'info');
        }}
      />

      {/* 2. Middle Work Area */}
      {workspaceMode === 'data' ? (
        <DataStudio
          project={activeProject}
          onUpdateProject={(updates) => applyProjectMutation((proj) => ({ ...proj, ...updates }))}
          onLogExecution={handleLogExecution}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Left Sidebar (Desktop: pinned side rail) */}
          <div className="hidden lg:flex shrink-0">
            <LeftSidebar
              project={activeProject}
              activeTab={leftTab}
              onChangeTab={setLeftTab}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onAddComponent={handleAddComponent}
              onAddSection={handleAddSection}
              onSwitchPage={handleSwitchPage}
              onCreatePage={handleCreatePage}
              onDuplicatePage={handleDuplicatePage}
              onDeletePage={handleDeletePage}
              onRenamePage={handleRenamePage}
              onSetHomePage={handleSetHomePage}
              onUpdatePageTransition={handleUpdatePageTransition}
              onMoveElement={handleMoveElement}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onRenameElement={handleRenameElement}
              onGroupSelected={handleGroupSelected}
              onUngroupContainer={handleUngroupContainer}
            />
          </div>

          {/* Mobile Left Drawer Slide-over */}
          {mobileDrawer === 'left' && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
                onClick={() => setMobileDrawer('none')} 
              />
              <div className="relative z-10 w-80 max-w-[85vw] h-full bg-zinc-950 flex flex-col shadow-2xl border-r border-zinc-800">
                <div className="p-2 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider px-2">Navigation & Tools</span>
                  <button
                    onClick={() => setMobileDrawer('none')}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <LeftSidebar
                    project={activeProject}
                    activeTab={leftTab}
                    onChangeTab={setLeftTab}
                    selectedElementId={selectedElementId}
                    onSelectElement={(id) => {
                      setSelectedElementId(id);
                      setMobileDrawer('none');
                    }}
                    onAddComponent={(type, props) => {
                      handleAddComponent(type, props);
                      setMobileDrawer('none');
                    }}
                    onAddSection={(elements) => {
                      handleAddSection(elements);
                      setMobileDrawer('none');
                    }}
                    onSwitchPage={(id) => {
                      handleSwitchPage(id);
                      setMobileDrawer('none');
                    }}
                    onCreatePage={handleCreatePage}
                    onDuplicatePage={handleDuplicatePage}
                    onDeletePage={handleDeletePage}
                    onRenamePage={handleRenamePage}
                    onSetHomePage={handleSetHomePage}
                    onUpdatePageTransition={handleUpdatePageTransition}
                    onMoveElement={handleMoveElement}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleLock={handleToggleLock}
                    onDeleteElement={handleDeleteElement}
                    onDuplicateElement={handleDuplicateElement}
                    onRenameElement={handleRenameElement}
                    onGroupSelected={handleGroupSelected}
                    onUngroupContainer={handleUngroupContainer}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Central Canvas Area (Full width on mobile!) */}
          <CanvasArea
            activePage={activePage}
            elements={activePage.elements}
            selectedElementId={selectedElementId}
            onSelectElement={(id) => {
              setSelectedElementId(id);
            }}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onMoveElement={handleMoveElement}
            onDropComponent={(type, targetContainerId) => handleAddComponent(type, undefined, targetContainerId)}
            onGroupSelected={handleGroupSelected}
            viewport={activeProject.viewport}
            zoom={activeProject.zoom}
            canvasBg={activeProject.canvasBg}
            canvasPadding={activeProject.canvasPadding}
          />

          {/* Right Properties Panel (Desktop: pinned right rail) */}
          <div className="hidden lg:flex shrink-0">
            <PropertiesPanel
              selectedElement={selectedElement}
              project={activeProject}
              onUpdateElement={handleUpdateElement}
              onUpdateProjectSettings={(settings) => {
                applyProjectMutation((proj) => ({ ...proj, ...settings }));
              }}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
            />
          </div>

          {/* Mobile Properties Panel Slide-over */}
          {mobileDrawer === 'properties' && (
            <div className="lg:hidden fixed inset-0 z-50 flex justify-end">
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
                onClick={() => setMobileDrawer('none')} 
              />
              <div className="relative z-10 w-84 max-w-[90vw] h-full bg-zinc-950 flex flex-col shadow-2xl border-l border-zinc-800">
                <div className="p-2 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider px-2">Design & Properties</span>
                  <button
                    onClick={() => setMobileDrawer('none')}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <PropertiesPanel
                    selectedElement={selectedElement}
                    project={activeProject}
                    onUpdateElement={handleUpdateElement}
                    onUpdateProjectSettings={(settings) => {
                      applyProjectMutation((proj) => ({ ...proj, ...settings }));
                    }}
                    onDeleteElement={handleDeleteElement}
                    onDuplicateElement={handleDuplicateElement}
                    onToggleVisibility={handleToggleVisibility}
                    onToggleLock={handleToggleLock}
                    onOpenShortcutsModal={() => {
                      setIsShortcutsModalOpen(true);
                      setMobileDrawer('none');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="lg:hidden h-12 border-t border-zinc-800 bg-zinc-950 px-2 flex items-center justify-around z-30 shrink-0">
        <button
          onClick={() => {
            setLeftTab('components');
            setMobileDrawer(mobileDrawer === 'left' && leftTab === 'components' ? 'none' : 'left');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            mobileDrawer === 'left' && leftTab === 'components' ? 'text-blue-400 bg-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Box size={16} />
          <span>Add</span>
        </button>
        <button
          onClick={() => {
            setLeftTab('pages');
            setMobileDrawer(mobileDrawer === 'left' && leftTab === 'pages' ? 'none' : 'left');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            mobileDrawer === 'left' && leftTab === 'pages' ? 'text-blue-400 bg-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileCode2 size={16} />
          <span>Pages</span>
        </button>
        <button
          onClick={() => {
            setLeftTab('layers');
            setMobileDrawer(mobileDrawer === 'left' && leftTab === 'layers' ? 'none' : 'left');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            mobileDrawer === 'left' && leftTab === 'layers' ? 'text-blue-400 bg-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <LayersIcon size={16} />
          <span>Layers</span>
        </button>
        <button
          onClick={() => {
            setMobileDrawer(mobileDrawer === 'properties' ? 'none' : 'properties');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition cursor-pointer ${
            mobileDrawer === 'properties' ? 'text-blue-400 bg-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders size={16} />
          <span>Design</span>
        </button>
        <button
          onClick={() => setView('preview')}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
        >
          <Play size={16} className="fill-emerald-400" />
          <span>Preview</span>
        </button>
      </nav>

      {/* 3. Bottom Panel (Logic Flowchart, Logs & Console, Diagnostic Tests) */}
      <BottomPanel
        project={activeProject}
        activeTab={bottomTab}
        onChangeTab={setBottomTab}
        selectedElement={selectedElement}
        onUpdateElement={handleUpdateElement}
        logs={logs}
        onClearLogs={() => setLogs([])}
        onRunTestScenario={(test) => handleLogExecution('Test Suite', `Executed: ${test}`, 'action', 'success')}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={activeProject}
      />

      {/* Global Keyboard Shortcuts Configuration Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcuts={activeShortcuts}
        onSaveShortcuts={handleSaveShortcuts}
        onResetShortcuts={handleResetShortcuts}
      />

      {/* Create Modal if triggered from Studio */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        pages={activeProject.pages}
        onSwitchPage={handleSwitchPage}
        onAddComponent={handleAddComponent}
        workspaceMode={workspaceMode}
        onChangeMode={(mode) => {
          setWorkspaceMode(mode);
          if (mode === 'logic') setBottomTab('logic');
        }}
        onOpenPreview={() => setView('preview')}
        onOpenExport={() => setIsExportModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        isDark={theme === 'dark'}
      />

      {/* Play-to-Build Interactive Tutorial Quests (Desktop) */}
      <div className="hidden sm:block">
        <TutorialQuestWidget
          project={activeProject}
          selectedElement={selectedElement}
          isPreviewing={view === 'preview'}
          onNavigateTab={(tab) => setLeftTab(tab)}
          onOpenPreview={() => setView('preview')}
        />
      </div>
    </div>
  );
}
