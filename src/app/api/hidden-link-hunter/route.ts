import { NextResponse } from 'next/server';
import { discoverHiddenLinks, HiddenLinkHunterFilters } from '@/lib/hidden-link-hunter';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: HiddenLinkHunterFilters = {
      entityType: searchParams.get('entityType') || 'ALL',
      relationshipType: searchParams.get('relationshipType') || 'ALL',
      minStrength: searchParams.get('minStrength') ? parseInt(searchParams.get('minStrength')!, 10) : 0,
      associatedWithAlertOrCaseOnly: searchParams.get('associatedOnly') === 'true',
      searchQuery: searchParams.get('search') || '',
    };

    const results = await discoverHiddenLinks(filters);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error executing Hidden Link Hunter discovery:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to discover cross-entity relationships' },
      { status: 500 }
    );
  }
}
