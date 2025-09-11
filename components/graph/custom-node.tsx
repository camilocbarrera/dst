"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Handle, Position } from 'reactflow'
import { CustomNodeData } from '../../types/dag'

export function CustomNode({ data }: { data: CustomNodeData }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeWidth, setNodeWidth] = useState(140);

  useEffect(() => {
    if (nodeRef.current) {
      const labelWidth = nodeRef.current.querySelector('.label')?.scrollWidth || 0;
      const operatorWidth = nodeRef.current.querySelector('.operator')?.scrollWidth || 0;
      const contentWidth = Math.max(labelWidth, operatorWidth);
      setNodeWidth(Math.max(140, contentWidth + 32));
    }
  }, [data.label, data.operator]);

  return (
    <div 
      ref={nodeRef}
      className="bg-card border border-border/60 rounded-lg shadow-elegant overflow-hidden hover:shadow-elevated transition-all duration-300 hover:border-primary/40 interactive-card group"
      style={{ 
        width: nodeWidth,
        background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card) / 0.8) 100%)',
      }}
    >
      <div className="px-3 py-2 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent border-b border-border/50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="label font-medium text-xs text-card-foreground whitespace-nowrap relative z-10" title={data.label}>
          {data.label}
        </div>
      </div>
      <div className="px-3 py-2.5 relative">
        <div className="operator text-xs text-muted-foreground/90 whitespace-nowrap font-mono" title={data.operator}>
          {data.operator}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2.5 h-2.5 !bg-gradient-to-r !from-primary/70 !to-primary/50 hover:!from-primary hover:!to-primary/80 transition-all duration-200 !border-0 !rounded-full shadow-sm hover:shadow-md hover:scale-110" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2.5 h-2.5 !bg-gradient-to-r !from-primary/70 !to-primary/50 hover:!from-primary hover:!to-primary/80 transition-all duration-200 !border-0 !rounded-full shadow-sm hover:shadow-md hover:scale-110" 
      />
    </div>
  );
}


