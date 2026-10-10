'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldAlert,
  ArrowLeft,
  Activity,
  Lock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building,
  UserCheck,
  Zap,
  Layers,
  ChevronRight,
  Info,
  X,
  PlusCircle,
  Network,
} from 'lucide-react';
import { formatIST } from '@/lib/date-utils';

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<any>(null);
  const [activeAccessTab, setActiveAccessTab] = useState<'today' | 'yesterday' | 'earlier'>('today');
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [caseCreatedSuccess, setCaseCreatedSuccess] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        if (res.employee) {
          setCaseTitle(`Insider Risk Investigation: ${res.employee.name} (${res.employee.employeeCode})`);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading || !data || !data.employee) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-2xl glass-panel animate-pulse bg-slate-900/50 p-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 rounded-2xl glass-panel animate-pulse bg-slate-900/50"></div>
          <div className="lg:col-span-2 h-96 rounded-2xl glass-panel animate-pulse bg-slate-900/50"></div>
        </div>
      </div>
    );
  }

  const {
    employee,
    peerBaseline,
    riskSignals = [],
    relatedAlerts = [],
    connectedCustomers = [],
    connectedAccounts = [],
    connectedTransactions = [],
    groupedAccessEvents = { today: [], yesterday: [], earlier: [] },
    timeline = [],
  } = data;

  const isCritical = employee.riskScore >= 75;
  const isHigh = employee.riskScore >= 60 && employee.riskScore < 75;
  const isElevated = employee.riskScore >= 35 && employee.riskScore < 60;

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    setCaseCreatedSuccess(true);
    setTimeout(() => {
      setShowCaseModal(false);
      setCaseCreatedSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Breadcrumb & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <Link
            href="/employees"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mb-2 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Employee Intelligence
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {employee.name}
            </h1>
            <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/50">
              {employee.employeeCode}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>{employee.role}</span>
            <span>•</span>
            <span>{employee.department}</span>
            <span>•</span>
            <span className="font-mono">{employee.email}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href={`/graph?node=${employee.employeeCode}`}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow transition"
          >
            <Network className="h-3.5 w-3.5 text-indigo-400" />
            Money Flow Graph
          </Link>
          <button
            onClick={() => setShowCaseModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Open Investigation
          </button>
        </div>
      </div>

      {/* Identity & Top Risk Header Banner */}
      <div
        className={`glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isCritical
            ? 'bg-slate-900 border-l-4 border-l-rose-500'
            : isHigh
            ? 'bg-slate-900 border-l-4 border-l-amber-500'
            : 'bg-slate-900 border-l-4 border-l-indigo-500'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase font-mono tracking-wider border ${
                isCritical
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : isHigh
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              }`}
            >
              {isCritical ? 'CRITICAL INSIDER RISK' : isHigh ? 'HIGH INSIDER RISK' : 'ELEVATED ACTIVITY'}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-950 text-amber-300 border border-slate-800">
              PRIVILEGE: {employee.privilegeLevel}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
              STATUS: {employee.status}
            </span>
          </div>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Insider risk intelligence dossier monitoring total customer lookups, privileged authorization overrides, circular account transfers, and peer baseline deviations.
          </p>

          <div className="flex items-center gap-4 pt-1 text-[11px] font-mono text-slate-400">
            <span>Workstation Lookups: <strong className="text-white">{employee.accessEvents?.length || 0}</strong></span>
            <span>•</span>
            <span>Connected Alerts: <strong className="text-rose-400">{relatedAlerts.length}</strong></span>
            <span>•</span>
            <span>Transactions Touched: <strong className="text-indigo-300">{connectedTransactions.length}</strong></span>
          </div>
        </div>

        {/* Activity Risk Index Gauge Card */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800/90 bg-slate-950/80 text-center min-w-[200px] shrink-0 shadow-lg">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
            Activity Risk Index
          </span>
          <span
            className={`text-3xl font-extrabold font-mono mt-0.5 block ${
              isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-indigo-400'
            }`}
          >
            {employee.riskScore.toFixed(1)} / 100
          </span>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
            Baseline Deviation: {peerBaseline.overallDeviationFactor}
          </span>
        </div>
      </div>

      {/* Main Multi-Panel Investigation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Signals & Peer Group Baseline */}
        <div className="space-y-6">
          {/* Risk Summary & Contributing Signals */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Contributing Risk Signals
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">Interactive Evidence</span>
            </div>

            <p className="text-xs text-slate-400">
              Click any signal below to inspect underlying evidence trace and target metrics.
            </p>

            <div className="space-y-2.5">
              {riskSignals.map((sig: any) => (
                <button
                  key={sig.id}
                  onClick={() => setSelectedSignal(sig)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 transition group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      {sig.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                        sig.level === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : sig.level === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      +{sig.weight} PTS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {sig.summary}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-indigo-400 font-mono">
                    <span>View Evidence Trace</span>
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Peer Group Baseline Comparison */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-5 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                Peer Group Baseline Comparison
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Benchmark vs typical peer range ({peerBaseline.role} • {peerBaseline.department})
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Metric 1: Customer Access Count */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300 font-medium">Daily Customer Record Access</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      peerBaseline.customerAccess.status === 'Significant Deviation'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {peerBaseline.customerAccess.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">Peer Typical: {peerBaseline.customerAccess.peerAverage}/day</span>
                  <span className="font-bold text-rose-400 text-sm">
                    Employee: {peerBaseline.customerAccess.employeeValue}/day
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full bg-slate-700 w-[35%] rounded-full opacity-60"></div>
                  <div className="absolute left-0 top-0 h-full bg-rose-500 w-[85%] rounded-full"></div>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {peerBaseline.customerAccess.explanation}
                </p>
              </div>

              {/* Metric 2: Approval Volume */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300 font-medium">Transaction Approval Volume</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      peerBaseline.approvalVolume.status === 'Significant Deviation'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {peerBaseline.approvalVolume.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">Peer Tier: {peerBaseline.approvalVolume.peerRange}</span>
                  <span className="font-bold text-rose-400 text-sm">
                    Employee: {peerBaseline.approvalVolume.employeeValue}
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden relative">
                  <div className="absolute left-0 top-0 h-full bg-slate-700 w-[25%] rounded-full opacity-60"></div>
                  <div className="absolute left-0 top-0 h-full bg-amber-500 w-[75%] rounded-full"></div>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {peerBaseline.approvalVolume.explanation}
                </p>
              </div>

              {/* Metric 3: After-Hours Access */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300 font-medium">After-Hours Session Access</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      peerBaseline.afterHoursActivity.status === 'Elevated'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {peerBaseline.afterHoursActivity.status}
                  </span>
                </div>
                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400">Peer Peer: {peerBaseline.afterHoursActivity.peerAverage}</span>
                  <span className="font-bold text-amber-400 text-sm">
                    Employee: {peerBaseline.afterHoursActivity.employeeValue}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {peerBaseline.afterHoursActivity.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Access Events, Connected Entities, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Glassmorphic Panel: Recorded Access Events & Profile Lookups */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  Recorded Workstation Access Events & Profile Lookups
                </h2>
                <p className="text-[11px] text-slate-400">
                  Categorized audit trail of employee entity lookups & updates
                </p>
              </div>

              {/* Timeframe Filter Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveAccessTab('today')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    activeAccessTab === 'today' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Today ({groupedAccessEvents.today.length})
                </button>
                <button
                  onClick={() => setActiveAccessTab('yesterday')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    activeAccessTab === 'yesterday' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Yesterday ({groupedAccessEvents.yesterday.length})
                </button>
                <button
                  onClick={() => setActiveAccessTab('earlier')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${
                    activeAccessTab === 'earlier' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Earlier ({groupedAccessEvents.earlier.length})
                </button>
              </div>
            </div>

            {/* List of Grouped Access Events */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(groupedAccessEvents[activeAccessTab] || []).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-mono">
                  No access events logged for this timeframe.
                </div>
              ) : (
                (groupedAccessEvents[activeAccessTab] || []).map((ev: any) => (
                  <div
                    key={ev.id}
                    className={`p-3.5 rounded-xl bg-slate-950/70 border flex items-center justify-between text-xs transition ${
                      ev.riskRelevance === 'HIGH'
                        ? 'border-rose-500/40 bg-rose-950/10'
                        : ev.riskRelevance === 'MEDIUM'
                        ? 'border-amber-500/30'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {ev.accessType}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {ev.entityType}
                        </span>
                        {ev.riskRelevance === 'HIGH' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            HIGH RELEVANCE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Target Entity ID: <span className="text-indigo-300 font-semibold">{ev.entityId}</span> • IP: {ev.ipAddress}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[11px] text-slate-300 font-semibold block">
                        {formatIST(ev.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connected Entity Intelligence Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-400" />
                Connected Entity Intelligence
              </h2>
              <p className="text-[11px] text-slate-400">
                Customers, accounts, transactions, and active alerts linked to employee actions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Linked Alerts */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                    Linked Alerts ({relatedAlerts.length})
                  </span>
                </div>
                {relatedAlerts.length === 0 ? (
                  <p className="text-[11px] text-slate-500 font-mono">No direct alerts linked.</p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {relatedAlerts.slice(0, 3).map((alt: any) => (
                      <Link
                        key={alt.id}
                        href={`/alerts/${alt.id}`}
                        className="block p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-[11px] transition group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-300">{alt.alertCode}</span>
                          <span className="text-[9px] font-bold text-rose-400 uppercase">{alt.severity}</span>
                        </div>
                        <p className="text-slate-300 font-medium truncate mt-0.5">{alt.title}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Connected Customers */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-400" />
                    Accessed Customers ({connectedCustomers.length})
                  </span>
                  <Link href="/customers" className="text-[10px] text-indigo-400 hover:underline font-mono">
                    View All &rarr;
                  </Link>
                </div>
                {connectedCustomers.length === 0 ? (
                  <p className="text-[11px] text-slate-500 font-mono">No customer records fetched.</p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {connectedCustomers.slice(0, 3).map((cust: any) => (
                      <Link
                        key={cust.id}
                        href="/customers"
                        className="block p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-[11px] transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{cust.name}</span>
                          <span className="text-[9px] font-mono text-amber-400">{cust.riskProfile} RISK</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-mono mt-0.5">{cust.customerCode} • KYC: {cust.kycStatus}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Accounts Touched */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
                    Accounts Touched ({connectedAccounts.length})
                  </span>
                </div>
                {connectedAccounts.length === 0 ? (
                  <p className="text-[11px] text-slate-500 font-mono">No account entities touched.</p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {connectedAccounts.slice(0, 3).map((acc: any) => (
                      <div key={acc.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-indigo-300">{acc.accountNumber}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">₹{acc.balance.toLocaleString()}</span>
                        </div>
                        <p className="text-slate-400 text-[10px]">{acc.accountType} Account</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transactions Influenced */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                    Transactions ({connectedTransactions.length})
                  </span>
                  <Link href="/graph" className="text-[10px] text-indigo-400 hover:underline font-mono">
                    Money Flow Graph &rarr;
                  </Link>
                </div>
                {connectedTransactions.length === 0 ? (
                  <p className="text-[11px] text-slate-500 font-mono">No transactions recorded.</p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {connectedTransactions.slice(0, 3).map((tx: any) => (
                      <div key={tx.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-amber-300">₹{tx.amount.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{tx.channel}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-mono truncate">{tx.txHash}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Investigation Timeline */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                Chronological Employee Activity & Risk Timeline
              </h2>
              <p className="text-[11px] text-slate-400">
                Integrated chronological sequence of access logs, system actions, transactions, and alert triggers
              </p>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              {timeline.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-mono">No timeline events recorded.</div>
              ) : (
                timeline.map((item: any) => {
                  const isAlert = item.category === 'ALERT';
                  const isHighRisk = item.severity === 'HIGH' || item.severity === 'CRITICAL';

                  return (
                    <div key={item.id} className="relative group">
                      {/* Node Bullet Icon */}
                      <div
                        className={`absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-slate-950 ${
                          isAlert
                            ? 'border-rose-500 bg-rose-500'
                            : isHighRisk
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-indigo-500 bg-indigo-500'
                        }`}
                      ></div>

                      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 transition space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-200">{item.title}</span>
                          <span className="text-[10px] font-mono text-slate-300 font-semibold">
                            {formatIST(item.timestamp)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400">{item.summary}</p>

                        {item.link && (
                          <div className="pt-1">
                            <Link
                              href={item.link}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono font-semibold flex items-center gap-1"
                            >
                              Inspect Alert Detail <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Signal Evidence Drawer / Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-lg w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedSignal(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider block">
                Signal Evidence Details
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                {selectedSignal.title}
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">SIGNAL SUMMARY</span>
                <p className="text-slate-200 mt-0.5 leading-relaxed">{selectedSignal.summary}</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">SYSTEM EVIDENCE TRACE</span>
                <p className="font-mono text-indigo-300 text-[11px] mt-0.5 bg-slate-900 p-2.5 rounded border border-slate-800">
                  {selectedSignal.evidence}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSignal(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow hover:bg-indigo-500 transition"
              >
                Close Signal Trace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Case Investigation Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowCaseModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-indigo-400" />
                Open Insider Risk Case
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Initiate formal case file for {employee.name} ({employee.employeeCode})
              </p>
            </div>

            {caseCreatedSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                <p>Case successfully created & assigned to Sarah Jenkins!</p>
              </div>
            ) : (
              <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">CASE TITLE</label>
                  <input
                    type="text"
                    value={caseTitle}
                    onChange={(e) => setCaseTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-mono text-[11px] mb-1">ASSIGNED INVESTIGATOR</label>
                  <input
                    type="text"
                    value="Investigator Sarah Jenkins"
                    disabled
                    className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCaseModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold hover:bg-slate-850"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow"
                  >
                    Create Case File
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
