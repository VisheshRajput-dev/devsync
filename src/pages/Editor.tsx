import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useAlertDialog } from '../contexts/AlertDialogContext';
import { useFirebase } from '../hooks/useFirebase';
import { useCodeRunner } from '../hooks/useCodeRunner';
import { 
  codeChangeRateLimiter, 
  chatMessageRateLimiter, 
  fileOperationRateLimiter,
  validateFileName,
  validateFileContent,
  validateFileSize
} from '../lib/rateLimiter';
import TopBar from '../components/TopBar';
import UserList from '../components/UserList';
import CodeEditor, { type CodeEditorRef } from '../components/CodeEditor';
import ChatBox from '../components/ChatBox';
import ChatUsersPanel from '../components/ChatUsersPanel';
import FileTabs from '../components/FileTabs';
import OutputPanel from '../components/OutputPanel';
import SyntaxErrorPanel from '../components/SyntaxErrorPanel';
import UsernamePrompt from '../components/UsernamePrompt';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import type { User, Message, CodeFile } from '../types';
import * as monaco from 'monaco-editor';

const Editor: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useSocket();
  const { showAlert } = useAlertDialog();
  const firebase = useFirebase();
  const codeRunner = useCodeRunner();
  
  const [username, setUsername] = useState(location.state?.username || '');
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(!location.state?.username);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: 'default',
      name: 'main.js',
      content: '// Welcome to Devsync!\n// Start coding together...\n',
      language: 'javascript',
      isActive: true,
      createdAt: Date.now()
    }
  ]);
  const [activeFileId, setActiveFileId] = useState('default');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'editor' | 'chat' | 'users'>('editor');
  const [showOutputPanel, setShowOutputPanel] = useState(false);
  const [unsavedFiles, setUnsavedFiles] = useState<Set<string>>(new Set());
  const [syntaxErrors, setSyntaxErrors] = useState<monaco.editor.IMarker[]>([]);
  const codeEditorRef = useRef<CodeEditorRef>(null);
  
  // Get current active file
  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const currentCode = activeFile?.content || '';

  // Initialize room and load saved data
  useEffect(() => {
    if (!socket || !roomId || !username) return; // Don't initialize if no username

    // Room initialization

    // Wait for socket to be connected before joining room
    if (!isConnected) {
      const connectHandler = () => {
        socket.emit('joinRoom', { roomId, username });
        socket.off('connect', connectHandler);
      };
      socket.on('connect', connectHandler);
      return;
    }

    // Join the room
    socket.emit('joinRoom', { roomId, username });

    // Listen for room joined event
    const handleRoomJoined = (data: any) => {
      setUsers(data.users);
      setIsLoading(false);
      
      // Update default file with server code if it's the welcome message
      if (data.code && data.code !== '// Welcome to Devsync!\n// Start coding together...\n') {
        setFiles(prev => prev.map(f => 
          f.id === 'default' ? { ...f, content: data.code } : f
        ));
      }
    };

    // Listen for user joined event
    const handleUserJoined = (data: any) => {
      setUsers(data.users);
    };

    // Listen for user left event
    const handleUserLeft = (data: any) => {
      setUsers(data.users);
    };

    // Listen for code changes
    const handleCodeChange = (data: any) => {
      setFiles(prev => prev.map(f => 
        f.id === (data.fileId || 'default') ? { ...f, content: data.code } : f
      ));
    };

    // Listen for chat messages
    const handleChatMessage = (message: any) => {
      setMessages(prev => [...prev, message]);
    };

    // Listen for file creation
    const handleFileCreated = (data: any) => {
      setFiles(prev => {
        // Check if file already exists to prevent duplicates
        // Check by both ID and name+content to be extra safe
        const existsById = prev.some(f => f.id === data.file.id);
        const existsByNameAndContent = prev.some(f => 
          f.name === data.file.name && 
          f.content === data.file.content &&
          f.language === data.file.language
        );
        
        if (existsById || existsByNameAndContent) {
          return prev;
        }
        
        // Ensure file has all required properties
        const fileToAdd: CodeFile = {
          id: data.file.id,
          name: data.file.name || 'Untitled',
          content: data.file.content || '',
          language: data.file.language || 'plaintext',
          isActive: false,
          createdAt: data.file.createdAt || Date.now()
        };
        
        // Add the new file
        const newFiles = [...prev, fileToAdd];
        
        // If this is the creator, set it as active
        if (data.file.createdBy === username) {
          setActiveFileId(fileToAdd.id);
        }
        
        return newFiles;
      });
    };

    // Listen for file deletion
    const handleFileDeleted = (data: any) => {
      setFiles(prev => {
        const newFiles = prev.filter(f => f.id !== data.fileId);
        
        // If the deleted file was active, switch to first available file
        if (activeFileId === data.fileId && newFiles.length > 0) {
          setActiveFileId(newFiles[0].id);
        }
        
        return newFiles;
      });
    };

    // Listen for file rename
    const handleFileRenamed = (data: any) => {
      setFiles(prev => prev.map(f => 
        f.id === data.fileId ? { ...f, name: data.newName } : f
      ));
    };

    // Listen for errors
    const handleError = (data: any) => {
      showAlert('Error', data.message || 'An unknown error occurred');
    };

    // Add event listeners (remove existing ones first to prevent duplicates)
    socket.off('roomJoined', handleRoomJoined);
    socket.off('userJoined', handleUserJoined);
    socket.off('userLeft', handleUserLeft);
    socket.off('codeChange', handleCodeChange);
    socket.off('chatMessage', handleChatMessage);
    socket.off('fileCreated', handleFileCreated);
    socket.off('fileDeleted', handleFileDeleted);
    socket.off('fileRenamed', handleFileRenamed);
    socket.off('error', handleError);
    
    socket.on('roomJoined', handleRoomJoined);
    socket.on('userJoined', handleUserJoined);
    socket.on('userLeft', handleUserLeft);
    socket.on('codeChange', handleCodeChange);
    socket.on('chatMessage', handleChatMessage);
    socket.on('fileCreated', handleFileCreated);
    socket.on('fileDeleted', handleFileDeleted);
    socket.on('fileRenamed', handleFileRenamed);
    socket.on('error', handleError);

    // Fallback timeout in case roomJoined never comes
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup listeners
      socket.off('roomJoined', handleRoomJoined);
      socket.off('userJoined', handleUserJoined);
      socket.off('userLeft', handleUserLeft);
      socket.off('codeChange', handleCodeChange);
      socket.off('chatMessage', handleChatMessage);
      socket.off('fileCreated', handleFileCreated);
      socket.off('fileDeleted', handleFileDeleted);
      socket.off('fileRenamed', handleFileRenamed);
      socket.off('error', handleError);
    };
  }, [socket, roomId, username, isConnected]); // Added username dependency

  // Handle code changes with rate limiting
  const handleCodeChange = useCallback((newCode: string) => {
    const userId = socket?.id || 'anonymous';
    
    // Rate limiting for code changes
    if (!codeChangeRateLimiter.isAllowed(userId)) {
      return;
    }
    
    setFiles(prev => prev.map(f => 
      f.id === activeFileId ? { ...f, content: newCode } : f
    ));
    
    // Mark file as unsaved
    setUnsavedFiles(prev => new Set(prev).add(activeFileId));
    
    // Update syntax errors after a short delay
    setTimeout(() => {
      if (codeEditorRef.current) {
        const errors = codeEditorRef.current.getErrors();
        setSyntaxErrors(errors);
      }
    }, 300);
    
    // Emit to other users with fileId
    if (socket && roomId) {
      socket.emit('sendCodeChange', { roomId, code: newCode, fileId: activeFileId });
    }
  }, [activeFileId, socket, roomId]);

  // Update errors when file changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (codeEditorRef.current) {
        const errors = codeEditorRef.current.getErrors();
        setSyntaxErrors(errors);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [activeFileId, currentCode]);

  // Handle send message with rate limiting
  const handleSendMessage = useCallback((message: string) => {
    const userId = socket?.id || 'anonymous';
    
    // Rate limiting for chat messages
    if (!chatMessageRateLimiter.isAllowed(userId)) {
      showAlert('Rate Limit', 'Too many messages. Please wait a moment.');
      return;
    }
    
    if (socket && roomId && message.trim()) {
      // Only emit to server, don't add locally (server will broadcast back)
      socket.emit('sendChatMessage', { roomId, message: message.trim() });
    }
  }, [socket, roomId, showAlert]);

  // File management functions
  const handleFileSelect = useCallback((fileId: string) => {
    setActiveFileId(fileId);
    setFiles(prev => prev.map(f => ({ ...f, isActive: f.id === fileId })));
  }, []);

  const handleFileCreate = useCallback(async (name: string, language: string) => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name,
      content: getDefaultContent(language),
      language,
      isActive: false,
      createdAt: Date.now()
    };
    
    // Broadcast to other users (including self to get server confirmation)
    if (socket && roomId) {
      socket.emit('createFile', { roomId, file: newFile });
    }
    
    // Save to Firebase
    try {
      await firebase.createFile(roomId!, {
        name: newFile.name,
        content: newFile.content,
        language: newFile.language,
        isActive: true
      });
      } catch (error) {
        // Error handled - operation continues
      }
  }, [roomId, firebase, socket]);

  const handleFileDelete = useCallback((fileId: string) => {
    if (files.length <= 1) return; // Don't delete the last file
    
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      if (fileId === activeFileId) {
        setActiveFileId(newFiles[0].id);
      }
      return newFiles;
    });

    // Broadcast to other users
    if (socket && roomId) {
      socket.emit('deleteFile', { roomId, fileId });
    }

    // Delete from Firebase
    try {
      firebase.deleteFile(roomId!, fileId);
        } catch (error) {
          // Error handled - operation continues
        }
  }, [files.length, activeFileId, socket, roomId, firebase]);

  const handleFileRename = useCallback((fileId: string, newName: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, name: newName } : f
    ));

    // Broadcast to other users
    if (socket && roomId) {
      socket.emit('renameFile', { roomId, fileId, newName });
    }

    // Rename in Firebase
    try {
      firebase.renameFile(roomId!, fileId, newName);
    } catch (error) {
      // Error handled - operation continues
    }
  }, [socket, roomId, firebase]);

  // File upload handler with rate limiting and validation
  const handleFileUpload = useCallback(async (files: FileList) => {
    const userId = socket?.id || 'anonymous';
    
    // Check rate limit
    if (!fileOperationRateLimiter.isAllowed(userId)) {
      showAlert('Rate Limit', 'Too many file operations. Please wait a moment.');
      return;
    }

    const uploadedFiles: CodeFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size
      const sizeValidation = validateFileSize(file.size);
      if (!sizeValidation.valid) {
        showAlert('Upload Error', `File ${file.name}: ${sizeValidation.error}`);
        continue;
      }

      // Validate file name
      const nameValidation = validateFileName(file.name);
      if (!nameValidation.valid) {
        showAlert('Upload Error', `File ${file.name}: ${nameValidation.error}`);
        continue;
      }

      try {
        const content = await file.text();
        
        // Validate content
        const contentValidation = validateFileContent(content, file.name);
        if (!contentValidation.valid) {
          showAlert('Upload Error', `File ${file.name}: ${contentValidation.error}`);
          continue;
        }
        
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        
        // Determine language from extension
        const languageMap: Record<string, string> = {
          'js': 'javascript',
          'jsx': 'javascript',
          'ts': 'typescript',
          'tsx': 'typescript',
          'html': 'html',
          'htm': 'html',
          'css': 'css',
          'scss': 'css',
          'sass': 'css',
          'json': 'json',
          'py': 'python',
          'java': 'java',
          'cpp': 'cpp',
          'c': 'c',
          'h': 'c',
          'cs': 'csharp',
          'md': 'markdown',
          'txt': 'plaintext',
          'xml': 'xml',
          'yaml': 'yaml',
          'yml': 'yaml',
          'sql': 'sql',
          'sh': 'shell',
          'bash': 'shell',
          'zsh': 'shell',
          'ps1': 'powershell',
          'dockerfile': 'dockerfile',
          'go': 'go',
          'rs': 'rust',
          'rb': 'ruby',
          'php': 'php',
        };
        
        const language = languageMap[extension] || 'plaintext';
        
        // Generate unique ID with timestamp and random number to avoid collisions
        const uniqueId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`;
        
        const newFile: CodeFile = {
          id: uniqueId,
          name: file.name,
          content,
          language,
          isActive: false,
          createdAt: Date.now()
        };
        
        uploadedFiles.push(newFile);
        
        // Broadcast to all users (including self via socket event)
        // Don't add to local state here - wait for socket event to avoid duplicates
        if (socket && roomId) {
          socket.emit('createFile', { roomId, file: newFile });
        }
        
        // Save to Firebase
        try {
          await firebase.createFile(roomId!, {
            name: newFile.name,
            content: newFile.content,
            language: newFile.language,
            isActive: false
          });
        } catch (error) {
          // Error handled silently - file will still be synced via socket
        }
      } catch (error) {
        showAlert('Upload Error', `Failed to read file ${file.name}`);
      }
    }

    if (uploadedFiles.length > 0) {
      // Don't add to state here - the socket event will handle it
      // This prevents duplicates since the socket event will be received by all users including uploader
      showAlert('Upload Success', `Successfully uploaded ${uploadedFiles.length} file(s). Files will appear shortly.`);
    }
  }, [socket, roomId, firebase]);

  // File download handler - single file
  const handleFileDownload = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [files]);

  // File download handler - ZIP all files
  const handleDownloadAll = useCallback(async () => {
    if (files.length === 0) {
      showAlert('Download Error', 'No files to download');
      return;
    }

    try {
      // Dynamic import of JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add all files to ZIP
      files.forEach(file => {
        zip.file(file.name, file.content);
      });

      // Generate ZIP file
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devsync-${roomId?.slice(0, 8)}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      showAlert('Download Error', 'Failed to create ZIP file. Make sure JSZip is installed.');
    }
  }, [files, roomId, showAlert]);

  // Code formatting
  const handleFormatCode = useCallback(async () => {
    if (codeEditorRef.current) {
      await codeEditorRef.current.formatCode();
    }
  }, []);

  // Code execution
  const handleRunCode = useCallback(async () => {
    if (!activeFile) return;
    
    const supportedLanguages = ['javascript', 'typescript', 'python', 'html', 'css'];
    
    if (supportedLanguages.includes(activeFile.language.toLowerCase())) {
      await codeRunner.runCode(currentCode, activeFile.language);
    } else {
      showAlert('Execution Error', `Code execution is not supported for ${activeFile.language} files. Currently supported: JavaScript, TypeScript, Python, HTML, CSS.`);
    }
  }, [activeFile, currentCode, codeRunner, showAlert]);

  // Session management
  const handleSaveSession = useCallback(async () => {
    if (!roomId) return;
    
    try {
      // Save room data with all current state
      await firebase.saveRoom(roomId, {
        code: currentCode,
        language: activeFile?.language || 'javascript',
        activeFileId,
        files: files.map(f => ({
          id: f.id,
          name: f.name,
          content: f.content,
          language: f.language,
          isActive: f.isActive,
          createdAt: f.createdAt ? Timestamp.fromDate(new Date(f.createdAt)) : Timestamp.now()
        })),
        messages: messages.map(m => ({
          id: m.id,
          username: m.username,
          text: m.text,
          timestamp: Timestamp.fromDate(new Date(m.timestamp))
        })),
        users: users.map(u => ({
          id: u.id,
          username: u.username
        }))
      });
      
      setUnsavedFiles(new Set());
      showAlert('Success', 'Session saved successfully!');
    } catch (error) {
      showAlert('Save Error', `Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [roomId, firebase, currentCode, activeFile?.language, activeFileId, files, messages, users]);

  const handleLoadSession = useCallback(async () => {
    if (!roomId) return;
    
    try {
      const savedRoom = await firebase.loadRoom(roomId);
      if (savedRoom) {
        // Load files
        if (savedRoom.files && savedRoom.files.length > 0) {
          const convertedFiles: CodeFile[] = savedRoom.files.map((f: any) => ({
            id: f.id,
            name: f.name,
            content: f.content,
            language: f.language,
            isActive: f.isActive,
            createdAt: f.createdAt?.toMillis() || Date.now()
          }));
          setFiles(convertedFiles);
          setActiveFileId(savedRoom.activeFileId || convertedFiles[0].id);
        }
        
        // Load messages
        if (savedRoom.messages && savedRoom.messages.length > 0) {
          const convertedMessages: Message[] = savedRoom.messages.map((m: any) => ({
            id: m.id,
            username: m.username,
            text: m.text,
            timestamp: m.timestamp?.toMillis() || Date.now()
          }));
          setMessages(convertedMessages);
        }
        
        // Load users
        if (savedRoom.users && savedRoom.users.length > 0) {
          setUsers(savedRoom.users);
        }
        
        setUnsavedFiles(new Set());
        showAlert('Success', 'Session loaded successfully!');
      } else {
        showAlert('Load Error', 'No saved session found for this room.');
      }
    } catch (error) {
      showAlert('Load Error', `Failed to load session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [roomId, firebase, showAlert]);

  const handleUsernameSubmit = (newUsername: string) => {
    setUsername(newUsername);
    setShowUsernamePrompt(false);
  };

  const handleLeaveRoom = () => {
    navigate('/');
  };

  // Get default content for new files
  const getDefaultContent = (language: string): string => {
    switch (language) {
      case 'javascript':
        return '// New JavaScript file\nconsole.log("Hello, Devsync!");\n';
      case 'typescript':
        return '// New TypeScript file\nconsole.log("Hello, Devsync!");\n';
      case 'html':
        return '<!DOCTYPE html>\n<html>\n<head>\n  <title>New HTML File</title>\n</head>\n<body>\n  <h1>Hello, Devsync!</h1>\n</body>\n</html>';
      case 'css':
        return '/* New CSS file */\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n';
      case 'python':
        return '# New Python file\nprint("Hello, Devsync!")\n';
      case 'java':
        return '// New Java file\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Devsync!");\n    }\n}\n';
      default:
        return '// New file\n';
    }
  };

  // Show username prompt if no username provided - check this FIRST
  if (showUsernamePrompt) {
    return <UsernamePrompt onUsernameSubmit={handleUsernameSubmit} roomId={roomId!} />;
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Joining room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <TopBar 
        roomId={roomId!} 
        userCount={users.length}
        onLeaveRoom={handleLeaveRoom}
         onFormatCode={handleFormatCode}
         onRunCode={handleRunCode}
         onSaveSession={handleSaveSession}
         onLoadSession={handleLoadSession}
         isExecuting={codeRunner.isExecuting}
         lastSaved={firebase.lastSaved}
         isSaving={firebase.isLoading}
       />

      {/* Main Content - Full width with no margins */}
      <div className="flex flex-1 min-h-0 w-full">
        {/* Mobile Layout - Stack vertically */}
        <div className="flex flex-col md:hidden w-full p-2 gap-2">
          {/* Mobile Tabs */}
          <div className="flex border-b bg-muted/30 rounded-t-lg">
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'editor' 
                  ? 'bg-background border-b-2 border-primary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('editor')}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>Editor</span>
                {unsavedFiles.size > 0 && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                )}
              </div>
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'chat' 
                  ? 'bg-background border-b-2 border-primary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('chat')}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>Chat</span>
                {messages.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {messages.length}
                  </Badge>
                )}
              </div>
            </button>
            <button
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'users' 
                  ? 'bg-background border-b-2 border-primary text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('users')}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>Users</span>
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  {users.length}
                </Badge>
              </div>
            </button>
          </div>

          {/* Mobile Content */}
          <div className="flex-1 flex flex-col bg-background rounded-lg border shadow-sm">
            {activeTab === 'editor' && (
              <>
                <FileTabs
                  files={files}
                  activeFileId={activeFileId}
                  onFileSelect={handleFileSelect}
                  onFileCreate={handleFileCreate}
                  onFileDelete={handleFileDelete}
                  onFileRename={handleFileRename}
                  onFileUpload={handleFileUpload}
                  onFileDownload={handleFileDownload}
                  onDownloadAll={handleDownloadAll}
                  unsavedFiles={unsavedFiles}
                />
          <div className="flex-1">
              <CodeEditor 
                     ref={codeEditorRef}
                     code={currentCode} 
                onCodeChange={handleCodeChange}
                     language={activeFile?.language || 'javascript'}
                   />
                 </div>
                 {syntaxErrors.length > 0 && (
                   <SyntaxErrorPanel 
                     errors={syntaxErrors}
                     onErrorClick={() => {
                       // Could scroll to error line in editor
                     }}
                   />
                 )}
                <OutputPanel
                  isVisible={showOutputPanel}
                  onToggle={() => setShowOutputPanel(!showOutputPanel)}
                  onExecute={handleRunCode}
                  isExecuting={codeRunner.isExecuting}
                  result={codeRunner.result}
                  className="border-t"
                />
              </>
            )}
            {activeTab === 'chat' && (
              <ChatBox 
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUsername={username}
              />
            )}
            {activeTab === 'users' && (
              <UserList 
                users={users} 
                currentUsername={username} 
              />
            )}
          </div>
        </div>

        {/* Desktop Layout - Two columns with bigger IDE */}
        <div className="hidden md:flex w-full h-full">
          {/* Main IDE Area - Takes most space */}
          <div className="flex-1 flex flex-col min-w-0 bg-background border-r">
            <FileTabs
              files={files}
              activeFileId={activeFileId}
              onFileSelect={handleFileSelect}
              onFileCreate={handleFileCreate}
              onFileDelete={handleFileDelete}
              onFileRename={handleFileRename}
              onFileUpload={handleFileUpload}
              onFileDownload={handleFileDownload}
              onDownloadAll={handleDownloadAll}
              unsavedFiles={unsavedFiles}
            />
             <div className="flex-1 min-h-0">
            <CodeEditor 
                 ref={codeEditorRef}
                 code={currentCode} 
              onCodeChange={handleCodeChange}
                 language={activeFile?.language || 'javascript'}
               />
             </div>
             {syntaxErrors.length > 0 && (
               <SyntaxErrorPanel 
                 errors={syntaxErrors}
                 onErrorClick={(error) => {
                   // Could scroll to error line in editor
                   console.log('Error clicked:', error);
                 }}
               />
             )}
            <OutputPanel
              isVisible={showOutputPanel}
              onToggle={() => setShowOutputPanel(!showOutputPanel)}
              onExecute={handleRunCode}
              isExecuting={codeRunner.isExecuting}
              result={codeRunner.result}
              className="border-t"
            />
          </div>

          {/* Right Sidebar - Combined Chat/Users Panel */}
          <div className="w-96 shrink-0 bg-muted/30">
            <ChatUsersPanel 
              messages={messages}
              users={users}
              currentUsername={username}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;


