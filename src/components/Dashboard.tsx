import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FolderGit2, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone,
  Layers,
  Sparkles,
  Zap,
  Code2
} from 'lucide-react';
import { Project } from '../types/editor';

interface DashboardProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewProjectClick: () => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onQuickCreate: (templateId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onOpenProject,
  onNewProjectClick,
  onDeleteProject,
  onDuplicateProject,
  onQuickCreate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalElements = projects.reduce((acc, p) => acc + p.elements.length, 0);

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getViewportIcon = (viewport: string) => {
    switch (viewport) {
      case 'tablet':
        return <Tablet size={13} className="text-zinc-400" />;
      case 'mobile':
        return <Smartphone size={13} className="text-zinc-400" />;
      default:
        return <Monitor size={13} className="text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-y-auto">
      {/* Top Navbar */}
      <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-sm tracking-wider">
            AF
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-zinc-100 text-sm">APPFORGE</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">STUDIO v1.0</span>
          </div>
        </div>

        {/* Global Search & New Project CTA */}
        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            onClick={onNewProjectClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Hero & Workspace Telemetry Header */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-3">
                <Zap size={13} />
                <span>Zero-Code Full Application Builder</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Workspace Dashboard
              </h1>
              <p className="text-zinc-400 text-xs mt-1 max-w-xl leading-relaxed">
                Build production-grade web applications with a visual IDE canvas, customizable component library, interactive event bindings, and instant export.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
              <div className="px-3 py-1">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Projects</span>
                <span className="text-lg font-bold text-white font-mono">{projects.length}</span>
              </div>
              <div className="px-3 py-1 border-l border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Components</span>
                <span className="text-lg font-bold text-blue-400 font-mono">{totalElements}</span>
              </div>
              <div className="px-3 py-1 border-l border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">Engine</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">Ready</span>
              </div>
            </div>
          </div>

          {/* Quick Starter Cards */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
              Quick Start from Template
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'saas', name: 'SaaS Metric Hub', icon: Sparkles, color: 'text-amber-400' },
                { id: 'contact', name: 'Contact & Lead Portal', icon: FolderGit2, color: 'text-blue-400' },
                { id: 'card', name: 'Product Showcase Card', icon: Layers, color: 'text-purple-400' },
                { id: 'blank', name: 'Blank IDE Canvas', icon: Code2, color: 'text-emerald-400' },
              ].map((tmpl) => {
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => onQuickCreate(tmpl.id)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/60 hover:border-zinc-700 transition cursor-pointer text-left group"
                  >
                    <Icon size={16} className={`${tmpl.color} group-hover:scale-110 transition`} />
                    <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                      {tmpl.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                Your Applications
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                {filteredProjects.length}
              </span>
            </div>

            {/* Mobile Search input */}
            <div className="sm:hidden relative w-44">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-200"
              />
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
              <FolderGit2 size={36} className="mx-auto text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300">No projects found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {searchQuery ? 'Try clearing your search keyword.' : 'Create your first no-code project to begin designing.'}
              </p>
              <button
                onClick={onNewProjectClick}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Create New Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card for creating a new project */}
              <button
                onClick={onNewProjectClick}
                className="h-52 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-blue-500/50 bg-zinc-950/30 hover:bg-blue-500/5 transition flex flex-col items-center justify-center p-6 cursor-pointer group text-zinc-400 hover:text-blue-400"
              >
                <div className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 group-hover:border-blue-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-inner">
                  <Plus size={20} className="text-zinc-400 group-hover:text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">Create New Project</span>
                <span className="text-[11px] text-zinc-500 mt-1 text-center">Start with a blank canvas or custom template</span>
              </button>

              {/* Existing Project Cards */}
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="h-52 rounded-2xl border border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 hover:bg-zinc-900 transition flex flex-col justify-between p-5 group shadow-lg shadow-black/20"
                >
                  <div>
                    {/* Top row of card */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 
                          onClick={() => onOpenProject(project.id)}
                          className="text-sm font-semibold text-zinc-100 group-hover:text-blue-400 transition cursor-pointer truncate"
                          title={project.name}
                        >
                          {project.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">
                          {getViewportIcon(project.viewport)}
                          <span className="capitalize">{project.viewport}</span>
                        </span>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 mt-4 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80">
                        <Layers size={11} className="text-blue-400" />
                        <span className="font-mono">{project.elements.length}</span> components
                      </span>
                      <span className="text-zinc-500 font-mono text-[10px]">
                        Edited {formatRelativeTime(project.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicateProject(project.id)}
                        title="Duplicate project"
                        className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete project "${project.name}"?`)) {
                            onDeleteProject(project.id);
                          }
                        }}
                        title="Delete project"
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => onOpenProject(project.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-blue-600 hover:text-white text-zinc-200 text-xs font-medium transition cursor-pointer"
                    >
                      <span>Open Editor</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Global Status Footer */}
      <footer className="h-8 border-t border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            AppForge IDE Engine v1.0.0
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline">No-Code Runtime Ready</span>
        </div>
        <div>
          <span>Local Storage Sync Active</span>
        </div>
      </footer>
    </div>
  );
};
