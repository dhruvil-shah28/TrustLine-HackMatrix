'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  Node,
  Edge,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitFork,
  Search,
  ShieldAlert,
  X,
  User,
  Building2,
  CreditCard,
  ArrowRightLeft,
  Eye,
  Maximize2,
  RotateCcw,
  CheckCircle2,
  Info,
  Network,
  Filter,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { MoneyFlowNode, MoneyFlowEdge } from '@/lib/types';
import { DiscoveredRelationship, HiddenLinkHunterResult, EntityType } from '@/lib/hidden-link-hunter';
import { useAuth } from '@/context/AuthContext';
import { formatIST } from '@/lib/date-utils';

// ─── Design tokens ───────────────────────────────────────────────────
const T = {
  // surfaces
  nodeBg: '#FFFFFF',
  nodeSubBg: '#F0F4ED',
  suspBg: '#FBEDEC',
  hunterBg: '#314644',
  border: '#405652',
  greenBorder: 'rgba(114,202,160,0.45)',
  redBorder: '#E87575',
  purpleBorder: '#83E0C9',
  // text
  primary: '#F2F4EF',
  secondary: '#B7C6C0',
  muted: '#9BAEA7',
  // accents
  gold: '#83E0C9',
  green: '#72CAA0',
  red: '#FF8585',
  purple: '#203234',
  cyan: '#78C8D4',
  // divider
  divider: '#405652',
};

