"use client"

import React from 'react'
import { Download, ChevronDown, Image, FileCode, FileJson } from 'lucide-react'
import { useClickOutside } from '../../hooks/useClickOutside'

interface ExportDropdownProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onExport: (type: 'lineage' | 'python' | 'dagml') => void;
  mode: 'dagml' | 'bitshift';
}

export function ExportDropdown({ isOpen, setIsOpen, onExport, mode }: ExportDropdownProps) {
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const handleExport = (type: 'lineage' | 'python' | 'dagml') => {
    onExport(type);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 text-xs font-medium bg-secondary/80 hover:bg-accent text-secondary-foreground rounded-md transition-all duration-200 flex items-center gap-1.5 border border-border/50 hover:border-border"
      >
        <Download size={12} />
        Export
        <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-md shadow-xl z-50 overflow-hidden backdrop-blur-sm">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleExport('lineage')}
              className="flex items-center w-full px-3 py-2 text-xs text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              role="menuitem"
            >
              <Image size={12} className="mr-2" />
              DAG Lineage (PNG)
            </button>
            {mode === 'dagml' && (
              <button
                onClick={() => handleExport('python')}
                className="flex items-center w-full px-3 py-2 text-xs text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                role="menuitem"
              >
                <FileCode size={12} className="mr-2" />
                Python (.py)
              </button>
            )}
            <button
              onClick={() => handleExport('dagml')}
              className="flex items-center w-full px-3 py-2 text-xs text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              role="menuitem"
            >
              <FileJson size={12} className="mr-2" />
              {mode === 'dagml' ? 'DAGML (.dagml)' : 'Bitshift (.txt)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
