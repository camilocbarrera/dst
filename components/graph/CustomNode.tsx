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
      className="bg-card border border-border rounded-md shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 hover:border-primary/30"
      style={{ width: nodeWidth }}
    >
      <div className="px-2.5 py-1.5 bg-primary/5 border-b border-border">
        <div className="label font-medium text-xs text-card-foreground whitespace-nowrap" title={data.label}>
          {data.label}
        </div>
      </div>
      <div className="px-2.5 py-1.5">
        <div className="operator text-xs text-muted-foreground whitespace-nowrap font-mono" title={data.operator}>
          {data.operator}
        </div>
      </div>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 !bg-primary/60 hover:!bg-primary transition-all duration-200 !border-0 !rounded-full" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 !bg-primary/60 hover:!bg-primary transition-all duration-200 !border-0 !rounded-full" 
      />
    </div>
  );
}


