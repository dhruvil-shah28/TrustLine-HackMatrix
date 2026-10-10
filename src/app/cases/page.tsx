'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, ArrowRight, User } from 'lucide-react';

export default function CasesListPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cases')
      .then((r) => r.json())
      .then((data) => {
        setCases(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <h1 className="heading-page flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-amber-400" />
          Investigator Case Workspace
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage investigation case files, collect evidence items, assign AML analysts, and generate export packages.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 ui-card font-mono">Loading case management files...</div>
      ) : cases.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 ui-card space-y-2">
          <Briefcase className="h-8 w-8 text-amber-400/50 mx-auto" />
          <p className="font-bold text-slate-200">No active case files found.</p>
          <p className="text-[11px] text-slate-500">Escalate an alert from the risk queue to open a new case file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((cs) => (
            <div key={cs.id} className="ui-card ui-card-warning p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400">{cs.caseCode}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {cs.status}
                </span>
              </div>

              <h2 className="heading-card font-bold text-base">{cs.title}</h2>
              <p className="text-xs text-slate-400 line-clamp-2">{cs.summary}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300">
                  <User className="h-3.5 w-3.5 text-indigo-400" /> {cs.assignedInvestigator}
                </span>

                <Link href={`/cases/${cs.id}`} className="btn btn-primary">
                  Open Case File <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
