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
  BottomPanelTab 
} from './types/editor';
import { 
  createInitialProject, 
  createNewElement, 
  addElement, 
  updateElement, 
  deleteElement, 
  duplicateElement, 
  reorderElements, 
  toggleElementVisibility, 
  toggleElementLock 
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
import { ComponentLibrary } from './components/ComponentLibrary';
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
  const [bottomPanelTab, setBottomPanelTab] = useState<BottomPanelTab>('layers');
  
  // History for Undo / Redo
  const [past, setPast] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);

  // Modals & Save Telemetry
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('All changes saved');

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Persist projects whenever they change
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  // Keep active project ID in sync
  useEffect(() => {
    setActiveProjectId(activeProjectId);
  }, [activeProjectId]);

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
      }, 300);
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
  }, [past, activeProject]);

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
  }, [future, activeProject]);

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

  // Action Handlers
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
      saas: 'SaaS Metric Hub',
      contact: 'Customer Contact Form',
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

  const handleAddComponent = (type: ComponentType, customProps?: Record<string, any>) => {
    const newEl = createNewElement(type);
    if (customProps) {
      newEl.props = { ...newEl.props, ...customProps };
    }
    applyProjectMutation((proj) => addElement(proj, newEl));
    setSelectedElementId(newEl.id);
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    applyProjectMutation((proj) => updateElement(proj, id, updates));
  };

  const handleDeleteElement = (id: string) => {
    applyProjectMutation((proj) => deleteElement(proj, id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleDuplicateElement = (id: string) => {
    applyProjectMutation((proj) => duplicateElement(proj, id));
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

  const handleManualSave = () => {
    if (!activeProject) return;
    setIsSaving(true);
    saveProject(activeProject);
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedText(`Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 300);
  };

  // If in Preview Mode
  if (view === 'preview' && activeProject) {
    return (
      <PreviewMode
        project={activeProject}
        onExitPreview={() => setView('editor')}
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

  // Active Selected Element
  const selectedElement = activeProject.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden select-none">
      {/* 1. Top Toolbar */}
      <TopToolbar
        projectName={activeProject.name}
        onUpdateProjectName={(name) => {
          applyProjectMutation((proj) => ({ ...proj, name, updatedAt: new Date().toISOString() }));
        }}
        onBackToDashboard={() => setView('dashboard')}
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

      {/* 2. Middle Work Area: Library + Canvas + Properties */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Component Library */}
        <ComponentLibrary onAddComponent={handleAddComponent} />

        {/* Central Canvas Area */}
        <CanvasArea
          elements={activeProject.elements}
          selectedElementId={selectedElementId}
          onSelectElement={setSelectedElementId}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
          onMoveElement={handleMoveElement}
          onDropComponent={handleAddComponent}
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

      {/* 3. Bottom Panel for Layers, Assets, and Events */}
      <BottomPanel
        activeTab={bottomPanelTab}
        onChangeTab={setBottomPanelTab}
        elements={activeProject.elements}
        selectedElementId={selectedElementId}
        onSelectElement={setSelectedElementId}
        onMoveElement={handleMoveElement}
        onToggleVisibility={handleToggleVisibility}
        onDeleteElement={handleDeleteElement}
        onAddElement={handleAddComponent}
        onUpdateElement={handleUpdateElement}
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