// ─── Custom Node Component ────────────────────────────────────────────
const CustomGraphNode = ({ data, selected }: any) => {
  const isSuspicious = data.isSuspicious;
  const isDimmed = data.isDimmed;
  const nodeType = data.type;

  // Derive surface / border
  let bg = T.nodeBg;
  let border = '#D7E2DA';
  if (isDimmed) {
    bg = '#F7F5EE';
    border = '#D7E2DA';
  } else if (isSuspicious) {
    bg = T.suspBg;
    border = T.redBorder;
  } else if (nodeType === 'ACCOUNT') {
    bg = T.nodeSubBg;
    border = T.greenBorder;
  } else if (nodeType === 'ALERT') {
    bg = T.suspBg;
    border = T.redBorder;
  }
  if (selected) {
    bg = '#D9F1E8';
    border = '#203234';
  }

  // Type badge colors
  const typeBadge: Record<string, { icon: any; clr: string }> = {
    EMPLOYEE: { icon: User, clr: T.gold },
    CUSTOMER: { icon: Building2, clr: T.secondary },
    ACCOUNT: { icon: CreditCard, clr: T.green },
    ALERT: { icon: ShieldAlert, clr: T.red },
    TRANSACTION: { icon: ArrowRightLeft, clr: T.cyan },
  };
  const badge = typeBadge[nodeType] || { icon: Info, clr: T.muted };
  const BadgeIcon = badge.icon;
  const dividerColor = isSuspicious ? 'rgba(224,82,82,0.2)' : '#D7E2DA';

  return (
    <div
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 12,
        padding: '12px 14px',
        width: 250,
        boxShadow: isSuspicious
          ? '0 2px 8px rgba(232,117,117,0.16)'
          : '0 2px 8px rgba(10,28,28,0.18)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        color: '#000000',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: T.gold, width: 8, height: 8, border: '2px solid #FFFFFF' }}
      />

      {/* Header badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 8,
          marginBottom: 8,
          borderBottom: `1px solid ${dividerColor}`,
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#000000',
            fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
            background: '#FFFFFF',
            border: `1px solid ${dividerColor}`,
            borderRadius: 5,
            padding: '2px 6px',
          }}
        >
          <BadgeIcon style={{ width: 10, height: 10 }} />
          {nodeType}
        </span>

        {isSuspicious && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.05em',
              background: '#FBEDEC',
              color: '#000000',
              border: '1px solid rgba(224,82,82,0.45)',
              borderRadius: 5,
              padding: '2px 6px',
            }}
          >
            <ShieldAlert style={{ width: 10, height: 10 }} />
            SUSPICIOUS
          </span>
        )}
      </div>

      {/* Primary label */}
      <div
        className={nodeType === 'ACCOUNT' ? 'technical-metadata' : undefined}
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#000000',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.3,
        }}
      >
        {data.label}
      </div>

      {/* Sub-text */}
      {data.details?.subText && (
        <p
          className={nodeType === 'ACCOUNT' ? 'technical-metadata' : undefined}
          style={{
            fontSize: 10,
            color: '#000000',
            marginTop: 3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {data.details.subText}
        </p>
      )}

      {/* Risk score footer */}
      {data.details?.riskScore !== undefined && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 6,
            borderTop: `1px solid ${dividerColor}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 10,
          }}
        >
          <span style={{ color: '#000000' }}>Internal Risk:</span>
          <span
            style={{
              fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
              fontWeight: 700,
              color: '#000000',
            }}
          >
            {data.details.riskScore} / 100
          </span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: T.gold, width: 8, height: 8, border: '2px solid #FFFFFF' }}
      />
    </div>
  );
};

const nodeTypes = { customNode: CustomGraphNode };

// ─── Main Canvas Component ────────────────────────────────────────────
function MoneyFlowGraphCanvas() {
  const { showToast } = useAuth();
  const reactFlowInstance = useReactFlow();
  const searchParams = useSearchParams();

  // Mode: standard money flow vs hidden link hunter
  const initialMode = searchParams.get('mode') === 'hunter' ? 'HUNTER' : 'STANDARD';
  const [activeTab, setActiveTab] = useState<'STANDARD' | 'HUNTER'>(initialMode);

  // Standard Money Flow data
  const [rawNodes, setRawNodes] = useState<MoneyFlowNode[]>([]);
  const [rawEdges, setRawEdges] = useState<MoneyFlowEdge[]>([]);
  const [loading, setLoading] = useState(true);

  // Hidden Link Hunter data
  const [hunterResult, setHunterResult] = useState<HiddenLinkHunterResult | null>(null);
  const [hunterLoading, setHunterLoading] = useState(false);
  const [selectedDiscovery, setSelectedDiscovery] = useState<DiscoveredRelationship | null>(null);

  // Hunter filters
  const [filterEntityType, setFilterEntityType] = useState('ALL');
  const [filterRelType, setFilterRelType] = useState('ALL');
  const [filterMinStrength, setFilterMinStrength] = useState(0);
  const [filterAssociatedOnly, setFilterAssociatedOnly] = useState(false);

  // Selection states
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);

  // Search & view filter
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState(false);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // 1. Fetch Standard Graph Data
  const fetchStandardGraph = useCallback(() => {
    setLoading(true);
    fetch('/api/graph')
      .then((res) => res.json())
      .then((data) => {
        setRawNodes(data.nodes || []);
        setRawEdges(data.edges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 2. Fetch Hidden Link Hunter Data
  const fetchHunterData = useCallback(() => {
    setHunterLoading(true);
    const params = new URLSearchParams();
    if (filterEntityType !== 'ALL') params.set('entityType', filterEntityType);
    if (filterRelType !== 'ALL') params.set('relationshipType', filterRelType);
    if (filterMinStrength > 0) params.set('minStrength', String(filterMinStrength));
    if (filterAssociatedOnly) params.set('associatedOnly', 'true');
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    fetch(`/api/hidden-link-hunter?${params.toString()}`)
      .then((res) => res.json())
      .then((data: HiddenLinkHunterResult) => {
        setHunterResult(data);
        if (data.discoveries && data.discoveries.length > 0 && !selectedDiscovery) {
          setSelectedDiscovery(data.discoveries[0]);
        }
        setHunterLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setHunterLoading(false);
      });
  }, [filterEntityType, filterRelType, filterMinStrength, filterAssociatedOnly, searchQuery, selectedDiscovery]);

  useEffect(() => {
    fetchStandardGraph();
    fetchHunterData();
  }, [fetchStandardGraph, fetchHunterData]);

  // Synchronize Tab changes with URL query parameter
  const handleTabChange = (mode: 'STANDARD' | 'HUNTER') => {
    setActiveTab(mode);
    setSelectedNode(null);
    setSelectedEdge(null);
    const url = new URL(window.location.href);
    if (mode === 'HUNTER') url.searchParams.set('mode', 'hunter');
    else url.searchParams.delete('mode');
    window.history.replaceState({}, '', url.toString());

    setTimeout(() => {
      reactFlowInstance?.fitView({ padding: 0.15, duration: 600 });
    }, 100);
  };

  // Re-render nodes & edges based on active tab
  useEffect(() => {
    if (activeTab === 'STANDARD') {
      if (rawNodes.length === 0) return;

      let filteredRawNodes = rawNodes;
      let filteredRawEdges = rawEdges;

      const nodeIds = new Set(filteredRawNodes.map((n) => n.id));
      filteredRawEdges = filteredRawEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

      const employees = filteredRawNodes.filter((n) => n.type === 'EMPLOYEE');
      const customers = filteredRawNodes.filter((n) => n.type === 'CUSTOMER');
      const accounts = filteredRawNodes.filter((n) => n.type === 'ACCOUNT');

      const formattedNodes: Node[] = [];

      employees.forEach((emp, i) => {
        const isDimmed = filterSuspiciousOnly && !emp.isSuspicious;
        formattedNodes.push({
          id: emp.id,
          type: 'customNode',
          position: { x: i * 300 + 40, y: 40 },
          data: {
            label: emp.label,
            type: emp.type,
            details: emp.details,
            isSuspicious: emp.isSuspicious,
            isDimmed,
            rawNode: emp,
          },
        });
      });

      customers.forEach((cust, i) => {
        const isDimmed = filterSuspiciousOnly && !cust.isSuspicious;
        formattedNodes.push({
          id: cust.id,
          type: 'customNode',
          position: { x: i * 300 + 40, y: 240 },
          data: {
            label: cust.label,
            type: cust.type,
            details: cust.details,
            isSuspicious: cust.isSuspicious,
            isDimmed,
            rawNode: cust,
          },
        });
      });

      accounts.forEach((acc, i) => {
        const isDimmed = filterSuspiciousOnly && !acc.isSuspicious;
        formattedNodes.push({
          id: acc.id,
          type: 'customNode',
          position: { x: i * 280 + 40, y: 450 },
          data: {
            label: acc.label,
            type: acc.type,
            details: acc.details,
            isSuspicious: acc.isSuspicious,
            isDimmed,
            rawNode: acc,
          },
        });
      });

      const formattedEdges: Edge[] = filteredRawEdges.map((e) => {
        const isSusp = e.isSuspicious;
        const strokeColor = isSusp ? T.redBorder : e.label === 'OWNS' ? T.gold : 'rgba(184,181,174,0.35)';
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label + (e.amount ? ` (₹${(e.amount / 100000).toFixed(1)}L)` : ''),
          animated: isSusp,
          style: { stroke: strokeColor, strokeWidth: isSusp ? 2.5 : 1.5 },
          labelStyle: { fill: strokeColor, fontWeight: isSusp ? 700 : 500, fontSize: 10 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 14,
            height: 14,
          },
          data: e as unknown as Record<string, any>,
        };
      });

      setNodes(formattedNodes);
      setEdges(formattedEdges);
    } else {
      // HUNTER TAB: Render Hidden Link Network
      if (!hunterResult) return;

      const formattedNodes: Node[] = hunterResult.graph.nodes.map((n, idx) => {
        const isDimmed = filterSuspiciousOnly && !n.isSuspicious;
        return {
          id: n.id,
          type: 'customNode',
          position: {
            x: (idx % 4) * 300 + 40,
            y: Math.floor(idx / 4) * 180 + 60,
          },
          data: {
            label: n.label,
            type: n.type,
            details: n.details,
            isSuspicious: n.isSuspicious,
            isDimmed,
            rawNode: n,
          },
        };
      });

      const formattedEdges: Edge[] = hunterResult.graph.edges.map((e) => {
        const isSusp = e.isSuspicious;
        const strokeColor = isSusp
          ? T.redBorder
          : e.isDirectEvidence
          ? T.cyan
          : T.purple;

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          label: `${e.label} (${e.linkageStrength}%)`,
          animated: isSusp,
          style: {
            stroke: strokeColor,
            strokeWidth: isSusp ? 2.5 : 1.8,
            strokeDasharray: e.isDirectEvidence ? undefined : '5,5',
          },
          labelStyle: { fill: strokeColor, fontWeight: 700, fontSize: 9 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 14,
            height: 14,
          },
          data: e as unknown as Record<string, any>,
        };
      });

      setNodes(formattedNodes);
      setEdges(formattedEdges);
    }
  }, [activeTab, rawNodes, rawEdges, hunterResult, filterSuspiciousOnly, setNodes, setEdges]);

  // Node & Edge interaction
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node.data?.rawNode || node.data);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge.data || edge);
    setSelectedNode(null);
  }, []);

  // Search Results
  const matchingSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    if (activeTab === 'STANDARD') {
      return rawNodes.filter(
        (n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
      );
    } else {
      return (
        hunterResult?.graph.nodes.filter(
          (n) => n.label.toLowerCase().includes(q) || n.id.toLowerCase().includes(q)
        ) || []
      );
    }
  }, [searchQuery, rawNodes, hunterResult, activeTab]);

  const handleSelectSearchResult = (n: any) => {
    setSelectedNode(n);
    setShowSearchDropdown(false);
    showToast(`Focused node: ${n.label}`);
    reactFlowInstance?.fitView({ nodes: [{ id: n.id }], duration: 600, padding: 0.5 });
  };

  const sidebarBase: React.CSSProperties = {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 320,
    background: 'var(--bg-card)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${T.border}`,
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 8px 32px rgba(0,0,0,0.65)',
    zIndex: 40,
    maxHeight: 'calc(100% - 32px)',
    overflowY: 'auto',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header & Mode Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          borderBottom: `1px solid ${T.divider}`,
          paddingBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="heading-page" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {activeTab === 'HUNTER' ? (
                <Network style={{ width: 20, height: 20, color: T.gold }} />
              ) : (
                <GitFork style={{ width: 20, height: 20, color: T.gold }} />
              )}
              {activeTab === 'HUNTER' ? 'Hidden Link Hunter' : 'Money-Flow Network'}
            </h1>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 6,
                background: activeTab === 'HUNTER' ? 'rgba(232,198,106,0.15)' : 'rgba(255,255,255,0.06)',
                color: activeTab === 'HUNTER' ? T.gold : T.secondary,
                border: `1px solid ${activeTab === 'HUNTER' ? 'rgba(232,198,106,0.3)' : T.border}`,
              }}
            >
              {activeTab === 'HUNTER' ? 'FEATURE 02: CROSS-ENTITY DISCOVERY' : 'BASE TOPOLOGY'}
            </span>
          </div>
          <p style={{ fontSize: 12, color: T.secondary, marginTop: 4 }}>
            {activeTab === 'HUNTER'
              ? 'Detects overlooked financial pathways, cross-employee access overlaps, temporal execution, and multi-hop loops across investigations.'
              : 'Interactive financial money routing network between employees, customers, accounts, and detected anomalies.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-card)',
              padding: 3,
              borderRadius: 10,
              border: `1px solid ${T.border}`,
            }}
          >
            <button
              onClick={() => handleTabChange('STANDARD')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'STANDARD' ? '#292929' : 'transparent',
                color: activeTab === 'STANDARD' ? T.primary : T.muted,
                transition: 'all 0.15s ease',
              }}
            >
              <GitFork style={{ width: 14, height: 14 }} />
              Money Flow
            </button>

            <button
              onClick={() => handleTabChange('HUNTER')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'HUNTER' ? 'rgba(232,198,106,0.18)' : 'transparent',
                color: activeTab === 'HUNTER' ? T.gold : T.muted,
                transition: 'all 0.15s ease',
              }}
            >
              <Network style={{ width: 14, height: 14 }} />
              Hidden Link Hunter
            </button>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              if (activeTab === 'HUNTER') fetchHunterData();
              else fetchStandardGraph();
              showToast('Graph intelligence refreshed');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'var(--bg-panel)',
              border: `1px solid ${T.border}`,
              color: T.secondary,
              cursor: 'pointer',
            }}
            title="Refresh Intelligence Data"
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* ─── HIDDEN LINK HUNTER OVERVIEW BANNER (Feature 02) ─────────── */}
      {activeTab === 'HUNTER' && hunterResult && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 12,
            padding: 16,
            background: 'linear-gradient(135deg, rgba(27,27,27,0.95), rgba(20,20,20,0.95))',
            border: `1px solid rgba(232,198,106,0.25)`,
            borderRadius: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <div>
            <span style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>
              Candidate Relationships
            </span>
            <div className="metric-value" style={{ fontSize: 22, fontWeight: 800, color: T.gold, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', marginTop: 2 }}>
              {hunterResult.overview.totalCandidateRelationships}
            </div>
            <span style={{ fontSize: 10, color: T.secondary }}>Across all accounts & actors</span>
          </div>

          <div>
            <span style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>
              Connected Entities
            </span>
            <div className="metric-value" style={{ fontSize: 22, fontWeight: 800, color: T.primary, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', marginTop: 2 }}>
              {hunterResult.overview.totalConnectedEntities}
            </div>
            <span style={{ fontSize: 10, color: T.secondary }}>Employees, customers, accounts</span>
          </div>

          <div>
            <span style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>
              Multi-Hop Conduits
            </span>
            <div className="metric-value" style={{ fontSize: 22, fontWeight: 800, color: T.cyan, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', marginTop: 2 }}>
              {hunterResult.overview.meaningfulMultiHopConnections}
            </div>
            <span style={{ fontSize: 10, color: T.secondary }}>Intermediate pass-throughs</span>
          </div>

          <div>
            <span style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>
              High-Strength Links (≥75%)
            </span>
            <div className="metric-value" style={{ fontSize: 22, fontWeight: 800, color: T.red, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', marginTop: 2 }}>
              {hunterResult.overview.highStrengthCount}
            </div>
            <span style={{ fontSize: 10, color: T.secondary }}>Strong temporal/flow linkage</span>
          </div>

          <div>
            <span style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>
              Linked Alerts & Cases
            </span>
            <div className="metric-value" style={{ fontSize: 22, fontWeight: 800, color: T.green, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', marginTop: 2 }}>
              {hunterResult.overview.totalLinkedAlertsAndCases}
            </div>
            <span style={{ fontSize: 10, color: T.secondary }}>Connected investigations</span>
          </div>
        </div>
      )}

      {/* ─── FILTERS & SEARCH TOOLBAR ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-panel)',
                border: `1px solid rgba(255,255,255,0.10)`,
                borderRadius: 8,
                padding: '7px 12px',
                width: 220,
              }}
            >
              <Search style={{ width: 13, height: 13, color: T.muted, flexShrink: 0 }} />
              <input
                type="text"
                placeholder={activeTab === 'HUNTER' ? 'Search discoveries/entity...' : 'Search node name/ID...'}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 12,
                  color: T.primary,
                  width: '100%',
                }}
              />
            </div>

            {showSearchDropdown && matchingSearchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 38,
                  width: 260,
                  background: 'var(--bg-panel)',
                  border: `1px solid rgba(255,255,255,0.09)`,
                  borderRadius: 12,
                  padding: 8,
                  zIndex: 50,
                  maxHeight: 240,
                  overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                }}
              >
                {matchingSearchResults.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleSelectSearchResult(n)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      display: 'block',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.primary }}>{n.label}</span>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', color: T.gold }}>{n.type}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hunter-Specific Filtering Controls */}
          {activeTab === 'HUNTER' && (
            <>
              {/* Entity Type Filter */}
              <select
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
                style={{
                  background: 'var(--bg-panel)',
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: '7px 10px',
                  fontSize: 12,
                  color: T.primary,
                  outline: 'none',
                }}
              >
                <option value="ALL">All Entity Types</option>
                <option value="EMPLOYEE">Employees Only</option>
                <option value="ACCOUNT">Accounts Only</option>
                <option value="CUSTOMER">Customers Only</option>
                <option value="ALERT">Alerts Only</option>
              </select>

              {/* Relationship Type Filter */}
              <select
                value={filterRelType}
                onChange={(e) => setFilterRelType(e.target.value)}
                style={{
                  background: 'var(--bg-panel)',
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: '7px 10px',
                  fontSize: 12,
                  color: T.primary,
                  outline: 'none',
                }}
              >
                <option value="ALL">All Relationship Types</option>
                <option value="MULTI_HOP_FLOW">Multi-Hop Transfers</option>
                <option value="CROSS_EMPLOYEE_ACCESS">Cross-Employee Access</option>
                <option value="TEMPORAL_PRE_TRANSACTION_ACTION">Temporal Actions</option>
                <option value="CROSS_INVESTIGATION_LINK">Cross-Investigation Links</option>
                <option value="LEGITIMATE_COMMERCIAL_LINK">Legitimate Baseline (Control)</option>
              </select>

              {/* Min Linkage Strength */}
              <select
                value={filterMinStrength}
                onChange={(e) => setFilterMinStrength(Number(e.target.value))}
                style={{
                  background: 'var(--bg-panel)',
                  border: `1px solid ${T.border}`,
                  borderRadius: 8,
                  padding: '7px 10px',
                  fontSize: 12,
                  color: T.primary,
                  outline: 'none',
                }}
              >
                <option value={0}>Any Strength (0%+)</option>
                <option value={50}>Moderate (50%+)</option>
                <option value={75}>High Strength (75%+)</option>
              </select>

              {/* Associated with alert/case only toggle */}
              <button
                onClick={() => setFilterAssociatedOnly(!filterAssociatedOnly)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: `1px solid ${filterAssociatedOnly ? 'rgba(232,198,106,0.5)' : T.border}`,
                  background: filterAssociatedOnly ? 'rgba(232,198,106,0.15)' : '#242424',
                  color: filterAssociatedOnly ? T.gold : T.secondary,
                }}
              >
                <Layers style={{ width: 13, height: 13 }} />
                Active Alerts/Cases Only
              </button>
            </>
          )}
        </div>

        {/* Suspicious Topology Highlight Toggle */}
        <button
          onClick={() => {
            setFilterSuspiciousOnly(!filterSuspiciousOnly);
            showToast(!filterSuspiciousOnly ? 'Highlighting Suspicious Paths' : 'Showing All Discovered Links');
            if (reactFlowInstance) setTimeout(() => reactFlowInstance.fitView({ padding: 0.15, duration: 600 }), 100);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            border: '1px solid',
            background: filterSuspiciousOnly ? 'rgba(224,82,82,0.12)' : '#242424',
            color: filterSuspiciousOnly ? T.red : T.secondary,
            borderColor: filterSuspiciousOnly ? 'rgba(224,82,82,0.45)' : 'rgba(255,255,255,0.10)',
          }}
        >
          <ShieldAlert style={{ width: 14, height: 14 }} />
          {filterSuspiciousOnly ? 'Suspicious Path Active' : 'Highlight Suspicious'}
        </button>
      </div>

      {/* ─── GRAPH CANVAS CONTAINER ───────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: activeTab === 'HUNTER' ? 580 : 700,
          background: 'var(--bg-page)',
          borderRadius: 16,
          border: `1px solid rgba(255,255,255,0.08)`,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        }}
      >
        {loading || hunterLoading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
              color: T.muted,
              gap: 8,
            }}
          >
            <RefreshCw className="animate-spin" style={{ width: 20, height: 20, color: T.gold }} />
            <span>Discovering relationship topologies from PostgreSQL telemetry...</span>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
          >
            {/* Subtle dot grid */}
            <Background color="rgba(255,255,255,0.04)" gap={24} size={1} />

            {/* Light controls remain distinct from the dark canvas. */}
            <Controls
              style={{
                background: '#FFFFFF',
                border: '1px solid #D7E2DA',
                borderRadius: 10,
                padding: 4,
              }}
            />

            {/* Legend */}
            <Panel position="top-left">
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid rgba(255,255,255,0.09)`,
                  borderRadius: 12,
                  padding: '12px 14px',
                  fontSize: 11,
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  minWidth: 192,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: T.primary,
                    display: 'block',
                    paddingBottom: 8,
                    marginBottom: 8,
                    borderBottom: `1px solid rgba(255,255,255,0.08)`,
                  }}
                >
                  {activeTab === 'HUNTER' ? 'Discovery Legend' : 'Network Legend'}
                </span>
                {[
                  { clr: T.redBorder, lbl: 'Suspicious / Flagged' },
                  { clr: T.purple, lbl: 'Inferred Multi-Hop Link' },
                  { clr: T.cyan, lbl: 'Direct DB Evidence Bridge' },
                  { clr: T.gold, lbl: 'Ownership / Privilege' },
                ].map(({ clr, lbl }) => (
                  <div
                    key={lbl}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: T.secondary,
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: clr,
                        flexShrink: 0,
                      }}
                    />
                    {lbl}
                  </div>
                ))}
              </div>
            </Panel>

            {/* Fit / Reset Buttons */}
            <Panel position="top-right">
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  {
                    lbl: 'Fit View',
                    icon: Maximize2,
                    action: () => reactFlowInstance?.fitView({ padding: 0.15, duration: 500 }),
                  },
                  {
                    lbl: 'Reset',
                    icon: RotateCcw,
                    action: () => reactFlowInstance?.zoomTo(1, { duration: 500 }),
                  },
                ].map(({ lbl, icon: Icon, action }) => (
                  <button
                    key={lbl}
                    onClick={action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'var(--bg-panel)',
                      color: T.secondary,
                      border: `1px solid rgba(255,255,255,0.10)`,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon style={{ width: 13, height: 13 }} /> {lbl}
                  </button>
                ))}
              </div>
            </Panel>
          </ReactFlow>
        )}

        {/* ─── NODE DETAIL SIDEBAR ───────────────────────────────────── */}
        {selectedNode && (
          <div style={sidebarBase}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 10,
                marginBottom: 10,
                borderBottom: `1px solid ${T.divider}`,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.gold,
                  fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                  letterSpacing: '0.08em',
                }}
              >
                {selectedNode.type} DETAILS
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.secondary }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{selectedNode.label}</h3>
            <p style={{ fontSize: 11, color: T.secondary, marginTop: 2 }}>{selectedNode.details?.subText}</p>

            {selectedNode.isSuspicious && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(224,82,82,0.08)',
                  border: '1px solid rgba(224,82,82,0.3)',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.red,
                  }}
                >
                  <ShieldAlert style={{ width: 13, height: 13 }} />
                  Suspicious Relationship Node
                </span>
                <p style={{ fontSize: 10, color: '#D8B4B4', marginTop: 4, lineHeight: 1.5 }}>
                  Participates in suspicious cross-entity multi-hop path or pre-transfer access event.
                </p>
              </div>
            )}

            <div style={{ marginTop: 12, fontSize: 11, color: T.secondary }}>
              {[
                { lbl: 'Node ID', val: selectedNode.id, clr: T.primary },
                { lbl: 'Role', val: selectedNode.details?.role, clr: T.primary },
                { lbl: 'Privilege', val: selectedNode.details?.privilege, clr: '#D4A844' },
                {
                  lbl: 'Risk Score',
                  val:
                    selectedNode.details?.riskScore !== undefined
                      ? `${selectedNode.details.riskScore} / 100`
                      : undefined,
                  clr: (selectedNode.details?.riskScore ?? 0) > 65 ? T.red : T.green,
                },
                {
                  lbl: 'Balance',
                  val:
                    selectedNode.details?.balance !== undefined
                      ? `₹${(selectedNode.details.balance / 100000).toFixed(2)}L`
                      : undefined,
                  clr: T.green,
                },
              ]
                .filter((r) => r.val !== undefined)
                .map(({ lbl, val, clr }) => (
                  <div
                    key={lbl}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: `1px solid ${T.divider}`,
                    }}
                  >
                    <span style={{ color: T.muted }}>{lbl}:</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: clr,
                        fontFamily: lbl === 'Risk Score' || lbl === 'Balance' || lbl === 'Node ID' ? 'monospace' : undefined,
                      }}
                    >
                      {val as string}
                    </span>
                  </div>
                ))}
            </div>

            {/* Entity Navigation Button */}
            {selectedNode.type === 'EMPLOYEE' && (
              <Link
                href={`/employees/${selectedNode.id.replace('EMP-', '')}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  marginTop: 14,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(232,198,106,0.12)',
                  color: T.gold,
                  border: '1px solid rgba(232,198,106,0.3)',
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                View Employee Profile <ExternalLink style={{ width: 12, height: 12 }} />
              </Link>
            )}
          </div>
        )}

        {/* ─── EDGE DETAIL SIDEBAR ───────────────────────────────────── */}
        {selectedEdge && (
          <div style={{ ...sidebarBase, borderColor: 'rgba(232,198,106,0.35)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 10,
                marginBottom: 10,
                borderBottom: `1px solid ${T.divider}`,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.gold,
                  fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                  letterSpacing: '0.08em',
                }}
              >
                RELATIONSHIP EDGE
              </span>
              <button
                onClick={() => setSelectedEdge(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.secondary }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{selectedEdge.label}</h3>
            <p style={{ fontSize: 10, color: T.muted, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', marginTop: 2 }}>
              Edge ID: {selectedEdge.id}
            </p>

            <div style={{ marginTop: 12, fontSize: 11 }}>
              {[
                { lbl: 'Source Entity', val: selectedEdge.source, clr: T.primary },
                { lbl: 'Target Entity', val: selectedEdge.target, clr: T.primary },
                ...(selectedEdge.amount
                  ? [{ lbl: 'Transferred Amount', val: `₹${(selectedEdge.amount / 100000).toFixed(2)} Lakhs`, clr: T.red }]
                  : []),
                ...(selectedEdge.linkageStrength !== undefined
                  ? [{ lbl: 'Linkage Strength', val: `${selectedEdge.linkageStrength}%`, clr: T.gold }]
                  : []),
              ].map(({ lbl, val, clr }) => (
                <div
                  key={lbl}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: `1px solid ${T.divider}`,
                  }}
                >
                  <span style={{ color: T.muted }}>{lbl}:</span>
                  <span style={{ fontWeight: 600, color: clr, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── HIDDEN LINK HUNTER: RANKED DISCOVERIES & EVIDENCE INSPECTOR ─ */}
      {activeTab === 'HUNTER' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20 }}>
          {/* Left Column: Ranked Discoveries List (7 cols) */}
          <div style={{ gridColumn: 'span 7' }}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${T.divider}`,
                  paddingBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles style={{ width: 16, height: 16, color: T.gold }} />
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>
                    Ranked Relationship Discoveries ({hunterResult?.discoveries.length || 0})
                  </h2>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', color: T.muted }}>
                  Sorted by Linkage Strength
                </span>
              </div>

              {(!hunterResult?.discoveries || hunterResult.discoveries.length === 0) ? (
                <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontSize: 12 }}>
                  No candidate relationships match current filters.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 600, overflowY: 'auto' }}>
                  {hunterResult.discoveries.map((disc, idx) => {
                    const isSelected = selectedDiscovery?.id === disc.id;
                    return (
                      <div
                        key={disc.id}
                        onClick={() => setSelectedDiscovery(disc)}
                        style={{
                          padding: 14,
                          borderRadius: 10,
                          background: isSelected ? '#252525' : '#1F1F1F',
                          border: `1.5px solid ${isSelected ? T.gold : disc.isSuspicious ? 'rgba(224,82,82,0.3)' : T.border}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: 'var(--bg-page)',
                                color: T.gold,
                              }}
                            >
                              #{idx + 1}
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{disc.title}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background:
                                  disc.linkageStrength >= 75
                                    ? 'rgba(224,82,82,0.15)'
                                    : disc.linkageStrength >= 50
                                    ? 'rgba(232,198,106,0.15)'
                                    : 'rgba(76,175,130,0.15)',
                                color:
                                  disc.linkageStrength >= 75
                                    ? T.red
                                    : disc.linkageStrength >= 50
                                    ? T.gold
                                    : T.green,
                                border: `1px solid ${
                                  disc.linkageStrength >= 75
                                    ? 'rgba(224,82,82,0.3)'
                                    : disc.linkageStrength >= 50
                                    ? 'rgba(232,198,106,0.3)'
                                    : 'rgba(76,175,130,0.3)'
                                }`,
                              }}
                            >
                              {disc.linkageStrength}% Strength
                            </span>
                            <ChevronRight style={{ width: 14, height: 14, color: isSelected ? T.gold : T.muted }} />
                          </div>
                        </div>

                        <p style={{ fontSize: 11, color: T.secondary, lineHeight: 1.45 }}>{disc.explanation}</p>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            paddingTop: 6,
                            borderTop: `1px solid ${T.divider}`,
                            fontSize: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                color: disc.isDirectEvidence ? T.cyan : T.purple,
                                fontWeight: 700,
                                fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                              }}
                            >
                              {disc.isDirectEvidence ? 'DIRECT DB EVIDENCE' : 'ALGORITHMIC INFERRED'}
                            </span>
                            <span style={{ color: T.muted }}>•</span>
                            <span style={{ color: T.secondary }}>{disc.supportingRecords.length} record(s)</span>
                          </div>

                          {disc.associatedAlertCodes.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ color: T.muted }}>Alert:</span>
                              {disc.associatedAlertCodes.map((c) => (
                                <span
                                  key={c}
                                  style={{
                                    fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                                    color: T.red,
                                    background: 'rgba(224,82,82,0.1)',
                                    padding: '1px 5px',
                                    borderRadius: 4,
                                  }}
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Evidence Inspector (5 cols) */}
          <div style={{ gridColumn: 'span 5' }}>
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                position: 'sticky',
                top: 80,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${T.divider}`,
                  paddingBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers style={{ width: 16, height: 16, color: T.gold }} />
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>Evidence &amp; Path Inspector</h2>
                </div>
                {selectedDiscovery && (
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                      fontWeight: 700,
                      color: selectedDiscovery.isSuspicious ? T.red : T.green,
                    }}
                  >
                    {selectedDiscovery.isSuspicious ? 'SUSPICIOUS PATTERN' : 'BENIGN / CONTROL'}
                  </span>
                )}
              </div>

              {!selectedDiscovery ? (
                <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontSize: 12 }}>
                  Select a relationship discovery to inspect supporting records and multi-hop paths.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Selected Title & Reason */}
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{selectedDiscovery.title}</h3>
                    <p style={{ fontSize: 11, color: T.secondary, marginTop: 4, lineHeight: 1.5 }}>
                      {selectedDiscovery.explanation}
                    </p>
                  </div>

                  {/* Multi-Hop Path Visualizer */}
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                        color: T.muted,
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Relationship Traversal Path ({selectedDiscovery.path.length} hops)
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--bg-card)',
                        padding: 10,
                        borderRadius: 8,
                        border: `1px solid ${T.divider}`,
                      }}
                    >
                      {selectedDiscovery.path.map((step, i) => (
                        <div key={`${step.id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              background: 'var(--bg-panel)',
                              padding: '4px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                              fontWeight: 600,
                              color: i === 0 || i === selectedDiscovery.path.length - 1 ? T.gold : T.primary,
                              border: `1px solid ${T.border}`,
                            }}
                          >
                            {step.label}
                          </div>
                          {i < selectedDiscovery.path.length - 1 && (
                            <ArrowRight style={{ width: 12, height: 12, color: T.muted }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contributing Signals Chips */}
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                        color: T.muted,
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Contributing Signals
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {selectedDiscovery.contributingSignals.map((sig) => (
                        <span
                          key={sig}
                          style={{
                            fontSize: 10,
                            fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(232,198,106,0.1)',
                            color: T.gold,
                            border: '1px solid rgba(232,198,106,0.25)',
                          }}
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Supporting PostgreSQL Record IDs & Timestamps */}
                  <div>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                        color: T.muted,
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      Verified Supporting Records ({selectedDiscovery.supportingRecords.length})
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        maxHeight: 250,
                        overflowY: 'auto',
                      }}
                    >
                      {selectedDiscovery.supportingRecords.map((rec) => (
                        <div
                          key={rec.recordId}
                          style={{
                            background: 'var(--bg-panel)',
                            border: `1px solid ${T.border}`,
                            borderRadius: 8,
                            padding: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            fontSize: 11,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, color: T.primary, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>
                              {rec.identifier}
                            </span>
                            <span style={{ fontSize: 9, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', color: T.gold }}>
                              {formatIST(rec.timestamp)}
                            </span>
                          </div>
                          <p style={{ fontSize: 10, color: T.secondary }}>{rec.details}</p>
                          <div style={{ fontSize: 9, color: T.muted, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>
                            PK: {rec.recordId}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct Investigation Links */}
                  {(selectedDiscovery.associatedAlertCodes.length > 0 || selectedDiscovery.associatedCaseCodes.length > 0) && (
                    <div
                      style={{
                        paddingTop: 10,
                        borderTop: `1px solid ${T.divider}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 10, color: T.muted, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace', textTransform: 'uppercase' }}>
                        Connected Investigation Files
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selectedDiscovery.associatedAlertCodes.map((code) => (
                          <Link
                            key={code}
                            href={`/alerts`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                              padding: '4px 8px',
                              borderRadius: 6,
                              background: 'rgba(224,82,82,0.15)',
                              color: T.red,
                              border: '1px solid rgba(224,82,82,0.3)',
                              textDecoration: 'none',
                            }}
                          >
                            Alert: {code} <ExternalLink style={{ width: 10, height: 10 }} />
                          </Link>
                        ))}
                        {selectedDiscovery.associatedCaseCodes.map((code) => (
                          <Link
                            key={code}
                            href={`/cases`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                              padding: '4px 8px',
                              borderRadius: 6,
                              background: 'rgba(232,198,106,0.15)',
                              color: T.gold,
                              border: '1px solid rgba(232,198,106,0.3)',
                              textDecoration: 'none',
                            }}
                          >
                            Case: {code} <ExternalLink style={{ width: 10, height: 10 }} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MoneyFlowGraphPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-plex-mono), ui-monospace, monospace' }}>
          Loading TrustLine Graph Intelligence Workspace...
        </div>
      }
    >
      <ReactFlowProvider>
        <MoneyFlowGraphCanvas />
      </ReactFlowProvider>
    </Suspense>
  );
}
