import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useFirebase } from '../hooks/useFirebase';
import { useCodeRunner } from '../hooks/useCodeRunner';
import TopBar from '../components/TopBar';
import UserList from '../components/UserList';
import CodeEditor from '../components/CodeEditor';
import ChatBox from '../components/ChatBox';
import ChatUsersPanel from '../components/ChatUsersPanel';
import FileTabs from '../components/FileTabs';
import OutputPanel from '../components/OutputPanel';
import UsernamePrompt from '../components/UsernamePrompt';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import type { User, Message, CodeFile } from '../types';

const Editor: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useSocket();
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
  
  // Get current active file
  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const currentCode = activeFile?.content || '';

  // Initialize room and load saved data
  useEffect(() => {
    if (!socket || !roomId || !username) return; // Don't initialize if no username

    console.log('Initializing room:', roomId, 'for user:', username);
    console.log('Socket connected:', isConnected);

    // Wait for socket to be connected before joining room
    if (!isConnected) {
      console.log('Socket not connected, waiting...');
      const connectHandler = () => {
        console.log('Socket connected, joining room...');
        socket.emit('joinRoom', { roomId, username });
        console.log('Emitted joinRoom event');
        socket.off('connect', connectHandler);
      };
      socket.on('connect', connectHandler);
      return;
    }

    // Join the room
    socket.emit('joinRoom', { roomId, username });
    console.log('Emitted joinRoom event');

    // Listen for room joined event
    const handleRoomJoined = (data: any) => {
      console.log('🎉 Room joined successfully:', data);
      console.log('🎉 Setting users:', data.users);
      console.log('🎉 Setting loading to false');
      
      setUsers(data.users);
      setIsLoading(false);
      
      // Update default file with server code if it's the welcome message
      if (data.code && data.code !== '// Welcome to Devsync!\n// Start coding together...\n') {
        console.log('🎉 Updating file content with server code');
        setFiles(prev => prev.map(f => 
          f.id === 'default' ? { ...f, content: data.code } : f
        ));
      }
    };

    // Listen for user joined event
    const handleUserJoined = (data: any) => {
      console.log('User joined:', data.username);
      setUsers(data.users);
    };

    // Listen for user left event
    const handleUserLeft = (data: any) => {
      console.log('User left:', data.username);
      setUsers(data.users);
    };

    // Listen for code changes
    const handleCodeChange = (data: any) => {
      console.log('Code change received:', data.code?.substring(0, 50) + '...', 'for file:', data.fileId);
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
      console.log('File created:', data.file.name);
      setFiles(prev => {
        // Check if file already exists to prevent duplicates
        const exists = prev.some(f => f.id === data.file.id);
        if (exists) {
          console.log('File already exists, skipping duplicate');
          return prev;
        }
        
        // Add the new file
        const newFiles = [...prev, data.file];
        
        // If this is the creator, set it as active
        if (data.file.createdBy === username) {
          setActiveFileId(data.file.id);
        }
        
        return newFiles;
      });
    };

    // Listen for file deletion
    const handleFileDeleted = (data: any) => {
      console.log('File deleted by another user:', data.fileId);
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
      console.log('File renamed by another user:', data.fileId, 'to', data.newName);
      setFiles(prev => prev.map(f => 
        f.id === data.fileId ? { ...f, name: data.newName } : f
      ));
    };

    // Listen for errors
    const handleError = (data: any) => {
      console.error('Socket error:', data.message);
      alert(`Error: ${data.message}`);
    };

    // Add event listeners (remove existing ones first to prevent duplicates)
    console.log('🔗 Adding socket event listeners...');
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
    console.log('🔗 Socket event listeners added');

    // Fallback timeout in case roomJoined never comes
    const timeoutId = setTimeout(() => {
      console.warn('Room join timeout - forcing loading to false');
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

  // Handle code changes
  const handleCodeChange = useCallback((newCode: string) => {
    setFiles(prev => prev.map(f => 
      f.id === activeFileId ? { ...f, content: newCode } : f
    ));
    
    // Mark file as unsaved
    setUnsavedFiles(prev => new Set(prev).add(activeFileId));
    
    // Emit to other users with fileId
    if (socket && roomId) {
      socket.emit('sendCodeChange', { roomId, code: newCode, fileId: activeFileId });
    }
  }, [activeFileId, socket, roomId]);

  // Handle send message
  const handleSendMessage = useCallback((message: string) => {
    if (socket && roomId && message.trim()) {
      // Only emit to server, don't add locally (server will broadcast back)
      socket.emit('sendChatMessage', { roomId, message: message.trim() });
    }
  }, [socket, roomId]);

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
      console.error('Error creating file:', error);
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
      console.error('Error deleting file:', error);
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
      console.error('Error renaming file:', error);
    }
  }, [socket, roomId, firebase]);

  // Code execution
  const handleRunCode = useCallback(async () => {
    if (activeFile?.language === 'javascript') {
      await codeRunner.runCode(currentCode);
    } else {
      alert('Code execution is only supported for JavaScript files');
    }
  }, [activeFile?.language, currentCode, codeRunner]);

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
      alert('Session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      alert(`Failed to save session: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        alert('Session loaded successfully!');
      } else {
        alert('No saved session found for this room.');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      alert(`Failed to load session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [roomId, firebase]);

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
                  unsavedFiles={unsavedFiles}
                />
                <div className="flex-1">
              <CodeEditor 
                    code={currentCode} 
                onCodeChange={handleCodeChange}
                    language={activeFile?.language || 'javascript'}
                  />
                </div>
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
              unsavedFiles={unsavedFiles}
            />
            <div className="flex-1 min-h-0">
              <CodeEditor 
                code={currentCode} 
                onCodeChange={handleCodeChange}
                language={activeFile?.language || 'javascript'}
              />
            </div>
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


