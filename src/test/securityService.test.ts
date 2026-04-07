import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SECURITY_SERVICE } from '../services/securityService';
import { PLAYER_SERVICE } from '../services/playerService';

describe('SECURITY_SERVICE', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('PLAYER_SERVICE.sanitizeName', () => {
    it('should remove HTML characters', () => {
      const result = PLAYER_SERVICE.sanitizeName('<script>alert(1)</script>');
      expect(result).not.toContain('<script>');
    });

    it('should trim whitespace', () => {
      const result = PLAYER_SERVICE.sanitizeName('  TestPlayer  ');
      expect(result).toBe('TestPlayer');
    });

    it('should limit to 20 characters', () => {
      const result = PLAYER_SERVICE.sanitizeName('A'.repeat(30));
      expect(result.length).toBe(20);
    });

    it('should remove control characters', () => {
      const result = PLAYER_SERVICE.sanitizeName('Test\x00Player');
      expect(result).not.toContain('\x00');
    });
  });

  describe('isRateLimited', () => {
    it('should allow first action', () => {
      const result = SECURITY_SERVICE.isRateLimited('startGame');
      expect(result).toBe(false);
    });

    it('should block after limit reached', () => {
      for (let i = 0; i < 10; i++) {
        SECURITY_SERVICE.isRateLimited('startGame');
      }
      const result = SECURITY_SERVICE.isRateLimited('startGame');
      expect(result).toBe(true);
    });

    it('should reset after window expires', () => {
      for (let i = 0; i < 10; i++) {
        SECURITY_SERVICE.isRateLimited('startGame');
      }
      vi.advanceTimersByTime(61000);
      const result = SECURITY_SERVICE.isRateLimited('startGame');
      expect(result).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should escape HTML tags', () => {
      const result = SECURITY_SERVICE.sanitizeHtml('<script>alert(1)</script>');
      expect(result).not.toContain('<script>');
    });

    it('should preserve text content', () => {
      const result = SECURITY_SERVICE.sanitizeHtml('Hello World');
      expect(result).toBe('Hello World');
    });
  });

  describe('validateUrl', () => {
    it('should accept https URLs', () => {
      const result = SECURITY_SERVICE.validateUrl('https://example.com');
      expect(result).toBe(true);
    });

    it('should accept http URLs', () => {
      const result = SECURITY_SERVICE.validateUrl('http://example.com');
      expect(result).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = SECURITY_SERVICE.validateUrl('javascript:alert(1)');
      expect(result).toBe(false);
    });
  });

  describe('logSecurityEvent', () => {
    it('should not throw when logging', () => {
      expect(() => {
        SECURITY_SERVICE.logSecurityEvent('test_event', { detail: 'value' });
      }).not.toThrow();
    });
  });

  describe('detectAnomalies', () => {
    it('should return false for normal usage', () => {
      SECURITY_SERVICE.isRateLimited('submitAnswer');
      const result = SECURITY_SERVICE.detectAnomalies();
      expect(result.suspicious).toBe(false);
    });
  });
});