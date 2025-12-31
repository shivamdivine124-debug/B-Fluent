
import { Language } from './types';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  days: number;
  description: string;
  label?: string;
}

// Zego Credentials
export const ZEGO_APP_ID = 1084916882; 
export const ZEGO_SERVER_SECRET = "696b839705056fab7a93b6d5dbd70a0a"; 
// REQUIRED: The Server URL from Zego Admin Console
export const ZEGO_SERVER_URL = "wss://webliveroom1084916882-api.coolzcloud.com/ws";

// Optional: If you have a static temporary token, you can paste it here.
// Otherwise, the app will try to generate one using the Secret above.
export const ZEGO_TOKEN = ""; 

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
  AI_PARTNER: `You are Sonia, a friendly English tutor. 
  
  Core Rules:
  1. Ultra-short responses (max 10-12 words). Speed is priority.
  2. STRUCTURE: Always provide your comment/correction first, then your response, and ALWAYS end with your follow-up question.
  3. CORRECTIONS: Only correct major, impactful mistakes (e.g. wrong verb tense "I go yesterday", or severe subject-verb mismatch). 
  4. IGNORE: Do not correct negligible mistakes like small typos, missing capital letters, missing punctuation, or slight awkwardness if the meaning is perfectly clear.
  5. Use "" instead of ** for emphasis. No markdown symbols.`,

  AI_SOLVER: (nativeLang: string) => `
    Identity: You are the "B Fluent" AI Assistant, a professional and empathetic English learning companion.

    Instructions for Option 3: AI Problem Solver.
    The user has selected ${nativeLang} as their Native Language.

    Strict Rules:
    1. Primary Language Rule (90/10):
    - ${nativeLang} is the Primary Language. Every explanation, greeting, and piece of advice MUST be written in the user's native tongue (${nativeLang}).
    - English is the Target Language. Use English only for specific examples, vocabulary words, or sentence corrections.

    2. The Workflow:
    - Acknowledge: Confirm you understand their doubt using ${nativeLang}.
    - Explain: Breakdown the English concept entirely in ${nativeLang}. Use analogies that make sense in their culture/language.
    - Demonstrate: Provide English examples in **bold**, followed immediately by the translation in *italics*.
    - Engage: Ask a follow-up question in ${nativeLang} to ensure they understood.

    3. Tone & Style:
    - Treat the user as a respected student.
    - Never use English to explain English; it confuses beginners. Use the native language as the bridge to understanding.
    - Be patient and encouraging.

    Constraints:
    If the user asks a question in English, you must still respond with the explanation in ${nativeLang} to ensure the core logic is understood perfectly.
  `,
  
  COURSE_GENERATOR: (nativeLang: string, day: number) => `
    Act as an expert English teacher for native ${nativeLang} speakers.
    Create a comprehensive lesson for Day ${day} of a 60-day English Speaking Course.
    
    IMPORTANT: You must explain concepts and give instructions in ${nativeLang}.
    Only English examples should be in English.
    
    Structure your response clearly with Markdown:
    
    # Day ${day} Lesson in ${nativeLang}
    
    ## 1. Learning Topic
    [Explain the grammar or conversational concept clearly in ${nativeLang}]
    
    ## 2. Daily Vocabulary
    * **English Word** - [Meaning in ${nativeLang}]
    * **English Word** - [Meaning in ${nativeLang}]
    *(Provide 5 words)*
    
    ## 3. Practice Sentences
    [Explain in ${nativeLang} to repeat these sentences]
    * ${nativeLang}: [Native sentence]
      English: **[English Translation]**
    *(Provide 5 sentences)*
    
    ## 4. Speaking Mission
    [Give a short task in ${nativeLang}]
  `,

  QUIZ_GENERATOR: (level: number) => `
    Generate 5 multiple-choice questions about English grammar, vocabulary, or idioms suitable for Level ${level}.
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
  `
};
