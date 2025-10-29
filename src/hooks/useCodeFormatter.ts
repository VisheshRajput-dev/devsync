import { useCallback, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { isFormattingSupported } from '../lib/codeFormatter';

export const useCodeFormatter = () => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const setEditor = useCallback((editor: monaco.editor.IStandaloneCodeEditor | null) => {
    editorRef.current = editor;
  }, []);

  const formatCode = useCallback(async (language: string): Promise<boolean> => {
    if (!editorRef.current) {
      console.warn('Editor not available for formatting');
      return false;
    }

    if (!isFormattingSupported(language)) {
      console.warn(`Formatting not supported for language: ${language}`);
      return false;
    }

    try {
      // Trigger format document action
      await editorRef.current.getAction('editor.action.formatDocument')?.run();
      return true;
    } catch (error) {
      console.error('Formatting error:', error);
      return false;
    }
  }, []);

  return {
    formatCode,
    setEditor,
  };
};
