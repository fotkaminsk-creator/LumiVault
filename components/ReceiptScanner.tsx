
import React, { useRef, useState } from 'react';
import { analyzeReceipt } from '../services/geminiService';
import { Expense, Category } from '../types';

interface Props {
  onProcessed: (exp: Omit<Expense, 'id' | 'date'>) => void;
  setThinking: (val: boolean) => void;
}

const ReceiptScanner: React.FC<Props> = ({ onProcessed, setThinking }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setThinking(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      reader.onerror = () => {
        setErrorMessage("CORE_READ_ERROR: Failed to read attachment.");
        setIsUploading(false);
        setThinking(false);
      };
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          const result = await analyzeReceipt(base64);
          
          onProcessed({
            merchant: result.merchant || "Unknown Vendor",
            amount: result.amount || 0,
            category: (result.category as Category) || Category.Other,
            isSmartBuy: result.isSmartBuy || false,
            isWasteful: result.isWasteful || false,
            savingsAmount: result.savingsAmount || 0,
            feedbackMessage: result.feedbackMessage || "Scanned!"
          });
        } catch (err) {
          setErrorMessage("OCR_SYNC_FAILED: Vision system timeout.");
          console.error("Scanning failed", err);
        } finally {
          setIsUploading(false);
          setThinking(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setErrorMessage("SYSTEM_EXCEPTION: Attachment refused.");
      console.error("Scanning failed", error);
      setIsUploading(false);
      setThinking(false);
    }
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="w-full glass py-8 px-6 rounded-3xl border-dashed border-zinc-700 flex flex-col items-center gap-4 hover:border-violet-500 transition-all group active:scale-95"
      >
        <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-white/90">
            {isUploading ? 'DECRYPTING DATA...' : 'ATTACH RECEIPT PHOTO'}
          </p>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">AUTO-CATEGORY OCR SYSTEM 2.0</p>
        </div>
      </button>

      {errorMessage && (
        <div className="mt-3 text-center px-4">
          <p className="text-[10px] font-mono text-red-400 uppercase animate-pulse">{errorMessage}</p>
        </div>
      )}
      
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-3xl">
          <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;
