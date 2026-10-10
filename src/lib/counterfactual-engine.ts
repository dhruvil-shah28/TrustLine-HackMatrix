import { prisma } from './prisma';
import { SignalRule } from './detection-engine';

export type InterventionType = 'EXCLUDE_RECORD' | 'MODIFY_AMOUNT' | 'MODIFY_TIMESTAMP';

export interface CounterfactualIntervention {
  type: InterventionType;
  recordType: 'TRANSACTION' | 'ACCESS_EVENT' | 'EMPLOYEE_ACTION';
  recordId: string;
  // Parameters for MODIFY_AMOUNT
  newAmount?: number;
  // Parameters for MODIFY_TIMESTAMP
  minuteShift?: number; // e.g. +120 or -120 to shift outside correlation window
  newTimestamp?: string;
  rationale?: string;
}

export interface SimulationEntityOption {
  id: string;
  code: string;
  name: string;
  type: 'EMPLOYEE' | 'ACCOUNT' | 'TRANSACTION' | 'ALERT';
  severity?: string;
  description: string;
}

export interface DirectEvidenceRecord {
  id: string;
  type: 'TRANSACTION' | 'ACCESS_EVENT' | 'EMPLOYEE_ACTION';
  label: string;
  timestamp: string;
  summary: string;
  details: Record<string, any>;
  isExcluded?: boolean;
  isModified?: boolean;
}

export interface CounterfactualComparisonResult {
  intervention: CounterfactualIntervention;
  targetEntity: {
    id: string;
    type: string;
    name?: string;
  };
  baseline: {
    score: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    isSuspicious: boolean;
    signals: SignalRule[];
    detectionMethods: string[];
    recordsCount: number;
  };
  simulated: {
    score: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    isSuspicious: boolean;
    signals: SignalRule[];
    detectionMethods: string[];
    recordsCount: number;
  };
  delta: {
    scoreChange: number; // e.g. -25
    direction: 'INCREASED' | 'DECREASED' | 'UNCHANGED';
    severityChanged: boolean;
    previousSeverity: string;
    newSeverity: string;
    signalsRemoved: SignalRule[];
    signalsAdded: SignalRule[];
    signalsRetained: SignalRule[];
  };
  evidenceDifference: {
    modifiedRecordId: string;
    recordType: string;
    description: string;
    originalAttributes: Record<string, any>;
    simulatedAttributes: Record<string, any>;
  };
  explanation: string;
  engineProvenance: {
    engine: 'TRUSTLINE_DETERMINISTIC_HYBRID_RULES_V1';
    isMachineLearningHeuristic: boolean;
    aiDisclosure: string;
    evaluatedAt: string;
    dbState: 'PRESERVED_IMMUTABLE';
  };
}

/**
 * Pure evaluation function running detection rules in-memory against overlay copies of transactions, access events, and actions.
 * Guarantees zero writes or mutations to PostgreSQL database.
 */
