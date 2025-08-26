import dagre from 'dagre'
import { Node, Edge } from 'reactflow'

export function getLayoutedElements(
  nodes: Node[], 
  edges: Edge[], 
  direction: 'LR' | 'TB' = 'LR'
) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ 
    rankdir: direction,
    ranksep: 150,
    nodesep: 100
  });

  nodes.forEach((node) => {
    const nodeWidth = (node.data?.width as number) || 160;
    dagreGraph.setNode(node.id, { width: nodeWidth, height: 80 });
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
        x: nodeWithPosition.x - ((node.data?.width as number) || 160) / 2,
        y: nodeWithPosition.y - 80 / 2,
      },
    } as Node;
  });

  return { nodes: layoutedNodes, edges };
}


