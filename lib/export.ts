import { ReactFlowInstance } from 'reactflow'
import { saveAs } from 'file-saver'
import html2canvas from 'html2canvas'

export function exportDagLineage(reactFlowInstance: ReactFlowInstance | null, dagId: string) {
  if (!reactFlowInstance) {
    console.error('ReactFlow instance is not available');
    return;
  }

  const reactFlowContainer = document.querySelector('.react-flow') as HTMLElement;
  if (!reactFlowContainer) {
    console.error('ReactFlow container not found');
    return;
  }

  const originalStyle = reactFlowContainer.style.overflow;
  reactFlowContainer.style.overflow = 'visible';

  html2canvas(reactFlowContainer, {
    backgroundColor: null,
    scale: 2,
  }).then((canvas) => {
    reactFlowContainer.style.overflow = originalStyle;

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${dagId}_lineage.png`);
      }
    });
  });
}


