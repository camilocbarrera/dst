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
    <nav className="flex items-center justify-between px-3 py-2 bg-card/95 backdrop-blur-sm border-b border-border relative z-10">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-foreground font-mono tracking-tight">
          DAG Sketch
        </h1>
        <div className="hidden sm:flex items-center">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5">
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
        
        <div className="sm:hidden">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
