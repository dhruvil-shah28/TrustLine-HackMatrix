import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentEmployee, resolveApplicationRole } from '@/lib/employee-auth';
import type { UserRole } from '@/lib/types';

// Least privilege policy:
// - GET /api/cases: INVESTIGATOR, COMPLIANCE, RISK_ANALYST, ADMIN
export async function requireCaseAccess(
  allowedRoles: UserRole[],
  operation: 'list',
  currentEmployeeFetcher: typeof getCurrentEmployee = getCurrentEmployee,
) {
  const employee = await currentEmployeeFetcher();

  if (!employee) {
    return {
      employee: null,
      response: NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 },
      ),
    };
  }

  const role = resolveApplicationRole(employee);
  if (!allowedRoles.includes(role)) {
    return {
      employee: null,
      response: NextResponse.json(
        { error: `Forbidden: ${operation} requires an investigator role.` },
        { status: 403 },
      ),
    };
  }

  return { employee, response: null };
}

export async function GET() {
  const auth = await requireCaseAccess(
    ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST', 'ADMIN'],
    'list',
  );
  if (!auth.employee) return auth.response;

  try {
    const cases = await prisma.case.findMany({
      include: {
        alerts: {
          include: {
            alert: {
              include: { signals: true },
            },
          },
        },
        evidenceItems: true,
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, alertId, severity, assignedInvestigator, summary } = body;

    const caseCode = `CASE-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newCase = await prisma.case.create({
      data: {
        caseCode,
        title: title || `Case File for Alert ${alertId || 'Escalated'}`,
        severity: severity || 'HIGH',
        status: 'OPEN',
        assignedInvestigator: assignedInvestigator || 'Rajesh Sharma (Lead AML)',
        summary: summary || 'Investigator initiated case file based on high-risk evidence signals.',
        recommendationsJson: JSON.stringify([
          { id: 1, text: 'Review workstation access logs', done: false },
          { id: 2, text: 'Verify customer beneficiary registration history', done: false },
        ]),
        alerts: alertId
          ? {
              create: [{ alertId }],
            }
          : undefined,
        auditLogs: {
          create: [
            {
              actorId: 'INV-101',
              actorName: assignedInvestigator || 'Rajesh Sharma',
              action: 'CASE_CREATED',
              targetType: 'CASE',
              targetId: caseCode,
              details: `Initial case file opened for title: ${title}`,
            },
          ],
        },
      },
      include: { alerts: { include: { alert: true } }, evidenceItems: true, auditLogs: true },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error('Error creating case:', error);
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
  }
}
