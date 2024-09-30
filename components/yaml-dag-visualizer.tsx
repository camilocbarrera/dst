"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import Editor, { Monaco, OnChange } from "@monaco-editor/react";
// import type * as monaco from 'monaco-editor';
import React from 'react'

import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Controls,
  Background,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Check, AlertTriangle, XCircle, Sun, Moon, BookOpen, ChevronDown, Info } from 'lucide-react'
import yaml from 'js-yaml'
import dagre from 'dagre';
import { editor } from 'monaco-editor';  // Add this import if not already present

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

const statusColors = {
  success: 'bg-green-500',
  skipped: 'bg-yellow-500',
  failed: 'bg-red-500',
}

const statusIcons = {
  success: <Check className="w-4 h-4 text-white" />,
  skipped: <AlertTriangle className="w-4 h-4 text-white" />,
  failed: <XCircle className="w-4 h-4 text-white" />,
}

// Add this interface near the top of the file, after the imports
interface CustomNodeData {
  label: string;
  operator: string;
  status?: 'success' | 'skipped' | 'failed';
}

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${data.status ? statusColors[data.status] : ''}`}>
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="font-medium text-sm text-gray-700 dark:text-gray-300">{data.label}</div>
      </div>
      <div className="px-4 py-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">{data.operator}</div>
        {data.status && (
          <div className="mt-1 flex items-center">
            {statusIcons[data.status]}
            <span className="ml-1 text-xs capitalize">{data.status}</span>
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500" />
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

// Define an interface for the parsed YAML structure
interface ParsedYAML {
  tasks?: Array<{
    task_id: string;
    operator: string;
    [key: string]: string | number | boolean | object;  // Allow additional properties of various types
  }>;
  dependencies?: Array<[string, string]>;
  [key: string]: unknown;  // Allow additional top-level properties of unknown type
}

function DAGVisualizerContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [input, setInput] = useState(`# Example DAGML file (my_dagml.yaml)
dag:
  dag_id: 'example_dag'
  schedule_interval: '@daily'
  start_date: '2024-09-01'

tasks:
  - task_id: 'start_task'
    operator: 'BashOperator'
    bash_command: 'echo "Start"'
  - task_id: 'process_task'
    operator: 'PythonOperator'
    python_callable: 'process_data'
  - task_id: 'email_task'
    operator: 'EmailOperator'
    to: 'user@example.com'
    subject: 'DAG Complete'
    html_content: 'The DAG has finished processing.'
  - task_id: 'end_task'
    operator: 'BashOperator'
    bash_command: 'echo "End"'

dependencies:
  - ['start_task', 'process_task']
  - ['process_task', 'email_task']
  - ['email_task', 'end_task']`)
  const { fitView } = useReactFlow()

  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 172;
    const nodeHeight = 86;

    dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }, []);

  const parseYAML = useCallback((input: string) => {
    try {
      const parsedYAML = yaml.load(input) as ParsedYAML;
      let newNodes: Node[] = [];
      let newEdges: Edge[] = [];

      if (parsedYAML.tasks) {
        newNodes = parsedYAML.tasks.map((task) => ({
          id: task.task_id,
          type: 'custom',
          data: { 
            label: task.task_id, 
            operator: task.operator
          },
          position: { x: 0, y: 0 },
        }));
      }

      if (parsedYAML.dependencies) {
        newEdges = parsedYAML.dependencies.map((dep) => ({
          id: `${dep[0]}-${dep[1]}`,
          source: dep[0],
          target: dep[1],
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#b1b1b7' },
        }));
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);

      // Clear existing nodes and edges before setting new ones
      setNodes([])
      setEdges([])

      // Use a setTimeout to ensure the clearing has taken effect before adding new elements
      setTimeout(() => {
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
      }, 0)

    } catch (error) {
      console.error('Error parsing YAML:', error)
    }
  }, [setNodes, setEdges, getLayoutedElements])

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      setInput(value);
    }
  };

  const [editorWidth, setEditorWidth] = useState(35)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const newWidth = (e.clientX / containerWidth) * 100
        setEditorWidth(Math.max(10, Math.min(newWidth, 90)))
      }
    },
    [isDragging]
  )

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove])

  useEffect(() => {
    parseYAML(input)
  }, [input, parseYAML])

  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, includeHiddenNodes: true })
      }, 0)
    }
  }, [nodes, fitView])

  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollbar: {
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      alwaysConsumeMouseWheel: false
    },
    lineNumbersMinChars: 3,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false
  }

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  function handleEditorWillMount(monaco: Monaco) {
    // Register the YAML language
    monaco.languages.register({ id: 'yaml' });
    
    // Define a more comprehensive set of completion items
    const createDependencySnippet = (context: { nodes: Node[] }) => {
      const nodeIds = context.nodes.map(node => node.data.label);
      return nodeIds.map(id => ({
        label: id,
        kind: monaco.languages.CompletionItemKind.Value,
        insertText: id,
        detail: 'Task ID',
        documentation: `Insert task ID: ${id}`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      }));
    };

    monaco.languages.registerCompletionItemProvider('yaml', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: 'dag',
            kind: monaco.languages.CompletionItemKind.Struct,
            insertText: 'dag:\n  dag_id: "$1"\n  schedule_interval: "$2"\n  start_date: "$3"',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'DAG configuration'
          },
          {
            label: 'tasks',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'tasks:\n  - task_id: "$1"\n    operator: "$2"\n    $3',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'List of tasks'
          },
          {
            label: 'dependencies',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'dependencies:\n  - ["$1", "$2"]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Task dependencies'
          },
          {
            label: 'BashOperator',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'BashOperator',
            documentation: 'Executes a bash command'
          },
          {
            label: 'PythonOperator',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'PythonOperator',
            documentation: 'Executes a Python callable'
          },
          {
            label: 'EmailOperator',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'EmailOperator',
            documentation: 'Sends an email'
          },
          // ... add more suggestions as needed
        ];

        // Add dynamic suggestions for dependencies based on current nodes
        const lineContent = model.getLineContent(position.lineNumber);
        if (lineContent.trim().startsWith('-') && lineContent.includes('dependencies')) {
          suggestions.push(...createDependencySnippet({ nodes }));
        }

        return {
          suggestions: suggestions.map(s => ({ ...s, range }))
        };
      }
    });
  }

  function handleEditorDidMount(editor: editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  const [examples] = useState({
    simple: `# Example DAGML file (my_dagml.yaml)
