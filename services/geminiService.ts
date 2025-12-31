
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPTS } from '../constants';
import { QuizQuestion } from '../types';

const checkApiKey = (): boolean => {
    if (!process.env.API_KEY || process.env.API_KEY.includes('your_api_key')) {
        console.warn("Gemini API Key is missing or invalid.");
        return false;
    }
    return true;
};

export const generateCourseDay = async (nativeLanguage: string, day: number): Promise<string> => {
  if (!checkApiKey()) return "Please configure your Google Gemini API Key in the application settings to generate lessons.";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: SYSTEM_PROMPTS.COURSE_GENERATOR(nativeLanguage, day),
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini Course Error:", error);
    return "The AI tutor is busy. Please try generating this lesson again.";
  }
};

export const getAiSolverResponseStream = async (
  userText: string,
  history: {role: string, parts: {text: string}[]}[],
  nativeLanguage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  if (!checkApiKey()) {
      const msg = "Please set your API Key to use the Solver.";
      onChunk(msg);
      return msg;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const systemInstruction = SYSTEM_PROMPTS.AI_SOLVER(nativeLanguage);

    // COST OPTIMIZATION: Keep only the last 10 turns for problem solving context
    const recentHistory = history.slice(-10);

    const cleanHistory = recentHistory.map(h => ({
      role: h.role,
      parts: h.parts
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }
      },
      history: cleanHistory,
    });

    const result = await chat.sendMessageStream({ message: userText });
    let fullText = "";
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      const text = c.text || "";
      fullText += text;
      onChunk(fullText);
    }

    return fullText;
  } catch (error) {
    console.error("Gemini Solver Error:", error);
    const err = "Sorry, I am unable to process your request at the moment.";
    onChunk(err);
    return err;
  }
};

export const getAiPartnerResponseStream = async (
  userText: string, 
  history: {role: string, parts: {text: string}[]}[],
  nativeLanguage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  if (!checkApiKey()) {
      const msg = "Please set your API Key to chat with Sonia.";
      onChunk(msg);
      return msg;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let systemInstruction = SYSTEM_PROMPTS.AI_PARTNER;
    if (nativeLanguage) {
      systemInstruction += `\n\nIMPORTANT: Use ${nativeLanguage} for translations at the end of your response after "|||" separator.`;
    }

    // COST OPTIMIZATION: Keep only the last 15 turns to prevent token usage explosion
    const MAX_HISTORY = 15;
    const recentHistory = history.slice(-MAX_HISTORY);

    const cleanHistory = recentHistory.map(h => ({
      role: h.role,
      parts: h.parts.map(p => ({
        text: h.role === 'model' ? p.text.split('|||')[0] : p.text
      }))
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }
      },
      history: cleanHistory,
    });

    const result = await chat.sendMessageStream({ message: userText });
    let fullText = "";
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      const text = c.text || "";
      fullText += text;
      // Filter out markdown emphasis for TTS/UI compatibility immediately
      onChunk(fullText.replace(/\*\*/g, '"'));
    }

    return fullText.replace(/\*\*/g, '"');
  } catch (error) {
    console.error("Gemini Stream Chat Error:", error);
    return "Sorry, I'm having trouble connecting right now.";
  }
};

export const getAiPartnerResponse = async (
  userText: string, 
  history: {role: string, parts: {text: string}[]}[],
  nativeLanguage?: string
): Promise<string> => {
  if (!checkApiKey()) return "API Key Missing";

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let systemInstruction = SYSTEM_PROMPTS.AI_PARTNER;
    
    // COST OPTIMIZATION: Keep only the last 15 turns
    const recentHistory = history.slice(-15);
    
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: { 
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }
      },
      history: recentHistory.map(h => ({ role: h.role, parts: h.parts }))
    });

    const result = await chat.sendMessage({ message: userText });
    return result.text || "I didn't catch that.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Error connecting to Sonia.";
  }
};

export const generateQuizQuestions = async (level: number): Promise<QuizQuestion[]> => {
  if (!checkApiKey()) return [];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: SYSTEM_PROMPTS.QUIZ_GENERATOR(level),
      config: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.INTEGER }
            },
            required: ['id', 'question', 'options', 'correctIndex']
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
};
