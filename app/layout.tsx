import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
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
        <div className="flex min-h-screen">
          <Sidebar structure={docsStructure} />
          <main className="flex-1 px-8 py-12 max-w-4xl mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}