'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  GitFork,
  FileCheck,
  CheckCircle2,
  Clock,
  Bot,
  ArrowLeft,
  PlusCircle,
  Copy,
  Check,
  User,
  Info,
  X,
  CreditCard,
  Building2,
  Users,
  Maximize2,
  RefreshCw,
  Sparkles,
  UserPlus,
  MessageSquare,
  Paperclip,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Activity,
  Dna,
  History,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { AlertDTO } from '@/lib/types';
import { formatIST } from '@/lib/date-utils';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAuth } from '@/context/AuthContext';
import { GlassMoneyFlowEdge } from '@/components/graph/GlassMoneyFlowEdge';

// Custom Subgraph Node Component
const CustomSubgraphNode = ({ data }: any) => {
  const isSuspicious = data.isSuspicious;

  return (
    <div
      className={`px-3.5 py-3 rounded-xl text-slate-100 shadow-[0_12px_34px_rgba(0,0,0,0.35)] transition-all border w-64 backdrop-blur-xl ${
        isSuspicious
          ? 'bg-rose-950/55 border-rose-300/70 shadow-rose-900/25 ring-1 ring-rose-300/20'
          : data.type === 'EMPLOYEE'
          ? 'bg-emerald-950/55 border-emerald-300/55'
          : data.type === 'CUSTOMER'
          ? 'bg-cyan-950/55 border-cyan-300/55'
          : 'bg-slate-950/60 border-white/15'
      }`}
      style={{ backdropFilter: 'blur(16px) saturate(145%)', WebkitBackdropFilter: 'blur(16px) saturate(145%)' }}
    >
      <Handle type="target" position={Position.Top} className="!bg-indigo-500 !w-2.5 !h-2.5" />
      
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5">
        <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
          {data.type}
        </span>
        {isSuspicious && (
          <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <ShieldAlert className="h-3 w-3" /> SUSPICIOUS
          </span>
        )}
      </div>

      <div className="font-bold text-xs text-white truncate">{data.label}</div>
      {data.subText && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{data.subText}</p>}

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-2.5 !h-2.5" />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomSubgraphNode,
};
const edgeTypes = { glassMoneyFlow: GlassMoneyFlowEdge };

export default function AlertInvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast, addAuditLog, user } = useAuth();

  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<any>(null);

  // Interactive Modals
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Form Inputs
  const [caseTitle, setCaseTitle] = useState('');
  const [assignedInvestigator, setAssignedInvestigator] = useState('Rajesh Sharma (Lead AML)');
  const [investigatorNote, setInvestigatorNote] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceType, setEvidenceType] = useState('WORKSTATION_LOG');

  // Copilot State
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotAnswer, setCopilotAnswer] = useState<any>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Action Recommendation state
  const [acceptedActions, setAcceptedActions] = useState<Record<string, boolean>>({});

  // Attack DNA State
  const [attackDna, setAttackDna] = useState<any>(null);
  const [attackDnaLoading, setAttackDnaLoading] = useState(false);
  const [attackDnaError, setAttackDnaError] = useState<string | null>(null);

  const handleReconstructAttack = async () => {
    setAttackDnaLoading(true);
    setAttackDnaError(null);
    try {
      const res = await fetch(`/api/alerts/${id}/reconstruct`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reconstruct incident');
      }
      setAttackDna(data);
      showToast('Attack DNA successfully reconstructed from verified evidence.');
      addAuditLog('ATTACK_DNA_RECONSTRUCTED', 'ALERT', alert?.alertCode || id, 'Reconstructed attack DNA timeline and money flow graph');
    } catch (err: any) {
      setAttackDnaError(err.message || 'Error reconstructing Attack DNA');
      showToast(err.message || 'Failed to reconstruct Attack DNA');
    } finally {
      setAttackDnaLoading(false);
    }
  };

  useEffect(() => {
    fetch(`/api/alerts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAlert(data);
        if (data) {
          setCaseTitle(`Case File for ${data.alertCode}: ${data.title}`);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setAlert(updated);
      addAuditLog('ALERT_STATUS_CHANGED', 'ALERT', alert.alertCode, `Status changed to ${newStatus}`);
      showToast(`Alert status updated to ${newStatus}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: caseTitle || `Case File for ${alert.alertCode}`,
          alertId: alert.id,
          severity: alert.severity,
          assignedInvestigator,
          summary: alert.summary,
        }),
      });
      const newCase = await res.json();
      addAuditLog('CASE_CREATED', 'CASE', newCase.caseCode, `Created case file for alert ${alert.alertCode}`);
      showToast(`Case File ${newCase.caseCode} created successfully.`);
      setShowCaseModal(false);
      router.push(`/cases/${newCase.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigatorNote.trim()) return;
    addAuditLog('INVESTIGATOR_NOTE_ADDED', 'ALERT', alert.alertCode, `Note: ${investigatorNote}`);
    showToast('Investigator note added to audit trail.');
    setInvestigatorNote('');
    setShowNoteModal(false);
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) return;
    addAuditLog('EVIDENCE_ATTACHED', 'ALERT', alert.alertCode, `Attached ${evidenceType}: ${evidenceTitle}`);
    showToast('Evidence item attached to investigation record.');
    setEvidenceTitle('');
    setShowEvidenceModal(false);
  };

  const handleCopyEntityCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast(`Copied entity code: ${code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskCopilot = async (q: string) => {
    if (!q.trim()) return;
    setCopilotQuery(q);
    setCopilotLoading(true);
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, alertId: alert.id }),
      });
      const data = await res.json();
      setCopilotAnswer(data);
      setCopilotLoading(false);
    } catch (e) {
      setCopilotLoading(false);
    }
  };

  const handleAcceptAction = (recId: string) => {
    setAcceptedActions((prev) => ({ ...prev, [recId]: true }));
    showToast('Action accepted and added to investigator audit trail.');
    addAuditLog('ACTION_ACCEPTED', 'RECOMMENDATION', recId, 'Accepted recommended investigative action');
  };

  if (loading || !alert) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 glass-panel rounded-2xl font-mono">
        Loading alert investigation workspace...
      </div>
    );
  }

  const primaryEntityName = alert.primaryEntityType === 'EMPLOYEE' ? 'Vikram Malhotra' : 'ACC-1004-INR';
  const primaryEntityCode = alert.primaryEntityType === 'EMPLOYEE' ? 'EMP-1001' : 'ACC-1004-INR';

  // React Flow Network Nodes & Edges
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'customNode',
      position: { x: 0, y: 180 },
      data: {
        label: 'Vikram Malhotra',
        subText: 'EMP-1001 • Senior RM',
        type: 'EMPLOYEE',
        isSuspicious: true,
      },
    },
    {
      id: '2',
      type: 'customNode',
      position: { x: 340, y: 10 },
      data: {
        label: 'Karan Enterprise Ltd',
        subText: 'ACC-1001-INR • Corporate',
        type: 'ACCOUNT',
        isSuspicious: true,
      },
    },
    {
      id: '3',
      type: 'customNode',
      position: { x: 680, y: 180 },
      data: {
        label: 'Zenith Global Holdings',
        subText: 'ACC-1002-INR • HNW Investment',
        type: 'ACCOUNT',
        isSuspicious: true,
      },
    },
    {
      id: '4',
      type: 'customNode',
      position: { x: 340, y: 360 },
      data: {
        label: 'Trident FinTech Consulting',
        subText: 'ACC-1006-INR • Beneficiary',
        type: 'ACCOUNT',
        isSuspicious: true,
      },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: 'e1',
      type: 'glassMoneyFlow',
      source: '1',
      target: '2',
      label: 'ACCESSED PROFILE (15:10)',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      labelStyle: { fill: '#6366f1', fontSize: 10, fontWeight: 700 },
    },
    {
      id: 'e2',
      type: 'glassMoneyFlow',
      source: '2',
      target: '3',
      label: 'TRANSFERRED ₹15.0L (15:17)',
      animated: true,
      style: { stroke: '#f43f5e', strokeWidth: 2.5 },
      labelStyle: { fill: '#f43f5e', fontSize: 10, fontWeight: 700 },
    },
    {
      id: 'e3',
      type: 'glassMoneyFlow',
      source: '3',
      target: '4',
      label: 'PASS-THROUGH ₹14.85L (15:20)',
      animated: true,
      style: { stroke: '#f43f5e', strokeWidth: 2.5 },
      labelStyle: { fill: '#f43f5e', fontSize: 10, fontWeight: 700 },
    },
    {
      id: 'e4',
      type: 'glassMoneyFlow',
      source: '4',
      target: '2',
      label: 'CIRCULAR RETURN ₹14.7L (15:23)',
      animated: true,
      style: { stroke: '#f43f5e', strokeWidth: 3 },
      labelStyle: { fill: '#f43f5e', fontSize: 10, fontWeight: 700 },
    },
  ];

  // Dynamic Flow Graph nodes & edges from Attack DNA if reconstructed
  const displayNodes: Node[] = attackDna?.graph?.nodes
    ? attackDna.graph.nodes.map((n: any, idx: number) => ({
        id: n.id,
        type: 'customNode',
        position: {
          x: (idx % 3) * 360 + (Math.floor(idx / 3) % 2) * 130,
          y: Math.floor(idx / 3) * 210 + (idx % 2) * 28,
        },
        data: {
          label: n.label,
          subText: n.details?.accountNumber || n.details?.role || n.details?.subText || `${n.type} Node`,
          type: n.type,
          isSuspicious: n.isSuspicious,
          isDirectEvidence: n.isDirectEvidence,
        },
      }))
    : initialNodes;

  const displayEdges: Edge[] = attackDna?.graph?.edges
    ? attackDna.graph.edges.map((e: any) => ({
        id: e.id,
        type: 'glassMoneyFlow',
        source: e.source,
        target: e.target,
        label: e.label + (e.amount ? ` ₹${(e.amount / 100000).toFixed(2)}L` : ''),
        data: {
          label: e.label,
          amount: e.amount,
          timestamp: e.timestamp,
          isSuspicious: e.isSuspicious,
          isDirectEvidence: e.isDirectEvidence,
          linkageStrength: e.linkageStrength,
        },
        animated: e.isSuspicious,
        style: {
          stroke: e.isSuspicious ? '#f43f5e' : e.isDirectEvidence ? '#6366f1' : '#f59e0b',
          strokeWidth: e.isSuspicious ? 2.5 : 1.5,
          strokeDasharray: e.isDirectEvidence ? undefined : '5,5',
        },
        labelStyle: {
          fill: e.isSuspicious ? '#f43f5e' : '#a5b4fc',
          fontSize: 9,
          fontWeight: 700,
        },
      }))
    : initialEdges;


  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link href="/alerts" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 mb-2 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Alerts Queue
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono technical-metadata text-xs text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded border border-rose-800/50">
              {alert.alertCode}
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-extrabold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30">
              {alert.severity} RISK
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-900 text-slate-300 border border-slate-800">
              Status: {alert.status}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">{alert.title}</h1>
        </div>

        {/* Action Button Hierarchy */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleReconstructAttack}
            disabled={attackDnaLoading}
            className="px-4 py-2 rounded-xl bg-[#83E0C9] hover:bg-[#9AE8D4] text-[#172321] font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {attackDnaLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Dna className="h-3.5 w-3.5 text-rose-200" />
            )}
            {attackDnaLoading ? 'Reconstructing Attack...' : 'Reconstruct Attack DNA'}
          </button>

          <button
            onClick={() => setShowCaseModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Create Case File
          </button>

          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" /> Add Note
          </button>

          <button
            onClick={() => setShowEvidenceModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Paperclip className="h-3.5 w-3.5 text-emerald-400" /> Attach Evidence
          </button>

          <div className="h-5 w-px bg-slate-800 my-auto"></div>

          <button onClick={() => handleUpdateStatus('IN_REVIEW')} className="px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-950/20 transition cursor-pointer">
            Mark In Review
          </button>
          <button onClick={() => handleUpdateStatus('ESCALATED')} className="px-3 py-2 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/40 transition cursor-pointer">
            Escalate
          </button>
          <button onClick={() => handleUpdateStatus('RESOLVED')} className="px-3 py-2 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/40 transition cursor-pointer">
            Resolve
          </button>
        </div>
      </div>

      {/* Top Banner: Risk Level, Confidence, Financial Exposure, Narrative */}
      <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/40">
              WHY FLAGGED NARRATIVE
            </span>
            <span className="text-sm text-slate-400">Confidence: {alert.confidence}</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {alert.riskExplanation}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-center min-w-[200px] shrink-0 shadow-lg">
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
            FINANCIAL EXPOSURE
          </span>
          <span className="metric-value text-rose-400 mt-0.5 block">
            ₹{(alert.financialExposure || 4455000).toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-500 mt-0.5 block">
            Primary: {primaryEntityCode}
          </span>
        </div>
      </div>

      {/* 3-Column Balanced Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Risk Summary & Contributing Signals (4 cols ~ 33%) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Explainable Risk Engine & Signals
              </h2>
            </div>

            <div className="space-y-2.5">
              {alert.signals?.map((sig: any) => (
                <div key={sig.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
                      <span className="text-emerald-400 font-bold">✓</span> {sig.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {sig.evidenceCategory}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{sig.description}</p>
                  
                  <div className="pt-1.5 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500 block">OBSERVED</span>
                      <span className="text-slate-200 font-semibold">{sig.observedValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">EXPECTED</span>
                      <span className="text-slate-400">{sig.expectedValue || 'Standard Baseline'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Money-Flow Subgraph Canvas (5 cols ~ 42%) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <GitFork className="h-4 w-4 text-indigo-400" />
                Money-Flow Subgraph Network
              </h2>
              <Link href="/graph" className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                <Maximize2 className="h-3 w-3" /> Full Network &rarr;
              </Link>
            </div>

            {/* React Flow Canvas */}
            <div className="h-[430px] w-full rounded-xl bg-slate-950/80 border border-white/10 shadow-inner overflow-hidden relative">
              <ReactFlow
                nodes={displayNodes}
                edges={displayEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodeClick={(_, node) => {
                  setSelectedEntity(node.data);
                  setSelectedRelationship(null);
                }}
                onEdgeClick={(_, edge) => {
                  setSelectedRelationship(edge);
                  setSelectedEntity(null);
                }}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="#1e293b" gap={16} size={1} />
                <Controls className="bg-slate-900 border border-slate-800 text-slate-100 fill-slate-100 rounded-lg p-1" />
              </ReactFlow>
            </div>

            {/* Selected Node Overlay */}
            {selectedEntity && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs space-y-1">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-indigo-300">{selectedEntity.label} ({selectedEntity.type})</span>
                  <button onClick={() => setSelectedEntity(null)} className="text-slate-500 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">{selectedEntity.subText}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Mandatory Evidence & Actions (3 cols ~ 25%) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-400" />
                Mandatory Evidence Trace
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">PRIMARY TARGET ENTITY</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">{primaryEntityName}</span>
                    <span className="text-[10px] font-mono text-indigo-300">{primaryEntityCode}</span>
                  </div>
                  <button
                    onClick={() => handleCopyEntityCode(primaryEntityCode)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block">DETECTION ENGINE</span>
                <span className="font-semibold text-slate-200 block">{alert.detectionMethod}</span>
              </div>
            </div>

            {/* Recommended Next Actions */}
            <div className="pt-2 space-y-2 border-t border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                RECOMMENDED ACTIONS
              </span>
              {alert.recommendations?.slice(0, 2).map((rec: any) => {
                const isDone = acceptedActions[rec.id];
                return (
                  <div key={rec.id} className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs space-y-2">
                    <p className="text-slate-200 text-[11px] font-medium">{rec.actionText}</p>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleAcceptAction(rec.id)}
                        disabled={isDone}
                        className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition ${
                          isDone ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        {isDone ? '✓ Accepted' : 'Accept Action'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Connected Anomalies Synthesis Panel (Requirement 5) */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-slate-900 to-slate-900 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-400" />
            Connected Risk Synthesis & Multi-Anomaly Correlation
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Composite threat evidence connecting workstation access, privilege modifications, and transaction velocity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-rose-500/30 space-y-1">
            <span className="text-[10px] font-bold text-rose-400 font-mono block uppercase">1. TRANSACTION ANOMALY</span>
            <p className="font-semibold text-slate-200">Rapid Circular Fund Routing</p>
            <p className="text-[11px] text-slate-400">₹15.0L transferred across 3 accounts returning 98% within 25 mins.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 font-mono block uppercase">2. ACCESS ANOMALY</span>
            <p className="font-semibold text-slate-200">Pre-Transaction Lookups</p>
            <p className="text-[11px] text-slate-400">Workstation EMP-1001 accessed customer profile 10 mins prior.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 font-mono block uppercase">3. PRIVILEGE MISMATCH</span>
            <p className="font-semibold text-slate-200">Beneficiary Record Override</p>
            <p className="text-[11px] text-slate-400">Altered destination beneficiary 5 mins before wire dispatch.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 font-mono block uppercase">4. TOPOLOGY LINK</span>
            <p className="font-semibold text-slate-200">3-Node Closed Loop</p>
            <p className="text-[11px] text-slate-400">Correlated relationship graph between ACC-1001, ACC-1002, & ACC-1006.</p>
          </div>
        </div>
      </div>

      {/* Attack DNA Reconstructed Crime-Chain Workspace (Feature 01) */}
      {attackDna && (
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/40 bg-gradient-to-br from-[#120a16] via-slate-950 to-slate-900 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-rose-500/20 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <Dna className="h-3 w-3 text-rose-400" /> ATTACK DNA RECONSTRUCTED
                </span>
                <span className="text-xs font-mono text-slate-400">Confidence: {attackDna.confidence}</span>
                {attackDna.casePriority && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    Active Priority: {attackDna.casePriority}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                Automatic Crime-Chain Reconstruction
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl mt-1 leading-relaxed">
                {attackDna.incidentSummary}
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">DIRECT EVIDENCE</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">
                  {attackDna.evidenceSummary.totalDirectRecords} records
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">INFERRED LINKS</span>
                <span className="text-base font-extrabold text-amber-400 font-mono">
                  {attackDna.evidenceSummary.inferredRelationships} links
                </span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">REVISIONS</span>
                <span className="text-base font-extrabold text-indigo-400 font-mono">
                  {attackDna.revisions.length} history
                </span>
              </div>
            </div>
          </div>

          {/* Timeline and Case Revisions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chronological Incident Timeline (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-rose-400" />
                  Chronological Evidence Timeline ({attackDna.timeline.length} Events)
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Sorted by Event Timestamp</span>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {attackDna.timeline.map((ev: any, idx: number) => (
                  <div
                    key={ev.id || idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {idx + 1}. {ev.eventType}
                        </span>
                        <span className="text-xs font-bold text-white">{ev.title}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${
                        ev.isDirectEvidence
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {ev.isDirectEvidence ? 'DIRECT DB RECORD' : 'INFERRED LINK'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300">{ev.description}</p>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] font-mono text-slate-400">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-slate-500">Record ID: </span>
                          <span className="text-indigo-300 font-bold">{ev.recordId}</span>
                        </div>
                        <div>
                          <span className="text-emerald-400 font-semibold">Event occurred: </span>
                          <time className="technical-metadata text-white font-medium">{formatIST(ev.timestamp)}</time>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                        <div>
                          <span className="text-slate-500">Ingestion/Arrival: </span>
                          <span className="text-slate-300">
                            {ev.metadata?.arrivalTimestamp
                              ? <time className="technical-metadata">{formatIST(ev.metadata.arrivalTimestamp)}</time>
                              : 'Recorded synchronously at occurrence'}
                          </span>
                        </div>
                        {ev.metadata?.isLateArrival && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold">
                            LATE-ARRIVING EVENT
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 italic bg-slate-900/60 p-1.5 rounded">
                      <span className="text-slate-500 font-semibold not-italic">Inclusion reason: </span>{ev.reasonIncluded}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Revisions & Contributing Signals (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-indigo-400" />
                  Case Revisions & Audit History
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">FIN04 Incremental Updates</span>
              </div>

              {attackDna.revisions.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                  <Layers className="h-6 w-6 text-slate-600 mx-auto" />
                  <p className="font-semibold text-slate-300">Baseline Case Established</p>
                  <p className="text-[11px] text-slate-500">
                    No incremental revisions yet. Ingest late-arriving events to trigger immutable investigation revisions.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {attackDna.revisions.map((rev: any) => (
                    <div
                      key={rev.id}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 font-mono text-[11px]">
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
                      <p className="text-[11px] text-slate-200">{rev.reason}</p>
                      <div className="pt-1.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-1">
                        <span>Revision Persisted: <time className="technical-metadata">{formatIST(rev.createdAt)}</time></span>
                        <span className="text-emerald-400 font-semibold">+{rev.addedEvidence?.length || 1} evidence item(s)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400" />
            Ask Investigation Copilot about {alert.alertCode}
          </h2>
          <span className="text-[10px] text-slate-500 font-mono">Grounded in Database Telemetry</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI Copilot to summarize evidence or explain anomaly..."
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskCopilot(copilotQuery)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          />
          <button
            onClick={() => handleAskCopilot(copilotQuery)}
            disabled={copilotLoading}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition shrink-0 cursor-pointer"
          >
            {copilotLoading ? 'Analyzing...' : 'Ask Copilot'}
          </button>
        </div>

        {copilotAnswer && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 mt-2">
            <span className="font-bold text-indigo-300 block flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" /> Copilot Synthesis:
            </span>
            <p className="text-slate-200 leading-relaxed">{copilotAnswer.answer}</p>
          </div>
        )}
      </div>

      {/* Case Creation Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5 shadow-2xl relative">
            <button onClick={() => setShowCaseModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-indigo-400" />
                Initiate Formal Case File
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Create formal case pre-filled with alert details & evidence
              </p>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">CASE TITLE</label>
                <input
                  type="text"
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">ASSIGNED INVESTIGATOR</label>
                <input
                  type="text"
                  value={assignedInvestigator}
                  onChange={(e) => setAssignedInvestigator(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCaseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold"
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
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5 shadow-2xl relative">
            <button onClick={() => setShowNoteModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                Add Investigator Note
              </h3>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">NOTE DETAILS</label>
                <textarea
                  rows={4}
                  value={investigatorNote}
                  onChange={(e) => setInvestigatorNote(e.target.value)}
                  placeholder="Enter observation notes, phone call logs, or verification details..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 resize-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-5 shadow-2xl relative">
            <button onClick={() => setShowEvidenceModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-emerald-400" />
                Attach Evidence Item
              </h3>
            </div>

            <form onSubmit={handleAddEvidence} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">EVIDENCE TITLE</label>
                <input
                  type="text"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g. Workstation Session IP Log & Audit Trail"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono text-[11px] mb-1">EVIDENCE CATEGORY</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="WORKSTATION_LOG">Workstation Audit Log</option>
                  <option value="TRANSACTION_PROOF">Transaction Wire Proof</option>
                  <option value="GRAPH_SUBGRAPH">Graph Subgraph Network Proof</option>
                  <option value="KYC_DOCUMENT">KYC Document Verification</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow"
                >
                  Attach Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
