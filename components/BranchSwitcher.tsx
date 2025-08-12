'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Branch, BRANCHES } from '@/lib/github';

interface BranchSwitcherProps {
  currentBranch: Branch;
}

export default function BranchSwitcher({ currentBranch }: BranchSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.branch-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleBranchChange = (branch: Branch) => {
    if (branch === currentBranch) {
      setIsOpen(false);
      return;
    }

    // Always navigate to the root of the target branch for reliability
    // This ensures users never hit a 404 when switching branches
    const newPath = branch === 'dev' ? '/dev' : '/';
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="branch-switcher relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-gray-800/50 hover:bg-gray-800/70 rounded-lg transition-colors outline-none"
      >
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-gray-200">
            {currentBranch === 'main' ? 'Stable' : 'Dev'} Docs
          </span>
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
          {BRANCHES.map((branch) => (
            <button
              key={branch}
              onClick={() => handleBranchChange(branch)}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-800 transition-colors outline-none flex items-center justify-between ${
                branch === currentBranch ? 'bg-gray-800/50 text-gray-200' : 'text-gray-400'
              }`}
            >
              <span>{branch === 'main' ? 'Stable' : 'Dev'} Docs</span>
              {branch === currentBranch && (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}