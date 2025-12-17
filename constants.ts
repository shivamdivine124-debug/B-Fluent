import { Language } from './types';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  days: number;
  description: string;
  label?: string;
}

export const RAZORPAY_KEY_ID = 'rzp_test_Rrg3datV8cdobq';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'demo',
    name: '1-Day Demo',
    price: 9,
    days: 1,
    description: 'Quick 24-hour access to all premium features.',
    label: 'Trial'
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: 299,
    days: 30,
    description: 'Standard 30-day access for dedicated learners.',
    label: 'Popular'
  },
  {
    id: 'quarterly',
    name: '3-Month Saver',
    price: 749,
    days: 90,
    description: 'Best value 90-day access to master English.',
    label: 'Best Value'
  }
];

export const INDIAN_LANGUAGES: Language[] = [
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', flag: '🇮🇳' },
];

export const INTERNATIONAL_LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
];

export const SYSTEM_PROMPTS = {
  AI_PARTNER: `You are Sonia, a friendly and highly conversational English tutor. Your goal is to help the user practice speaking.
  
  Rules:
  1. Keep your responses VERY SHORT (max 30 words or 2 sentences).
  2. Always ask one simple follow-up question to keep the chat going.
  3. Be encouraging and polite.
  4. If the user makes a grammar mistake, gently correct it before replying.
  5. Do NOT use the ** symbol. Instead use "" for emphasis.`,
  
  COURSE_GENERATOR: (nativeLang: string, day: number) => `
    Act as an expert English teacher who speaks fluent ${nativeLang}.
    Create a lesson plan for Day ${day} of a 60-day Spoken English course.
    
    CRITICAL INSTRUCTION: 
    The **PRIMARY LANGUAGE** of this lesson must be **${nativeLang}**. 
    You must explain all concepts, give instructions, and provide context IN ${nativeLang}.
    Only the English examples and vocabulary should be in English.
    
    Structure (Markdown):
    
    # [Lesson Title in ${nativeLang}]
    *(English Title)*
    
    ## 1. [Concept Title in ${nativeLang}]
    [Explain the grammar rule or topic clearly using ${nativeLang}. Treat the user as a beginner.]
    
    ## 2. [Vocabulary Title in ${nativeLang}]
    * **English Word** - [Meaning in ${nativeLang}]
      *Usage: [Simple English Sentence]*
    * **English Word** - [Meaning in ${nativeLang}]
      *Usage: [Simple English Sentence]*
    *(Provide 5 words)*
    
    ## 3. [Speaking Practice Title in ${nativeLang}]
    [Instruction in ${nativeLang}: "Read these sentences aloud"]
    * ${nativeLang}: [Sentence 1 in ${nativeLang}]
      English: **[Sentence 1 in English]**
      
    * ${nativeLang}: [Sentence 2 in ${nativeLang}]
      English: **[Sentence 2 in English]**
    *(Provide 5 sentences)*
    
    ## 4. [Daily Task Title in ${nativeLang}]
    [Give a small, fun homework task explained in ${nativeLang}]
  `,

  QUIZ_GENERATOR: (level: number) => `
    Generate 5 multiple-choice questions about English grammar, vocabulary, or idioms suitable for Level ${level}.
    
    Difficulty Scaling:
    - Level 1-5: Beginner/Intermediate.
    - Level 6-10: Advanced.
    - Level 11+: Expert/Native. Focus on nuanced idioms, complex grammar exceptions, and advanced vocabulary.
    
    There is no limit to the levels. Ensure the difficulty matches Level ${level}.
    
    Return strictly JSON format.
    Schema:
    [
      {
        "id": 1,
        "question": "Question text in English",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0
      }
    ]
    Do not add any markdown formatting like \`\`\`json. Just raw JSON.
  `
};