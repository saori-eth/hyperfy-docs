'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitHubFile } from '@/lib/github';
import { ReactElement, useState, useEffect } from 'react';

interface SidebarProps {
  structure: GitHubFile;
}

export default function Sidebar({ structure }: SidebarProps) {
  const pathname = usePathname();
  
  // Initialize expanded folders based on current path
  const getInitialExpandedFolders = () => {
    const folders = new Set<string>();
    if (pathname === '/') return folders;
    
    // Split path and expand all parent folders
    const pathParts = pathname.slice(1).split('/');
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
  }, [pathname]);

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
      
      const href = path.length === 0 ? '/' : `/${path.join('/')}`;
      const isActive = pathname === href;
      const displayName = isReadme 
        ? `${parentPath[parentPath.length - 1] || 'Overview'} (README)`
        : node.name.replace('.md', '').replace(/[-_]/g, ' ');
      
      return (
        <li key={node.path}>
          <Link
            href={href}
            className={`block px-4 py-1.5 rounded-lg transition-all text-sm ${
              isActive
                ? 'bg-gradient-to-r from-gray-200/90 to-gray-100/90 dark:from-gray-700/90 dark:to-gray-600/90 text-gray-900 dark:text-gray-100 font-medium shadow-sm'
                : 'hover:bg-gray-100/60 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300'
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
            className="flex items-center w-full px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg transition-all"
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
    <aside className="w-full lg:w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl lg:border-r border-gray-200/50 dark:border-gray-700/50 p-4 overflow-y-auto lg:h-screen lg:sticky lg:top-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          Hyperfy Docs
        </h2>
      </div>
      <nav>
        {renderTree(structure)}
      </nav>
    </aside>
  );
}