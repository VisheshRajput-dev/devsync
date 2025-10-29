import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User } from '../types';
import { Users, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-blue-500 to-blue-600', 
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-orange-500 to-orange-600'
    ];
    const hash = username.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-base font-semibold">Online Users</div>
            <Badge variant="secondary" className="text-xs mt-1">
              {users.length} user{users.length !== 1 ? 's' : ''} online
            </Badge>
          </div>
        </div>
      </div>

      {/* User List - Scrollable */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                  "hover:bg-muted/50 group",
                  user.username === currentUsername && "bg-primary/5 border border-primary/20"
                )}
              >
                {/* Avatar with Status */}
                <div className="relative">
                  <Avatar className={cn("h-10 w-10 ring-2 ring-background", getAvatarColor(user.username))}>
                    <AvatarFallback className="text-white text-sm font-bold bg-transparent">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium truncate">
                      {user.username}
                    </span>
                    {user.username === currentUsername && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No users online
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default UserList;