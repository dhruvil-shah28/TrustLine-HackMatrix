'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  GitFork,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Briefcase,
  Activity,
  ArrowRight,
  Layers,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { AlertDTO } from '@/lib/types';

export default function RiskDashboardPage() {
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/alerts').then((r) => r.json()),
      fetch('/api/cases').then((r) => r.json()),
    ])
      .then(([alertsData, casesData]) => {
        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setCases(Array.isArray(casesData) ? casesData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeAlertsCount = alerts.filter((a) => a.status === 'OPEN' || a.status === 'IN_REVIEW').length;
  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const highRiskCasesCount = cases.filter((c) => c.severity === 'CRITICAL' || c.severity === 'HIGH').length;
  const openInvestigations = cases.filter((c) => c.status === 'OPEN' || c.status === 'IN_REVIEW').length;
  const suspiciousVolume = alerts.reduce((acc, curr) => acc + (curr.financialExposure || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="heading-page">Risk intelligence overview</h1>
            <span className="badge badge-low flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Telemetry Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Prioritised signals, connected activity, and investigation readiness at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/graph" className="btn btn-primary">
            <GitFork className="h-3.5 w-3.5" />
            Money Flow Graph
          </Link>
          <Link href="/lab" className="btn btn-secondary">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Detection Lab
          </Link>
        </div>
      </div>

      {/* 2. Standardized KPI Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ui-card ui-card-critical p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="heading-section text-rose-400">ACTIVE RISK ALERTS</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="metric-value text-white">{loading ? '...' : activeAlertsCount}</span>
            <span className="badge badge-critical">{criticalCount} CRITICAL</span>
          </div>
          <p className="text-[11px] text-slate-400">Connected anomaly triggers in queue</p>
        </div>

        <div className="ui-card ui-card-warning p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="heading-section text-amber-400">HIGH-RISK CASES</span>
            <Briefcase className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="metric-value text-white">{loading ? '...' : highRiskCasesCount}</span>
            <span className="badge badge-high">{openInvestigations} ACTIVE</span>
          </div>
          <p className="text-[11px] text-slate-400">Assigned investigator case files</p>
        </div>

        <div className="ui-card ui-card-info p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="heading-section text-indigo-400">FLAGGED FINANCIAL EXPOSURE</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="metric-value text-white">
              ₹{loading ? '...' : (suspiciousVolume / 100000).toFixed(2)}L
            </span>
            <span className="badge badge-medium">4 SCENARIOS</span>
          </div>
          <p className="text-[11px] text-slate-400">Total suspicious financial volume</p>
        </div>

        <div className="ui-card ui-card-success p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="heading-section text-emerald-400">DETECTION PRECISION</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="metric-value text-white">91.6%</span>
            <span className="badge badge-low">FPR 8.3%</span>
          </div>
          <p className="text-[11px] text-slate-400">Benchmarked on 11 rule controls</p>
        </div>
      </div>

      {/* 3. Main Dashboard Content Grid: 67% Left (Alerts), 33% Right (Topology & Active Cases) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 cols ~ 67%) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading-card flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-400" />
              Latest Connected Risk Alerts
            </h2>
            <Link href="/alerts" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              View All Queue ({alerts.length}) <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 ui-card">Loading live risk signals...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 ui-card">No active alerts found.</div>
            ) : (
              alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="ui-card ui-card-critical p-5 space-y-3 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono technical-metadata text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                          {alert.alertCode}
                        </span>
                        <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-critical' : 'badge-high'}`}>
                          {alert.severity} RISK
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Confidence: {alert.confidence}</span>
                      </div>
                      <h3 className="font-bold text-white text-sm">{alert.title}</h3>
                    </div>

                    <Link href={`/alerts/${alert.id}`} className="btn btn-primary shrink-0">
                      Investigate <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <p className="text-xs text-slate-300 bg-[#030712] p-3 rounded-lg border border-slate-800 leading-relaxed font-medium">
                    {alert.summary}
                  </p>

                  {/* Signals List */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
                    <span className="heading-section">EVIDENCE SIGNALS:</span>
                    {alert.signals?.map((sig) => (
                      <span
                        key={sig.id}
                        className="px-2 py-0.5 rounded text-[11px] bg-slate-900 text-slate-200 border border-slate-800 flex items-center gap-1 font-medium"
                      >
                        <span className="text-emerald-400 font-bold">✓</span> {sig.title}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols ~ 33%) */}
        <div className="lg:col-span-4 space-y-5">
          {/* High Risk Topology Links Card */}
          <div className="ui-card p-5 space-y-3">
            <h2 className="heading-card flex items-center gap-2">
              <GitFork className="h-4 w-4 text-indigo-400" />
              High-Risk Topology Links
            </h2>
            <p className="text-xs text-slate-400">
              Correlated insider staff lookups & circular transfer paths.
            </p>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#030712] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">Vikram Malhotra (EMP-1001)</span>
                  <span className="badge badge-critical">SCORE 88.5</span>
                </div>
                <p className="text-sm text-slate-400">3-node cycle: ACC-1001 &rarr; ACC-1002 &rarr; ACC-1006</p>
              </div>

              <div className="p-3 rounded-xl bg-[#030712] border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs">Priya Sundaram (EMP-1004)</span>
                  <span className="badge badge-critical">SCORE 92.4</span>
                </div>
                <p className="text-sm text-slate-400">Structuring: 3 transfers under ₹5L threshold</p>
              </div>
            </div>

            <Link href="/graph" className="btn btn-secondary w-full text-center block mt-2">
              Open Money Flow Visualizer
            </Link>
          </div>

          {/* Active Cases Queue Widget */}
          <div className="ui-card p-5 space-y-3">
            <h2 className="heading-card flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-amber-400" />
              Active Cases Queue
            </h2>

            <div className="space-y-2">
              {cases.slice(0, 3).map((cs) => (
                <Link
                  key={cs.id}
                  href={`/cases/${cs.id}`}
                  className="block p-3 rounded-xl bg-[#030712] hover:bg-slate-900 border border-slate-800 transition space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono technical-metadata font-medium text-indigo-300">{cs.caseCode}</span>
                    <span className="badge badge-high">{cs.status}</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{cs.title}</p>
                  <p className="text-xs text-slate-400">Assigned: {cs.assignedInvestigator}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
