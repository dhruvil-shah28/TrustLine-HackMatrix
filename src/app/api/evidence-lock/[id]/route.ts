import { NextResponse } from 'next/server';
import {
  verifyEvidenceLock,
  getEvidenceManifest,
} from '@/lib/evidence-lock';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    if (mode === 'manifest') {
      const manifest = await getEvidenceManifest(id);
      return NextResponse.json(manifest);
    }

    const verification = await verifyEvidenceLock(id, 'Auditor Sarah Jenkins');
    return NextResponse.json({ verification });
  } catch (error: any) {
    console.error('Error fetching lock or manifest:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const verifierName = body.verifiedBy || 'Investigator Sarah Jenkins';

    const result = await verifyEvidenceLock(id, verifierName);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Error during evidence verification:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
