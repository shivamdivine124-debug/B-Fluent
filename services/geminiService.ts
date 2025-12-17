import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPTS } from '../constants';
import { QuizQuestion } from '../types';

/**
 * Service to interact with the Google GenAI API.
 * Following official @google/genai guidelines:
 * - Initialize inside functions to ensure fresh credentials.
 * - Use process.env.API_KEY directly.
 * - Use recommended models like 'gemini-3-flash-preview' and 'gemini-3-pro-preview'.
 * - Extract text output using the .text property.
 */

export const generateCourseDay = async (nativeLanguage: string, day: number): Promise<string> => {
  // Always initialize client right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: SYSTEM_PROMPTS.COURSE_GENERATOR(nativeLanguage, day),
    });
    // Use response.text directly (property, not method)
    return response.text || "Failed to generate content.";
  } catch (error) {
    console.error("Gemini Course Error:", error);
    return "Error generating course content. Please try again.";
  }
};

export const getAiPartnerResponse = async (
  userText: string, 
  history: {role: string, parts: {text: string}[]}[],
  nativeLanguage?: string
): Promise<string> => {
  // Always initialize client right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    let systemInstruction = SYSTEM_PROMPTS.AI_PARTNER;
    
    if (nativeLanguage) {
      systemInstruction += `\n\nIMPORTANT: You are speaking to a native ${nativeLanguage} speaker learning English.
      1. Respond in natural, conversational English.
      2. If the user makes a mistake, correct them gently in English.
      3. At the very end of your response, provide a translation of your English response in ${nativeLanguage}.
      4. Separate the English response and the translation with the delimiter "|||".
      5. Example format: "That is great to hear!|||[Translation in ${nativeLanguage}]"
      `;
    }

    // Clean history: Remove previous translations (after |||) from model messages.
    const cleanHistory = history.map(h => ({
      role: h.role,
      parts: h.parts.map(p => ({
        text: h.role === 'model' ? p.text.split('|||')[0] : p.text
      }))
    }));

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
      history: cleanHistory,
    });

    const result = await chat.sendMessage({ message: userText });
    // Use result.text directly
    const rawText = result.text || "I didn't catch that.";

    // Replace ** with " to clean up any markdown that might leak through
    return rawText.replace(/\*\*/g, '"');
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I'm having trouble connecting right now.";
  }
};

export const generateQuizQuestions = async (level: number): Promise<QuizQuestion[]> => {
  // Always initialize client right before use
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: SYSTEM_PROMPTS.QUIZ_GENERATOR(level),
      config: {
        responseMimeType: 'application/json',
        // Use responseSchema for robust structured data output
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
            required: ['id', 'question', 'options', 'correctIndex'],
            propertyOrdering: ['id', 'question', 'options', 'correctIndex']
          }
        }
      }
    });

    // Use response.text directly
    const text = response.text || "[]";
    return JSON.parse(text) as QuizQuestion[];
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return [];
  }
};