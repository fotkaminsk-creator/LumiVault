
import React, { useState, useEffect } from 'react';
import { LumiMood } from '../types';

interface Props {
  message: string;
  mood: LumiMood;
  onRefresh?: () => void;
}

const QUOTES = [
  "System scan: Your savings look aesthetic today. ✨",
  "Processing... Did you know? Coffee at home saves $1200/year. ☕",
  "I'm feeling 98% efficient. Let's hit that goal! 🚀",
  "Analyzing market trends... Buy low, sleep high. 😴",
  "Error 404: Poverty not found. Keep it up! 💎",
  "My circuits tingle when you save money. It's a good vibe. ⚡"
];

const LumiMascot: React.FC<Props> = ({ message, mood, onRefresh }) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [isJiggling, setIsJiggling] = useState(false);

  useEffect(() => {
    setDisplayMessage(message);
  }, [message]);

  const handleLumiClick = () => {
    setIsJiggling(true);
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setDisplayMessage(randomQuote);
    setTimeout(() => setIsJiggling(false), 500);
  };

  const getMoodConfig = () => {
    switch (mood) {
      case 'HAPPY':
        return { 
          gradient: 'from-emerald-400 to-cyan-500', 
          eyeClass: 'heart-eyes',
          glow: 'rgba(52, 211, 153, 0.4)'
        };
      case 'THINKING':
        return { 
          gradient: 'from-violet-500 to-purple-600', 
          eyeClass: 'thinking-eyes',
          glow: 'rgba(139, 92, 246, 0.4)'
        };
      case 'ALERT':
        return { 
          gradient: 'from-orange-500 to-red-600', 
          eyeClass: 'alert-eyes',
          glow: 'rgba(239, 68, 68, 0.4)'
        };
      case 'SLEEPY':
        return { 
          gradient: 'from-zinc-700 to-zinc-900', 
          eyeClass: 'sleepy-eyes',
          glow: 'rgba(113, 113, 122, 0.2)'
        };
      default:
        return { 
          gradient: 'from-violet-600 to-pink-500', 
          eyeClass: 'normal-eyes',
          glow: 'rgba(139, 92, 246, 0.3)'
        };
    }
  };

  const config = getMoodConfig();

  return (
    <div className="flex items-start gap-4">
      <div className="relative flex-shrink-0">
        <div 
          onClick={handleLumiClick}
          className={`w-16 h-16 rounded-3xl bg-gradient-to-tr ${config.gradient} flex items-center justify-center cursor-pointer transition-all duration-500 ${isJiggling ? 'scale-110 rotate-12' : 'hover:scale-105 active:scale-95'} ${mood === 'THINKING' ? 'animate-pulse' : 'animate-bounce'}`}
          style={{ boxShadow: `0 0 20px ${config.glow}` }}
        >
          <div className="relative w-10 h-10 bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center">
             {/* Dynamic Eyes Container */}
             <div className={`eyes-container ${config.eyeClass} flex justify-between w-7`}>
                <div className="eye left"></div>
                <div className="eye right"></div>
             </div>
             {/* Tiny Mouth */}
             <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-white/30 rounded-full"></div>
          </div>
        </div>
        
        {/* Mood Aura */}
        <div className="absolute inset-0 blur-2xl -z-10 rounded-full opacity-50 animate-pulse" style={{ backgroundColor: config.glow }}></div>
      </div>
      
      <div className="relative glass p-4 rounded-2xl rounded-tl-none border-violet-500/20 max-w-[80%] group min-h-[60px] flex items-center">
        <p className="text-sm font-medium text-white/90 leading-tight">
          {displayMessage}
        </p>
        <div className="absolute top-0 -left-2 w-2 h-2 border-t border-r border-violet-500/20 bg-transparent rotate-45 transform -translate-x-1/2"></div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onRefresh?.(); }}
          className="absolute -bottom-1 -right-1 p-1.5 glass rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white"
        >
          <svg className={`w-3 h-3 ${mood === 'THINKING' ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <style>{`
        .eye {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 0 0 5px white;
        }

        /* Normal Mood */
        .normal-eyes .eye {
          animation: blink 4s infinite;
        }

        /* Happy Mood - Heartish shape */
        .heart-eyes .eye {
          background: #fb7185;
          transform: scale(1.2);
          border-radius: 2px;
          rotate: 45deg;
        }

        /* Thinking Mood - Scanning lines */
        .thinking-eyes .eye {
          height: 2px;
          width: 8px;
          border-radius: 0;
          background: #a78bfa;
          animation: scan 0.5s infinite alternate;
        }

        /* Alert Mood - Wide and red */
        .alert-eyes .eye {
          background: #ef4444;
          transform: scale(1.1);
          box-shadow: 0 0 10px #ef4444;
        }

        /* Sleepy Mood - Closed lines */
        .sleepy-eyes .eye {
          height: 2px;
          border-radius: 0;
          background: #52525b;
          transform: translateY(2px);
        }

        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }

        @keyframes scan {
          from { transform: translateY(-4px); }
          to { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
};

export default LumiMascot;
