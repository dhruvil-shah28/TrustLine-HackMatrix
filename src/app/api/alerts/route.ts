import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runHybridDetectionEngine } from '@/lib/detection-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const severity = searchParams.get('severity') || searchParams.get('risk') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const detectionMethod = searchParams.get('detectionMethod') || 'ALL';
    const sort = searchParams.get('sort') || 'NEWEST';

    const whereClause: any = {};

    if (search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { alertCode: { contains: q } },
        { title: { contains: q } },
        { summary: { contains: q } },
        { riskExplanation: { contains: q } },
        { primaryEntityId: { contains: q } },
      ];
    }

    if (severity !== 'ALL') {
      whereClause.severity = severity;
    }

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    if (detectionMethod !== 'ALL') {
      whereClause.detectionMethod = { contains: detectionMethod };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'OLDEST') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'HIGHEST_EXPOSURE') {
      orderBy = { financialExposure: 'desc' };
    }

    const alerts = await prisma.alert.findMany({
      where: whereClause,
      include: {
        signals: true,
        recommendations: true,
        cases: {
          include: {
            case: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { entityType, entityId } = body;

    const detection = await runHybridDetectionEngine(entityType || 'EMPLOYEE', entityId || 'EMP-1001');

    const newAlertCode = `ALT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAlert = await prisma.alert.create({
      data: {
        alertCode: newAlertCode,
        title: body.title || `Connected Anomaly Detected (${newAlertCode})`,
        severity: detection.severity,
        status: 'OPEN',
        confidence: detection.confidence,
        financialExposure: body.financialExposure || 1500000.0,
        primaryEntityId: entityId || 'EMP-1001',
        primaryEntityType: entityType || 'EMPLOYEE',
        summary: body.summary || 'Hybrid detection trigger identified suspicious multi-entity relationship pattern.',
        riskExplanation: body.riskExplanation || `Automated risk scoring accumulated ${detection.score}/100 based on ${detection.signals.length} distinct signals.`,
        detectionMethod: detection.detectionMethods.join('_') || 'HYBRID_RULE_GRAPH_ML',
        signals: {
          create: detection.signals.map((s) => ({
            type: s.type,
            title: s.title,
            description: s.description,
            observedValue: s.observedValue,
            expectedValue: s.expectedValue,
            weight: s.weight,
            evidenceCategory: s.evidenceCategory,
          })),
        },
        recommendations: {
          create: detection.suggestedActions.map((act) => ({
            actionText: act,
            category: 'ACCESS_REVIEW',
            priority: 'HIGH',
          })),
        },
      },
      include: { signals: true, recommendations: true },
    });

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Failed to trigger detection' }, { status: 500 });
  }
}
