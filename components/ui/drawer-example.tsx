"use client"

import React, { useState } from 'react'
import { Drawer } from './drawer'

// Example component showing different drawer placements
export function DrawerExample() {
  const [state, setState] = useState(false)
  const [placement, setPlacement] = useState<'top' | 'right' | 'bottom' | 'left'>('right')
  
  const open = (position: 'top' | 'right' | 'bottom' | 'left') => {
    setPlacement(position)
    setState(true)
  }

  return (
    <div className="p-4 space-x-2">
      <button 
        onClick={() => open('top')} 
        className="px-3 py-1.5 text-xs bg-secondary hover:bg-accent rounded-md"
      >
        Top
      </button>
      <button 
        onClick={() => open('right')} 
        className="px-3 py-1.5 text-xs bg-secondary hover:bg-accent rounded-md"
      >
        Right
      </button>
      <button 
        onClick={() => open('bottom')} 
        className="px-3 py-1.5 text-xs bg-secondary hover:bg-accent rounded-md"
      >
        Bottom
      </button>
      <button 
        onClick={() => open('left')} 
        className="px-3 py-1.5 text-xs bg-secondary hover:bg-accent rounded-md"
      >
        Left
      </button>
      
      <Drawer visible={state} onClose={() => setState(false)} placement={placement}>
        <Drawer.Title>Drawer Example</Drawer.Title>
        <Drawer.Subtitle>This is a drawer sliding from the {placement}</Drawer.Subtitle>
        <Drawer.Content>
          <p className="text-xs text-muted-foreground">
            Some content contained within the drawer. This drawer component supports 
            all four placement positions and includes smooth animations.
          </p>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}
