const CHALLENGE_KEY = 'quiz_challenges';

interface Challenge {
  id: string;
  playerName: string;
  score: number;
  accuracy: number;
  questionsCount: number;
  date: string;
  questions: QuestionChallenge[];
}

interface QuestionChallenge {
  question: string;
  correctAnswer: string;
  playerAnswer: string;
  isCorrect: boolean;
}

export const CHALLENGE_SERVICE = {
  createChallenge(playerName: string, score: number, accuracy: number, questionsCount: number, questions: QuestionChallenge[]): string {
    const challenge: Challenge = {
      id: crypto.randomUUID(),
      playerName,
      score,
      accuracy,
      questionsCount,
      date: new Date().toISOString(),
      questions,
    };

    const challenges = this.getAll();
    challenges.push(challenge);
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenges.slice(-50)));

    return challenge.id;
  },

  getChallenge(id: string): Challenge | null {
    const challenges = this.getAll();
    return challenges.find(c => c.id === id) || null;
  },

  getAll(): Challenge[] {
    const saved = localStorage.getItem(CHALLENGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  },

  getGlobalLeaderboard(): { name: string; score: number; accuracy: number; date: string }[] {
    return this.getAll()
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(c => ({
        name: c.playerName,
        score: c.score,
        accuracy: c.accuracy,
        date: c.date,
      }));
  },

  generateShareUrl(challengeId: string): string {
    return `${window.location.origin}?challenge=${challengeId}`;
  },

  getStats() {
    const challenges = this.getAll();
    return {
      totalChallenges: challenges.length,
      topScore: challenges.reduce((max, c) => Math.max(max, c.score), 0),
      avgAccuracy: challenges.length > 0 
        ? Math.round(challenges.reduce((sum, c) => sum + c.accuracy, 0) / challenges.length)
        : 0,
    };
  },
} as const;