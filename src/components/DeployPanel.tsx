import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Rocket,
  Check,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Globe,
  KeyRound,
  LogOut,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { ExportFramework, Project } from '../types/editor';
import { useAuth } from '../contexts/AuthContext';

interface DeployPanelProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpdateDeploymentMeta?: (patch: Partial<Project>) => void;
}

interface VercelConnectionState {
  connected: boolean;
  oauthEnabled: boolean;
  vercelAccountName?: string;
  vercelTeamId?: string | null;
}

interface DeploymentStatus {
  id: string;
  url: string;
  readyState: 'QUEUED' | 'BUILDING' | 'INITIALIZING' | 'READY' | 'ERROR' | 'CANCELED';
  inspectorUrl?: string;
  errorMessage?: string;
}

function defaultProjectSlug(name: string): string {
  return (
    (name || 'appforge-site')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'appforge-site'
  );
}

export const DeployPanel: React.FC<DeployPanelProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateDeploymentMeta,
}) => {
  const { user, signingIn, authError, signInWithGoogle, getIdToken } = useAuth();
  const [conn, setConn] = useState<VercelConnectionState>({
    connected: false,
    oauthEnabled: false,
  });
  const [loadingConn, setLoadingConn] = useState(false);
  const [patInput, setPatInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [framework, setFramework] = useState<ExportFramework>('react-vite');
  const [vercelProjectName, setVercelProjectName] = useState(
    project.lastVercelProjectName || defaultProjectSlug(project.name)
  );
  const [deploying, setDeploying] = useState(false);
  const [deployment, setDeployment] = useState<DeploymentStatus | null>(
    project.lastDeploymentUrl
      ? {
          id: 'last',
          url: project.lastDeploymentUrl,
          readyState: 'READY',
        }
      : null
  );
  const [domainInput, setDomainInput] = useState('');
  const [domainResult, setDomainResult] = useState<{
    domain: string;
    verified: boolean;
    dnsRecords: Array<{ type: string; name: string; value: string }>;
  } | null>(null);
  const [domainBusy, setDomainBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const authHeaders = async (): Promise<Record<string, string>> => {
    const token = await getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadConnection = async () => {
    if (!user) return;
    setLoadingConn(true);
    setErrorMsg(null);
    try {
      const headers = await authHeaders();
      const resp = await fetch('/api/vercel/connection', { headers });
      const data = await resp.json().catch(() => null);
      if (resp.ok && data) {
        setConn({
          connected: Boolean(data.connected),
          oauthEnabled: Boolean(data.oauthEnabled),
          vercelAccountName: data.vercelAccountName,
          vercelTeamId: data.vercelTeamId,
        });
      }
    } catch {
      setErrorMsg('Unable to check Vercel connection right now.');
    } finally {
      setLoadingConn(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      void loadConnection();
    }
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.uid]);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      if (ev.data?.type === 'AF_VERCEL_OAUTH_OK') {
        void loadConnection();
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  if (!isOpen) return null;

  const handleConnectPat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patInput.trim()) return;
    setConnecting(true);
    setErrorMsg(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      };
      const resp = await fetch('/api/vercel/connection', {
        method: 'POST',
        headers,
        body: JSON.stringify({ token: patInput.trim() }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.ok) {
        setErrorMsg(data?.error || 'Could not validate Vercel Personal Access Token.');
        return;
      }
      setPatInput('');
      setConn((prev) => ({
        ...prev,
        connected: true,
        vercelAccountName: data.vercelAccountName,
      }));
    } catch {
      setErrorMsg('Network error while connecting Vercel account.');
    } finally {
      setConnecting(false);
    }
  };

  const handleConnectOAuth = async () => {
    setErrorMsg(null);
    try {
      const headers = await authHeaders();
      const resp = await fetch('/api/vercel/oauth/url', { headers });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.url) {
        setErrorMsg(data?.error || 'Vercel OAuth is not configured on this server. Use Personal Access Token below.');
        return;
      }
      window.open(data.url, 'appforge_vercel_oauth', 'width=600,height=720');
    } catch {
      setErrorMsg('Failed to initialize Vercel OAuth.');
    }
  };

  const handleDisconnect = async () => {
    setErrorMsg(null);
    const headers = await authHeaders();
    await fetch('/api/vercel/connection', { method: 'DELETE', headers });
    setConn((prev) => ({ ...prev, connected: false, vercelAccountName: undefined }));
  };

  const startPollingDeployment = (deploymentId: string) => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      try {
        const headers = await authHeaders();
        const resp = await fetch(`/api/vercel/deployments/${encodeURIComponent(deploymentId)}`, { headers });
        const data = await resp.json().catch(() => null);
        if (resp.ok && data?.deployment) {
          setDeployment(data.deployment);
          if (['READY', 'ERROR', 'CANCELED'].includes(data.deployment.readyState)) {
            if (pollTimerRef.current) {
              clearInterval(pollTimerRef.current);
              pollTimerRef.current = null;
            }
            if (data.deployment.readyState === 'READY' && data.deployment.url) {
              const liveUrl = data.deployment.url.startsWith('http')
                ? data.deployment.url
                : `https://${data.deployment.url}`;
              onUpdateDeploymentMeta?.({
                lastVercelProjectName: vercelProjectName,
                lastDeploymentUrl: liveUrl,
              });
            }
          }
        }
      } catch {
        // Retry next interval
      }
    }, 3000);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setErrorMsg(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      };
      const resp = await fetch('/api/vercel/deploy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          project,
          framework,
          vercelProjectName: vercelProjectName.trim() || defaultProjectSlug(project.name),
        }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.ok || !data.deployment) {
        setErrorMsg(data?.error || 'Deployment failed. Check Vercel token permissions.');
        return;
      }
      setDeployment(data.deployment);
      const urlWithProto = data.deployment.url?.startsWith('http')
        ? data.deployment.url
        : `https://${data.deployment.url}`;
      onUpdateDeploymentMeta?.({
        lastVercelProjectId: data.deployment.projectId,
        lastVercelProjectName: vercelProjectName.trim() || defaultProjectSlug(project.name),
        lastDeploymentUrl: urlWithProto,
      });
      if (!['READY', 'ERROR', 'CANCELED'].includes(data.deployment.readyState)) {
        startPollingDeployment(data.deployment.id);
      }
    } catch {
      setErrorMsg('Network error triggering Vercel deployment.');
    } finally {
      setDeploying(false);
    }
  };

  const handleAttachDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setDomainBusy(true);
    setErrorMsg(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(await authHeaders()),
      };
      const resp = await fetch('/api/vercel/domains', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          domain: domainInput.trim().toLowerCase(),
          vercelProjectName: vercelProjectName.trim() || defaultProjectSlug(project.name),
        }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.ok) {
        setErrorMsg(data?.error || 'Could not attach custom domain.');
        return;
      }
      setDomainResult({
        domain: data.domain,
        verified: Boolean(data.verified),
        dnsRecords: data.dnsRecords || [
          { type: 'A', name: '@', value: '76.76.21.21' },
          { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' },
        ],
      });
      const nextDomains = Array.from(new Set([...(project.customDomains || []), data.domain]));
      onUpdateDeploymentMeta?.({ customDomains: nextDomains });
    } catch {
      setErrorMsg('Failed to communicate with domain endpoint.');
    } finally {
      setDomainBusy(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!domainResult?.domain) return;
    setDomainBusy(true);
    setErrorMsg(null);
    try {
      const headers = await authHeaders();
      const resp = await fetch(
        `/api/vercel/domains/${encodeURIComponent(domainResult.domain)}/verify?projectName=${encodeURIComponent(
          vercelProjectName.trim() || defaultProjectSlug(project.name)
        )}`,
        { headers }
      );
      const data = await resp.json().catch(() => null);
      if (resp.ok && data) {
        setDomainResult((prev) => (prev ? { ...prev, verified: Boolean(data.verified) } : prev));
      } else {
        setErrorMsg(data?.error || 'Domain verification failed.');
      }
    } finally {
      setDomainBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="deploy-panel-title"
        className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        data-testid="deploy-panel-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Rocket size={18} />
            </div>
            <div>
              <h2 id="deploy-panel-title" className="text-sm font-semibold text-white">
                Deploy to Your Own Vercel Account
              </h2>
              <p className="text-xs text-zinc-400">
                Publish {project.name} with custom domains and zero platform lock-in
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Vercel Deploy modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!user ? (
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center space-y-3">
              <ShieldCheck size={28} className="mx-auto text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Sign In with Google Required</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Your Vercel token is encrypted server-side under your Firebase user account and is never exposed to the browser.
              </p>
              {authError && (
                <p role="alert" className="text-xs text-amber-300">
                  {authError}
                </p>
              )}
              <button
                type="button"
                disabled={signingIn}
                onClick={() => void signInWithGoogle()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
                data-testid="deploy-google-signin-btn"
              >
                {signingIn ? <Loader2 size={14} className="animate-spin" /> : null}
                <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Account Connection Card */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Vercel Account Connection
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {loadingConn
                        ? 'Checking encrypted connection...'
                        : conn.connected
                        ? `Connected as ${conn.vercelAccountName || 'Vercel Creator'}`
                        : 'Not connected yet'}
                    </div>
                  </div>
                  {conn.connected && (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-200 cursor-pointer"
                    >
                      <LogOut size={12} />
                      <span>Disconnect</span>
                    </button>
                  )}
                </div>

                {!conn.connected && (
                  <div className="space-y-3 pt-1">
                    {conn.oauthEnabled && (
                      <button
                        type="button"
                        onClick={handleConnectOAuth}
                        className="w-full py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition cursor-pointer"
                      >
                        Connect via Vercel OAuth
                      </button>
                    )}

                    <form onSubmit={handleConnectPat} className="space-y-2">
                      <label htmlFor="vercel-pat-input" className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-300">
                        <KeyRound size={12} />
                        <span>Personal Access Token (Encrypted AES-256-GCM at rest)</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="vercel-pat-input"
                          type="password"
                          value={patInput}
                          onChange={(e) => setPatInput(e.target.value)}
                          placeholder="Paste Vercel token from vercel.com/account/tokens"
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="submit"
                          disabled={connecting || !patInput.trim()}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white cursor-pointer"
                        >
                          {connecting ? 'Connecting...' : 'Connect'}
                        </button>
                      </div>
                      <a
                        href="https://vercel.com/account/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 underline"
                      >
                        <span>Create token on Vercel</span>
                        <ExternalLink size={11} />
                      </a>
                    </form>
                  </div>
                )}
              </div>

              {/* Target Framework & Deploy */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="deploy-framework-select" className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Target Framework
                    </label>
                    <select
                      id="deploy-framework-select"
                      value={framework}
                      onChange={(e) => setFramework(e.target.value as ExportFramework)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="html">Static HTML / CSS / JS</option>
                      <option value="react-vite">React 19 + Vite + TypeScript</option>
                      <option value="nextjs">Next.js App Router</option>
                      <option value="vue">Vue 3 + Vite</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="deploy-slug-input" className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Vercel Project Slug
                    </label>
                    <input
                      id="deploy-slug-input"
                      type="text"
                      value={vercelProjectName}
                      onChange={(e) => setVercelProjectName(e.target.value)}
                      placeholder="my-appforge-site"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!conn.connected || deploying}
                  onClick={handleDeploy}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-semibold text-white flex items-center justify-center gap-2 transition cursor-pointer"
                  data-testid="deploy-trigger-btn"
                >
                  {deploying ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                  <span>{deploying ? 'Uploading Build Files to Vercel...' : 'Deploy to Your Vercel Account'}</span>
                </button>

                {deployment && (
                  <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-200">
                        Deployment Status: <span className="text-cyan-300 font-mono">{deployment.readyState}</span>
                      </span>
                      {deployment.url && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const u = deployment.url.startsWith('http') ? deployment.url : `https://${deployment.url}`;
                              navigator.clipboard?.writeText(u);
                              setCopiedUrl(true);
                              setTimeout(() => setCopiedUrl(false), 1800);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] cursor-pointer"
                          >
                            {copiedUrl ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                          </button>
                          <a
                            href={deployment.url.startsWith('http') ? deployment.url : `https://${deployment.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px]"
                          >
                            <span>Visit</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Domain Attachment */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Globe size={14} className="text-emerald-400" />
                  <span>Custom Domain &amp; DNS Verification</span>
                </div>
                <form onSubmit={handleAttachDomain} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="app.yourdomain.com or yourdomain.com"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={!conn.connected || domainBusy || !domainInput.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
                  >
                    Attach Domain
                  </button>
                </form>

                {domainResult && (
                  <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-zinc-200">{domainResult.domain}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-[11px] ${domainResult.verified ? 'text-emerald-400' : 'text-amber-300'}`}>
                          {domainResult.verified ? 'DNS Verified' : 'DNS Pending'}
                        </span>
                        <button
                          type="button"
                          disabled={domainBusy}
                          onClick={handleVerifyDomain}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] cursor-pointer"
                        >
                          <RefreshCw size={11} className={domainBusy ? 'animate-spin' : ''} />
                          <span>Verify DNS</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-[11px] font-mono text-zinc-400">
                      {domainResult.dnsRecords.map((rec, idx) => (
                        <div key={idx} className="flex items-center justify-between px-2 py-1 rounded bg-zinc-900">
                          <span>{rec.type} · {rec.name}</span>
                          <span className="text-zinc-200">{rec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {errorMsg && (
            <div role="alert" className="p-3 rounded-xl border border-amber-500/40 bg-amber-950/30 text-xs text-amber-200 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0 text-amber-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
