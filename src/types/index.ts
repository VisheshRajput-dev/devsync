// TypeScript interfaces for the application

export interface User {
  id: string;
  username: string;
}

export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  isActive: boolean;
  createdAt?: number;
}

export interface RoomState {
  code: string;
  messages: Message[];
  users: User[];
  files: CodeFile[];
  activeFileId?: string;
  language?: string;
}

export interface SocketEvents {
  // Client to Server events
  joinRoom: (data: { roomId: string; username: string }) => void;
  sendCodeChange: (data: { roomId: string; code: string }) => void;
  sendChatMessage: (data: { roomId: string; message: string }) => void;
  
  // Server to Client events
  roomJoined: (data: RoomState) => void;
  userJoined: (data: { username: string; id: string; users: User[] }) => void;
  userLeft: (data: { username: string; id: string; users: User[] }) => void;
  chatMessage: (message: Message) => void;
  codeChange: (data: { code: string }) => void;
  error: (data: { message: string }) => void;
}
