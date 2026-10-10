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
  History,
  Layers,
  Dna,
  ShieldCheck,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { exportCaseReportPDF, exportCaseJSON } from '@/lib/export';
import { formatIST } from '@/lib/date-utils';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState('TRANSACTION');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Feature 05: Evidence Lock State
  const [locks, setLocks] = useState<any[]>([]);
  const [sealing, setSealing] = useState(false);
  const [verifyingLockId, setVerifyingLockId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [manifestModalData, setManifestModalData] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const loadLocks = () => {
    fetch(`/api/evidence-lock?caseId=${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.locks) setLocks(data.locks);
      })
      .catch((e) => console.error('Failed to load locks:', e));
  };

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCaseData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    loadLocks();
  }, [id]);

  const handleSealEvidence = async () => {
    if (!caseData) return;
    setSealing(true);
    try {
      const res = await fetch('/api/evidence-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: id,
          actorName: caseData.assignedInvestigator || 'Investigator Sarah Jenkins',
          actorId: 'INV-101',
          role: 'Senior Financial Crime Investigator',
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadLocks();
        // Refresh case data to update audit trail and evidence
        const refetch = await fetch(`/api/cases/${id}`);
        setCaseData(await refetch.json());
      }
    } catch (err) {
      console.error('Sealing failed:', err);
    } finally {
      setSealing(false);
    }
  };

  const handleVerifyLock = async (lockId: string) => {
    setVerifyingLockId(lockId);
    setVerificationResult(null);
    try {
      const res = await fetch(`/api/evidence-lock/${lockId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: caseData?.assignedInvestigator || 'Auditor Sarah Jenkins' }),
      });
      const data = await res.json();
      if (data.result) {
        setVerificationResult(data.result);
      }
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifyingLockId(null);
    }
  };

  const handleViewManifest = async (lockId: string) => {
    try {
      const res = await fetch(`/api/evidence-lock/${lockId}?mode=manifest`);
      const manifest = await res.json();
      setManifestModalData(manifest);
    } catch (err) {
      console.error('Failed to load manifest:', err);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

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
            <span className="font-mono technical-metadata text-sm text-amber-400">{caseData.caseCode}</span>
            <span className="px-2 py-0.5 rounded text-xs font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {caseData.status}
            </span>
            <span className="text-sm text-slate-400">Assigned: {caseData.assignedInvestigator}</span>
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
              {caseData.evidenceItems
                ?.filter((evd: any) => evd.evidenceType !== 'EVIDENCE_LOCK')
                .map((evd: any) => (
                  <div key={evd.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-indigo-400" /> {evd.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {evd.evidenceType}
                      </span>
                    </div>
                    <pre className="p-2 rounded bg-slate-950 font-mono technical-metadata text-[10px] text-slate-400 overflow-x-auto">
                      {evd.contentJson}
                    </pre>
                  </div>
                ))}
            </div>
          </div>

          {/* FEATURE 05: Cryptographic Evidence Lock & Tamper-Evident Integrity */}
          <div className="ui-card p-5 space-y-5 border border-amber-500/40 bg-gradient-to-b from-amber-950/10 to-slate-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                  <h2 className="heading-card text-amber-200">
                    Evidence Lock & Tamper-Evident Integrity
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    SHA-256 SEAL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cryptographically hashes all live case records, alerts, signals, and evidence into canonical immutable snapshots.
                </p>
              </div>

              <button
                onClick={handleSealEvidence}
                disabled={sealing}
                className="btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold border-amber-400 flex items-center gap-2 text-xs shadow-md shadow-amber-950/40 disabled:opacity-60"
              >
                {sealing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sealing Snapshot...
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" /> Seal Current Evidence
                  </>
                )}
              </button>
            </div>

            {/* Verification Result Notification Banner */}
            {verificationResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                  verificationResult.overallStatus === 'VERIFIED_INTACT'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : verificationResult.overallStatus === 'SOURCE_RECORDS_ALTERED'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {verificationResult.overallStatus === 'VERIFIED_INTACT' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    )}
                    <span>
                      {verificationResult.overallStatus === 'VERIFIED_INTACT'
                        ? 'Cryptographic Verification Passed (INTACT)'
                        : verificationResult.overallStatus === 'SOURCE_RECORDS_ALTERED'
                        ? 'Warning: Source Records Differ From Snapshot'
                        : 'CRITICAL ALERT: Snapshot Cryptographic Hash Mismatch (TAMPERED)'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] opacity-75">
                    {formatIST(verificationResult.verifiedAt)}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {verificationResult.summaryMessage}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[10px]">
                  <div>
                    <span className="text-slate-400">Sealed Hash:</span>{' '}
                    <span className="text-slate-200">{verificationResult.recordedHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Recomputed Hash:</span>{' '}
                    <span className="text-slate-200">{verificationResult.recomputedHash}</span>
                  </div>
                </div>

                {verificationResult.discrepancies?.length > 0 && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-800">
                    <span className="font-bold text-[11px] text-amber-300">
                      Detected Discrepancies ({verificationResult.discrepancies.length}):
                    </span>
                    <div className="space-y-1">
                      {verificationResult.discrepancies.map((d: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-black/40 border border-slate-800 font-mono text-[10px] text-slate-300"
                        >
                          <span className="font-bold text-amber-400">[{d.recordType}]</span> {d.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Evidence Locks Chain List */}
            {locks.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-2 bg-slate-950/30">
                <Lock className="h-6 w-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">
                  No cryptographic evidence locks sealed yet for this case.
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Click &ldquo;Seal Current Evidence&rdquo; to compute the initial SHA-256 seal across all attached records and alerts.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Cryptographic Seal History & Hash Chain ({locks.length})</span>
                  <span className="text-[10px] text-amber-400/90 font-mono">APPEND-ONLY SECURE LEDGER</span>
                </div>

                {locks.map((lock: any, index: number) => (
                  <div
                    key={lock.lockId}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {lock.lockId}
                        </span>
                        {index === 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            LATEST HEAD
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          by <strong className="text-slate-200">{lock.sealedBy?.actorName || 'Investigator'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewManifest(lock.lockId)}
                          className="btn btn-secondary text-[11px] py-1 px-2.5 flex items-center gap-1.5"
                        >
                          <FileText className="h-3 w-3 text-indigo-400" /> Manifest
                        </button>
                        <button
                          onClick={() => handleVerifyLock(lock.lockId)}
                          disabled={verifyingLockId === lock.lockId}
                          className="btn btn-primary text-[11px] py-1 px-2.5 flex items-center gap-1.5"
                        >
                          {verifyingLockId === lock.lockId ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" /> Verifying...
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3 w-3 text-emerald-400" /> Verify Integrity
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* SHA-256 Hash Display with Copy Button */}
                    <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-500 shrink-0 font-bold">SHA-256:</span>
                        <span className="text-amber-300/90 truncate select-all">{lock.sha256Hash}</span>
                      </div>
                      <button
                        onClick={() => handleCopyHash(lock.sha256Hash)}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0"
                        title="Copy SHA-256 hash"
                      >
                        {copiedHash === lock.sha256Hash ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Covered Records: <strong className="text-slate-200">{lock.recordsCount} items</strong></span>
                      {lock.previousLockHash && (
                        <span className="text-slate-500 truncate max-w-xs">
                          Parent: {lock.previousLockHash.substring(0, 16)}...
                        </span>
                      )}
                      <span>Sealed: <time className="technical-metadata">{formatIST(lock.sealedAt)}</time></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FIN04: Immutable Case Revisions & Evolution History */}
          <div className="ui-card p-5 space-y-4 border border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="heading-card flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-400" />
                Immutable Case Revisions & Priority Evolution ({caseData.revisions?.length || 0})
              </h2>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                FIN04 Incremental Audit
              </span>
            </div>

            {(!caseData.revisions || caseData.revisions.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 text-center">
                Baseline case initialized. No incremental priority shifts recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {caseData.revisions.map((rev: any) => (
                  <div key={rev.id} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 font-mono">
                        Revision #{rev.revisionNumber}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="text-slate-400">{rev.previousPriority}</span>
                        <span className="text-slate-500">&rarr;</span>
                        <span className="px-1.5 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          {rev.newPriority}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-200 text-[11px]">{rev.reason}</p>
                    <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Trigger: <span className="technical-metadata">{rev.triggerEventId || 'Manual/Reconstruction'}</span></span>
                      <span>Revision Persisted: <time className="technical-metadata">{formatIST(rev.createdAt)}</time></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    <time className="text-[10px] font-mono technical-metadata text-slate-300">{formatIST(log.timestamp)}</time>
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

      {/* Tamper-Evident Manifest Export Modal */}
      {manifestModalData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-6 max-w-2xl w-full space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-amber-400" />
                <h2 className="heading-card text-amber-200">
                  Tamper-Evident Cryptographic Evidence Manifest
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {manifestModalData.lockId}
              </span>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400">Case Reference:</span>{' '}
                  <span className="text-slate-200 font-bold">{manifestModalData.caseCode}</span>
                </div>
                <div>
                  <span className="text-slate-400">Algorithm:</span>{' '}
                  <span className="text-emerald-400 font-bold">{manifestModalData.hashAlgorithm}</span>
                </div>
                <div>
                  <span className="text-slate-400">Sealed At:</span>{' '}
                  <span className="text-slate-200 font-bold">{formatIST(manifestModalData.sealedAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400">Investigator:</span>{' '}
                  <span className="text-slate-200">{manifestModalData.sealedBy?.actorName}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Canonical SHA-256 Hash:</span>
                  <div className="text-amber-300 break-all select-all font-bold pt-0.5">
                    {manifestModalData.canonicalHash}
                  </div>
                </div>
                {manifestModalData.previousLockHash && (
                  <div className="col-span-2 pt-1">
                    <span className="text-slate-500">Parent Lock Hash:</span>
                    <div className="text-slate-400 break-all select-all pt-0.5">
                      {manifestModalData.previousLockHash}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span>Covered Snapshot Record Manifest ({manifestModalData.recordManifest?.length || 0})</span>
                  <span className="text-[10px] text-slate-400 font-normal">Deterministic Canonical Sequence</span>
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {manifestModalData.recordManifest?.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[10px] flex items-center justify-between gap-2"
                    >
                      <span className="px-1.5 py-0.2 rounded font-bold bg-indigo-500/20 text-indigo-300">
                        {r.recordType}
                      </span>
                      <span className="text-slate-300 truncate flex-1">{r.summary}</span>
                      <span className="text-amber-300 shrink-0 font-semibold">{formatIST(r.timestamp)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded bg-amber-950/20 border border-amber-500/30 text-[10px] text-amber-300/90 leading-relaxed">
                <strong>Non-Repudiation Notice:</strong> {manifestModalData.securityDisclaimer}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(manifestModalData, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `trustline-evidence-manifest-${manifestModalData.lockId}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn btn-secondary text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" /> Download JSON Manifest
              </button>
              <button onClick={() => setManifestModalData(null)} className="btn btn-ghost text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
