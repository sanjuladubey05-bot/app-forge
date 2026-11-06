import React, { useState } from 'react';
import { 
  Database, 
  Table as TableIcon, 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  Sliders, 
  Key, 
  Check, 
  Hash, 
  Mail, 
  Calendar, 
  ToggleLeft, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { Project, DataCollection, DataField, AppVariable } from '../types/editor';

interface DataStudioProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  onLogExecution: (source: string, msg: string, type?: any, status?: any) => void;
}

export const DataStudio: React.FC<DataStudioProps> = ({
  project,
  onUpdateProject,
  onLogExecution,
}) => {
  const collections = project.collections || [];
  const variables = project.variables || [];

  const [activeCollectionId, setActiveCollectionId] = useState<string>(
    collections[0]?.id || ''
  );
  const [subTab, setSubTab] = useState<'records' | 'schema' | 'variables'>('records');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / forms state
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});
  const [isNewFieldOpen, setIsNewFieldOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<DataField['type']>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const [isNewCollectionOpen, setIsNewCollectionOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');

  const activeCollection = collections.find((c) => c.id === activeCollectionId) || collections[0];

  // Handlers for Collections
  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    const newCol: DataCollection = {
      id: 'col_' + Math.random().toString(36).substring(2, 8),
      name: newCollectionName.trim(),
      description: newCollectionDesc.trim() || 'Custom user data collection',
      fields: [
        { id: 'f_id', name: 'ID', type: 'text', required: true },
        { id: 'f_title', name: 'Title', type: 'text', required: true },
      ],
      records: [
        { id: 'rec_init', f_id: '101', f_title: 'Sample Item 1' },
      ],
    };

    const updated = [...collections, newCol];
    onUpdateProject({ collections: updated });
    setActiveCollectionId(newCol.id);
    setIsNewCollectionOpen(false);
    setNewCollectionName('');
    setNewCollectionDesc('');
    onLogExecution('DataStudio', `Created collection "${newCol.name}" with initial schema`, 'action', 'success');
  };

  const handleDeleteCollection = (colId: string) => {
    if (collections.length <= 1) return;
    const updated = collections.filter((c) => c.id !== colId);
    onUpdateProject({ collections: updated });
    if (activeCollectionId === colId) {
      setActiveCollectionId(updated[0]?.id || '');
    }
    onLogExecution('DataStudio', `Deleted collection`, 'action', 'info');
  };

  // Handlers for Records
  const handleAddRecord = () => {
    if (!activeCollection) return;
    const recordId = 'rec_' + Math.random().toString(36).substring(2, 9);
    const newRecord: Record<string, any> = { id: recordId, ...newRecordData };

    const updatedCollections = collections.map((c) => {
      if (c.id !== activeCollection.id) return c;
      return {
        ...c,
        records: [newRecord, ...c.records],
      };
    });

    onUpdateProject({ collections: updatedCollections });
    setIsNewRecordOpen(false);
    setNewRecordData({});
    onLogExecution('DataStudio', `Added record to "${activeCollection.name}"`, 'action', 'success');
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!activeCollection) return;
    const updatedCollections = collections.map((c) => {
      if (c.id !== activeCollection.id) return c;
      return {
        ...c,
        records: c.records.filter((r) => r.id !== recordId),
      };
    });
    onUpdateProject({ collections: updatedCollections });
    onLogExecution('DataStudio', `Deleted record from "${activeCollection.name}"`, 'action', 'info');
  };

  // Handlers for Schema Fields
  const handleAddField = () => {
    if (!activeCollection || !newFieldName.trim()) return;
    const fieldId = 'f_' + Math.random().toString(36).substring(2, 8);
    const newField: DataField = {
      id: fieldId,
      name: newFieldName.trim(),
      type: newFieldType,
      required: newFieldRequired,
    };

    const updatedCollections = collections.map((c) => {
      if (c.id !== activeCollection.id) return c;
      return {
        ...c,
        fields: [...c.fields, newField],
      };
    });

    onUpdateProject({ collections: updatedCollections });
    setIsNewFieldOpen(false);
    setNewFieldName('');
    setNewFieldRequired(false);
    onLogExecution('DataStudio', `Added field "${newField.name}" (${newField.type}) to "${activeCollection.name}"`, 'action', 'success');
  };

  const handleDeleteField = (fieldId: string) => {
    if (!activeCollection || activeCollection.fields.length <= 1) return;
    const updatedCollections = collections.map((c) => {
      if (c.id !== activeCollection.id) return c;
      return {
        ...c,
        fields: c.fields.filter((f) => f.id !== fieldId),
      };
    });
    onUpdateProject({ collections: updatedCollections });
    onLogExecution('DataStudio', `Deleted field from "${activeCollection.name}"`, 'action', 'info');
  };

  // Export Records as JSON
  const handleExportJSON = () => {
    if (!activeCollection) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeCollection.records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${activeCollection.name.toLowerCase().replace(/\s+/g, '_')}_records.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onLogExecution('DataStudio', `Exported "${activeCollection.name}" as JSON file`, 'action', 'success');
  };

  // Filtered records
  const filteredRecords = (activeCollection?.records || []).filter((rec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(rec).some((val) => String(val).toLowerCase().includes(q));
  });

  const getFieldIcon = (type: DataField['type']) => {
    switch (type) {
      case 'number':
        return <Hash size={12} className="text-blue-400" />;
      case 'email':
        return <Mail size={12} className="text-emerald-400" />;
      case 'date':
        return <Calendar size={12} className="text-amber-400" />;
      case 'boolean':
        return <ToggleLeft size={12} className="text-purple-400" />;
      default:
        return <TableIcon size={12} className="text-zinc-400" />;
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-zinc-950 select-none">
      {/* Left Sidebar: Collections & Variables Navigation */}
      <div className="w-64 border-r border-zinc-800 bg-zinc-950/80 flex flex-col shrink-0">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-amber-400" />
            <span className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
              Data Studio
            </span>
          </div>
          <button
            onClick={() => setIsNewCollectionOpen(true)}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Create new collection"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Collections List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 block mb-1">
              Database Collections ({collections.length})
            </span>
            <div className="space-y-0.5">
              {collections.map((col) => {
                const isSelected = col.id === activeCollection?.id;
                return (
                  <div
                    key={col.id}
                    onClick={() => {
                      setActiveCollectionId(col.id);
                      if (subTab === 'variables') setSubTab('records');
                    }}
                    className={`px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition ${
                      isSelected && subTab !== 'variables'
                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TableIcon size={13} className="shrink-0" />
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {col.records.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* App State Variables */}
          <div className="pt-2 border-t border-zinc-800/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 block mb-1">
              Application State
            </span>
            <button
              onClick={() => setSubTab('variables')}
              className={`w-full px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition ${
                subTab === 'variables'
                  ? 'bg-blue-500/15 border border-blue-500/30 text-blue-300'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Key size={13} className="shrink-0" />
                <span>Global Variables</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                {variables.length}
              </span>
            </button>
          </div>
        </div>

        {/* Studio Info Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/30 text-[10px] text-zinc-500 leading-relaxed">
          ⚡ AppForge Data Studio connects visual components directly to reactive databases and live state.
        </div>
      </div>

      {/* Center Main Stage */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header & Sub-tab Bar */}
        <div className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="truncate">
              <span className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                {subTab === 'variables' ? 'Global Application Variables' : activeCollection?.name}
              </span>
              <span className="text-[10px] text-zinc-500 truncate block">
                {subTab === 'variables'
                  ? 'Shared variables accessible by all screens and logic workflows'
                  : activeCollection?.description}
              </span>
            </div>
          </div>

          {/* Subtabs & Actions */}
          <div className="flex items-center gap-2">
            {subTab !== 'variables' && (
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-medium text-zinc-400">
                <button
                  onClick={() => setSubTab('records')}
                  className={`px-3 py-1 rounded transition cursor-pointer ${
                    subTab === 'records' ? 'bg-zinc-800 text-white font-semibold' : 'hover:text-white'
                  }`}
                >
                  Records Data Grid ({activeCollection?.records.length || 0})
                </button>
                <button
                  onClick={() => setSubTab('schema')}
                  className={`px-3 py-1 rounded transition cursor-pointer ${
                    subTab === 'schema' ? 'bg-zinc-800 text-white font-semibold' : 'hover:text-white'
                  }`}
                >
                  Schema Fields ({activeCollection?.fields.length || 0})
                </button>
              </div>
            )}

            {subTab === 'records' && activeCollection && (
              <>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition cursor-pointer"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setIsNewRecordOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs transition cursor-pointer shadow"
                >
                  <Plus size={13} />
                  <span>Add Record</span>
                </button>
              </>
            )}

            {subTab === 'schema' && activeCollection && (
              <button
                onClick={() => setIsNewFieldOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow"
              >
                <Plus size={13} />
                <span>Add Field</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6">
          {/* ================= RECORDS DATA GRID ================= */}
          {subTab === 'records' && activeCollection && (
            <div className="space-y-4 max-w-6xl mx-auto">
              {/* Search Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-80">
                  <Search size={14} className="absolute left-3 top-2.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search records in collection..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  Showing {filteredRecords.length} of {activeCollection.records.length} items
                </div>
              </div>

              {/* Table */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 shadow-xl">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">#</th>
                      {activeCollection.fields.map((field) => (
                        <th key={field.id} className="px-4 py-3 font-semibold">
                          <div className="flex items-center gap-1.5">
                            {getFieldIcon(field.type)}
                            <span>{field.name}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={activeCollection.fields.length + 2} className="px-4 py-12 text-center text-zinc-500 font-sans">
                          No records found. Click "Add Record" to populate this collection.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record, rIdx) => (
                        <tr key={record.id || rIdx} className="hover:bg-zinc-800/30 transition">
                          <td className="px-4 py-3 text-zinc-500">{rIdx + 1}</td>
                          {activeCollection.fields.map((field) => (
                            <td key={field.id} className="px-4 py-3 text-zinc-200">
                              {field.type === 'status' ? (
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium font-sans ${
                                  String(record[field.id]).toLowerCase() === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {record[field.id] || 'None'}
                                </span>
                              ) : (
                                String(record[field.id] ?? '—')
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-1 text-zinc-500 hover:text-red-400 rounded transition"
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= SCHEMA FIELDS ================= */}
          {subTab === 'schema' && activeCollection && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Database Collection Schema</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configure typed fields and columns for the "{activeCollection.name}" collection.
                  </p>
                </div>
              </div>

              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Field Name</th>
                      <th className="px-4 py-3">Field Key / ID</th>
                      <th className="px-4 py-3">Data Type</th>
                      <th className="px-4 py-3">Required</th>
                      <th className="px-4 py-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
                    {activeCollection.fields.map((field) => (
                      <tr key={field.id} className="hover:bg-zinc-800/30">
                        <td className="px-4 py-3 font-semibold text-white font-sans flex items-center gap-2">
                          {getFieldIcon(field.type)}
                          <span>{field.name}</span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500">{field.id}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] uppercase">
                            {field.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {field.required ? (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-sans">
                              <Check size={12} /> Required
                            </span>
                          ) : (
                            <span className="text-zinc-500 font-sans">Optional</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteField(field.id)}
                            disabled={activeCollection.fields.length <= 1}
                            className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-30 rounded transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= GLOBAL APP VARIABLES ================= */}
          {subTab === 'variables' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Application State & Reactive Variables</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Global reactive variables can be referenced in button action conditions and dynamic text components.
                </p>
              </div>

              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/40 shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/90 border-b border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Variable Name</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Initial Value</th>
                      <th className="px-4 py-3">Current Active Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80 font-mono text-[11px]">
                    {variables.map((v) => (
                      <tr key={v.id} className="hover:bg-zinc-800/30">
                        <td className="px-4 py-3 font-semibold text-blue-400">{v.name}</td>
                        <td className="px-4 py-3 text-zinc-400 uppercase text-[10px]">{v.type}</td>
                        <td className="px-4 py-3 text-zinc-300">{String(v.defaultValue)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {String(v.currentValue)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD RECORD */}
      {isNewRecordOpen && activeCollection && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plus size={15} className="text-amber-400" />
                <span>Add Record to {activeCollection.name}</span>
              </h3>
              <button
                onClick={() => setIsNewRecordOpen(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activeCollection.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {field.name} {field.required && <span className="text-amber-400">*</span>}
                  </label>
                  <input
                    type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                    value={newRecordData[field.id] || ''}
                    onChange={(e) =>
                      setNewRecordData({
                        ...newRecordData,
                        [field.id]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                      })
                    }
                    placeholder={`Enter ${field.name.toLowerCase()}...`}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsNewRecordOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs shadow"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SCHEMA FIELD */}
      {isNewFieldOpen && activeCollection && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Plus size={15} className="text-blue-400" />
                <span>Add Schema Field</span>
              </h3>
              <button onClick={() => setIsNewFieldOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Field Name</label>
                <input
                  type="text"
                  placeholder="e.g. Total Revenue"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Field Type</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="text">Text (String)</option>
                  <option value="number">Number (Integer / Decimal)</option>
                  <option value="email">Email Address</option>
                  <option value="date">Date</option>
                  <option value="boolean">Boolean (True / False)</option>
                  <option value="status">Status Badge</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="req_field"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                  className="rounded border-zinc-800 text-blue-600 focus:ring-0"
                />
                <label htmlFor="req_field" className="text-xs text-zinc-300 cursor-pointer">
                  Required field
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button onClick={() => setIsNewFieldOpen(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400">
                Cancel
              </button>
              <button onClick={handleAddField} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs">
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COLLECTION */}
      {isNewCollectionOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Database size={15} className="text-amber-400" />
                <span>Create Database Collection</span>
              </h3>
              <button onClick={() => setIsNewCollectionOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Collection Name</label>
                <input
                  type="text"
                  placeholder="e.g. Transactions, Feedbacks"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Purpose of this data collection..."
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button onClick={() => setIsNewCollectionOpen(false)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400">
                Cancel
              </button>
              <button onClick={handleCreateCollection} className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs">
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
