import MobileNav from '@/components/MobileNav';
import { getDocsStructure } from '@/lib/github';

export default async function DevDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docsStructure = await getDocsStructure('dev');

  return (
    <div className="flex min-h-screen relative">
      <MobileNav structure={docsStructure} branch="dev" />
      <main className="flex-1 px-4 py-8 lg:px-8 lg:py-12 max-w-4xl mx-auto w-full bg-transparent">
        <div className="lg:hidden h-12" /> {/* Spacer for mobile hamburger */}
        {children}
      </main>
    </div>
  );
}