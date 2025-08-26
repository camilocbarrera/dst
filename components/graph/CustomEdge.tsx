"use client"

import React, { useContext } from 'react'
import { EdgeProps, getBezierPath } from 'reactflow'
import { ThemeContext } from '../../context/ThemeContext'

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
  const { isDarkMode } = useContext(ThemeContext);
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const lightModeColor = '#3b82f6';
  const darkModeColor = '#60a5fa';

  return (
    <path
      id={id}
      style={{
        ...style,
        strokeWidth: 10,
        stroke: isDarkMode ? darkModeColor : lightModeColor,
      }}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}


