// Multi-language code execution utilities
export interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
  success: boolean;
  consoleMessages?: ConsoleMessage[];
}

export interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

export type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'html' 
  | 'css'
  | 'python';

class CodeRunner {
  private output: ConsoleMessage[] = [];
  private isExecuting = false;
  private pyodide: any = null;
  private pyodideLoading = false;

  // Capture console methods
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  // Initialize Pyodide for Python execution
  async initializePyodide() {
    if (this.pyodide) return this.pyodide;
    if (this.pyodideLoading) {
      // Wait for loading to complete
      while (this.pyodideLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.pyodide;
    }

    try {
      this.pyodideLoading = true;
      // Use CDN directly instead of npm package
      // Load Pyodide from CDN
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      // @ts-ignore - Pyodide is loaded from CDN
      if (!window.loadPyodide) {
        throw new Error('Pyodide not found after loading script');
      }

      // @ts-ignore
      this.pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      });
      this.pyodideLoading = false;
      return this.pyodide;
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      this.pyodideLoading = false;
      // Return null instead of throwing, so we can show a better error message
      return null;
    }
  }

  // Setup console capture
  private setupConsoleCapture() {
    const addOutput = (type: ConsoleMessage['type']) => (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      this.output.push({
        type,
        message,
        timestamp: Date.now(),
      });
    };

    console.log = addOutput('log');
    console.error = addOutput('error');
    console.warn = addOutput('warn');
    console.info = addOutput('info');
  }

  // Restore original console methods
  private restoreConsole() {
    Object.assign(console, this.originalConsole);
  }

  // Execute JavaScript code
  private async executeJavaScript(code: string, timeoutMs: number = 5000): Promise<ExecutionResult> {
    this.output = [];
    this.setupConsoleCapture();

    const startTime = Date.now();
    let executionTime = 0;
    let error: string | null = null;
    let success = true;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), timeoutMs);
      });

      const executionPromise = new Promise((resolve, reject) => {
        try {
          const sandbox = this.createSandbox();
          const result = new Function(...Object.keys(sandbox), code)(...Object.values(sandbox));
          
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      });

      await Promise.race([executionPromise, timeoutPromise]);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      success = false;
    } finally {
      executionTime = Date.now() - startTime;
      this.restoreConsole();
    }

    const output = this.output.map(msg => {
      const prefix = msg.type === 'error' ? '❌' : msg.type === 'warn' ? '⚠️' : '';
      return `${prefix}${msg.message}`;
    }).join('\n') || '(No output)';

    return {
      output,
      error,
      executionTime,
      success,
      consoleMessages: [...this.output],
    };
  }

  // Execute TypeScript code (transpile to JavaScript first)
  private async executeTypeScript(code: string, timeoutMs: number = 5000): Promise<ExecutionResult> {
    try {
      // Try to use TypeScript compiler
      const ts = await import('typescript');
      
      // Transpile TypeScript to JavaScript
      const result = ts.transpile(code, {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        esModuleInterop: true,
        skipLibCheck: true,
        jsx: ts.JsxEmit.React,
      });
      
      // Execute the transpiled JavaScript
      return await this.executeJavaScript(result, timeoutMs);
    } catch (error) {
      // Fallback: try executing as JavaScript (works for simple TS code)
      console.warn('TypeScript compilation failed, attempting to run as JavaScript:', error);
      try {
        return await this.executeJavaScript(code, timeoutMs);
      } catch (jsError) {
        return {
          output: '',
          error: `TypeScript execution failed: ${error instanceof Error ? error.message : 'Unknown error'}. JavaScript fallback also failed.`,
          executionTime: 0,
          success: false,
        };
      }
    }
  }

  // Execute Python code using Pyodide
  private async executePython(code: string): Promise<ExecutionResult> {
    try {
      const pyodide = await this.initializePyodide();
      
      if (!pyodide) {
        return {
          output: '',
          error: 'Python execution requires Pyodide. Please ensure you have an internet connection and try again.',
          executionTime: 0,
          success: false,
        };
      }
      
      const startTime = Date.now();

      // Set up stdout capture
      let output = '';
      pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
        sys.stderr = StringIO()
      `);

      // Execute the code
      try {
        pyodide.runPython(code);
        const stdout = pyodide.runPython('sys.stdout.getvalue()');
        const stderr = pyodide.runPython('sys.stderr.getvalue()');
        
        output = stdout || '';
        const error = stderr || null;
        
        const executionTime = Date.now() - startTime;

        return {
          output: output || '(No output)',
          error,
          executionTime,
          success: !error,
        };
      } catch (err: any) {
        const stderr = pyodide.runPython('sys.stderr.getvalue()');
        const executionTime = Date.now() - startTime;

        return {
          output: '',
          error: stderr || (err?.message || String(err)),
          executionTime,
          success: false,
        };
      }
    } catch (error) {
      return {
        output: '',
        error: `Python execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0,
        success: false,
      };
    }
  }

  // Execute HTML code
  private async executeHTML(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      // Create a blob URL for the HTML
      const blob = new Blob([code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Create iframe to render HTML
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      iframe.onload = () => {
        const executionTime = Date.now() - startTime;
        
        // Get the rendered HTML
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        const bodyContent = iframeDoc?.body?.innerHTML || '';
        
        URL.revokeObjectURL(url);
        document.body.removeChild(iframe);
        
        resolve({
          output: `HTML rendered successfully\n\nBody content preview:\n${bodyContent.substring(0, 200)}${bodyContent.length > 200 ? '...' : ''}`,
          error: null,
          executionTime,
          success: true,
        });
      };
      
      iframe.onerror = () => {
        const executionTime = Date.now() - startTime;
        URL.revokeObjectURL(url);
        document.body.removeChild(iframe);
        
        resolve({
          output: '',
          error: 'Failed to render HTML',
          executionTime,
          success: false,
        });
      };
      
      document.body.appendChild(iframe);
    });
  }

  // Execute CSS code
  private async executeCSS(code: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      // Create a style element
      const style = document.createElement('style');
      style.textContent = code;
      
      // Create a test element to apply CSS
      const testElement = document.createElement('div');
      testElement.style.display = 'none';
      testElement.innerHTML = '<div class="test-css">CSS Test</div>';
      
      document.head.appendChild(style);
      document.body.appendChild(testElement);
      
      setTimeout(() => {
        const executionTime = Date.now() - startTime;
        
        // Check computed styles
        const computed = window.getComputedStyle(testElement.querySelector('.test-css')!);
        const styles = Array.from(computed.cssText.split(';'))
          .filter(s => s.trim())
          .slice(0, 10)
          .join('\n');
        
        document.head.removeChild(style);
        document.body.removeChild(testElement);
        
        resolve({
          output: `CSS parsed successfully\n\nComputed styles:\n${styles}`,
          error: null,
          executionTime,
          success: true,
        });
      }, 100);
    });
  }

  // Main execute method with language support
  async executeCode(code: string, language: string, timeoutMs: number = 5000): Promise<ExecutionResult> {
    if (this.isExecuting) {
      return {
        output: '',
        error: 'Code is already executing',
        executionTime: 0,
        success: false,
      };
    }

    this.isExecuting = true;

    try {
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          return await this.executeJavaScript(code, timeoutMs);
          
        case 'typescript':
        case 'ts':
          return await this.executeTypeScript(code, timeoutMs);
          
        case 'python':
        case 'py':
          return await this.executePython(code); // Python needs more time
          
        case 'html':
          return await this.executeHTML(code);
          
        case 'css':
          return await this.executeCSS(code);
          
        default:
          return {
            output: '',
            error: `Language "${language}" is not supported for execution. Currently supported: JavaScript, TypeScript, Python, HTML, CSS.`,
            executionTime: 0,
            success: false,
          };
      }
    } finally {
      this.isExecuting = false;
    }
  }

  // Create a sandboxed environment for JavaScript
  private createSandbox() {
    return {
      console: {
        log: (...args: any[]) => this.output.push({
          type: 'log',
          message: args.join(' '),
          timestamp: Date.now(),
        }),
        error: (...args: any[]) => this.output.push({
          type: 'error',
          message: args.join(' '),
          timestamp: Date.now(),
        }),
        warn: (...args: any[]) => this.output.push({
          type: 'warn',
          message: args.join(' '),
          timestamp: Date.now(),
        }),
        info: (...args: any[]) => this.output.push({
          type: 'info',
          message: args.join(' '),
          timestamp: Date.now(),
        }),
      },
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Error,
      Promise: Promise,
      setTimeout: (fn: Function, delay: number) => {
        if (delay > 1000) delay = 1000;
        return setTimeout(fn, delay);
      },
      setInterval: (fn: Function, delay: number) => {
        if (delay > 1000) delay = 1000;
        return setInterval(fn, delay);
      },
      clearTimeout,
      clearInterval,
    };
  }

  clearOutput() {
    this.output = [];
  }

  getOutput(): ConsoleMessage[] {
    return [...this.output];
  }

  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }
}

// Create singleton instance
export const codeRunner = new CodeRunner();

// Utility function to execute code
export const executeCode = (code: string, language: string, timeoutMs?: number): Promise<ExecutionResult> => {
  return codeRunner.executeCode(code, language, timeoutMs);
};

// Utility function to clear output
export const clearOutput = () => {
  codeRunner.clearOutput();
};

// Utility function to get output
export const getOutput = (): ConsoleMessage[] => {
  return codeRunner.getOutput();
};