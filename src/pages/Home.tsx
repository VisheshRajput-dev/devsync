import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Code2, Users, Zap } from 'lucide-react';
import devsyncLogo from '../assets/devsync-logo.png';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Generate a random username if not provided
  const generateGuestUsername = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    return `Guest_${randomNum}`;
  };

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      alert('Please enter your username');
      return;
    }
    
    setIsCreating(true);
    
    // Generate unique room ID
    const newRoomId = crypto.randomUUID();
    
    // Navigate to the room
    navigate(`/room/${newRoomId}`, {
      state: { 
        username: username.trim(),
        isCreator: true 
      }
    });
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    
    if (!username.trim()) {
      alert('Please enter your username');
      return;
    }
    
    setIsJoining(true);
    
    // Navigate to the room
    navigate(`/room/${roomId.trim()}`, {
      state: { 
        username: username.trim(),
        isCreator: false 
      }
    });
  };

  return (
    <div className="w-full h-screen overflow-auto" style={{backgroundColor: 'hsl(20 14.3% 4.1%)'}}>
      <div className="container mx-auto px-4 py-16">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <img 
                  src={devsyncLogo} 
                  alt="Devsync Logo" 
                  className="h-16 w-auto mr-4"
                />
                <h1 className="text-4xl font-bold text-foreground">Devsync</h1>
              </div>
          <p className="text-xl text-muted-foreground mb-8">
            Real-time collaborative code editor for developers
          </p>
          
          {/* Features */}
          <div className="flex justify-center gap-6 mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Multi-user collaboration
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Real-time sync
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <Code2 className="h-4 w-4 mr-2" />
              Live chat
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Room Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code2 className="h-5 w-5 mr-2" />
                  Create New Room
                </CardTitle>
                <CardDescription>
                  Start a new coding session and invite others to join
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="create-username" className="text-sm font-medium mb-2 block">
                    Your Name (optional)
                  </label>
                  <Input
                    id="create-username"
                    placeholder="Enter your name or leave blank for guest"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? 'Creating...' : 'Create Room'}
                </Button>
              </CardContent>
            </Card>

            {/* Join Room Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Join Existing Room
                </CardTitle>
                <CardDescription>
                  Enter a room ID to join an existing coding session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="join-room-id" className="text-sm font-medium mb-2 block">
                    Room ID
                  </label>
                  <Input
                    id="join-room-id"
                    placeholder="Enter room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="join-username" className="text-sm font-medium mb-2 block">
                    Your Name (optional)
                  </label>
                  <Input
                    id="join-username"
                    placeholder="Enter your name or leave blank for guest"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button 
                  onClick={handleJoinRoom}
                  disabled={isJoining}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {isJoining ? 'Joining...' : 'Join Room'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <p className="font-medium">Create or join a room</p>
                  <p className="text-muted-foreground">Get a unique room ID to share with others</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <p className="font-medium">Start coding together</p>
                  <p className="text-muted-foreground">See changes in real-time as others type</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <p className="font-medium">Chat and collaborate</p>
                  <p className="text-muted-foreground">Communicate with your team while coding</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
