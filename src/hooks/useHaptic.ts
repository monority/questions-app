import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

const HAPTIC_PATTERNS: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [40],
  success: [30, 50, 30],
  error: [50, 30, 50],
};

export function useHaptic() {
  const trigger = useCallback((type: HapticType = 'light') => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      const pattern = HAPTIC_PATTERNS[type] ?? HAPTIC_PATTERNS.light;
      navigator.vibrate(pattern);
    }
  }, []);

  return { trigger };
}