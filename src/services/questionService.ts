import type { Question } from '../types/game';

interface RawQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

let cachedQuestions: RawQuestion[] | null = null;
let loadingPromise: Promise<RawQuestion[]> | null = null;

async function loadQuestions(): Promise<RawQuestion[]> {
  if (cachedQuestions) return cachedQuestions;
  if (loadingPromise) return loadingPromise;

  loadingPromise = fetch('/questions.json')
    .then(res => res.json())
    .then(data => {
      cachedQuestions = data;
      loadingPromise = null;
      return data;
    });

  return loadingPromise;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function cleanQuestion(q: RawQuestion, id: number): Question {
  const correct = q.correct_answer.trim();
  const incorrect = q.incorrect_answers.map(a => a.trim());
  
  const answers = shuffleArray([correct, ...incorrect]);
  
  return {
    id,
    category: q.category,
    difficulty: q.difficulty,
    type: 'multiple',
    question: q.question,
    correct_answer: correct,
    incorrect_answers: incorrect,
    allAnswers: answers,
  };
}

export const QUESTION_SERVICE = {
  async fetch(amount: number = 10): Promise<Question[]> {
    const allQuestions = await loadQuestions();
    const shuffled = shuffleArray([...allQuestions]);
    const selected = shuffled.slice(0, amount);
    return selected.map((q, index) => cleanQuestion(q, index));
  },

  async fetchByCategory(category: string, amount: number = 10): Promise<Question[]> {
    const allQuestions = await loadQuestions();
    const filtered = allQuestions.filter(q => q.category === category);
    const shuffled = shuffleArray([...filtered]);
    const selected = shuffled.slice(0, amount);
    return selected.map((q, index) => cleanQuestion(q, index));
  },

  async getCategories(): Promise<string[]> {
    const allQuestions = await loadQuestions();
    return [...new Set(allQuestions.map(q => q.category))];
  },

  async getCategoryStats(): Promise<Record<string, number>> {
    const allQuestions = await loadQuestions();
    return allQuestions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },

  clearCache() {
    cachedQuestions = null;
    loadingPromise = null;
  },
} as const;