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

function validateSession(data: unknown): GameSession | null {
  if (typeof data !== 'object' || data === null) return null;
  const s = data as Record<string, unknown>;
  return {
    date: typeof s.date === 'string' ? s.date.slice(0, 50) : new Date().toISOString(),
    mode: typeof s.mode === 'string' ? s.mode.slice(0, 20) : 'solo',
    playerCount: typeof s.playerCount === 'number' ? Math.max(1, Math.min(8, Math.floor(s.playerCount))) : 1,
    questionsAnswered: typeof s.questionsAnswered === 'number' ? Math.max(0, Math.floor(s.questionsAnswered)) : 0,
    correctAnswers: typeof s.correctAnswers === 'number' ? Math.max(0, Math.floor(s.correctAnswers)) : 0,
    score: typeof s.score === 'number' ? Math.max(0, Math.floor(s.score)) : 0,
    duration: typeof s.duration === 'number' ? Math.max(0, Math.floor(s.duration)) : 0,
  };
}

function validateAnalyticsData(data: unknown): AnalyticsData {
  if (typeof data !== 'object' || data === null) return getInitialData();
  const a = data as Record<string, unknown>;
  const sessions = Array.isArray(a.sessions) ? a.sessions.map(validateSession).filter((s): s is GameSession => s !== null).slice(-100) : [];
  return {
    sessions,
    totalGames: typeof a.totalGames === 'number' ? Math.max(0, Math.floor(a.totalGames)) : 0,
    totalQuestions: typeof a.totalQuestions === 'number' ? Math.max(0, Math.floor(a.totalQuestions)) : 0,
    totalCorrect: typeof a.totalCorrect === 'number' ? Math.max(0, Math.floor(a.totalCorrect)) : 0,
    bestScore: typeof a.bestScore === 'number' ? Math.max(0, Math.floor(a.bestScore)) : 0,
    playTime: typeof a.playTime === 'number' ? Math.max(0, Math.floor(a.playTime)) : 0,
    lastPlayed: typeof a.lastPlayed === 'string' ? a.lastPlayed.slice(0, 50) : null,
  };
}

export const ANALYTICS_SERVICE = {
  startSession(mode: string, playerCount: number): string {
    const sessionId = crypto.randomUUID();
    const data = this.getData();
    const now = new Date().toISOString();
    
    data.sessions.push({
      date: now,
      mode: mode.slice(0, 20),
      playerCount: Math.max(1, Math.min(8, playerCount)),
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
      if (typeof stats.questionsAnswered === 'number') session.questionsAnswered = Math.max(0, Math.floor(stats.questionsAnswered));
      if (typeof stats.correctAnswers === 'number') session.correctAnswers = Math.max(0, Math.floor(stats.correctAnswers));
      if (typeof stats.score === 'number') session.score = Math.max(0, Math.floor(stats.score));
      if (typeof stats.duration === 'number') session.duration = Math.max(0, Math.floor(stats.duration));
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    }
  },

  endSession(sessionId: string, finalStats: Partial<GameSession>) {
    const data = this.getData();
    const sessionIndex = data.sessions.findIndex(s => (s as GameSession & { sessionId: string }).sessionId === sessionId);
    
    if (sessionIndex !== -1) {
      const session = { ...data.sessions[sessionIndex] };
      if (typeof finalStats.questionsAnswered === 'number') session.questionsAnswered = Math.max(0, Math.floor(finalStats.questionsAnswered));
      if (typeof finalStats.correctAnswers === 'number') session.correctAnswers = Math.max(0, Math.floor(finalStats.correctAnswers));
      if (typeof finalStats.score === 'number') session.score = Math.max(0, Math.floor(finalStats.score));
      if (typeof finalStats.duration === 'number') session.duration = Math.max(0, Math.floor(finalStats.duration));
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
        return validateAnalyticsData(JSON.parse(saved));
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