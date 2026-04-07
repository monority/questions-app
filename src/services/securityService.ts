const RATE_LIMIT_KEY = 'quiz_rate_limit';

interface RateLimitState {
  [action: string]: { count: number; resetAt: number };
}

const RATE_LIMITS = {
  startGame: { max: 10, windowMs: 60000 },
  submitAnswer: { max: 30, windowMs: 10000 },
  saveProgress: { max: 20, windowMs: 30000 },
  createPlayer: { max: 15, windowMs: 60000 },
} as const;

export const SECURITY_SERVICE = {
  isRateLimited(action: keyof typeof RATE_LIMITS): boolean {
    const limit = RATE_LIMITS[action];
    if (!limit) return false;

    const now = Date.now();
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const state: RateLimitState = stored ? JSON.parse(stored) : {};

    const actionState = state[action];
    if (!actionState || now > actionState.resetAt) {
      state[action] = { count: 1, resetAt: now + limit.windowMs };
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
      return false;
    }

    if (actionState.count >= limit.max) {
      return true;
    }

    actionState.count++;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
    return false;
  },

  resetRateLimit(action?: string) {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return;
    
    const state: RateLimitState = JSON.parse(stored);
    if (action) {
      delete state[action];
    } else {
      localStorage.removeItem(RATE_LIMIT_KEY);
      return;
    }
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
  },

  logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
    const safeDetails = Object.fromEntries(
      Object.entries(details).filter(([_, v]) => 
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
      )
    );
    console.warn(`[SECURITY] ${event}`, safeDetails);
  },

  detectAnomalies(): { suspicious: boolean; reason?: string } {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) return { suspicious: false };

    try {
      const state: RateLimitState = JSON.parse(stored);
      const now = Date.now();

      for (const [, actionState] of Object.entries(state)) {
        if (now < actionState.resetAt && actionState.count > RATE_LIMITS.submitAnswer.max * 2) {
          return { suspicious: true, reason: 'Excessive actions detected' };
        }
      }
    } catch {
      return { suspicious: true, reason: 'Corrupted rate limit data' };
    }

    return { suspicious: false };
  },

  sanitizeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  },
} as const;