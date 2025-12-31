
import React, { useState } from 'react';
import { INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from '../constants';
import { generateCourseDay } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Course: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<{code: string, name: string, flag: string} | null>(null);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 1. Language Selection Screen
  if (!selectedLang) {
    return (
        <div className="p-8 pb-24 bg-white animate-in fade-in duration-500 min-h-full">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Native Language</h2>
              <p className="text-slate-500 font-medium">Choose your language for lesson explanations.</p>
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
                            className="group flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:border-indigo-100 hover:shadow-indigo-50 transition-all text-center active:scale-95"
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
                            className="group flex flex-col items-center gap-3 p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:border-indigo-100 hover:shadow-indigo-50 transition-all text-center active:scale-95"
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

  // 2. Day Selection Screen
  if (!currentDay) {
      return (
          <div className="p-8 pb-24 min-h-full flex flex-col bg-slate-50 animate-in slide-in-from-right-8 duration-500">
              <div className="mb-10 pt-16">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedLang.flag}</span>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">B fluent Academy</p>
                 </div>
                 <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">60-Day Path</h2>
                 <p className="text-slate-500 font-medium text-sm mt-3">Course explains in <span className="text-indigo-600 font-black">{selectedLang.name}</span></p>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 pb-20 no-scrollbar overflow-y-auto">
                  {Array.from({ length: 60 }, (_, i) => i + 1).map(day => (
                      <button
                          key={day}
                          onClick={async () => {
                            setCurrentDay(day);
                            setLoading(true);
                            const generatedContent = await generateCourseDay(selectedLang.name, day);
                            setContent(generatedContent);
                            setLoading(false);
                          }}
                          className="aspect-square w-full flex flex-col items-center justify-center bg-white border border-slate-100 rounded-[2rem] shadow-sm active:scale-90 hover:border-indigo-500 transition-all group"
                      >
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Day</span>
                            <span className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-none">{day}</span>
                          </div>
                      </button>
                  ))}
              </div>

              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                  <button 
                    onClick={() => setSelectedLang(null)} 
                    className="bg-white/90 backdrop-blur-xl border border-slate-100 shadow-2xl px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest text-slate-800 flex items-center gap-3 hover:bg-slate-900 hover:text-white transition-all"
                  >
                      <span>🔄</span> Change Language
                  </button>
              </div>
          </div>
      );
  }

  // 3. Lesson Content Screen
  return (
      <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom-8 duration-500 text-slate-900">
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-6 py-6 pt-16 z-10 border-b border-slate-50 flex justify-between items-center">
              <button 
                  onClick={() => { setContent(''); setCurrentDay(null); }}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-900 transition-all shadow-sm hover:bg-slate-100 active:scale-90"
              >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div className="text-center">
                  <h3 className="font-black text-2xl text-slate-900 tracking-tight">Day {currentDay}</h3>
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">{selectedLang.name} Explanations</span>
              </div>
              <div className="w-12"></div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 no-scrollbar">
              {loading ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
                      <div className="w-20 h-20 relative">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-slate-900 font-black text-2xl mt-8 tracking-tight">Building Lesson...</p>
                      <p className="text-slate-400 text-sm mt-2 font-medium">Your AI tutor is preparing Day {currentDay}</p>
                  </div>
              ) : (
                  <div className="bg-slate-50/50 rounded-[3rem] p-8 border border-slate-100 prose prose-indigo max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-indigo-700 text-slate-900">
                      <ReactMarkdown>{content}</ReactMarkdown>
                      <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                        <button 
                          onClick={() => { setContent(''); setCurrentDay(null); }}
                          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black tracking-tight text-lg shadow-xl active:scale-[0.98] transition-all hover:bg-indigo-600"
                        >
                          Close Lesson
                        </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
};

export default Course;
