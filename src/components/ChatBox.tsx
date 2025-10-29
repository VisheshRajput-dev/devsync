import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Message } from '../types';
import { Send } from 'lucide-react';

interface ChatBoxProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  currentUsername: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, currentUsername }) => {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    const hash = username.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <h3 className="font-semibold text-sm">Chat</h3>
        <p className="text-xs text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <p>No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex space-x-2 ${
                  message.username === currentUsername ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                  <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={`text-white text-xs ${getAvatarColor(message.username)}`}>
                    {getInitials(message.username)}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col max-w-[80%] ${
                  message.username === currentUsername ? 'items-end' : 'items-start'
                }`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-medium text-foreground">
                      {message.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    {message.username === currentUsername && (
                      <span className="text-xs text-muted-foreground">(You)</span>
                    )}
                  </div>
                  
                  <div className={`px-3 py-2 rounded-lg text-sm ${
                    message.username === currentUsername
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    {message.text}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t bg-muted/30 p-4">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            maxLength={500}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
