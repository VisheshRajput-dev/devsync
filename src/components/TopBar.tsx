import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  LogOut, 
  Moon, 
  Sun, 
  Users, 
  Play, 
  Save, 
  Download,
  Wifi,
  Clock,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import devsyncLogo from '../assets/devsync-logo.png';

interface TopBarProps {
  roomId: string;
  userCount: number;
  onLeaveRoom: () => void;
  onRunCode?: () => void;
  onFormatCode?: () => void;
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
  onFormatCode,
  onSaveSession,
  onLoadSession,
  isExecuting = false,
  lastSaved,
  isSaving = false
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
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

  const formatLastSaved = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between h-full px-4 md:px-6 w-full">
        {/* Left side - Brand & Room info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src={devsyncLogo} 
              alt="Devsync Logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Devsync
            </h1>
          </div>
          
          <div className="hidden sm:flex items-center space-x-3">
            <Badge variant="secondary" className="text-xs font-mono">
              {roomId.slice(0, 8)}...
            </Badge>
            
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{userCount} user{userCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Center - Status indicators */}
        <div className="hidden md:flex items-center space-x-4">
          {lastSaved && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Saved {formatLastSaved(lastSaved)}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Code Formatting */}
          {onFormatCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFormatCode}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 h-8",
                "hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700",
                "dark:hover:bg-indigo-950 dark:hover:border-indigo-800 dark:hover:text-indigo-300",
                "transition-all duration-200"
              )}
            >
              <Code className="h-3 w-3" />
              <span className="hidden sm:inline text-xs font-medium">Format</span>
            </Button>
          )}

          {/* Code Execution */}
          {onRunCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRunCode}
              disabled={isExecuting}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 h-8",
                "hover:bg-green-50 hover:border-green-200 hover:text-green-700",
                "dark:hover:bg-green-950 dark:hover:border-green-800 dark:hover:text-green-300",
                "transition-all duration-200"
              )}
            >
              <Play className="h-3 w-3" />
              <span className="hidden sm:inline text-xs font-medium">
                {isExecuting ? 'Running...' : 'Run Code'}
              </span>
            </Button>
          )}

          {/* Session Management */}
          {onSaveSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSaveSession}
              disabled={isSaving}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 h-8",
                "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700",
                "dark:hover:bg-blue-950 dark:hover:border-blue-800 dark:hover:text-blue-300",
                "transition-all duration-200"
              )}
            >
              <Save className="h-3 w-3" />
              <span className="hidden sm:inline text-xs font-medium">
                {isSaving ? 'Saving...' : 'Save'}
              </span>
            </Button>
          )}

          {onLoadSession && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSession}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 h-8",
                "hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700",
                "dark:hover:bg-purple-950 dark:hover:border-purple-800 dark:hover:text-purple-300",
                "transition-all duration-200"
              )}
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline text-xs font-medium">Load</span>
            </Button>
          )}

          {/* Copy Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={copyRoomLink}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 h-8",
              "hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700",
              "dark:hover:bg-orange-950 dark:hover:border-orange-800 dark:hover:text-orange-300",
              "transition-all duration-200"
            )}
          >
            <Copy className="h-3 w-3" />
            <span className="hidden sm:inline text-xs font-medium">
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 h-8",
              "hover:bg-gray-50 hover:border-gray-200 hover:text-gray-700",
              "dark:hover:bg-gray-800 dark:hover:border-gray-700 dark:hover:text-gray-300",
              "transition-all duration-200"
            )}
          >
            {isDarkMode ? (
              <Sun className="h-3 w-3" />
            ) : (
              <Moon className="h-3 w-3" />
            )}
            <span className="hidden sm:inline text-xs font-medium">
              {isDarkMode ? 'Light' : 'Dark'}
            </span>
          </Button>

          {/* Leave Room */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onLeaveRoom}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 h-8",
              "hover:bg-red-600 hover:border-red-600",
              "transition-all duration-200"
            )}
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline text-xs font-medium">Leave</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;