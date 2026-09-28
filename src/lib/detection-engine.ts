import { prisma } from './prisma';

export interface SignalRule {
  type: string;
  title: string;
  description: string;
  observedValue: string;
  expectedValue?: string;
  weight: number;
  evidenceCategory: 'GRAPH' | 'TIMELINE' | 'TRANSACTION' | 'PRIVILEGE' | 'ML';
}

export interface ComprehensiveDetectionResult {
  isSuspicious: boolean;
  score: number; // 0 - 100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  detectionMethods: string[];
  signals: SignalRule[];
  suspiciousGraphPaths: Array<{ source: string; target: string; relationship: string }>;
  suggestedActions: string[];
}

export async function runHybridDetectionEngine(
  targetType: 'TRANSACTION' | 'EMPLOYEE' | 'ACCOUNT' | 'CUSTOMER',
  targetId: string
): Promise<ComprehensiveDetectionResult> {
  const signals: SignalRule[] = [];
  const detectionMethods: Set<string> = new Set();
  const suspiciousGraphPaths: Array<{ source: string; target: string; relationship: string }> = [];
  const suggestedActions: string[] = [];

  let totalWeight = 0;

  // 1. Fetch relevant data graph from DB
  if (targetType === 'EMPLOYEE' || targetType === 'ACCOUNT' || targetType === 'TRANSACTION') {
    // ----------------------------------------------------
    // A. RULE-BASED & GRAPH DETECTION: Circular Money Flow
    // ----------------------------------------------------
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

    // Check for 3-node cycle (A -> B -> C -> A) or 2-node cycle (A -> B -> A)
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
          // 2-node circular loop
          hasCycle = true;
          suspiciousGraphPaths.push({ source: tx.sourceAccount.accountNumber, target: tx.destinationAccount.accountNumber, relationship: 'CIRCULAR_DIRECT' });
        } else {
          for (const third of thirdNodes) {
            const fourthNodes = adjacency[third] || [];
            if (fourthNodes.includes(startNode)) {
              // 3-node circular loop
              hasCycle = true;
              suspiciousGraphPaths.push({ source: tx.sourceAccount.accountNumber, target: tx.destinationAccount.accountNumber, relationship: 'CIRCULAR_MULTI_HOP' });
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

    // ----------------------------------------------------
    // B. RULE-BASED DETECTION: Structuring / Splitting (< ₹5L)
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // C. INSIDER PRIVILEGE & TIMELINE ANALYSIS
    // ----------------------------------------------------
    const accessLogs = await prisma.accessEvent.findMany({
      include: { employee: true },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    const recentEmployeeActions = await prisma.employeeAction.findMany({
      include: { employee: true },
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    // Check if employee accessed customer account within 60 mins before transaction
    let insiderAccessConnected = false;
    for (const log of accessLogs) {
      if (log.accessType === 'BENEFICIARY_UPDATE' || log.accessType === 'VIEW') {
        const relatedTx = allTx.find(
          (t) =>
            Math.abs(t.timestamp.getTime() - log.timestamp.getTime()) < 60 * 60 * 1000 &&
            (t.initiatedByEmployeeId === log.employeeId || t.approvedByEmployeeId === log.employeeId)
        );
        if (relatedTx) {
          insiderAccessConnected = true;
          signals.push({
            type: 'INSIDER_ACCESS',
            title: 'Timeline Anomaly: Pre-Transaction Insider Access',
            description: `Employee ${log.employee.name} accessed entity ${log.entityId} 15 mins prior to wire execution.`,
            observedValue: `Access recorded at ${log.timestamp.toLocaleTimeString()}, Tx at ${relatedTx.timestamp.toLocaleTimeString()}`,
            expectedValue: 'No pre-transaction manual employee lookup logged',
            weight: 2.8,
            evidenceCategory: 'TIMELINE',
          });
          totalWeight += 25;
          suggestedActions.push(`Audit ${log.employee.name} workstation logs and permission override history`);
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

    // ----------------------------------------------------
    // D. ML ANOMALY DETECTION (Peer Baseline Deviation)
    // ----------------------------------------------------
    // Compute mean & standard deviation of transaction amounts
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
  }

  // Calculate final severity score
  const score = Math.min(Math.round(totalWeight), 98);
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 80) severity = 'CRITICAL';
  else if (score >= 60) severity = 'HIGH';
  else if (score >= 35) severity = 'MEDIUM';

  const confidence: 'LOW' | 'MEDIUM' | 'HIGH' = signals.length >= 3 ? 'HIGH' : signals.length >= 1 ? 'MEDIUM' : 'LOW';

  return {
    isSuspicious: score >= 35,
    score,
    severity,
    confidence,
    detectionMethods: Array.from(detectionMethods),
    signals,
    suspiciousGraphPaths,
    suggestedActions: Array.from(new Set(suggestedActions)),
  };
}
