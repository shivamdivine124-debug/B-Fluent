
import React, { useState, useEffect, useRef } from 'react';
import { getAiSolverResponseStream } from '../services/geminiService';
import { Message } from '../types';
import { INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from '../constants';
import ReactMarkdown from 'react-markdown';

const AiSolver: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<{code: string, name: string, flag: string} | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isStreaming || !selectedLang) return;

    const userText = inputText.trim();
    setInputText('');
    
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages(prev => [...prev, newUserMsg]);

    const history = [...messages, newUserMsg].map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    // Placeholder for AI response
    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: Message = { id: aiMsgId, role: 'model', text: '...' };
    setMessages(prev => [...prev, aiPlaceholder]);
    setIsStreaming(true);

    await getAiSolverResponseStream(userText, history, selectedLang.name, (streamedText) => {
      setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: streamedText } : m));
    });

    setIsStreaming(false);
  };

  // 1. Language Selection Screen
  if (!selectedLang) {
    return (
        <div className="p-8 pb-24 bg-white animate-in fade-in duration-500 min-h-full">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Select Language</h2>
              <p className="text-slate-500 font-medium">Choose your native language for better explanations.</p>
            </div>
            
            <div className="mb-10">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                  <span>Indian Dialects</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {INDIAN_LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLang(lang)}
                            className="group flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:border-emerald-100 hover:shadow-emerald-50 transition-all text-center active:scale-95"
                        >
                            <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{lang.flag}</span>
                            <span className="font-black text-slate-800 tracking-tight">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
                  <span>Global Languages</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {INTERNATIONAL_LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLang(lang)}
                            className="group flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:border-emerald-100 hover:shadow-emerald-50 transition-all text-center active:scale-95"
                        >
                            <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{lang.flag}</span>
                            <span className="font-black text-slate-800 tracking-tight">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  // 2. Chat Interface
  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-xl px-6 pt-16 pb-6 flex items-center justify-between z-30 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
             <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg leading-tight tracking-tight">Problem Solver</h3>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                Explanations in {selectedLang.name}
            </p>
          </div>
        </div>
        <button 
            onClick={() => { setSelectedLang(null); setMessages([]); }}
            className="text-slate-400 hover:text-emerald-600 transition"
        >
            <span className="text-2xl">{selectedLang.flag}</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto pt-44 pb-32 px-6 space-y-6 no-scrollbar">
        {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                <span className="text-6xl mb-4 grayscale">🤔</span>
                <p className="text-slate-400 font-bold max-w-[200px]">Ask me anything about English grammar or vocabulary.</p>
            </div>
        )}
        
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`relative px-6 py-5 shadow-sm transition-all duration-300 ${
                isUser 
                  ? 'bg-slate-900 text-white rounded-[2rem] rounded-tr-sm' 
                  : 'bg-white text-slate-800 rounded-[2rem] rounded-tl-sm border border-slate-100'
              } max-w-[90%]`}>
                {isUser ? (
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                ) : (
                    <div className="prose prose-sm prose-slate prose-p:leading-relaxed prose-strong:text-emerald-600">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                )}
              </div>
            </div>
          );
        })}
        
        {isStreaming && messages[messages.length-1]?.role === 'model' && messages[messages.length-1]?.text === '...' && (
             <div className="flex items-center gap-1 ml-4">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
             </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 to-transparent z-40">
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your doubt here..."
                disabled={isStreaming}
                className="w-full bg-white border-2 border-slate-100 text-slate-800 rounded-full pl-6 pr-14 py-4 font-medium outline-none focus:border-emerald-500 transition-all shadow-xl shadow-slate-200/50"
            />
            <button 
                type="submit" 
                disabled={!inputText.trim() || isStreaming}
                className="absolute right-2 p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 active:scale-90 transition-all disabled:opacity-50 disabled:scale-100"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
        </form>
      </div>
    </div>
  );
};

export default AiSolver;
