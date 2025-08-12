import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MobileNav from '@/components/MobileNav';
import { getDocsStructure } from '@/lib/github';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hyperfy Documentation',
  description: 'Documentation for Hyperfy - 3D world engine',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docsStructure = await getDocsStructure();

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen relative">
          <MobileNav structure={docsStructure} />
          <main className="flex-1 px-4 py-8 lg:px-8 lg:py-12 max-w-4xl mx-auto w-full bg-transparent">
            <div className="lg:hidden h-12" /> {/* Spacer for mobile hamburger */}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}