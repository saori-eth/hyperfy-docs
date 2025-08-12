'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { GitHubFile, Branch } from '@/lib/github';

interface MobileNavProps {
  structure: GitHubFile;
  branch?: Branch;
}

export default function MobileNav({ structure, branch = 'main' }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button - Fixed at top left on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-black/80 backdrop-blur-xl shadow-lg border border-gray-800/50"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 bottom-0 z-40 lg:hidden">
            <div className="w-72 h-full overflow-y-auto bg-black/95 backdrop-blur-xl border-r border-gray-800/50">
              <div className="pt-16"> {/* Space for hamburger button */}
                <Sidebar structure={structure} branch={branch} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar structure={structure} branch={branch} />
      </div>
    </>
  );
}