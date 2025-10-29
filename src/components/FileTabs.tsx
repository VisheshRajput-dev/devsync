import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Plus, 
  X, 
  FileText, 
  FileCode, 
  FileImage,
  File,
  Edit3,
  Save,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CodeFile } from '../types';

interface FileTabsProps {
  files: CodeFile[];
  activeFileId: string;
  onFileSelect: (fileId: string) => void;
  onFileCreate: (name: string, language: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  unsavedFiles: Set<string>;
  className?: string;
}

const FileTabs: React.FC<FileTabsProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  unsavedFiles,
  className = '',
}) => {
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const getFileIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        return <FileCode className="h-4 w-4 text-yellow-500" />;
      case 'html':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'css':
      case 'scss':
        return <FileImage className="h-4 w-4 text-blue-500" />;
      case 'python':
        return <FileCode className="h-4 w-4 text-green-500" />;
      case 'java':
        return <FileCode className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language.toLowerCase()) {
      case 'javascript':
        return 'text-yellow-500';
      case 'typescript':
        return 'text-blue-500';
      case 'html':
        return 'text-orange-500';
      case 'css':
        return 'text-blue-400';
      case 'python':
        return 'text-green-500';
      case 'java':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleRenameStart = (fileId: string, currentName: string) => {
    setEditingFileId(fileId);
    setEditingName(currentName);
  };

  const handleRenameSubmit = () => {
    if (editingFileId && editingName.trim()) {
      const newName = editingName.trim();
      const currentFile = files.find(f => f.id === editingFileId);
      
      if (currentFile) {
        // Extract current file extension
        const currentExt = currentFile.name.split('.').pop();
        const newExt = newName.split('.').pop();
        
        // Prevent changing file extension
        if (currentExt && newExt && currentExt !== newExt) {
          setErrorMessage(`Cannot change file extension from .${currentExt} to .${newExt}. Please keep the same extension.`);
          setShowError(true);
          // Auto-hide error after 3 seconds
          setTimeout(() => {
            setShowError(false);
            setEditingFileId(null);
            setEditingName('');
          }, 3000);
          return;
        }
        
        // If no extension in new name, add the current extension
        if (currentExt && !newExt) {
          const finalName = newName + '.' + currentExt;
          onFileRename(editingFileId, finalName);
        } else {
          onFileRename(editingFileId, newName);
        }
      }
    }
    // Always close the dialog
    setEditingFileId(null);
    setEditingName('');
  };

  const handleRenameCancel = () => {
    setEditingFileId(null);
    setEditingName('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleCreateFile = (language: string) => {
    const name = prompt(`Enter ${language} file name:`);
    if (name && name.trim()) {
      onFileCreate(name.trim(), language);
    }
    setShowCreateMenu(false);
  };

  const languages = [
    { name: 'JavaScript', value: 'javascript' },
    { name: 'TypeScript', value: 'typescript' },
    { name: 'HTML', value: 'html' },
    { name: 'CSS', value: 'css' },
    { name: 'Python', value: 'python' },
    { name: 'Java', value: 'java' },
  ];

  return (
    <div className={cn("border-b bg-muted/30", className)}>
      {/* Error Message */}
      {showError && (
        <div className="bg-red-500 text-white px-4 py-2 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setShowError(false)}
            className="ml-2 text-white hover:text-gray-200 transition-colors"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center flex-1 overflow-x-auto">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center gap-2 px-3 py-2 border-r border-border/50 cursor-pointer group relative min-w-0",
                "hover:bg-muted/50 transition-all duration-200",
                activeFileId === file.id 
                  ? "bg-background border-b-2 border-primary" 
                  : "bg-transparent"
              )}
              onClick={() => onFileSelect(file.id)}
            >
              {/* File Icon */}
              <div className="flex-shrink-0">
                {getFileIcon(file.language)}
              </div>

              {/* File Name */}
              {editingFileId === file.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleKeyPress}
                  className="bg-transparent border-none outline-none text-sm font-medium min-w-0 flex-1"
                  autoFocus
                />
              ) : (
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">
                    {file.name}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs px-1 py-0", getLanguageColor(file.language))}
                  >
                    {file.language}
                  </Badge>
                </div>
              )}

              {/* Unsaved Indicator */}
              {unsavedFiles.has(file.id) && (
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
              )}

              {/* File Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameStart(file.id, file.name);
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                
                {files.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileDelete(file.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create File Button */}
        <div className="relative flex-shrink-0 ml-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="h-8 px-3 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline text-xs font-medium">New File</span>
          </Button>

          {/* Create File Menu */}
          {showCreateMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50">
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  Choose file type:
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => handleCreateFile(lang.value)}
                    className={cn(
                      "w-full text-left px-2 py-2 text-sm rounded hover:bg-muted transition-colors",
                      "flex items-center space-x-2"
                    )}
                  >
                    {getFileIcon(lang.value)}
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileTabs;