'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Branch } from '@/lib/github';

interface SearchResult {
  title: string;
  path: string;
  excerpt: string;
}

interface SearchBarProps {
  branch: Branch;
}

export default function SearchBar({ branch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset when navigating
  useEffect(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  }, [pathname]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&branch=${branch}`
      );
      const data = await response.json();
      setResults(data.results || []);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [branch]);

  // Debounced search
  const handleSearch = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        router.push(selected.path);
        setIsOpen(false);
        setQuery('');
      }
    }
  };

  return (
    <div ref={searchRef} className="relative mb-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search docs... (⌘K)"
          className="w-full px-3 py-2 pl-9 text-sm bg-gray-800/50 text-gray-200 placeholder-gray-500 rounded-lg outline-none focus:bg-gray-800/70 transition-colors"
        />
        <svg
          className="absolute left-3 top-2.5 w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          {results.map((result, index) => (
            <button
              key={result.path}
              onClick={() => {
                router.push(result.path);
                setIsOpen(false);
                setQuery('');
              }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-800 transition-colors ${
                index === selectedIndex ? 'bg-gray-800' : ''
              }`}
            >
              <div className="text-sm font-medium text-gray-200">
                {result.title}
              </div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {result.excerpt}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {result.path}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
          <p className="text-sm text-gray-500 text-center">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}