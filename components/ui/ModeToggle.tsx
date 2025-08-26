"use client"

import React from 'react'

interface ModeToggleProps {
  isDarkMode: boolean;
  mode: 'dagml' | 'bitshift';
  onToggleMode: () => void;
}

export function ModeToggle({ isDarkMode, mode, onToggleMode }: ModeToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>DAGML</span>
      <button
        onClick={onToggleMode}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
          mode === 'bitshift' ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
            mode === 'bitshift' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Bitshift ≫</span>
    </div>
  );
}
