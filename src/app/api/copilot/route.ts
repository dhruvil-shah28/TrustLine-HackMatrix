import { NextResponse } from 'next/server';
import { askInvestigationCopilot } from '@/lib/copilot';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, alertId, employeeId, caseId } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await askInvestigationCopilot(query, alertId, employeeId, caseId);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error querying Investigation Copilot:', error);
    return NextResponse.json({ error: 'Copilot query failed' }, { status: 500 });
  }
}
