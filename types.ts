
export enum Category {
  Groceries = 'Groceries',
  Apparel = 'Apparel',
  Auto = 'Auto',
  Other = 'Other',
  Dining = 'Dining',
  Entertainment = 'Entertainment'
}

export type LumiMood = 'NEUTRAL' | 'HAPPY' | 'THINKING' | 'ALERT' | 'SLEEPY';

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  category: Category;
  date: string;
  isSmartBuy: boolean;
  isWasteful: boolean;
  savingsAmount: number;
  feedbackMessage: string;
}

export interface SplitDetails {
  total: number;
  perPerson: number;
  peopleCount: number;
}

export interface Dream {
  name: string;
  target: number;
  current: number;
}

export interface AppState {
  userName: string;
  budget: number;
  spent: number;
  dream: Dream;
  expenses: Expense[];
  lumiAdvice: string;
  lumiMood: LumiMood;
}

export interface NLUResponse {
  action?: 'SET_BUDGET' | 'SET_DREAM' | 'ADD_EXPENSE' | 'SPLIT_BILL' | 'UNKNOWN';
  merchant?: string;
  amount?: number;
  category?: Category;
  splitDetails?: SplitDetails;
  dreamName?: string;
  dreamTarget?: number;
  feedbackMessage: string;
}
