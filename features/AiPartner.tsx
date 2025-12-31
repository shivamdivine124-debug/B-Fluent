
import React, { useState, useEffect, useRef } from 'react';
import { getAiPartnerResponseStream } from '../services/geminiService';
import { Message } from '../types';
import { INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from '../constants';

const AiPartner: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [nativeLang, setNativeLang] = useState(INDIAN_LANGUAGES[0].name); 
  
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const spokenSentences = useRef<Set<string>>(new Set());

  const speakSentence = (sentence: string) => {
    if ('speechSynthesis' in window && sentence.trim().length > 2) {
      if (spokenSentences.current.has(sentence)) return;
      spokenSentences.current.add(sentence);

      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.lang = 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find the most natural sounding female voice
      const naturalVoice = voices.find(v => v.name.includes('Natural') && (v.name.includes('English') || v.name.includes('US')));
      const premiumVoice = voices.find(v => v.name.includes('Premium') && v.name.includes('English'));
      const samanthaVoice = voices.find(v => v.name.includes('Samantha'));
      const googleFemaleVoice = voices.find(v => v.name.includes('Google US English'));
      const anyFemaleVoice = voices.find(v => v.name.toLowerCase().includes('female'));

      const selectedVoice = naturalVoice || premiumVoice || samanthaVoice || googleFemaleVoice || anyFemaleVoice || voices[0];
      
      if (selectedVoice) utterance.voice = selectedVoice;
      
      // Fine-tuning for more natural prosody
      utterance.rate = 1.0; // Standard speed for natural feeling
      utterance.pitch = 1.0; // Natural pitch
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    // Reset TTS state
    window.speechSynthesis.cancel();
    spokenSentences.current.clear();

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);

    const history = [...messages, newUserMsg].map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    // Create a placeholder for the AI response
    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: Message = { id: aiMsgId, role: 'model', text: '...' };
    setMessages(prev => [...prev, aiPlaceholder]);
    setIsStreaming(true);

    let lastSpokenIndex = 0;

    await getAiPartnerResponseStream(text, history, nativeLang, (streamedText) => {
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: streamedText } : m));
      
      // Attempt to speak sentence-by-sentence as it streams
      // Only speak the English part (before |||)
      const englishPart = streamedText.split('|||')[0];
      const sentences = englishPart.match(/[^.!?]+[.!?]+/g);
      
      if (sentences) {
        for (let i = lastSpokenIndex; i < sentences.length; i++) {
          speakSentence(sentences[i]);
          lastSpokenIndex = i + 1;
        }
      }
    });

    setIsStreaming(false);
  };

  const handleUserMessageRef = useRef(handleUserMessage);
  useEffect(() => {
    handleUserMessageRef.current = handleUserMessage;
  }); 

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US'; 
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setIsListening(false);
        if (handleUserMessageRef.current) {
            await handleUserMessageRef.current(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Ensure voices are loaded
    window.speechSynthesis.getVoices();

    const greeting = "Hi! I'm Sonia, your English partner. Ready for a quick chat?|||Namaste! Main Sonia hoon, aapki English partner. Kya aap baat karne ke liye taiyaar hain?";
    setMessages([{ id: 'init', role: 'model', text: greeting }]);
    
    // Initial greeting handling
    const initialEng = greeting.split('|||')[0];
    setTimeout(() => {
      speakSentence(initialEng);
    }, 1000); // Slight delay for better voice initialization
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if(isSpeaking || isStreaming) window.speechSynthesis.cancel();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const allLanguages = [...INDIAN_LANGUAGES, ...INTERNATIONAL_LANGUAGES];
  
  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-xl px-6 pt-16 pb-6 flex items-center justify-between z-30 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-[1.8rem] bg-indigo-50 border-2 border-white shadow-lg overflow-hidden p-1">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia&gender=female" alt="Sonia" className="w-full h-full scale-110" />
            </div>
            <div className={`absolute bottom-1 right-1 w-3 h-3 border-2 border-white rounded-full ${isStreaming ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`}></div>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg leading-tight tracking-tight">Sonia</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-indigo-500 animate-pulse' : 'bg-indigo-500'}`}></span>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                {isStreaming ? 'Thinking...' : 'Active Now'}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
            <select 
                value={nativeLang}
                onChange={(e) => setNativeLang(e.target.value)}
                className="bg-slate-100 rounded-2xl px-4 py-2 text-[10px] font-black text-slate-800 outline-none border border-slate-100 appearance-none pr-8 uppercase tracking-widest"
            >
                {allLanguages.map((lang) => (
                    <option key={lang.code} value={lang.name}>{lang.name}</option>
                ))}
            </select>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pt-44 pb-32 px-6 space-y-8 no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const [englishText, translation] = msg.text.split('|||');
          
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`relative px-5 py-4 shadow-xl transition-all duration-300 ${
                isUser 
                  ? 'bg-slate-900 text-white rounded-[2rem] rounded-tr-lg' 
                  : 'bg-white text-slate-800 rounded-[2.2rem] rounded-tl-lg border border-slate-50'
              } max-w-[85%]`}>
                <p className={`text-[15px] font-medium leading-relaxed ${isUser ? 'text-white' : 'text-slate-900'}`}>
                  {englishText}
                  {!isUser && isStreaming && msg.text === '...' && (
                    <span className="inline-flex gap-1 ml-2">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                    </span>
                  )}
                </p>
                {!isUser && translation && (
                    <div className="mt-4 pt-3 border-t border-slate-50 animate-in fade-in duration-700">
                        <p className="text-[11px] text-indigo-600 font-bold italic leading-snug">
                            {translation}
                        </p>
                    </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-center pointer-events-none z-50">
        <div className="pointer-events-auto flex flex-col items-center gap-3">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-[3rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative group ${
              isListening ? 'bg-rose-500 scale-110 shadow-rose-200' : 'bg-indigo-600 shadow-indigo-200'
            }`}
          >
            {isListening ? (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
            )}
          </button>
          
          <div className="bg-white/90 backdrop-blur-xl px-5 py-2 rounded-full border border-slate-100 shadow-xl">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">
              {isListening ? "Listening..." : isStreaming ? "Sonia is responding..." : "Tap to Speak"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPartner;
