
import React, { useState } from 'react';
import { Dream } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  budget: number;
  dream: Dream;
  onSave: (data: { userName: string, budget: number, dream: Dream }) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, userName, budget, dream, onSave }) => {
  const [localName, setLocalName] = useState(userName);
  const [localBudget, setLocalBudget] = useState(budget.toString());
  const [localDreamName, setLocalDreamName] = useState(dream.name);
  const [localDreamTarget, setLocalDreamTarget] = useState(dream.target.toString());

  if (!isOpen) return null;

  const handleApply = () => {
    onSave({
      userName: localName,
      budget: parseFloat(localBudget) || 0,
      dream: {
        ...dream,
        name: localDreamName,
        target: parseFloat(localDreamTarget) || 0
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-sm glass border-white/20 p-6 rounded-[2rem] space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight text-white">VAULT_CONFIG</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">User Identifier</label>
            <input 
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500/50 outline-none text-white transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">Monthly Budget ($)</label>
            <input 
              type="number"
              value={localBudget}
              onChange={(e) => setLocalBudget(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-violet-500/50 outline-none text-white transition-all"
            />
          </div>

          <div className="pt-2 border-t border-white/5">
            <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">Dream Destination</label>
            <input 
              value={localDreamName}
              onChange={(e) => setLocalDreamName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none text-white transition-all mb-3"
            />
            <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">Target Amount ($)</label>
            <input 
              type="number"
              value={localDreamTarget}
              onChange={(e) => setLocalDreamTarget(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none text-white transition-all"
            />
          </div>
        </div>

        <button 
          onClick={handleApply}
          className="w-full lumi-gradient py-4 rounded-2xl font-bold tracking-widest text-xs text-white shadow-lg shadow-violet-600/30 hover:scale-[1.02] active:scale-95 transition-all"
        >
          UPDATE_VAULT_SYSTEM
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
