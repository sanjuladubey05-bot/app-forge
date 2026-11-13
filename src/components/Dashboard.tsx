import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone,
  Layers,
  Sparkles,
  Code2,
  FolderGit2,
  Compass,
  Briefcase,
  ShoppingBag,
  Box,
  Cloud,
  CloudDownload,
  LogIn,
  LogOut,
  Loader2
} from 'lucide-react';
import { Project } from '../types/editor';
import { ComplianceTabId } from './ComplianceHubModal';
import { useAuth } from '../contexts/AuthContext';
import { listUserCloudProjects, saveProjectToCloud } from '../utils/cloud-sync';

interface DashboardProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewProjectClick: () => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onQuickCreate: (templateId: string) => void;
  onOpenCompliance?: (tab?: ComplianceTabId) => void;
  onBackToLanding?: () => void;
  onImportCloudProjects?: (cloudProjects: Project[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  projects,
  onOpenProject,
  onNewProjectClick,
  onDeleteProject,
  onDuplicateProject,
  onQuickCreate,
  onOpenCompliance,
  onBackToLanding,
  onImportCloudProjects,
}) => {
  const { user, signingIn, signInWithGoogle, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        return <Tablet size={13} className="text-zinc-500" />;
      case 'mobile':
        return <Smartphone size={13} className="text-zinc-500" />;
      default:
        return <Monitor size={13} className="text-zinc-500" />;
    }
  };

  const starters = [
    { 
      id: 'blank', 
      name: 'Start Scratch', 
      desc: 'Empty canvas with standard layout', 
      icon: Code2 
    },
    { 
      id: 'practice', 
      name: 'Practice Project', 
      desc: 'Interactive 6-step guided walkthrough', 
      icon: Compass 
    },
    { 
      id: 'saas', 
      name: 'Website Portal', 
      desc: 'Multi-screen responsive web app', 
      icon: Monitor 
    },
    { 
      id: 'mobile', 
      name: 'Mobile App', 
      desc: 'Touch-optimized mobile screen layout', 
      icon: Smartphone 
    },
    { 
      id: 'portfolio', 
      name: 'Portfolio', 
      desc: 'Multi-page showcase & contact flow', 
      icon: Briefcase 
    },
    { 
      id: 'shop', 
      name: 'Online Store', 
      desc: 'Product catalog & checkout route', 
      icon: ShoppingBag 
    },
    { 
      id: 'contact', 
      name: 'Contact Form', 
      desc: 'Inquiry and lead intake workflow', 
      icon: FolderGit2 
    },
    { 
      id: 'card', 
      name: 'Product Card', 
      desc: 'Featured showcase card layout', 
      icon: Layers 
    },
    {
      id: 'linkinbio',
      name: '3D Link-in-Bio',
      desc: 'Mobile creator profile with live 3D widget',
      icon: Box
    },
  ];

  const handleSyncAllToCloud = async () => {
    if (!user) return;
    setCloudBusy(true);
    setCloudMessage(null);
    try {
      for (const proj of projects) {
        await saveProjectToCloud(proj, user.uid);
      }
      setCloudMessage(`Synced ${projects.length} project(s) to Firestore.`);
    } catch (err: any) {
      setCloudMessage(err?.message || 'Cloud sync failed.');
    } finally {
      setCloudBusy(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!user) return;
    setCloudBusy(true);
    setCloudMessage(null);
    try {
      const cloudList = await listUserCloudProjects(user.uid);
      const imported = cloudList.map((c) => c.project).filter(Boolean);
      onImportCloudProjects?.(imported);
      setCloudMessage(
        cloudList.length > 0
          ? `Loaded ${cloudList.length} project(s) from Firestore.`
          : 'No saved cloud projects yet.'
      );
    } catch (err: any) {
      setCloudMessage(err?.message || 'Could not load cloud projects.');
    } finally {
      setCloudBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-lg focus:bg-blue-600 focus:text-white focus:text-xs font-semibold"
      >
        Skip to main content
      </a>
      {/* Top Navigation */}
      <header className="h-13 border-b border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {onBackToLanding ? (
            <button
              type="button"
              onClick={onBackToLanding}
              className="flex items-center gap-2.5 text-left hover:opacity-90 transition cursor-pointer"
              title="Back to AppForge Home"
            >
              <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-200 font-bold text-xs tracking-wider">
                AF
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100 text-sm tracking-tight">AppForge</span>
                <span className="text-zinc-400 text-xs font-normal">· Studio</span>
              </div>
            </button>
          ) : (
            <>
              <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-zinc-200 font-bold text-xs tracking-wider">
                AF
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100 text-sm tracking-tight">AppForge</span>
                <span className="text-zinc-400 text-xs font-normal">· Studio</span>
              </div>
            </>
          )}
        </div>

        {/* Search, Auth & New Project CTA */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-56 hidden md:block">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input
              type="text"
              aria-label="Search workspace projects"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-zinc-600 transition"
            />
          </div>

          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={cloudBusy}
                onClick={handleSyncAllToCloud}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 text-xs font-medium transition cursor-pointer"
                title="Save all workspace projects to Firestore"
              >
                {cloudBusy ? <Loader2 size={12} className="animate-spin" /> : <Cloud size={12} />}
                <span>Sync Cloud</span>
              </button>
              <button
                type="button"
                disabled={cloudBusy}
                onClick={handlePullFromCloud}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition cursor-pointer"
                title="Load projects from Firestore"
              >
                <CloudDownload size={12} />
                <span>Load Cloud</span>
              </button>
              <button
                type="button"
                onClick={() => void signOut()}
                className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                title={`Signed in as ${user.email || 'Google User'} — Click to sign out`}
                aria-label="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={signingIn}
              onClick={() => void signInWithGoogle()}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition cursor-pointer"
              data-testid="dashboard-signin-btn"
            >
              <LogIn size={13} />
              <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewProjectClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Plus size={14} aria-hidden="true" />
            <span>New Project</span>
          </button>
        </div>
      </header>
      {cloudMessage && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-2 text-xs text-emerald-300 flex items-center justify-between">
          <span>{cloudMessage}</span>
          <button
            type="button"
            onClick={() => setCloudMessage(null)}
            className="text-zinc-400 hover:text-white text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-10">
        {/* Workspace Introduction Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                Workspace Dashboard
              </h1>
              <p className="text-zinc-400 text-xs mt-1 max-w-xl">
                Design, build, and prototype multi-screen web and mobile applications with a visual editor.
              </p>
            </div>
            <div className="text-xs text-zinc-500">
              <span>{projects.length} {projects.length === 1 ? 'project' : 'projects'} in workspace</span>
            </div>
          </div>

          {/* Starter Choices Grid */}
          <div className="pt-2">
            <div className="text-[11px] font-medium text-zinc-400 mb-2.5">
              Choose a Starting Point
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
              {starters.map((starter) => {
                const Icon = starter.icon;
                return (
                  <button
                    key={starter.id}
                    onClick={() => onQuickCreate(starter.id)}
                    className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition cursor-pointer text-left flex flex-col justify-between group h-24"
                  >
                    <Icon size={15} className="text-zinc-400 group-hover:text-zinc-200 transition" />
                    <div>
                      <div className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                        {starter.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {starter.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-200">
                Your Applications
              </h2>
              <span className="text-xs text-zinc-500 font-mono">
                ({filteredProjects.length})
              </span>
            </div>

            {/* Mobile Search input */}
            <div className="sm:hidden relative w-44">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
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
            <div className="text-center py-16 px-4 border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-950">
              <FolderGit2 size={32} className="mx-auto text-zinc-600 mb-2.5" />
              <h3 className="text-xs font-semibold text-zinc-300">No applications match your filter</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {searchQuery ? 'Try searching with a different term.' : 'Get started by creating a new blank project or selecting a template.'}
              </p>
              <button
                onClick={onNewProjectClick}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition cursor-pointer"
              >
                <Plus size={13} />
                <span>Create Application</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Quick blank tile */}
              <button
                onClick={onNewProjectClick}
                className="h-44 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-600 bg-zinc-950 hover:bg-zinc-900/30 transition flex flex-col items-center justify-center p-5 cursor-pointer text-zinc-400 hover:text-zinc-200 group"
              >
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 flex items-center justify-center mb-2.5 transition">
                  <Plus size={16} className="text-zinc-400 group-hover:text-zinc-100" />
                </div>
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white">Create New Project</span>
                <span className="text-[11px] text-zinc-500 mt-0.5 text-center">Start with an empty canvas</span>
              </button>

              {/* Project Cards */}
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="h-44 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition flex flex-col justify-between p-4 group"
                >
                  <div>
                    {/* Header: Name + Target Viewport */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <h3 
                          onClick={() => onOpenProject(project.id)}
                          className="text-xs font-semibold text-zinc-100 group-hover:text-white transition cursor-pointer truncate"
                          title={project.name}
                        >
                          {project.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {project.description || 'No description provided'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-zinc-500 shrink-0">
                        {getViewportIcon(project.viewport)}
                        <span className="text-[10px] capitalize text-zinc-500">{project.viewport}</span>
                      </div>
                    </div>

                    {/* Metadata - Clean Unboxed Typography (Zero-Pill) */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-3">
                      <span>{project.pages?.length || 1} screens</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {project.pages 
                          ? project.pages.reduce((acc, pg) => acc + pg.elements.length, 0) 
                          : (project.elements?.length || 0)} elements
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Edited {formatRelativeTime(project.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => onDuplicateProject(project.id)}
                        title="Duplicate project"
                        className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/80 rounded transition"
                      >
                        <Copy size={13} />
                      </button>
                      {confirmDeleteId === project.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteProject(project.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-semibold cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(project.id)}
                          title="Delete project"
                          aria-label={`Delete project ${project.name}`}
                          className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onOpenProject(project.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-medium transition cursor-pointer"
                    >
                      <span>Open Editor</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Business Transparency & Legal Compliance Footer */}
      <footer className="border-t border-zinc-800/80 pt-5 pb-20 px-6 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-center md:text-left">
            <span className="font-semibold text-zinc-200">AppForge Studio LLC</span> · 548 Market Street, Suite 41290, San Francisco, CA 94104 · Support:{' '}
            <span className="text-zinc-300">support@appforge.studio</span>
          </div>
          {onOpenCompliance && (
            <nav aria-label="Legal and compliance links" className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
              <button type="button" onClick={() => onOpenCompliance('privacy')} className="hover:text-white underline cursor-pointer">
                Privacy Policy
              </button>
              <button type="button" onClick={() => onOpenCompliance('terms')} className="hover:text-white underline cursor-pointer">
                Terms of Service
              </button>
              <button type="button" onClick={() => onOpenCompliance('refund')} className="hover:text-white underline cursor-pointer">
                Refund Policy
              </button>
              <button type="button" onClick={() => onOpenCompliance('cookies')} className="hover:text-white underline cursor-pointer">
                Cookie Settings
              </button>
              <button type="button" onClick={() => onOpenCompliance('licenses')} className="hover:text-white underline cursor-pointer">
                Licenses & SDKs
              </button>
              <button type="button" onClick={() => onOpenCompliance('deletion')} data-testid="footer-data-deletion-btn" className="hover:text-white underline cursor-pointer">
                Data Deletion & Unsubscribe
              </button>
            </nav>
          )}
        </div>
      </footer>
    </div>
  );
};
