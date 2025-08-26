import { Monaco } from "@monaco-editor/react";
import { Node } from 'reactflow';

export function setupMonacoLanguages(monaco: Monaco, getNodes: () => Node[]) {
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
      ];

      // Add dynamic suggestions for dependencies based on current nodes
      const lineContent = model.getLineContent(position.lineNumber);
      if (lineContent.trim().startsWith('-') && lineContent.includes('dependencies')) {
        suggestions.push(...createDependencySnippet({ nodes: getNodes() }));
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
      ];

      return {
        suggestions: suggestions.map(s => ({ ...s, range }))
      };
    }
  });
}
