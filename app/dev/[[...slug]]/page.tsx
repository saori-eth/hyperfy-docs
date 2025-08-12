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
  const docs = await getAllDocs('dev');
  
  // Include home page route
  const routes = [
    { slug: undefined }, // This creates the "/dev" route
    ...docs.map((doc) => ({
      slug: doc.slug.length === 1 && doc.slug[0] === 'index' ? undefined : doc.slug,
    })),
  ];
  
  return routes;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || ['index'];
  const docs = await getAllDocs('dev');
  const doc = getDocBySlug(docs, slug);
  
  if (!doc) {
    return {
      title: 'Not Found',
    };
  }
  
  const title = extractTitle(doc.content) || doc.title;
  
  return {
    title: `${title} - Hyperfy Dev Docs`,
  };
}

export default async function DevDocPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || ['index'];
  
  // Ignore system paths and special files
  if (slug[0]?.startsWith('.') || slug[0]?.startsWith('_')) {
    notFound();
  }
  
  const docs = await getAllDocs('dev');
  const doc = getDocBySlug(docs, slug);
  
  if (!doc) {
    notFound();
  }
  
  // For README files in directories, we need to pass the directory path
  // so relative links resolve correctly
  const currentPath = doc.slug.join('/');
  const { contentHtml } = await processMarkdown(doc.content, currentPath);
  
  return (
    <article>
      <MarkdownContent html={contentHtml} />
    </article>
  );
}