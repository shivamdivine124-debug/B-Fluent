
export interface User {
  id: string;
  email: string;
  isSubscribed: boolean;
  completedDays?: number[];
  quizScore?: number;
}

export enum AppRoute {
  HOME = 'HOME',
  AUTH = 'AUTH',
  COURSE = 'COURSE',
  AI_PARTNER = 'AI_PARTNER',
  AI_SOLVER = 'AI_SOLVER',
  HUMAN_CHAT = 'HUMAN_CHAT',
  QUIZ = 'QUIZ',
  POLICY = 'POLICY',
  SUBSCRIPTION = 'SUBSCRIPTION',
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface DayPlan {
  day: number;
  title: string;
  content: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}
