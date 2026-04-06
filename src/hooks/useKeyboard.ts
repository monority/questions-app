import { useEffect, useCallback, useState } from 'react';

interface KeyboardShortcutsOptions {
  onNumber?: (num: number) => void;
  onEscape?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onNumber,
  onEscape,
  onEnter,
  onSpace,
  enabled = true,
}: KeyboardShortcutsOptions) {
  const handler = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case '1':
      case '2':
      case '3':
      case '4':
        if (onNumber) onNumber(parseInt(e.key, 10));
        break;
      case 'Escape':
        if (onEscape) onEscape();
        break;
      case 'Enter':
        if (onEnter) onEnter();
        break;
      case ' ':
        if (onSpace) {
          e.preventDefault();
          onSpace();
        }
        break;
    }
  }, [enabled, onNumber, onEscape, onEnter, onSpace]);

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message?: string;
}

export function useLoadingState(initialState: LoadingState = { isLoading: false, progress: 0 }) {
  const [state, setState] = useState(initialState);

  const start = useCallback((message?: string) => {
    setState({ isLoading: true, progress: 0, message });
  }, []);

  const update = useCallback((progress: number, message?: string) => {
    setState(prev => ({ ...prev, progress, message }));
  }, []);

  const complete = useCallback(() => {
    setState({ isLoading: false, progress: 100 });
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, progress: 0 });
  }, []);

  return {
    start,
    update,
    complete,
    reset,
    isLoading: state.isLoading,
    progress: state.progress,
    message: state.message,
  };
}