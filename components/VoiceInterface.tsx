
import React, { useState, useEffect, useRef } from 'react';
import { getGeminiClient, encode, decode, decodeAudioData } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';

const VoiceInterface: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('VOICE_SYNC_READY');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setStatus('VOICE_SYNC_OFFLINE');
  };

  const startSession = async () => {
    try {
      setStatus('INITIATING_CORE...');
      const ai = getGeminiClient();
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('LUMIVOCAL: LINK_ESTABLISHED');
            setIsActive(true);
            
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) {
                int16[i] = input[i] * 32768;
              }
              const blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: blob }));
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64 && audioContextRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              const buffer = await decodeAudioData(decode(base64), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: 'You are Lumi, a futuristic AI financial assistant. You are helpful, cute, and slightly cybernetic. Help the user manage their money, split bills, and save for their dreams. Keep responses concise and friendly.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start voice", err);
      setStatus('CORE_FAILURE');
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
      <div className="relative">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isActive ? 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'border-zinc-800'}`}>
          <div className={`w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center overflow-hidden ${isActive ? 'animate-pulse' : ''}`}>
             {isActive ? (
               <div className="flex items-center gap-1">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className={`w-1 bg-white/50 rounded-full animate-wave`} style={{ height: '20px', animationDelay: `${i * 0.1}s` }}></div>
                 ))}
               </div>
             ) : (
               <svg className="w-10 h-10 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
             )}
          </div>
        </div>
        {isActive && (
          <div className="absolute inset-0 -z-10 bg-cyan-500/20 blur-2xl animate-pulse rounded-full"></div>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs font-mono text-cyan-400 tracking-[0.2em] mb-2">{status}</p>
        <p className="text-zinc-500 text-sm max-w-[200px]">
          {isActive ? 'Lumi is listening to your commands...' : 'Tap below to initiate voice link with Lumi.'}
        </p>
      </div>

      <button 
        onClick={isActive ? stopSession : startSession}
        className={`px-8 py-4 rounded-full font-bold tracking-widest text-xs transition-all border ${isActive ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-600/30 active:scale-95'}`}
      >
        {isActive ? 'TERMINATE_LINK' : 'ESTABLISH_LINK'}
      </button>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 10px; opacity: 0.3; }
          50% { height: 30px; opacity: 1; }
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default VoiceInterface;
