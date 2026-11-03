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
  AppExecutionLog
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

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [activeProjectId, setActiveId] = useState<string | null>(() => getActiveProjectId());
  const [view, setView] = useState<'dashboard' | 'editor' | 'preview'>('dashboard');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<LeftPanelTab>('components');
  const [bottomTab, setBottomTab] = useState<BottomDrawerTab>('logic');
  
  // History for Undo / Redo
  const [past, setPast] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  // Logs stream for runtime telemetry
  const [logs, setLogs] = useState<AppExecutionLog[]>([
    {
      id: 'log_init',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'action',
      sourceElement: 'System',
      message: 'AppForge IDE studio initialized with multi-page router.',
      status: 'info',
    },
  ]);

  // Modals & Save Telemetry
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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

  // Keyboard shortcut listener for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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
      saas: 'Executive Analytics Hub',
      contact: 'Enterprise Lead Portal',
      card: 'Product Showcase Card',
      blank: 'Blank Canvas App',
    };
    handleCreateProject(titles[templateId] || 'New AppForge App', templateId, 'desktop');
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
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none">
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
      />

      {/* 2. Middle Work Area: LeftSidebar + CanvasArea + PropertiesPanel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar (Components, Pages, Layers, Assets) */}
        <LeftSidebar
          project={activeProject}
          activeTab={leftTab}
          onChangeTab={setLeftTab}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onAddComponent={handleAddComponent}
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

        {/* Central Canvas Area */}
        <CanvasArea
          activePage={activePage}
          elements={activePage.elements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
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

        {/* Right Properties Panel */}
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
        />
      </div>

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

      {/* Create Modal if triggered from Studio */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
