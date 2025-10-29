// Code execution utilities for JavaScript
export interface ExecutionResult {
  output: string[];
  error: string | null;
  executionTime: number;
  success: boolean;
}

export interface ConsoleMessage {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: number;
}

class CodeRunner {
  private output: ConsoleMessage[] = [];
  private isExecuting = false;

  // Capture console methods
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  // Override console methods to capture output
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

  // Execute JavaScript code safely
  async executeCode(code: string, timeoutMs: number = 5000): Promise<ExecutionResult> {
    if (this.isExecuting) {
      return {
        output: [],
        error: 'Code is already executing',
        executionTime: 0,
        success: false,
      };
    }

    this.isExecuting = true;
    this.output = [];
    this.setupConsoleCapture();

    const startTime = Date.now();
    let executionTime = 0;
    let error: string | null = null;
    let success = true;

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Execution timeout')), timeoutMs);
      });

      // Create execution promise
      const executionPromise = new Promise((resolve, reject) => {
        try {
          // Create a sandboxed execution environment
          const sandbox = this.createSandbox();
          
          // Execute the code
          const result = new Function(...Object.keys(sandbox), code)(...Object.values(sandbox));
          
          // If it's a promise, wait for it
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      });

      // Race between execution and timeout
      await Promise.race([executionPromise, timeoutPromise]);
      
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      success = false;
    } finally {
      executionTime = Date.now() - startTime;
      this.restoreConsole();
      this.isExecuting = false;
    }

    return {
      output: this.output.map(msg => `[${msg.type.toUpperCase()}] ${msg.message}`),
      error,
      executionTime,
      success,
    };
  }

  // Create a sandboxed environment with limited APIs
  private createSandbox() {
    return {
      // Basic JavaScript objects
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
      
      // Math object
      Math,
      
      // Date object
      Date,
      
      // JSON object
      JSON,
      
      // Array constructor
      Array,
      
      // Object constructor
      Object,
      
      // String constructor
      String,
      
      // Number constructor
      Number,
      
      // Boolean constructor
      Boolean,
      
      // RegExp constructor
      RegExp,
      
      // Error constructor
      Error,
      
      // Promise constructor (limited)
      Promise: Promise,
      
      // setTimeout and setInterval (limited)
      setTimeout: (fn: Function, delay: number) => {
        if (delay > 1000) delay = 1000; // Max 1 second
        return setTimeout(fn, delay);
      },
      
      setInterval: (fn: Function, delay: number) => {
        if (delay > 1000) delay = 1000; // Max 1 second
        return setInterval(fn, delay);
      },
      
      // Clear functions
      clearTimeout,
      clearInterval,
    };
  }

  // Clear output buffer
  clearOutput() {
    this.output = [];
  }

  // Get current output
  getOutput(): ConsoleMessage[] {
    return [...this.output];
  }

  // Check if currently executing
  isCurrentlyExecuting(): boolean {
    return this.isExecuting;
  }
}

// Create singleton instance
export const codeRunner = new CodeRunner();

// Utility function to execute code
export const executeCode = (code: string, timeoutMs?: number): Promise<ExecutionResult> => {
  return codeRunner.executeCode(code, timeoutMs);
};

// Utility function to clear output
export const clearOutput = () => {
  codeRunner.clearOutput();
};

// Utility function to get output
export const getOutput = (): ConsoleMessage[] => {
  return codeRunner.getOutput();
};
