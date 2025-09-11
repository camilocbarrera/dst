"use client"

import React from 'react'
import { Skeleton } from './Skeleton'
import { cn } from '@/lib/utils'

interface LoadingStateProps {
  className?: string
  variant?: 'graph' | 'editor' | 'node' | 'list'
  count?: number
}

export function LoadingState({ className, variant = 'graph', count = 3 }: LoadingStateProps) {
  const renderSkeletons = () => {
    switch (variant) {
      case 'graph':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="flex space-x-4">
              <Skeleton className="w-32 h-16 rounded-lg" />
              <Skeleton className="w-32 h-16 rounded-lg" />
            </div>
            <div className="flex space-x-4">
              <Skeleton className="w-28 h-14 rounded-lg" />
              <Skeleton className="w-28 h-14 rounded-lg" />
              <Skeleton className="w-28 h-14 rounded-lg" />
            </div>
            <div className="pulse-soft text-xs text-muted-foreground">
              Loading your DAG visualization...
            </div>
          </div>
        )
      
      case 'editor':
        return (
          <div className="space-y-2 p-4">
            {Array.from({ length: count }).map((_, i) => (
              <Skeleton key={i} variant="text" className="w-full" style={{
                width: `${Math.random() * 40 + 60}%`
              }} />
            ))}
          </div>
        )
      
      case 'node':
        return (
          <div className="bg-card border border-border/60 rounded-lg shadow-elegant overflow-hidden">
            <div className="px-3 py-2 bg-primary/8 border-b border-border/50">
              <Skeleton variant="text" className="w-20" />
            </div>
            <div className="px-3 py-2.5">
              <Skeleton variant="text" className="w-16" />
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton variant="circular" className="w-8 h-8" />
                <div className="space-y-1 flex-1">
                  <Skeleton variant="text" className="w-3/4" />
                  <Skeleton variant="text" className="w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )
      
      default:
        return <Skeleton className="w-full h-32" />
    }
  }

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      {renderSkeletons()}
    </div>
  )
}
