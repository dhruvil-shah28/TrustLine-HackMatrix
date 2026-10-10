import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        alerts: {
          include: {
            alert: {
              include: { signals: true, recommendations: true },
            },
          },
        },
        evidenceItems: true,
        revisions: { orderBy: { revisionNumber: 'desc' } },
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(caseItem);
  } catch (error) {
    console.error('Error fetching case detail:', error);
    return NextResponse.json({ error: 'Failed to fetch case detail' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, assignedInvestigator, summary, evidence, note } = body;

    // Update case details
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(assignedInvestigator && { assignedInvestigator }),
        ...(summary && { summary }),
      },
    });

    // Add Audit Log
    if (status) {
      await prisma.auditLog.create({
        data: {
          caseId: id,
          actorId: 'INV-101',
          actorName: assignedInvestigator || 'Rajesh Sharma',
          action: 'STATUS_CHANGED',
          targetType: 'CASE',
          targetId: id,
          details: `Status updated to ${status}`,
        },
      });
    }

    if (note) {
      await prisma.auditLog.create({
        data: {
          caseId: id,
          actorId: 'INV-101',
          actorName: assignedInvestigator || 'Rajesh Sharma',
          action: 'NOTE_ADDED',
          targetType: 'CASE',
          targetId: id,
          details: `Investigator Note: ${note}`,
        },
      });
    }

    // Add Evidence if provided
    if (evidence) {
      await prisma.caseEvidence.create({
        data: {
          caseId: id,
          evidenceType: evidence.evidenceType || 'TIMELINE_EVENT',
          title: evidence.title || 'Investigator Evidence Submission',
          contentJson: JSON.stringify(evidence.content || {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          caseId: id,
          actorId: 'INV-101',
          actorName: assignedInvestigator || 'Rajesh Sharma',
          action: 'EVIDENCE_ADDED',
          targetType: 'CASE_EVIDENCE',
          targetId: id,
          details: `Added evidence item: ${evidence.title}`,
        },
      });
    }

    const reFetched = await prisma.case.findUnique({
      where: { id },
      include: {
        alerts: { include: { alert: { include: { signals: true } } } },
        evidenceItems: true,
        auditLogs: { orderBy: { timestamp: 'desc' } },
      },
    });

    return NextResponse.json(reFetched);
  } catch (error) {
    console.error('Error updating case:', error);
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 });
  }
}
