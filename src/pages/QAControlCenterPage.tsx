import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Cpu,
  Database,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Play,
  FileText,
  Sparkles,
  ExternalLink,
  Layers,
  Search,
  KeyRound,
  Fingerprint,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { NavTabId } from '../components/layout/Sidebar.js';

interface QAUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

interface QAControlCenterProps {
  onNavigate?: (tab: NavTabId) => void;
}

export const QAControlCenterPage: React.FC<QAControlCenterProps> = ({ onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'test-lab' | 'security-demo' | 'ai-critic' | 'fixtures' | 'sandbox'
  >('overview');

  const [session, setSession] = useState<{ authenticated: boolean; user?: QAUser; expiresAt?: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>('qa-admin@deepastro.internal');
  const [loginSecret, setLoginSecret] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Telemetry & Test States
  const [statusData, setStatusData] = useState<any>(null);
  const [testLabResults, setTestLabResults] = useState<any>(null);
  const [testLabLoading, setTestLabLoading] = useState<boolean>(false);
  const [securityDemoResults, setSecurityDemoResults] = useState<any>(null);
  const [securityDemoLoading, setSecurityDemoLoading] = useState<boolean>(false);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [criticForecast, setCriticForecast] = useState<string>(
    'Career promotion in technology leadership during Saturn-Jupiter transit period in Q3 2027.'
  );
  const [criticEvidence, setCriticEvidence] = useState<number>(4);
  const [criticContradiction, setCriticContradiction] = useState<number>(0);
  const [criticConfidence, setCriticConfidence] = useState<number>(0.74);
  const [criticResult, setCriticResult] = useState<any>(null);
  const [criticLoading, setCriticLoading] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('deepastro_qa_token');
      const res = await fetch('/api/admin/qa/session', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.authenticated) {
        setSession(data);
        fetchStatus(token);
        fetchFixtures(token);
      } else {
        setSession({ authenticated: false });
      }
    } catch {
      setSession({ authenticated: false });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatus = async (token?: string | null) => {
    const t = token || localStorage.getItem('deepastro_qa_token');
    try {
      const res = await fetch('/api/admin/qa/status', {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (e) {
      console.error('Failed to fetch status', e);
    }
  };

  const fetchFixtures = async (token?: string | null) => {
    const t = token || localStorage.getItem('deepastro_qa_token');
    try {
      const res = await fetch('/api/admin/qa/golden-fixtures', {
        headers: t ? { Authorization: `Bearer ${t}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setFixtures(data.fixtures || []);
      }
    } catch (e) {
      console.error('Failed to fetch fixtures', e);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/qa/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), secret: loginSecret.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem('deepastro_qa_token', data.token);
        setSession({ authenticated: true, user: data.user, expiresAt: data.expiresAt });
        fetchStatus(data.token);
        fetchFixtures(data.token);
      } else {
        setLoginError(data.error || 'Invalid credentials or locked out.');
      }
    } catch {
      setLoginError('Connection failed. Ensure server is active.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('deepastro_qa_token');
    try {
      await fetch('/api/admin/qa/logout', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {}
    localStorage.removeItem('deepastro_qa_token');
    setSession({ authenticated: false });
  };

  const runTestLab = async () => {
    const token = localStorage.getItem('deepastro_qa_token');
    setTestLabLoading(true);
    try {
      const res = await fetch('/api/admin/qa/run-test-lab', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setTestLabResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTestLabLoading(false);
    }
  };

  const runSecurityDemo = async () => {
    const token = localStorage.getItem('deepastro_qa_token');
    setSecurityDemoLoading(true);
    try {
      const res = await fetch('/api/admin/qa/security-demo', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSecurityDemoResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSecurityDemoLoading(false);
    }
  };

  const runAICriticTest = async () => {
    const token = localStorage.getItem('deepastro_qa_token');
    setCriticLoading(true);
    try {
      const res = await fetch('/api/admin/qa/ai-critic-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          forecastText: criticForecast,
          evidenceCount: criticEvidence,
          contradictionCount: criticContradiction,
          confidence: criticConfidence,
        }),
      });
      const data = await res.json();
      setCriticResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCriticLoading(false);
    }
  };

  const runSandboxCycle = async () => {
    const token = localStorage.getItem('deepastro_qa_token');
    setSandboxLoading(true);
    try {
      const res = await fetch('/api/admin/qa/prediction-ledger/test-cycle', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setSandboxResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSandboxLoading(false);
    }
  };

  if (isLoading && !session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Synchronizing QA Security Matrix...</p>
      </div>
    );
  }

  // LOGIN SCREEN FOR UNAUTHENTICATED DEVELOPERS
  if (!session?.authenticated) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-4">
        {/* Environment Alert Banner */}
        <div className="w-full max-w-lg mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-300 backdrop-blur-md shadow-lg shadow-amber-950/20">
          <ShieldAlert className="w-6 h-6 flex-shrink-0 text-amber-400" />
          <div className="text-xs space-y-1">
            <p className="font-bold tracking-wide uppercase font-mono">DeepAstro QA Environment â€¢ Test / Preview Only</p>
            <p className="text-amber-200/80">Authorized developer access for Observatory V2.0, Challenger, and Telemetry evaluation.</p>
          </div>
        </div>

        <div className="w-full max-w-lg bg-[#0E131F]/90 border border-cyan-500/30 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white font-display">QA Control Center Login</h1>
                <p className="text-xs text-slate-400 font-mono">Server-Authoritative Test Authorization</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              QA MODE
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">Developer QA Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="qa-admin@deepastro.internal"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">QA Access Secret</label>
              <input
                type="password"
                value={loginSecret}
                onChange={(e) => setLoginSecret(e.target.value)}
                placeholder="Enter server-generated QA secret"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono transition-all"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Note: In dev, check server logs or set <code className="text-cyan-300">DEEPASTRO_QA_SECRET</code> in <code className="text-cyan-300">key.env</code>.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 font-mono"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Authenticate QA Session</span>
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300 font-mono uppercase">Security Principles Enforced:</p>
            <p>â€¢ Zero bypasses accepted â€¢ Strict rate limiting â€¢ Immutable server validation â€¢ Zero production contamination</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN QA CONTROL CENTER INTERFACE
  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* HIGH-VISIBILITY ENVIRONMENT IDENTIFICATION BANNER */}
      <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-cyan-500/15 border-2 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-black tracking-wider">
                DEEPASTRO QA ENVIRONMENT
              </span>
              <span className="font-mono text-xs text-amber-300 font-bold">TEST / PREVIEW ONLY</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Not Production â€¢ Adversarial Evaluation & Calibration Control Center
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="text-right hidden sm:block">
            <div className="text-slate-400">Authenticated: <span className="text-cyan-400 font-bold">{session.user?.email}</span></div>
            <div className="text-[11px] text-amber-300">Role: {session.user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-mono transition-all flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* TOP SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'overview', label: 'Control Center Overview', icon: Activity },
          { id: 'test-lab', label: 'QA Test Lab (15 Tests)', icon: Terminal },
          { id: 'security-demo', label: 'Security Exploit Demo (9)', icon: ShieldCheck },
          { id: 'ai-critic', label: 'AI Critic Mesh Lab', icon: Sparkles },
          { id: 'fixtures', label: 'Golden Fixtures (13)', icon: Layers },
          { id: 'sandbox', label: 'Prediction Immutability Sandbox', icon: Fingerprint },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-950/50 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0E131F]/80 border border-slate-800 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>API STATUS</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">HEALTHY</div>
              <p className="text-[11px] text-slate-400">Server-authoritative rate-limits active</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E131F]/80 border border-slate-800 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>OBSERVATORY V2.0</span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-bold font-mono text-cyan-400">22 ENGINES</div>
              <p className="text-[11px] text-slate-400">107 adversarial test suites active</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E131F]/80 border border-slate-800 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>AI CRITIC MESH</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-xl font-bold font-mono text-indigo-400">3 PROVIDERS</div>
              <p className="text-[11px] text-slate-400">Z53 Flash + GPT-4o + Gemini</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E131F]/80 border border-slate-800 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
                <span>SECURITY GATE</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-400">ZERO BYPASS</div>
              <p className="text-[11px] text-slate-400">All legacy bypass headers blocked</p>
            </div>
          </div>

          {/* Direct Launch Actions */}
          <div className="p-6 rounded-2xl bg-[#0E131F]/80 border border-slate-800 backdrop-blur-md space-y-4">
            <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Direct Module Jump Links & Evaluators</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: 'OPEN ACCURACY WAR ROOM', action: () => onNavigate?.('qa-war-room') },
                { label: 'OPEN OBSERVATORY', action: () => setActiveSubTab('overview') },
                { label: 'OPEN PREDICTION LEDGER', action: () => setActiveSubTab('sandbox') },
                { label: 'OPEN CALIBRATION', action: () => setActiveSubTab('test-lab') },
                { label: 'OPEN FACT CHECK', action: () => setActiveSubTab('test-lab') },
                { label: 'OPEN DISCRIMINATOR', action: () => setActiveSubTab('test-lab') },
                { label: 'OPEN AI CRITIC', action: () => setActiveSubTab('ai-critic') },
                { label: 'OPEN RED TEAM', action: () => setActiveSubTab('security-demo') },
                { label: 'OPEN GOLDEN FIXTURES', action: () => setActiveSubTab('fixtures') },
                { label: 'RUN 15 LAB TESTS', action: runTestLab },
                { label: 'RUN SECURITY TESTS', action: runSecurityDemo },
              ].map((btn, idx) => (
                <button
                  key={idx}
                  onClick={btn.action}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-xs font-mono text-slate-200 hover:text-cyan-300 transition-all text-left flex flex-col justify-between gap-2 shadow-sm"
                >
                  <span className="font-semibold">{btn.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 self-end" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QA TEST LAB (15 AUTOMATED TESTS) */}
      {activeSubTab === 'test-lab' && (
        <div className="p-6 rounded-2xl bg-[#0E131F]/90 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span>Observatory V2.0 Comprehensive Test Lab</span>
              </h2>
              <p className="text-xs text-slate-400">
                Executes all 15 core validation engines: Challenger, Falsifiability, Calibration, Fact Check, etc.
              </p>
            </div>

            <button
              onClick={runTestLab}
              disabled={testLabLoading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              {testLabLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Execute 15 Tests</span>
            </button>
          </div>

          {testLabResults ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="text-xs font-mono">
                  <span>Status: </span>
                  <span className="text-emerald-400 font-bold">{testLabResults.summary?.status}</span>
                  <span className="text-slate-400 ml-4">({testLabResults.summary?.passed} / {testLabResults.summary?.total} Passed in {testLabResults.summary?.totalExecutionTimeMs}ms)</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Test Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Evidence / Diagnostics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                    {testLabResults.results?.map((r: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="p-3 font-medium text-slate-200">{r.test}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{r.executionTimeMs}ms</td>
                        <td className="p-3 text-slate-300">{r.evidence || r.errors || 'Verified'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
              <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Click 'Execute 15 Tests' to benchmark Observatory V2.0</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY DEMONSTRATION (9 EXPLOITS) */}
      {activeSubTab === 'security-demo' && (
        <div className="p-6 rounded-2xl bg-[#0E131F]/90 border border-slate-800 backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Adversarial Security Exploit Demonstration</span>
              </h2>
              <p className="text-xs text-slate-400">
                Simulates 9 real attack vectors (IDOR, role escalation, confidence tampering, etc.) confirming all are rejected.
              </p>
            </div>

            <button
              onClick={runSecurityDemo}
              disabled={securityDemoLoading}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              {securityDemoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Run 9 Exploit Tests</span>
            </button>
          </div>

          {securityDemoResults ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                <div className="text-emerald-300 font-bold">
                  {securityDemoResults.summary?.verdict} ({securityDemoResults.summary?.passed} / {securityDemoResults.summary?.total} Blocked)
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {securityDemoResults.exploits?.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">{exp.exploitName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {exp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{exp.description}</p>
                    <div className="text-[10px] font-mono text-slate-500">Latency: {exp.executionTimeMs}ms</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">Click 'Run 9 Exploit Tests' to demonstrate security boundaries</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AI CRITIC MESH LAB */}
      {activeSubTab === 'ai-critic' && (
        <div className="p-6 rounded-2xl bg-[#0E131F]/90 border border-slate-800 backdrop-blur-md space-y-6">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Multi-Provider AI Critic Mesh Laboratory</span>
            </h2>
            <p className="text-xs text-slate-400">
              Submit controlled forecasts to Z53 Flash, OpenAI GPT-4o, and Gemini 2.5 Flash with final quality gate verdict.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">Test Forecast Text</label>
              <textarea
                rows={3}
                value={criticForecast}
                onChange={(e) => setCriticForecast(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Supporting Evidence Count</label>
                <input
                  type="number"
                  value={criticEvidence}
                  onChange={(e) => setCriticEvidence(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Contradiction Count</label>
                <input
                  type="number"
                  value={criticContradiction}
                  onChange={(e) => setCriticContradiction(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1 uppercase">Confidence (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  value={criticConfidence}
                  onChange={(e) => setCriticConfidence(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={runAICriticTest}
              disabled={criticLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
            >
              {criticLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Evaluate Against AI Critic Mesh</span>
            </button>
          </div>

          {criticResult && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">FINAL QUALITY GATE VERDICT:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  criticResult.finalQualityGate?.recommendation === 'PASS'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : criticResult.finalQualityGate?.recommendation === 'SOFTEN'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  {criticResult.finalQualityGate?.recommendation} (Risk: {criticResult.finalQualityGate?.overallRisk})
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {criticResult.meshCritiques?.map((c: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono font-bold text-cyan-300">{c.provider}</div>
                    <p className="text-[11px] text-slate-300">{c.critique}</p>
                    <div className="text-[10px] font-mono text-slate-400">Confidence: {(c.confidence * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: GOLDEN TEST FIXTURES (13) */}
      {activeSubTab === 'fixtures' && (
        <div className="p-6 rounded-2xl bg-[#0E131F]/90 border border-slate-800 backdrop-blur-md space-y-4">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>Controlled Golden Test Fixtures (13 Categories)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Labeled strictly as <code className="text-amber-300 font-mono">SYNTHETIC_TEST</code>. Prevented by invariant from contributing to real-world accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fixtures.map((f: any) => (
              <div key={f.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-300">{f.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {f.dataset_type}
                  </span>
                </div>
                <p className="text-xs text-slate-200">{f.forecastText}</p>
                <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                  <div>Category: {f.category} | Domain: {f.domain} | Expected: <span className="text-emerald-300">{f.expectedRecommendation}</span></div>
                  <div className="text-slate-500 text-[10px]">{f.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PREDICTION IMMUTABILITY SANDBOX */}
      {activeSubTab === 'sandbox' && (
        <div className="p-6 rounded-2xl bg-[#0E131F]/90 border border-slate-800 backdrop-blur-md space-y-6">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-cyan-400" />
              <span>Prediction Ledger & Immutability Sandbox</span>
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrates SHA-256 seal generation, cryptographic verification, and tamper rejection.
            </p>
          </div>

          <button
            onClick={runSandboxCycle}
            disabled={sandboxLoading}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            {sandboxLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Execute Immutability & Tamper Verification Cycle</span>
          </button>

          {sandboxResult && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div>Prediction ID: <span className="text-cyan-300">{sandboxResult.predictionId}</span></div>
              <div>Dataset: <span className="text-amber-300">{sandboxResult.dataset_type}</span></div>
              <div className="break-all">Content Hash (SHA-256): <span className="text-emerald-300">{sandboxResult.frozenHash}</span></div>
              <div>Initial Hash Verification: <span className="text-emerald-400 font-bold">{sandboxResult.initialValidation?.valid ? 'VALID' : 'INVALID'}</span></div>
              <div>Tamper Attempt Rejected: <span className="text-emerald-400 font-bold">{sandboxResult.tamperAttemptRejected ? 'YES (Tamper Blocked)' : 'NO'}</span></div>
              <div className="text-slate-400 text-[11px]">{sandboxResult.tamperReason}</div>
              <div>Production Contamination Risk: <span className="text-emerald-400 font-bold">{sandboxResult.productionContaminationRisk}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

