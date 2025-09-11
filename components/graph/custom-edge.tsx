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
        strokeDasharray: '0',
      }}
      className="react-flow__edge-path transition-all duration-200"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}


