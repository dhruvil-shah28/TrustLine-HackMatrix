import { NextResponse } from 'next/server';
import { ingestIncrementalEvent, IngestionEventPayload } from '@/lib/attack-dna';
import { getCurrentEmployee, resolveApplicationRole } from '@/lib/employee-auth';
import type { UserRole } from '@/lib/types';

// Least privilege policy:
// - POST /api/events/ingest: INVESTIGATOR, RISK_ANALYST, ADMIN
export async function requireIngestionAccess(
  allowedRoles: UserRole[],
  operation: 'ingest',
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

export async function POST(request: Request) {
  const auth = await requireIngestionAccess(
    ['INVESTIGATOR', 'RISK_ANALYST', 'ADMIN'],
    'ingest',
  );
  if (!auth.employee) return auth.response;

  try {
    const body = (await request.json()) as IngestionEventPayload;

    if (!body.eventId || !body.eventType || !body.eventTimestamp || !body.entityType || !body.entityId) {
      return NextResponse.json(
        { error: 'Missing required event fields: eventId, eventType, eventTimestamp, entityType, entityId' },
        { status: 400 }
      );
    }

    const result = await ingestIncrementalEvent(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error during event ingestion:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to ingest incremental event' },
      { status: 500 }
    );
  }
}
