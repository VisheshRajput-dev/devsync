import { useState, useCallback } from 'react';
import { 
  saveRoomState, 
  loadRoomState, 
  saveMessage, 
  loadMessages, 
  updateCode,
  saveFile,
  updateFile,
  loadFiles,
  roomExists,
  type RoomData,
  type FileData,
  type SavedMessage
} from '../lib/firestore';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import type { Message } from '../types';

export const useFirebase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((err: any, operation: string) => {
    console.error(`Firebase ${operation} error:`, err);
    setError(`Failed to ${operation}: ${err.message || 'Unknown error'}`);
  }, []);

  // Room operations
  const saveRoom = useCallback(async (roomId: string, roomData: Partial<RoomData>) => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, skipping save');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await saveRoomState(roomId, roomData);
      setLastSaved(new Date());
    } catch (err) {
      handleError(err, 'save room');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const loadRoom = useCallback(async (roomId: string): Promise<RoomData | null> => {
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured, returning null');
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const roomData = await loadRoomState(roomId);
      return roomData;
    } catch (err) {
      handleError(err, 'load room');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const checkRoomExists = useCallback(async (roomId: string): Promise<boolean> => {
    try {
      return await roomExists(roomId);
    } catch (err) {
      handleError(err, 'check room existence');
      return false;
    }
  }, [handleError]);

  // Message operations
  const saveChatMessage = useCallback(async (roomId: string, message: Omit<Message, 'id'>) => {
    try {
      await saveMessage(roomId, message);
    } catch (err) {
      handleError(err, 'save message');
      throw err;
    }
  }, [handleError]);

  const loadChatMessages = useCallback(async (roomId: string, limitCount: number = 50): Promise<SavedMessage[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const messages = await loadMessages(roomId, limitCount);
      return messages;
    } catch (err) {
      handleError(err, 'load messages');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  // Code operations
  const saveCode = useCallback(async (roomId: string, code: string, language: string = 'javascript') => {
    try {
      await updateCode(roomId, code, language);
      setLastSaved(new Date());
    } catch (err) {
      handleError(err, 'save code');
      throw err;
    }
  }, [handleError]);

  // File operations
  const createFile = useCallback(async (roomId: string, fileData: Omit<FileData, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await saveFile(roomId, fileData);
    } catch (err) {
      handleError(err, 'create file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const updateFileContent = useCallback(async (roomId: string, fileId: string, updates: Partial<FileData>) => {
    try {
      await updateFile(roomId, fileId, updates);
      setLastSaved(new Date());
    } catch (err) {
      handleError(err, 'update file');
      throw err;
    }
  }, [handleError]);

  const loadRoomFiles = useCallback(async (roomId: string): Promise<FileData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const files = await loadFiles(roomId);
      return files;
    } catch (err) {
      handleError(err, 'load files');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const deleteFile = useCallback(async (roomId: string, fileId: string) => {
    try {
      const fileRef = doc(db, 'rooms', roomId, 'files', fileId);
      await deleteDoc(fileRef);
    } catch (err) {
      handleError(err, 'delete file');
      throw err;
    }
  }, [handleError]);

  const renameFile = useCallback(async (roomId: string, fileId: string, newName: string) => {
    try {
      const fileRef = doc(db, 'rooms', roomId, 'files', fileId);
      await updateDoc(fileRef, {
        name: newName,
        lastModified: serverTimestamp(),
      });
    } catch (err) {
      handleError(err, 'rename file');
      throw err;
    }
  }, [handleError]);

  // Auto-save with debouncing
  const autoSave = useCallback(async (roomId: string, code: string, language: string = 'javascript') => {
    try {
      await saveCode(roomId, code, language);
    } catch (err) {
      // Don't show error for auto-save failures
      console.warn('Auto-save failed:', err);
    }
  }, [saveCode]);

  return {
    // State
    isLoading,
    error,
    lastSaved,
    
    // Actions
    clearError,
    
    // Room operations
    saveRoom,
    loadRoom,
    checkRoomExists,
    
    // Message operations
    saveChatMessage,
    loadChatMessages,
    
    // Code operations
    saveCode,
    autoSave,
    
    // File operations
    createFile,
    updateFileContent,
    loadRoomFiles,
    deleteFile,
    renameFile,
  };
};
