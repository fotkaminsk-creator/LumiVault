
import React, { useState } from 'react';
import { processCommand } from '../services/geminiService';
import { Expense, Category } from '../types';

interface Props {
  onBudgetSet: (amt: number) => void;
  onDreamSet: (name: string, target: number) => void;
  onExpenseAdd: (exp: Omit<Expense, 'id' | 'date'>) => void;
  setThinking: (val: boolean) => void;
}

const CommandInput: React.FC<Props> = ({ onBudgetSet, onDreamSet, onExpenseAdd, setThinking }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setThinking(true);
    const query = input;
    setInput('');

    try {
      const res = await processCommand(query);
      
      if (res.action === 'SET_BUDGET' && res.amount) {
        onBudgetSet(res.amount);
      } else if (res.action === 'SET_DREAM' && res.dreamName && res.dreamTarget) {
        onDreamSet(res.dreamName, res.dreamTarget);
      } else if (res.action === 'ADD_EXPENSE' && res.amount && res.merchant) {
        onExpenseAdd({
          merchant: res.merchant,
          amount: res.amount,
          category: res.category || Category.Other,
          isSmartBuy: false, // Default
          isWasteful: false, // Default
          savingsAmount: 0,
          feedbackMessage: res.feedbackMessage
        });
      } else if (res.action === 'SPLIT_BILL' && res.splitDetails) {
        // Here we could add a special split result UI, but for now Lumi just talks
      }
      
      // The feedback is handled via Lumi's message state (implicitly via addExpense or just shown)
    } catch (error) {
      console.error("NLU failed", error);
    } finally {
      setIsProcessing(false);
      setThinking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a command... (e.g. 'Split $120 by 4')"
        className="w-full glass bg-zinc-900/50 py-4 px-6 rounded-2xl border-white/10 focus:border-violet-500/50 focus:outline-none transition-all pr-12 text-sm text-white placeholder:text-zinc-600"
      />
      <button 
        type="submit"
        disabled={isProcessing}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 p-2 hover:bg-violet-500/10 rounded-xl transition-all"
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-400 rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
        )}
      </button>
    </form>
  );
};

export default CommandInput;
