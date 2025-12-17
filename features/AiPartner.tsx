import React, { useState, useEffect, useRef } from 'react';
import { getAiPartnerResponse } from '../services/geminiService';
import { Message } from '../types';
import { INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from '../constants';

const AiPartner: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [nativeLang, setNativeLang] = useState(INDIAN_LANGUAGES[0].name); 
  
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Chat Logic ---

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, newUserMsg]);

    const history = [...messages, newUserMsg].map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const aiResponseText = await getAiPartnerResponse(text, history, nativeLang);
    
    const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', text: aiResponseText };
    setMessages(prev => [...prev, newAiMsg]);
    
    speakText(aiResponseText);
  };

  const handleUserMessageRef = useRef(handleUserMessage);
  useEffect(() => {
    handleUserMessageRef.current = handleUserMessage;
  }); 

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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

    const greeting = "Hi! I'm Sonia, your English partner. How are you today?";
    setMessages([{ id: 'init', role: 'model', text: greeting }]);
    speakText(greeting);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const textToSpeak = text.split('|||')[0];

      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Google US English'));
      if (femaleVoice) utterance.voice = femaleVoice;
      
      utterance.rate = 1; 
      utterance.pitch = 1.1; 

      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if(isSpeaking) window.speechSynthesis.cancel();
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const allLanguages = [...INDIAN_LANGUAGES, ...INTERNATIONAL_LANGUAGES];
  
  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      
      {/* Top Header */}
      <div className="bg-white shadow-sm pl-14 pr-4 py-3 flex items-center justify-between z-20 min-h-[64px]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-500 overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia&gender=female" alt="Sonia" className="w-full h-full" />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 leading-tight">Sonia</h3>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">English Tutor</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
            <label htmlFor="lang-select" className="text-[10px] text-gray-400 font-bold uppercase tracking-wide hidden sm:block">Translate:</label>
            <div className="relative bg-gray-100 rounded-lg px-2 py-1.5 flex items-center border border-gray-200">
                <span className="text-xs mr-1">🌐</span>
                <select 
                    id="lang-select"
                    value={nativeLang}
                    onChange={(e) => setNativeLang(e.target.value)}
                    className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer appearance-none pr-6 z-10 relative"
                    style={{ minWidth: '80px' }}
                >
                    {allLanguages.map((lang) => (
                        <option key={lang.code} value={lang.name}>{lang.name}</option>
                    ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-0">
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((msg) => {
          const [englishText, translation] = msg.text.split('|||');
          const isUser = msg.role === 'user';
          
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-gray-100">
                {isUser ? (
                   <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">YOU</div>
                ) : (
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia&gender=female" alt="Sonia" className="w-full h-full bg-indigo-50" />
                )}
              </div>

              <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                isUser 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
              }`}>
                <p className={`text-[15px] leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>{englishText}</p>
                {!isUser && translation && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-indigo-500 font-medium italic">
                            {translation}
                        </p>
                    </div>
                )}
              </div>
            </div>
          );
        })}
        
        {(isListening && !isSpeaking) && (
             <div className="flex justify-end pr-12">
                 <p className="text-xs text-gray-400 animate-pulse">Listening...</p>
             </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Bottom Mic Section */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="flex flex-col items-center justify-center">
          
          <button
            onClick={toggleListening}
            className={`group relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isListening 
                ? 'bg-red-500 scale-110 ring-4 ring-red-100' 
                : 'bg-indigo-600 hover:scale-105 hover:bg-indigo-700'
            }`}
          >
            {isListening && (
               <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            )}
            
            {isListening ? (
              <div className="w-8 h-8 bg-white rounded-md z-10 transition-transform transform group-hover:scale-90" />
            ) : (
              <svg className="w-10 h-10 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
              </svg>
            )}
          </button>
          
          <p className={`mt-3 text-xs font-semibold tracking-wider uppercase ${isListening ? 'text-red-500' : 'text-gray-400'}`}>
            {isListening ? "Listening..." : isSpeaking ? "Sonia is speaking..." : "Tap to Speak"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiPartner;