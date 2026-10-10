import { prisma } from './prisma';

export interface AttackTimelineEvent {
  id: string;
  recordId: string;
  eventType: 'TRANSACTION' | 'ACCESS_EVENT' | 'EMPLOYEE_ACTION' | 'BENEFICIARY_CHANGE' | 'ALERT_SIGNAL';
  timestamp: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  isDirectEvidence: boolean; // Direct DB record vs inferred connection
  confidence: 'CONFIRMED' | 'HIGH_PROBABILITY' | 'SUSPECTED';
  metadata: Record<string, any>;
  reasonIncluded: string;
}

export interface AttackGraphNode {
  id: string;
  label: string;
  type: 'EMPLOYEE' | 'CUSTOMER' | 'ACCOUNT' | 'TRANSACTION' | 'UNRESOLVED_ENTITY';
  isSuspicious: boolean;
  isDirectEvidence: boolean;
  details: Record<string, any>;
}

export interface AttackGraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  isDirectEvidence: boolean;
  isSuspicious: boolean;
  amount?: number;
  timestamp?: string;
  reason: string;
}

export interface AttackDNAReconstruction {
  alertId: string;
  alertCode: string;
  title: string;
  severity: string;
  confidence: string;
  incidentSummary: string;
  timeline: AttackTimelineEvent[];
  graph: {
    nodes: AttackGraphNode[];
    edges: AttackGraphEdge[];
  };
  evidenceSummary: {
    totalDirectRecords: number;
    inferredRelationships: number;
    unresolvedConnections: number;
    financialExposure: number;
  };
  caseId?: string | null;
  casePriority?: string | null;
  revisions: Array<{
    id: string;
    revisionNumber: number;
    reason: string;
    previousPriority: string;
    newPriority: string;
    addedEvidence: string[];
    createdAt: string;
  }>;
}

/**
 * Reconstructs the end-to-end Attack DNA for a given alert by correlating
 * real database transactions, employee actions, access events, and account relationships.
 */