dag:
  dag_id: 'example_dag'
  schedule_interval: '@daily'
  start_date: '2024-09-01'

tasks:
  - task_id: 'start_task'
    operator: 'BashOperator'
    bash_command: 'echo "Start"'
  - task_id: 'process_task'
    operator: 'PythonOperator'
    python_callable: 'process_data'
  - task_id: 'email_task'
    operator: 'EmailOperator'
    to: 'user@example.com'
    subject: 'DAG Complete'
    html_content: 'The DAG has finished processing.'
  - task_id: 'end_task'
    operator: 'BashOperator'
    bash_command: 'echo "End"'

dependencies:
  - ['start_task', 'process_task']
  - ['process_task', 'email_task']
  - ['email_task', 'end_task']`,
    complex: `# Complex DAGML file (complex_dagml.yaml)
# S3 to Snowflake DAGML file (s3_to_snowflake_dagml.yaml)
dag:
  dag_id: 's3_to_snowflake_parallel_dag'
  schedule_interval: '@daily'
  start_date: '2024-10-01'

tasks:
  - task_id: 'start_task'
    operator: 'BashOperator'
    bash_command: 'echo "Start S3 to Snowflake Data Pipeline"'

  - task_id: 'extract_data_task1'
    operator: 'PythonOperator'
    python_callable: 'extract_data_from_s3'
    op_kwargs:
      s3_bucket: 'my-bucket'
      s3_key: 'data/file1.csv'

  - task_id: 'extract_data_task2'
    operator: 'PythonOperator'
    python_callable: 'extract_data_from_s3'
    op_kwargs:
      s3_bucket: 'my-bucket'
      s3_key: 'data/file2.csv'

  - task_id: 'extract_data_task3'
    operator: 'PythonOperator'
    python_callable: 'extract_data_from_s3'
    op_kwargs:
      s3_bucket: 'my-bucket'
      s3_key: 'data/file3.csv'

  - task_id: 'transform_data_task1'
    operator: 'PythonOperator'
    python_callable: 'transform_data'
    op_kwargs:
      file_path: '/tmp/file1.csv'

  - task_id: 'transform_data_task2'
    operator: 'PythonOperator'
    python_callable: 'transform_data'
    op_kwargs:
      file_path: '/tmp/file2.csv'

  - task_id: 'transform_data_task3'
    operator: 'PythonOperator'
    python_callable: 'transform_data'
    op_kwargs:
      file_path: '/tmp/file3.csv'

  - task_id: 'load_data_to_snowflake_task1'
    operator: 'PythonOperator'
    python_callable: 'load_data_to_snowflake'
    op_kwargs:
      file_path: '/tmp/transformed_file1.csv'
      table_name: 'snowflake_table_1'

  - task_id: 'load_data_to_snowflake_task2'
    operator: 'PythonOperator'
    python_callable: 'load_data_to_snowflake'
    op_kwargs:
      file_path: '/tmp/transformed_file2.csv'
      table_name: 'snowflake_table_2'

  - task_id: 'load_data_to_snowflake_task3'
    operator: 'PythonOperator'
    python_callable: 'load_data_to_snowflake'
    op_kwargs:
      file_path: '/tmp/transformed_file3.csv'
      table_name: 'snowflake_table_3'

  - task_id: 'email_notification'
    operator: 'EmailOperator'
    to: 'data_team@example.com'
    subject: 'S3 to Snowflake Data Pipeline Completed'
    html_content: 'The S3 to Snowflake pipeline has successfully loaded all data.'

  - task_id: 'end_task'
    operator: 'BashOperator'
    bash_command: 'echo "End of DAG"'

