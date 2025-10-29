# Devsync API Documentation

Complete API reference for the Devsync backend server.

## Base URL

```
http://localhost:3002 (development)
https://your-backend-domain.com (production)
```

## WebSocket Events

All communication uses Socket.io WebSocket protocol.

### Client → Server Events

#### `joinRoom`

Join or create a room.

**Payload:**
```json
{
  "roomId": "string",
  "username": "string"
}
```

**Example:**
```javascript
socket.emit('joinRoom', {
  roomId: 'abc123',
  username: 'john_doe'
});
```

**Response:** Server emits `roomJoined` event

**Errors:**
- Missing roomId or username → `error` event
- Server error → `error` event

---

#### `sendCodeChange`

Broadcast code changes to other users in the room.

**Payload:**
```json
{
  "roomId": "string",
  "code": "string",
  "fileId": "string (optional)"
}
```

**Example:**
```javascript
socket.emit('sendCodeChange', {
  roomId: 'abc123',
  code: 'console.log("Hello");',
  fileId: 'file_123'
});
```

**Rate Limit:** 30 changes per second per user

**Response:** Server broadcasts `codeChange` to other users in room

**Errors:**
- Rate limit exceeded → `error` event
- Invalid room → Silently ignored

---

#### `createFile`

Create a new file in the room.

**Payload:**
```json
{
  "roomId": "string",
  "file": {
    "id": "string",
    "name": "string",
    "content": "string",
    "language": "string",
    "isActive": "boolean",
    "createdAt": "number"
  }
}
```

**Example:**
```javascript
socket.emit('createFile', {
  roomId: 'abc123',
  file: {
    id: 'file_123',
    name: 'app.js',
    content: 'console.log("Hello");',
    language: 'javascript',
    isActive: true,
    createdAt: Date.now()
  }
});
```

**Rate Limit:** 20 file operations per minute per user

**Response:** Server broadcasts `fileCreated` to all users in room (including sender)

**Errors:**
- Rate limit exceeded → `error` event
- File already exists → Silently ignored
- Invalid file data → `error` event

---

#### `deleteFile`

Delete a file from the room.

**Payload:**
```json
{
  "roomId": "string",
  "fileId": "string"
}
```

**Example:**
```javascript
socket.emit('deleteFile', {
  roomId: 'abc123',
  fileId: 'file_123'
});
```

**Response:** Server broadcasts `fileDeleted` to all users in room

**Errors:**
- File not found → Silently ignored
- Invalid room → Silently ignored

---

#### `renameFile`

Rename a file in the room.

**Payload:**
```json
{
  "roomId": "string",
  "fileId": "string",
  "newName": "string"
}
```

**Example:**
```javascript
socket.emit('renameFile', {
  roomId: 'abc123',
  fileId: 'file_123',
  newName: 'app.js'
});
```

**Response:** Server broadcasts `fileRenamed` to all users in room

**Errors:**
- File not found → Silently ignored
- Invalid name → Silently ignored

---

#### `sendChatMessage`

Send a chat message to the room.

**Payload:**
```json
{
  "roomId": "string",
  "message": "string"
}
```

**Example:**
```javascript
socket.emit('sendChatMessage', {
  roomId: 'abc123',
  message: 'Hello everyone!'
});
```

**Rate Limit:** 10 messages per minute per user

**Response:** Server broadcasts `chatMessage` to all users in room (including sender)

**Errors:**
- Rate limit exceeded → `error` event
- Empty message → Silently ignored

---

#### `sendSelection`

Broadcast cursor/selection changes (for future selection sharing feature).

**Payload:**
```json
{
  "roomId": "string",
  "selection": "object",
  "cursor": "object",
  "fileId": "string"
}
```

**Note:** This event is implemented but not actively used in the current UI.

---

### Server → Client Events

#### `roomJoined`

Emitted when user successfully joins a room.

**Payload:**
```json
{
  "code": "string",
  "messages": [
    {
      "id": "string",
      "username": "string",
      "text": "string",
      "timestamp": "number"
    }
  ],
  "users": [
    {
      "id": "string",
      "username": "string"
    }
  ]
}
```

**Example:**
```javascript
socket.on('roomJoined', (data) => {
  console.log('Joined room with', data.users.length, 'users');
  // Initialize editor with data.code
  // Load messages from data.messages
  // Update user list from data.users
});
```

---

#### `userJoined`

Emitted when a new user joins the room.

**Payload:**
```json
{
  "username": "string",
  "id": "string",
  "users": [
    {
      "id": "string",
      "username": "string"
    }
  ]
}
```

**Example:**
```javascript
socket.on('userJoined', (data) => {
  console.log(data.username, 'joined');
  // Update user list with data.users
});
```

---

#### `userLeft`

Emitted when a user leaves the room.

**Payload:**
```json
{
  "username": "string",
  "id": "string",
  "users": [
    {
      "id": "string",
      "username": "string"
    }
  ]
}
```

**Example:**
```javascript
socket.on('userLeft', (data) => {
  console.log(data.username, 'left');
  // Update user list with data.users
});
```

---

#### `codeChange`

Emitted when code changes in the room (from another user).

**Payload:**
```json
{
  "code": "string",
  "fileId": "string (optional)"
}
```

**Example:**
```javascript
socket.on('codeChange', (data) => {
  // Update editor with data.code
  // If fileId provided, update specific file
});
```

---

#### `fileCreated`

Emitted when a file is created in the room.

**Payload:**
```json
{
  "file": {
    "id": "string",
    "name": "string",
    "content": "string",
    "language": "string",
    "isActive": "boolean",
    "createdAt": "number",
    "createdBy": "string"
  }
}
```

**Example:**
```javascript
socket.on('fileCreated', (data) => {
  // Add file to file list
  // If createdBy === currentUsername, set as active
});
```

---

#### `fileDeleted`

Emitted when a file is deleted from the room.

**Payload:**
```json
{
  "fileId": "string"
}
```

**Example:**
```javascript
socket.on('fileDeleted', (data) => {
  // Remove file from file list
  // If deleted file was active, switch to another file
});
```

---

#### `fileRenamed`

Emitted when a file is renamed in the room.

**Payload:**
```json
{
  "fileId": "string",
  "newName": "string"
}
```

**Example:**
```javascript
socket.on('fileRenamed', (data) => {
  // Update file name in file list
});
```

---

#### `chatMessage`

Emitted when a chat message is sent to the room.

**Payload:**
```json
{
  "id": "string",
  "username": "string",
  "text": "string",
  "timestamp": "number"
}
```

**Example:**
```javascript
socket.on('chatMessage', (message) => {
  // Add message to chat history
  // Display in chat UI
});
```

---

#### `error`

Emitted when an error occurs.

**Payload:**
```json
{
  "message": "string"
}
```

**Common Error Messages:**
- `"Rate limit exceeded. Please slow down."`
- `"Too many messages. Please wait a moment."`
- `"Too many file operations. Please wait a moment."`
- `"Missing roomId or username"`
- `"Failed to join room"`

**Example:**
```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
  // Show error to user
});
```

---

## HTTP REST API

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "OK",
  "rooms": 5,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:3002/health
```

---

## Rate Limiting

Rate limits are enforced per user (based on socket.id).

### Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Code Changes | 30 | 1 second |
| Chat Messages | 10 | 1 minute |
| File Operations | 20 | 1 minute |

### Rate Limit Response

When rate limit is exceeded:
- Server emits `error` event with message
- Operation is ignored
- Client should wait before retrying

---

## Error Handling

### Connection Errors

- `connect_error`: Emitted on connection failure
- Check backend URL and network connectivity
- Verify CORS settings

### Event Errors

- All errors emit `error` event with message
- Client should display errors to user
- Operations fail gracefully

---

## Data Structures

### User Object

```typescript
interface User {
  id: string;          // Socket.id
  username: string;    // User's display name
}
```

### File Object

```typescript
interface File {
  id: string;          // Unique file identifier
  name: string;        // File name with extension
  content: string;     // File content
  language: string;    // Programming language
  isActive: boolean;   // Currently active file
  createdAt: number;   // Timestamp
  createdBy?: string;  // Username of creator
}
```

### Message Object

```typescript
interface Message {
  id: string;          // Unique message ID
  username: string;    // Sender username
  text: string;        // Message content
  timestamp: number;   // Timestamp in milliseconds
}
```

---

## Server Configuration

### Environment Variables

```env
PORT=3002
CORS_ORIGIN=http://localhost:5174,http://localhost:5175
```

### Room Storage

- Rooms stored in-memory (Map data structure)
- Rooms automatically cleaned up when empty
- No persistence (use Firebase for persistence)

### Socket.io Options

```javascript
{
  transports: ['polling', 'websocket'],
  timeout: 20000,
  forceNew: true
}
```

---

## Client Implementation Example

### Complete Client Setup

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3002', {
  transports: ['polling', 'websocket'],
  timeout: 20000,
  forceNew: true
});

// Connection events
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected');
});

// Join room
socket.emit('joinRoom', {
  roomId: 'abc123',
  username: 'john_doe'
});

// Listen for room joined
socket.on('roomJoined', (data) => {
  // Initialize editor
  console.log('Room data:', data);
});

// Send code change
socket.emit('sendCodeChange', {
  roomId: 'abc123',
  code: 'console.log("Hello");',
  fileId: 'file_123'
});

// Listen for code changes
socket.on('codeChange', (data) => {
  // Update editor
  console.log('Code changed:', data.code);
});

// Send message
socket.emit('sendChatMessage', {
  roomId: 'abc123',
  message: 'Hello!'
});

// Listen for messages
socket.on('chatMessage', (message) => {
  // Add to chat
  console.log('Message:', message);
});

// Error handling
socket.on('error', (data) => {
  console.error('Error:', data.message);
  alert(data.message);
});
```

---

## Best Practices

### Client-Side

1. **Reconnection**: Handle disconnect/reconnect gracefully
2. **Rate Limiting**: Respect rate limits, show user feedback
3. **Error Handling**: Always listen for `error` events
4. **State Management**: Keep local state in sync with server
5. **Optimistic Updates**: Update UI immediately, sync with server

### Server-Side

1. **Validation**: Validate all incoming data
2. **Rate Limiting**: Prevent abuse and spam
3. **Error Handling**: Emit clear error messages
4. **Cleanup**: Clean up empty rooms and stale connections
5. **Logging**: Log important events (production)

---

## Security Considerations

### Current Implementation

- Basic rate limiting
- Input validation (client-side)
- CORS protection
- No authentication (public rooms)

### Production Recommendations

1. **Authentication**: Add user authentication
2. **Room Privacy**: Implement private/public rooms
3. **Content Sanitization**: Server-side validation
4. **HTTPS**: Use secure WebSocket (WSS)
5. **Room Passwords**: Optional password protection

---

## Changelog

### Version 1.0.0

- Initial API release
- WebSocket events for real-time sync
- Rate limiting
- File operations
- Chat messaging
- Health check endpoint

---

**For setup instructions, see [README](./README.md)**  
**For user guide, see [USER_GUIDE](./USER_GUIDE.md)**