export function evaluateRiskFromDatasets(
  allTx: any[],
  accessLogs: any[],
  recentEmployeeActions: any[]
): {
  score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  isSuspicious: boolean;
  signals: SignalRule[];
  detectionMethods: string[];
  suspiciousGraphPaths: Array<{ source: string; target: string; relationship: string }>;
  suggestedActions: string[];
} {
  const signals: SignalRule[] = [];
  const detectionMethods: Set<string> = new Set();
  const suspiciousGraphPaths: Array<{ source: string; target: string; relationship: string }> = [];
  const suggestedActions: string[] = [];
  let totalWeight = 0;

  // 1. RULE-BASED & GRAPH DETECTION: Circular Money Flow
  const adjacency: Record<string, string[]> = {};
  for (const tx of allTx) {
    const u = tx.sourceAccountId;
    const v = tx.destinationAccountId;
    if (!adjacency[u]) adjacency[u] = [];
    adjacency[u].push(v);
  }

  let hasCycle = false;
  for (const tx of allTx) {
    const startNode = tx.sourceAccountId;
    const nextNodes = adjacency[startNode] || [];
    for (const nextNode of nextNodes) {
      const thirdNodes = adjacency[nextNode] || [];
      if (thirdNodes.includes(startNode)) {
        hasCycle = true;
        const sourceLabel = tx.sourceAccount?.accountNumber || startNode;
        const targetLabel = tx.destinationAccount?.accountNumber || nextNode;
        suspiciousGraphPaths.push({
          source: sourceLabel,
          target: targetLabel,
          relationship: 'CIRCULAR_DIRECT',
        });
      } else {
        for (const third of thirdNodes) {
          const fourthNodes = adjacency[third] || [];
          if (fourthNodes.includes(startNode)) {
            hasCycle = true;
            const sourceLabel = tx.sourceAccount?.accountNumber || startNode;
            const targetLabel = tx.destinationAccount?.accountNumber || nextNode;
            suspiciousGraphPaths.push({
              source: sourceLabel,
              target: targetLabel,
              relationship: 'CIRCULAR_MULTI_HOP',
            });
          }
        }
      }
    }
  }

  if (hasCycle) {
    detectionMethods.add('GRAPH_CIRCULAR');
    signals.push({
      type: 'CIRCULAR_FLOW',
      title: 'Graph Anomaly: Closed Loop Money Routing',
      description: 'Transfers form a closed cycle returning funds back to the originating entity or linked beneficiary.',
      observedValue: 'Closed 2-3 hop loop detected',
      expectedValue: 'Open linear financial distribution',
      weight: 3.5,
      evidenceCategory: 'GRAPH',
    });
    totalWeight += 35;
    suggestedActions.push('Place immediate administrative hold on circular destination accounts');
  }

  // 2. RULE-BASED DETECTION: Structuring / Splitting (< ₹5L)
  const transactionsGrouped: Record<string, typeof allTx> = {};
  for (const tx of allTx) {
    const key = `${tx.sourceAccountId}_${tx.destinationAccountId}`;
    if (!transactionsGrouped[key]) transactionsGrouped[key] = [];
    transactionsGrouped[key].push(tx);
  }

  for (const key in transactionsGrouped) {
    const group = transactionsGrouped[key];
    const sub5L = group.filter((t) => t.amount >= 400000 && t.amount < 500000);
    if (sub5L.length >= 2) {
      detectionMethods.add('RULE_STRUCTURING');
      const sum = sub5L.reduce((acc, curr) => acc + curr.amount, 0);
      signals.push({
        type: 'STRUCTURING',
        title: 'Rule Violation: Transaction Structuring (< ₹5L Threshold)',
        description: `${sub5L.length} transactions executed in close sequence just below mandatory CTR reporting limits.`,
        observedValue: `${sub5L.length} transfers totaling ₹${(sum / 100000).toFixed(2)}L (Avg ₹${(sub5L[0].amount / 100000).toFixed(2)}L)`,
        expectedValue: 'Single consolidated transaction with regulatory CTR report',
        weight: 3.0,
        evidenceCategory: 'TRANSACTION',
      });
      totalWeight += 30;
      suggestedActions.push('File mandatory Suspicious Transaction Report (STR/CTR) with compliance team');
    }
  }

  // 3. INSIDER PRIVILEGE & TIMELINE ANALYSIS
  let insiderAccessConnected = false;
  const loggedInsiderSignal = new Set<string>();
  for (const log of accessLogs) {
    if (log.accessType === 'BENEFICIARY_UPDATE' || log.accessType === 'VIEW') {
      const logTime = new Date(log.timestamp).getTime();
      const relatedTx = allTx.find(
        (t) =>
          Math.abs(new Date(t.timestamp).getTime() - logTime) < 60 * 60 * 1000 &&
          (t.initiatedByEmployeeId === log.employeeId || t.approvedByEmployeeId === log.employeeId)
      );
      if (relatedTx) {
        insiderAccessConnected = true;
        const empName = log.employee?.name || log.employeeId || 'Employee';
        signals.push({
          type: 'INSIDER_ACCESS',
          title: `Timeline Anomaly: Pre-Transaction ${log.accessType} Access`,
          description: `Employee ${empName} accessed entity ${log.entityId} shortly prior to transaction ${relatedTx.txHash}.`,
          observedValue: `Access recorded at ${new Date(log.timestamp).toLocaleTimeString()}, Tx at ${new Date(relatedTx.timestamp).toLocaleTimeString()}`,
          expectedValue: 'No pre-transaction manual employee lookup logged within 60 mins',
          weight: 2.8,
          evidenceCategory: 'TIMELINE',
        });
        totalWeight += 25;
        suggestedActions.push(`Audit ${empName} workstation logs and permission override history`);
      }
    }
  }

  if (recentEmployeeActions.some((a) => a.actionType === 'BENEFICIARY_CHANGE')) {
    signals.push({
      type: 'BENEFICIARY_CHANGE',
      title: 'Privilege Anomaly: Recent Beneficiary Record Modification',
      description: 'Account beneficiary details were modified shortly prior to high-value outbound transfer.',
      observedValue: 'Beneficiary change logged within 1 hour of transfer',
      expectedValue: 'Beneficiary profile unchanged > 30 days',
      weight: 2.5,
      evidenceCategory: 'PRIVILEGE',
    });
    totalWeight += 20;
  }

  // 4. ML / PEER BASELINE DEVIATION (Z-Score Outlier Heuristic)
  const amounts = allTx.map((t) => t.amount);
  const mean = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 100000;
  const variance = amounts.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / (amounts.length || 1);
  const stdDev = Math.sqrt(variance) || 50000;

  const maxTx = allTx[0];
  if (maxTx) {
    const zScore = (maxTx.amount - mean) / stdDev;
    if (zScore > 2.5) {
      detectionMethods.add('ML_ANOMALY');
      signals.push({
        type: 'BASELINE_DEVIATION',
        title: 'ML Anomaly: Transaction Amount Z-Score Outlier',
        description: `Transaction amount ₹${(maxTx.amount / 100000).toFixed(2)}L severely deviates from historical peer baseline.`,
        observedValue: `Z-Score = +${zScore.toFixed(2)} standard deviations`,
        expectedValue: 'Z-Score <= +1.5 standard deviations',
        weight: 2.2,
        evidenceCategory: 'ML',
      });
      totalWeight += 20;
    }
  }

  if (insiderAccessConnected) {
    detectionMethods.add('INSIDER_TIMELINE');
    detectionMethods.add('HYBRID_CONNECTED_ANOMALY');
  }

  // Proportional composite score calculation:
  // With 2 insider events, circular flow, structuring, beneficiary change, and ML z-score,
  // the maximum possible cumulative signal weight is 180.
  // Normalizing by 180 guarantees that any deactivated signal directly reduces the composite score.
  const score = totalWeight > 0 ? Math.min(Math.round((totalWeight / 180) * 100), 98) : 0;
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 65) severity = 'CRITICAL';
  else if (score >= 45) severity = 'HIGH';
  else if (score >= 20) severity = 'MEDIUM';

  const confidence: 'LOW' | 'MEDIUM' | 'HIGH' =
    signals.length >= 3 ? 'HIGH' : signals.length >= 1 ? 'MEDIUM' : 'LOW';

  return {
    score,
    severity,
    confidence,
    isSuspicious: score >= 35,
    signals,
    detectionMethods: Array.from(detectionMethods),
    suspiciousGraphPaths,
    suggestedActions: Array.from(new Set(suggestedActions)),
  };
}

