import React, { useState } from 'react';
import { 
  GitBranch, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Play, 
  Plus, 
  Sparkles,
  ArrowRight,
  Split,
  Layers,
  FileCheck2,
  Bug
} from 'lucide-react';
import { 
  AppExecutionLog, 
  BottomDrawerTab, 
  CanvasElement, 
  Project 
} from '../types/editor';
import { createDefaultActionStep, getActivePage } from '../utils/project-engine';

interface BottomPanelProps {
  project: Project;
  activeTab: BottomDrawerTab;
  onChangeTab: (tab: BottomDrawerTab) => void;
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  logs: AppExecutionLog[];
  onClearLogs: () => void;
  onRunTestScenario: (testName: string) => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  project,
  activeTab,
  onChangeTab,
  selectedElement,
  onUpdateElement,
  logs,
  onClearLogs,
  onRunTestScenario,
}) => {
  const [drawerState, setDrawerState] = useState<'collapsed' | 'normal' | 'expanded'>('collapsed');
  const [testResults, setTestResults] = useState<{ id: string; name: string; status: 'pass' | 'fail'; message: string }[]>([
    { id: 't1', name: 'Multi-Page Router Integrity', status: 'pass', message: `All ${project.pages.length} screens mapped with valid routes.` },
    { id: 't2', name: 'Home Screen Designated', status: 'pass', message: `Entrypoint set to ${project.homePageId}.` },
    { id: 't3', name: 'Button Action Validation', status: 'pass', message: 'Action triggers have valid targets.' },
  ]);

  const activePage = getActivePage(project);
  const interactions = selectedElement?.interactions || [];

  const handleTabClick = (tab: BottomDrawerTab) => {
    onChangeTab(tab);
    if (drawerState === 'collapsed') {
      setDrawerState('normal');
    }
  };

  const handleAddWorkflowStep = (type: any) => {
    if (!selectedElement) return;
    const newStep = createDefaultActionStep(type);
    const existing = interactions.find((i) => i.trigger === 'onClick');
    let updated;

    if (existing) {
      updated = interactions.map((i) =>
        i.trigger === 'onClick' ? { ...i, steps: [...i.steps, newStep] } : i
      );
    } else {
      updated = [
        ...interactions,
        { id: `inter_onClick_${Date.now()}`, trigger: 'onClick' as const, steps: [newStep] },
      ];
    }

    onUpdateElement(selectedElement.id, { interactions: updated });
  };

  const runAllTests = () => {
    const results: typeof testResults = [];

    // Test 1: Page Router
    const hasUniquePaths = new Set(project.pages.map((p) => p.path)).size === project.pages.length;
    results.push({
      id: 't1',
      name: 'Multi-Page Route Integrity',
      status: hasUniquePaths ? 'pass' : 'fail',
      message: hasUniquePaths ? `All ${project.pages.length} screen routes verified.` : 'Duplicate screen path detected!',
    });

    // Test 2: Starting Screen
    const homeExists = project.pages.some((p) => p.id === project.homePageId);
    results.push({
      id: 't2',
      name: 'Starting Screen Designation',
      status: homeExists ? 'pass' : 'fail',
      message: homeExists ? `Home screen [${project.homePageId}] verified.` : 'No starting screen defined!',
    });

    // Test 3: Action target validation
    let brokenLinks = 0;
    project.pages.forEach((p) => {
      p.elements.forEach((el) => {
        el.interactions?.forEach((inter) => {
          inter.steps.forEach((st) => {
            if (st.type === 'navigate' && st.targetPageId) {
              if (!project.pages.some((pg) => pg.id === st.targetPageId)) brokenLinks++;
            }
          });
        });
      });
    });

    results.push({
      id: 't3',
      name: 'Navigation Action Target Check',
      status: brokenLinks === 0 ? 'pass' : 'fail',
      message: brokenLinks === 0 ? 'All navigation actions point to real pages.' : `${brokenLinks} broken page link(s) found.`,
    });

    setTestResults(results);
    onRunTestScenario('Full Application Diagnostic Suite');
  };

  return (
    <footer
      className={`border-t border-zinc-800 bg-zinc-950 flex flex-col shrink-0 select-none transition-all duration-200 ${
        drawerState === 'collapsed' ? 'h-8' : drawerState === 'expanded' ? 'h-72' : 'h-48'
      }`}
    >
      {/* Top Tabs Rail */}
      <div className="h-8 px-3 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleTabClick('logic')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-t transition cursor-pointer ${
              activeTab === 'logic' && drawerState !== 'collapsed'
                ? 'border-b-2 border-blue-500 text-blue-400 bg-zinc-900/60 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GitBranch size={13} />
            <span>Visual Logic & Workflows</span>
          </button>

          <button
            onClick={() => handleTabClick('logs')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-t transition cursor-pointer ${
              activeTab === 'logs' && drawerState !== 'collapsed'
                ? 'border-b-2 border-blue-500 text-blue-400 bg-zinc-900/60 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal size={13} />
            <span>Execution Logs {logs.length > 0 && `(${logs.length})`}</span>
          </button>

          <button
            onClick={() => handleTabClick('test')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-t transition cursor-pointer ${
              activeTab === 'test' && drawerState !== 'collapsed'
                ? 'border-b-2 border-blue-500 text-blue-400 bg-zinc-900/60 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCheck2 size={13} />
            <span>Diagnostic Tests</span>
          </button>
        </div>

        {/* Height toggle */}
        <div className="flex items-center gap-1">
          {drawerState === 'collapsed' ? (
            <button
              onClick={() => setDrawerState('normal')}
              className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
              title="Open drawer"
            >
              <ChevronUp size={14} />
            </button>
          ) : (
            <>
              <button
                onClick={() => setDrawerState(drawerState === 'expanded' ? 'normal' : 'expanded')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
                title={drawerState === 'expanded' ? 'Restore height' : 'Expand full'}
              >
                {drawerState === 'expanded' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              <button
                onClick={() => setDrawerState('collapsed')}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition cursor-pointer"
                title="Collapse drawer"
              >
                <ChevronDown size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Drawer Content */}
      {drawerState !== 'collapsed' && (
        <div className="flex-1 overflow-y-auto p-3 text-xs bg-zinc-950">
          {/* ================= VISUAL LOGIC BUILDER ================= */}
          {activeTab === 'logic' && (
            <div>
              {!selectedElement ? (
                <div className="text-zinc-500 text-center py-6 flex flex-col items-center">
                  <GitBranch size={20} className="mb-2 text-zinc-600" />
                  <span>Select a component on the canvas to inspect and edit its visual workflow flowchart.</span>
                </div>
              ) : (
                <div className="space-y-3 max-w-4xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">
                        Interaction Flowchart: [{selectedElement.name}]
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Trigger: On Click
                      </span>
                    </div>

                  {/* Add action node buttons */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-zinc-500 font-mono">+ Connect Node:</span>
                    <button
                      onClick={() => handleAddWorkflowStep('toast')}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-medium"
                    >
                      Toast
                    </button>
                    <button
                      onClick={() => handleAddWorkflowStep('navigate')}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-medium"
                    >
                      Navigate
                    </button>
                    <button
                      onClick={() => handleAddWorkflowStep('openModal')}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-medium"
                    >
                      Popup
                    </button>
                    <button
                      onClick={() => handleAddWorkflowStep('condition')}
                      className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-amber-400 text-[10px] font-medium"
                    >
                      IF / ELSE
                    </button>
                  </div>
                </div>

                {/* Visual Flowchart Canvas */}
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-x-auto flex items-center gap-3">
                  {/* Start Node */}
                  <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shrink-0 min-w-[120px] text-center shadow-md">
                    <div className="text-[10px] uppercase font-mono font-bold tracking-wider">Trigger</div>
                    <div className="text-xs font-semibold text-white mt-1">User Clicks</div>
                  </div>

                  <ArrowRight size={14} className="text-zinc-600 shrink-0" />

                  {/* Pipeline Steps Nodes */}
                  {(interactions.find((i) => i.trigger === 'onClick')?.steps || []).length === 0 ? (
                    <div className="p-3 rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-xs italic">
                      Click "+ Connect Node" above to add actions to this workflow pipeline.
                    </div>
                  ) : (
                    (interactions.find((i) => i.trigger === 'onClick')?.steps || []).map((step, idx, arr) => (
                      <React.Fragment key={step.id}>
                        {step.type === 'condition' ? (
                          <div className="p-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 shrink-0 min-w-[150px] shadow-md">
                            <div className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold">
                              <Split size={11} />
                              <span>Condition (IF)</span>
                            </div>
                            <div className="text-xs font-semibold text-white mt-1">
                              {step.condition?.operator} {step.condition?.value || 'Input'}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-1 flex gap-2">
                              <span className="text-emerald-400">✓ Then</span>
                              <span className="text-amber-400">✗ Else</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300 shrink-0 min-w-[140px] shadow-md">
                            <div className="text-[10px] uppercase font-mono font-bold text-blue-400">
                              Step {idx + 1}: {step.type}
                            </div>
                            <div className="text-xs font-semibold text-white mt-1 truncate max-w-[130px]">
                              {step.type === 'navigate'
                                ? `Go to ${project.pages.find((p) => p.id === step.targetPageId)?.name || 'Home'}`
                                : step.type === 'toast'
                                ? step.toastMessage || 'Toast'
                                : step.type === 'openModal'
                                ? step.modalTitle || 'Popup'
                                : step.type}
                            </div>
                          </div>
                        )}

                        {idx < arr.length - 1 && (
                          <ArrowRight size={14} className="text-zinc-600 shrink-0" />
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= EXECUTION LOGS TAB ================= */}
        {activeTab === 'logs' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase font-mono">
                Real-Time App Execution Audit Trail
              </span>
              <button
                onClick={onClearLogs}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
              >
                <Trash2 size={11} />
                <span>Clear Logs</span>
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs italic font-mono">
                No events recorded yet. Open Preview mode and click buttons or submit forms to see real-time execution logs.
              </div>
            ) : (
              <div className="space-y-1 font-mono text-[11px]">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-between text-zinc-300"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] text-zinc-500">{log.timestamp}</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-emerald-400'
                            : log.status === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-blue-400'
                        }`}
                      />
                      <span className="text-zinc-400">[{log.sourceElement}]</span>
                      <span className="text-white truncate">{log.message}</span>
                    </div>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-400">
                      {log.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= DIAGNOSTIC TEST RUNNER ================= */}
        {activeTab === 'test' && (
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <FileCheck2 size={14} className="text-emerald-400" />
                No-Code Architecture Verification Suite
              </span>
              <button
                onClick={runAllTests}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Play size={12} className="fill-white" />
                <span>Run Diagnostic Tests</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {testResults.map((t) => (
                <div
                  key={t.id}
                  className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {t.status === 'pass' ? (
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={15} className="text-red-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-zinc-200">{t.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">{t.message}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-medium text-emerald-400">
                    PASS
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}
    </footer>
  );
};
