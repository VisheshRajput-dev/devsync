import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  MessageCircle, 
  Users, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import ChatBox from './ChatBox';
import UserList from './UserList';
import type { User, Message } from '../types';

interface ChatUsersPanelProps {
  messages: Message[];
  users: User[];
  currentUsername: string;
  onSendMessage: (message: string) => void;
}

const ChatUsersPanel: React.FC<ChatUsersPanelProps> = ({
  messages,
  users,
  currentUsername,
  onSendMessage
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Header with Tabs */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              {activeTab === 'chat' ? (
                <MessageCircle className="h-4 w-4 text-primary" />
              ) : (
                <Users className="h-4 w-4 text-primary" />
              )}
            </div>
            <span className="text-base font-semibold">
              {activeTab === 'chat' ? 'Chat' : 'Users'}
            </span>
            <Badge variant="secondary" className="text-xs">
              {activeTab === 'chat' ? messages.length : users.length}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Tab Switcher */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('chat')}
                className="h-7 px-3 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Chat
              </Button>
              <Button
                variant={activeTab === 'users' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('users')}
                className="h-7 px-3 text-xs"
              >
                <Users className="h-3 w-3 mr-1" />
                Users
              </Button>
            </div>
            
            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-7 w-7 p-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable like IDE */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {!isCollapsed && (
          <div className="h-full">
            {activeTab === 'chat' ? (
              <ChatBox 
                messages={messages}
                onSendMessage={onSendMessage}
                currentUsername={currentUsername}
              />
            ) : (
              <UserList 
                users={users} 
                currentUsername={currentUsername} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUsersPanel;