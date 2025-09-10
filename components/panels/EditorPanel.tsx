"use client"

import React, { useRef } from 'react'
import Editor, { OnChange, Monaco } from "@monaco-editor/react"
import { editor } from 'monaco-editor'
import { EDITOR_OPTIONS } from '../../lib/constants'
import { setupMonacoLanguages } from '../../lib/monacoSetup'
import { Node } from 'reactflow'

interface EditorPanelProps {
  isDarkMode: boolean;
  isMobile: boolean;
  mode: 'dagml' | 'bitshift';
  input: string;
  onInputChange: OnChange;
  replOutput: string;
  nodes: Node[];
}

export function EditorPanel({ 
  isDarkMode, 
  isMobile, 
  mode, 
  input, 
  onInputChange, 
  replOutput,
  nodes 
}: EditorPanelProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorWillMount = (monaco: Monaco) => {
    setupMonacoLanguages(monaco, () => nodes);
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  return (
    <div className="flex flex-col h-full gap-1.5 p-1.5">
      <div className="flex-grow border border-border rounded-md overflow-hidden bg-card">
        <Editor
          height="100%"
          language={mode === 'dagml' ? "yaml" : "bitshift"}
          theme={isDarkMode ? "vs-dark" : "light"}
          value={input}
          options={{
            ...EDITOR_OPTIONS,
            automaticLayout: true,
            tabSize: 2,
            fontSize: isMobile ? 11 : 12,
            lineHeight: 1.3,
            padding: { top: 6, bottom: 6 },
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
          onChange={onInputChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
        />
      </div>
      
      <div className="h-28 md:h-32 border border-border rounded-md overflow-hidden bg-card flex flex-col">
        <div className="px-2.5 py-1.5 bg-muted/30 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground font-mono">
            Output
          </span>
        </div>
        <div className="flex-1 overflow-auto">
          <pre className="p-2.5 text-xs font-mono leading-tight text-foreground whitespace-pre-wrap">
            {replOutput || 'No output yet...'}
          </pre>
        </div>
      </div>
    </div>
  );
}
