import { useCallback, useRef } from 'react';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch {
      // Silently fail if audio is not supported
    }
  }, [getAudioContext]);

  const playCorrect = useCallback(() => {
    playTone(523.25, 0.1, 'sine', 0.2); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 100); // E5
  }, [playTone]);

  const playIncorrect = useCallback(() => {
    playTone(200, 0.15, 'sawtooth', 0.15);
    setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.15), 150);
  }, [playTone]);

  const playTick = useCallback(() => {
    playTone(800, 0.05, 'sine', 0.1);
  }, [playTone]);

  const playCelebrate = useCallback(() => {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'sine', 0.15), i * 80);
    });
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(600, 0.05, 'sine', 0.1);
  }, [playTone]);

  return {
    playCorrect,
    playIncorrect,
    playTick,
    playCelebrate,
    playClick,
  };
}

export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const light = useCallback(() => vibrate(10), [vibrate]);
  const medium = useCallback(() => vibrate(20), [vibrate]);
  const heavy = useCallback(() => vibrate(30), [vibrate]);
  const success = useCallback(() => vibrate([50, 50, 50]), [vibrate]);
  const error = useCallback(() => vibrate([100, 50, 100]), [vibrate]);

  return {
    light,
    medium,
    heavy,
    success,
    error,
  };
}