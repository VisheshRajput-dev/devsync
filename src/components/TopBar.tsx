import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, LogOut, Moon, Sun, Users, Play, Save, Download } from 'lucide-react';

interface TopBarProps {
  roomId: string;
  userCount: number;
  onLeaveRoom: () => void;
  onRunCode?: () => void;
  onSaveSession?: () => void;
  onLoadSession?: () => void;
  isExecuting?: boolean;
  lastSaved?: Date | null;
  isSaving?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ 
  roomId, 
  userCount, 
  onLeaveRoom, 
  onRunCode,
  onSaveSession,
  onLoadSession,
  isExecuting = false,
  lastSaved,
  isSaving = false
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [copied, setCopied] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Toggle dark mode on document
    document.documentElement.classList.toggle('dark');
  };

  const copyRoomLink = async () => {
    const roomLink = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room link:', err);
    }
  };

  return (
    <div className="h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left side - Room info */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center space-x-1 md:space-x-2">
            <h1 className="text-base md:text-lg font-semibold">Devsync</h1>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              Room: {roomId.slice(0, 8)}...
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1 text-xs md:text-sm text-muted-foreground">
            <Users className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{userCount} user{userCount !== 1 ? 's' : ''}</span>
            <span className="sm:hidden">{userCount}</span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-1 md:space-x-2 flex-wrap">
          {/* Code Execution */}
          {onRunCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRunCode}
              disabled={isExecuting}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3"
            >
              <Play className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{isExecuting ? 'Running...' : 'Run Code'}</span>
              <span className="sm:hidden">{isExecuting ? '...' : 'Run'}</span>
            </Button>
          )}

          {/* Session Management */}
          {onSaveSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveSession}
              disabled={isSaving}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3"
            >
              <Save className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Session'}</span>
              <span className="sm:hidden">{isSaving ? '...' : 'Save'}</span>
            </Button>
          )}

          {onLoadSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSession}
              className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3"
            >
              <Download className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Load Session</span>
              <span className="sm:hidden">Load</span>
            </Button>
          )}

          {/* Last Saved Indicator */}
          {lastSaved && (
            <Badge variant="outline" className="text-xs">
              Saved {lastSaved.toLocaleTimeString()}
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={copyRoomLink}
            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3"
          >
            <Copy className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
            <span className="sm:hidden">{copied ? '✓' : 'Copy'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3"
          >
            {isDarkMode ? (
              <Sun className="h-3 w-3 md:h-4 md:w-4" />
            ) : (
              <Moon className="h-3 w-3 md:h-4 md:w-4" />
            )}
            <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={onLeaveRoom}
            className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3"
          >
            <LogOut className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Leave Room</span>
            <span className="sm:hidden">Leave</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
