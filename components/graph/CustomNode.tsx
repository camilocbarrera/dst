"use client"

import React, { useEffect, useRef, useState, useContext } from 'react'
import { Handle, Position } from 'reactflow'
import { ThemeContext } from '../../context/ThemeContext'
import { CustomNodeData } from '../../types/dag'

export function CustomNode({ data }: { data: CustomNodeData }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeWidth, setNodeWidth] = useState(160);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (nodeRef.current) {
      const labelWidth = nodeRef.current.querySelector('.label')?.scrollWidth || 0;
      const operatorWidth = nodeRef.current.querySelector('.operator')?.scrollWidth || 0;
      const contentWidth = Math.max(labelWidth, operatorWidth);
      setNodeWidth(Math.max(160, contentWidth + 40));
    }
  }, [data.label, data.operator]);

  return (
    <div 
      ref={nodeRef}
      className={`rounded-md shadow-md overflow-hidden border-2 ${
        isDarkMode 
          ? 'bg-blue-gray-700 border-blue-gray-500' 
          : 'bg-white border-blue-500'
      }`}
      style={{ width: nodeWidth }}
    >
      <div className={`px-3 py-2 ${isDarkMode ? 'bg-blue-gray-600' : 'bg-blue-50'}`}>
        <div className={`label font-semibold text-s whitespace-nowrap ${
          isDarkMode ? 'text-blue-gray-100' : 'text-blue-900'
        }`} title={data.label}>{data.label}</div>
      </div>
      <div className="px-3 py-2">
        <div className={`operator text-sm whitespace-nowrap ${
          isDarkMode ? 'text-blue-gray-200' : 'text-gray-800'
        }`} title={data.operator}>{data.operator}</div>
      </div>
      <Handle type="target" position={Position.Left} className={`w-2 h-2 ${
        isDarkMode ? '!bg-blue-gray-400' : '!bg-blue-500'
      }`} />
      <Handle type="source" position={Position.Right} className={`w-2 h-2 ${
        isDarkMode ? '!bg-blue-gray-400' : '!bg-blue-500'
      }`} />
    </div>
  );
}