dependencies:
  - ['start_task', 'extract_data_task1']
  - ['start_task', 'extract_data_task2']
  - ['start_task', 'extract_data_task3']

  - ['extract_data_task1', 'transform_data_task1']
  - ['extract_data_task2', 'transform_data_task2']
  - ['extract_data_task3', 'transform_data_task3']

  - ['transform_data_task1', 'load_data_to_snowflake_task1']
  - ['transform_data_task2', 'load_data_to_snowflake_task2']
  - ['transform_data_task3', 'load_data_to_snowflake_task3']

  - ['load_data_to_snowflake_task1', 'email_notification']
  - ['load_data_to_snowflake_task2', 'email_notification']
  - ['load_data_to_snowflake_task3', 'email_notification']

  - ['email_notification', 'end_task']`
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const loadExample = (exampleKey: 'simple' | 'complex') => {
    setInput(examples[exampleKey])
    setIsDropdownOpen(false)
  }

  const [isInfoOpen, setIsInfoOpen] = useState(false)

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Navbar */}
      <nav className={`flex items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md relative z-10`}>
        <div className="flex items-center space-x-4 flex-grow">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>DAG Sketch 🎨</h1>
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex items-center`}
            >
              <BookOpen size={16} className="mr-2" />
              Examples
              <ChevronDown size={16} className="ml-2" />
            </button>
            {isDropdownOpen && (
              <div className={`absolute mt-2 w-48 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-20`}>
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button
                    onClick={() => loadExample('simple')}
                    className={`block px-4 py-2 text-sm w-full text-left ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    role="menuitem"
                  >
                    Simple Example
                  </button>
                  <button
                    onClick={() => loadExample('complex')}
                    className={`block px-4 py-2 text-sm w-full text-left ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    role="menuitem"
                  >
                    Complex Example
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex items-center`}
          >
            <Info size={16} className="mr-2" />
            Info
          </button>
          {isInfoOpen && (
            <div className={`absolute top-16 left-4 w-96 p-4 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} ring-1 ring-black ring-opacity-5 z-20`}>
              <h2 className="text-lg font-semibold mb-2">DAG Sketch</h2>
              <p className="mb-2">
                DAG Sketch is an open-source tool for visualizing Directed Acyclic Graphs (DAGs) from YAML-based DAGML definitions.
              </p>
              <p className="mb-2">
                DAGML (DAG Markup Language) is a YAML-based format for defining DAGs, commonly used in workflow orchestration tools like Apache Airflow.
              </p>
              <p className="mb-2">
                Instructions:
                <ol className="list-decimal list-inside">
                  <li>Write or paste your DAGML definition in the editor on the left.</li>
                  <li>The visualization will update in real-time on the right.</li>
                  <li>Use the Examples dropdown to load sample DAGML structures.</li>
                </ol>
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://github.com/camilocbarrera/dag-sketch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-blue-500 hover:underline ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
                >
                  GitHub Repository
                </a>
                <a
                  href="https://github.com/camilocbarrera/dag-sketch/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-blue-500 hover:underline ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
                >
                  Report Issues
                </a>
              </div>
            </div>
          )}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-grow relative" ref={containerRef}>
        <div style={{ width: `${editorWidth}%` }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden flex flex-col`}>
          <div className={`flex-grow border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg m-4 overflow-hidden shadow-lg`}>
            <Editor
              height="100%"
              language="yaml"
              theme={isDarkMode ? "vs-dark" : "light"}
              value={input}
              options={{
                ...editorOptions,
                automaticLayout: true,
                tabSize: 2,
              }}
              onChange={handleEditorChange}
              beforeMount={handleEditorWillMount}
              onMount={handleEditorDidMount}
              className="rounded-lg"
            />
          </div>
        </div>
        <div
          className={`w-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} cursor-col-resize hover:bg-blue-500 transition-colors`}
          onMouseDown={handleMouseDown}
        ></div>
        <div style={{ width: `${100 - editorWidth}%` }} className="p-4">
          <div className={`w-full h-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              connectionMode={ConnectionMode.Loose}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              className={isDarkMode ? 'react-flow-dark' : ''}
            >
              <Controls />
              <Background color={isDarkMode ? "#333333" : "#f0f0f0"} gap={16} />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  )
}

export function YamlDagVisualizer() {
  return (
    <ReactFlowProvider>
      <DAGVisualizerContent />
    </ReactFlowProvider>
  )
}