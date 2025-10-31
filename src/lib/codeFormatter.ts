// Code formatting utilities
export type SupportedFormatLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'json' 
  | 'html' 
  | 'css'
  | 'python';

// Format code using Monaco Editor's built-in formatter
export const formatCode = async (
  code: string, 
  language: string
): Promise<string> => {
  const monaco = await import('monaco-editor');
  
  try {
    // Get the appropriate language ID for Monaco
    const languageId = getMonacoLanguageId(language);
    
    // Create a temporary model
    const model = monaco.editor.createModel(code, languageId);
    
    try {
      // Format the document
      await new Promise<void>((resolve) => {
        monaco.editor.getEditors().forEach(editor => {
          // Format the model
          editor.getAction('editor.action.formatDocument')?.run().then(() => {
            resolve();
          });
        });
        
        // Fallback: Use language service formatting
        const formatted = formatWithLanguageService(model);
        if (formatted !== code) {
          model.setValue(formatted);
        }
        resolve();
      });
      
      const formattedCode = model.getValue();
      model.dispose();
      
      return formattedCode;
    } catch (error) {
      model.dispose();
      throw error;
    }
  } catch (error) {
    console.error('Formatting error:', error);
    // Fallback to manual formatting
    return formatManually(code, language);
  }
};

// Get Monaco language ID
const getMonacoLanguageId = (language: string): string => {
  const langMap: Record<string, string> = {
    'javascript': 'javascript',
    'js': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'python': 'python',
    'py': 'python',
  };
  
  return langMap[language.toLowerCase()] || 'plaintext';
};

// Format using Monaco's language service
const formatWithLanguageService = (model: any): string => {
  // For now, return original code
  // Monaco's formatting is handled by the editor
  return model.getValue();
};

// Manual formatting fallback
const formatManually = (code: string, language: string): string => {
  switch (language.toLowerCase()) {
    case 'json':
      try {
        return JSON.stringify(JSON.parse(code), null, 2);
      } catch {
        return code;
      }
      
    case 'html':
    case 'css':
    case 'javascript':
    case 'typescript':
      // Basic formatting - indent properly
      return formatBasic(code);
      
    default:
      return code;
  }
};

// Basic indentation formatter
const formatBasic = (code: string): string => {
  const lines = code.split('\n');
  let indent = 0;
  const indentSize = 2;
  
  return lines.map(line => {
    const trimmed = line.trim();
    
    // Decrease indent for closing braces
    if (trimmed.endsWith('}') || trimmed.endsWith(']') || trimmed.endsWith(')')) {
      indent = Math.max(0, indent - indentSize);
    }
    
    const formatted = ' '.repeat(indent) + trimmed;
    
    // Increase indent for opening braces
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indent += indentSize;
    }
    
    return formatted;
  }).join('\n');
};

// Check if language supports formatting
export const isFormattingSupported = (language: string): boolean => {
  const supported: string[] = [
    'javascript', 'js',
    'typescript', 'ts',
    'json',
    'html',
    'css',
    'python', 'py'
  ];
  
  return supported.includes(language.toLowerCase());
};
