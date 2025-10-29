import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onCodeChange, language = 'javascript' }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const isLocalChange = useRef(false);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    
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
    });

    // Set up theme based on current theme
    const isDark = document.documentElement.classList.contains('dark');
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
  };

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

  const getLanguageDisplayName = (lang: string): string => {
    const languageMap: { [key: string]: string } = {
      'javascript': 'JavaScript',
      'typescript': 'TypeScript',
      'html': 'HTML',
      'css': 'CSS',
      'python': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'json': 'JSON',
      'xml': 'XML',
      'markdown': 'Markdown',
      'sql': 'SQL',
      'shell': 'Shell',
      'powershell': 'PowerShell',
      'dockerfile': 'Dockerfile',
      'yaml': 'YAML',
      'plaintext': 'Plain Text'
    };
    return languageMap[lang] || lang.toUpperCase();
  };

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
};

export default CodeEditor;
