import { useEffect, useState, useRef } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isPaused: boolean;
  key?: string | number;
}

export function Timer({ duration, onTimeUp, isPaused, key }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const rafRef = useRef<number | null>(null);
  const endTimeRef = useRef<number>(0);
  const onTimeUpRef = useRef(onTimeUp);
  const durationRef = useRef(duration);
  
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    if (!isPaused) {
      endTimeRef.current = Date.now() + durationRef.current * 1000;
      setTimeLeft(durationRef.current);

      const tick = () => {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          onTimeUpRef.current();
          rafRef.current = null;
          return;
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPaused, key]);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  const progress = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 5;

  return (
    <div className={`timer ${isLow ? 'low' : ''}`}>
      <div className="timer-bar">
        <div
          className="timer-progress"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="timer-value">{timeLeft}s</span>
    </div>
  );
}
