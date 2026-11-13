/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  Page,
  CanvasElement, 
  ComponentType, 
  ViewportMode, 
  LeftPanelTab,
  BottomDrawerTab,
  PageTransition,
  AppExecutionLog,
  WorkspaceMode,
  StudioTheme,
  AlignmentType,
  PageSeoConfig,
  ThemePresetName,
  ThemeTokens,
  Widget3DConfig
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
  updatePageSeo,
  addElement, 
  updateElement, 
  deleteElement, 
  duplicateElement, 
  reorderElementInProject,
  findElementDeep,
  toggleElementVisibility, 
  toggleElementLock,
  groupElementsIntoContainer,
  ungroupContainer,
  getActivePage,
  getAlignedElementStyles,
  alignElements
} from './utils/project-engine';
import { applyThemePreset, ensureThemeTokens, updateThemeTokens } from './utils/theme-engine';
import { useAuth } from './contexts/AuthContext';
import { saveProjectToCloud } from './utils/cloud-sync';
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
import { AiStudioModal } from './components/AiStudioModal';
import { 
  ForgeNode, 
  ForgeProject, 
  forgeNodeToCanvasElement, 
  forgeJsonToProject,
  remapForgeNodeIds
} from './utils/forge-schema';
import {
  publishProjectLive,
  loadPublishedProject,
  PublishResult
} from './utils/publish-service';
import { PublicViewer } from './components/PublicViewer';
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
  X,
  Globe,
  Check,
  Copy,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ComplianceHubModal, ComplianceTabId } from './components/ComplianceHubModal';
import { auditProjectCompliance } from './utils/compliance-audit';
import { LandingPage } from './components/LandingPage';
import { Ai3DModal } from './components/Ai3DModal';
import { DeployPanel } from './components/DeployPanel';

