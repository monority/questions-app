import { describe, it, expect, beforeEach } from 'vitest';
import { PLAYER_SERVICE } from '../services/playerService';
import type { Player } from '../types/game';

describe('PLAYER_SERVICE', () => {
  describe('create', () => {
    it('should create a player with default values', () => {
      const player = PLAYER_SERVICE.create('TestPlayer', 0);
      
      expect(player.name).toBe('TestPlayer');
      expect(player.score).toBe(0);
      expect(player.xp).toBe(0);
      expect(player.level).toBe(1);
      expect(player.status).toBe('playing');
      expect(player.badges).toEqual([]);
    });

    it('should trim player name', () => {
      const player = PLAYER_SERVICE.create('  John  ', 0);
      expect(player.name).toBe('John');
    });
  });

  describe('isValidName', () => {
    it('should return true for valid names', () => {
      expect(PLAYER_SERVICE.isValidName('Player')).toBe(true);
      expect(PLAYER_SERVICE.isValidName('A')).toBe(true);
    });

    it('should return false for empty names', () => {
      expect(PLAYER_SERVICE.isValidName('')).toBe(false);
      expect(PLAYER_SERVICE.isValidName('   ')).toBe(false);
    });

    it('should return false for names > 20 chars', () => {
      expect(PLAYER_SERVICE.isValidName('A'.repeat(21))).toBe(false);
    });
  });

  describe('getLevelForXp', () => {
    it('should return level 1 for 0 XP', () => {
      expect(PLAYER_SERVICE.getLevelForXp(0)).toBe(1);
    });

    it('should return correct level for high XP', () => {
      expect(PLAYER_SERVICE.getLevelForXp(1000)).toBeGreaterThan(1);
    });
  });

  describe('addAnswer', () => {
    let player: Player;

    beforeEach(() => {
      player = PLAYER_SERVICE.create('Test', 0);
    });

    it('should add score for correct answer', () => {
      const updated = PLAYER_SERVICE.addAnswer(player, {
        questionId: 1,
        answer: 'Paris',
        correct: true,
        timeMs: 5000,
        points: 100,
      });
      
      expect(updated.score).toBe(100);
      expect(updated.answers.length).toBe(1);
      expect(updated.streak).toBe(1);
    });

    it('should reset streak for wrong answer', () => {
      player = { ...player, streak: 5, maxStreak: 5 };
      const updated = PLAYER_SERVICE.addAnswer(player, {
        questionId: 1,
        answer: 'Lyon',
        correct: false,
        timeMs: 5000,
        points: 0,
      });
      
      expect(updated.streak).toBe(0);
      expect(updated.maxStreak).toBe(5);
    });
  });

  describe('canAddPlayer', () => {
    it('should allow adding player under max limit', () => {
      expect(PLAYER_SERVICE.canAddPlayer(3)).toBe(true);
    });

    it('should not allow adding player at max limit', () => {
      expect(PLAYER_SERVICE.canAddPlayer(8)).toBe(false);
    });
  });

  describe('canStartGame', () => {
    it('should allow game with minimum players', () => {
      expect(PLAYER_SERVICE.canStartGame(1)).toBe(true);
    });

    it('should not allow game with no players', () => {
      expect(PLAYER_SERVICE.canStartGame(0)).toBe(false);
    });
  });

  describe('sortByScore', () => {
    it('should sort players by score descending', () => {
      const players: Player[] = [
        PLAYER_SERVICE.create('A', 0),
        PLAYER_SERVICE.create('B', 1),
        PLAYER_SERVICE.create('C', 2),
      ];
      players[0].score = 100;
      players[1].score = 200;
      players[2].score = 50;

      const sorted = PLAYER_SERVICE.sortByScore(players);
      expect(sorted[0]!.name).toBe('B');
      expect(sorted[1]!.name).toBe('A');
      expect(sorted[2]!.name).toBe('C');
    });
  });

  describe('getWinner', () => {
    it('should return the player with highest score', () => {
      const players: Player[] = [
        PLAYER_SERVICE.create('A', 0),
        PLAYER_SERVICE.create('B', 1),
      ];
      players[0].score = 100;
      players[1].score = 200;

      const winner = PLAYER_SERVICE.getWinner(players);
      expect(winner?.name).toBe('B');
    });

    it('should return null for empty array', () => {
      expect(PLAYER_SERVICE.getWinner([])).toBeNull();
    });
  });
});