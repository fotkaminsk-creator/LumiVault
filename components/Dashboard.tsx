
import React from 'react';
import { Dream } from '../types';

interface Props {
  budget: number;
  spent: number;
  dream: Dream;
  onEditDream?: () => void;
}

const Dashboard: React.FC<Props> = ({ budget, spent, dream, onEditDream }) => {
  const remaining = budget - spent;
  const progressPercent = Math.min((dream.current / dream.target) * 100, 100);
  const spentPercent = (spent / budget) * 100;

  return (
    <div className="space-y-6">
      {/* Wallet Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass p-5 rounded-3xl border-violet-500/10">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">Vault Status</p>
          <h3 className="text-2xl font-bold tracking-tight">${remaining.toLocaleString()}</h3>
          <p className="text-[10px] text-violet-400 mt-2">LEFT TO SPEND</p>
        </div>
        <div className="glass p-5 rounded-3xl border-pink-500/10">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">Burn Rate</p>
          <h3 className="text-2xl font-bold tracking-tight">${spent.toLocaleString()}</h3>
          <p className="text-[10px] text-pink-400 mt-2">{spentPercent.toFixed(1)}% OF BUDGET</p>
        </div>
      </div>

      {/* Progress Bar (Visual) */}
      <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full lumi-gradient transition-all duration-1000"
          style={{ width: `${Math.min(spentPercent, 100)}%` }}
        />
      </div>

      {/* Dream Visualizer */}
      <div 
        onClick={onEditDream}
        className="glass p-6 rounded-3xl relative overflow-hidden group cursor-pointer hover:border-cyan-500/30 transition-all active:scale-[0.98]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 blur-3xl rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] font-mono text-cyan-400 uppercase mb-1">Dream Target</p>
              <h4 className="text-xl font-bold tracking-tight">{dream.name}</h4>
            </div>
            <div className="bg-cyan-500/10 px-2 py-1 rounded-lg">
               <span className="text-cyan-400 text-xs font-bold">{progressPercent.toFixed(0)}%</span>
            </div>
          </div>
          
          <div className="flex items-end gap-2 mb-4">
            <span className="text-3xl font-bold">${dream.current.toLocaleString()}</span>
            <span className="text-xs text-zinc-500 mb-1.5">/ ${dream.target.toLocaleString()}</span>
          </div>

          <div className="h-4 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
             <div 
               className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-violet-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000"
               style={{ width: `${progressPercent}%` }}
             />
          </div>
          
          <div className="mt-4 flex justify-end">
            <span className="text-[9px] font-mono text-zinc-600 group-hover:text-cyan-400 transition-colors uppercase tracking-widest">TAP_TO_RECONFIGURE_GOAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
