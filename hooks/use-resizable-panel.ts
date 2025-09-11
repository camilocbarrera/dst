"use client"

import { useState, useCallback, useEffect, useRef } from 'react'

const STORAGE_KEY = 'dag-sketch-panel-width'
const MIN_WIDTH = 15
const MAX_WIDTH = 85
const SNAP_THRESHOLD = 3

export function useResizablePanel(initialWidth = 35) {
  // Load saved width from localStorage or use initial width
  const [panelWidth, setPanelWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? parseFloat(saved) : initialWidth
    }
    return initialWidth
  })
  
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const snapToCommonSizes = (width: number): number => {
    const commonSizes = [25, 33.33, 50, 66.67, 75]
    
    for (const size of commonSizes) {
      if (Math.abs(width - size) < SNAP_THRESHOLD) {
        return size
      }
    }
    
    return width
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const relativeX = e.clientX - containerRect.left
        const containerWidth = containerRect.width
        let newWidth = (relativeX / containerWidth) * 100
        
        // Apply constraints
        newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH))
        
        // Apply snapping
        newWidth = snapToCommonSizes(newWidth)
        
        setPanelWidth(newWidth)
      }
    },
    [isDragging]
  )

  // Save to localStorage whenever width changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, panelWidth.toString())
    }
  }, [panelWidth])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove])

  // Keyboard shortcuts for quick resizing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            setPanelWidth(25)
            break
          case '2':
            e.preventDefault()
            setPanelWidth(33.33)
            break
          case '3':
            e.preventDefault()
            setPanelWidth(50)
            break
          case '4':
            e.preventDefault()
            setPanelWidth(66.67)
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    panelWidth,
    isDragging,
    containerRef,
    handleMouseDown
  }
}
