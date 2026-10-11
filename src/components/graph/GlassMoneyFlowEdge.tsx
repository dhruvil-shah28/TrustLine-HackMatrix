'use client';

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';

type MoneyFlowEdgeData = {
  label?: string;
  amount?: number;
  timestamp?: string;
  isSuspicious?: boolean;
  isDirectEvidence?: boolean;
  linkageStrength?: number;
};

export function GlassMoneyFlowEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style,
    markerEnd,
    label,
    data,
    selected,
  } = props;

  const edgeData = (data ?? {}) as MoneyFlowEdgeData;
  const relationship =
    edgeData.label ??
    (typeof label === 'string' ? label : 'RELATED');

  const hasTimestamp =
    typeof edgeData.timestamp === 'string' &&
    edgeData.timestamp.length > 0;

  let timestampLabel = '';
  if (hasTimestamp) {
    const date = new Date(edgeData.timestamp!);
    if (!Number.isNaN(date.getTime())) {
      timestampLabel =
        new Intl.DateTimeFormat('en-IN', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }).format(date) + ' IST';
    }
  }

  const hasAmount = typeof edgeData.amount === 'number';
  const isTransfer =
    relationship === 'TRANSFERRED_TO' ||
    (hasAmount && hasTimestamp);

  const amountLabel = hasAmount
    ? `₹${(edgeData.amount! / 100000).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
      })}L`
    : '';

  const mainLabel = isTransfer && hasAmount
    ? `TRANSFER · ${amountLabel}`
    : typeof label === 'string'
      ? label
      : relationship;

  const suspicious = Boolean(edgeData.isSuspicious);
  const edgeColor = suspicious
    ? '#FB7185'
    : edgeData.isDirectEvidence
      ? '#67E8F9'
      : '#83E0C9';

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
    offset: 24,
  });

  // Routine ownership links stay uncluttered. Important links retain a label.
  const legacyTimeLabel =
    typeof label === 'string' && /\\b\\d{2}:\\d{2}\\b/.test(label);
  const showLabel =
    hasTimestamp ||
    isTransfer ||
    suspicious ||
    selected ||
    edgeData.linkageStrength !== undefined ||
    legacyTimeLabel;

  const edgeHash = Array.from(id).reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    7,
  );
  const labelStagger = ((edgeHash % 5) - 2) * 17;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: style?.stroke ?? edgeColor,
          strokeWidth: suspicious ? 2.4 : style?.strokeWidth ?? 1.5,
        }}
        markerEnd={markerEnd}
      />

      {showLabel && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + labelStagger}px)`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div
              style={{
                maxWidth: 190,
                padding: '6px 9px',
                borderRadius: 10,
                border: `1px solid ${suspicious ? 'rgba(251,113,133,0.65)' : 'rgba(131,224,201,0.35)'}`,
                background: 'rgba(7, 18, 29, 0.90)',
                backdropFilter: 'blur(14px) saturate(150%)',
                WebkitBackdropFilter: 'blur(14px) saturate(150%)',
                boxShadow: suspicious
                  ? '0 4px 18px rgba(244,63,94,0.16)'
                  : '0 4px 18px rgba(0,0,0,0.22)',
                color: suspicious ? '#FDA4AF' : '#D9FBEF',
                fontFamily: 'var(--font-plex-mono), ui-monospace, monospace',
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1.4,
                textAlign: 'center',
                whiteSpace: 'normal',
              }}
            >
              <div style={{ overflowWrap: 'anywhere' }}>
                {mainLabel}
              </div>

              {timestampLabel && (
                <div
                  style={{
                    marginTop: 3,
                    paddingTop: 3,
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                    color: '#B6C9D3',
                    fontSize: 9,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                  }}
                >
                  ◷ {timestampLabel}
                </div>
              )}

              {edgeData.linkageStrength !== undefined && (
                <div
                  style={{
                    marginTop: 2,
                    color: '#83E0C9',
                    fontSize: 9,
                  }}
                >
                  Link strength: {edgeData.linkageStrength}%
                </div>
              )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