/**
 * Loads baseline investigation evidence from PostgreSQL.
 */
export async function loadBaselineEvidence(targetType: string, targetId: string) {
  // If targetType is ALERT, find the alert first
  let resolvedTargetType = targetType;
  let resolvedTargetId = targetId;

  if (targetType === 'ALERT') {
    const alert = await prisma.alert.findUnique({
      where: { id: targetId },
    });
    if (alert) {
      resolvedTargetType = alert.primaryEntityType;
      resolvedTargetId = alert.primaryEntityId;
    }
  }

  const allTx = await prisma.transaction.findMany({
    include: {
      sourceAccount: { include: { customer: true } },
      destinationAccount: { include: { customer: true } },
      initiatedByEmployee: true,
      approvedByEmployee: true,
    },
    orderBy: { timestamp: 'desc' },
    take: 100,
  });

  const accessLogs = await prisma.accessEvent.findMany({
    include: { employee: true },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  const employeeActions = await prisma.employeeAction.findMany({
    include: { employee: true },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  return {
    resolvedTargetType,
    resolvedTargetId,
    allTx,
    accessLogs,
    employeeActions,
  };
}

/**
 * Executes a deterministic counterfactual simulation.
 * Applies the requested intervention onto an in-memory deep copy of evidence and re-evaluates.
 */
export async function runCounterfactualSimulation(params: {
  targetType: 'ALERT' | 'EMPLOYEE' | 'ACCOUNT' | 'TRANSACTION';
  targetId: string;
  intervention: CounterfactualIntervention;
}): Promise<CounterfactualComparisonResult> {
  const { targetType, targetId, intervention } = params;

  // 1. Load baseline evidence directly from DB (Read-Only)
  const { resolvedTargetType, resolvedTargetId, allTx, accessLogs, employeeActions } =
    await loadBaselineEvidence(targetType, targetId);

  // 2. Evaluate Baseline Risk
  const baselineEval = evaluateRiskFromDatasets(allTx, accessLogs, employeeActions);

  // 3. Create isolated in-memory deep copy of evidence
  let simTx = allTx.map((t) => ({ ...t }));
  let simAccess = accessLogs.map((a) => ({ ...a }));
  let simActions = employeeActions.map((e) => ({ ...e }));

  let originalAttributes: Record<string, any> = {};
  let simulatedAttributes: Record<string, any> = {};
  let interventionDescription = '';

  // 4. Apply Counterfactual Transformation
  if (intervention.type === 'EXCLUDE_RECORD') {
    if (intervention.recordType === 'TRANSACTION') {
      const match = simTx.find((t) => t.id === intervention.recordId || t.txHash === intervention.recordId);
      if (!match) {
        throw new Error(`Transaction with ID or hash '${intervention.recordId}' not found in active evidence set.`);
      }
      originalAttributes = { id: match.id, txHash: match.txHash, amount: match.amount, status: 'INCLUDED' };
      simulatedAttributes = { id: match.id, txHash: match.txHash, amount: match.amount, status: 'EXCLUDED' };
      simTx = simTx.filter((t) => t.id !== match.id && t.txHash !== match.txHash);
      interventionDescription = `Counterfactual exclusion: Transaction ${match.txHash} (₹${match.amount.toLocaleString('en-IN')}) was removed from the simulated financial timeline.`;
    } else if (intervention.recordType === 'ACCESS_EVENT') {
      const match = simAccess.find((a) => a.id === intervention.recordId);
      if (!match) {
        throw new Error(`AccessEvent '${intervention.recordId}' not found in active evidence set.`);
      }
      originalAttributes = { id: match.id, accessType: match.accessType, employeeId: match.employeeId, status: 'INCLUDED' };
      simulatedAttributes = { id: match.id, accessType: match.accessType, employeeId: match.employeeId, status: 'EXCLUDED' };
      simAccess = simAccess.filter((a) => a.id !== match.id);
      interventionDescription = `Counterfactual exclusion: Access record (${match.accessType} on ${match.entityType} ${match.entityId}) was removed from the simulated access audit logs.`;
    } else if (intervention.recordType === 'EMPLOYEE_ACTION') {
      const match = simActions.find((a) => a.id === intervention.recordId);
      if (!match) {
        throw new Error(`EmployeeAction '${intervention.recordId}' not found in active evidence set.`);
      }
      originalAttributes = { id: match.id, actionType: match.actionType, employeeId: match.employeeId, status: 'INCLUDED' };
      simulatedAttributes = { id: match.id, actionType: match.actionType, employeeId: match.employeeId, status: 'EXCLUDED' };
      simActions = simActions.filter((a) => a.id !== match.id);
      interventionDescription = `Counterfactual exclusion: Administrative action (${match.actionType} by ${match.employeeId}) was removed from the simulated timeline.`;
    }
  } else if (intervention.type === 'MODIFY_AMOUNT') {
    if (intervention.recordType !== 'TRANSACTION') {
      throw new Error('MODIFY_AMOUNT transformation is only supported on TRANSACTION records.');
    }
    const matchIndex = simTx.findIndex((t) => t.id === intervention.recordId || t.txHash === intervention.recordId);
    if (matchIndex === -1) {
      throw new Error(`Transaction '${intervention.recordId}' not found in active evidence set.`);
    }
    if (intervention.newAmount === undefined || isNaN(intervention.newAmount) || intervention.newAmount <= 0) {
      throw new Error('A valid, positive new transaction amount must be provided for MODIFY_AMOUNT.');
    }

    const originalTx = simTx[matchIndex];
    originalAttributes = { txHash: originalTx.txHash, amount: originalTx.amount };
    simulatedAttributes = { txHash: originalTx.txHash, amount: intervention.newAmount };

    // Apply amount adjustment in-memory
    simTx[matchIndex] = {
      ...originalTx,
      amount: intervention.newAmount,
    };
    interventionDescription = `Counterfactual amount modification: Transaction ${originalTx.txHash} value adjusted from ₹${originalTx.amount.toLocaleString('en-IN')} to ₹${intervention.newAmount.toLocaleString('en-IN')}.`;
  } else if (intervention.type === 'MODIFY_TIMESTAMP') {
    if (intervention.recordType === 'ACCESS_EVENT') {
      const matchIndex = simAccess.findIndex((a) => a.id === intervention.recordId);
      if (matchIndex === -1) {
        throw new Error(`AccessEvent '${intervention.recordId}' not found in active evidence set.`);
      }
      const originalAccess = simAccess[matchIndex];
      const origDate = new Date(originalAccess.timestamp);
      const shiftMinutes = intervention.minuteShift || 120;
      const newDate = new Date(origDate.getTime() + shiftMinutes * 60 * 1000);

      originalAttributes = { id: originalAccess.id, timestamp: origDate.toISOString() };
      simulatedAttributes = { id: originalAccess.id, timestamp: newDate.toISOString(), shiftMinutes };

      simAccess[matchIndex] = {
        ...originalAccess,
        timestamp: newDate,
      };
      interventionDescription = `Counterfactual temporal shift: Access event shifted by ${shiftMinutes > 0 ? '+' : ''}${shiftMinutes} minutes (${origDate.toLocaleTimeString()} -> ${newDate.toLocaleTimeString()}) relative to wire execution.`;
    } else if (intervention.recordType === 'TRANSACTION') {
      const matchIndex = simTx.findIndex((t) => t.id === intervention.recordId || t.txHash === intervention.recordId);
      if (matchIndex === -1) {
        throw new Error(`Transaction '${intervention.recordId}' not found in active evidence set.`);
      }
      const originalTx = simTx[matchIndex];
      const origDate = new Date(originalTx.timestamp);
      const shiftMinutes = intervention.minuteShift || 120;
      const newDate = new Date(origDate.getTime() + shiftMinutes * 60 * 1000);

      originalAttributes = { txHash: originalTx.txHash, timestamp: origDate.toISOString() };
      simulatedAttributes = { txHash: originalTx.txHash, timestamp: newDate.toISOString(), shiftMinutes };

      simTx[matchIndex] = {
        ...originalTx,
        timestamp: newDate,
      };
      interventionDescription = `Counterfactual temporal shift: Transaction ${originalTx.txHash} timestamp shifted by ${shiftMinutes > 0 ? '+' : ''}${shiftMinutes} minutes.`;
    } else {
      throw new Error(`MODIFY_TIMESTAMP is not currently supported for recordType: ${intervention.recordType}`);
    }
  } else {
    throw new Error(`Unsupported counterfactual intervention type: ${(intervention as any).type}`);
  }

  // 5. Evaluate Simulated Risk with overlay
  const simEval = evaluateRiskFromDatasets(simTx, simAccess, simActions);

  // 6. Compute Differences & Delta
  const scoreChange = simEval.score - baselineEval.score;
  const direction: 'INCREASED' | 'DECREASED' | 'UNCHANGED' =
    scoreChange > 0 ? 'INCREASED' : scoreChange < 0 ? 'DECREASED' : 'UNCHANGED';

  const signalsRemoved = baselineEval.signals.filter(
    (b) => !simEval.signals.some((s) => s.type === b.type)
  );
  const signalsAdded = simEval.signals.filter(
    (s) => !baselineEval.signals.some((b) => b.type === s.type)
  );
  const signalsRetained = simEval.signals.filter((s) =>
    baselineEval.signals.some((b) => b.type === s.type)
  );

  // 7. Generate Natural-Language Forensic Explanation
  let explanation = '';
  if (scoreChange === 0 && signalsRemoved.length === 0 && signalsAdded.length === 0) {
    explanation = `The counterfactual intervention (${intervention.type}) had no measurable impact on the overall risk posture. All existing detection thresholds and graph topologies remained unchanged at score ${baselineEval.score} (${baselineEval.severity}).`;
  } else {
    const changeDirText = scoreChange < 0 ? 'reduced' : 'elevated';
    explanation = `The simulated intervention ${changeDirText} the composite risk assessment from ${baselineEval.score} (${baselineEval.severity}) to ${simEval.score} (${simEval.severity}), resulting in a net delta of ${scoreChange > 0 ? '+' : ''}${scoreChange} points. `;

    if (signalsRemoved.length > 0) {
      explanation += `Specifically, ${signalsRemoved.length} detection signal(s) were deactivated: [${signalsRemoved.map((s) => s.title).join(', ')}]. `;
    }
    if (signalsAdded.length > 0) {
      explanation += `Additionally, ${signalsAdded.length} new signal(s) were triggered: [${signalsAdded.map((s) => s.title).join(', ')}]. `;
    }
    explanation += `Evidence responsible: ${interventionDescription}`;
  }

  return {
    intervention,
    targetEntity: {
      id: resolvedTargetId,
      type: resolvedTargetType,
    },
    baseline: {
      score: baselineEval.score,
      severity: baselineEval.severity,
      confidence: baselineEval.confidence,
      isSuspicious: baselineEval.isSuspicious,
      signals: baselineEval.signals,
      detectionMethods: baselineEval.detectionMethods,
      recordsCount: allTx.length + accessLogs.length + employeeActions.length,
    },
    simulated: {
      score: simEval.score,
      severity: simEval.severity,
      confidence: simEval.confidence,
      isSuspicious: simEval.isSuspicious,
      signals: simEval.signals,
      detectionMethods: simEval.detectionMethods,
      recordsCount: simTx.length + simAccess.length + simActions.length,
    },
    delta: {
      scoreChange,
      direction,
      severityChanged: baselineEval.severity !== simEval.severity,
      previousSeverity: baselineEval.severity,
      newSeverity: simEval.severity,
      signalsRemoved,
      signalsAdded,
      signalsRetained,
    },
    evidenceDifference: {
      modifiedRecordId: intervention.recordId,
      recordType: intervention.recordType,
      description: interventionDescription,
      originalAttributes,
      simulatedAttributes,
    },
    explanation,
    engineProvenance: {
      engine: 'TRUSTLINE_DETERMINISTIC_HYBRID_RULES_V1',
      isMachineLearningHeuristic: false,
      aiDisclosure:
        'Deterministic rule and topological graph evaluation engine. Z-Score baseline deviation represents statistical peer dispersion heuristic, not deep learning.',
      evaluatedAt: new Date().toISOString(),
      dbState: 'PRESERVED_IMMUTABLE',
    },
  };
}

/**
 * Returns available investigations (Alerts) and their associated baseline evidence items for investigator selection.
 */
export async function getCounterfactualCatalog() {
  const alerts = await prisma.alert.findMany({
    include: {
      signals: true,
      cases: { include: { case: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const transactions = await prisma.transaction.findMany({
    take: 30,
    orderBy: { timestamp: 'desc' },
    include: {
      sourceAccount: true,
      destinationAccount: true,
      initiatedByEmployee: true,
    },
  });

  const accessEvents = await prisma.accessEvent.findMany({
    take: 20,
    orderBy: { timestamp: 'desc' },
    include: {
      employee: true,
    },
  });

  const employeeActions = await prisma.employeeAction.findMany({
    take: 20,
    orderBy: { timestamp: 'desc' },
    include: {
      employee: true,
    },
  });

  return {
    alerts: alerts.map((a) => ({
      id: a.id,
      code: a.alertCode,
      title: a.title,
      severity: a.severity,
      summary: a.summary,
      primaryEntityType: a.primaryEntityType,
      primaryEntityId: a.primaryEntityId,
      financialExposure: a.financialExposure,
      scenarioName: a.scenarioName,
      signalsCount: a.signals.length,
    })),
    evidenceInventory: {
      transactions: transactions.map((t) => ({
        id: t.id,
        txHash: t.txHash,
        amount: t.amount,
        source: t.sourceAccount.accountNumber,
        destination: t.destinationAccount.accountNumber,
        timestamp: t.timestamp.toISOString(),
        initiatedBy: t.initiatedByEmployee?.name || 'Automated NetBanking',
      })),
      accessEvents: accessEvents.map((ae) => ({
        id: ae.id,
        employeeName: ae.employee.name,
        employeeCode: ae.employee.employeeCode,
        accessType: ae.accessType,
        entityType: ae.entityType,
        entityId: ae.entityId,
        timestamp: ae.timestamp.toISOString(),
        ipAddress: ae.ipAddress,
      })),
      employeeActions: employeeActions.map((ea) => ({
        id: ea.id,
        employeeName: ea.employee.name,
        actionType: ea.actionType,
        targetType: ea.targetType,
        targetId: ea.targetId,
        detailsJson: ea.detailsJson,
        timestamp: ea.timestamp.toISOString(),
      })),
    },
  };
}
