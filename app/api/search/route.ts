import { NextRequest, NextResponse } from 'next/server';
import { generateSearchIndex, searchDocuments } from '@/lib/search';
import { Branch } from '@/lib/github';

// Cache search indexes
const indexCache = new Map<Branch, any>();
let lastIndexTime = 0;
const INDEX_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const branch = (searchParams.get('branch') || 'main') as Branch;
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }
    
    // Get or generate search index
    let index = indexCache.get(branch);
    const now = Date.now();
    
    if (!index || now - lastIndexTime > INDEX_CACHE_DURATION) {
      index = await generateSearchIndex(branch);
      indexCache.set(branch, index);
      lastIndexTime = now;
    }
    
    // Perform search
    const results = searchDocuments(index, query, 10);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}