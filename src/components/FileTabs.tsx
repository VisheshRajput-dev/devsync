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
  AlertCircle,
  Upload,
  Download,
  DownloadCloud,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFileName } from '../lib/rateLimiter';
import { useAlertDialog } from '../contexts/AlertDialogContext';
import type { CodeFile } from '../types';

interface FileTabsProps {
  files: CodeFile[];
  activeFileId: string;
  onFileSelect: (fileId: string) => void;
  onFileCreate: (name: string, language: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onFileUpload?: (files: FileList) => void;
  onFileDownload?: (fileId: string) => void;
  onDownloadAll?: () => void;
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
  onFileUpload,
  onFileDownload,
  onDownloadAll,
  unsavedFiles,
  className = '',
}) => {
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const { showAlert } = useAlertDialog();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Filter files based on search query
  const filteredFiles = React.useMemo(() => {
    if (!searchQuery.trim()) return files;
    
    const query = searchQuery.toLowerCase();
    return files.filter(file => 
      file.name.toLowerCase().includes(query) ||
      file.language.toLowerCase().includes(query) ||
      file.content.toLowerCase().includes(query)
    );
  }, [files, searchQuery]);

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
          setTimeout(() => {
            setShowError(false);
            setEditingFileId(null);
            setEditingName('');
          }, 3000);
          return;
        }
        
        // Determine final name
        let finalName = newName;
        if (currentExt && !newExt) {
          finalName = newName + '.' + currentExt;
        }
        
        // Validate file name
        const validation = validateFileName(finalName);
        if (!validation.valid) {
          setErrorMessage(validation.error || 'Invalid file name');
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
            // Keep dialog open so user can fix it
          }, 3000);
          return;
        }
        
        // Name is valid, proceed with rename
        onFileRename(editingFileId, finalName);
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
      const trimmedName = name.trim();
      
      // Validate file name
      const validation = validateFileName(trimmedName);
      if (!validation.valid) {
        showAlert('Invalid File Name', validation.error || 'Invalid file name');
        return;
      }
      
      // Add extension if missing
      let finalName = trimmedName;
      const extensionMap: Record<string, string> = {
        'javascript': 'js',
        'typescript': 'ts',
        'html': 'html',
        'css': 'css',
        'python': 'py',
        'java': 'java'
      };
      
      const ext = extensionMap[language] || '';
      if (ext && !finalName.includes('.')) {
        finalName = finalName + '.' + ext;
      }
      
      onFileCreate(finalName, language);
    }
    setShowCreateMenu(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileUpload) {
      onFileUpload(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDownloadClick = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    if (onFileDownload) {
      onFileDownload(fileId);
    }
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
      
      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 border-b border-border/50">
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files by name, language, or content..."
              className="w-full pl-8 pr-8 py-1.5 text-sm bg-muted/50 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {searchQuery && (
            <div className="mt-1 text-xs text-muted-foreground">
              Found {filteredFiles.length} of {files.length} files
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="flex items-center flex-1 overflow-x-auto min-w-0">
          {filteredFiles.map((file) => (
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
                  <span className="text-sm font-medium truncate" title={file.name || 'Untitled'}>
                    {file.name || 'Untitled'}
                  </span>
                  {file.language && (
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs px-1 py-0 shrink-0", getLanguageColor(file.language))}
                    >
                      {file.language}
                    </Badge>
                  )}
                </div>
              )}

              {/* Unsaved Indicator */}
              {unsavedFiles.has(file.id) && (
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
              )}

              {/* File Actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onFileDownload && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    onClick={(e) => handleDownloadClick(e, file.id)}
                    title="Download file"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenameStart(file.id, file.name);
                  }}
                  title="Rename file"
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
                    title="Delete file"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons - Always visible on the right */}
        <div className="relative flex-shrink-0 ml-2 flex items-center space-x-2 bg-background/95 backdrop-blur-sm z-50">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
            accept=".js,.jsx,.ts,.tsx,.html,.css,.json,.py,.java,.cpp,.c,.md,.txt,.xml,.yaml,.yml,.sql,.sh,.bash,.zsh,.ps1,.go,.rs,.rb,.php"
          />
          
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowSearch(!showSearch);
              if (!showSearch) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
              } else {
                setSearchQuery('');
              }
            }}
            className={cn(
              "h-8 px-3 transition-all duration-200",
              showSearch 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            )}
            title="Search files"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Upload Button - Always visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={!onFileUpload}
            className="h-8 px-3 hover:bg-primary hover:text-primary-foreground transition-all duration-200 disabled:opacity-50"
            title="Upload files from your computer"
          >
            <Upload className="h-4 w-4" />
            <span className="ml-1 text-xs font-medium">Upload</span>
          </Button>
          
          {/* Download All Button - Always visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadAll}
            disabled={!onDownloadAll}
            className="h-8 px-3 hover:bg-primary hover:text-primary-foreground transition-all duration-200 disabled:opacity-50"
            title="Download all files as ZIP"
          >
            <DownloadCloud className="h-4 w-4" />
            <span className="ml-1 text-xs font-medium">Download All</span>
          </Button>
          
          {/* New File Button with Dropdown */}
          <div className="relative">
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
              <>
                {/* Backdrop to close menu on outside click */}
                <div 
                  className="fixed inset-0 z-[9998]" 
                  onClick={() => setShowCreateMenu(false)}
                />
                <div className="fixed right-4 mt-10 w-48 bg-background border border-border rounded-md shadow-xl z-[9999]">
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                      Choose file type:
                    </div>
                    {languages.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => {
                          handleCreateFile(lang.value);
                          setShowCreateMenu(false);
                        }}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileTabs;