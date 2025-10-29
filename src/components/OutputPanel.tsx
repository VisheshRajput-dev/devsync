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
  AlertCircle,
  Terminal,
  Maximize2,
  Minimize2,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [isMaximized, setIsMaximized] = useState(false);

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
    return <Terminal className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isExecuting) return 'Executing...';
    if (result) {
      return result.success ? 'Execution completed' : 'Execution failed';
    }
    return 'Ready to execute';
  };

  const getStatusColor = () => {
    if (isExecuting) return 'text-blue-500';
    if (result) {
      return result.success ? 'text-green-500' : 'text-red-500';
    }
    return 'text-muted-foreground';
  };

  const copyOutput = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output);
    }
  };

  const clearOutput = () => {
    // This would need to be implemented in the parent component
    // For now, we'll just toggle the panel
    onToggle();
  };

  if (!isVisible) {
    return (
      <div className={cn("border-t bg-muted/30", className)}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Output Panel</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className="h-8 px-3"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "border-t bg-muted/30 transition-all duration-300",
      isMaximized ? "fixed inset-4 z-50" : "",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Terminal className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center space-x-3">
              <span>Output Panel</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={cn("text-sm font-medium", getStatusColor())}>
                  {getStatusText()}
                </span>
              </div>
            </div>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* Execute Button */}
            <Button
              variant={result ? "outline" : "default"}
              size="sm"
              onClick={onExecute}
              disabled={isExecuting}
              className={cn(
                "h-8 px-3",
                result 
                  ? "hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-950 dark:hover:border-green-800 dark:hover:text-green-300"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isExecuting ? (
                <>
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </>
              )}
            </Button>

            {/* Action Buttons */}
            {result && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOutput}
                  className="h-8 px-3 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:border-blue-800 dark:hover:text-blue-300"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearOutput}
                  className="h-8 px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-950 dark:hover:border-red-800 dark:hover:text-red-300"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}

            {/* Maximize/Minimize */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              className="h-8 px-3"
            >
              {isMaximized ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>

            {/* Collapse */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggle}
              className="h-8 px-3"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className={cn(
          "transition-all duration-300",
          isCollapsed ? "max-h-0 overflow-hidden" : "max-h-96"
        )}>
          <ScrollArea className="h-48">
            <div className="p-4">
              {isExecuting ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Executing code...</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-3">
                  {/* Execution Status */}
                  <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <span className={cn("text-sm font-medium", getStatusColor())}>
                      {result.success ? 'Execution completed successfully' : 'Execution failed'}
                    </span>
                    {result.executionTime && (
                      <Badge variant="outline" className="text-xs">
                        {result.executionTime}ms
                      </Badge>
                    )}
                  </div>

                  {/* Output */}
                  {result.output && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Output:</span>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 font-mono text-sm">
                        <pre className="whitespace-pre-wrap break-words">
                          {result.output}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {result.error && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-500">Error:</span>
                      </div>
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 font-mono text-sm text-red-700 dark:text-red-300">
                        <pre className="whitespace-pre-wrap break-words">
                          {result.error}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Console Messages */}
                  {result.consoleMessages && result.consoleMessages.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Console:</span>
                      </div>
                      <div className="space-y-1">
                        {result.consoleMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={cn(
                              "text-xs px-2 py-1 rounded",
                              msg.type === 'error' 
                                ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                                : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            )}
                          >
                            {msg.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    No output yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click "Run" to execute your JavaScript code
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default OutputPanel;