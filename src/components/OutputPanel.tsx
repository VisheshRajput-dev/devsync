import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { 
  Play, 
  Square, 
  Copy, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { ExecutionResult, ConsoleMessage } from '../lib/codeRunner';

interface OutputPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  onExecute: () => void;
  isExecuting: boolean;
  result: ExecutionResult | null;
  className?: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({
  isVisible,
  onToggle,
  onExecute,
  isExecuting,
  result,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getStatusIcon = () => {
    if (isExecuting) {
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (result) {
      return result.success ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      );
    }
    return <Play className="h-4 w-4 text-gray-500" />;
  };

  const getStatusText = () => {
    if (isExecuting) return 'Executing...';
    if (result) {
      return result.success ? 'Execution completed' : 'Execution failed';
    }
    return 'Ready to execute';
  };

  const copyOutput = () => {
    if (result) {
      const outputText = result.output.join('\n');
      navigator.clipboard.writeText(outputText);
    }
  };

  const formatExecutionTime = (time: number) => {
    if (time < 1000) {
      return `${time}ms`;
    }
    return `${(time / 1000).toFixed(2)}s`;
  };

  const getOutputTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
        return 'text-red-500';
      case 'warn':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-300';
    }
  };

  if (!isVisible) {
    return (
      <div className="flex items-center justify-center py-2">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          Show Output Panel
        </Button>
      </div>
    );
  }

  return (
    <Card className={`${className} flex flex-col`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Output Console
            <Badge variant="outline" className="text-xs">
              {getStatusText()}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="sm"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="sm"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!isCollapsed && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              onClick={onExecute}
              disabled={isExecuting}
              size="sm"
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isExecuting ? 'Running...' : 'Run Code'}
            </Button>
            
            {result && (
              <>
                <Badge variant="secondary" className="text-xs">
                  {formatExecutionTime(result.executionTime)}
                </Badge>
                <Button
                  onClick={copyOutput}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </>
            )}
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {result ? (
              <div className="space-y-3">
                {/* Output Messages */}
                {result.output.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Console Output
                    </h4>
                    <div className="space-y-1">
                      {result.output.map((line, index) => (
                        <div
                          key={index}
                          className="font-mono text-sm p-2 bg-gray-800 rounded border-l-2 border-gray-600"
                        >
                          <span className={getOutputTypeColor(line.split(']')[0]?.replace('[', '') || 'log')}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {result.error && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Error
                    </h4>
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded">
                      <pre className="text-red-300 text-sm font-mono whitespace-pre-wrap">
                        {result.error}
                      </pre>
                    </div>
                  </div>
                )}

                {/* No Output Message */}
                {result.output.length === 0 && !result.error && result.success && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p>Code executed successfully with no output</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Play className="h-8 w-8 mx-auto mb-2" />
                <p>Click "Run Code" to execute your JavaScript</p>
                <p className="text-xs mt-1">Supports console.log, console.error, and more</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};

export default OutputPanel;
