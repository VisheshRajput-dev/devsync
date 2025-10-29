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
  Save
} from 'lucide-react';
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

  const getFileIcon = (language: string) => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        return <FileCode className="h-4 w-4" />;
      case 'html':
        return <FileText className="h-4 w-4" />;
      case 'css':
      case 'scss':
        return <FileImage className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
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
      case 'cpp':
      case 'c':
        return 'text-blue-600';
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const createNewFile = () => {
    const name = prompt('Enter file name (with extension):');
    if (name && name.trim()) {
      const extension = name.split('.').pop()?.toLowerCase() || 'txt';
      let language = 'plaintext';
      
      switch (extension) {
        case 'js':
          language = 'javascript';
          break;
        case 'ts':
          language = 'typescript';
          break;
        case 'html':
          language = 'html';
          break;
        case 'css':
          language = 'css';
          break;
        case 'py':
          language = 'python';
          break;
        case 'java':
          language = 'java';
          break;
        case 'cpp':
        case 'cc':
          language = 'cpp';
          break;
        case 'c':
          language = 'c';
          break;
        case 'json':
          language = 'json';
          break;
        case 'xml':
          language = 'xml';
          break;
        case 'md':
          language = 'markdown';
          break;
        default:
          language = 'plaintext';
      }
      
      onFileCreate(name.trim(), language);
    }
  };

  return (
    <div className={`${className} border-b border-gray-700 bg-gray-800/50`}>
      {/* Error Message */}
      {showError && (
        <div className="bg-red-500 text-white px-4 py-2 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setShowError(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex items-center flex-1 overflow-x-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={`
              flex items-center gap-2 px-3 py-2 border-r border-gray-700 cursor-pointer
              hover:bg-gray-700/50 transition-colors min-w-0
              ${activeFileId === file.id ? 'bg-gray-700 border-b-2 border-blue-500' : ''}
            `}
            onClick={() => onFileSelect(file.id)}
          >
            <span className={getLanguageColor(file.language)}>
              {getFileIcon(file.language)}
            </span>
            
            {editingFileId === file.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-sm text-white min-w-0 flex-1"
                autoFocus
              />
            ) : (
              <span className="text-sm text-white truncate min-w-0 flex-1">
                {file.name}
              </span>
            )}
            
            {unsavedFiles.has(file.id) && (
              <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0" />
            )}
            
            <div className="flex items-center gap-1 shrink-0">
              {editingFileId !== file.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameStart(file.id, file.name);
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-red-600 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  if (files.length > 1) {
                    onFileDelete(file.id);
                  }
                }}
                disabled={files.length <= 1}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 px-3 py-2 border-l border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={createNewFile}
          className="h-8 w-8 p-0 hover:bg-gray-600"
          title="Create new file"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <Badge variant="outline" className="text-xs">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </Badge>
      </div>
    </div>
  );
};

export default FileTabs;
