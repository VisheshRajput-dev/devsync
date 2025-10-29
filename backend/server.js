import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || ["http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    methods: ["GET", "POST"]
  }
});

console.log('🌐 CORS enabled for:', process.env.CORS_ORIGIN || ["http://localhost:5174", "http://localhost:5175", "http://localhost:5176"]);

const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for rooms
const rooms = new Map();

// Room structure:
// {
//   users: Map<socketId, { username: string, id: string }>,
//   code: string,
//   messages: Array<{ id: string, username: string, text: string, timestamp: number }>
// }

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins a room
  socket.on('joinRoom', ({ roomId, username }) => {
    console.log(`📥 Received joinRoom event from ${socket.id}:`, { roomId, username });
    
    try {
      if (!roomId || !username) {
        console.log('❌ Missing roomId or username');
        socket.emit('error', { message: 'Missing roomId or username' });
        return;
      }

      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          users: new Map(),
          code: '// Welcome to Devsync!\n// Start coding together...\n',
          messages: []
        });
        console.log(`🏠 Created new room: ${roomId}`);
      }

      const room = rooms.get(roomId);
      
      // Check if user is already in the room
      if (room.users.has(socket.id)) {
        console.log(`⚠️ User ${username} already in room ${roomId}, skipping join`);
        return;
      }
      
      // Add user to room
      room.users.set(socket.id, { username, id: socket.id });
      socket.join(roomId);

      const roomData = {
        code: room.code,
        messages: room.messages,
        users: Array.from(room.users.values())
      };

      console.log(`📤 Sending roomJoined to ${socket.id}:`, roomData);

      // Send current room state to the joining user
      socket.emit('roomJoined', roomData);

      // Notify other users in the room
      socket.to(roomId).emit('userJoined', {
        username,
        id: socket.id,
        users: Array.from(room.users.values())
      });

      console.log(`✅ ${username} joined room ${roomId} (${room.users.size} users total)`);
    } catch (error) {
      console.error('❌ Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle code changes
  socket.on('sendCodeChange', ({ roomId, code, fileId }) => {
    try {
      const room = rooms.get(roomId);
      if (room) {
        // Update the specific file or default code
        if (fileId) {
          // Store file-specific changes
          if (!room.files) room.files = new Map();
          room.files.set(fileId, code);
        } else {
          // Fallback to default code
          room.code = code;
        }
        
        // Broadcast to all users in the room except sender
        socket.to(roomId).emit('codeChange', { code, fileId });
      }
    } catch (error) {
      console.error('Error handling code change:', error);
    }
  });

  // Handle file creation
  socket.on('createFile', ({ roomId, file }) => {
    try {
      const room = rooms.get(roomId);
      if (room) {
        if (!room.files) room.files = new Map();
        
        // Add creator information
        const user = room.users.get(socket.id);
        const fileWithCreator = {
          ...file,
          createdBy: user ? user.username : 'Unknown'
        };
        
        room.files.set(file.id, fileWithCreator);
        
        // Broadcast to all users in the room
        io.to(roomId).emit('fileCreated', { file: fileWithCreator });
        console.log(`📁 File created: ${file.name} by ${fileWithCreator.createdBy} in room ${roomId}`);
      }
    } catch (error) {
      console.error('Error handling file creation:', error);
    }
  });

  // Handle file deletion
  socket.on('deleteFile', ({ roomId, fileId }) => {
    try {
      const room = rooms.get(roomId);
      if (room && room.files) {
        room.files.delete(fileId);
        
        // Broadcast to all users in the room
        io.to(roomId).emit('fileDeleted', { fileId });
        console.log(`🗑️ File deleted: ${fileId} in room ${roomId}`);
      }
    } catch (error) {
      console.error('Error handling file deletion:', error);
    }
  });

  // Handle file rename
  socket.on('renameFile', ({ roomId, fileId, newName }) => {
    try {
      const room = rooms.get(roomId);
      if (room && room.files) {
        const file = room.files.get(fileId);
        if (file) {
          file.name = newName;
          room.files.set(fileId, file);
          
          // Broadcast to all users in the room
          io.to(roomId).emit('fileRenamed', { fileId, newName });
          console.log(`📝 File renamed: ${fileId} to ${newName} in room ${roomId}`);
        }
      }
    } catch (error) {
      console.error('Error handling file rename:', error);
    }
  });

  // Handle chat messages
  socket.on('sendChatMessage', ({ roomId, message }) => {
    try {
      const room = rooms.get(roomId);
      if (room) {
        const user = room.users.get(socket.id);
        if (user) {
          const chatMessage = {
            id: Date.now().toString(),
            username: user.username,
            text: message,
            timestamp: Date.now()
          };
          
          room.messages.push(chatMessage);
          
          // Broadcast to all users in the room including sender
          io.to(roomId).emit('chatMessage', chatMessage);
        }
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove user from all rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);
        room.users.delete(socket.id);
        
        // Notify other users in the room
        socket.to(roomId).emit('userLeft', {
          username: user.username,
          id: socket.id,
          users: Array.from(room.users.values())
        });

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (no users)`);
        }
        
        break;
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Devsync backend server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

