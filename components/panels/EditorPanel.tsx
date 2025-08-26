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
    <>
      <div className={`flex-grow border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg m-2 md:m-4 overflow-hidden shadow-lg`}>
        <Editor
          height="100%"
          language={mode === 'dagml' ? "yaml" : "bitshift"}
          theme={isDarkMode ? "vs-dark" : "light"}
          value={input}
          options={{
            ...EDITOR_OPTIONS,
            automaticLayout: true,
            tabSize: 2,
            fontSize: isMobile ? 12 : 14,
          }}
          onChange={onInputChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          className="rounded-lg"
        />
      </div>
      
      {/* REPL output section */}
      <div className={`h-32 md:h-48 border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg mx-2 md:mx-4 mb-2 md:mb-4 overflow-hidden shadow-lg`}>
        <div className={`p-2 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
          REPL Output
        </div>
        <pre className={`p-2 md:p-4 overflow-auto h-[calc(100%-2rem)] ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} text-xs md:text-sm`}>
          {replOutput}
        </pre>
      </div>
    </>
  );
}
