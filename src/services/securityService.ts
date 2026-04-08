const RATE_LIMIT_WINDOW_MS = 60000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

export const SECURITY_SERVICE = {
  isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      return false;
    }

    if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
      return true;
    }

    entry.count++;
    return false;
  },

  sanitizeName(name: string): string {
    return name
      .trim()
      .replace(/[<>\"'&]/g, '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .slice(0, 20);
  },

  sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },

  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  },

  validateScore(score: number): number {
    if (typeof score !== 'number' || isNaN(score) || !isFinite(score)) return 0;
    return Math.max(0, Math.min(1000000, Math.floor(score)));
  },

  validateTimeMs(timeMs: number): number {
    if (typeof timeMs !== 'number' || isNaN(timeMs) || !isFinite(timeMs)) return 0;
    return Math.max(0, Math.min(300000, Math.floor(timeMs)));
  },

  validateLevel(level: number): number {
    if (typeof level !== 'number' || isNaN(level)) return 1;
    return Math.max(1, Math.min(10, Math.floor(level)));
  },

  validateXp(xp: number): number {
    if (typeof xp !== 'number' || isNaN(xp) || !isFinite(xp)) return 0;
    return Math.max(0, Math.min(1000000, Math.floor(xp)));
  },

  detectAnomalies(): { suspicious: boolean; reason?: string } {
    const now = Date.now();
    let totalActions = 0;

    for (const [, entry] of rateLimitStore) {
      if (entry.resetTime > now) {
        totalActions += entry.count;
      }
    }

    if (totalActions > RATE_LIMIT_MAX_ATTEMPTS * 3) {
      return { suspicious: true, reason: 'Too many actions in short time' };
    }

    return { suspicious: false };
  },

  logSecurityEvent(type: string, data?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.warn('[Security]', type, data);
    }
  },
} as const;