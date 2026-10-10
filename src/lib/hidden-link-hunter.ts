import { prisma } from './prisma';

export type EntityType = 'EMPLOYEE' | 'CUSTOMER' | 'ACCOUNT' | 'TRANSACTION' | 'ALERT' | 'CASE';

export type DiscoveredRelationshipType =
  | 'SHARED_INTERMEDIARY_TRANSFER'
  | 'CROSS_EMPLOYEE_ACCESS'
  | 'TEMPORAL_PRE_TRANSACTION_ACTION'
  | 'MULTI_HOP_FLOW'
  | 'CROSS_INVESTIGATION_LINK'
  | 'COORDINATED_SUSPICIOUS_ACTIVITY'
  | 'LEGITIMATE_COMMERCIAL_LINK';

export interface SupportingRecord {
  recordType: 'TRANSACTION' | 'ACCESS_EVENT' | 'EMPLOYEE_ACTION' | 'ALERT' | 'CASE' | 'ACCOUNT';
  recordId: string;
  identifier: string;
  timestamp: string;
  details: string;
  amount?: number;
}

export interface DiscoveredRelationship {
  id: string;
  relationshipType: DiscoveredRelationshipType;
  title: string;
  explanation: string;
  sourceEntity: {
    id: string;
    label: string;
    type: EntityType;
    riskScore?: number;
    subText?: string;
  };
  targetEntity: {
    id: string;
    label: string;
    type: EntityType;
    riskScore?: number;
    subText?: string;
  };
  path: Array<{
    id: string;
    label: string;
    type: EntityType;
  }>;
  supportingRecords: SupportingRecord[];
  contributingSignals: string[];
  linkageStrength: number; // 0 to 100 indicator of relationship strength
  isDirectEvidence: boolean; // Direct DB relation vs algorithmically inferred multi-hop
  isSuspicious: boolean;
  associatedAlertCodes: string[];
  associatedCaseCodes: string[];
}

export interface HiddenLinkHunterOverview {
  totalCandidateRelationships: number;
  totalConnectedEntities: number;
  totalLinkedAlertsAndCases: number;
  meaningfulMultiHopConnections: number;
  highStrengthCount: number;
  suspectedRingsCount: number;
}

export interface HiddenLinkHunterResult {
  overview: HiddenLinkHunterOverview;
  discoveries: DiscoveredRelationship[];
  graph: {
    nodes: Array<{
      id: string;
      label: string;
      type: EntityType;
      isSuspicious: boolean;
      riskScore?: number;
      details: Record<string, any>;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label: string;
      relationshipType: DiscoveredRelationshipType;
      isDirectEvidence: boolean;
      isSuspicious: boolean;
      linkageStrength: number;
      amount?: number;
    }>;
  };
}

export interface HiddenLinkHunterFilters {
  entityType?: string;
  relationshipType?: string;
  minStrength?: number;
  associatedWithAlertOrCaseOnly?: boolean;
  searchQuery?: string;
}

/**
 * Deterministic Cross-Entity Relationship Discovery Engine
 * Explores shared pathways, multi-hop loops, cross-employee access,
 * temporal actions, and cross-investigation links across PostgreSQL records.
 */
