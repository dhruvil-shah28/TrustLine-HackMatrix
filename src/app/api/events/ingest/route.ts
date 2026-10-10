import { NextResponse } from 'next/server';
import { ingestIncrementalEvent, IngestionEventPayload } from '@/lib/attack-dna';

export async function POST(request: Request) {
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
