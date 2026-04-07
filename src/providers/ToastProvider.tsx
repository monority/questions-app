import { useState, useCallback, type ReactNode } from 'react';
import { ToastContainer } from '../components/ToastContainer';
import { ToastContext } from '../contexts/ToastContext';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'badge';
};

// The useToast hook has been moved to src/hooks/useToast.tsx
// This file now only exports the provider component

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}