import { getAllDocs, Branch } from './github';

export interface SearchResult {
  title: string;
  path: string;
  content: string;
  excerpt: string;
}

export interface SearchIndex {
  documents: {
    title: string;
    path: string;
    content: string;
    headings: string[];
  }[];
}

// Generate search index for a branch
export async function generateSearchIndex(branch: Branch): Promise<SearchIndex> {
  const docs = await getAllDocs(branch);
  
  const documents = docs.map(doc => {
    // Extract headings for better search context
    const headingMatches = doc.content.match(/^#{1,3}\s+(.+)$/gm) || [];
    const headings = headingMatches.map(h => h.replace(/^#+\s+/, ''));
    
    // Clean content for searching (remove markdown syntax)
    const cleanContent = doc.content
      .replace(/^#{1,6}\s+/gm, '') // Remove heading markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove link syntax
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove code blocks
      .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
      .replace(/\|\s*[-:]+\s*\|/g, '') // Remove table formatting
      .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
      .trim();
    
    // Generate path
    const path = branch === 'dev' 
      ? `/dev/${doc.slug.join('/')}`.replace('/index', '')
      : `/${doc.slug.join('/')}`.replace('/index', '');
    
    return {
      title: doc.title,
      path: path || '/',
      content: cleanContent,
      headings,
    };
  });
  
  return { documents };
}

// Search function
export function searchDocuments(
  index: SearchIndex,
  query: string,
  limit: number = 10
): SearchResult[] {
  if (!query || query.length < 2) return [];
  
  const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (searchTerms.length === 0) return [];
  
  const results: Array<{
    document: typeof index.documents[0];
    score: number;
    excerpt: string;
  }> = [];
  
  for (const doc of index.documents) {
    let score = 0;
    let matchContext = '';
    
    const titleLower = doc.title.toLowerCase();
    const contentLower = doc.content.toLowerCase();
    const headingsLower = doc.headings.join(' ').toLowerCase();
    
    for (const term of searchTerms) {
      // Title matches (highest score)
      if (titleLower.includes(term)) {
        score += 10;
      }
      
      // Heading matches (high score)
      if (headingsLower.includes(term)) {
        score += 5;
      }
      
      // Content matches
      if (contentLower.includes(term)) {
        score += 1;
        
        // Find excerpt around first match
        if (!matchContext) {
          const index = contentLower.indexOf(term);
          const start = Math.max(0, index - 100);
          const end = Math.min(doc.content.length, index + 100);
          matchContext = doc.content.slice(start, end);
        }
      }
    }
    
    if (score > 0) {
      // Create excerpt
      const excerpt = matchContext || doc.content.slice(0, 150);
      const cleanExcerpt = excerpt
        .replace(/\s+/g, ' ')
        .trim();
      
      results.push({
        document: doc,
        score,
        excerpt: cleanExcerpt + (cleanExcerpt.length < excerpt.length ? '...' : ''),
      });
    }
  }
  
  // Sort by score and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => ({
      title: r.document.title,
      path: r.document.path,
      content: r.document.content,
      excerpt: r.excerpt,
    }));
}