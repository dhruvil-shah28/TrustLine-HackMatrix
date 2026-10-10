import { NextResponse } from 'next/server';
import {
  sealCaseEvidence,
  getCaseEvidenceLocks,
} from '@/lib/evidence-lock';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json({ error: 'Missing required query parameter: caseId' }, { status: 400 });
    }

    const locks = await getCaseEvidenceLocks(caseId);
    return NextResponse.json({ locks });
  } catch (error: any) {
    console.error('Error fetching evidence locks:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch locks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caseId, actorName = 'Investigator Sarah Jenkins', actorId = 'INV-101', role = 'Senior Financial Crime Investigator' } = body;

    if (!caseId) {
      return NextResponse.json({ error: 'Missing caseId' }, { status: 400 });
    }

    const lock = await sealCaseEvidence(caseId, {
      actorId,
      actorName,
      role,
    });

    return NextResponse.json({
      success: true,
      message: 'Evidence successfully locked and cryptographically sealed.',
      lock,
    });
  } catch (error: any) {
    console.error('Error sealing evidence lock:', error);
    return NextResponse.json({ error: error.message || 'Failed to seal evidence' }, { status: 500 });
  }
}
