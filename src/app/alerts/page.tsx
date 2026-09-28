'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  Clock,
  ChevronRight,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { AlertDTO } from '@/lib/types';

export default function AlertsListPage() {
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('NEWEST');

  const fetchAlerts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (riskFilter !== 'ALL') params.set('risk', riskFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);
    if (methodFilter !== 'ALL') params.set('detectionMethod', methodFilter);
    if (sortOption !== 'NEWEST') params.set('sort', sortOption);

    fetch(`/api/alerts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setAlerts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchQuery, riskFilter, statusFilter, methodFilter, sortOption]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAlerts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAlerts]);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                AML Investigation & Risk Alerts Queue
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time threat queue derived from hybrid graph circularity, insider access telemetry, and structuring detection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAlerts()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert code, title, entity ID, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-mono uppercase shrink-0">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Risk Levels</option>
              <option value="CRITICAL" className="bg-slate-900 text-rose-400">CRITICAL Risk</option>
              <option value="HIGH" className="bg-slate-900 text-amber-400">HIGH Risk</option>
              <option value="MEDIUM" className="bg-slate-900 text-yellow-400">MEDIUM Risk</option>
              <option value="LOW" className="bg-slate-900 text-emerald-400">LOW Risk</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1">
            <span className="text-[11px] text-slate-400 font-mono uppercase shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
              <option value="OPEN" className="bg-slate-900 text-rose-400">OPEN / New</option>
              <option value="IN_REVIEW" className="bg-slate-900 text-amber-400">IN REVIEW</option>
              <option value="ESCALATED" className="bg-slate-900 text-indigo-400">ESCALATED</option>
              <option value="RESOLVED" className="bg-slate-900 text-emerald-400">RESOLVED</option>
              <option value="FALSE_POSITIVE" className="bg-slate-900 text-slate-400">FALSE POSITIVE</option>
            </select>
          </div>

          {/* Sort Option */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1">
            <span className="text-[11px] text-slate-400 font-mono uppercase shrink-0">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="NEWEST" className="bg-slate-900 text-white">Newest First</option>
              <option value="HIGHEST_EXPOSURE" className="bg-slate-900 text-white">Highest Exposure</option>
              <option value="OLDEST" className="bg-slate-900 text-white">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Filter summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
          <span>Showing {alerts.length} active risk alert dossiers</span>
          {(searchQuery || riskFilter !== 'ALL' || statusFilter !== 'ALL' || methodFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRiskFilter('ALL');
                setStatusFilter('ALL');
                setMethodFilter('ALL');
                setSortOption('NEWEST');
              }}
              className="text-indigo-400 hover:text-indigo-300 underline font-sans text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Alerts List Queue */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-2xl glass-panel animate-pulse bg-slate-900/50 p-5 space-y-3">
              <div className="h-4 bg-slate-800 rounded w-1/4"></div>
              <div className="h-6 bg-slate-800 rounded w-1/2"></div>
              <div className="h-12 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 space-y-3">
          <ShieldAlert className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Alerts Match Filter Criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, risk level selection, or status filter threshold.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert: any) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            const cardBorderColor = isCritical
              ? 'border-l-rose-500 border-t-rose-500/20 border-r-rose-500/20 border-b-rose-500/20 shadow-rose-950/20'
              : isHigh
              ? 'border-l-amber-500 border-t-amber-500/20 border-r-amber-500/20 border-b-amber-500/20 shadow-amber-950/20'
              : 'border-l-indigo-500 border-t-slate-800';

            const severityBadgeBg = isCritical
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : isHigh
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';

            // Assigned Investigator
            const primaryEntityLabel =
              alert.primaryEntityType === 'EMPLOYEE'
                ? 'Vikram Malhotra (EMP-1001)'
                : alert.primaryEntityId || 'ACC-1004-INR';

            return (
              <div
                key={alert.id}
                className={`glass-panel glass-panel-hover rounded-2xl p-5 border-l-4 space-y-4 shadow-xl transition-all ${cardBorderColor}`}
              >
                {/* Top Row: Code, Risk Tag, Status, Exposure, Action Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/40">
                        {alert.alertCode}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase border ${severityBadgeBg}`}>
                        {alert.severity} RISK
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                        Confidence: {alert.confidence}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-indigo-400 bg-slate-950 border border-slate-800">
                        Status: {alert.status}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-white hover:text-indigo-300 transition">
                      {alert.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">FINANCIAL EXPOSURE</span>
                      <span className="text-sm font-mono font-extrabold text-white">
                        ₹{(alert.financialExposure || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Link
                      href={`/alerts/${alert.id}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      Investigate <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Summary narrative */}
                <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 leading-relaxed">
                  {alert.summary}
                </p>

                {/* Key Metadata & Evidence Signals Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/70 text-xs">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
                    <span>Target: <strong className="text-slate-200">{primaryEntityLabel}</strong></span>
                    <span>•</span>
                    <span>Method: <strong className="text-indigo-300">{alert.detectionMethod}</strong></span>
                    <span>•</span>
                    <span>Investigator: <strong className="text-slate-200">Rajesh Sharma (Lead AML)</strong></span>
                  </div>

                  {/* Signals pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {alert.signals?.map((sig: any) => (
                      <span
                        key={sig.id}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1 font-medium"
                      >
                        <span className="text-emerald-400 font-bold">✓</span> {sig.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
