import React, { useState, useEffect } from 'react';
import { 
  X, 
  Keyboard, 
  Search, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Command,
  Sliders
} from 'lucide-react';
import { 
  STANDARD_SHORTCUTS, 
  ShortcutActionId, 
  eventToKeyCombo, 
  findShortcutConflict 
} from '../utils/shortcut-manager';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: Record<ShortcutActionId, string>;
  onSaveShortcuts: (updated: Record<ShortcutActionId, string>) => void;
  onResetShortcuts: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts,
  onSaveShortcuts,
  onResetShortcuts,
}) => {
  const [localShortcuts, setLocalShortcuts] = useState<Record<ShortcutActionId, string>>(shortcuts);
  const [searchQuery, setSearchQuery] = useState('');
  const [recordingActionId, setRecordingActionId] = useState<ShortcutActionId | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalShortcuts(shortcuts);
    setRecordingActionId(null);
    setConflictWarning(null);
  }, [shortcuts, isOpen]);

  // Close on Escape when not recording keys
  useEffect(() => {
    if (!isOpen) return;

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !recordingActionId) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown);
    return () => window.removeEventListener('keydown', handleWindowKeyDown);
  }, [isOpen, recordingActionId, onClose]);

  // Listener when recording a new hotkey
  useEffect(() => {
    if (!recordingActionId) return;

    const handleRecordKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Cancel on Escape
      if (e.key === 'Escape') {
        setRecordingActionId(null);
        setConflictWarning(null);
        return;
      }

      const combo = eventToKeyCombo(e);
      if (!combo) return; // Standalone modifier pressed

      // Check conflict
      const conflict = findShortcutConflict(recordingActionId, combo, localShortcuts);
      if (conflict) {
        setConflictWarning(
          `"${combo}" is already assigned to "${conflict.conflictingName}". It will be reassigned.`
        );
      } else {
        setConflictWarning(null);
      }

      setLocalShortcuts((prev) => ({
        ...prev,
        [recordingActionId]: combo,
      }));
      setRecordingActionId(null);
    };

    window.addEventListener('keydown', handleRecordKey, true);
    return () => window.removeEventListener('keydown', handleRecordKey, true);
  }, [recordingActionId, localShortcuts]);

  if (!isOpen) return null;

  const categories = ['Canvas & Editing', 'Application', 'Modes'] as const;

  const handleResetSingle = (id: ShortcutActionId, defaultKey: string) => {
    setLocalShortcuts((prev) => ({
      ...prev,
      [id]: defaultKey,
    }));
    setConflictWarning(null);
  };

  const handleSave = () => {
    onSaveShortcuts(localShortcuts);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 400);
  };

  const filteredShortcuts = STANDARD_SHORTCUTS.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (localShortcuts[item.id] || item.defaultKey).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div 
        className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 font-sans"
        data-testid="keyboard-shortcuts-modal"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-400">
              <Keyboard size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>Keyboard Shortcuts Manager</span>
                <span className="text-[10px] font-mono text-zinc-400 font-normal">Settings Configuration</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Customize global hotkeys for application workflows and element editing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Recording Banner */}
        <div className="p-3 border-b border-zinc-800/80 bg-zinc-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search shortcut name, action, or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
              data-testid="shortcut-search-input"
            />
          </div>

          <button
            onClick={() => {
              onResetShortcuts();
              setConflictWarning(null);
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition cursor-pointer shrink-0"
            title="Reset all shortcuts to factory defaults"
            data-testid="reset-all-shortcuts-btn"
          >
            <RotateCcw size={12} />
            <span>Reset All Defaults</span>
          </button>
        </div>

        {/* Conflict / Recording Alert Banner */}
        {recordingActionId && (
          <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/50 flex items-center justify-between text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>
                Press any key combination on your keyboard for <strong>{STANDARD_SHORTCUTS.find((s) => s.id === recordingActionId)?.name}</strong>...
              </span>
            </div>
            <button
              onClick={() => setRecordingActionId(null)}
              className="text-[11px] underline text-blue-400 hover:text-blue-200 cursor-pointer"
            >
              Cancel (Esc)
            </button>
          </div>
        )}

        {conflictWarning && (
          <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/50 flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle size={13} className="shrink-0 text-amber-400" />
            <span>{conflictWarning}</span>
          </div>
        )}

        {/* Shortcuts List grouped by Category */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {categories.map((cat) => {
            const items = filteredShortcuts.filter((s) => s.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
                  {cat}
                </div>

                <div className="divide-y divide-zinc-850 rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                  {items.map((item) => {
                    const currentKey = localShortcuts[item.id] || item.defaultKey;
                    const isRecording = recordingActionId === item.id;
                    const isModified = currentKey !== item.defaultKey;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 flex items-center justify-between gap-3 transition ${
                          isRecording ? 'bg-blue-950/20' : 'hover:bg-zinc-900/70'
                        }`}
                        data-testid={`shortcut-row-${item.id}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-zinc-200">
                              {item.name}
                            </span>
                            {isModified && (
                              <span className="text-[9px] font-mono text-blue-400">
                                (customized)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                            {item.description}
                          </div>
                        </div>

                        {/* Key assignment button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isModified && (
                            <button
                              onClick={() => handleResetSingle(item.id, item.defaultKey)}
                              className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition"
                              title={`Reset to default (${item.defaultKey})`}
                            >
                              <RotateCcw size={12} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setRecordingActionId(item.id);
                              setConflictWarning(null);
                            }}
                            className={`min-w-[90px] px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
                              isRecording
                                ? 'border-blue-500 bg-blue-600 text-white animate-pulse'
                                : 'border-zinc-750 bg-zinc-950 text-zinc-200 hover:border-zinc-600 hover:text-white'
                            }`}
                            title="Click to record new shortcut"
                            data-testid={`record-btn-${item.id}`}
                          >
                            {isRecording ? (
                              <span>Press keys...</span>
                            ) : (
                              <span>{currentKey}</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Click any shortcut button to assign custom hotkeys.
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition cursor-pointer"
              data-testid="save-shortcuts-btn"
            >
              {saveSuccess ? (
                <>
                  <Check size={13} className="text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Shortcuts</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
