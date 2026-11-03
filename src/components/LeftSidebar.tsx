import React, { useState } from 'react';
import { 
  Square, 
  Type, 
  Heading1, 
  CreditCard, 
  Box, 
  TextCursorInput, 
  FileText, 
  ListFilter, 
  CheckSquare, 
  BarChart3, 
  Image as ImageIcon, 
  Minus, 
  ToggleLeft, 
  Table, 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Sparkles,
  Layers as LayersIcon,
  FileCode2,
  FolderOpen,
  Home,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  FolderPlus,
  Compass
} from 'lucide-react';
import { 
  CanvasElement, 
  ComponentType, 
  LeftPanelTab, 
  Page, 
  PageTransition, 
  Project 
} from '../types/editor';
import { getActivePage } from '../utils/project-engine';

interface LeftSidebarProps {
  project: Project;
  activeTab: LeftPanelTab;
  onChangeTab: (tab: LeftPanelTab) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddComponent: (type: ComponentType, customProps?: Record<string, any>) => void;
  // Multi-page handlers
  onSwitchPage: (pageId: string) => void;
  onCreatePage: (name: string, path?: string, transition?: PageTransition) => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, name: string) => void;
  onSetHomePage: (pageId: string) => void;
  onUpdatePageTransition: (pageId: string, transition: PageTransition) => void;
  // Advanced Layer handlers
  onMoveElement: (index: number, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onRenameElement: (id: string, name: string) => void;
  onGroupSelected: () => void;
  onUngroupContainer: (containerId: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  project,
  activeTab,
  onChangeTab,
  selectedElementId,
  onSelectElement,
  onAddComponent,
  onSwitchPage,
  onCreatePage,
  onDuplicatePage,
  onDeletePage,
  onRenamePage,
  onSetHomePage,
  onUpdatePageTransition,
  onMoveElement,
  onToggleVisibility,
  onToggleLock,
  onDeleteElement,
  onDuplicateElement,
  onRenameElement,
  onGroupSelected,
  onUngroupContainer,
}) => {
  const [componentSearch, setComponentSearch] = useState('');
  const [newPageName, setNewPageName] = useState('');
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [editingElementName, setEditingElementName] = useState('');

  const activePage = getActivePage(project);

  const stockAssets = [
    { name: 'Analytics Pulse', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', cat: 'Analytics' },
    { name: 'Vibrant Mesh Art', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80', cat: 'Abstract' },
    { name: 'Engineering Workspace', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', cat: 'Tech' },
    { name: 'Product Team Flow', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', cat: 'Team' },
    { name: 'Cloud Infrastructure', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', cat: 'Cloud' },
  ];

  const componentSections = [
    {
      id: 'containers',
      name: 'Containers & Layout',
      items: [
        { type: 'container' as ComponentType, title: 'Flex Container', desc: 'Auto-layout wrapper for grouping children', icon: Box },
        { type: 'card' as ComponentType, title: 'Card Container', desc: 'Surface with border, padding and elevation', icon: CreditCard },
        { type: 'divider' as ComponentType, title: 'Divider Line', desc: 'Horizontal separation rule', icon: Minus },
      ],
    },
    {
      id: 'typography',
      name: 'Typography',
      items: [
        { type: 'heading' as ComponentType, title: 'Heading Block', desc: 'H1, H2, or H3 with optional subtext', icon: Heading1 },
        { type: 'text' as ComponentType, title: 'Paragraph Text', desc: 'Formatted body copy and descriptions', icon: Type },
        { type: 'badge' as ComponentType, title: 'Status Badge', desc: 'Pill tag for tags or statuses', icon: CheckSquare },
      ],
    },
    {
      id: 'forms',
      name: 'Forms & Inputs',
      items: [
        { type: 'button' as ComponentType, title: 'Action Button', desc: 'Interactive button with action pipeline', icon: Square },
        { type: 'input' as ComponentType, title: 'Text Input', desc: 'Single-line field with label', icon: TextCursorInput },
        { type: 'textarea' as ComponentType, title: 'Textarea Field', desc: 'Multi-line message or bio field', icon: FileText },
        { type: 'select' as ComponentType, title: 'Dropdown Select', desc: 'Option list selector', icon: ListFilter },
        { type: 'toggle' as ComponentType, title: 'Switch Toggle', desc: 'Boolean switch control', icon: ToggleLeft },
      ],
    },
    {
      id: 'data',
      name: 'Data & Display',
      items: [
        { type: 'metric' as ComponentType, title: 'Metric KPI Card', desc: 'Counter with trend percentage', icon: BarChart3 },
        { type: 'image' as ComponentType, title: 'Image Box', desc: 'Responsive media element', icon: ImageIcon },
        { type: 'table' as ComponentType, title: 'Data Table', desc: 'Structured columns and records', icon: Table },
      ],
    },
  ];

  const handleCreatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPageName.trim()) {
      onCreatePage(newPageName.trim());
      setNewPageName('');
      setIsCreatingPage(false);
    }
  };

  const renderLayerTreeItem = (element: CanvasElement, index: number, depth: number = 0) => {
    const isSelected = selectedElementId === element.id;
    const isEditing = editingElementId === element.id;

    return (
      <div key={element.id} className="space-y-1">
        <div
          onClick={() => onSelectElement(element.id)}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`flex items-center justify-between py-1.5 pr-2 rounded-lg border text-xs transition cursor-pointer group ${
            isSelected
              ? 'border-blue-500 bg-blue-500/10 text-white font-medium shadow-xs'
              : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800/60'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 uppercase shrink-0">
              {element.type === 'container' ? 'Flex' : element.type}
            </span>

            {isEditing ? (
              <input
                type="text"
                autoFocus
                value={editingElementName}
                onChange={(e) => setEditingElementName(e.target.value)}
                onBlur={() => {
                  if (editingElementName.trim()) {
                    onRenameElement(element.id, editingElementName.trim());
                  }
                  setEditingElementId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editingElementName.trim()) onRenameElement(element.id, editingElementName.trim());
                    setEditingElementId(null);
                  }
                  if (e.key === 'Escape') setEditingElementId(null);
                }}
                className="bg-zinc-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white"
              />
            ) : (
              <span 
                onDoubleClick={() => {
                  setEditingElementId(element.id);
                  setEditingElementName(element.name);
                }}
                className="truncate text-xs text-zinc-200"
                title="Double click to rename"
              >
                {element.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition shrink-0">
            {element.type === 'container' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUngroupContainer(element.id);
                }}
                className="p-1 text-zinc-400 hover:text-white rounded"
                title="Ungroup container"
              >
                <FolderOpen size={11} />
              </button>
            )}
            <button
              type="button"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMoveElement(index, 'up');
              }}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
              title="Move Up"
            >
              <ArrowUp size={11} />
            </button>
            <button
              type="button"
              disabled={index === activePage.elements.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMoveElement(index, 'down');
              }}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
              title="Move Down"
            >
              <ArrowDown size={11} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(element.id);
              }}
              className="p-1 text-zinc-400 hover:text-white"
              title={element.hidden ? 'Show' : 'Hide'}
            >
              {element.hidden ? <EyeOff size={11} className="text-amber-400" /> : <Eye size={11} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock(element.id);
              }}
              className="p-1 text-zinc-400 hover:text-white"
              title={element.locked ? 'Unlock' : 'Lock'}
            >
              {element.locked ? <Lock size={11} className="text-amber-400" /> : <Unlock size={11} />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateElement(element.id);
              }}
              className="p-1 text-zinc-400 hover:text-white"
              title="Duplicate"
            >
              <Copy size={11} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteElement(element.id);
              }}
              className="p-1 text-zinc-400 hover:text-red-400"
              title="Delete"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {/* Render nested children if container */}
        {element.children && element.children.length > 0 && (
          <div className="space-y-1">
            {element.children.map((child, cIdx) =>
              renderLayerTreeItem(child, cIdx, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-row h-full shrink-0 select-none">
      {/* 1. Left Vertical Tab Rail */}
      <nav aria-label="Editor panels" className="w-12 border-r border-zinc-800 bg-zinc-950 flex flex-col items-center py-3 gap-2 shrink-0">
        {[
          { id: 'components' as LeftPanelTab, label: 'Components', icon: Box },
          { id: 'pages' as LeftPanelTab, label: 'Pages', icon: FileCode2, badge: project.pages.length },
          { id: 'layers' as LeftPanelTab, label: 'Layers', icon: LayersIcon, badge: activePage.elements.length },
          { id: 'assets' as LeftPanelTab, label: 'Assets', icon: ImageIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative p-2.5 rounded-xl transition cursor-pointer flex flex-col items-center ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
              title={tab.label}
            >
              <Icon size={17} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 2. Secondary Tab Content Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        {/* ================= COMPONENTS TAB ================= */}
        {activeTab === 'components' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Components
                </span>
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <Sparkles size={11} className="text-blue-400" />
                  Library
                </span>
              </div>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search elements..."
                  value={componentSearch}
                  onChange={(e) => setComponentSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
              {componentSections.map((sec) => {
                const items = sec.items.filter(
                  (i) =>
                    i.title.toLowerCase().includes(componentSearch.toLowerCase()) ||
                    i.desc.toLowerCase().includes(componentSearch.toLowerCase())
                );
                if (items.length === 0) return null;

                return (
                  <div key={sec.id} className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
                      {sec.name}
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.type}
                            onClick={() => onAddComponent(item.type)}
                            className="group flex items-center justify-between p-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition cursor-pointer shadow-xs active:scale-[0.98]"
                            title="Click to add to canvas"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition shrink-0">
                                <Icon size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                                  {item.title}
                                </div>
                                <div className="text-[10px] text-zinc-400 truncate">
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-blue-600 text-white transition shrink-0"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= PAGES TAB ================= */}
        {activeTab === 'pages' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Application Pages
                </span>
                <span className="text-[10px] text-zinc-400 block font-mono">
                  {project.pages.length} screens
                </span>
              </div>
              <button
                onClick={() => setIsCreatingPage(true)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                <Plus size={13} />
                <span>Add Page</span>
              </button>
            </div>

            {/* Inline New Page Form */}
            {isCreatingPage && (
              <form onSubmit={handleCreatePageSubmit} className="p-3 border-b border-zinc-800 bg-zinc-900/60 space-y-2">
                <span className="text-[11px] font-semibold text-zinc-300 block">Create New Screen</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Dashboard, Checkout..."
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingPage(false)}
                    className="px-2 py-1 text-[11px] text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-blue-600 text-white text-[11px] font-semibold"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            {/* Pages List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {project.pages.map((p) => {
                const isActive = project.activePageId === p.id;
                const isHome = project.homePageId === p.id;
                const isEditing = editingPageId === p.id;

                return (
                  <div
                    key={p.id}
                    onClick={() => onSwitchPage(p.id)}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isActive
                        ? 'border-blue-500 bg-blue-500/10 shadow-xs'
                        : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {isHome ? (
                          <span title="Home starting screen">
                            <Home size={14} className="text-amber-400 shrink-0" />
                          </span>
                        ) : (
                          <Compass size={14} className="text-zinc-400 shrink-0" />
                        )}

                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingPageTitle}
                            onChange={(e) => setEditingPageTitle(e.target.value)}
                            onBlur={() => {
                              if (editingPageTitle.trim()) onRenamePage(p.id, editingPageTitle.trim());
                              setEditingPageId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingPageTitle.trim()) onRenamePage(p.id, editingPageTitle.trim());
                                setEditingPageId(null);
                              }
                            }}
                            className="bg-zinc-950 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white"
                          />
                        ) : (
                          <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-zinc-200'}`}>
                            {p.name}
                          </span>
                        )}

                        {isHome && (
                          <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                            Home
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!isHome && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSetHomePage(p.id);
                            }}
                            className="p-1 text-zinc-400 hover:text-amber-400 rounded"
                            title="Set as Home starting page"
                          >
                            <Home size={12} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPageId(p.id);
                            setEditingPageTitle(p.name);
                          }}
                          className="p-1 text-zinc-400 hover:text-white rounded"
                          title="Rename page"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicatePage(p.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-white rounded"
                          title="Duplicate page"
                        >
                          <Copy size={12} />
                        </button>
                        {project.pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete screen "${p.name}"?`)) onDeletePage(p.id);
                            }}
                            className="p-1 text-zinc-400 hover:text-red-400 rounded"
                            title="Delete page"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Path & Transition Settings */}
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60 font-mono">
                      <span>{p.path}</span>
                      <select
                        value={p.transition}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdatePageTransition(p.id, e.target.value as PageTransition);
                        }}
                        className="bg-zinc-950 border border-zinc-800 rounded px-1 text-[10px] text-zinc-300"
                        title="Screen transition effect"
                      >
                        <option value="fade">Fade</option>
                        <option value="slide-left">Slide Left</option>
                        <option value="slide-up">Slide Up</option>
                        <option value="none">Instant</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= LAYERS TAB ================= */}
        {activeTab === 'layers' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Layers Hierarchy
                </span>
                <span className="text-[10px] text-zinc-400 block font-mono">
                  {activePage.name} • {activePage.elements.length} elements
                </span>
              </div>
              {selectedElementId && (
                <button
                  onClick={onGroupSelected}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-medium flex items-center gap-1 cursor-pointer transition"
                  title="Wrap selected item into a Flex Container"
                >
                  <FolderPlus size={11} />
                  <span>Group</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {activePage.elements.length === 0 ? (
                <div className="text-zinc-500 text-center py-10 text-xs">
                  No elements on {activePage.name} yet.
                </div>
              ) : (
                activePage.elements.map((el, idx) =>
                  renderLayerTreeItem(el, idx, 0)
                )
              )}
            </div>
          </div>
        )}

        {/* ================= ASSETS TAB ================= */}
        {activeTab === 'assets' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
                Asset Vault
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">Stock photography & media</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Quick Insert Imagery
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {stockAssets.map((asset, i) => (
                  <div
                    key={i}
                    onClick={() => onAddComponent('image', { imageUrl: asset.url, imageAlt: asset.name })}
                    className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 cursor-pointer hover:border-zinc-700 transition"
                  >
                    <img src={asset.url} alt={asset.name} className="w-full h-24 object-cover" />
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-200 truncate">{asset.name}</span>
                      <span className="text-[9px] font-mono text-zinc-500">{asset.cat}</span>
                    </div>
                    <div className="absolute inset-0 bg-blue-600/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <Plus size={14} />
                      <span>Add to Canvas</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
