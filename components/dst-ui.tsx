"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import Editor, { Monaco, OnChange } from "@monaco-editor/react";
// import type * as monaco from 'monaco-editor';
import React from 'react'
import Head from 'next/head';

import ReactFlow, {
  Node,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Controls,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  ReactFlowInstance,
  EdgeProps,
  getBezierPath,
  Edge, // Add this import
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Sun, Moon, BookOpen, ChevronDown, Info, Download, Image, FileCode, FileJson } from 'lucide-react'
import yaml from 'js-yaml'
import dagre from 'dagre';
import { editor } from 'monaco-editor';  // Add this import if not already present
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { Onboarding } from './Onboarding';

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

// Add this interface near the top of the file, after the imports
interface CustomNodeData {
  label: string;
  operator: string;
  status?: 'success' | 'skipped' | 'failed';
}

const CustomNode = ({ data }: { data: CustomNodeData }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [nodeWidth, setNodeWidth] = useState(160); // Default width

  useEffect(() => {
    if (nodeRef.current) {
      const labelWidth = nodeRef.current.querySelector('.label')?.scrollWidth || 0;
      const operatorWidth = nodeRef.current.querySelector('.operator')?.scrollWidth || 0;
      const contentWidth = Math.max(labelWidth, operatorWidth);
      setNodeWidth(Math.max(160, contentWidth + 40)); // 40px for padding and border
    }
  }, [data.label, data.operator]);

  return (
    <div 
      ref={nodeRef}
      className="bg-white rounded-md shadow-md overflow-hidden border-2 border-blue-500" 
      style={{ width: nodeWidth }}
    >
      <div className="px-3 py-2 bg-blue-50">
        <div className="label font-semibold text-s text-blue-900 whitespace-nowrap" title={data.label}>{data.label}</div>
      </div>
      <div className="px-3 py-2">
        <div className="operator text-sm text-gray-800 whitespace-nowrap" title={data.operator}>{data.operator}</div>
      </div>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-500" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-500" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
}

// Define an interface for the parsed YAML structure
interface ParsedYAML {
  dag?: {
    dag_id?: string;
    schedule_interval?: string;
    start_date?: string;
    default_args?: Record<string, unknown>;
  };
  tasks?: Array<{
    task_id: string;
    operator: string;
    [key: string]: string | number | boolean | object;
  }>;
  dependencies?: Array<[string, string]>;
  [key: string]: unknown;
}

function generatePythonDAG(dagml: ParsedYAML): string {
  const operators = new Set(dagml.tasks?.map(task => task.operator) || []);
  const operatorImports = Array.from(operators).map(operator => 
    `from airflow.operators.${operator.toLowerCase()} import ${operator}`
  ).join('\n');

  const tasks = dagml.tasks?.map(task => {
    let taskParams = '';
    if (task.operator === 'BashOperator') {
      taskParams = `bash_command='${task.bash_command}'`;
    } else if (task.operator === 'PythonOperator') {
      taskParams = `python_callable=${task.python_callable}`;
    }
    return `
    ${task.task_id} = ${task.operator}(
        task_id='${task.task_id}',
        ${taskParams}
    )`;
  }).join('\n') || '';

  const dependencies = dagml.dependencies?.map(dep => 
    `    ${dep[0]} >> ${dep[1]}`
  ).join('\n') || '';

  const defaultArgs = dagml.dag?.default_args ? JSON.stringify(dagml.dag.default_args, null, 4) : '{}';

  return `
from airflow import DAG
from datetime import datetime, timedelta
${operatorImports}

default_args = ${defaultArgs}

with DAG(
    '${dagml.dag?.dag_id || 'generated_dag'}',
    default_args=default_args,
    description='Generated DAG from DAGML',
    schedule_interval='${dagml.dag?.schedule_interval || '@daily'}',
    start_date=datetime.strptime('${dagml.dag?.start_date || '2024-01-01'}', '%Y-%m-%d'),
    catchup=False,
) as dag:

    # Tasks definition
${tasks}

    # Dependencies
${dependencies}
`;
}

function exportDagLineage(reactFlowInstance: ReactFlowInstance | null, dagId: string) {
  if (!reactFlowInstance) {
    console.error('ReactFlow instance is not available');
    return;
  }

  const reactFlowContainer = document.querySelector('.react-flow') as HTMLElement;
  if (!reactFlowContainer) {
    console.error('ReactFlow container not found');
    return;
  }

  // Temporarily remove the 'overflow: hidden' style
  const originalStyle = reactFlowContainer.style.overflow;
  reactFlowContainer.style.overflow = 'visible';

  html2canvas(reactFlowContainer, {
    backgroundColor: null,
    scale: 2, // Increase resolution
  }).then((canvas) => {
    // Restore the original style
    reactFlowContainer.style.overflow = originalStyle;

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${dagId}_lineage.png`);
      }
    });
  });
}

// Update the DotGrid component for better customization
const DotGrid = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="dot-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill={isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"} />
      </pattern>
      <rect width="100%" height="100%" fill="url(#dot-pattern)" />
    </svg>
  );
};

function DAGVisualizerContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [input, setInput] = useState(`# Example DAGML file (my_dagml.dagml)
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

  // Remove this line as we won't be using onConnect anymore
  // const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  // Update the getLayoutedElements function to use the new node width
  const getLayoutedElements = useCallback((
    nodes: Node[], 
    edges: Edge[], 
    direction = 'LR'
  ) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ 
      rankdir: direction,
      ranksep: 150, // Increase vertical separation between ranks
      nodesep: 100  // Increase horizontal separation between nodes
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: node.width || 160, height: 80 });
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
          x: nodeWithPosition.x - (node.width || 160) / 2,
          y: nodeWithPosition.y - 80 / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges };
  }, []);

  // Add new state for REPL output
  const [replOutput, setReplOutput] = useState('')

  // Modify parseYAML function to update REPL output
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
          style: { stroke: isDarkMode ? '#b1b1b7' : '#666666' },
        }));
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'LR');

      // Clear existing nodes and edges before setting new ones
      setNodes([])
      setEdges([])

      // Use a setTimeout to ensure the clearing has taken effect before adding new elements
      setTimeout(() => {
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
      }, 0)

      // Update REPL output
      setReplOutput(JSON.stringify(parsedYAML, null, 2))

      // Generate Python code
      const pythonCode = generatePythonDAG(parsedYAML);
      setGeneratedPythonCode(pythonCode);

    } catch (error) {
      console.error('Error parsing YAML:', error)
      setReplOutput(`Error parsing YAML: ${error}`)
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
        fitView();
      }, 0);
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

    // Register the Bitshift language
    monaco.languages.register({ id: 'bitshift' });

    monaco.languages.registerCompletionItemProvider('bitshift', {
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
            label: '>>',
            kind: monaco.languages.CompletionItemKind.Operator,
            insertText: ' >> ',
            documentation: 'Bitshift operator for task dependencies'
          },
          {
            label: '[]',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '[$1]',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Group tasks'
          },
          // Add more Bitshift-specific suggestions here
        ];

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

  const [mode, setMode] = useState<'dagml' | 'bitshift'>('dagml')

  const [examples] = useState({
    dagml: {
      simple: `# Example DAGML file (my_dagml.dagml)
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
    },
    bitshift: {
      simple: `start >> [check_source_A, check_source_B]

check_source_A >> process_source_A
check_source_B >> process_source_B

[process_source_A, process_source_B] >> consolidate_data

consolidate_data >> generate_report
generate_report >> end`,
      complex: `start >> [extract_data_A, extract_data_B, extract_data_C]

extract_data_A >> [transform_data_A, validate_data_A]
extract_data_B >> [transform_data_B, validate_data_B]
extract_data_C >> [transform_data_C, validate_data_C]

[transform_data_A, transform_data_B, transform_data_C] >> merge_data
[validate_data_A, validate_data_B, validate_data_C] >> generate_validation_report

merge_data >> [load_to_warehouse, generate_analytics]
generate_validation_report >> notify_data_quality

[load_to_warehouse, generate_analytics] >> update_metadata
notify_data_quality >> update_metadata

update_metadata >> end`
    }
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as HTMLElement)) {
        setIsDropdownOpen(false);
      }
      if (infoRef.current && !infoRef.current.contains(event.target as HTMLElement)) {
        setIsInfoOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadExample = (exampleKey: 'simple' | 'complex') => {
    setInput(examples[mode][exampleKey])
    setIsDropdownOpen(false)
  }

  const toggleMode = () => {
    const newMode = mode === 'dagml' ? 'bitshift' : 'dagml'
    setMode(newMode)
    setInput(examples[newMode].simple)  // Load the simple example of the new mode
  }

  const parseBitshift = useCallback((input: string) => {
    const lines = input.split('\n').filter(line => line.trim() !== '')
    const newNodes: Node[] = []
    const newEdges: Edge[] = []
    const nodeSet = new Set<string>()

    const isValidNodeId = (id: string) => {
      // Check if the id contains any special characters
      return !/[>,[,\]]/.test(id);
    }

    const addNode = (id: string) => {
      if (id && !nodeSet.has(id) && isValidNodeId(id)) {
        newNodes.push({
          id: id,
          type: 'custom',
          data: { label: id, operator: 'Operator' },
          position: { x: 0, y: 0 },
        })
        nodeSet.add(id)
      }
    }

    const addEdge = (source: string, target: string) => {
      if (source && target && isValidNodeId(source) && isValidNodeId(target)) {
        newEdges.push({
          id: `${source}-${target}`,
          source: source,
          target: target,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#b1b1b7' },
        })
      }
    }

    lines.forEach(line => {
      const parts = line.split('>>').map(part => part.trim())
      
      parts.forEach(part => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const innerParts = part.slice(1, -1).split(',').map(t => t.trim()).filter(t => t !== '')
          innerParts.forEach(addNode)
        } else if (part) {
          addNode(part)
        }
      })

      // Create edges only if there are at least two parts
      if (parts.length >= 2) {
        for (let i = 0; i < parts.length - 1; i++) {
          const sourceTasks = parts[i].startsWith('[') && parts[i].endsWith(']')
            ? parts[i].slice(1, -1).split(',').map(t => t.trim()).filter(t => t !== '')
            : [parts[i]]
          
          const targetTasks = parts[i+1].startsWith('[') && parts[i+1].endsWith(']')
            ? parts[i+1].slice(1, -1).split(',').map(t => t.trim()).filter(t => t !== '')
            : [parts[i+1]]

          sourceTasks.forEach(source => {
            targetTasks.forEach(target => {
              addEdge(source, target)
            })
          })
        }
      }
    })

    if (newNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges)

      setNodes([])
      setEdges([])

      setTimeout(() => {
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
      }, 0)
    } else {
      setNodes([])
      setEdges([])
    }

    // Update REPL output
    const parsedStructure = {
      nodes: newNodes.map(node => node.id),
      edges: newEdges.map(edge => ({ source: edge.source, target: edge.target }))
    }
    setReplOutput(JSON.stringify(parsedStructure, null, 2))
  }, [getLayoutedElements, setNodes, setEdges])

  const parseInput = useCallback((input: string) => {
    if (mode === 'dagml') {
      parseYAML(input)
    } else {
      parseBitshift(input)
    }
  }, [mode, parseYAML, parseBitshift])

  useEffect(() => {
    parseInput(input)
  }, [input, parseInput])

  const reactFlowInstance = useReactFlow();

  const handleExport = (type: 'lineage' | 'python' | 'dagml') => {
    if (mode !== 'dagml') {
      alert('Export is only available in DAGML mode');
      return;
    }

    try {
      const dagml = yaml.load(input) as ParsedYAML;
      const dagId = dagml.dag?.dag_id || 'generated_dag';
      
      switch (type) {
        case 'lineage':
          exportDagLineage(reactFlowInstance, dagId);
          break;
        case 'python':
          const pythonCode = generatePythonDAG(dagml);
          const pythonBlob = new Blob([pythonCode], { type: 'text/plain;charset=utf-8' });
          saveAs(pythonBlob, `${dagId}.py`);
          break;
        case 'dagml':
          const dagmlBlob = new Blob([input], { type: 'text/plain;charset=utf-8' });
          saveAs(dagmlBlob, `${dagId}.dagml`);
          break;
      }
    } catch (error) {
      console.error('Error exporting DAG:', error);
      alert('Error exporting DAG. Please check your DAGML syntax.');
    }
  };

  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Element)) {
        setIsExportDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [generatedPythonCode, setGeneratedPythonCode] = useState('');
  const [rightSideTab, setRightSideTab] = useState<'graph' | 'python'>('graph');

  useEffect(() => {
    if (mode !== 'dagml') {
      setRightSideTab('graph');
    }
  }, [mode]);

  // Update the CustomEdge component
  const CustomEdge = useCallback(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
  }: EdgeProps) => {
    const [edgePath] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    // Define colors for light and dark modes
    const lightModeColor = '#3b82f6'; // Blue color
    const darkModeColor = '#60a5fa'; // Lighter blue color for better visibility in dark mode

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
  }, [isDarkMode]);

  // Make sure to add this to your edge types
  const edgeTypes = {
    custom: CustomEdge,
  };

  return (
    <>
      <Head>
        <title>DAG Sketch Tool - Visualize and Design Airflow DAGs</title>
        <meta name="description" content="An open-source tool for visualizing and designing Directed Acyclic Graphs (DAGs) using YAML-based DAGML or Airflow-style bitshift syntax. You can also generate the code for your DAGs." />
        <meta name="keywords" content="DAG, Directed Acyclic Graph, Apache Airflow, DAGML, Data Visualization, Workflow Management, Data Pipeline Design, Workflow Automation, Data Engineering, ETL Processes, Task Scheduling, Data Pipeline Visualization, Cloud Computing, Open Source Tools" />
        <meta name="author" content="Cristian Correa" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.dag-sketch.com" />
      </Head>
      <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {/* Navbar */}
        <nav className={`flex items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md relative z-10`}>
          <div className="flex items-center space-x-4 flex-grow">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>DAG Sketch Tool 🎨</h1>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex items-center`}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
              >
                <BookOpen size={16} className="mr-2" aria-hidden="true" />
                <span>Examples</span>
                <ChevronDown size={16} className="ml-2" aria-hidden="true" />
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
            <div ref={infoRef}>
              <button
                onClick={() => setIsInfoOpen(!isInfoOpen)}
                className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex items-center`}
              >
                <Info size={16} className="mr-2" />
                Info
              </button>
              {isInfoOpen && (
                <div className={`absolute top-16 left-4 w-96 p-4 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} ring-1 ring-black ring-opacity-5 z-20`}>
                  <h2 className="text-lg font-semibold mb-4">DAG Sketch</h2>
                  
                  <section className="mb-4">
                    <p className="mb-2">
                      An open-source tool for visualizing Directed Acyclic Graphs (DAGs) from YAML-based DAGML definitions.
                    </p>
                    <p>
                      DAGML (DAG Markup Language) is a YAML-based format for defining DAGs, commonly used in workflow orchestration tools like Apache Airflow.
                    </p>
                  </section>

                  <section className="mb-4">
                    <h3 className="text-md font-semibold mb-2">Bitshift Mode</h3>
                    <p>
                      In Airflow, the <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{'>>'}</code> operators (called bitshift operators) are used to define task dependencies. Use this syntax in Bitshift mode.
                    </p>
                  </section>

                  <section className="mb-4">
                    <h3 className="text-md font-semibold mb-2">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Write or paste your DAGML definition in the left editor.</li>
                      <li>The visualization updates in real-time on the right.</li>
                      <li>Use the Examples dropdown for sample DAGML structures.</li>
                      <li>Toggle between DAGML and Bitshift modes for different syntax.</li>
                    </ol>
                  </section>

                  <section className="flex flex-col space-y-2">
                    <a
                      href="https://github.com/camilocbarrera/dst"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-blue-500 hover:underline ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
                    >
                      GitHub Repository
                    </a>
                    <a
                      href="https://github.com/camilocbarrera/dst/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-blue-500 hover:underline ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
                    >
                      Report Issues
                    </a>
                    <a 
                      href="https://stackoverflow.com/questions/52389105/how-operator-defines-task-dependencies-in-airflow"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-blue-500 hover:underline ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'}`}
                    >
                      Learn more about bitshift operators in Airflow
                    </a>
                  </section>
                </div>
              )}
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>DAGML</span>
              <button
                id="mode-toggle"
                onClick={toggleMode}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                  mode === 'bitshift' ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                    mode === 'bitshift' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Bitshift ≫</span>
            </div>
            {mode === 'dagml' && (
              <div id="export-button" className="relative" ref={exportDropdownRef}>
                <button
                  onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                  className={`px-3 py-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'} flex items-center`}
                >
                  <Download size={16} className="mr-2" />
                  Export
                  <ChevronDown size={16} className="ml-2" />
                </button>
                {isExportDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-20`}>
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      <button
                        onClick={() => { handleExport('lineage'); setIsExportDropdownOpen(false); }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        role="menuitem"
                      >
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image size={16} className="mr-2" />
                        DAG Lineage (PNG)
                      </button>
                      <button
                        onClick={() => { handleExport('python'); setIsExportDropdownOpen(false); }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        role="menuitem"
                      >
                        <FileCode size={16} className="mr-2" />
                        Python Skeleton (.py)
                      </button>
                      <button
                        onClick={() => { handleExport('dagml'); setIsExportDropdownOpen(false); }}
                        className={`flex items-center w-full px-4 py-2 text-sm ${isDarkMode ? 'text-gray-100 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        role="menuitem"
                      >
                        <FileJson size={16} className="mr-2" />
                        DAGML File (.dagml)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Main content */}
        <div className="flex flex-grow relative" ref={containerRef}>
          <div id="editor" style={{ width: `${editorWidth}%` }} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden flex flex-col`}>
            <div className={`flex-grow border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg m-4 overflow-hidden shadow-lg`}>
              <Editor
                height="100%"
                language={mode === 'dagml' ? "yaml" : "bitshift"}
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
            {/* REPL output section */}
            <div id="repl-output" className={`h-48 border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg mx-4 mb-4 overflow-hidden shadow-lg`}>
              <div className={`p-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
                REPL Output
              </div>
              <pre className={`p-4 overflow-auto h-[calc(100%-2rem)] ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                {replOutput}
              </pre>
            </div>
          </div>
          <div
            className={`w-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} cursor-col-resize hover:bg-blue-600 transition-colors`}
            onMouseDown={handleMouseDown}
          ></div>
          <div style={{ width: `${100 - editorWidth}%` }} className="p-4 flex flex-col">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                id="graph"
                className={`py-2 px-4 flex items-center ${rightSideTab === 'graph' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setRightSideTab('graph')}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                  id="code-tab"
                  className={`py-2 px-4 flex items-center ${rightSideTab === 'python' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setRightSideTab('python')}
                >
                  <FileCode size={20} className="mr-2" />
                  Code
                </button>
              )}
            </div>
            {rightSideTab === 'graph' || mode !== 'dagml' ? (
              <div className={`flex-grow ${isDarkMode ? 'bg-gray-900' : 'bg-gray-200'} rounded-lg shadow-md overflow-hidden`}>
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
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                  nodesConnectable={false}
                  edgesUpdatable={true}
                  nodesDraggable={true}
                >
                  <Controls />
                  <DotGrid isDarkMode={isDarkMode} />
                </ReactFlow>
              </div>
            ) : (
              <div className={`flex-grow border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg overflow-hidden shadow-lg`}>
                <Editor
                  height="100%"
                  language="python"
                  theme={isDarkMode ? "vs-dark" : "light"}
                  value={generatedPythonCode}
                  options={{
                    ...editorOptions,
                    automaticLayout: true,
                    tabSize: 4,
                    readOnly: true,
                  }}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Onboarding />
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