import yaml from 'js-yaml'
import { Node, Edge } from 'reactflow'
import { ParsedYAML } from '../types/dag'
import { generatePythonDAG } from './generatePython'

export function parseYAMLInput(
  input: string,
  isDarkMode: boolean,
  getLayoutedElements: (nodes: Node[], edges: Edge[], direction?: 'LR' | 'TB') => { nodes: Node[], edges: Edge[] }
) {
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
      style: { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 2 },
    }));
  }

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'LR');
  const replOutput = JSON.stringify(parsedYAML, null, 2);
  const pythonCode = generatePythonDAG(parsedYAML);

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
    replOutput,
    pythonCode
  };
}

export function parseBitshiftInput(
  input: string,
  isDarkMode: boolean,
  getLayoutedElements: (nodes: Node[], edges: Edge[], direction?: 'LR' | 'TB') => { nodes: Node[], edges: Edge[] }
) {
  const lines = input.split('\n').filter(line => line.trim() !== '')
  const newNodes: Node[] = []
  const newEdges: Edge[] = []
  const nodeSet = new Set<string>()

  const isValidNodeId = (id: string) => {
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
        style: { stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 2 },
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

  let layoutedNodes: Node[] = [];
  let layoutedEdges: Edge[] = [];

  if (newNodes.length > 0) {
    const result = getLayoutedElements(newNodes, newEdges);
    layoutedNodes = result.nodes;
    layoutedEdges = result.edges;
  }

  const parsedStructure = {
    nodes: newNodes.map(node => node.id),
    edges: newEdges.map(edge => ({ source: edge.source, target: edge.target }))
  }
  const replOutput = JSON.stringify(parsedStructure, null, 2);

  return {
    nodes: layoutedNodes,
    edges: layoutedEdges,
    replOutput
  };
}
