import { NextResponse } from 'next/server';
import { reconstructAttackDNA } from '@/lib/attack-dna';
import { getCurrentEmployee, resolveApplicationRole } from '@/lib/employee-auth';
import type { UserRole } from '@/lib/types';

// Least privilege policy:
// - POST /api/alerts/[id]/reconstruct: INVESTIGATOR, RISK_ANALYST, ADMIN
export async function requireReconstructionAccess(
  allowedRoles: UserRole[],
  operation: 'reconstruct',
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireReconstructionAccess(
    ['INVESTIGATOR', 'RISK_ANALYST', 'ADMIN'],
    'reconstruct',
  );
  if (!auth.employee) return auth.response;

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
