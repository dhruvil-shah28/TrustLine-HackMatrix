'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Download,
  Plus,
  ArrowLeft,
  Clock,
  FileText,
  Send,
} from 'lucide-react';
import { exportCaseReportPDF, exportCaseJSON } from '@/lib/export';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState('TRANSACTION');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCaseData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setCaseData(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
      });
      const updated = await res.json();
      setCaseData(updated);
      setNewNote('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddEvidence = async () => {
    if (!evidenceTitle.trim()) return;
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence: {
            evidenceType,
            title: evidenceTitle,
            content: { addedBy: 'Investigator', timestamp: new Date().toISOString() },
          },
        }),
      });
      const updated = await res.json();
      setCaseData(updated);
      setEvidenceTitle('');
      setShowEvidenceModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportPDF = () => {
    if (!caseData) return;
    exportCaseReportPDF({
      caseCode: caseData.caseCode,
      title: caseData.title,
      severity: caseData.severity,
      status: caseData.status,
      assignedInvestigator: caseData.assignedInvestigator,
      createdAt: caseData.createdAt,
      summary: caseData.summary,
      alerts: caseData.alerts?.map((ca: any) => ({
        alertCode: ca.alert.alertCode,
        title: ca.alert.title,
        severity: ca.alert.severity,
        riskExplanation: ca.alert.riskExplanation,
        detectionMethod: ca.alert.detectionMethod,
        signals: ca.alert.signals || [],
      })) || [],
      evidenceItems: caseData.evidenceItems || [],
      auditLogs: caseData.auditLogs || [],
    });
  };

  const handleExportJSON = () => {
    if (!caseData) return;
    exportCaseJSON({
      caseCode: caseData.caseCode,
      title: caseData.title,
      severity: caseData.severity,
      status: caseData.status,
      assignedInvestigator: caseData.assignedInvestigator,
      createdAt: caseData.createdAt,
      summary: caseData.summary,
      alerts: caseData.alerts?.map((ca: any) => ({
        alertCode: ca.alert.alertCode,
        title: ca.alert.title,
        severity: ca.alert.severity,
        riskExplanation: ca.alert.riskExplanation,
        detectionMethod: ca.alert.detectionMethod,
        signals: ca.alert.signals || [],
      })) || [],
      evidenceItems: caseData.evidenceItems || [],
      auditLogs: caseData.auditLogs || [],
    });
  };

  if (loading || !caseData) {
    return <div className="p-12 text-center text-xs text-slate-400 ui-card">Loading case file detail...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <Link href="/cases" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Cases Workspace
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-amber-400">{caseData.caseCode}</span>
            <span className="px-2 py-0.5 rounded text-xs font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {caseData.status}
            </span>
            <span className="text-xs text-slate-400 font-mono">Assigned: {caseData.assignedInvestigator}</span>
          </div>
          <h1 className="heading-page mt-1">{caseData.title}</h1>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportPDF} className="btn btn-primary">
            <Download className="h-3.5 w-3.5" /> PDF Evidence Dossier
          </button>
          <button onClick={handleExportJSON} className="btn btn-secondary">
            Export JSON
          </button>

          <select
            value={caseData.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 font-bold px-3 py-2 rounded-lg outline-none cursor-pointer"
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_REVIEW">IN REVIEW</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
          </select>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols ~ 67%) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="ui-card p-5 space-y-2">
            <h2 className="heading-card">Case Overview & Summary</h2>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              {caseData.summary}
            </p>
          </div>

          <div className="ui-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-card flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-400" />
                Case Evidence Workspace ({caseData.evidenceItems?.length || 0})
              </h2>

              <button onClick={() => setShowEvidenceModal(true)} className="btn btn-primary">
                <Plus className="h-3.5 w-3.5" /> Attach Evidence
              </button>
            </div>

            <div className="space-y-3">
              {caseData.evidenceItems?.map((evd: any) => (
                <div key={evd.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-indigo-400" /> {evd.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {evd.evidenceType}
                    </span>
                  </div>
                  <pre className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-400 overflow-x-auto">
                    {evd.contentJson}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols ~ 33%) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="ui-card p-4 space-y-3">
            <h2 className="heading-card">Add Investigator Note</h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter case note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-2 rounded-lg outline-none focus:border-indigo-500 flex-1"
              />
              <button onClick={handleAddNote} className="btn btn-primary">
                <Send className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>

          <div className="ui-card p-4 space-y-3">
            <h2 className="heading-card flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              Audit Trail & Action Logs
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {caseData.auditLogs?.map((log: any) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{log.actorName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-indigo-400 inline-block font-semibold">
                    {log.action}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attach Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <h2 className="heading-card">Attach New Case Evidence</h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Evidence Category</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg outline-none font-medium"
                >
                  <option value="TRANSACTION">TRANSACTION</option>
                  <option value="EMPLOYEE_ACTIVITY">EMPLOYEE ACTIVITY</option>
                  <option value="ACCESS_EVENT">ACCESS EVENT</option>
                  <option value="GRAPH_RELATIONSHIP">GRAPH RELATIONSHIP</option>
                  <option value="ML_ANOMALY">ML ANOMALY</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Evidence Title</label>
                <input
                  type="text"
                  placeholder="e.g. Workstation IP Audit Log"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowEvidenceModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={handleAddEvidence} className="btn btn-primary">
                Attach Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
