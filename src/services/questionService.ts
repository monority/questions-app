import type { Question } from '../types/game';

interface RawQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
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

let cachedQuestions: RawQuestion[] | null = null;

export const QUESTION_SERVICE = {
  async fetch(amount: number = 10): Promise<Question[]> {
    if (!cachedQuestions) {
      const response = await fetch('/questions.json');
      cachedQuestions = await response.json();
    }
    
    const shuffled = shuffleArray([...cachedQuestions!]);
    const selected = shuffled.slice(0, amount);
    
    return selected.map((q, index) => cleanQuestion(q, index));
  },
} as const;