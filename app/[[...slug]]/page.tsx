import { notFound } from 'next/navigation';
import { getAllDocs, getDocBySlug } from '@/lib/github';
import { processMarkdown, extractTitle } from '@/lib/markdown';
import MarkdownContent from '@/components/MarkdownContent';

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  const docs = await getAllDocs('main');
  
  // Include home page route
  const routes = [
    { slug: undefined }, // This creates the "/" route
    ...docs.map((doc) => ({
      slug: doc.slug.length === 1 && doc.slug[0] === 'index' ? undefined : doc.slug,
    })),
    // Add common system paths to prevent dev errors
    { slug: ['.well-known', 'appspecific', 'com.chrome.devtools.json'] },
  ];
  
  return routes;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || ['index'];
  const docs = await getAllDocs('main');
  const doc = getDocBySlug(docs, slug);
  
  if (!doc) {
    return {
      title: 'Not Found',
    };
  }
  
  const title = extractTitle(doc.content) || doc.title;
  
  return {
    title: `${title} - Hyperfy Docs`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || ['index'];
  
  // Ignore system paths and special files
  if (slug[0]?.startsWith('.') || slug[0]?.startsWith('_')) {
    notFound();
  }
  
  const docs = await getAllDocs('main');
  const doc = getDocBySlug(docs, slug);
  
  if (!doc) {
    notFound();
  }
  
  // For README files in directories, we need to pass the directory path
  // so relative links resolve correctly
  const currentPath = doc.slug.join('/');
  const { contentHtml } = await processMarkdown(doc.content, currentPath, 'main');
  
  return (
    <article>
      <MarkdownContent html={contentHtml} rawMarkdown={doc.content} />
    </article>
  );
}