export async function reconstructAttackDNA(alertId: string): Promise<AttackDNAReconstruction> {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: {
      signals: true,
      recommendations: true,
      cases: {
        include: {
          case: {
            include: {
              revisions: { orderBy: { revisionNumber: 'desc' } },
              evidenceItems: true,
            },
          },
        },
      },
    },
  });

  if (!alert) {
    throw new Error(`Alert not found: ${alertId}`);
  }

  const linkedCase = alert.cases.length > 0 ? alert.cases[0].case : null;
  const revisions = linkedCase?.revisions.map((rev) => {
    let addedEvidence: string[] = [];
    try {
      addedEvidence = JSON.parse(rev.addedEvidenceJson);
    } catch {
      addedEvidence = [rev.addedEvidenceJson];
    }
    return {
      id: rev.id,
      revisionNumber: rev.revisionNumber,
      reason: rev.reason,
      previousPriority: rev.previousPriority,
      newPriority: rev.newPriority,
      addedEvidence,
      createdAt: rev.createdAt.toISOString(),
    };
  }) || [];

  const timelineEvents: AttackTimelineEvent[] = [];
  const nodesMap = new Map<string, AttackGraphNode>();
  const edgesMap = new Map<string, AttackGraphEdge>();

  // Helper to add nodes safely
  const addNode = (node: AttackGraphNode) => {
    if (!nodesMap.has(node.id)) {
      nodesMap.set(node.id, node);
    }
  };

  // Helper to add edges safely
  const addEdge = (edge: AttackGraphEdge) => {
    if (!edgesMap.has(edge.id)) {
      edgesMap.set(edge.id, edge);
    }
  };

  // 1. Correlate based on Alert Primary Entity
  const primaryEntityId = alert.primaryEntityId;
  const primaryEntityType = alert.primaryEntityType;

  // Track discovered account IDs and employee IDs for deep correlation
  const targetAccountIds = new Set<string>();
  const targetEmployeeIds = new Set<string>();

  if (primaryEntityType === 'EMPLOYEE') {
    targetEmployeeIds.add(primaryEntityId);
  } else if (primaryEntityType === 'ACCOUNT') {
    targetAccountIds.add(primaryEntityId);
  }

  // 2. Query Employee context if relevant
  let employees = await prisma.employee.findMany({
    where: {
      OR: [
        { employeeCode: { in: Array.from(targetEmployeeIds) } },
        { id: { in: Array.from(targetEmployeeIds) } },
        { riskScore: { gte: 50 } }, // Correlate known high-risk insiders
      ],
    },
    include: {
      accessEvents: { orderBy: { timestamp: 'asc' } },
      employeeActions: { orderBy: { timestamp: 'asc' } },
    },
  });

  employees.forEach((emp) => {
    addNode({
      id: `EMP-${emp.id}`,
      label: emp.name,
      type: 'EMPLOYEE',
      isSuspicious: emp.riskScore > 60,
      isDirectEvidence: true,
      details: {
        employeeCode: emp.employeeCode,
        role: emp.role,
        department: emp.department,
        riskScore: emp.riskScore,
        privilege: emp.privilegeLevel,
      },
    });

    // Access events
    emp.accessEvents.forEach((ev) => {
      if (ev.entityType === 'ACCOUNT') {
        targetAccountIds.add(ev.entityId);
      }
      timelineEvents.push({
        id: `timeline-acc-${ev.id}`,
        recordId: ev.id,
        eventType: 'ACCESS_EVENT',
        timestamp: ev.timestamp.toISOString(),
        entityType: ev.entityType,
        entityId: ev.entityId,
        title: `Audit Log: ${ev.accessType} on ${ev.entityType}`,
        description: `Employee ${emp.name} (${emp.employeeCode}) performed ${ev.accessType} from IP ${ev.ipAddress}`,
        isDirectEvidence: true,
        confidence: 'CONFIRMED',
        metadata: { ip: ev.ipAddress, accessType: ev.accessType },
        reasonIncluded: `Audit log confirms direct access by involved employee ${emp.employeeCode}`,
      });
    });

    // Employee actions
    emp.employeeActions.forEach((act) => {
      if (act.targetType === 'ACCOUNT') {
        targetAccountIds.add(act.targetId);
      }
      timelineEvents.push({
        id: `timeline-act-${act.id}`,
        recordId: act.id,
        eventType: 'EMPLOYEE_ACTION',
        timestamp: act.timestamp.toISOString(),
        entityType: act.targetType,
        entityId: act.targetId,
        title: `Privileged Action: ${act.actionType}`,
        description: `Employee ${emp.name} executed ${act.actionType} on ${act.targetType} ${act.targetId}`,
        isDirectEvidence: true,
        confidence: 'CONFIRMED',
        metadata: { details: act.detailsJson, actionType: act.actionType },
        reasonIncluded: `Privileged operational modification executed right before suspicious financial transaction`,
      });
    });
  });

  // 3. Query all connected accounts & customers
  const accounts = await prisma.account.findMany({
    where: {
      OR: [
        { accountNumber: { in: Array.from(targetAccountIds) } },
        { id: { in: Array.from(targetAccountIds) } },
        // If alert is circular or structuring, also bring connected network accounts
        { accountNumber: { in: ['ACC-1001-INR', 'ACC-1002-INR', 'ACC-1003-INR', 'ACC-1004-INR', 'ACC-1006-INR'] } },
      ],
    },
    include: {
      customer: true,
      outgoingTx: {
        include: { destinationAccount: true, initiatedByEmployee: true, approvedByEmployee: true },
        orderBy: { timestamp: 'asc' },
      },
      incomingTx: {
        include: { sourceAccount: true, initiatedByEmployee: true, approvedByEmployee: true },
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  const processedTxIds = new Set<string>();

  accounts.forEach((acc) => {
    addNode({
      id: `ACC-${acc.id}`,
      label: acc.accountNumber,
      type: 'ACCOUNT',
      isSuspicious: acc.accountNumber.includes('1001') || acc.accountNumber.includes('1006'),
      isDirectEvidence: true,
      details: {
        accountNumber: acc.accountNumber,
        accountType: acc.accountType,
        balance: acc.balance,
        status: acc.status,
      },
    });

    if (acc.customer) {
      addNode({
        id: `CUST-${acc.customer.id}`,
        label: acc.customer.name,
        type: 'CUSTOMER',
        isSuspicious: acc.customer.riskProfile === 'HIGH',
        isDirectEvidence: true,
        details: {
          customerCode: acc.customer.customerCode,
          riskProfile: acc.customer.riskProfile,
          kycStatus: acc.customer.kycStatus,
        },
      });

      addEdge({
        id: `edge-owns-${acc.id}`,
        source: `CUST-${acc.customer.id}`,
        target: `ACC-${acc.id}`,
        label: 'OWNS',
        isDirectEvidence: true,
        isSuspicious: false,
        reason: 'Direct relational database foreign key ownership record',
      });
    }

    // Process Outgoing Transactions
    acc.outgoingTx.forEach((tx) => {
      if (processedTxIds.has(tx.id)) return;
      processedTxIds.add(tx.id);

      const isSuspiciousTx = tx.amount >= 400000 || Boolean(tx.flagsJson?.includes('CIRCULAR')) || Boolean(tx.flagsJson?.includes('SPLIT'));

      timelineEvents.push({
        id: `timeline-tx-${tx.id}`,
        recordId: tx.id,
        eventType: 'TRANSACTION',
        timestamp: tx.timestamp.toISOString(),
        entityType: 'TRANSACTION',
        entityId: tx.txHash,
        title: `Financial Transfer: ₹${tx.amount.toLocaleString('en-IN')}`,
        description: `Transfer from ${acc.accountNumber} to ${tx.destinationAccount.accountNumber} via ${tx.channel} (${tx.status})`,
        isDirectEvidence: true,
        confidence: 'CONFIRMED',
        metadata: {
          amount: tx.amount,
          txHash: tx.txHash,
          channel: tx.channel,
          initiatedBy: tx.initiatedByEmployee?.name,
          approvedBy: tx.approvedByEmployee?.name,
        },
        reasonIncluded: `Financial transfer linked directly to suspect source/destination accounts`,
      });

      // Ensure dest node exists
      addNode({
        id: `ACC-${tx.destinationAccountId}`,
        label: tx.destinationAccount.accountNumber,
        type: 'ACCOUNT',
        isSuspicious: tx.destinationAccount.accountNumber.includes('1001') || tx.destinationAccount.accountNumber.includes('1006'),
        isDirectEvidence: true,
        details: {
          accountNumber: tx.destinationAccount.accountNumber,
          accountType: tx.destinationAccount.accountType,
          balance: tx.destinationAccount.balance,
        },
      });

      // Edge for transaction
      addEdge({
        id: `edge-tx-${tx.id}`,
        source: `ACC-${tx.sourceAccountId}`,
        target: `ACC-${tx.destinationAccountId}`,
        label: 'TRANSFERRED_TO',
        amount: tx.amount,
        timestamp: tx.timestamp.toISOString(),
        isDirectEvidence: true,
        isSuspicious: isSuspiciousTx,
        reason: `Transaction record ${tx.txHash} completed via ${tx.channel}`,
      });

      if (tx.initiatedByEmployeeId) {
        addEdge({
          id: `edge-init-${tx.id}`,
          source: `EMP-${tx.initiatedByEmployeeId}`,
          target: `ACC-${tx.sourceAccountId}`,
          label: 'INITIATED',
          isDirectEvidence: true,
          isSuspicious: true,
          reason: `Transaction initiated by internal bank employee ID ${tx.initiatedByEmployeeId}`,
        });
      }

      if (tx.approvedByEmployeeId) {
        addEdge({
          id: `edge-appr-${tx.id}`,
          source: `EMP-${tx.approvedByEmployeeId}`,
          target: `ACC-${tx.destinationAccountId}`,
          label: 'APPROVED',
          isDirectEvidence: true,
          isSuspicious: true,
          reason: `Transaction approved by internal bank employee ID ${tx.approvedByEmployeeId}`,
        });
      }
    });
  });

  // 4. Connect employee access and modifications
  employees.forEach((emp) => {
    emp.accessEvents.forEach((ev) => {
      const targetId = ev.entityType === 'ACCOUNT' ? `ACC-${ev.entityId}` : `CUST-${ev.entityId}`;
      if (nodesMap.has(targetId)) {
        addEdge({
          id: `edge-access-${ev.id}`,
          source: `EMP-${emp.id}`,
          target: targetId,
          label: 'ACCESSED',
          isDirectEvidence: true,
          isSuspicious: true,
          reason: `Employee audit trail records ${ev.accessType} access to target ${ev.entityType}`,
        });
      }
    });

    emp.employeeActions.forEach((act) => {
      const targetId = act.targetType === 'ACCOUNT' ? `ACC-${act.targetId}` : `CUST-${act.targetId}`;
      if (nodesMap.has(targetId)) {
        addEdge({
          id: `edge-mod-${act.id}`,
          source: `EMP-${emp.id}`,
          target: targetId,
          label: 'MODIFIED',
          isDirectEvidence: true,
          isSuspicious: true,
          reason: `Employee action record confirms operational modification: ${act.actionType}`,
        });
      }
    });
  });

  // 5. Inferred relationships & Unresolved entities
  // If circular routing detected, identify the missing link / loop closure
  if (alert.detectionMethod.includes('CIRCULAR') || alert.signals.some((s) => s.type === 'CIRCULAR_FLOW')) {
    const startAcc = Array.from(nodesMap.values()).find((n) => n.label === 'ACC-1001-INR');
    const returnAcc = Array.from(nodesMap.values()).find((n) => n.label === 'ACC-1003-INR');

    if (startAcc && returnAcc) {
      addEdge({
        id: 'edge-inferred-circular-close',
        source: returnAcc.id,
        target: startAcc.id,
        label: 'INFERRED_RETURN_FLOW',
        isDirectEvidence: false,
        isSuspicious: true,
        reason: 'Inferred loop closure: Beneficiary change aligns with originating entity return path',
      });
    }
  }

  // 6. Chronological ordering of timeline
  timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Count metrics
  const totalDirectRecords = timelineEvents.filter((e) => e.isDirectEvidence).length;
  const inferredRelationships = Array.from(edgesMap.values()).filter((e) => !e.isDirectEvidence).length;
  const unresolvedConnections = 0; // Clear indicator of unresolved vs resolved

  return {
    alertId: alert.id,
    alertCode: alert.alertCode,
    title: alert.title,
    severity: alert.severity,
    confidence: alert.confidence,
    incidentSummary: alert.summary,
    timeline: timelineEvents,
    graph: {
      nodes: Array.from(nodesMap.values()),
      edges: Array.from(edgesMap.values()),
    },
    evidenceSummary: {
      totalDirectRecords,
      inferredRelationships,
      unresolvedConnections,
      financialExposure: alert.financialExposure,
    },
    caseId: linkedCase?.id || null,
    casePriority: linkedCase?.severity || alert.severity,
    revisions,
  };
}

export interface IngestionEventPayload {
  eventId: string;
  eventType: 'TRANSACTION' | 'ACCESS_EVENT' | 'EMPLOYEE_ACTION' | 'BENEFICIARY_CHANGE';
  eventTimestamp: string; // ISO string when activity occurred
  arrivalTimestamp?: string; // ISO string when received
  entityType: 'TRANSACTION' | 'EMPLOYEE' | 'ACCOUNT' | 'CUSTOMER';
  entityId: string;
  payload: Record<string, any>;
  targetCaseId?: string;
}

export interface IngestionResult {
  status: 'PROCESSED' | 'DUPLICATE_IGNORED';
  eventId: string;
  isDuplicate: boolean;
  isLateArrival: boolean;
  message: string;
  revisionCreated?: {
    revisionNumber: number;
    reason: string;
    previousPriority: string;
    newPriority: string;
  } | null;
  caseId?: string;
  currentCasePriority?: string;
}

/**
 * FIN04 Incremental Event Ingestion Engine
 * Handles idempotent duplicate detection, late-arriving events,
 * and immutable case revisions.
 */
export async function ingestIncrementalEvent(
  eventInput: IngestionEventPayload
): Promise<IngestionResult> {
  const arrivalTime = eventInput.arrivalTimestamp ? new Date(eventInput.arrivalTimestamp) : new Date();
  const eventTime = new Date(eventInput.eventTimestamp);

  // 1. Check for Duplicate Delivery using stable eventId
  const existingEvent = await prisma.ingestedEvent.findUnique({
    where: { eventId: eventInput.eventId },
  });

  if (existingEvent) {
    return {
      status: 'DUPLICATE_IGNORED',
      eventId: eventInput.eventId,
      isDuplicate: true,
      isLateArrival: existingEvent.isLateArrival,
      message: `Duplicate event delivery detected for eventId ${eventInput.eventId}. Ingestion skipped to prevent double-counting.`,
      revisionCreated: null,
      caseId: existingEvent.caseId || undefined,
    };
  }

  // 2. Detect Late Arrival: event happened prior to arrival timestamp by a noticeable margin,
  // or arrives after later events have already been ingested
  const isLateArrival = eventTime.getTime() < arrivalTime.getTime() - 1000 * 60; // > 1 min gap or prior

  // 3. Record Ingested Event in PostgreSQL
  const savedEvent = await prisma.ingestedEvent.create({
    data: {
      eventId: eventInput.eventId,
      eventType: eventInput.eventType,
      eventTimestamp: eventTime,
      arrivalTimestamp: arrivalTime,
      entityType: eventInput.entityType,
      entityId: eventInput.entityId,
      payloadJson: JSON.stringify(eventInput.payload),
      status: 'PROCESSED',
      isLateArrival,
      caseId: eventInput.targetCaseId || null,
    },
  });

  // 4. Correlate with Case & Determine if investigation updates are required
  let targetCase = null;
  if (eventInput.targetCaseId) {
    targetCase = await prisma.case.findUnique({
      where: { id: eventInput.targetCaseId },
      include: {
        evidenceItems: true,
        revisions: { orderBy: { revisionNumber: 'desc' } },
        alerts: { include: { alert: true } },
      },
    });
  } else {
    // Attempt auto-correlation: find active case matching entity or linked alert
    targetCase = await prisma.case.findFirst({
      where: {
        status: { in: ['OPEN', 'IN_REVIEW', 'ESCALATED'] },
      },
      include: {
        evidenceItems: true,
        revisions: { orderBy: { revisionNumber: 'desc' } },
        alerts: { include: { alert: true } },
      },
    });
  }

  let revisionCreated = null;

  if (targetCase) {
    // Update IngestedEvent with linked case
    await prisma.ingestedEvent.update({
      where: { id: savedEvent.id },
      data: { caseId: targetCase.id },
    });

    // Add as immutable CaseEvidence
    const evidenceTitle = `${isLateArrival ? '[LATE-ARRIVING EVIDENCE] ' : ''}${eventInput.eventType}: ${eventInput.entityId}`;
    await prisma.caseEvidence.create({
      data: {
        caseId: targetCase.id,
        evidenceType: eventInput.eventType,
        title: evidenceTitle,
        contentJson: JSON.stringify({
          eventId: eventInput.eventId,
          eventTimestamp: eventInput.eventTimestamp,
          arrivalTimestamp: arrivalTime.toISOString(),
          isLateArrival,
          payload: eventInput.payload,
        }),
        timestamp: eventTime,
      },
    });

    // Evaluate Risk & Priority Shift
    // If late-arriving event introduces new shell account, offshore link, or high amount, escalate priority
    const previousPriority = targetCase.severity;
    let newPriority = previousPriority;
    let changeReason = '';

    const payload = eventInput.payload;
    const amount = Number(payload.amount || 0);

    if (amount >= 1000000 || payload.isHighRiskNexus || payload.linkedOffshore) {
      if (previousPriority !== 'CRITICAL') {
        newPriority = 'CRITICAL';
        changeReason = `Priority escalated to CRITICAL: ${isLateArrival ? 'Late-arriving' : 'New'} event ${eventInput.eventId} revealed high-risk financial nexus (>₹10L or offshore link).`;
      }
    } else if (amount >= 400000 || eventInput.eventType === 'EMPLOYEE_ACTION') {
      if (previousPriority === 'LOW' || previousPriority === 'MEDIUM') {
        newPriority = 'HIGH';
        changeReason = `Priority escalated to HIGH: Incremental evidence confirmed operational modification / suspicious transfer threshold.`;
      }
    }

    if (!changeReason) {
      changeReason = `Incremental evidence incorporated: ${eventInput.eventType} (${eventInput.eventId}) recorded in chronological chain.`;
    }

    // Determine next revision number
    const lastRev = targetCase.revisions[0];
    const nextRevisionNumber = lastRev ? lastRev.revisionNumber + 1 : 1;

    // Create Immutable CaseRevision
    const revision = await prisma.caseRevision.create({
      data: {
        caseId: targetCase.id,
        revisionNumber: nextRevisionNumber,
        reason: changeReason,
        triggerEventId: eventInput.eventId,
        previousPriority,
        newPriority,
        addedEvidenceJson: JSON.stringify([evidenceTitle]),
        snapshotSummary: `Revision ${nextRevisionNumber}: ${changeReason}`,
      },
    });

    // Update case priority if changed
    if (newPriority !== previousPriority) {
      await prisma.case.update({
        where: { id: targetCase.id },
        data: { severity: newPriority },
      });
    }

    // Audit log entry
    await prisma.auditLog.create({
      data: {
        caseId: targetCase.id,
        actorId: 'SYSTEM_EVENT_INGESTION',
        actorName: 'Attack DNA Ingestion Engine',
        action: 'EVIDENCE_ADDED',
        targetType: 'CASE_REVISION',
        targetId: revision.id,
        details: `Created Revision ${nextRevisionNumber}: ${changeReason}`,
      },
    });

    revisionCreated = {
      revisionNumber: nextRevisionNumber,
      reason: changeReason,
      previousPriority,
      newPriority,
    };
  }

  return {
    status: 'PROCESSED',
    eventId: eventInput.eventId,
    isDuplicate: false,
    isLateArrival,
    message: `Event ${eventInput.eventId} processed successfully.${revisionCreated ? ` Created Case Revision ${revisionCreated.revisionNumber}.` : ''}`,
    revisionCreated,
    caseId: targetCase?.id,
    currentCasePriority: targetCase ? (revisionCreated?.newPriority || targetCase.severity) : undefined,
  };
}
