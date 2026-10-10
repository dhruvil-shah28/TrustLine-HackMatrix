import { NextResponse } from 'next/server';
import { reconstructAttackDNA } from '@/lib/attack-dna';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reconstruction = await reconstructAttackDNA(id);
    return NextResponse.json(reconstruction);
  } catch (error: any) {
    console.error('Error during Attack DNA reconstruction:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to reconstruct Attack DNA' },
      { status: 500 }
    );
  }
}
