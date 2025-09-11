"use client"

import React, { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { ExamplesDropdown } from '../ui/ExamplesDropdown'
import { InfoPanel } from '../ui/InfoPanel'
import { ModeToggle } from '../ui/ModeToggle'
import { ExportDropdown } from '../ui/ExportDropdown'

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  mode: 'dagml' | 'bitshift';
  onToggleMode: () => void;
  onLoadExample: (key: 'simple' | 'complex') => void;
  onExport: (type: 'lineage' | 'python' | 'dagml') => void;
}

export function Navbar({ 
  isDarkMode, 
  onToggleDarkMode, 
  mode, 
  onToggleMode, 
  onLoadExample, 
  onExport 
}: NavbarProps) {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)

  const handleExamplesToggle = (open: boolean) => {
    setIsExamplesOpen(open)
    if (open) {
      setIsExportOpen(false)
    }
  }

  const handleInfoToggle = (open: boolean) => {
    setIsInfoOpen(open)
    if (open) {
      setIsExamplesOpen(false)
      setIsExportOpen(false)
    }
  }

  const handleExportToggle = (open: boolean) => {
    setIsExportOpen(open)
    if (open) {
      setIsExamplesOpen(false)
    }
  }

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-card/98 backdrop-blur-md border-b border-border/50 relative z-10 shadow-elegant">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="4" cy="4" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="20" cy="4" r="2" />
              <circle cx="20" cy="20" r="2" />
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="12" x2="20" y2="4" />
              <line x1="12" y1="12" x2="20" y2="20" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-foreground font-mono tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            DAG Sketch
          </h1>
        </div>
        <div className="hidden sm:flex items-center ml-2">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 text-muted-foreground hover:text-foreground focus-ring group"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </div>
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <ExamplesDropdown
          isOpen={isExamplesOpen}
          setIsOpen={handleExamplesToggle}
          onLoadExample={onLoadExample}
        />
        
        <InfoPanel
          isOpen={isInfoOpen}
          setIsOpen={handleInfoToggle}
        />
        
        <ModeToggle
          mode={mode}
          onToggleMode={onToggleMode}
        />
        
        <ExportDropdown
          isOpen={isExportOpen}
          setIsOpen={handleExportToggle}
          onExport={onExport}
          mode={mode}
        />
        
        <div className="sm:hidden ml-1">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 text-muted-foreground hover:text-foreground focus-ring group"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="transition-transform duration-200 group-hover:scale-110">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
