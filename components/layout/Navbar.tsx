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

  return (
    <nav className={`flex flex-wrap items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md relative z-10`}>
      <div className="flex items-center space-x-4 w-full mb-4 md:mb-0 md:w-auto">
        <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          DAG Sketch Tool 🎨
        </h1>
        <button
          onClick={onToggleDarkMode}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'} mx-3 md:mx-6`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
      <div className="flex flex-wrap items-center space-x-4 space-y-2 md:space-y-0 w-full md:w-auto md:ml-4">
        <ExamplesDropdown
          isDarkMode={isDarkMode}
          isOpen={isExamplesOpen}
          setIsOpen={setIsExamplesOpen}
          onLoadExample={onLoadExample}
        />
        
        <InfoPanel
          isDarkMode={isDarkMode}
          isOpen={isInfoOpen}
          setIsOpen={setIsInfoOpen}
        />
        
        <ModeToggle
          isDarkMode={isDarkMode}
          mode={mode}
          onToggleMode={onToggleMode}
        />
        
        {mode === 'dagml' && (
          <ExportDropdown
            isDarkMode={isDarkMode}
            isOpen={isExportOpen}
            setIsOpen={setIsExportOpen}
            onExport={onExport}
          />
        )}
      </div>
    </nav>
  );
}
