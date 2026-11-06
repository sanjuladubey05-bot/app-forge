import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Layout, 
  GitBranch, 
  Database, 
  Play, 
  Download, 
  Undo2, 
  Redo2, 
  Plus, 
  Layers, 
  Film,
  Moon,
  Sun,
  X,
  ArrowRight,
  Keyboard
} from 'lucide-react';
import { Page, ComponentType, WorkspaceMode } from '../types/editor';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  pages: Page[];
  onSwitchPage: (pageId: string) => void;
  onAddComponent: (type: ComponentType) => void;
  workspaceMode: WorkspaceMode;
  onChangeMode: (mode: WorkspaceMode) => void;
  onOpenPreview: () => void;
  onOpenExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenShortcutsModal?: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

interface CommandItem {
  id: string;
  category: 'Modes' | 'Navigation' | 'Components' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  pages,
  onSwitchPage,
  onAddComponent,
  workspaceMode,
  onChangeMode,
  onOpenPreview,
  onOpenExport,
  onUndo,
  onRedo,
  onOpenShortcutsModal,
  onToggleTheme,
  isDark,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      // Modes
      {
        id: 'mode-design',
        category: 'Modes',
        title: 'Switch to Design Mode',
        subtitle: 'Canvas visual layout, appearance, and motion styling',
        icon: <Layout size={14} className="text-blue-400" />,
        shortcut: 'Alt+1',
        action: () => onChangeMode('design'),
      },
      {
        id: 'mode-logic',
        category: 'Modes',
        title: 'Switch to Logic Mode',
        subtitle: 'Visual node workflow graph, conditions, and triggers',
        icon: <GitBranch size={14} className="text-emerald-400" />,
        shortcut: 'Alt+2',
        action: () => onChangeMode('logic'),
      },
      {
        id: 'mode-data',
        category: 'Modes',
        title: 'Switch to Data Studio Mode',
        subtitle: 'Database collections, schema fields, and variables',
        icon: <Database size={14} className="text-amber-400" />,
        shortcut: 'Alt+3',
        action: () => onChangeMode('data'),
      },
      // Actions
      {
        id: 'action-preview',
        category: 'Actions',
        title: 'Launch Interactive Prototype Preview',
        subtitle: 'Test button interactions, navigation, and motion effects',
        icon: <Play size={14} className="text-emerald-400" />,
        shortcut: 'Ctrl+P',
        action: onOpenPreview,
      },
      {
        id: 'action-export',
        category: 'Actions',
        title: 'Export Production Code & JSON Specification',
        subtitle: 'Download standalone HTML5, JSON, and React components',
        icon: <Download size={14} className="text-blue-400" />,
        shortcut: 'Ctrl+E',
        action: onOpenExport,
      },
      {
        id: 'action-undo',
        category: 'Actions',
        title: 'Undo Last Action',
        subtitle: 'Revert previous state modification',
        icon: <Undo2 size={14} className="text-zinc-400" />,
        shortcut: 'Ctrl+Z',
        action: onUndo,
      },
      {
        id: 'action-redo',
        category: 'Actions',
        title: 'Redo Action',
        subtitle: 'Re-apply previously reverted modification',
        icon: <Redo2 size={14} className="text-zinc-400" />,
        shortcut: 'Ctrl+Y',
        action: onRedo,
      },
      {
        id: 'action-theme',
        category: 'Actions',
        title: `Switch Theme to ${isDark ? 'Light' : 'Dark'} Mode`,
        subtitle: 'Toggle studio interface illumination',
        icon: isDark ? <Sun size={14} className="text-amber-300" /> : <Moon size={14} className="text-blue-400" />,
        action: onToggleTheme,
      },
      ...(onOpenShortcutsModal ? [{
        id: 'action-shortcuts',
        category: 'Actions' as const,
        title: 'Configure Keyboard Shortcuts',
        subtitle: 'Customize global hotkeys for operations, preview, and editing',
        icon: <Keyboard size={14} className="text-blue-400" />,
        action: onOpenShortcutsModal,
      }] : []),
    ];

    // Navigation (Screens)
    pages.forEach((p) => {
      list.push({
        id: `page-${p.id}`,
        category: 'Navigation',
        title: `Go to screen: ${p.name}`,
        subtitle: `Route path: ${p.path} (${p.elements.length} elements)`,
        icon: <Layers size={14} className="text-indigo-400" />,
        action: () => onSwitchPage(p.id),
      });
    });

    // Components
    const componentTypes: { type: ComponentType; label: string; desc: string }[] = [
      { type: 'button', label: 'Action Button', desc: 'Interactive click button with motion and triggers' },
      { type: 'heading', label: 'Heading Text', desc: 'H1, H2, or H3 typography block' },
      { type: 'text', label: 'Paragraph Text', desc: 'Multipurpose typography block' },
      { type: 'card', label: 'Container Card', desc: 'Structured surface card container' },
      { type: 'input', label: 'Text Input', desc: 'Form field for single line entries' },
      { type: 'metric', label: 'Metric Stat Card', desc: 'Key performance indicator block' },
      { type: 'table', label: 'Data Table', desc: 'Multi-column data record grid' },
      { type: 'toggle', label: 'Switch Toggle', desc: 'Interactive boolean toggle switch' },
    ];

    componentTypes.forEach((c) => {
      list.push({
        id: `comp-${c.type}`,
        category: 'Components',
        title: `Insert ${c.label}`,
        subtitle: c.desc,
        icon: <Plus size={14} className="text-emerald-400" />,
        action: () => onAddComponent(c.type),
      });
    });

    return list;
  }, [pages, onChangeMode, onOpenPreview, onOpenExport, onUndo, onRedo, onToggleTheme, isDark, onSwitchPage, onAddComponent]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-zinc-800 flex items-center gap-3">
          <Search size={16} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command, screen name, or component to insert..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-500 hover:text-zinc-300 rounded"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching commands found for "{query}".
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                    isSelected ? 'bg-blue-600/15 border border-blue-500/30 text-white' : 'hover:bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && <ArrowRight size={12} className="text-blue-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-zinc-800 bg-zinc-900/40 px-4 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Navigate with <kbd className="text-[10px] font-mono text-zinc-400">↑</kbd> <kbd className="text-[10px] font-mono text-zinc-400">↓</kbd></span>
          <span>Press <kbd className="text-[10px] font-mono text-zinc-400">Enter</kbd> to execute</span>
        </div>
      </div>
    </div>
  );
};
