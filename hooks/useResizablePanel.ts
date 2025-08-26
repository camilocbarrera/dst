"use client"

import { useState, useCallback, useEffect, useRef } from 'react'

export function useResizablePanel(initialWidth = 35) {
  const [panelWidth, setPanelWidth] = useState(initialWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const newWidth = (e.clientX / containerWidth) * 100
        setPanelWidth(Math.max(10, Math.min(newWidth, 90)))
      }
    },
    [isDragging]
  )

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove])

  return {
    panelWidth,
    isDragging,
    containerRef,
    handleMouseDown
  }
}
