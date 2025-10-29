import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User } from 'lucide-react';

interface UsernamePromptProps {
  onUsernameSubmit: (username: string) => void;
  roomId: string;
}

const UsernamePrompt: React.FC<UsernamePromptProps> = ({ onUsernameSubmit, roomId }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onUsernameSubmit(username.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'hsl(20 14.3% 4.1%)'}}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary mr-2" />
            <CardTitle>Enter Your Username</CardTitle>
          </div>
          <p className="text-muted-foreground text-sm">
            You need to enter your username to join room: <span className="font-mono text-primary">{roomId.slice(0, 8)}...</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                autoFocus
                maxLength={20}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={!username.trim()}
            >
              Join Room
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsernamePrompt;
