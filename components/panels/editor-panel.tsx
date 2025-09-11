"use client"

import React, { useRef } from 'react'
import Editor, { OnChange, Monaco } from "@monaco-editor/react"
import { editor } from 'monaco-editor'
import { EDITOR_OPTIONS } from '../../lib/constants'
import { setupMonacoLanguages } from '../../lib/monaco-setup'
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
    <div className="flex flex-col h-full gap-2 p-2">
      <div className="flex-grow border border-border/60 rounded-lg overflow-hidden bg-card shadow-elegant">
        <Editor
          height="100%"
          language={mode === 'dagml' ? "yaml" : "bitshift"}
          theme={isDarkMode ? "dst-dark" : "dst-light"}
          value={input}
          options={{
            ...EDITOR_OPTIONS,
            automaticLayout: true,
            tabSize: 2,
            fontSize: isMobile ? 11 : 12,
            lineHeight: 1.3,
            padding: { top: 8, bottom: 8 },
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
          }}
          onChange={onInputChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
        />
      </div>
      
      <div 
        id="repl-output"
        className="h-28 md:h-32 border border-border/60 rounded-lg overflow-hidden bg-card shadow-elegant flex flex-col"
      >
        <div className="px-3 py-2 bg-gradient-to-r from-muted/40 via-muted/20 to-transparent border-b border-border/40">
          <span className="text-xs font-medium text-muted-foreground font-mono flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
            Output
          </span>
        </div>
        <div className="flex-1 overflow-auto">
          <pre className="p-3 text-xs font-mono leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {replOutput || (
              <span className="text-muted-foreground/70 italic">
                No output yet... Start by editing your DAG definition above.
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
