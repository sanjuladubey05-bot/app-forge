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
  Compass,
  X,
  Tag,
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  Crosshair,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  StretchHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  AlignJustify
} from 'lucide-react';
import { 
  CanvasElement, 
  ComponentType, 
  LeftPanelTab, 
  Page, 
  PageTransition, 
  Project,
  AlignmentType
} from '../types/editor';
import { getActivePage } from '../utils/project-engine';
import { PREBUILT_SECTIONS, PrebuiltSection, SectionCategory } from '../utils/section-library';

interface LeftSidebarProps {
  project: Project;
  activeTab: LeftPanelTab;
  onChangeTab: (tab: LeftPanelTab) => void;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onAddComponent: (type: ComponentType, customProps?: Record<string, any>) => void;
  onAddSection?: (elements: CanvasElement[]) => void;
  onAlignElements?: (type: AlignmentType) => void;
  // Multi-page handlers
  onSwitchPage: (pageId: string) => void;
  onCreatePage: (name: string, path?: string, transition?: PageTransition) => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, name: string) => void;
  onSetHomePage: (pageId: string) => void;
  onUpdatePageTransition: (pageId: string, transition: PageTransition) => void;
  // Advanced Layer handlers
  onMoveElement: (elementId: string, direction: 'up' | 'down') => void;
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
  onAddSection,
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
  onAlignElements,
}) => {
  const [componentSearch, setComponentSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(0);
  const [sectionSearch, setSectionSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
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
        { 
          type: 'navbar' as ComponentType, 
          title: 'Navigation Bar', 
          desc: 'Header bar with brand, links & CTA', 
          icon: Compass,
          tags: ['navbar', 'header', 'menu', 'navigation', 'links', 'top', 'layout']
        },
        { 
          type: 'container' as ComponentType, 
          title: 'Flex Container', 
          desc: 'Auto-layout wrapper for grouping children', 
          icon: Box,
          tags: ['container', 'flex', 'layout', 'box', 'stack', 'wrapper', 'group', 'div']
        },
        { 
          type: 'card' as ComponentType, 
          title: 'Card Container', 
          desc: 'Surface with border, padding and elevation', 
          icon: CreditCard,
          tags: ['card', 'surface', 'box', 'panel', 'container', 'layout', 'elevation']
        },
        { 
          type: 'divider' as ComponentType, 
          title: 'Divider Line', 
          desc: 'Horizontal separation rule', 
          icon: Minus,
          tags: ['divider', 'line', 'rule', 'separator', 'border', 'hr', 'layout']
        },
      ],
    },
    {
      id: 'typography',
      name: 'Typography',
      items: [
        { 
          type: 'heading' as ComponentType, 
          title: 'Heading Block', 
          desc: 'H1, H2, or H3 with optional subtext', 
          icon: Heading1,
          tags: ['heading', 'title', 'h1', 'h2', 'h3', 'text', 'typography', 'header']
        },
        { 
          type: 'text' as ComponentType, 
          title: 'Paragraph Text', 
          desc: 'Formatted body copy and descriptions', 
          icon: Type,
          tags: ['text', 'paragraph', 'body', 'copy', 'typography', 'content', 'p']
        },
        { 
          type: 'badge' as ComponentType, 
          title: 'Status Badge', 
          desc: 'Pill tag for tags or statuses', 
          icon: CheckSquare,
          tags: ['badge', 'tag', 'pill', 'status', 'chip', 'label']
        },
      ],
    },
    {
      id: 'forms',
      name: 'Forms & Inputs',
      items: [
        { 
          type: 'button' as ComponentType, 
          title: 'Action Button', 
          desc: 'Interactive button with action pipeline', 
          icon: Square,
          tags: ['button', 'cta', 'click', 'action', 'press', 'interactive', 'submit']
        },
        { 
          type: 'input' as ComponentType, 
          title: 'Text Input', 
          desc: 'Single-line field with label', 
          icon: TextCursorInput,
          tags: ['input', 'form', 'text', 'field', 'email', 'entry', 'box']
        },
        { 
          type: 'textarea' as ComponentType, 
          title: 'Textarea Field', 
          desc: 'Multi-line message or bio field', 
          icon: FileText,
          tags: ['textarea', 'message', 'form', 'multi-line', 'bio', 'field', 'comments']
        },
        { 
          type: 'select' as ComponentType, 
          title: 'Dropdown Select', 
          desc: 'Option list selector', 
          icon: ListFilter,
          tags: ['select', 'dropdown', 'picker', 'form', 'options', 'list', 'menu']
        },
        { 
          type: 'toggle' as ComponentType, 
          title: 'Switch Toggle', 
          desc: 'Boolean switch control', 
          icon: ToggleLeft,
          tags: ['toggle', 'switch', 'boolean', 'form', 'checkbox', 'binary', 'active']
        },
      ],
    },
    {
      id: 'data',
      name: 'Data & Display',
      items: [
        { 
          type: 'metric' as ComponentType, 
          title: 'Metric KPI Card', 
          desc: 'Counter with trend percentage', 
          icon: BarChart3,
          tags: ['metric', 'kpi', 'stat', 'analytics', 'counter', 'number', 'data', 'chart']
        },
        { 
          type: 'image' as ComponentType, 
          title: 'Image Box', 
          desc: 'Responsive media element', 
          icon: ImageIcon,
          tags: ['image', 'photo', 'picture', 'media', 'asset', 'illustration', 'banner']
        },
        { 
          type: 'table' as ComponentType, 
          title: 'Data Table', 
          desc: 'Structured columns and records', 
          icon: Table,
          tags: ['table', 'grid', 'data', 'records', 'rows', 'columns', 'spreadsheet']
        },
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

  const renderLayerTreeItem = (element: CanvasElement, index: number, depth: number = 0, siblingsCount: number = activePage.elements.length) => {
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
                onMoveElement(element.id, 'up');
              }}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
              title="Move Up"
            >
              <ArrowUp size={11} />
            </button>
            <button
              type="button"
              disabled={index >= siblingsCount - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMoveElement(element.id, 'down');
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
              renderLayerTreeItem(child, cIdx, depth + 1, element.children?.length || 0)
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
          { id: 'sections' as LeftPanelTab, label: 'Sections', icon: Sparkles, badge: PREBUILT_SECTIONS.length },
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
              
              {/* Search Filter Component with Keyboard Navigation */}
              <div className="space-y-2 mt-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search elements (↓/↑ navigate, ↵ add)..."
                    value={componentSearch}
                    onChange={(e) => {
                      setComponentSearch(e.target.value);
                      setFocusedItemIndex(0);
                    }}
                    onKeyDown={(e) => {
                      // We will capture this with the flattened list
                      const q = componentSearch.trim().toLowerCase();
                      const matchesTag = (tags: string[], sectionId: string) => {
                        if (selectedTag === 'all') return true;
                        if (selectedTag === 'layout') return sectionId === 'containers' || tags.includes('layout');
                        if (selectedTag === 'typography') return sectionId === 'typography' || tags.includes('typography') || tags.includes('text');
                        if (selectedTag === 'forms') return sectionId === 'forms' || tags.includes('form') || tags.includes('button');
                        if (selectedTag === 'data') return sectionId === 'data' || tags.includes('data');
                        return tags.includes(selectedTag);
                      };
                      const flatItems = componentSections.flatMap((sec) =>
                        sec.items.filter((item) => {
                          const tagOk = matchesTag(item.tags, sec.id);
                          if (!tagOk) return false;
                          if (!q) return true;
                          const matchTitle = item.title.toLowerCase().includes(q);
                          const matchDesc = item.desc.toLowerCase().includes(q);
                          const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
                          return matchTitle || matchDesc || matchTag;
                        })
                      );

                      if (flatItems.length === 0) return;

                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setFocusedItemIndex((prev) => (prev + 1) % flatItems.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setFocusedItemIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = flatItems[focusedItemIndex] || flatItems[0];
                        if (target) {
                          onAddComponent(target.type);
                        }
                      } else if (e.key === 'Escape') {
                        setComponentSearch('');
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                    data-testid="element-search-input"
                  />
                  {componentSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setComponentSearch('');
                        setFocusedItemIndex(0);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition p-0.5 cursor-pointer"
                      title="Clear search"
                      data-testid="clear-search-btn"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Quick Category & Tag Filter Pills */}
                <div className="flex flex-wrap gap-1" data-testid="element-tag-filters">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'layout', label: 'Layout' },
                    { id: 'typography', label: 'Text' },
                    { id: 'forms', label: 'Forms' },
                    { id: 'data', label: 'Data' },
                  ].map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setSelectedTag(tag.id);
                        setFocusedItemIndex(0);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                        selectedTag === tag.id
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                      data-testid={`tag-filter-${tag.id}`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Align Elements Section */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 space-y-2" data-testid="align-elements-section">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                    Align Elements
                  </span>
                  <span className="text-[9px] text-zinc-400 font-mono">
                    {selectedElementId ? 'Selected Item' : 'Canvas Root'}
                  </span>
                </div>

                {/* Centering Controls */}
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-400 font-medium flex items-center justify-between">
                    <span>Centering</span>
                    <span className="text-[9px] text-zinc-400 font-mono">X / Y</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('center-h')}
                      className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[10px] font-medium transition cursor-pointer"
                      title="Center Horizontally (auto margins / align-self)"
                      data-testid="align-btn-center-h"
                    >
                      <AlignHorizontalJustifyCenter size={12} className="text-blue-400" />
                      <span>Center H</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('center-v')}
                      className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[10px] font-medium transition cursor-pointer"
                      title="Center Vertically"
                      data-testid="align-btn-center-v"
                    >
                      <AlignVerticalJustifyCenter size={12} className="text-blue-400" />
                      <span>Center V</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('center-both')}
                      className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[10px] font-medium transition cursor-pointer"
                      title="Center Both Dimensions"
                      data-testid="align-btn-center-both"
                    >
                      <Crosshair size={12} className="text-cyan-400" />
                      <span>Both</span>
                    </button>
                  </div>
                </div>

                {/* Anchoring Controls */}
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-400 font-medium">Anchoring</div>
                  <div className="grid grid-cols-5 gap-1">
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('anchor-left')}
                      className="flex flex-col items-center justify-center py-1 px-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[9px] transition cursor-pointer"
                      title="Anchor Left"
                      data-testid="align-btn-anchor-left"
                    >
                      <AlignHorizontalJustifyStart size={12} className="text-zinc-400" />
                      <span className="mt-0.5">Left</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('anchor-right')}
                      className="flex flex-col items-center justify-center py-1 px-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[9px] transition cursor-pointer"
                      title="Anchor Right"
                      data-testid="align-btn-anchor-right"
                    >
                      <AlignHorizontalJustifyEnd size={12} className="text-zinc-400" />
                      <span className="mt-0.5">Right</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('anchor-top')}
                      className="flex flex-col items-center justify-center py-1 px-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[9px] transition cursor-pointer"
                      title="Anchor Top"
                      data-testid="align-btn-anchor-top"
                    >
                      <AlignVerticalJustifyStart size={12} className="text-zinc-400" />
                      <span className="mt-0.5">Top</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('anchor-bottom')}
                      className="flex flex-col items-center justify-center py-1 px-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[9px] transition cursor-pointer"
                      title="Anchor Bottom"
                      data-testid="align-btn-anchor-bottom"
                    >
                      <AlignVerticalJustifyEnd size={12} className="text-zinc-400" />
                      <span className="mt-0.5">Btm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('full-width')}
                      className="flex flex-col items-center justify-center py-1 px-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[9px] transition cursor-pointer"
                      title="Full Width Stretch"
                      data-testid="align-btn-full-width"
                    >
                      <StretchHorizontal size={12} className="text-indigo-400" />
                      <span className="mt-0.5">Full</span>
                    </button>
                  </div>
                </div>

                {/* Distribute & Flow Controls */}
                <div className="space-y-1">
                  <div className="text-[9px] text-zinc-400 font-medium">Distribute</div>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('distribute-h')}
                      className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[9px] transition cursor-pointer"
                      title="Distribute Horizontally"
                      data-testid="align-btn-distribute-h"
                    >
                      <AlignHorizontalDistributeCenter size={11} className="text-emerald-400" />
                      <span>Dist H</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('distribute-v')}
                      className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[9px] transition cursor-pointer"
                      title="Distribute Vertically"
                      data-testid="align-btn-distribute-v"
                    >
                      <AlignVerticalDistributeCenter size={11} className="text-emerald-400" />
                      <span>Dist V</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAlignElements?.('space-between')}
                      className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/90 text-[9px] transition cursor-pointer"
                      title="Even Spacing & Margins"
                      data-testid="align-btn-space-between"
                    >
                      <AlignJustify size={11} className="text-amber-400" />
                      <span>Spacing</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtered Components List */}
            {(() => {
              const q = componentSearch.trim().toLowerCase();
              const matchesTag = (tags: string[], sectionId: string) => {
                if (selectedTag === 'all') return true;
                if (selectedTag === 'layout') return sectionId === 'containers' || tags.includes('layout');
                if (selectedTag === 'typography') return sectionId === 'typography' || tags.includes('typography') || tags.includes('text');
                if (selectedTag === 'forms') return sectionId === 'forms' || tags.includes('form') || tags.includes('button');
                if (selectedTag === 'data') return sectionId === 'data' || tags.includes('data');
                return tags.includes(selectedTag);
              };

              const filteredSections = componentSections.map((sec) => {
                const items = sec.items.filter((item) => {
                  const tagOk = matchesTag(item.tags, sec.id);
                  if (!tagOk) return false;
                  if (!q) return true;
                  const matchTitle = item.title.toLowerCase().includes(q);
                  const matchDesc = item.desc.toLowerCase().includes(q);
                  const matchTag = item.tags.some((t) => t.toLowerCase().includes(q));
                  return matchTitle || matchDesc || matchTag;
                });
                return { ...sec, items };
              }).filter((sec) => sec.items.length > 0);

              const totalCount = filteredSections.reduce((acc, sec) => acc + sec.items.length, 0);
              const flatItems = filteredSections.flatMap((s) => s.items);

              if (totalCount === 0) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 text-zinc-400">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                      <Search size={16} />
                    </div>
                    <div className="text-xs font-medium text-zinc-200">
                      No matching elements
                    </div>
                    <p className="text-[11px] text-zinc-500 max-w-[200px]">
                      No elements match "{componentSearch || selectedTag}". Try searching for button, flex, input, or table.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setComponentSearch('');
                        setSelectedTag('all');
                        setFocusedItemIndex(0);
                      }}
                      className="mt-1 px-3 py-1 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-blue-400 hover:text-blue-300 transition cursor-pointer"
                      data-testid="clear-filters-empty-btn"
                    >
                      Clear Filters
                    </button>
                  </div>
                );
              }

              let globalItemCounter = -1;

              return (
                <div className="flex-1 overflow-y-auto p-2.5 space-y-4" data-testid="component-items-list">
                  {filteredSections.map((sec) => (
                    <div key={sec.id} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          {sec.name}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          {sec.items.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {sec.items.map((item) => {
                          globalItemCounter++;
                          const currentFlatIndex = globalItemCounter;
                          const isKeyboardSelected = currentFlatIndex === focusedItemIndex;
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.type}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', item.type);
                                e.dataTransfer.effectAllowed = 'copy';
                              }}
                              onClick={() => {
                                setFocusedItemIndex(currentFlatIndex);
                                onAddComponent(item.type);
                              }}
                              className={`group flex items-start justify-between p-2 rounded-xl border transition cursor-pointer shadow-xs active:scale-[0.98] ${
                                isKeyboardSelected
                                  ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/50'
                                  : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700'
                              }`}
                              title={`Click or drag ${item.title} to canvas (or press Enter)`}
                              data-testid={`add-element-${item.type}`}
                              data-selected={isKeyboardSelected ? 'true' : 'false'}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                                  isKeyboardSelected
                                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/40'
                                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 group-hover:text-blue-400 group-hover:border-blue-500/30'
                                }`}>
                                  <Icon size={14} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-xs font-medium truncate ${isKeyboardSelected ? 'text-white font-semibold' : 'text-zinc-200 group-hover:text-white'}`}>
                                      {item.title}
                                    </span>
                                    {isKeyboardSelected && (
                                      <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-mono shadow-xs shrink-0">
                                        ↵ Enter
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-zinc-400 truncate">
                                    {item.desc}
                                  </div>
                                  {/* Tags Chips */}
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.tags.slice(0, 3).map((tg) => (
                                      <span
                                        key={tg}
                                        className={`text-[9px] font-mono px-1 py-0.2 rounded border ${
                                          q && tg.toLowerCase().includes(q)
                                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 font-medium'
                                            : 'bg-zinc-950 text-zinc-500 border-zinc-800/80'
                                        }`}
                                      >
                                        #{tg}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                className={`p-1 rounded-md transition shrink-0 mt-1 ${
                                  isKeyboardSelected
                                    ? 'bg-blue-600 text-white opacity-100'
                                    : 'opacity-0 group-hover:opacity-100 bg-blue-600 text-white'
                                }`}
                              >
                                <Plus size={11} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ================= SECTIONS LIBRARY TAB ================= */}
        {activeTab === 'sections' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Section Library
                </span>
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-400" />
                  14 Prebuilt
                </span>
              </div>

              {/* Search */}
              <div className="relative mb-2.5">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search sections (e.g. hero, pricing)..."
                  value={sectionSearch}
                  onChange={(e) => setSectionSearch(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Category Segmented Controls */}
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'website', label: 'Website' },
                  { id: 'content', label: 'Content' },
                  { id: 'business', label: 'Business' },
                  { id: 'account', label: 'Account' },
                  { id: 'application', label: 'App UI' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
              {PREBUILT_SECTIONS.filter((sec) => {
                const matchesCat = activeCategory === 'all' || sec.category === activeCategory;
                const matchesSearch =
                  sec.name.toLowerCase().includes(sectionSearch.toLowerCase()) ||
                  sec.description.toLowerCase().includes(sectionSearch.toLowerCase()) ||
                  sec.categoryLabel.toLowerCase().includes(sectionSearch.toLowerCase());
                return matchesCat && matchesSearch;
              }).map((sec) => (
                <div
                  key={sec.id}
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700 transition flex flex-col justify-between group space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                        {sec.name}
                      </span>
                      {sec.badge && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          {sec.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                      {sec.description}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                      <span className="text-zinc-400 font-sans">{sec.categoryLabel}</span>
                      <span>·</span>
                      <span>{sec.elements.length} elements</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onAddSection) {
                        onAddSection(sec.elements());
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-600/10 active:scale-[0.98]"
                  >
                    <Plus size={13} />
                    <span>Add to Canvas</span>
                  </button>
                </div>
              ))}
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
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeletePage(p.id);
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
                  renderLayerTreeItem(el, idx, 0, activePage.elements.length)
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
                    <img
                      src={asset.url}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = '0.25';
                      }}
                      className="w-full h-24 object-cover bg-zinc-800"
                    />
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
