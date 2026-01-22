
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Expense, Category, Dream, LumiMood } from './types';
import { getLumiAdvice } from './services/geminiService';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import LumiMascot from './components/LumiMascot';
import ReceiptScanner from './components/ReceiptScanner';
import CommandInput from './components/CommandInput';
import VoiceInterface from './components/VoiceInterface';
import SettingsModal from './components/SettingsModal';

const INITIAL_STATE: AppState = {
  userName: "Star-Saver",
  budget: 5000,
  spent: 1200,
  dream: {
    name: "Cyber-Voyage to Neo-Tokyo",
    target: 15000,
    current: 4500
  },
  expenses: [
    {
      id: '1',
      merchant: 'CyberMart',
      amount: 45.5,
      category: Category.Groceries,
      date: new Date().toISOString(),
      isSmartBuy: true,
      isWasteful: false,
      savingsAmount: 5.2,
      feedbackMessage: "Great smart grocery choice! 🍏"
    },
    {
      id: '2',
      merchant: 'Neon Arcade',
      amount: 120,
      category: Category.Entertainment,
      date: new Date().toISOString(),
      isSmartBuy: false,
      isWasteful: true,
      savingsAmount: 0,
      feedbackMessage: "That was a splurge, beware! 🕹️"
    }
  ],
  lumiAdvice: "Welcome back, Star-Saver! Ready to vault your dreams today? ✨",
  lumiMood: 'NEUTRAL'
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'dash' | 'vault' | 'voice'>('dash');
  const [isLumiThinking, setIsLumiThinking] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const lastRefreshTime = useRef<number>(0);

  const setMood = (mood: LumiMood, duration: number = 5000) => {
    setState(prev => ({ ...prev, lumiMood: mood }));
    if (mood !== 'NEUTRAL') {
      setTimeout(() => {
        setState(prev => ({ ...prev, lumiMood: 'NEUTRAL' }));
      }, duration);
    }
  };

  const refreshAdvice = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastRefreshTime.current < 30000) return;

    setIsLumiThinking(true);
    setState(prev => ({ ...prev, lumiMood: 'THINKING' }));
    try {
      const advice = await getLumiAdvice(state.budget, state.spent, state.dream.name);
      setState(prev => ({ ...prev, lumiAdvice: advice, lumiMood: 'NEUTRAL' }));
      lastRefreshTime.current = now;
    } catch (error) {
      console.error("Lumi advice failed", error);
    } finally {
      setIsLumiThinking(false);
    }
  }, [state.budget, state.spent, state.dream.name]);

  useEffect(() => {
    const timer = setTimeout(() => refreshAdvice(), 2000);
    return () => clearTimeout(timer);
  }, []);

  const addExpense = (newExp: Omit<Expense, 'id' | 'date'>) => {
    const exp: Expense = {
      ...newExp,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString()
    };
    
    // Set mood based on expense type
    if (exp.isWasteful) setMood('ALERT', 8000);
    else if (exp.isSmartBuy) setMood('HAPPY', 6000);
    else setMood('NEUTRAL');

    setState(prev => ({
      ...prev,
      expenses: [exp, ...prev.expenses],
      spent: prev.spent + exp.amount,
      lumiAdvice: exp.feedbackMessage
    }));
    
    setTimeout(() => refreshAdvice(true), 1500);
  };

  const handleSaveSettings = (data: { userName: string, budget: number, dream: Dream }) => {
    setMood('HAPPY', 4000);
    setState(prev => ({
      ...prev,
      userName: data.userName,
      budget: data.budget,
      dream: data.dream,
      lumiAdvice: `System recalibrated, ${data.userName}. Your path to ${data.dream.name} is optimized! ⚙️`
    }));
    setTimeout(() => refreshAdvice(true), 1500);
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 lumi-gradient opacity-10 blur-3xl -z-10 rounded-full"></div>
      
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400">
            LUMIVAULT
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{state.userName.toUpperCase()} ACCESS NODE</p>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-violet-400 hover:text-white transition-all active:scale-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>
      </header>

      {/* Lumi Character */}
      <div className="px-6 mb-4">
        <LumiMascot 
          message={state.lumiAdvice} 
          mood={isLumiThinking ? 'THINKING' : state.lumiMood} 
          onRefresh={() => refreshAdvice(true)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 space-y-6">
        {activeTab === 'dash' && (
          <>
            <Dashboard 
              budget={state.budget} 
              spent={state.spent} 
              dream={state.dream} 
              onEditDream={() => setIsSettingsOpen(true)}
            />
            <CommandInput 
              onBudgetSet={(amt) => setState(prev => ({ ...prev, budget: amt }))} 
              onDreamSet={(name, target) => setState(prev => ({ ...prev, dream: { ...prev.dream, name, target } }))} 
              onExpenseAdd={addExpense}
              setThinking={setIsLumiThinking}
            />
          </>
        )}
        
        {activeTab === 'vault' && (
          <div className="space-y-6 pb-4">
            <ReceiptScanner onProcessed={addExpense} setThinking={setIsLumiThinking} />
            <ExpenseList expenses={state.expenses} />
          </div>
        )}

        {activeTab === 'voice' && (
          <VoiceInterface />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        userName={state.userName}
        budget={state.budget}
        dream={state.dream}
        onSave={handleSaveSettings}
      />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-black/50 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('dash')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'dash' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30' : 'text-zinc-500 hover:text-white'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        </button>
        <button 
          onClick={() => setActiveTab('vault')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'vault' ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30' : 'text-zinc-500 hover:text-white'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m.599-1.1c.599-.11 1.08-.402 1.08-1 0-.598-.481-.89-1.08-1.1M12 16H9"/></svg>
        </button>
        <button 
          onClick={() => setActiveTab('voice')}
          className={`p-3 rounded-2xl transition-all ${activeTab === 'voice' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30' : 'text-zinc-500 hover:text-white'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
        </button>
      </nav>
    </div>
  );
};

export default App;
