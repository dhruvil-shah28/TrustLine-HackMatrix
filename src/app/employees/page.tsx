'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldAlert,
  ArrowUpRight,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ShieldCheck,
  Activity,
  UserCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export default function EmployeesListPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [privilegeFilter, setPrivilegeFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (riskFilter !== 'ALL') params.set('riskLevel', riskFilter);
    if (privilegeFilter !== 'ALL') params.set('privilege', privilegeFilter);
    if (deptFilter !== 'ALL') params.set('department', deptFilter);

    fetch(`/api/employees?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchQuery, riskFilter, privilegeFilter, deptFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  // Unique departments for filter dropdown
  const departments = [
    'ALL',
    'Branch Operations',
    'Wealth Management',
    'IT Infrastructure',
    'Compliance & AML',
    'Corporate Banking',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Employee Intelligence & Insider Risk Workspace
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time monitoring of staff privilege levels, workstation lookups, peer group baselines, and transaction authorization limits.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchEmployees()}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            Refresh Intelligence
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-mono uppercase shrink-0">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Risk Levels</option>
              <option value="CRITICAL" className="bg-slate-900 text-rose-400">Critical Risk (&ge;75)</option>
              <option value="HIGH" className="bg-slate-900 text-amber-400">High Risk (60-74)</option>
              <option value="MEDIUM" className="bg-slate-900 text-yellow-400">Elevated (35-59)</option>
              <option value="LOW" className="bg-slate-900 text-emerald-400">Low Risk (&lt;35)</option>
            </select>
          </div>

          {/* Privilege Level Filter */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1">
            <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-mono uppercase shrink-0">Privilege:</span>
            <select
              value={privilegeFilter}
              onChange={(e) => setPrivilegeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Privileges</option>
              <option value="ADMIN" className="bg-slate-900 text-rose-400">ADMIN</option>
              <option value="SUPERUSER" className="bg-slate-900 text-amber-400">SUPERUSER</option>
              <option value="ELEVATED" className="bg-slate-900 text-indigo-400">ELEVATED</option>
              <option value="STANDARD" className="bg-slate-900 text-slate-300">STANDARD</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-mono uppercase shrink-0">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer text-ellipsis overflow-hidden whitespace-nowrap"
            >
              {departments.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Count summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
          <span>Showing {employees.length} monitored employee risk profiles</span>
          {(searchQuery || riskFilter !== 'ALL' || privilegeFilter !== 'ALL' || deptFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRiskFilter('ALL');
                setPrivilegeFilter('ALL');
                setDeptFilter('ALL');
              }}
              className="text-indigo-400 hover:text-indigo-300 underline font-sans text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Employee Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 rounded-2xl glass-panel animate-pulse bg-slate-900/50 p-5 space-y-4">
              <div className="h-4 bg-slate-800 rounded w-1/3"></div>
              <div className="h-6 bg-slate-800 rounded w-2/3"></div>
              <div className="h-12 bg-slate-800 rounded"></div>
              <div className="h-10 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800/80 space-y-3">
          <ShieldAlert className="h-10 w-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Employees Match Filter Criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, department selection, or risk filter threshold.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map((emp) => {
            const isCritical = emp.riskScore >= 75;
            const isHigh = emp.riskScore >= 60 && emp.riskScore < 75;
            const isElevated = emp.riskScore >= 35 && emp.riskScore < 60;

            const cardBorderColor = isCritical
              ? 'border-l-rose-500 border-t-rose-500/20 border-r-rose-500/20 border-b-rose-500/20 shadow-rose-950/20'
              : isHigh
              ? 'border-l-amber-500 border-t-amber-500/20 border-r-amber-500/20 border-b-amber-500/20 shadow-amber-950/20'
              : isElevated
              ? 'border-l-indigo-500 border-t-indigo-500/20'
              : 'border-l-emerald-500 border-t-slate-800';

            const riskBadgeBg = isCritical
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : isHigh
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : isElevated
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

            const statusText = isCritical
              ? 'CRITICAL RISK'
              : isHigh
              ? 'HIGH RISK'
              : isElevated
              ? 'ELEVATED'
              : 'LOW RISK';

            return (
              <div
                key={emp.id}
                className={`glass-panel glass-panel-hover rounded-2xl p-5 border-l-4 space-y-4 shadow-xl transition-all duration-200 flex flex-col justify-between ${cardBorderColor}`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Code & Privilege */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono technical-metadata text-xs text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-800/40">
                        {emp.employeeCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${riskBadgeBg}`}>
                        {statusText}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-amber-300 border border-slate-800">
                      {emp.privilegeLevel}
                    </span>
                  </div>

                  {/* Employee Name & Role */}
                  <div>
                    <h2 className="font-bold text-white text-base group-hover:text-indigo-300 transition">
                      {emp.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {emp.role}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      <span>{emp.department}</span>
                    </div>
                  </div>

                  {/* Risk Index & Activity Gauge Panel */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                        <Activity className="h-3.5 w-3.5 text-indigo-400" />
                        Activity Risk Index
                      </span>
                      <span
                        className={`font-bold text-lg ${
                          isCritical
                            ? 'text-rose-400'
                            : isHigh
                            ? 'text-amber-400'
                            : isElevated
                            ? 'text-indigo-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {emp.riskScore.toFixed(1)} / 100
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isCritical
                            ? 'bg-rose-500'
                            : isHigh
                            ? 'bg-amber-500'
                            : isElevated
                            ? 'bg-indigo-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(emp.riskScore, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Activity Stats Pill Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                      <span className="text-slate-500 block text-[10px]">Workstation Lookups</span>
                      <span className="font-semibold text-slate-200">{emp.accessCount || 0} events</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                      <span className="text-slate-500 block text-[10px]">Tx Executed/Approved</span>
                      <span className="font-semibold text-slate-200">{emp.txCount || 0} records</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono technical-metadata">
                    Updated {new Date(emp.lastActive).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/employees/${emp.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1 transition"
                  >
                    View Risk Profile <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
