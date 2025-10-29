import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Message } from '../types';

// Room data structure
export interface RoomData {
  id: string;
  code: string;
  language: string;
  createdAt: Timestamp;
  lastModified: Timestamp;
  files: FileData[];
  activeFileId?: string;
  messages?: SavedMessage[];
  users?: User[];
}

export interface FileData {
  id: string;
  name: string;
  content: string;
  language: string;
  isActive: boolean;
  createdAt: Timestamp;
}

export interface SavedMessage {
  id: string;
  username: string;
  text: string;
  timestamp: Timestamp;
}

// Save room state to Firestore
export const saveRoomState = async (roomId: string, roomData: Partial<RoomData>) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await setDoc(roomRef, {
      ...roomData,
      lastModified: serverTimestamp(),
    }, { merge: true });
    console.log('Room state saved successfully');
  } catch (error) {
    console.error('Error saving room state:', error);
    throw error;
  }
};

// Load room state from Firestore
export const loadRoomState = async (roomId: string): Promise<RoomData | null> => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    
    if (roomSnap.exists()) {
      return roomSnap.data() as RoomData;
    } else {
      console.log('No room found with ID:', roomId);
      return null;
    }
  } catch (error) {
    console.error('Error loading room state:', error);
    throw error;
  }
};

// Save a chat message
export const saveMessage = async (roomId: string, message: Omit<Message, 'id'>) => {
  try {
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    await addDoc(messagesRef, {
      username: message.username,
      text: message.text,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Load chat messages for a room
export const loadMessages = async (roomId: string, limitCount: number = 50): Promise<SavedMessage[]> => {
  try {
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SavedMessage));
  } catch (error) {
    console.error('Error loading messages:', error);
    throw error;
  }
};

// Update code content
export const updateCode = async (roomId: string, code: string, language: string = 'javascript') => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      code,
      language,
      lastModified: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating code:', error);
    throw error;
  }
};

// Save file data
export const saveFile = async (roomId: string, fileData: Omit<FileData, 'id' | 'createdAt'>) => {
  try {
    const filesRef = collection(db, 'rooms', roomId, 'files');
    await addDoc(filesRef, {
      ...fileData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

// Update file content
export const updateFile = async (roomId: string, fileId: string, updates: Partial<FileData>) => {
  try {
    const fileRef = doc(db, 'rooms', roomId, 'files', fileId);
    await updateDoc(fileRef, {
      ...updates,
      lastModified: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
};

// Load files for a room
export const loadFiles = async (roomId: string): Promise<FileData[]> => {
  try {
    const filesRef = collection(db, 'rooms', roomId, 'files');
    const querySnapshot = await getDocs(filesRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FileData));
  } catch (error) {
    console.error('Error loading files:', error);
    throw error;
  }
};

// Check if room exists
export const roomExists = async (roomId: string): Promise<boolean> => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomRef);
    return roomSnap.exists();
  } catch (error) {
    console.error('Error checking room existence:', error);
    return false;
  }
};
