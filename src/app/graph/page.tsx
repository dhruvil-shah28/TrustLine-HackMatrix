'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import { MoneyFlowNode, MoneyFlowEdge } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

// ─── Design tokens ───────────────────────────────────────────────────
const T = {
  // surfaces
  nodeBg: '#1F1F1F',
  nodeSubBg: '#202A25',   // account default
  suspBg: '#241B1B',   // suspicious node
  border: 'rgba(255,255,255,0.14)',
  greenBorder: 'rgba(76,175,130,0.45)',
  redBorder: '#E05252',
  // text
  primary: '#F5F2EA',
  secondary: '#B8B5AE',
  muted: '#9B9892',
  // accents
  gold: '#E8C66A',
  green: '#6FD0A1',
  red: '#FF8A8A',
  // divider
  divider: 'rgba(255,255,255,0.08)',
};

// ─── Custom Node Component ────────────────────────────────────────────
const CustomGraphNode = ({ data }: any) => {
  const isSuspicious = data.isSuspicious;
  const isDimmed = data.isDimmed;
  const nodeType = data.type;

  // Derive surface / border
  let bg = T.nodeBg;
  let border = T.border;
  if (isDimmed) {
    bg = '#1A1A1A'; border = 'rgba(255,255,255,0.05)';
  } else if (isSuspicious) {
    bg = T.suspBg; border = T.redBorder;
  } else if (nodeType === 'ACCOUNT') {
    bg = T.nodeSubBg; border = T.greenBorder;
  }

  // Type badge colors
  const typeBadge: Record<string, { icon: any; clr: string }> = {
    EMPLOYEE: { icon: User, clr: T.gold },
    CUSTOMER: { icon: Building2, clr: T.secondary },
    ACCOUNT: { icon: CreditCard, clr: T.green },
  };
  const badge = typeBadge[nodeType] ?? { icon: Info, clr: T.muted };
  const BadgeIcon = badge.icon;

  const dividerColor = isSuspicious
    ? 'rgba(224,82,82,0.25)'
    : nodeType === 'ACCOUNT'
      ? 'rgba(76,175,130,0.2)'
      : T.divider;

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: '10px 14px 10px 14px',
        width: 244,
        opacity: isDimmed ? 0.25 : 1,
        transition: 'opacity 0.2s',
        boxShadow: isSuspicious
          ? '0 0 0 1px rgba(224,82,82,0.15), 0 4px 20px rgba(0,0,0,0.5)'
          : '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <Handle type="target" position={Position.Top}
        style={{ background: T.gold, width: 8, height: 8, border: '2px solid #111111' }} />

      {/* Header: type badge + suspicious flag */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 8, marginBottom: 8, borderBottom: `1px solid ${dividerColor}`
      }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
          color: badge.clr, fontFamily: 'monospace',
          background: 'rgba(255,255,255,0.05)', border: `1px solid ${dividerColor}`,
          borderRadius: 5, padding: '2px 6px',
        }}>
          <BadgeIcon style={{ width: 10, height: 10 }} />
          {nodeType}
        </span>

        {isSuspicious && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            background: 'rgba(224,82,82,0.15)', color: T.red,
            border: '1px solid rgba(224,82,82,0.45)', borderRadius: 5, padding: '2px 6px',
          }}>
            <ShieldAlert style={{ width: 10, height: 10 }} />
            SUSPICIOUS
          </span>
        )}
      </div>

      {/* Primary label */}
      <div style={{
        fontSize: 13, fontWeight: 700, color: isSuspicious ? '#FFF5F5' : T.primary,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        lineHeight: 1.3,
      }}>
        {data.label}
      </div>

      {/* Sub-text */}
      {data.details?.subText && (
        <p style={{
          fontSize: 10, color: isSuspicious ? '#D8B4B4' : T.secondary,
          marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {data.details.subText}
        </p>
      )}

      {/* Risk score footer */}
      {data.details?.riskScore !== undefined && (
        <div style={{
          marginTop: 8, paddingTop: 6, borderTop: `1px solid ${dividerColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10,
        }}>
          <span style={{ color: T.muted }}>Risk Index:</span>
          <span style={{
            fontFamily: 'monospace', fontWeight: 700,
            color: data.details.riskScore > 65 ? T.red : T.green,
          }}>
            {data.details.riskScore} / 100
          </span>
        </div>
      )}

      {/* Account balance footer */}
      {data.details?.balance !== undefined && (
        <div style={{
          marginTop: 8, paddingTop: 6, borderTop: `1px solid ${dividerColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10,
        }}>
          <span style={{ color: T.muted }}>Balance:</span>
          <span style={{
            fontFamily: 'monospace', fontWeight: 700,
            color: isSuspicious ? T.red : T.green,
          }}>
            ₹{(data.details.balance / 100000).toFixed(2)}L
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom}
        style={{ background: T.gold, width: 8, height: 8, border: '2px solid #111111' }} />
    </div>
  );
};

const nodeTypes = { customNode: CustomGraphNode };

// ─── Main Canvas ──────────────────────────────────────────────────────
function MoneyFlowGraphCanvas() {
  const { showToast } = useAuth();
  const reactFlowInstance = useReactFlow();

  const [rawNodes, setRawNodes] = useState<MoneyFlowNode[]>([]);
  const [rawEdges, setRawEdges] = useState<MoneyFlowEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<MoneyFlowNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<MoneyFlowEdge | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [filterSuspiciousOnly, setFilterSuspiciousOnly] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    fetch('/api/graph')
      .then((res) => res.json())
      .then((data) => {
        setRawNodes(data.nodes || []);
        setRawEdges(data.edges || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
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
          label: emp.label, type: emp.type, details: emp.details,
          isSuspicious: emp.isSuspicious, isDimmed, rawNode: emp
        },
      });
    });

    customers.forEach((cust, i) => {
      const isDimmed = filterSuspiciousOnly && !cust.isSuspicious;
      formattedNodes.push({
        id: cust.id,
        type: 'customNode',
        position: { x: i * 300 + 40, y: 220 },
        data: {
          label: cust.label, type: cust.type, details: cust.details,
          isSuspicious: cust.isSuspicious, isDimmed, rawNode: cust
        },
      });
    });

    accounts.forEach((acc, i) => {
      const isDimmed = filterSuspiciousOnly && !acc.isSuspicious;
      const cols = 5;
      formattedNodes.push({
        id: acc.id,
        type: 'customNode',
        position: { x: (i % cols) * 300 + 40, y: 400 + Math.floor(i / cols) * 180 },
        data: {
          label: acc.label, type: acc.type, details: acc.details,
          isSuspicious: acc.isSuspicious, isDimmed, rawNode: acc
        },
      });
    });

    const formattedEdges: Edge[] = filteredRawEdges.map((edge) => {
      const isSuspicious = edge.isSuspicious;
      const isDimmed = filterSuspiciousOnly && !isSuspicious;

      // Color system: gold=OWNS, red=suspicious, muted warm gray=normal, darker for ACCESSED
      let strokeColor = 'rgba(184,181,174,0.5)';   // normal transfer
      if (edge.label === 'OWNS') strokeColor = T.gold;
      else if (edge.label === 'ACCESSED') strokeColor = 'rgba(184,181,174,0.7)';
      if (isSuspicious) strokeColor = T.redBorder;

      const labelBg = isSuspicious ? '#2A1C1C' : '#242424';
      const labelClr = isSuspicious ? T.red : T.primary;
      const labelBdr = isSuspicious ? 'rgba(224,82,82,0.4)' : 'rgba(255,255,255,0.12)';

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.amount
          ? `${edge.label} (₹${(edge.amount / 100000).toFixed(1)}L)`
          : edge.label,
        animated: isSuspicious,
        style: {
          stroke: strokeColor,
          strokeWidth: isSuspicious ? 2.5 : 1.5,
          opacity: isDimmed ? 0.1 : 1,
        },
        labelStyle: {
          fill: labelClr,
          fontSize: 10,
          fontWeight: 600,
          background: labelBg,
        },
        labelBgStyle: {
          fill: labelBg,
          stroke: labelBdr,
          strokeWidth: 1,
          rx: 4,
          ry: 4,
        },
        labelBgPadding: [4, 6] as [number, number],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 16,
          height: 16,
        },
      };
    });

    setNodes(formattedNodes);
    setEdges(formattedEdges);
  }, [rawNodes, rawEdges, filterSuspiciousOnly, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      const raw = rawNodes.find((n) => n.id === node.id);
      if (raw) { setSelectedNode(raw); setSelectedEdge(null); }
    },
    [rawNodes]
  );

  const onEdgeClick = useCallback(
    (_: any, edge: Edge) => {
      const raw = rawEdges.find((e) => e.id === edge.id);
      if (raw) { setSelectedEdge(raw); setSelectedNode(null); }
    },
    [rawEdges]
  );

  const handleSelectSearchResult = (node: MoneyFlowNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setSearchQuery(node.label);
    setShowSearchDropdown(false);
    const targetNode = nodes.find((n) => n.id === node.id);
    if (targetNode && reactFlowInstance) {
      reactFlowInstance.setCenter(targetNode.position.x + 100, targetNode.position.y + 50, { zoom: 1.2, duration: 800 });
      showToast(`Focused camera on ${node.label}`);
    }
  };

  const matchingSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return rawNodes.filter(
      (n) => n.label.toLowerCase().includes(q) || n.type.toLowerCase().includes(q) || n.details?.subText?.toLowerCase().includes(q)
    );
  }, [searchQuery, rawNodes]);

  // ── Sidebar shared styles ──
  const sidebarBase: React.CSSProperties = {
    position: 'absolute', right: 16, top: 16, width: 300,
    background: '#1B1B1B', border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 14, padding: 16, zIndex: 50, boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, borderBottom: `1px solid ${T.divider}`, paddingBottom: 16
      }}>
        <div>
          <h1 className="heading-page" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <GitFork style={{ width: 18, height: 18, color: T.gold }} />
            Interactive Money-Flow Graph Network
          </h1>
          <p style={{ fontSize: 12, color: T.secondary, marginTop: 4 }}>
            Explore relationships between employees, customers, accounts, permissions, and suspicious circular transfers.
          </p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#242424', border: `1px solid rgba(255,255,255,0.10)`,
              borderRadius: 8, padding: '7px 12px', width: 216,
            }}>
              <Search style={{ width: 13, height: 13, color: T.muted, flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search node name/ID..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 12, color: T.primary, width: '100%',
                }}
              />
            </div>

            {showSearchDropdown && matchingSearchResults.length > 0 && (
              <div style={{
                position: 'absolute', right: 0, top: 38, width: 264,
                background: '#1B1B1B', border: `1px solid rgba(255,255,255,0.09)`,
                borderRadius: 12, padding: 8, zIndex: 50,
                maxHeight: 240, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              }}>
                {matchingSearchResults.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleSelectSearchResult(n)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 10px',
                      borderRadius: 8, cursor: 'pointer', border: 'none',
                      background: 'transparent', display: 'block', transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: T.primary }}>{n.label}</span>
                      <span style={{ fontSize: 9, fontFamily: 'monospace', color: T.gold }}>{n.type}</span>
                    </div>
                    {n.details?.subText && (
                      <p style={{ fontSize: 10, color: T.secondary, marginTop: 2 }}>{n.details.subText}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Suspicious toggle */}
          <button
            onClick={() => {
              setFilterSuspiciousOnly(!filterSuspiciousOnly);
              showToast(!filterSuspiciousOnly ? 'Showing Suspicious Path Focus' : 'Showing Full Graph Network');
              if (reactFlowInstance) setTimeout(() => reactFlowInstance.fitView({ padding: 0.15, duration: 600 }), 100);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
              background: filterSuspiciousOnly ? 'rgba(224,82,82,0.12)' : '#242424',
              color: filterSuspiciousOnly ? T.red : T.secondary,
              borderColor: filterSuspiciousOnly ? 'rgba(224,82,82,0.45)' : 'rgba(255,255,255,0.10)',
            }}
          >
            <ShieldAlert style={{ width: 14, height: 14 }} />
            {filterSuspiciousOnly ? 'Suspicious Path Active' : 'Highlight Suspicious'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div style={{
        position: 'relative', width: '100%', height: 720,
        background: '#111111', borderRadius: 16,
        border: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
      }}>
        {loading ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontFamily: 'monospace', color: T.muted
          }}>
            Loading graph canvas...
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

            {/* Controls */}
            <Controls style={{
              background: '#1B1B1B', border: `1px solid rgba(255,255,255,0.09)`,
              borderRadius: 10, padding: 4,
            }} />

            {/* Legend */}
            <Panel position="top-left">
              <div style={{
                background: 'rgba(27,27,27,0.95)', border: `1px solid rgba(255,255,255,0.09)`,
                borderRadius: 12, padding: '12px 14px', fontSize: 11,
                backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                minWidth: 192,
              }}>
                <span style={{
                  fontWeight: 700, color: T.primary, display: 'block',
                  paddingBottom: 8, marginBottom: 8,
                  borderBottom: `1px solid rgba(255,255,255,0.08)`
                }}>
                  Graph Legend
                </span>
                {[
                  { clr: T.redBorder, lbl: 'Suspicious / Circular' },
                  { clr: T.gold, lbl: 'Ownership (OWNS)' },
                  { clr: 'rgba(184,181,174,0.7)', lbl: 'Employee Access (ACCESSED)' },
                  { clr: 'rgba(184,181,174,0.5)', lbl: 'Wire Transfer' },
                ].map(({ clr, lbl }) => (
                  <div key={lbl} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    color: T.secondary, marginBottom: 5
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: clr, flexShrink: 0
                    }} />
                    {lbl}
                  </div>
                ))}
              </div>
            </Panel>

            {/* Fit/Reset */}
            <Panel position="top-right">
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { lbl: 'Fit View', icon: Maximize2, action: () => reactFlowInstance?.fitView({ padding: 0.15, duration: 500 }) },
                  { lbl: 'Reset', icon: RotateCcw, action: () => reactFlowInstance?.zoomTo(1, { duration: 500 }) },
                ].map(({ lbl, icon: Icon, action }) => (
                  <button key={lbl} onClick={action} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    background: '#242424', color: T.secondary,
                    border: `1px solid rgba(255,255,255,0.10)`, cursor: 'pointer',
                  }}>
                    <Icon style={{ width: 13, height: 13 }} /> {lbl}
                  </button>
                ))}
              </div>
            </Panel>
          </ReactFlow>
        )}

        {/* Node Detail Sidebar */}
        {selectedNode && (
          <div style={sidebarBase}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${T.divider}`
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.gold, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                {selectedNode.type} DETAILS
              </span>
              <button onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.secondary }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{selectedNode.label}</h3>
            <p style={{ fontSize: 11, color: T.secondary, marginTop: 2 }}>{selectedNode.details?.subText}</p>

            {selectedNode.isSuspicious && (
              <div style={{
                marginTop: 12, padding: '10px 12px', borderRadius: 8,
                background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.3)',
              }}>
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
                  fontWeight: 700, color: T.red
                }}>
                  <ShieldAlert style={{ width: 13, height: 13 }} />
                  Suspicious Topology Indicator
                </span>
                <p style={{ fontSize: 10, color: '#D8B4B4', marginTop: 4, lineHeight: 1.5 }}>
                  Participates in a 3-node closed circular transfer loop or pre-transfer privilege lookup.
                </p>
              </div>
            )}

            <div style={{ marginTop: 12, fontSize: 11, color: T.secondary }}>
              {[
                { lbl: 'Role', val: selectedNode.details?.role, clr: T.primary },
                { lbl: 'Privilege', val: selectedNode.details?.privilege, clr: '#D4A844' },
                {
                  lbl: 'Risk Score', val: selectedNode.details?.riskScore !== undefined
                    ? `${selectedNode.details.riskScore} / 100` : undefined,
                  clr: (selectedNode.details?.riskScore ?? 0) > 65 ? T.red : T.green
                },
                {
                  lbl: 'Balance', val: selectedNode.details?.balance !== undefined
                    ? `₹${(selectedNode.details.balance / 100000).toFixed(2)}L` : undefined,
                  clr: T.green
                },
              ].filter(r => r.val !== undefined).map(({ lbl, val, clr }) => (
                <div key={lbl} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: `1px solid ${T.divider}`,
                }}>
                  <span style={{ color: T.muted }}>{lbl}:</span>
                  <span style={{ fontWeight: 600, color: clr, fontFamily: lbl === 'Risk Score' || lbl === 'Balance' ? 'monospace' : undefined }}>
                    {val as string}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edge Detail Sidebar */}
        {selectedEdge && (
          <div style={{ ...sidebarBase, borderColor: 'rgba(224,82,82,0.35)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 10, marginBottom: 10, borderBottom: `1px solid ${T.divider}`
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.red, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                RELATIONSHIP DETAILS
              </span>
              <button onClick={() => setSelectedEdge(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.secondary }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{selectedEdge.label}</h3>
            <p style={{ fontSize: 11, color: T.secondary, marginTop: 2, fontFamily: 'monospace' }}>
              Edge ID: {selectedEdge.id}
            </p>

            <div style={{ marginTop: 12, fontSize: 11 }}>
              {[
                { lbl: 'Source Entity', val: selectedEdge.source, clr: T.primary },
                { lbl: 'Target Entity', val: selectedEdge.target, clr: T.primary },
                ...(selectedEdge.amount
                  ? [{ lbl: 'Transferred Amount', val: `₹${(selectedEdge.amount / 100000).toFixed(2)} Lakhs`, clr: T.red }]
                  : []),
              ].map(({ lbl, val, clr }) => (
                <div key={lbl} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: `1px solid ${T.divider}`,
                }}>
                  <span style={{ color: T.muted }}>{lbl}:</span>
                  <span style={{ fontWeight: 600, color: clr }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MoneyFlowGraphPage() {
  return (
    <ReactFlowProvider>
      <MoneyFlowGraphCanvas />
    </ReactFlowProvider>
  );
}
