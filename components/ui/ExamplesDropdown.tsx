"use client"

import React from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'

interface ExamplesDropdownProps {
  isDarkMode: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLoadExample: (key: 'simple' | 'complex') => void;
}

export function ExamplesDropdown({ isDarkMode, isOpen, setIsOpen, onLoadExample }: ExamplesDropdownProps) {
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const handleLoadExample = (key: 'simple' | 'complex') => {
    onLoadExample(key);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex items-center`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <BookOpen size={16} className="mr-2" aria-hidden="true" />
        <span>Examples</span>
        <ChevronDown size={16} className="ml-2" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className={`absolute mt-2 w-48 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-20`}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleLoadExample('simple')}
              className={`block px-4 py-2 text-sm w-full text-left ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
              role="menuitem"
            >
              Simple Example
            </button>
            <button
              onClick={() => handleLoadExample('complex')}
              className={`block px-4 py-2 text-sm w-full text-left ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
              role="menuitem"
            >
              Complex Example
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
