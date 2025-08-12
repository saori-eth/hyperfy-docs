'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitHubFile, Branch } from '@/lib/github';
import { ReactElement, useState, useEffect } from 'react';
import BranchSwitcher from './BranchSwitcher';
import SearchBar from './SearchBar';

interface SidebarProps {
  structure: GitHubFile;
  branch?: Branch;
}

export default function Sidebar({ structure, branch = 'main' }: SidebarProps) {
  const pathname = usePathname();
  
  // Initialize expanded folders based on current path
  const getInitialExpandedFolders = () => {
    const folders = new Set<string>();
    if (pathname === '/' || pathname === '/dev') return folders;
    
    // Remove branch prefix if present
    let cleanPath = pathname;
    if (branch === 'dev' && pathname.startsWith('/dev')) {
      cleanPath = pathname.slice(4) || '/';
    }
    
    // Split path and expand all parent folders
    const pathParts = cleanPath.slice(1).split('/').filter(Boolean);
    for (let i = 0; i < pathParts.length; i++) {
      const folderPath = pathParts.slice(0, i + 1).join('/');
      folders.add(folderPath);
    }
    return folders;
  };
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(getInitialExpandedFolders);
  
  // Update expanded folders when pathname changes
  useEffect(() => {
    const newExpanded = getInitialExpandedFolders();
    setExpandedFolders(prev => {
      // Merge with existing expanded folders to preserve manual expansions
      const merged = new Set(prev);
      newExpanded.forEach(folder => merged.add(folder));
      return merged;
    });
  }, [pathname, branch]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  function renderTree(node: GitHubFile, parentPath: string[] = [], level: number = 0): ReactElement | null {
    if (node.type === 'file') {
      const isReadme = node.name === 'README.md';
      const path = [...parentPath];
      
      if (!isReadme) {
        path.push(node.name.replace('.md', ''));
      }
      
      const basePath = branch === 'dev' ? '/dev' : '';
      const href = path.length === 0 ? basePath || '/' : `${basePath}/${path.join('/')}`;
      const isActive = pathname === href;
      const displayName = isReadme 
        ? `${parentPath[parentPath.length - 1] || 'Overview'} (README)`
        : node.name.replace('.md', '').replace(/[-_]/g, ' ');
      
      return (
        <li key={node.path}>
          <Link
            href={href}
            className={`block px-4 py-1.5 rounded-lg transition-colors text-sm outline-none ${
              isActive
                ? 'bg-gradient-to-r from-gray-700/40 to-gray-600/40 text-gray-100 font-medium shadow-sm border border-gray-600/30'
                : 'hover:bg-gray-800/60 text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
            style={{ paddingLeft: `${(level + 1) * 1}rem` }}
          >
            {displayName}
          </Link>
        </li>
      );
    }

    if (node.type === 'dir' && node.children) {
      const newPath = node.name === 'docs' ? [] : [...parentPath, node.name];
      const folderKey = newPath.join('/');
      const isExpanded = expandedFolders.has(folderKey) || node.name === 'docs';
      
      // Sort children: directories first, then files
      const sortedChildren = [...node.children].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
      });

      const hasContent = sortedChildren.some(child => 
        child.type === 'file' || (child.type === 'dir' && child.children?.length)
      );

      if (!hasContent) return null;

      // Don't render docs folder itself, just its contents
      if (node.name === 'docs') {
        return (
          <ul className="space-y-0.5">
            {sortedChildren.map(child => renderTree(child, newPath, level))}
          </ul>
        );
      }

      return (
        <li key={node.path} className="list-none">
          <button
            onClick={() => toggleFolder(folderKey)}
            className="flex items-center w-full px-4 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 rounded-lg transition-colors outline-none"
            style={{ paddingLeft: `${level * 1}rem` }}
          >
            <svg
              className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="capitalize">{node.name.replace(/[-_]/g, ' ')}</span>
          </button>
          {isExpanded && (
            <ul className="space-y-0.5 mt-0.5">
              {sortedChildren.map(child => renderTree(child, newPath, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    return null;
  }

  return (
    <aside className="w-full lg:w-64 bg-black/80 backdrop-blur-xl lg:border-r border-gray-800/50 p-4 overflow-y-auto lg:h-screen lg:sticky lg:top-0">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-100">
          Hyperfy Docs
        </h2>
        <a
          href="https://github.com/hyperfy-xyz/hyperfy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="View on GitHub"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
      <SearchBar branch={branch} />
      <BranchSwitcher currentBranch={branch} />
      <nav>
        {renderTree(structure)}
      </nav>
    </aside>
  );
}