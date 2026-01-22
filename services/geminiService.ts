
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Category, NLUResponse } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

const handleApiError = (error: any) => {
  if (error?.message?.includes("429") || error?.status === 429) {
    console.warn("Gemini API rate limit reached. Using fallback.");
    return "Lumi is resting right now. Let's save some energy! ✨";
  }
  throw error;
};

export const analyzeReceipt = async (base64Image: string): Promise<any> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: "Проанализируй этот чек. Извлеки данные в формате JSON."
          }
        ]
      },
      config: {
        systemInstruction: "Проанализируй этот чек. Извлеки: название магазина (merchant), общую сумму (total amount) и категорию (выбери из: 'Groceries', 'Apparel', 'Auto', 'Other'). Также определи: является ли покупка умной (isSmartBuy) — были ли скидки или акции; является ли покупка расточительной (isWasteful) — предметы роскоши или импульсивные траты. Оцени примерную сумму экономии (savingsAmount). Напиши короткое сообщение обратной связи (feedbackMessage) — не более 5 слов. Верни ответ ТОЛЬКО в формате JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            isSmartBuy: { type: Type.BOOLEAN },
            isWasteful: { type: Type.BOOLEAN },
            savingsAmount: { type: Type.NUMBER },
            feedbackMessage: { type: Type.STRING }
          },
          required: ["merchant", "amount", "category", "feedbackMessage"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return handleApiError(error);
  }
};

export const processCommand = async (text: string): Promise<NLUResponse> => {
  try {
    const ai = getGeminiClient();
    const today = new Date().toISOString().split('T')[0];
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: text,
      config: {
        systemInstruction: `Сегодня ${today}. Ты — Люми, финансовый ИИ-ассистент. Твои задачи: Если пользователь просит разделить счет, рассчитай сумму на человека и верни объект 'splitDetails'. Если пользователь добавляет расход текстом, определи 'isSmartBuy' или 'isWasteful'. Если речь о настройках, используй действия SET_BUDGET или SET_DREAM. Если команда непонятна, вежливо уточни в поле 'feedbackMessage'. Верни ТОЛЬКО JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            merchant: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            splitDetails: {
              type: Type.OBJECT,
              properties: {
                total: { type: Type.NUMBER },
                perPerson: { type: Type.NUMBER },
                peopleCount: { type: Type.NUMBER }
              }
            },
            dreamName: { type: Type.STRING },
            dreamTarget: { type: Type.NUMBER },
            feedbackMessage: { type: Type.STRING }
          },
          required: ["feedbackMessage"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as NLUResponse;
  } catch (error) {
    const fallbackMessage = handleApiError(error);
    return { feedbackMessage: typeof fallbackMessage === 'string' ? fallbackMessage : "System busy. Try later." };
  }
};

export const getLumiAdvice = async (budget: number, spent: number, dreamName: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Бюджет: $${budget}, Потрачено: $${spent}, Цель: ${dreamName}`,
      config: {
        systemInstruction: "Ты — Люми, милый и полезный финансовый помощник. Дай один очень короткий (максимум 6 слов) проактивный финансовый совет. Будь дружелюбным, используй милый стиль общения. Помоги пользователю быстрее достичь его мечты. Используй эмодзи.",
      }
    });

    return response.text?.trim() || "Копи на мечту вместе со мной! ✨";
  } catch (error) {
    return handleApiError(error);
  }
};

// Live API Helpers
export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
