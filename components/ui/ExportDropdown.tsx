"use client"

import React from 'react'
import { Download, ChevronDown, Image, FileCode, FileJson } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'

interface ExportDropdownProps {
  isDarkMode: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onExport: (type: 'lineage' | 'python' | 'dagml') => void;
}

export function ExportDropdown({ isDarkMode, isOpen, setIsOpen, onExport }: ExportDropdownProps) {
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const handleExport = (type: 'lineage' | 'python' | 'dagml') => {
    onExport(type);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex items-center`}
      >
        <Download size={16} className="mr-2" />
        Export
        <ChevronDown size={16} className="ml-2" />
      </button>
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-20`}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleExport('lineage')}
              className={`flex items-center w-full px-4 py-2 text-sm ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
              role="menuitem"
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image size={16} className="mr-2" />
              DAG Lineage (PNG)
            </button>
            <button
              onClick={() => handleExport('python')}
              className={`flex items-center w-full px-4 py-2 text-sm ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
              role="menuitem"
            >
              <FileCode size={16} className="mr-2" />
              Python Skeleton (.py)
            </button>
            <button
              onClick={() => handleExport('dagml')}
              className={`flex items-center w-full px-4 py-2 text-sm ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
              role="menuitem"
            >
              <FileJson size={16} className="mr-2" />
              DAGML File (.dagml)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
