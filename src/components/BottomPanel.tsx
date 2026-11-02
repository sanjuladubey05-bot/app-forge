import React, { useState } from 'react';
import { 
  Layers, 
  Image as ImageIcon, 
  Zap, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Lock, 
  Trash2, 
  Plus, 
  Check, 
  Sparkles,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  BottomPanelTab, 
  CanvasElement, 
  ComponentType 
} from '../types/editor';

interface BottomPanelProps {
  activeTab: BottomPanelTab;
  onChangeTab: (tab: BottomPanelTab) => void;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onMoveElement: (index: number, direction: 'up' | 'down') => void;
  onToggleVisibility: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onAddElement: (type: ComponentType, customProps?: Record<string, any>) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  activeTab,
  onChangeTab,
  elements,
  selectedElementId,
  onSelectElement,
  onMoveElement,
  onToggleVisibility,
  onDeleteElement,
  onAddElement,
  onUpdateElement,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newEventAction, setNewEventAction] = useState<'toast' | 'alert' | 'link'>('toast');
  const [newEventPayload, setNewEventPayload] = useState('Action executed successfully!');

  const stockAssets = [
    {
      name: 'Modern SaaS Analytics',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      category: 'Analytics',
    },
    {
      name: 'Vibrant Mesh Gradient',
      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
      category: 'Abstract',
    },
    {
      name: 'Clean Workspace & Code',
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      category: 'Tech',
    },
    {
      name: 'Collaborative Team',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      category: 'Team',
    },
    {
      name: 'Data Visualization Sphere',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      category: 'Security',
    },
  ];

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const handleAddEvent = () => {
    if (!selectedElement) return;
    const newEvent = {
      id: 'ev_' + Math.random().toString(36).substring(2, 7),
      trigger: 'onClick' as const,
      action: newEventAction,
      actionPayload: newEventPayload,
    };
    onUpdateElement(selectedElement.id, {
      events: [...selectedElement.events, newEvent],
    });
  };

  const handleRemoveEvent = (eventId: string) => {
    if (!selectedElement) return;
    onUpdateElement(selectedElement.id, {
      events: selectedElement.events.filter((ev) => ev.id !== eventId),
    });
  };

  return (
    <footer
      className={`border-t border-zinc-800 bg-zinc-950 flex flex-col shrink-0 select-none transition-all duration-200 ${
        isExpanded ? 'h-72' : 'h-44'
      }`}
    >
      {/* Top Tabs Bar */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-zinc-950 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeTab('layers')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-t transition cursor-pointer ${
              activeTab === 'layers'
                ? 'border-b-2 border-blue-500 text-blue-400 bg-zinc-900/60 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers size={13} />
            <span>Layers ({elements.length})</span>
          </button>

          <button
            onClick={() => onChangeTab('assets')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-t transition cursor-pointer ${
              activeTab === 'assets'
                ? 'border-b-2 border-blue-500 text-blue-400 bg-zinc-900/60 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon size={13} />
            <span>Assets Library</span>
          </button>

          <button
            onClick={() => onChangeTab('events')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-t transition cursor-pointer ${
              activeTab === 'events'
                ? 'border-b-2 border-blue-500 text-blue-400 bg-zinc-900/60 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Zap size={13} />
            <span>
              Events & Logic {selectedElement ? `(${selectedElement.events.length})` : ''}
            </span>
          </button>
        </div>

        {/* Height Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
          title={isExpanded ? 'Collapse drawer' : 'Expand drawer'}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Panel Content Area */}
      <div className="flex-1 overflow-y-auto p-3 text-xs">
        {/* LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="space-y-1">
            {elements.length === 0 ? (
              <div className="text-zinc-500 text-center py-6">No layers yet on canvas</div>
            ) : (
              elements.map((element, idx) => {
                const isSelected = selectedElementId === element.id;
                return (
                  <div
                    key={element.id}
                    onClick={() => onSelectElement(element.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-white font-medium'
                        : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] text-zinc-400 w-4">
                        {idx + 1}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 uppercase">
                        {element.type}
                      </span>
                      <span className="truncate text-xs">{element.name}</span>
                      {element.events.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                          <Zap size={10} />
                          {element.events.length}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label={`Move ${element.name} up`}
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveElement(idx, 'up');
                        }}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 rounded"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${element.name} down`}
                        disabled={idx === elements.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveElement(idx, 'down');
                        }}
                        className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 rounded"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Toggle visibility of ${element.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(element.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-white rounded"
                        title={element.hidden ? 'Show' : 'Hide'}
                      >
                        {element.hidden ? <EyeOff size={12} className="text-amber-400" /> : <Eye size={12} />}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${element.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement(element.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-red-400 rounded"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ASSETS TAB */}
        {activeTab === 'assets' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Curated Stock Assets (Click to insert or apply to selected image)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {stockAssets.map((asset, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 flex flex-col"
                >
                  <img src={asset.url} alt={asset.name} className="w-full h-20 object-cover" />
                  <div className="p-2">
                    <div className="text-[11px] font-medium text-zinc-200 truncate">{asset.name}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{asset.category}</div>
                  </div>

                  {/* Hover Quick Action */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 gap-1.5">
                    {selectedElement?.type === 'image' ? (
                      <button
                        onClick={() => {
                          onUpdateElement(selectedElement.id, {
                            props: { ...selectedElement.props, imageUrl: asset.url },
                          });
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-medium transition"
                      >
                        Apply to Selected
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onAddElement('image', { imageUrl: asset.url, imageAlt: asset.name });
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-medium flex items-center gap-1 transition"
                      >
                        <Plus size={11} />
                        Insert Box
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div>
            {!selectedElement ? (
              <div className="text-zinc-500 text-center py-6 flex flex-col items-center">
                <Zap size={20} className="mb-2 text-zinc-600" />
                <span>Select a component on the canvas to configure its click or change events.</span>
              </div>
            ) : (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-400" />
                    Configure Interactions for [{selectedElement.name}]
                  </span>
                </div>

                {/* Event Creation Form */}
                <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                        Trigger
                      </label>
                      <select
                        disabled
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                      >
                        <option>On Click (Tap)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                        Action Type
                      </label>
                      <select
                        value={newEventAction}
                        onChange={(e) => setNewEventAction(e.target.value as any)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                      >
                        <option value="toast">Show Notification Toast</option>
                        <option value="alert">Show Alert Dialog</option>
                        <option value="link">Navigate to URL</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
                        Message / URL
                      </label>
                      <input
                        type="text"
                        value={newEventPayload}
                        onChange={(e) => setNewEventPayload(e.target.value)}
                        placeholder="e.g. Order submitted!"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddEvent}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1 cursor-pointer shadow-xs transition"
                  >
                    <Plus size={13} />
                    <span>Add Event Binding</span>
                  </button>
                </div>

                {/* Existing Events List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                    Configured Events ({selectedElement.events.length})
                  </span>
                  {selectedElement.events.length === 0 ? (
                    <div className="text-zinc-500 text-[11px] italic">No event triggers configured yet.</div>
                  ) : (
                    selectedElement.events.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="font-mono text-zinc-400 font-semibold">{ev.trigger}</span>
                          <span className="text-zinc-600">→</span>
                          <span className="text-white font-medium capitalize">{ev.action}:</span>
                          <span className="text-zinc-400 truncate max-w-xs">{ev.actionPayload}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveEvent(ev.id)}
                          className="p-1 text-zinc-500 hover:text-red-400 transition"
                          title="Remove event"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};
