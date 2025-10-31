import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { codeChangeRateLimiter, chatMessageRateLimiter, fileOperationRateLimiter } from './rateLimiter.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Parse CORS_ORIGIN - handle comma-separated string or array
const getCorsOrigins = () => {
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    return ["http://localhost:5174", "http://localhost:5175", "http://localhost:5176"];
  }
  // If it's a comma-separated string, split it and trim each origin
  if (typeof corsOrigin === 'string' && corsOrigin.includes(',')) {
    return corsOrigin.split(',').map(origin => {
      const trimmed = origin.trim();
      // Remove trailing slash to match browser origin exactly
      return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
    }).filter(Boolean);
  }
  // Remove trailing slash if present
  const trimmed = corsOrigin.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

// CORS origin matching function - handles exact match and trailing slash variations
const corsOriginMatcher = (origin, callback) => {
  const allowedOrigins = getCorsOrigins();
  const originsArray = Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins];
  
  // Normalize origin - remove trailing slash
  const normalizedOrigin = origin?.endsWith('/') ? origin.slice(0, -1) : origin;
  
  // Check if origin matches any allowed origin (with or without trailing slash)
  const isAllowed = originsArray.some(allowed => {
    const normalizedAllowed = allowed?.endsWith('/') ? allowed.slice(0, -1) : allowed;
    return normalizedOrigin === normalizedAllowed;
  });
  
  callback(null, isAllowed);
};

const io = new Server(server, {
  cors: {
    origin: corsOriginMatcher,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// CORS configuration loaded

const PORT = process.env.PORT || 3002;

// Middleware - CORS with same trailing slash normalization
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigins();
    const originsArray = Array.isArray(allowedOrigins) ? allowedOrigins : [allowedOrigins];
    
    // Normalize origin - remove trailing slash
    const normalizedOrigin = origin?.endsWith('/') ? origin.slice(0, -1) : origin;
    
    // Check if origin matches any allowed origin (with or without trailing slash)
    const isAllowed = originsArray.some(allowed => {
      const normalizedAllowed = allowed?.endsWith('/') ? allowed.slice(0, -1) : allowed;
      return normalizedOrigin === normalizedAllowed;
    });
    
    callback(null, isAllowed);
  },
  credentials: true
}));
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
  // User connected

  // User joins a room
  socket.on('joinRoom', ({ roomId, username }) => {
    try {
      if (!roomId || !username) {
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
      }

      const room = rooms.get(roomId);
      
      // Check if user is already in the room
      if (room.users.has(socket.id)) {
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

      // Send current room state to the joining user
      socket.emit('roomJoined', roomData);

      // Notify other users in the room
      socket.to(roomId).emit('userJoined', {
        username,
        id: socket.id,
        users: Array.from(room.users.values())
      });
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle code changes with rate limiting
  socket.on('sendCodeChange', ({ roomId, code, fileId }) => {
    const userId = socket.id;
    
    // Rate limiting
    if (!codeChangeRateLimiter.isAllowed(userId)) {
      socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
      return;
    }
    
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
      // Error handled silently
    }
  });

  // Handle file creation with rate limiting
  socket.on('createFile', ({ roomId, file }) => {
    const userId = socket.id;
    
    // Rate limiting
    if (!fileOperationRateLimiter.isAllowed(userId)) {
      socket.emit('error', { message: 'Too many file operations. Please wait a moment.' });
      return;
    }
    
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
        
        // Check if file already exists
        if (room.files.has(file.id)) {
          return;
        }
        
        room.files.set(file.id, fileWithCreator);
        
        // Broadcast to ALL users in the room (including the uploader)
        // This ensures consistent behavior for all users
        io.to(roomId).emit('fileCreated', { file: fileWithCreator });
      }
    } catch (error) {
      // Error handled silently
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
      }
    } catch (error) {
      // Error handled silently
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
        }
      }
    } catch (error) {
      // Error handled silently
    }
  });

  // Handle selection/cursor changes
  socket.on('sendSelection', ({ roomId, selection, cursor, fileId }) => {
    try {
      const room = rooms.get(roomId);
      if (room) {
        const user = room.users.get(socket.id);
        if (user) {
          // Broadcast selection to other users in the room
          socket.to(roomId).emit('selectionChange', {
            userId: socket.id,
            username: user.username,
            selection,
            cursor,
            fileId
          });
        }
      }
    } catch (error) {
      // Error handled silently
    }
  });

  // Handle chat messages with rate limiting
  socket.on('sendChatMessage', ({ roomId, message }) => {
    const userId = socket.id;
    
    // Rate limiting
    if (!chatMessageRateLimiter.isAllowed(userId)) {
      socket.emit('error', { message: 'Too many messages. Please wait a moment.' });
      return;
    }
    
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
      // Error handled silently
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
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
        }
        
        break;
      }
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Devsync Backend API',
    status: 'OK',
    version: '1.0.0'
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
server.listen(PORT, '0.0.0.0', () => {
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

