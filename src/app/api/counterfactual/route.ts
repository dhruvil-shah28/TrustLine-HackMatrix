import { NextResponse } from 'next/server';
import {
  getCounterfactualCatalog,
  runCounterfactualSimulation,
  loadBaselineEvidence,
  evaluateRiskFromDatasets,
  CounterfactualIntervention,
} from '@/lib/counterfactual-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (alertId) {
      const baseline = await loadBaselineEvidence('ALERT', alertId);
      const baselineEval = evaluateRiskFromDatasets(
        baseline.allTx,
        baseline.accessLogs,
        baseline.employeeActions
      );

      return NextResponse.json({
        baselineEvidence: {
          transactions: baseline.allTx.map((t) => ({
            id: t.id,
            txHash: t.txHash,
            amount: t.amount,
            currency: t.currency,
            sourceAccount: t.sourceAccount?.accountNumber,
            destinationAccount: t.destinationAccount?.accountNumber,
            timestamp: t.timestamp,
            initiatedBy: t.initiatedByEmployee?.name || null,
          })),
          accessEvents: baseline.accessLogs.map((a) => ({
            id: a.id,
            employeeName: a.employee?.name,
            accessType: a.accessType,
            entityType: a.entityType,
            entityId: a.entityId,
            timestamp: a.timestamp,
          })),
          employeeActions: baseline.employeeActions.map((e) => ({
            id: e.id,
            employeeName: e.employee?.name,
            actionType: e.actionType,
            targetType: e.targetType,
            targetId: e.targetId,
            timestamp: e.timestamp,
          })),
        },
        baselineEval,
      });
    }

    const catalog = await getCounterfactualCatalog();
    return NextResponse.json(catalog);
  } catch (error: any) {
    console.error('Error fetching counterfactual catalog:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load counterfactual catalog' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetId, intervention } = body as {
      targetType: 'ALERT' | 'EMPLOYEE' | 'ACCOUNT' | 'TRANSACTION';
      targetId: string;
      intervention: CounterfactualIntervention;
    };

    if (!targetId || !intervention || !intervention.type || !intervention.recordId) {
      return NextResponse.json(
        { error: 'Missing mandatory parameters: targetId and intervention details are required.' },
        { status: 400 }
      );
    }

    const result = await runCounterfactualSimulation({
      targetType: targetType || 'ALERT',
      targetId,
      intervention,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Counterfactual simulation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal simulation error occurred' },
      { status: 500 }
    );
  }
}
