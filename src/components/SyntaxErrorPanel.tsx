import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as monaco from 'monaco-editor';
import { cn } from '@/lib/utils';

interface SyntaxErrorPanelProps {
  errors: monaco.editor.IMarker[];
  onClose?: () => void;
  onErrorClick?: (error: monaco.editor.IMarker) => void;
}

const SyntaxErrorPanel: React.FC<SyntaxErrorPanelProps> = ({ 
  errors, 
  onClose,
  onErrorClick 
}) => {
  if (errors.length === 0) {
    return null;
  }

  const errorsBySeverity = {
    error: errors.filter(e => e.severity === monaco.MarkerSeverity.Error),
    warning: errors.filter(e => e.severity === monaco.MarkerSeverity.Warning),
    info: errors.filter(e => e.severity === monaco.MarkerSeverity.Info),
    hint: errors.filter(e => e.severity === monaco.MarkerSeverity.Hint),
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case monaco.MarkerSeverity.Error:
        return 'text-red-600 dark:text-red-400';
      case monaco.MarkerSeverity.Warning:
        return 'text-yellow-600 dark:text-yellow-400';
      case monaco.MarkerSeverity.Info:
        return 'text-blue-600 dark:text-blue-400';
      case monaco.MarkerSeverity.Hint:
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case monaco.MarkerSeverity.Error:
        return 'Error';
      case monaco.MarkerSeverity.Warning:
        return 'Warning';
      case monaco.MarkerSeverity.Info:
        return 'Info';
      case monaco.MarkerSeverity.Hint:
        return 'Hint';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="border-t bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Syntax Errors</span>
            <Badge variant="destructive" className="text-xs">
              {errors.length}
            </Badge>
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {errors.map((error, index) => (
            <div
              key={index}
              className={cn(
                "p-2 rounded-lg border cursor-pointer transition-colors",
                "hover:bg-muted/50",
                error.severity === monaco.MarkerSeverity.Error 
                  ? "border-red-200 dark:border-red-800" 
                  : error.severity === monaco.MarkerSeverity.Warning
                  ? "border-yellow-200 dark:border-yellow-800"
                  : "border-gray-200 dark:border-gray-700"
              )}
              onClick={() => onErrorClick?.(error)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge 
                      variant={error.severity === monaco.MarkerSeverity.Error ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {getSeverityLabel(error.severity)}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      Line {error.startLineNumber}:{error.startColumn}
                    </span>
                  </div>
                  <p className="text-sm text-foreground break-words">
                    {error.message}
                  </p>
                  {error.source && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Source: {error.source}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyntaxErrorPanel;
