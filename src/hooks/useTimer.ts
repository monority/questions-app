import { useState, useCallback, useRef, useEffect } from 'react';

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
}

interface UseTimerReturn extends TimerState {
  start: (duration: number) => void;
  pause: () => void;
  resume: () => void;
  reset: (duration: number) => void;
}

export function useTimer(onTimeUp: () => void): UseTimerReturn {
  const [state, setState] = useState<TimerState>({ timeLeft: 0, isRunning: false });
  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number>(0);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const clearTimer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const start = useCallback((duration: number) => {
    clearTimer();
    endTimeRef.current = Date.now() + duration * 1000;
    setState({ timeLeft: duration, isRunning: true });
    
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setState(prev => ({ ...prev, timeLeft: remaining }));

      if (remaining <= 0) {
        onTimeUpRef.current();
        setState(prev => ({ ...prev, isRunning: false }));
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setState(prev => ({ ...prev, isRunning: false }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (state.timeLeft <= 0) return;
    endTimeRef.current = Date.now() + state.timeLeft * 1000;
    setState(prev => ({ ...prev, isRunning: true }));

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setState(prev => ({ ...prev, timeLeft: remaining }));

      if (remaining <= 0) {
        onTimeUpRef.current();
        setState(prev => ({ ...prev, isRunning: false }));
        rafRef.current = null;
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [state.timeLeft]);

  const reset = useCallback((duration: number) => {
    clearTimer();
    setState({ timeLeft: duration, isRunning: false });
  }, [clearTimer]);

  return {
    timeLeft: state.timeLeft,
    isRunning: state.isRunning,
    start,
    pause,
    resume,
    reset,
  };
}
