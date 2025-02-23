'use client';

import { useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import * as yaml from 'yaml';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}

export default function MonacoEditor({ value, onChange, readOnly = false, height = '500px' }: MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const formatYaml = (editor: monaco.editor.IStandaloneCodeEditor) => {
    try {
      const value = editor.getValue();
      // Parse and stringify to format
      const formatted = yaml.stringify(yaml.parse(value), {
        indent: 2,
        lineWidth: 0, // Disable line wrapping
      });
      editor.setValue(formatted);
    } catch (error) {
      console.error('Failed to format YAML:', error);
    }
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    // Register a custom format action
    editor.addAction({
      id: 'yaml-format',
      label: 'Format YAML',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        monaco.KeyMod.Alt | monaco.KeyCode.KeyF
      ],
      run: () => formatYaml(editor)
    });

    // Add format on save command
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => formatYaml(editor)
    );

    // Add alternative format command
    editor.addCommand(
      monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => formatYaml(editor)
    );
  };

  const handleEditorWillMount = (monaco: Monaco) => {
    // Configure YAML language features
    monaco.languages.register({ id: 'yaml' });

    // Add YAML formatter provider
    monaco.languages.registerDocumentFormattingEditProvider('yaml', {
      provideDocumentFormattingEdits: (model) => {
        try {
          const text = model.getValue();
          const formatted = yaml.stringify(yaml.parse(text), {
            indent: 2,
            lineWidth: 0,
          });
          
          return [{
            range: model.getFullModelRange(),
            text: formatted,
          }];
        } catch (error) {
          console.error('Failed to format YAML:', error);
          return [];
        }
      }
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="yaml"
        value={value}
        onChange={(value) => onChange(value || '')}
        options={{
          theme: 'vs',
          automaticLayout: true,
          minimap: {
            enabled: false
          },
          fontSize: 14,
          lineNumbers: 'on',
          readOnly,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          renderWhitespace: 'selection',
          folding: true,
          lineDecorationsWidth: 5,
          renderLineHighlight: 'line',
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10
          },
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true
        }}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
      />
    </div>
  );
} 