import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  language?: string;
  onSelectionChange?: (selection: monaco.Selection | null, cursor: { lineNumber: number; column: number }) => void;
  remoteSelections?: Map<string, { selection: monaco.Selection | null; cursor: { lineNumber: number; column: number }; username: string; color: string }>;
}

export interface CodeEditorRef {
  formatCode: () => Promise<void>;
  getErrors: () => monaco.editor.IMarker[];
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({ code, onCodeChange, language = 'javascript' }, ref) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isLocalChange = useRef(false);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    const model = editor.getModel();
    
    if (!model) return;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 1.5,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      // Enable error highlighting
      glyphMargin: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      // Show errors inline
      renderValidationDecorations: 'on',
      showFoldingControls: 'always',
    });

    // Set up theme based on current theme
    const isDark = document.documentElement.classList.contains('dark');
    monacoInstance.editor.setTheme(isDark ? 'vs-dark' : 'vs');

    // Enhanced diagnostics - Monaco already has built-in validation
    // But we can customize it for better error detection
    const updateDecorations = () => {
      // Errors are displayed in the SyntaxErrorPanel component
    };

    // Listen to marker changes
    monacoInstance.editor.onDidChangeMarkers((uris) => {
      if (uris.includes(model.uri)) {
        updateDecorations();
      }
    });

    // Initial update
    updateDecorations();
  };

  // Expose format function and error getter via ref
  useImperativeHandle(ref, () => ({
    formatCode: async () => {
      if (!editorRef.current) return;
      
      try {
        const action = editorRef.current.getAction('editor.action.formatDocument');
        if (action && await action.isSupported()) {
          await action.run();
          // Format was successful, trigger code change
          const formattedCode = editorRef.current.getValue();
          if (formattedCode !== code) {
            isLocalChange.current = true;
            onCodeChange(formattedCode);
            isLocalChange.current = false;
          }
        }
      } catch (error) {
        // Formatting failed - user will see error in editor
      }
    },
    getErrors: () => {
      if (!editorRef.current) return [];
      const model = editorRef.current.getModel();
      if (!model) return [];
      return monaco.editor.getModelMarkers({ resource: model.uri });
    },
  }), [code, onCodeChange]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && !isLocalChange.current) {
      onCodeChange(value);
    }
  };

  // Update editor content when code changes from external source
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== code) {
      isLocalChange.current = true;
      editorRef.current.setValue(code);
      isLocalChange.current = false;
    }
  }, [code]);

  // Update language when it changes
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setModelLanguage(editorRef.current.getModel()!, language);
    }
  }, [language]);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (editorRef.current) {
        // Monaco editor theme will be updated automatically by the Editor component
        // No need to manually handle theme changes
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full w-full">
      {/* Monaco Editor */}
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="auto"
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          fontSize: 14,
          lineHeight: 1.5,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: 2,
          insertSpaces: true,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          suggest: {
            showKeywords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
        }}
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
