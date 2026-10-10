'use client';

import { useState } from 'react';
import { Clock, Shield, Search, FileText, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatIST } from '@/lib/date-utils';

export default function AuditLogsPage() {
  const { auditLogs } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);

    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Cryptographic System Audit Ledger
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Tamper-evident audit logs capturing investigator actions, role modifications, entity lookups, and case updates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="badge badge-low flex items-center gap-1.5 py-1.5 px-3">
            <CheckCircle2 className="h-3.5 w-3.5" /> Compliance Immutable Logging Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by actor, action type, target ID, or event details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ui-input pl-9"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#030712] border border-slate-800 rounded-xl px-3 py-1">
            <span className="text-[11px] text-slate-400 font-mono uppercase shrink-0">Filter Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Event Types</option>
              <option value="LOGIN" className="bg-slate-900 text-white">Login Sessions</option>
              <option value="ALERT" className="bg-slate-900 text-white">Alert Operations</option>
              <option value="CASE" className="bg-slate-900 text-white">Case Operations</option>
              <option value="ROLE" className="bg-slate-900 text-white">Role Modifications</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="ui-table">
          <thead>
            <tr>
              <th>TIMESTAMP (IST)</th>
              <th>INVESTIGATOR / ACTOR</th>
              <th>ACTION EVENT</th>
              <th>TARGET TYPE</th>
              <th>TARGET ID</th>
              <th>EVENT DETAILS & EVIDENCE TRACE</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500 font-mono text-xs">
                  No system audit logs match search filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono technical-metadata text-[11px] text-slate-300 whitespace-nowrap">
                    {formatIST(log.timestamp)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                      <User className="h-3.5 w-3.5 text-indigo-400" />
                      {log.actorName}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-medium">{log.action}</span>
                  </td>
                  <td className="font-mono text-[11px] text-slate-400">{log.targetType}</td>
                  <td className="font-mono technical-metadata text-[11px] text-indigo-300">{log.targetId}</td>
                  <td className="text-xs text-slate-300 max-w-md leading-relaxed">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
