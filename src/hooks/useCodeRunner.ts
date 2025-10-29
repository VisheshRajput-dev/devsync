import { useState, useCallback, useRef } from 'react';
import { executeCode, type ExecutionResult } from '../lib/codeRunner';

export const useCodeRunner = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const runCode = useCallback(async (code: string, timeoutMs: number = 5000) => {
    if (isExecuting) {
      console.warn('Code is already executing');
      return;
    }

    setIsExecuting(true);
    setResult(null);

    try {
      const executionResult = await executeCode(code, timeoutMs);
      setResult(executionResult);
      
      // Add to history
      setExecutionHistory(prev => [executionResult, ...prev.slice(0, 9)]); // Keep last 10 executions
      
      return executionResult;
    } catch (error) {
      const errorResult: ExecutionResult = {
        output: [],
        error: error instanceof Error ? error.message : 'Unknown execution error',
        executionTime: 0,
        success: false,
      };
      
      setResult(errorResult);
      setExecutionHistory(prev => [errorResult, ...prev.slice(0, 9)]);
      
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting]);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  const clearHistory = useCallback(() => {
    setExecutionHistory([]);
  }, []);

  const getLastSuccessfulExecution = useCallback(() => {
    return executionHistory.find(exec => exec.success);
  }, [executionHistory]);

  const getExecutionStats = useCallback(() => {
    const total = executionHistory.length;
    const successful = executionHistory.filter(exec => exec.success).length;
    const failed = total - successful;
    const avgTime = executionHistory.reduce((sum, exec) => sum + exec.executionTime, 0) / total || 0;

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageExecutionTime: avgTime,
    };
  }, [executionHistory]);

  return {
    // State
    isExecuting,
    result,
    executionHistory,
    
    // Actions
    runCode,
    clearResult,
    clearHistory,
    
    // Utilities
    getLastSuccessfulExecution,
    getExecutionStats,
  };
};
