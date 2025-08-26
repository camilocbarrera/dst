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

interface RightPanelProps {
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

export function RightPanel({
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
}: RightPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-2 md:px-4 py-2 md:py-4">
        <button
          className={`py-1 md:py-2 px-2 md:px-4 flex items-center text-sm md:text-base ${rightSideTab === 'graph' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setRightSideTab('graph')}
        >
          <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
            className={`py-1 md:py-2 px-2 md:px-4 flex items-center text-sm md:text-base ${rightSideTab === 'python' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setRightSideTab('python')}
          >
            <FileCode size={isMobile ? 16 : 20} className="mr-1 md:mr-2" />
            Code
          </button>
        )}
      </div>
      
      {rightSideTab === 'graph' || mode !== 'dagml' ? (
        <div className={`flex-grow ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} overflow-hidden`}>
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
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} w-full h-full`}
            nodesConnectable={false}
            edgesUpdatable={true}
            nodesDraggable={true}
          >
            <Controls />
            <DotGrid isDarkMode={isDarkMode} />
          </ReactFlow>
        </div>
      ) : (
        <div className={`flex-grow border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} mx-2 md:mx-4 mb-2 md:mb-4 rounded-lg overflow-hidden shadow-lg`}>
          <Editor
            height="100%"
            language="python"
            theme={isDarkMode ? "vs-dark" : "light"}
            value={generatedPythonCode}
            options={{
              ...EDITOR_OPTIONS,
              automaticLayout: true,
              tabSize: 4,
              readOnly: true,
              fontSize: isMobile ? 12 : 14,
            }}
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
