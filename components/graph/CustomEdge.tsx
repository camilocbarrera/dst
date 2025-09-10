"use client"

import React from 'react'
import { EdgeProps, getBezierPath } from 'reactflow'

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <path
      id={id}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: 'rgba(255, 255, 255, 0.6) !important',
        strokeDasharray: '0',
      }}
      className="transition-all duration-200"
      onMouseEnter={(e) => {
        e.currentTarget.style.setProperty('stroke', 'rgba(255, 255, 255, 0.9)', 'important');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty('stroke', 'rgba(255, 255, 255, 0.6)', 'important');
      }}
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}


