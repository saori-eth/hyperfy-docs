import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import matter from 'gray-matter';
import { rehype } from 'rehype';
import rehypeHighlight from 'rehype-highlight';

export interface ProcessedContent {
  contentHtml: string;
  data: Record<string, any>;
}

export async function processMarkdown(markdown: string, currentPath?: string): Promise<ProcessedContent> {
  // Parse frontmatter
  const { content, data } = matter(markdown);

  // Process markdown to HTML
  const processedContent = await remark()
    .use(gfm) // GitHub Flavored Markdown
    .use(html, { sanitize: false })
    .process(content);

  let htmlContent = processedContent.toString();
  
  // Fix internal links
  // Convert relative markdown links to proper routes
  htmlContent = htmlContent.replace(
    /href="([^"]+)"/g,
    (match, href) => {
      // Skip external links and anchors
      if (href.startsWith('http') || href.startsWith('#')) {
        return match;
      }
      
      // Remove .md extension and clean up path
      let cleanPath = href
        .replace(/^\.\//, '') // Remove ./
        .replace(/^\/docs\//, '') // Remove /docs/ prefix (absolute)
        .replace(/^docs\//, '') // Remove docs/ prefix (relative)
        .replace(/^\//, '') // Remove leading /
        .replace(/\.md$/, '') // Remove .md extension
        .replace(/\/README$/, ''); // README files represent their parent
      
      // Handle relative paths from current location
      if (currentPath && !href.startsWith('/')) {
        const pathParts = currentPath.split('/');
        pathParts.pop(); // Remove current file
        
        if (href.startsWith('../')) {
          // Handle parent directory references
          const upCount = (href.match(/\.\.\//g) || []).length;
          cleanPath = cleanPath.replace(/^(\.\.\/)*/g, '');
          for (let i = 0; i < upCount; i++) {
            pathParts.pop();
          }
          cleanPath = pathParts.concat(cleanPath ? [cleanPath] : []).join('/');
        } else {
          cleanPath = pathParts.concat([cleanPath]).filter(Boolean).join('/');
        }
      }
      
      // Ensure path starts with /
      cleanPath = cleanPath ? `/${cleanPath}` : '/';
      
      return `href="${cleanPath}"`;
    }
  );

  // Apply syntax highlighting to code blocks
  const highlightedContent = await rehype()
    .use(rehypeHighlight)
    .process(htmlContent);

  const contentHtml = highlightedContent.toString();

  return {
    contentHtml,
    data,
  };
}

export function extractTitle(markdown: string): string {
  const { data, content } = matter(markdown);
  
  // Try to get title from frontmatter
  if (data.title) {
    return data.title;
  }
  
  // Try to extract first H1 from content
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1];
  }
  
  // Default to empty string
  return '';
}