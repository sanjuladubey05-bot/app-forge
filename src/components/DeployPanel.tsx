import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Globe,
  KeyRound,
  Link2Off,
  Loader2,
  RefreshCw,
  Rocket,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ExportFramework, Project } from '../types/editor';
import { useAuth } from '../contexts/AuthContext';
import { safeZipFilename } from '../utils/zip-exporter';

interface DeployPanelProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateDeployMeta: (patch: {
    lastVercelProjectId?: string;
    lastVercelProjectName?: string;
    lastDeploymentUrl?: string;
    customDomains?: string[];
  }) => void;
}

interface VercelConnectionState {
  connected: boolean;
  oauthEnabled: boolean;
  authMode?: 'oauth' | 'pat' | null;
  vercelUsername?: string | null;
  vercelEmail?: string | null;
  teamId?: string | null;
}

interface DomainVerificationState {
  domain: string;
  verified?: boolean;
  configuredBy?: string | null;
  dnsRecords?: { type: string; host: string; value: string }[];
  error?: string;
}

export const DeployPanel: React.FC<DeployPanelProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateDeployMeta,
}) => {
  const { user, signingIn, authError, signInWithGoogle, getIdToken } = useAuth();
  const [conn, setConn] = useState<VercelConnectionState>({
    connected: false,
    oauthEnabled: false,
  });
  const [loadingConn, setLoadingConn] = useState(false);
  const [patInput, setPatInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connError, setConnError] = useState<string | null>(null);

  const [framework, setFramework] = useState<ExportFramework>('react-vite');
  const [projectSlug, setProjectSlug] = useState(() => safeZipFilename(project.name));
  const [deploying, setDeploying] = useState(false);
  const [deployState, setDeployState] = useState<{
    id?: string;
    readyState?: string;
    url?: string;
    error?: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [domainInput, setDomainInput] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);
  const [domainStatus, setDomainStatus] = useState<DomainVerificationState | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const authHeaders = useCallback(async () => {
    const token = await getIdToken();
    if (!token) throw new Error('Please sign in with Google first.');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }, [getIdToken]);

  const fetchConnectionStatus = useCallback(async () => {
    if (!user) return;
    setLoadingConn(true);
    setConnError(null);
    try {
      const headers = await authHeaders();
      const resp = await fetch('/api/vercel/connection', { headers });
      const data = await resp.json().catch(() => null);
      if (resp.ok && data) {
        setConn({
          connected: Boolean(data.connected),
          oauthEnabled: Boolean(data.oauthEnabled),
          authMode: data.authMode || null,
          vercelUsername: data.vercelUsername || null,
          vercelEmail: data.vercelEmail || null,
          teamId: data.teamId || null,
        });
      }
    } catch (err: any) {
      setConnError(err?.message || 'Unable to verify Vercel connection.');
    } finally {
      setLoadingConn(false);
    }
  }, [authHeaders, user]);

  useEffect(() => {
    if (isOpen && user) {
      fetchConnectionStatus();
    }
  }, [isOpen, user, fetchConnectionStatus]);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      if (ev.data && typeof ev.data === 'object' && ev.data.type === 'AF_VERCEL_OAUTH_OK') {
        fetchConnectionStatus();
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [fetchConnectionStatus]);

  if (!isOpen) return null;

  const handleOAuthConnect = async () => {
    setConnecting(true);
    setConnError(null);
    try {
      const headers = await authHeaders();
      const resp = await fetch('/api/vercel/oauth/url', { headers });
      const data = await resp.json();
      if (!resp.ok || !data?.url) {
        throw new Error(data?.error || 'Vercel OAuth is not configured on this server.');
      }
      const popup = window.open(data.url, 'appforge_vercel_oauth', 'width=560,height=700');
      if (!popup) {
        throw new Error('Popup blocked. Allow popups or use a Personal Access Token below.');
      }
    } catch (err: any) {
      setConnError(err?.message || 'Failed to launch Vercel OAuth.');
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectPat = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = patInput.trim();
    if (!token) return;
    setConnecting(true);
    setConnError(null);
    try {
      const headers = await authHeaders();
      const resp = await fetch('/api/vercel/connection', {
        method: 'POST',
        headers,
        body: JSON.stringify({ token }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || 'Could not verify Vercel token.');
      }
      setPatInput('');
      await fetchConnectionStatus();
    } catch (err: any) {
      setConnError(err?.message || 'Vercel token connection failed.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    setConnError(null);
    try {
      const headers = await authHeaders();
      await fetch('/api/vercel/connection', { method: 'DELETE', headers });
      setConn((prev) => ({ ...prev, connected: false, vercelUsername: null, authMode: null }));
    } catch (err: any) {
      setConnError(err?.message || 'Failed to disconnect.');
    } finally {
      setConnecting(false);
    }
  };

  const startPollingDeployment = async (deploymentId: string) => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      try {
        const headers = await authHeaders();
        const resp = await fetch(`/api/vercel/deployments/${encodeURIComponent(deploymentId)}`, {
          headers,
        });
        const data = await resp.json();
        if (!resp.ok) return;
        const readyState = String(data.readyState || 'BUILDING');
        const url = data.url ? `https://${String(data.url).replace(/^https?:\/\//, '')}` : undefined;
        setDeployState({ id: deploymentId, readyState, url });

        if (readyState === 'READY') {
          stopPolling();
          setDeploying(false);
          if (url) {
            onUpdateDeployMeta({ lastDeploymentUrl: url });
          }
        } else if (readyState === 'ERROR' || readyState === 'CANCELED') {
          stopPolling();
          setDeploying(false);
          setDeployState({
            id: deploymentId,
            readyState,
            url,
            error: data.errorMessage || `Deployment finished with state ${readyState}`,
          });
        }
      } catch {
        // Keep polling on transient hiccups
      }
    }, 3000);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployState({ readyState: 'QUEUED' });
    setConnError(null);
    try {
      const headers = await authHeaders();
      const resp = await fetch('/api/vercel/deploy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project,
          framework,
          projectName: projectSlug.trim() || safeZipFilename(project.name),
          target: 'production',
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || 'Vercel deployment failed to start.');
      }
      const deploymentId = data.deploymentId;
      const liveUrl = data.url ? `https://${String(data.url).replace(/^https?:\/\//, '')}` : undefined;
      onUpdateDeployMeta({
        lastVercelProjectId: data.vercelProjectId || project.lastVercelProjectId,
        lastVercelProjectName: data.vercelProjectName || projectSlug,
        ...(liveUrl ? { lastDeploymentUrl: liveUrl } : {}),
      });
      setDeployState({
        id: deploymentId,
        readyState: data.readyState || 'QUEUED',
        url: liveUrl,
      });

      if (data.readyState === 'READY') {
        setDeploying(false);
      } else if (deploymentId) {
        startPollingDeployment(deploymentId);
      } else {
        setDeploying(false);
      }
    } catch (err: any) {
      setDeploying(false);
      setDeployState({ readyState: 'ERROR', error: err?.message || 'Deployment error.' });
    }
  };

  const handleAttachDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = domainInput.trim().toLowerCase();
    if (!cleaned) return;
    setAddingDomain(true);
    setDomainStatus(null);
    try {
      const headers = await authHeaders();
      const targetProj = project.lastVercelProjectName || projectSlug || safeZipFilename(project.name);
      const resp = await fetch('/api/vercel/domains', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectNameOrId: targetProj,
          domain: cleaned,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || 'Could not attach custom domain.');
      }
      const existing = project.customDomains || [];
      if (!existing.includes(cleaned)) {
        onUpdateDeployMeta({ customDomains: [...existing, cleaned] });
      }
      const isApex = cleaned.split('.').length === 2;
      setDomainStatus({
        domain: cleaned,
        verified: Boolean(data.verified),
        dnsRecords: [
          isApex
            ? { type: 'A', host: '@', value: '76.76.21.21' }
            : { type: 'CNAME', host: cleaned.split('.')[0], value: 'cname.vercel-dns.com' },
        ],
      });
      setDomainInput('');
    } catch (err: any) {
      setDomainStatus({ domain: cleaned, error: err?.message || 'Domain attachment failed.' });
    } finally {
      setAddingDomain(false);
    }
  };

  const handleVerifyDomain = async (domain: string) => {
    try {
      const headers = await authHeaders();
      const targetProj = project.lastVercelProjectName || projectSlug || safeZipFilename(project.name);
      const resp = await fetch(
        `/api/vercel/domains/${encodeURIComponent(domain)}/verify?projectNameOrId=${encodeURIComponent(targetProj)}`,
        { headers }
      );
      const data = await resp.json();
      const isApex = domain.split('.').length === 2;
      setDomainStatus({
        domain,
        verified: Boolean(data?.verified),
        configuredBy: data?.configuredBy || null,
        dnsRecords: [
          isApex
            ? { type: 'A', host: '@', value: '76.76.21.21' }
            : { type: 'CNAME', host: domain.split('.')[0], value: 'cname.vercel-dns.com' },
        ],
        error: resp.ok ? undefined : data?.error,
      });
    } catch (err: any) {
      setDomainStatus({ domain, error: err?.message || 'Verification check failed.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deploy-panel-title"
        data-testid="deploy-panel-modal"
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Rocket size={18} />
            </div>
            <div>
              <h2 id="deploy-panel-title" className="text-sm font-semibold text-white">
                Deploy to Your Vercel Account
              </h2>
              <p className="text-xs text-zinc-400">
                Direct zero-middleman deployment &amp; custom domain DNS verification for {project.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close deploy panel"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Step 1: Firebase Auth Gate */}
          {!user ? (
            <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck size={16} className="text-blue-400" />
                <span>Sign in with Google to Enable Cloud &amp; Vercel Deployments</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your Vercel Personal Access Token is AES-256-GCM encrypted server-side per authenticated user and never stored in browser storage.
              </p>
              {authError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                  {authError}
                </div>
              )}
              <button
                type="button"
                disabled={signingIn}
                onClick={signInWithGoogle}
                data-testid="deploy-google-signin-btn"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {signingIn ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Step 2: Vercel Account Connection */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <KeyRound size={14} className="text-blue-400" />
                    <span className="font-semibold text-zinc-100">Vercel Account Connection</span>
                  </div>
                  {loadingConn ? (
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Loader2 size={12} className="animate-spin" /> Checking...
                    </span>
                  ) : conn.connected ? (
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Connected {conn.vercelUsername ? `as ${conn.vercelUsername}` : ''}
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-400">Not connected</span>
                  )}
                </div>

                {connError && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                    {connError}
                  </div>
                )}

                {conn.connected ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-400">
                      Auth: {conn.authMode === 'oauth' ? 'Vercel OAuth' : 'Encrypted Personal Access Token'}
                      {conn.vercelEmail ? ` · ${conn.vercelEmail}` : ''}
                    </span>
                    <button
                      type="button"
                      disabled={connecting}
                      onClick={handleDisconnect}
                      className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-red-500/50 text-zinc-300 hover:text-red-300 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Link2Off size={12} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conn.oauthEnabled && (
                      <button
                        type="button"
                        disabled={connecting}
                        onClick={handleOAuthConnect}
                        className="w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs cursor-pointer transition"
                      >
                        Connect Vercel Account via OAuth
                      </button>
                    )}

                    <form onSubmit={handleConnectPat} className="flex items-center gap-2">
                      <input
                        type="password"
                        value={patInput}
                        onChange={(e) => setPatInput(e.target.value)}
                        placeholder="Paste Vercel Personal Access Token..."
                        aria-label="Vercel Personal Access Token"
                        className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        data-testid="vercel-pat-input"
                      />
                      <button
                        type="submit"
                        disabled={connecting || !patInput.trim()}
                        data-testid="vercel-connect-pat-btn"
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer shrink-0"
                      >
                        {connecting ? 'Connecting...' : 'Save Token'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Step 3: Deploy Target Framework */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="font-semibold text-zinc-100">Build Target &amp; Deployment</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Target Framework</label>
                    <select
                      value={framework}
                      onChange={(e) => setFramework(e.target.value as ExportFramework)}
                      className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-2 text-xs text-white"
                      data-testid="deploy-framework-select"
                    >
                      <option value="react-vite">React + Vite</option>
                      <option value="nextjs">Next.js App Router</option>
                      <option value="vue">Vue 3 + Vite</option>
                      <option value="html">Static HTML / CSS / JS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Vercel Project Slug</label>
                    <input
                      type="text"
                      value={projectSlug}
                      onChange={(e) => setProjectSlug(e.target.value)}
                      className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!conn.connected || deploying}
                  onClick={handleDeploy}
                  data-testid="deploy-trigger-btn"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {deploying ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                  <span>
                    {deploying
                      ? `Deploying (${deployState?.readyState || 'QUEUED'})...`
                      : 'Deploy to Vercel'}
                  </span>
                </button>

                {(deployState || project.lastDeploymentUrl) && (
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">Status</span>
                      <span className="font-mono text-emerald-400">
                        {deployState?.readyState || 'READY'}
                      </span>
                    </div>
                    {deployState?.error && (
                      <p className="text-xs text-red-300">{deployState.error}</p>
                    )}
                    {(deployState?.url || project.lastDeploymentUrl) && (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={deployState?.url || project.lastDeploymentUrl || ''}
                          className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs font-mono text-zinc-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const url = deployState?.url || project.lastDeploymentUrl || '';
                            if (navigator.clipboard && url) {
                              navigator.clipboard.writeText(url).catch(() => {});
                            }
                            setCopiedUrl(true);
                            setTimeout(() => setCopiedUrl(false), 1800);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedUrl ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                        </button>
                        <a
                          href={deployState?.url || project.lastDeploymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] flex items-center gap-1"
                        >
                          <ExternalLink size={12} />
                          <span>Open</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Custom Domain & DNS */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-zinc-100">
                  <Globe size={14} className="text-blue-400" />
                  <span>Custom Domain &amp; DNS Verification</span>
                </div>
                <form onSubmit={handleAttachDomain} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="app.yourdomain.com or yourdomain.com"
                    className="flex-1 rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!conn.connected || addingDomain || !domainInput.trim()}
                    className="px-3.5 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white font-medium text-xs cursor-pointer"
                  >
                    {addingDomain ? 'Adding...' : 'Add Domain'}
                  </button>
                </form>

                {(project.customDomains || []).length > 0 && (
                  <div className="space-y-1.5">
                    {(project.customDomains || []).map((dom) => (
                      <div
                        key={dom}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800"
                      >
                        <span className="font-mono text-zinc-200">{dom}</span>
                        <button
                          type="button"
                          onClick={() => handleVerifyDomain(dom)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw size={11} />
                          <span>Verify DNS</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {domainStatus && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-white">{domainStatus.domain}</span>
                      <span className={domainStatus.verified ? 'text-emerald-400' : 'text-amber-300'}>
                        {domainStatus.verified ? 'DNS Verified & Active' : 'Pending DNS Propagation'}
                      </span>
                    </div>
                    {domainStatus.error && <p className="text-red-300">{domainStatus.error}</p>}
                    {domainStatus.dnsRecords && (
                      <div className="font-mono text-[10px] text-zinc-300 space-y-1 bg-zinc-900/70 p-2 rounded-lg">
                        {domainStatus.dnsRecords.map((rec, i) => (
                          <div key={i}>
                            {rec.type} · Host: <span className="text-white">{rec.host}</span> → Value:{' '}
                            <span className="text-blue-300">{rec.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
