const ANALYTICS_KEY = 'quiz_analytics';

interface GameSession {
  date: string;
  mode: string;
  playerCount: number;
  questionsAnswered: number;
  correctAnswers: number;
  score: number;
  duration: number;
}

interface AnalyticsData {
  sessions: GameSession[];
  totalGames: number;
  totalQuestions: number;
  totalCorrect: number;
  bestScore: number;
  playTime: number;
  lastPlayed: string | null;
}

function getInitialData(): AnalyticsData {
  return {
    sessions: [],
    totalGames: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    bestScore: 0,
    playTime: 0,
    lastPlayed: null,
  };
}

export const ANALYTICS_SERVICE = {
  startSession(mode: string, playerCount: number): string {
    const sessionId = crypto.randomUUID();
    const data = this.getData();
    const now = new Date().toISOString();
    
    data.sessions.push({
      date: now,
      mode,
      playerCount,
      questionsAnswered: 0,
      correctAnswers: 0,
      score: 0,
      duration: 0,
      sessionId,
    } as GameSession & { sessionId: string });
    
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    return sessionId;
  },

  updateSession(sessionId: string, stats: Partial<GameSession>) {
    const data = this.getData();
    const session = data.sessions.find(s => (s as GameSession & { sessionId: string }).sessionId === sessionId);
    
    if (session) {
      Object.assign(session, stats);
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    }
  },

  endSession(sessionId: string, finalStats: Partial<GameSession>) {
    const data = this.getData();
    const sessionIndex = data.sessions.findIndex(s => (s as GameSession & { sessionId: string }).sessionId === sessionId);
    
    if (sessionIndex !== -1) {
      const session = { ...data.sessions[sessionIndex], ...finalStats };
      data.sessions[sessionIndex] = session;
      
      data.totalGames++;
      data.totalQuestions += session.questionsAnswered;
      data.totalCorrect += session.correctAnswers;
      data.bestScore = Math.max(data.bestScore, session.score);
      data.playTime += session.duration;
      data.lastPlayed = session.date;
      
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    }
  },

  getData(): AnalyticsData {
    const saved = localStorage.getItem(ANALYTICS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialData();
      }
    }
    return getInitialData();
  },

  getStats() {
    const data = this.getData();
    return {
      totalGames: data.totalGames,
      totalQuestions: data.totalQuestions,
      accuracy: data.totalQuestions > 0 ? Math.round((data.totalCorrect / data.totalQuestions) * 100) : 0,
      bestScore: data.bestScore,
      totalPlayTime: data.playTime,
      lastPlayed: data.lastPlayed,
    };
  },

  reset() {
    localStorage.removeItem(ANALYTICS_KEY);
  },
} as const;