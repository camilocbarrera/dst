"use client"

import React from 'react'

interface ModeToggleProps {
  mode: 'dagml' | 'bitshift';
  onToggleMode: () => void;
}

export function ModeToggle({ mode, onToggleMode }: ModeToggleProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono bg-secondary/50 rounded-md px-2.5 py-1.5 border border-border/50">
      <span className={`transition-colors font-medium ${mode === 'dagml' ? 'text-primary' : 'text-muted-foreground'}`}>
        DAGML
      </span>
      <button
        onClick={onToggleMode}
        className="relative inline-flex h-4 w-8 items-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background bg-input hover:bg-accent border border-border/30"
        aria-label={`Switch to ${mode === 'dagml' ? 'Bitshift' : 'DAGML'} mode`}
      >
        <span
          className={`inline-block h-2.5 w-2.5 transform rounded-full bg-primary transition-transform duration-200 ${mode === 'bitshift' ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
        />
      </button>
      <span className={`transition-colors font-medium ${mode === 'bitshift' ? 'text-primary' : 'text-muted-foreground'}`}>
        Bitshift
      </span>
    </div>
  );
}
