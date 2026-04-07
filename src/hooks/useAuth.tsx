import { useContext } from 'react';
import { AuthContext, type AuthContextType } from '../contexts/AuthContext';

// The AuthProvider component has been moved to src/providers/AuthProvider.tsx
// This file now only exports the hook

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}