export default function App() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [activeProjectId, setActiveId] = useState<string | null>(() => getActiveProjectId());
  const [view, setView] = useState<'landing' | 'dashboard' | 'editor' | 'preview'>('landing');
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
  const [isAiStudioModalOpen, setIsAiStudioModalOpen] = useState(false);
  const [isAi3DModalOpen, setIsAi3DModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [complianceModalTab, setComplianceModalTab] = useState<ComplianceTabId | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);
  const [publishedView, setPublishedView] = useState<{
    project: Project | null;
    loading: boolean;
    error: string | null;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('All changes saved');

  const rawActiveProject = projects.find((p) => p.id === activeProjectId) || null;
  const activeProject = rawActiveProject ? ensureProjectPages(rawActiveProject) : null;

  // Handle `?published=...`, `#share=...`, and `?autostart=1` URL entrypoints
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const publishedId = params.get('published');
    const hash = window.location.hash || '';
    const shareMatch = hash.match(/#share=([^&]+)/);
    const shareToken = shareMatch ? decodeURIComponent(shareMatch[1]) : null;

    if (publishedId || shareToken) {
      setPublishedView({ project: null, loading: true, error: null });
      loadPublishedProject(publishedId, shareToken).then((res) => {
        setPublishedView({
          project: res.project,
          loading: false,
          error: res.error || null,
        });
      });
      return;
    }

    if (params.get('autostart') === '1' && projects.length > 0) {
      const targetId = activeProjectId && projects.some((p) => p.id === activeProjectId)
        ? activeProjectId
        : projects[0].id;
      setActiveId(targetId);
      setView('editor');
    }
    // Run only on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Push state to undo history before applying change (max 30 entries, skip no-op mutations)
  const applyProjectMutation = useCallback(
    (mutator: (current: Project) => Project) => {
      if (!activeProject) return;
      const updated = mutator(activeProject);
      const prevCompare = JSON.stringify({ ...activeProject, updatedAt: '' });
      const nextCompare = JSON.stringify({ ...updated, updatedAt: '' });
      if (prevCompare === nextCompare) return;

      setPast((prev) => [...prev.slice(-29), JSON.parse(JSON.stringify(activeProject))]);
      setFuture([]);

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
      portfolio: 'Creative Studio Portfolio',
      shop: 'Modern Storefront',
      contact: 'Enterprise Lead Portal',
      card: 'Product Showcase Card',
      linkinbio: '3D Creator Link-in-Bio',
      blank: 'Blank Canvas App',
    };
    const viewport: ViewportMode = templateId === 'mobile' || templateId === 'linkinbio' ? 'mobile' : 'desktop';
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
    handleLogExecution('Pages', `Updated page transition to "${transition}"`, 'action', 'info');
  };

  const handleUpdatePageSeo = (pageId: string, seoPatch: Partial<PageSeoConfig>) => {
    applyProjectMutation((proj) => updatePageSeo(proj, pageId, seoPatch));
  };

  const handleApplyThemePreset = (preset: Exclude<ThemePresetName, 'custom'>) => {
    applyProjectMutation((proj) => applyThemePreset(proj, preset));
    handleLogExecution('Theme', `Applied "${preset}" global design tokens`, 'action', 'success');
  };

  const handleUpdateThemeTokens = (patch: Partial<ThemeTokens>) => {
    applyProjectMutation((proj) => updateThemeTokens(proj, patch));
  };

  const handleInsert3DWidget = (config: Widget3DConfig) => {
    const el = createNewElement('widget3d');
    el.name = config.title || '3D UI Widget';
    el.props = { ...el.props, widget3d: config };
    applyProjectMutation((proj) => addElement(proj, el));
    setSelectedElementId(el.id);
    setIsAi3DModalOpen(false);
    handleLogExecution('3D Studio', `Added "${el.name}" 3D widget to screen`, 'action', 'success');
  };

  const handleUpdateDeployMeta = (patch: {
    lastVercelProjectId?: string;
    lastVercelProjectName?: string;
    lastDeploymentUrl?: string;
    customDomains?: string[];
  }) => {
    applyProjectMutation((proj) => ({
      ...proj,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSyncActiveProjectToCloud = async () => {
    if (!activeProject || !user) return;
    setIsSyncingCloud(true);
    try {
      await saveProjectToCloud(activeProject, user.uid);
      setLastSavedText(`Synced to Cloud ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      handleLogExecution('Cloud Sync', `Saved "${activeProject.name}" to Firestore`, 'action', 'success');
    } catch (err: any) {
      handleLogExecution('Cloud Sync', err?.message || 'Cloud sync failed', 'action', 'error');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleImportCloudProjects = (cloudProjects: Project[]) => {
    if (cloudProjects.length === 0) return;
    setProjects((prev) => {
      const map = new Map<string, Project>();
      cloudProjects.forEach((cp) => map.set(cp.id, ensureProjectPages(cp)));
      prev.forEach((lp) => {
        if (!map.has(lp.id)) map.set(lp.id, lp);
      });
      return Array.from(map.values());
    });
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

  const handleMoveElement = (elementId: string, direction: 'up' | 'down') => {
    applyProjectMutation((proj) => reorderElementInProject(proj, elementId, direction));
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

  // Align Elements (Centering, Anchoring, Distributing)
  const handleAlignElements = useCallback((alignment: AlignmentType) => {
    if (!activeProject) return;
    const activePage = getActivePage(activeProject);
    if (!activePage || activePage.elements.length === 0) return;

    applyProjectMutation((proj) => {
      const page = getActivePage(proj);
      if (!page) return proj;

      if (selectedElementId) {
        const updateTree = (elements: CanvasElement[]): CanvasElement[] => {
          return elements.map((el) => {
            if (el.id === selectedElementId) {
              return {
                ...el,
                styles: getAlignedElementStyles(el.styles, alignment),
              };
            }
            if (el.children && el.children.length > 0) {
              return {
                ...el,
                children: updateTree(el.children),
              };
            }
            return el;
          });
        };

        return {
          ...proj,
          pages: proj.pages.map((p) =>
            p.id === page.id ? { ...p, elements: updateTree(p.elements) } : p
          ),
        };
      }

      return {
        ...proj,
        pages: proj.pages.map((p) =>
          p.id === page.id ? { ...p, elements: alignElements(p.elements, alignment) } : p
        ),
      };
    });

    handleLogExecution('Layout', `Applied ${alignment.toUpperCase()} alignment to ${selectedElementId ? 'selected element' : 'page root'}`, 'action', 'success');
  }, [activeProject, selectedElementId, applyProjectMutation, handleLogExecution]);

  // Insert AI Generated Structured Nodes (CR-AI-09 collision-free ID remapping + append/replace/new-page)
  const handleInsertAiNodes = useCallback((
    nodes: ForgeNode[], 
    targetMode: 'append' | 'replace' | 'new-page', 
    newPageTitle?: string
  ) => {
    if (!activeProject || nodes.length === 0) return;

    const existingIds = new Set<string>();
    const collectIds = (els: CanvasElement[]) => {
      els.forEach((el) => {
        existingIds.add(el.id);
        if (el.children) collectIds(el.children);
      });
    };
    activeProject.pages.forEach((pg) => collectIds(pg.elements));

    const safeNodes = remapForgeNodeIds(nodes, existingIds);
    const newElements = safeNodes.map(forgeNodeToCanvasElement);

    if (targetMode === 'new-page') {
      const title = newPageTitle?.trim() || 'AI Generated Screen';
      const newPageId = 'page_' + Math.random().toString(36).substring(2, 9);
      const path = '/' + title.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newPage: Page = {
        id: newPageId,
        name: title,
        path,
        elements: newElements,
        transition: 'fade',
      };
      applyProjectMutation((proj) => ({
        ...proj,
        pages: [...proj.pages, newPage],
        activePageId: newPageId,
        updatedAt: new Date().toISOString(),
      }));
      setSelectedElementId(newElements[0]?.id || null);
      handleLogExecution('AI Studio', `Created screen "${title}" with ${nodes.length} element nodes`, 'action', 'success');
    } else if (targetMode === 'replace') {
      applyProjectMutation((proj) => {
        const page = getActivePage(proj);
        if (!page) return proj;
        return {
          ...proj,
          pages: proj.pages.map((p) =>
            p.id === page.id ? { ...p, elements: newElements } : p
          ),
          elements: newElements,
          updatedAt: new Date().toISOString(),
        };
      });
      setSelectedElementId(newElements[0]?.id || null);
      handleLogExecution('AI Studio', `Replaced active screen with ${nodes.length} AI element nodes`, 'action', 'success');
    } else {
      applyProjectMutation((proj) => {
        const page = getActivePage(proj);
        if (!page) return proj;
        const combined = [...page.elements, ...newElements];
        return {
          ...proj,
          pages: proj.pages.map((p) =>
            p.id === page.id ? { ...p, elements: combined } : p
          ),
          elements: combined,
          updatedAt: new Date().toISOString(),
        };
      });
      setSelectedElementId(newElements[0]?.id || null);
      handleLogExecution('AI Studio', `Added ${nodes.length} element nodes to active canvas`, 'action', 'success');
    }
  }, [activeProject, applyProjectMutation, handleLogExecution]);

  // Publish & Share Handler
  const handleOpenPublish = useCallback(async () => {
    if (!activeProject) return;
    setIsPublishModalOpen(true);
    setIsPublishing(true);
    setPublishError(null);
    setCopiedShareUrl(false);
    try {
      const res = await publishProjectLive(activeProject);
      setPublishResult(res);
      handleLogExecution('Publish', `Published snapshot "${activeProject.name}" (${res.source})`, 'action', 'success');
    } catch (err: any) {
      setPublishError(err?.message || 'Could not publish project snapshot.');
    } finally {
      setIsPublishing(false);
    }
  }, [activeProject, handleLogExecution]);

  // Bidirectional Forge JSON Project Import
  const handleImportForgeProject = useCallback((forgeProject: ForgeProject) => {
    try {
      const imported = forgeJsonToProject(forgeProject);
      setProjects((prev) => [imported, ...prev.filter((p) => p.id !== imported.id)]);
      setActiveId(imported.id);
      setSelectedElementId(null);
      handleLogExecution('Schema Hub', `Successfully loaded Forge project: ${forgeProject.appName}`, 'action', 'success');
    } catch (err: any) {
      handleLogExecution('Schema Hub', `Forge import failed: ${err.message}`, 'error', 'failed');
    }
  }, [handleLogExecution]);

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

      // 3b. Google AI Studio Modal (Cmd+J / Ctrl+J)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsAiStudioModalOpen((prev) => !prev);
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

      // 9. Undo / Redo (support both Ctrl+Y and Ctrl+Shift+Z for Redo)
      const isCtrlShiftZ = (e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z';
      if (!isTyping && (matchesShortcut(e, shortcuts.redo) || isCtrlShiftZ)) {
        e.preventDefault();
        handleRedo();
        return;
      } else if (!isTyping && matchesShortcut(e, shortcuts.undo)) {
        e.preventDefault();
        handleUndo();
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

  // If viewing a Published Snapshot
  if (publishedView) {
    if (publishedView.loading) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm">
            <Loader2 size={18} className="animate-spin text-blue-400" />
            <span>Loading published application...</span>
          </div>
        </div>
      );
    }
    if (!publishedView.project) {
      return (
        <PublicViewer
          project={activeProject || projects[0] || createInitialProject('AppForge App', 'blank')}
          error={publishedView.error || 'Published snapshot not found.'}
          onOpenInStudio={() => {
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, '', '/');
            }
            setPublishedView(null);
          }}
        />
      );
    }
    return (
      <PublicViewer
        project={publishedView.project}
        onOpenInStudio={() => {
          if (typeof window !== 'undefined') {
            window.history.replaceState({}, '', '/');
          }
          setPublishedView(null);
        }}
      />
    );
  }

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

  // If on Landing Page
  if (view === 'landing') {
    return (
      <>
        <LandingPage
          onOpenStudio={() => setView('dashboard')}
          onQuickStartTemplate={(templateId) => handleQuickCreate(templateId)}
          onOpenCompliance={(tab) => setComplianceModalTab(tab)}
        />
        <ComplianceHubModal
          isOpen={complianceModalTab !== null}
          onClose={() => setComplianceModalTab(null)}
          initialTab={complianceModalTab || 'privacy'}
          project={activeProject || projects[0] || null}
          onDeleteAllLocalProjects={() => {
            saveStoredProjects([]);
            setProjects([]);
            setActiveId(null);
            setActiveProjectId(null);
          }}
        />
        <CookieConsentBanner
          onOpenCookiePolicy={() => setComplianceModalTab('cookies')}
        />
      </>
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
          onOpenCompliance={(tab = 'privacy') => setComplianceModalTab(tab)}
          onBackToLanding={() => setView('landing')}
          onImportCloudProjects={handleImportCloudProjects}
        />
        <ProjectCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateProject}
        />
        <ComplianceHubModal
          isOpen={complianceModalTab !== null}
          onClose={() => setComplianceModalTab(null)}
          initialTab={complianceModalTab || 'privacy'}
          project={activeProject || projects[0] || null}
          onDeleteAllLocalProjects={() => {
            saveStoredProjects([]);
            setProjects([]);
            setActiveId(null);
            setActiveProjectId(null);
          }}
        />
        <CookieConsentBanner
          onOpenCookiePolicy={() => setComplianceModalTab('cookies')}
        />
      </>
    );
  }

  // Active Selected Element and Page (deep recursive lookup for nested containers)
  const activePage = getActivePage(activeProject);
  const selectedElement = selectedElementId ? findElementDeep(activePage.elements, selectedElementId) : null;
  const complianceReport = auditProjectCompliance(activeProject);

  return (
    <div className={`h-screen w-screen flex flex-col ${theme === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-950 text-zinc-100'} overflow-hidden select-none`}>
      <a
        href="#studio-main-canvas"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-xs font-semibold"
      >
        Skip to studio canvas
      </a>
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
        onOpenPublish={handleOpenPublish}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
        onOpenAiStudio={() => setIsAiStudioModalOpen(true)}
        onOpenAi3D={() => setIsAi3DModalOpen(true)}
        onSyncCloud={handleSyncActiveProjectToCloud}
        isSyncingCloud={isSyncingCloud}
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
        onOpenCompliance={() => setComplianceModalTab('checker')}
        complianceFailCount={complianceReport.failedCount}
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
        <main id="studio-main-canvas" tabIndex={-1} className="flex-1 flex overflow-hidden min-h-0 relative">
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
              onAlignElements={handleAlignElements}
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
              onOpenAi3DModal={() => setIsAi3DModalOpen(true)}
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
                    onAlignElements={handleAlignElements}
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
                    onOpenAi3DModal={() => {
                      setIsAi3DModalOpen(true);
                      setMobileDrawer('none');
                    }}
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
            themeTokens={ensureThemeTokens(activeProject)}
            snapToGrid={activeProject.snapToGrid ?? true}
            showGuides={activeProject.showGuides ?? false}
            onToggleSnapToGrid={() => {
              applyProjectMutation((proj) => ({
                ...proj,
                snapToGrid: !(proj.snapToGrid ?? true),
                updatedAt: new Date().toISOString(),
              }));
            }}
            onToggleGuides={() => {
              applyProjectMutation((proj) => ({
                ...proj,
                showGuides: !(proj.showGuides ?? false),
                updatedAt: new Date().toISOString(),
              }));
            }}
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
              onApplyThemePreset={handleApplyThemePreset}
              onUpdateThemeTokens={handleUpdateThemeTokens}
              onUpdatePageSeo={handleUpdatePageSeo}
              onUpdatePageTransition={handleUpdatePageTransition}
              onOpenAi3DModal={() => setIsAi3DModalOpen(true)}
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
                    onApplyThemePreset={handleApplyThemePreset}
                    onUpdateThemeTokens={handleUpdateThemeTokens}
                    onUpdatePageSeo={handleUpdatePageSeo}
                    onUpdatePageTransition={handleUpdatePageTransition}
                    onOpenAi3DModal={() => {
                      setIsAi3DModalOpen(true);
                      setMobileDrawer('none');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
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

      {/* 3. Bottom Panel (Logic Flowchart, Logs & Console, Diagnostic Tests — Desktop) */}
      <div className="hidden lg:block shrink-0">
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
      </div>

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
        onOpenAiStudio={() => setIsAiStudioModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        isDark={theme === 'dark'}
      />

      {/* Google AI Studio Structured Outputs & Generator Modal */}
      {activeProject && (
        <AiStudioModal
          isOpen={isAiStudioModalOpen}
          onClose={() => setIsAiStudioModalOpen(false)}
          project={activeProject}
          onInsertAiNodes={handleInsertAiNodes}
          onImportForgeProject={handleImportForgeProject}
          onOpenAi3DModal={() => {
            setIsAiStudioModalOpen(false);
            setIsAi3DModalOpen(true);
          }}
        />
      )}

      {/* Free & AI 3D Widget Studio Modal */}
      {activeProject && (
        <Ai3DModal
          isOpen={isAi3DModalOpen}
          onClose={() => setIsAi3DModalOpen(false)}
          themeTokens={ensureThemeTokens(activeProject)}
          onInsertWidget={handleInsert3DWidget}
        />
      )}

      {/* Vercel Own-Account Deployment & Custom Domain Modal */}
      {activeProject && (
        <DeployPanel
          isOpen={isDeployModalOpen}
          onClose={() => setIsDeployModalOpen(false)}
          project={activeProject}
          onUpdateDeployMeta={handleUpdateDeployMeta}
        />
      )}

      {/* Live Publish & Share Modal */}
      {isPublishModalOpen && activeProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          data-testid="publish-modal"
        >
          <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Globe size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Publish & Share Live App</h2>
                  <p className="text-xs text-zinc-400">Interactive public web viewer for {activeProject.name}</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close publish dialog"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {isPublishing ? (
                <div className="py-6 flex items-center justify-center gap-3 text-sm text-zinc-300">
                  <Loader2 size={18} className="animate-spin text-emerald-400" />
                  <span>Publishing interactive snapshot...</span>
                </div>
              ) : publishError ? (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  {publishError}
                </div>
              ) : publishResult ? (
                <>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
                    <span className="font-medium flex items-center gap-2">
                      <Check size={14} /> Live snapshot ready ({publishResult.source === 'server' ? 'Server Persisted' : 'Shareable Token Link'})
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400/80">
                      {activeProject.pages.length} {activeProject.pages.length === 1 ? 'page' : 'pages'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                      Public Share Link
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={publishResult.shareUrl}
                        aria-label="Public share link"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(publishResult.shareUrl).catch(() => {});
                          }
                          setCopiedShareUrl(true);
                          setTimeout(() => setCopiedShareUrl(false), 2000);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition shrink-0"
                      >
                        {copiedShareUrl ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedShareUrl ? 'Copied' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsPublishModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPublishModalOpen(false);
                        if (typeof window !== 'undefined') {
                          window.history.replaceState({}, '', `?published=${encodeURIComponent(publishResult.id)}`);
                        }
                        setPublishedView({
                          project: ensureProjectPages(activeProject),
                          loading: false,
                          error: null,
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      <ExternalLink size={14} />
                      <span>Open Public Viewer</span>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

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

      {/* Trust, Legal, Accessibility & 20-Point Compliance Hub */}
      <ComplianceHubModal
        isOpen={complianceModalTab !== null}
        onClose={() => setComplianceModalTab(null)}
        initialTab={complianceModalTab || 'checker'}
        project={activeProject}
        onUpdateProject={(updater) => applyProjectMutation(updater)}
        onDeleteAllLocalProjects={() => {
          saveStoredProjects([]);
          setProjects([]);
          setActiveId(null);
          setActiveProjectId(null);
          setView('dashboard');
        }}
      />
      <CookieConsentBanner
        onOpenCookiePolicy={() => setComplianceModalTab('cookies')}
      />
    </div>
  );
}
