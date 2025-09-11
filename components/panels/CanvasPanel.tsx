"use client"

import React from 'react'
import ReactFlow, {
  Node,
  Edge,
  ConnectionMode,
  Controls,
  NodeChange,
  EdgeChange,
} from 'reactflow'
import Editor from "@monaco-editor/react"
import { FileCode } from 'lucide-react'
import { CustomNode } from '../graph/CustomNode'
import { CustomEdge } from '../graph/CustomEdge'
import { DotGrid } from '../graph/DotGrid'
import { EDITOR_OPTIONS } from '../../lib/constants'

interface CanvasPanelProps {
  isDarkMode: boolean;
  isMobile: boolean;
  rightSideTab: 'graph' | 'python';
  setRightSideTab: (tab: 'graph' | 'python') => void;
  mode: 'dagml' | 'bitshift';
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  generatedPythonCode: string;
}

const nodeTypes = {
  custom: CustomNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

export function CanvasPanel({
  isDarkMode,
  isMobile,
  rightSideTab,
  setRightSideTab,
  mode,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  generatedPythonCode
}: CanvasPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-border/50 bg-card/80 backdrop-blur-sm px-1 py-1">
        <button
          className={`py-2 px-4 flex items-center text-xs font-medium rounded-md transition-all duration-200 relative overflow-hidden group ${
            rightSideTab === 'graph' 
              ? 'bg-primary/15 text-primary shadow-sm border border-primary/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-transparent' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:shadow-sm'
          }`}
          onClick={() => setRightSideTab('graph')}
        >
          <svg className="w-3.5 h-3.5 mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="4" cy="4" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="20" cy="4" r="2" />
            <circle cx="20" cy="20" r="2" />
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="12" x2="20" y2="4" />
            <line x1="12" y1="12" x2="20" y2="20" />
          </svg>
          Graph
        </button>
        {mode === 'dagml' && (
          <button
            className={`py-2 px-4 flex items-center text-xs font-medium rounded-md transition-all duration-200 relative overflow-hidden group ml-1 ${
              rightSideTab === 'python' 
                ? 'bg-primary/15 text-primary shadow-sm border border-primary/20 before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-transparent' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 hover:shadow-sm'
            }`}
            onClick={() => setRightSideTab('python')}
          >
            <FileCode size={14} className="mr-2 transition-transform duration-200 group-hover:scale-110" />
            Code
          </button>
        )}
      </div>
      
      {rightSideTab === 'graph' || mode !== 'dagml' ? (
        <div className="flex-grow bg-muted/20 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            connectionMode={ConnectionMode.Loose}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.1 }}
            className="w-full h-full bg-background"
            nodesConnectable={false}
            edgesUpdatable={true}
            nodesDraggable={true}
          >
            <Controls className="!bg-card !border-border !shadow-lg" />
            <DotGrid isDarkMode={isDarkMode} />
          </ReactFlow>
        </div>
      ) : (
        <div className="flex-grow border border-border m-1.5 rounded-md overflow-hidden bg-card">
          <Editor
            height="100%"
            language="python"
            theme={isDarkMode ? "dst-dark" : "dst-light"}
            value={generatedPythonCode}
            options={{
              ...EDITOR_OPTIONS,
              automaticLayout: true,
              tabSize: 4,
              readOnly: true,
              fontSize: isMobile ? 11 : 12,
              lineHeight: 1.3,
              padding: { top: 6, bottom: 6 },
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      )}
    </div>
  );
}
