"use client"

import { useState, useCallback, useEffect } from 'react'
import { OnChange } from "@monaco-editor/react";
import React from 'react'
import Head from 'next/head';
import yaml from 'js-yaml'
import { saveAs } from 'file-saver';

import {
  Node,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { Onboarding } from './onboarding';
import { useMediaQuery } from '../hooks/use-media-query';
import { useResizablePanel } from '../hooks/use-resizable-panel';
import { useTheme } from '../context/theme-context';
import { generatePythonDAG } from '../lib/generate-python';
import { exportDagLineage } from '../lib/export';
import { getLayoutedElements } from '../lib/layout';
import { EXAMPLES } from '../lib/constants';
import { parseYAMLInput, parseBitshiftInput } from '../lib/parsers';
import type { ParsedYAML } from '../types/dag';
import { Navbar } from './layout/navbar';
import { EditorPanel } from './panels/editor-panel';
import { CanvasPanel } from './panels/canvas-panel';

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

function DAGVisualizerContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [input, setInput] = useState(EXAMPLES.dagml.simple)
  const [replOutput, setReplOutput] = useState('')
  const [mode, setMode] = useState<'dagml' | 'bitshift'>('dagml')
  const [generatedPythonCode, setGeneratedPythonCode] = useState('')
  const [rightSideTab, setRightSideTab] = useState<'graph' | 'python'>('graph')
  
  const { fitView } = useReactFlow()
  const { isDarkMode, toggleTheme } = useTheme()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { panelWidth: editorWidth, isDragging, containerRef, handleMouseDown } = useResizablePanel(35)

  const parseInput = useCallback((input: string) => {
    try {
      let result;
      
      if (mode === 'dagml') {
        result = parseYAMLInput(input, isDarkMode, getLayoutedElements);
        setGeneratedPythonCode(result.pythonCode);
      } else {
        result = parseBitshiftInput(input, isDarkMode, getLayoutedElements);
      }

      setNodes([]);
      setEdges([]);
      
      setTimeout(() => {
        setNodes(result.nodes);
        setEdges(result.edges);
      }, 0);

      setReplOutput(result.replOutput);
    } catch (error) {
      console.error('Error parsing input:', error);
      setReplOutput(`Error parsing input: ${error}`);
    }
  }, [mode, isDarkMode, setNodes, setEdges])

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      setInput(value);
    }
  };

  useEffect(() => {
    parseInput(input)
  }, [input, parseInput])

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView();
      }, 0);
    }
  }, [nodes, fitView])

  const loadExample = (exampleKey: 'simple' | 'complex') => {
    setInput(EXAMPLES[mode][exampleKey])
  }

  const toggleMode = () => {
    const newMode = mode === 'dagml' ? 'bitshift' : 'dagml'
    setMode(newMode)
    setInput(EXAMPLES[newMode].simple)
  }

  useEffect(() => {
    if (mode !== 'dagml') {
      setRightSideTab('graph');
    }
  }, [mode]);

  const reactFlowInstance = useReactFlow();

  const handleExport = (type: 'lineage' | 'python' | 'dagml') => {
    try {
      let dagId = 'generated_dag';
      
      if (mode === 'dagml') {
        const dagml = yaml.load(input) as ParsedYAML;
        dagId = dagml.dag?.dag_id || 'generated_dag';
      } else {
        // For bitshift mode, use a simple ID based on content hash or timestamp
        dagId = `bitshift_dag_${Date.now()}`;
      }
      
      switch (type) {
        case 'lineage':
          exportDagLineage(reactFlowInstance, dagId);
          break;
        case 'python':
          if (mode === 'dagml') {
            const dagml = yaml.load(input) as ParsedYAML;
            const pythonCode = generatePythonDAG(dagml);
            const pythonBlob = new Blob([pythonCode], { type: 'text/plain;charset=utf-8' });
            saveAs(pythonBlob, `${dagId}.py`);
          }
          break;
        case 'dagml':
          if (mode === 'dagml') {
            const dagmlBlob = new Blob([input], { type: 'text/plain;charset=utf-8' });
            saveAs(dagmlBlob, `${dagId}.dagml`);
          } else {
            // Export bitshift format
            const bitshiftBlob = new Blob([input], { type: 'text/plain;charset=utf-8' });
            saveAs(bitshiftBlob, `${dagId}.txt`);
          }
          break;
      }
    } catch (error) {
      console.error('Error exporting DAG:', error);
      alert(`Error exporting DAG. Please check your ${mode === 'dagml' ? 'DAGML' : 'Bitshift'} syntax.`);
    }
  };

  return (
    <>
      <Head>
        <title>DAG Sketch Tool - Visualize and Design Airflow DAGs</title>
        <meta name="description" content="An open-source tool for visualizing and designing Directed Acyclic Graphs (DAGs) using YAML-based DAGML or Apache Airflow-style bitshift syntax. You can also generate the code for your DAGs." />
        <meta name="keywords" content="DAG, Directed Acyclic Graph, Apache Airflow, DAGML, Data Visualization, Workflow Management, Data Pipeline Design, Workflow Automation, Data Engineering, ETL Processes, Task Scheduling, Data Pipeline Visualization, Cloud Computing, Open Source Tools" />
        <meta name="author" content="Cristian Correa" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.dag-sketch.com" />
      </Head>
      
      <div className="flex flex-col h-screen bg-background">
        <Navbar
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleTheme}
          mode={mode}
          onToggleMode={toggleMode}
          onLoadExample={loadExample}
          onExport={handleExport}
        />

        {isMobile && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm border-b border-border">
            <p className="font-medium mb-1">⚠️ Limited Mobile Experience</p>
            <p className="text-xs opacity-90">For the best experience with DAG Sketch Tool, please use a desktop browser. Some features may be limited or difficult to use on mobile devices.</p>
          </div>
        )}

        <div className={`flex flex-grow relative ${isMobile ? 'flex-col' : ''}`} ref={containerRef}>
          <div 
            style={{ width: isMobile ? '100%' : `${editorWidth}%`, height: isMobile ? '50%' : 'auto' }} 
            className="bg-background border-r border-border overflow-hidden flex flex-col"
          >
            <EditorPanel
              isDarkMode={isDarkMode}
              isMobile={isMobile}
              mode={mode}
              input={input}
              onInputChange={handleEditorChange}
              replOutput={replOutput}
              nodes={nodes}
            />
          </div>
          
          {!isMobile && (
            <div
              className={`w-1 bg-border cursor-col-resize hover:bg-primary/30 transition-all duration-200 relative group ${
                isDragging ? 'bg-primary/50 w-1.5' : ''
              }`}
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1 h-8 bg-primary/40 rounded-full" />
              </div>
            </div>
          )}
          
          <div 
            style={{ width: isMobile ? '100%' : `${100 - editorWidth}%`, height: isMobile ? '50%' : '100%' }}
            className="flex flex-col bg-background"
          >
            <CanvasPanel
              isDarkMode={isDarkMode}
              isMobile={isMobile}
              rightSideTab={rightSideTab}
              setRightSideTab={setRightSideTab}
              mode={mode}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              generatedPythonCode={generatedPythonCode}
            />
          </div>
        </div>
      </div>
      
      {!isMobile && <Onboarding />}
    </>
  )
}

export function YamlDagVisualizer() {
  return (
    <ReactFlowProvider>
      <DAGVisualizerContent />
    </ReactFlowProvider>
  )
}