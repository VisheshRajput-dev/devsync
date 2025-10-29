import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User } from '../types';
import { Users, Circle } from 'lucide-react';

interface UserListProps {
  users: User[];
  currentUsername: string;
}

const UserList: React.FC<UserListProps> = ({ users, currentUsername }) => {
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
      {/* Header */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <h3 className="font-semibold text-sm">Online Users</h3>
        </div>
        <Badge variant="secondary" className="mt-1 text-xs">
          {users.length} user{users.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Users List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {users.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users online</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`text-white text-xs ${getAvatarColor(user.username)}`}>
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <Circle 
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500" 
                    strokeWidth={0}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium truncate">
                      {user.username}
                    </span>
                    {user.username === currentUsername && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Online
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t bg-muted/30 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Real-time sync</span>
          <div className="flex items-center space-x-1">
            <Circle className="h-2 w-2 fill-green-500 text-green-500" strokeWidth={0} />
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
