import React, { useState } from 'react';
import { 
  Type, 
  Heading1, 
  Square, 
  CreditCard, 
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
  Sparkles
} from 'lucide-react';
import { ComponentType } from '../types/editor';

interface ComponentLibraryProps {
  onAddComponent: (type: ComponentType) => void;
}

interface ComponentDefinition {
  type: ComponentType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
}

export const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ onAddComponent }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    layout: true,
    typography: true,
    forms: true,
    data: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sections: { id: string; name: string; items: ComponentDefinition[] }[] = [
    {
      id: 'layout',
      name: 'Layout & Containers',
      items: [
        {
          type: 'card',
          title: 'Card Container',
          description: 'Modular surface with border, shadow, and inner padding.',
          icon: CreditCard,
          tag: 'Container',
        },
        {
          type: 'divider',
          title: 'Divider Line',
          description: 'Horizontal separator rule with customizable margins.',
          icon: Minus,
          tag: 'Utility',
        },
      ],
    },
    {
      id: 'typography',
      name: 'Typography',
      items: [
        {
          type: 'heading',
          title: 'Heading',
          description: 'Top-level header with optional subtitle paragraph.',
          icon: Heading1,
          tag: 'Text',
        },
        {
          type: 'text',
          title: 'Paragraph Text',
          description: 'Body copy, descriptions, and descriptive text block.',
          icon: Type,
          tag: 'Text',
        },
        {
          type: 'badge',
          title: 'Status Badge',
          description: 'Pill tag for status, versioning, or category highlight.',
          icon: CheckSquare,
          tag: 'Badge',
        },
      ],
    },
    {
      id: 'forms',
      name: 'Forms & Controls',
      items: [
        {
          type: 'button',
          title: 'Action Button',
          description: 'Trigger actions, event handlers, or page links.',
          icon: Square,
          tag: 'Action',
        },
        {
          type: 'input',
          title: 'Text Input',
          description: 'Single-line input with label and placeholder.',
          icon: TextCursorInput,
          tag: 'Input',
        },
        {
          type: 'textarea',
          title: 'Textarea Field',
          description: 'Multi-line message or long text field.',
          icon: FileText,
          tag: 'Input',
        },
        {
          type: 'select',
          title: 'Dropdown Select',
          description: 'Select picker with configurable option list.',
          icon: ListFilter,
          tag: 'Select',
        },
        {
          type: 'toggle',
          title: 'Switch Toggle',
          description: 'Binary toggle switch for preferences or booleans.',
          icon: ToggleLeft,
          tag: 'Toggle',
        },
      ],
    },
    {
      id: 'data',
      name: 'Data & Display',
      items: [
        {
          type: 'metric',
          title: 'Metric Stat Card',
          description: 'KPI counter with label, large value, and percentage trend.',
          icon: BarChart3,
          tag: 'Analytics',
        },
        {
          type: 'image',
          title: 'Image Box',
          description: 'Responsive media container with aspect ratio.',
          icon: ImageIcon,
          tag: 'Media',
        },
        {
          type: 'table',
          title: 'Data Table',
          description: 'Structured grid with column headers and striped rows.',
          icon: Table,
          tag: 'Grid',
        },
      ],
    },
  ];

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full shrink-0 select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Components
          </span>
          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
            <Sparkles size={11} className="text-blue-400" />
            13 items
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {sections.map((section) => {
          const visibleItems = section.items.filter(
            (item) =>
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.tag.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (visibleItems.length === 0) return null;

          const isOpen = openSections[section.id] ?? true;

          return (
            <div key={section.id} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-200 transition cursor-pointer"
              >
                <span>{section.name}</span>
                {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              </button>

              {/* Items in Category */}
              {isOpen && (
                <div className="grid grid-cols-1 gap-1.5 pt-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.type)}
                        onClick={() => onAddComponent(item.type)}
                        className="group flex items-center justify-between p-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-700 transition cursor-pointer shadow-xs active:scale-[0.98]"
                        title="Click to add or drag onto canvas"
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
                              {item.tag}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          aria-label={`Add ${item.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddComponent(item.type);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition shrink-0 cursor-pointer shadow-xs"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
