import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        signals: true,
        recommendations: true,
        cases: {
          include: {
            case: true,
          },
        },
      },
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error fetching alert details:', error);
    return NextResponse.json({ error: 'Failed to fetch alert details' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, severity } = body;

    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(severity && { severity }),
      },
      include: { signals: true, recommendations: true },
    });

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}