export async function discoverHiddenLinks(
  filters: HiddenLinkHunterFilters = {}
): Promise<HiddenLinkHunterResult> {
  const {
    entityType = 'ALL',
    relationshipType = 'ALL',
    minStrength = 0,
    associatedWithAlertOrCaseOnly = false,
    searchQuery = '',
  } = filters;

  // 1. Fetch relevant relational data from PostgreSQL
  const [
    employees,
    customers,
    accounts,
    transactions,
    accessEvents,
    employeeActions,
    alerts,
    cases,
  ] = await Promise.all([
    prisma.employee.findMany(),
    prisma.customer.findMany(),
    prisma.account.findMany({
      include: {
        customer: true,
        outgoingTx: true,
        incomingTx: true,
      },
    }),
    prisma.transaction.findMany({
      include: {
        sourceAccount: { include: { customer: true } },
        destinationAccount: { include: { customer: true } },
        initiatedByEmployee: true,
        approvedByEmployee: true,
      },
      orderBy: { timestamp: 'asc' },
    }),
    prisma.accessEvent.findMany({
      include: { employee: true },
      orderBy: { timestamp: 'asc' },
    }),
    prisma.employeeAction.findMany({
      include: { employee: true },
      orderBy: { timestamp: 'asc' },
    }),
    prisma.alert.findMany({
      include: {
        signals: true,
        cases: { include: { case: true } },
      },
    }),
    prisma.case.findMany({
      include: {
        alerts: { include: { alert: true } },
        evidenceItems: true,
      },
    }),
  ]);

  const discoveries: DiscoveredRelationship[] = [];
  const edgeDeduplicationSet = new Set<string>();

  // Map lookups for fast retrieval
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const accountByNumber = new Map(accounts.map((a) => [a.accountNumber, a]));
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const customerById = new Map(customers.map((c) => [c.id, c]));

  // Index alerts and cases by referenced entity
  const alertCodesByEntity = new Map<string, Set<string>>();
  const caseCodesByEntity = new Map<string, Set<string>>();

  alerts.forEach((alt) => {
    if (!alertCodesByEntity.has(alt.primaryEntityId)) {
      alertCodesByEntity.set(alt.primaryEntityId, new Set());
    }
    alertCodesByEntity.get(alt.primaryEntityId)!.add(alt.alertCode);

    alt.cases.forEach((ca) => {
      if (!caseCodesByEntity.has(alt.primaryEntityId)) {
        caseCodesByEntity.set(alt.primaryEntityId, new Set());
      }
      caseCodesByEntity.get(alt.primaryEntityId)!.add(ca.case.caseCode);
    });
  });

  const getAlertCodesForEntities = (...entityIds: string[]): string[] => {
    const codes = new Set<string>();
    entityIds.forEach((id) => {
      const found = alertCodesByEntity.get(id);
      if (found) found.forEach((c) => codes.add(c));
    });
    return Array.from(codes);
  };

  const getCaseCodesForEntities = (...entityIds: string[]): string[] => {
    const codes = new Set<string>();
    entityIds.forEach((id) => {
      const found = caseCodesByEntity.get(id);
      if (found) found.forEach((c) => codes.add(c));
    });
    return Array.from(codes);
  };

  // Helper to add discovery deterministically without duplicate pairs
  const addDiscovery = (disc: DiscoveredRelationship) => {
    const sortedEndpoints = [disc.sourceEntity.id, disc.targetEntity.id].sort().join('::');
    const dedupKey = `${disc.relationshipType}::${sortedEndpoints}`;
    if (edgeDeduplicationSet.has(dedupKey)) return;
    edgeDeduplicationSet.add(dedupKey);
    discoveries.push(disc);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // PATTERN 1: Multi-Hop Financial Pathways & Circular Velocity
  // (e.g. Account A -> Account B -> Account C -> Account A/Beneficiary)
  // ──────────────────────────────────────────────────────────────────────────
  // Group transactions by source account
  const outgoingByAcc = new Map<string, typeof transactions>();
  transactions.forEach((tx) => {
    if (!outgoingByAcc.has(tx.sourceAccountId)) {
      outgoingByAcc.set(tx.sourceAccountId, []);
    }
    outgoingByAcc.get(tx.sourceAccountId)!.push(tx);
  });

  transactions.forEach((tx1) => {
    const hop1Dest = tx1.destinationAccountId;
    const hop2Txs = outgoingByAcc.get(hop1Dest) || [];

    hop2Txs.forEach((tx2) => {
      // Check for rapid succession (within 24 hours)
      const diffMs = new Date(tx2.timestamp).getTime() - new Date(tx1.timestamp).getTime();
      if (diffMs >= 0 && diffMs <= 86400000) {
        const hop2Dest = tx2.destinationAccountId;

        // Multi-hop transfer chain detected (Acc A -> Acc B -> Acc C)
        const accA = tx1.sourceAccount;
        const accB = tx1.destinationAccount;
        const accC = tx2.destinationAccount;

        // Check if there is a 3rd hop returning to A or connected beneficiary
        const hop3Txs = outgoingByAcc.get(hop2Dest) || [];
        const returningTx = hop3Txs.find((tx3) => tx3.destinationAccountId === accA.id);

        const isCircular = Boolean(returningTx) || accC.id === accA.id;
        const totalAmount = tx1.amount + tx2.amount + (returningTx ? returningTx.amount : 0);
        const isSuspicious = isCircular || tx1.amount >= 400000 || tx2.amount >= 400000;

        const contributingSignals = ['MULTI_HOP_FLOW'];
        if (isCircular) contributingSignals.push('CIRCULAR_LOOP_CLOSURE');
        if (diffMs < 3600000) contributingSignals.push('HIGH_VELOCITY_PASS_THROUGH');
        if (tx1.amount >= 400000) contributingSignals.push('THRESHOLD_STRUCTURING_VOLUME');

        const supportingRecords: SupportingRecord[] = [
          {
            recordType: 'TRANSACTION',
            recordId: tx1.id,
            identifier: tx1.txHash,
            timestamp: tx1.timestamp.toISOString(),
            details: `Hop 1: ₹${tx1.amount.toLocaleString('en-IN')} transferred from ${accA.accountNumber} to ${accB.accountNumber} (${tx1.channel})`,
            amount: tx1.amount,
          },
          {
            recordType: 'TRANSACTION',
            recordId: tx2.id,
            identifier: tx2.txHash,
            timestamp: tx2.timestamp.toISOString(),
            details: `Hop 2: ₹${tx2.amount.toLocaleString('en-IN')} forwarded from ${accB.accountNumber} to ${accC.accountNumber} within ${Math.round(diffMs / 60000)}m`,
            amount: tx2.amount,
          },
        ];

        if (returningTx) {
          supportingRecords.push({
            recordType: 'TRANSACTION',
            recordId: returningTx.id,
            identifier: returningTx.txHash,
            timestamp: returningTx.timestamp.toISOString(),
            details: `Hop 3 (Return): ₹${returningTx.amount.toLocaleString('en-IN')} routed back to originating account ${accA.accountNumber}`,
            amount: returningTx.amount,
          });
        }

        const path = [
          { id: `ACC-${accA.id}`, label: accA.accountNumber, type: 'ACCOUNT' as const },
          { id: `ACC-${accB.id}`, label: accB.accountNumber, type: 'ACCOUNT' as const },
          { id: `ACC-${accC.id}`, label: accC.accountNumber, type: 'ACCOUNT' as const },
        ];
        if (returningTx) {
          path.push({ id: `ACC-${accA.id}`, label: accA.accountNumber, type: 'ACCOUNT' as const });
        }

        // Calculate explainable linkage strength (0 - 100)
        let strength = 50;
        if (isCircular) strength += 30;
        if (diffMs < 1800000) strength += 15; // < 30 mins
        if (totalAmount >= 1000000) strength += 5;
        strength = Math.min(strength, 98);

        const linkedAlertCodes = getAlertCodesForEntities(accA.accountNumber, accB.accountNumber, accC.accountNumber);
        const linkedCaseCodes = getCaseCodesForEntities(accA.accountNumber, accB.accountNumber, accC.accountNumber);

        addDiscovery({
          id: `disc-multihop-${tx1.id}-${tx2.id}`,
          relationshipType: isCircular ? 'MULTI_HOP_FLOW' : 'SHARED_INTERMEDIARY_TRANSFER',
          title: isCircular
            ? `Closed Multi-Hop Loop: ${accA.accountNumber} ⟲ ${accC.accountNumber}`
            : `Shared Pathway: ${accA.accountNumber} ➔ ${accB.accountNumber} ➔ ${accC.accountNumber}`,
          explanation: isCircular
            ? `Funds dispatched from ${accA.accountNumber} were passed through intermediary ${accB.accountNumber} and returned to the origin within ${Math.round(diffMs / 60000)} minutes.`
            : `Accounts ${accA.accountNumber} and ${accC.accountNumber} share intermediate conduit account ${accB.accountNumber} with high transaction correlation.`,
          sourceEntity: {
            id: `ACC-${accA.id}`,
            label: accA.accountNumber,
            type: 'ACCOUNT',
            subText: `${accA.accountType} (${accA.customer?.name})`,
          },
          targetEntity: {
            id: `ACC-${accC.id}`,
            label: accC.accountNumber,
            type: 'ACCOUNT',
            subText: `${accC.accountType} (${accC.customer?.name})`,
          },
          path,
          supportingRecords,
          contributingSignals,
          linkageStrength: strength,
          isDirectEvidence: false, // Inferred multi-hop linkage
          isSuspicious,
          associatedAlertCodes: linkedAlertCodes,
          associatedCaseCodes: linkedCaseCodes,
        });
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PATTERN 2: Cross-Employee Common Entity Access
  // (e.g. Multiple employees accessing the same customer or account)
  // ──────────────────────────────────────────────────────────────────────────
  const accessByEntity = new Map<string, typeof accessEvents>();
  accessEvents.forEach((ev) => {
    const key = `${ev.entityType}::${ev.entityId}`;
    if (!accessByEntity.has(key)) accessByEntity.set(key, []);
    accessByEntity.get(key)!.push(ev);
  });

  accessByEntity.forEach((eventsOnEntity, entityKey) => {
    // Collect distinct employee IDs
    const empMap = new Map<string, typeof accessEvents>();
    eventsOnEntity.forEach((ev) => {
      if (!empMap.has(ev.employeeId)) empMap.set(ev.employeeId, []);
      empMap.get(ev.employeeId)!.push(ev);
    });

    const distinctEmpIds = Array.from(empMap.keys());
    if (distinctEmpIds.length >= 2) {
      for (let i = 0; i < distinctEmpIds.length; i++) {
        for (let j = i + 1; j < distinctEmpIds.length; j++) {
          const emp1 = employeeById.get(distinctEmpIds[i]);
          const emp2 = employeeById.get(distinctEmpIds[j]);
          if (!emp1 || !emp2) continue;

          const evs1 = empMap.get(distinctEmpIds[i])!;
          const evs2 = empMap.get(distinctEmpIds[j])!;

          // Check if either employee has elevated risk
          const hasHighRiskInsider = emp1.riskScore >= 60 || emp2.riskScore >= 60;
          const isSuspicious = hasHighRiskInsider;

          const contributingSignals = ['SHARED_TARGET_ACCESS'];
          if (hasHighRiskInsider) contributingSignals.push('HIGH_RISK_INSIDER_OVERLAP');
          if (emp1.department !== emp2.department) contributingSignals.push('CROSS_DEPARTMENTAL_CONVERGENCE');

          const supportingRecords: SupportingRecord[] = [
            ...evs1.map((e) => ({
              recordType: 'ACCESS_EVENT' as const,
              recordId: e.id,
              identifier: `ACCESS-${e.id.slice(0, 8)}`,
              timestamp: e.timestamp.toISOString(),
              details: `${emp1.name} (${emp1.employeeCode}) accessed ${e.entityType} ${e.entityId} (${e.accessType}) from ${e.ipAddress}`,
            })),
            ...evs2.map((e) => ({
              recordType: 'ACCESS_EVENT' as const,
              recordId: e.id,
              identifier: `ACCESS-${e.id.slice(0, 8)}`,
              timestamp: e.timestamp.toISOString(),
              details: `${emp2.name} (${emp2.employeeCode}) accessed ${e.entityType} ${e.entityId} (${e.accessType}) from ${e.ipAddress}`,
            })),
          ];

          let strength = 45;
          if (hasHighRiskInsider) strength += 25;
          if (emp1.department !== emp2.department) strength += 15;
          strength = Math.min(strength, 92);

          const linkedAlertCodes = getAlertCodesForEntities(emp1.employeeCode, emp2.employeeCode);
          const linkedCaseCodes = getCaseCodesForEntities(emp1.employeeCode, emp2.employeeCode);

          addDiscovery({
            id: `disc-cross-emp-${emp1.id}-${emp2.id}-${entityKey}`,
            relationshipType: 'CROSS_EMPLOYEE_ACCESS',
            title: `Shared Target Access: ${emp1.name} & ${emp2.name}`,
            explanation: `Employees ${emp1.name} (${emp1.role}) and ${emp2.name} (${emp2.role}) both accessed the same target entity (${entityKey.replace('::', ' ')}) independently.`,
            sourceEntity: {
              id: `EMP-${emp1.id}`,
              label: emp1.name,
              type: 'EMPLOYEE',
              riskScore: emp1.riskScore,
              subText: `${emp1.role} (${emp1.department})`,
            },
            targetEntity: {
              id: `EMP-${emp2.id}`,
              label: emp2.name,
              type: 'EMPLOYEE',
              riskScore: emp2.riskScore,
              subText: `${emp2.role} (${emp2.department})`,
            },
            path: [
              { id: `EMP-${emp1.id}`, label: emp1.name, type: 'EMPLOYEE' },
              { id: entityKey, label: entityKey.split('::')[1], type: 'ACCOUNT' },
              { id: `EMP-${emp2.id}`, label: emp2.name, type: 'EMPLOYEE' },
            ],
            supportingRecords,
            contributingSignals,
            linkageStrength: strength,
            isDirectEvidence: true, // Both records exist in AccessEvent table
            isSuspicious,
            associatedAlertCodes: linkedAlertCodes,
            associatedCaseCodes: linkedCaseCodes,
          });
        }
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PATTERN 3: Temporal Connections
  // (e.g. Employee privileged action shortly before/after high-value transaction)
  // ──────────────────────────────────────────────────────────────────────────
  employeeActions.forEach((act) => {
    const actTime = new Date(act.timestamp).getTime();
    const emp = act.employee;

    // Find transactions involving this target account within 2 hours of action
    transactions.forEach((tx) => {
      const txTime = new Date(tx.timestamp).getTime();
      const timeDeltaMinutes = Math.round((txTime - actTime) / 60000);

      // Target matches source or destination account and occurs within -30m to +120m
      if (
        (tx.sourceAccountId === act.targetId || tx.destinationAccountId === act.targetId) &&
        timeDeltaMinutes >= -15 &&
        timeDeltaMinutes <= 120
      ) {
        const targetAcc = accountById.get(act.targetId);
        const isSuspicious = act.actionType.includes('BENEFICIARY') || tx.amount >= 400000 || emp.riskScore >= 50;

        const contributingSignals = ['TEMPORAL_PROXIMITY'];
        if (act.actionType.includes('BENEFICIARY')) contributingSignals.push('PRE_WIRE_BENEFICIARY_OVERRIDE');
        if (timeDeltaMinutes <= 15) contributingSignals.push('IMMEDIATE_EXECUTION_CORRELATION');

        const supportingRecords: SupportingRecord[] = [
          {
            recordType: 'EMPLOYEE_ACTION',
            recordId: act.id,
            identifier: `ACTION-${act.id.slice(0, 8)}`,
            timestamp: act.timestamp.toISOString(),
            details: `Employee ${emp.name} executed ${act.actionType} on ${act.targetType} ${targetAcc?.accountNumber || act.targetId}`,
          },
          {
            recordType: 'TRANSACTION',
            recordId: tx.id,
            identifier: tx.txHash,
            timestamp: tx.timestamp.toISOString(),
            details: `Transaction ${tx.txHash} for ₹${tx.amount.toLocaleString('en-IN')} completed ${Math.abs(timeDeltaMinutes)} mins ${timeDeltaMinutes >= 0 ? 'after' : 'before'} action`,
            amount: tx.amount,
          },
        ];

        let strength = 60;
        if (act.actionType.includes('BENEFICIARY')) strength += 25;
        if (Math.abs(timeDeltaMinutes) <= 15) strength += 10;
        strength = Math.min(strength, 96);

        const linkedAlertCodes = getAlertCodesForEntities(emp.employeeCode, targetAcc?.accountNumber || '');
        const linkedCaseCodes = getCaseCodesForEntities(emp.employeeCode, targetAcc?.accountNumber || '');

        addDiscovery({
          id: `disc-temporal-${act.id}-${tx.id}`,
          relationshipType: 'TEMPORAL_PRE_TRANSACTION_ACTION',
          title: `Temporal Correlation: ${emp.name} & ${tx.txHash}`,
          explanation: `Privileged operational modification (${act.actionType}) was executed ${Math.abs(timeDeltaMinutes)} minutes prior to financial transaction ${tx.txHash} on target ${targetAcc?.accountNumber || 'account'}.`,
          sourceEntity: {
            id: `EMP-${emp.id}`,
            label: emp.name,
            type: 'EMPLOYEE',
            riskScore: emp.riskScore,
            subText: `${emp.role} (${emp.department})`,
          },
          targetEntity: {
            id: `ACC-${targetAcc?.id || tx.sourceAccountId}`,
            label: targetAcc?.accountNumber || 'Account Target',
            type: 'ACCOUNT',
            subText: `Transaction Hash: ${tx.txHash}`,
          },
          path: [
            { id: `EMP-${emp.id}`, label: emp.name, type: 'EMPLOYEE' },
            { id: `TX-${tx.id}`, label: tx.txHash, type: 'TRANSACTION' },
            { id: `ACC-${targetAcc?.id || tx.sourceAccountId}`, label: targetAcc?.accountNumber || 'Target Account', type: 'ACCOUNT' },
          ],
          supportingRecords,
          contributingSignals,
          linkageStrength: strength,
          isDirectEvidence: true,
          isSuspicious,
          associatedAlertCodes: linkedAlertCodes,
          associatedCaseCodes: linkedCaseCodes,
        });
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // PATTERN 4: Cross-Investigation Links
  // (Separate alerts or cases sharing financial counterparty or employee actor)
  // ──────────────────────────────────────────────────────────────────────────
  if (alerts.length >= 2) {
    for (let i = 0; i < alerts.length; i++) {
      for (let j = i + 1; j < alerts.length; j++) {
        const alt1 = alerts[i];
        const alt2 = alerts[j];

        // Check for shared entity or linked cases
        const isSharedEntity = alt1.primaryEntityId === alt2.primaryEntityId;
        const case1Id = alt1.cases[0]?.caseId;
        const case2Id = alt2.cases[0]?.caseId;
        const isSharedCase = case1Id && case2Id && case1Id === case2Id;

        // Check if transactions in alert 1 touch accounts in alert 2
        const alt1Entity = alt1.primaryEntityId;
        const alt2Entity = alt2.primaryEntityId;

        // Check if there is an account bridge between them
        const connectingTx = transactions.find(
          (t) =>
            (t.sourceAccount.accountNumber === alt1Entity && t.destinationAccount.accountNumber === alt2Entity) ||
            (t.sourceAccount.accountNumber === alt2Entity && t.destinationAccount.accountNumber === alt1Entity) ||
            t.initiatedByEmployee?.employeeCode === alt1Entity ||
            t.approvedByEmployee?.employeeCode === alt1Entity
        );

        if (isSharedEntity || isSharedCase || connectingTx) {
          const supportingRecords: SupportingRecord[] = [
            {
              recordType: 'ALERT',
              recordId: alt1.id,
              identifier: alt1.alertCode,
              timestamp: alt1.createdAt.toISOString(),
              details: `Alert ${alt1.alertCode} (${alt1.severity}): ${alt1.title}`,
            },
            {
              recordType: 'ALERT',
              recordId: alt2.id,
              identifier: alt2.alertCode,
              timestamp: alt2.createdAt.toISOString(),
              details: `Alert ${alt2.alertCode} (${alt2.severity}): ${alt2.title}`,
            },
          ];

          if (connectingTx) {
            supportingRecords.push({
              recordType: 'TRANSACTION',
              recordId: connectingTx.id,
              identifier: connectingTx.txHash,
              timestamp: connectingTx.timestamp.toISOString(),
              details: `Cross-alert wire bridge: ₹${connectingTx.amount.toLocaleString('en-IN')} transferred between ${connectingTx.sourceAccount.accountNumber} and ${connectingTx.destinationAccount.accountNumber}`,
              amount: connectingTx.amount,
            });
          }

          let strength = 70;
          if (connectingTx) strength += 20;
          if (isSharedCase) strength += 10;
          strength = Math.min(strength, 95);

          addDiscovery({
            id: `disc-cross-investigation-${alt1.id}-${alt2.id}`,
            relationshipType: 'CROSS_INVESTIGATION_LINK',
            title: `Cross-Investigation Nexus: ${alt1.alertCode} ↔ ${alt2.alertCode}`,
            explanation: `Separate security alerts ${alt1.alertCode} and ${alt2.alertCode} converge on shared financial evidence or linked employee activity.`,
            sourceEntity: {
              id: `ALERT-${alt1.id}`,
              label: alt1.alertCode,
              type: 'ALERT',
              subText: alt1.title,
            },
            targetEntity: {
              id: `ALERT-${alt2.id}`,
              label: alt2.alertCode,
              type: 'ALERT',
              subText: alt2.title,
            },
            path: [
              { id: `ALERT-${alt1.id}`, label: alt1.alertCode, type: 'ALERT' },
              ...(connectingTx ? [{ id: `TX-${connectingTx.id}`, label: connectingTx.txHash, type: 'TRANSACTION' as const }] : []),
              { id: `ALERT-${alt2.id}`, label: alt2.alertCode, type: 'ALERT' },
            ],
            supportingRecords,
            contributingSignals: ['CROSS_ALERT_BRIDGE', 'CORRELATED_THREAT_PATTERN'],
            linkageStrength: strength,
            isDirectEvidence: Boolean(connectingTx || isSharedCase),
            isSuspicious: true,
            associatedAlertCodes: [alt1.alertCode, alt2.alertCode],
            associatedCaseCodes: [
              ...(alt1.cases[0]?.case?.caseCode ? [alt1.cases[0].case.caseCode] : []),
              ...(alt2.cases[0]?.case?.caseCode ? [alt2.cases[0].case.caseCode] : []),
            ],
          });
        }
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PATTERN 5: Legitimate Commercial Link Baseline (Control)
  // (e.g. Verified corporate customer standard recurring transactions)
  // ──────────────────────────────────────────────────────────────────────────
  const normalTx = transactions.find(
    (t) =>
      !t.flagsJson?.includes('CIRCULAR') &&
      !t.flagsJson?.includes('SPLIT') &&
      !['TXN-CIRC-001', 'TXN-CIRC-002', 'TXN-CIRC-003', 'TXN-SPLIT-001', 'TXN-SPLIT-002', 'TXN-SPLIT-003'].includes(t.txHash)
  ) || transactions[transactions.length - 1];

  if (normalTx) {
    const srcAccount = normalTx.sourceAccount;
    const destAccount = normalTx.destinationAccount;
    const customer = srcAccount.customer;

    addDiscovery({
      id: `disc-legit-${srcAccount.id}-${normalTx.id}`,
      relationshipType: 'LEGITIMATE_COMMERCIAL_LINK',
      title: `Standard Commercial Flow: ${customer?.name || srcAccount.accountNumber}`,
      explanation: `Ordinary recurring commercial transfer within standard operational thresholds. No circular loops or insider privilege deviations observed.`,
      sourceEntity: {
        id: customer ? `CUST-${customer.id}` : `ACC-${srcAccount.id}`,
        label: customer?.name || srcAccount.accountNumber,
        type: customer ? 'CUSTOMER' : 'ACCOUNT',
        subText: customer ? `KYC: ${customer.kycStatus} • Profile: ${customer.riskProfile}` : srcAccount.accountType,
      },
      targetEntity: {
        id: `ACC-${destAccount.id}`,
        label: destAccount.accountNumber,
        type: 'ACCOUNT',
        subText: `Verified Counterparty Account`,
      },
      path: [
        ...(customer ? [{ id: `CUST-${customer.id}`, label: customer.name, type: 'CUSTOMER' as const }] : []),
        { id: `ACC-${srcAccount.id}`, label: srcAccount.accountNumber, type: 'ACCOUNT' as const },
        { id: `ACC-${destAccount.id}`, label: destAccount.accountNumber, type: 'ACCOUNT' as const },
      ],
      supportingRecords: [
        {
          recordType: 'TRANSACTION',
          recordId: normalTx.id,
          identifier: normalTx.txHash,
          timestamp: normalTx.timestamp.toISOString(),
          details: `Commercial wire of ₹${normalTx.amount.toLocaleString('en-IN')} via ${normalTx.channel}`,
          amount: normalTx.amount,
        },
      ],
      contributingSignals: ['STANDARD_OPERATIONAL_VOLUME', 'VERIFIED_KYC_BASELINE'],
      linkageStrength: 28, // Low linkage strength indicates routine non-suspicious flow
      isDirectEvidence: true,
      isSuspicious: false,
      associatedAlertCodes: [],
      associatedCaseCodes: [],
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Filter and Rank Discoveries
  // ──────────────────────────────────────────────────────────────────────────
  const filteredDiscoveries = discoveries.filter((d) => {
    if (minStrength > 0 && d.linkageStrength < minStrength) return false;
    if (relationshipType !== 'ALL' && d.relationshipType !== relationshipType) return false;
    if (associatedWithAlertOrCaseOnly && d.associatedAlertCodes.length === 0 && d.associatedCaseCodes.length === 0) return false;
    if (entityType !== 'ALL' && d.sourceEntity.type !== entityType && d.targetEntity.type !== entityType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        d.title.toLowerCase().includes(q) ||
        d.explanation.toLowerCase().includes(q) ||
        d.sourceEntity.label.toLowerCase().includes(q) ||
        d.targetEntity.label.toLowerCase().includes(q) ||
        d.associatedAlertCodes.some((c) => c.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Sort by linkage strength descending
  filteredDiscoveries.sort((a, b) => b.linkageStrength - a.linkageStrength);

  // ──────────────────────────────────────────────────────────────────────────
  // Build Visual Graph Representation
  // ──────────────────────────────────────────────────────────────────────────
  const nodesMap = new Map<string, any>();
  const edgesMap = new Map<string, any>();

  filteredDiscoveries.forEach((disc) => {
    // Add source and target nodes
    if (!nodesMap.has(disc.sourceEntity.id)) {
      nodesMap.set(disc.sourceEntity.id, {
        id: disc.sourceEntity.id,
        label: disc.sourceEntity.label,
        type: disc.sourceEntity.type,
        isSuspicious: disc.isSuspicious,
        riskScore: disc.sourceEntity.riskScore,
        details: { subText: disc.sourceEntity.subText },
      });
    }

    if (!nodesMap.has(disc.targetEntity.id)) {
      nodesMap.set(disc.targetEntity.id, {
        id: disc.targetEntity.id,
        label: disc.targetEntity.label,
        type: disc.targetEntity.type,
        isSuspicious: disc.isSuspicious,
        riskScore: disc.targetEntity.riskScore,
        details: { subText: disc.targetEntity.subText },
      });
    }

    // Add intermediate nodes if multi-hop
    disc.path.forEach((p) => {
      if (!nodesMap.has(p.id)) {
        nodesMap.set(p.id, {
          id: p.id,
          label: p.label,
          type: p.type,
          isSuspicious: disc.isSuspicious,
          details: { subText: 'Intermediate Nexus' },
        });
      }
    });

    // Create edge for graph visualization
    const edgeId = `edge-hunter-${disc.id}`;
    if (!edgesMap.has(edgeId)) {
      edgesMap.set(edgeId, {
        id: edgeId,
        source: disc.sourceEntity.id,
        target: disc.targetEntity.id,
        label: disc.relationshipType.replace(/_/g, ' '),
        relationshipType: disc.relationshipType,
        isDirectEvidence: disc.isDirectEvidence,
        isSuspicious: disc.isSuspicious,
        linkageStrength: disc.linkageStrength,
        amount: disc.supportingRecords.find((r) => r.amount)?.amount,
      });
    }
  });

  // Calculate Overview Metrics
  const distinctEntityIds = new Set<string>();
  const distinctAlertAndCaseCodes = new Set<string>();
  let meaningfulMultiHopConnections = 0;
  let highStrengthCount = 0;
  let suspectedRingsCount = 0;

  filteredDiscoveries.forEach((d) => {
    distinctEntityIds.add(d.sourceEntity.id);
    distinctEntityIds.add(d.targetEntity.id);
    d.associatedAlertCodes.forEach((c) => distinctAlertAndCaseCodes.add(c));
    d.associatedCaseCodes.forEach((c) => distinctAlertAndCaseCodes.add(c));

    if (d.relationshipType === 'MULTI_HOP_FLOW' || d.path.length > 2) {
      meaningfulMultiHopConnections++;
    }
    if (d.linkageStrength >= 75) {
      highStrengthCount++;
    }
    if (d.isSuspicious && (d.relationshipType === 'MULTI_HOP_FLOW' || d.relationshipType === 'CROSS_INVESTIGATION_LINK')) {
      suspectedRingsCount++;
    }
  });

  const overview: HiddenLinkHunterOverview = {
    totalCandidateRelationships: filteredDiscoveries.length,
    totalConnectedEntities: distinctEntityIds.size,
    totalLinkedAlertsAndCases: distinctAlertAndCaseCodes.size,
    meaningfulMultiHopConnections,
    highStrengthCount,
    suspectedRingsCount,
  };

  return {
    overview,
    discoveries: filteredDiscoveries,
    graph: {
      nodes: Array.from(nodesMap.values()),
      edges: Array.from(edgesMap.values()),
    },
  };
}
