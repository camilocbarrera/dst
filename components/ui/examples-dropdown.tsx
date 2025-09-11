"use client"

import React from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import { useClickOutside } from '../../hooks/use-click-outside'

interface ExamplesDropdownProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLoadExample: (key: 'simple' | 'complex') => void;
}

export function ExamplesDropdown({ isOpen, setIsOpen, onLoadExample }: ExamplesDropdownProps) {
  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const handleLoadExample = (key: 'simple' | 'complex') => {
    onLoadExample(key);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 text-xs font-medium bg-secondary/80 hover:bg-accent text-secondary-foreground rounded-md transition-all duration-200 flex items-center gap-1.5 border border-border/50 hover:border-border"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <BookOpen size={12} aria-hidden="true" />
        <span>Examples</span>
        <ChevronDown size={10} aria-hidden="true" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-xl z-50 overflow-hidden backdrop-blur-sm">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              onClick={() => handleLoadExample('simple')}
              className="block px-3 py-2 text-xs w-full text-left text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              role="menuitem"
            >
              Simple
            </button>
            <button
              onClick={() => handleLoadExample('complex')}
              className="block px-3 py-2 text-xs w-full text-left text-popover-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              role="menuitem"
            >
              Complex
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
