import { useContext } from 'react';
import { ToastContext, type ToastContextType } from '../contexts/ToastContext';

// The ToastProvider component has been moved to src/providers/ToastProvider.tsx
// This file now only exports the hook

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}