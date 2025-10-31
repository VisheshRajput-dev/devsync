import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertDialogContextType {
  showAlert: (title: string, message: string, onConfirm?: () => void) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within AlertDialogProvider');
  }
  return context;
};

interface AlertState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
}

export const AlertDialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
  });

  const showAlert = useCallback((title: string, message: string, onConfirm?: () => void) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type: 'alert',
      onConfirm,
    });
  }, []);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    setAlertState({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
    });
  }, []);

  const handleClose = () => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (alertState.onConfirm) {
      alertState.onConfirm();
    }
    handleClose();
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertDialog open={alertState.isOpen} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertState.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertState.type === 'confirm' && (
              <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
            )}
            <AlertDialogAction onClick={handleConfirm}>
              {alertState.type === 'confirm' ? 'Confirm' : 'OK'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};
