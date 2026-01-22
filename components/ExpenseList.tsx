
import React from 'react';
import { Expense } from '../types';

interface Props {
  expenses: Expense[];
}

const ExpenseList: React.FC<Props> = ({ expenses }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest px-1">LATEST ARCHIVES</h3>
      {expenses.map(exp => (
        <div key={exp.id} className="glass p-4 rounded-3xl flex items-center gap-4 group hover:border-white/20 transition-all border-white/5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${exp.isWasteful ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {exp.isWasteful ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate text-white/90">{exp.merchant}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 uppercase">{exp.category}</span>
              <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
              <span className="text-[10px] text-zinc-500 uppercase">{new Date(exp.date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold tracking-tight">${exp.amount.toFixed(2)}</p>
            {exp.savingsAmount > 0 && (
              <p className="text-[9px] text-emerald-400 font-mono">-${exp.savingsAmount.toFixed(2)} SAVED</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseList;
