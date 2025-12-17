import React, { useState } from 'react';
import { INDIAN_LANGUAGES, INTERNATIONAL_LANGUAGES } from '../constants';
import { generateCourseDay } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const Course: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<{code: string, name: string} | null>(null);
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleDaySelect = async (day: number) => {
    setCurrentDay(day);
    setLoading(true);
    setContent('');
    
    if (selectedLang) {
      const generatedContent = await generateCourseDay(selectedLang.name, day);
      setContent(generatedContent);
    }
    setLoading(false);
  };

  // 1. Language Selection Screen
  if (!selectedLang) {
    return (
        <div className="p-6 pb-24">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Choose Native Language</h2>
            
            <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Indian Languages</h3>
                <div className="grid grid-cols-2 gap-3">
                    {INDIAN_LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLang(lang)}
                            className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all text-left"
                        >
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="font-bold text-slate-700 text-sm">{lang.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">International</h3>
                <div className="grid grid-cols-2 gap-3">
                    {INTERNATIONAL_LANGUAGES.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setSelectedLang(lang)}
                            className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 transition-all text-left"
                        >
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="font-bold text-slate-700 text-sm">{lang.name}</span>
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
          <div className="p-6 pb-24 h-full flex flex-col bg-slate-50">
              <button 
                onClick={() => setSelectedLang(null)} 
                className="self-start text-xs font-bold text-indigo-500 bg-white border border-indigo-100 px-4 py-2 rounded-full mb-6 hover:bg-indigo-50 shadow-sm transition-all flex items-center gap-2"
              >
                  <span>←</span> Change Language
              </button>
              
              <div className="mb-8">
                 <h2 className="text-3xl font-black text-slate-800 leading-tight">60 Day Course</h2>
                 <p className="text-slate-500 font-medium text-sm mt-2">Learning in <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">{selectedLang.name}</span></p>
              </div>

              {/* Fixed Height Grid Layout to prevent overlap */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 overflow-y-auto pb-20 px-1 no-scrollbar">
                  {Array.from({ length: 60 }, (_, i) => i + 1).map(day => (
                      <button
                          key={day}
                          onClick={() => handleDaySelect(day)}
                          className="h-24 w-full flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-[0_4px_0_rgb(226,232,240)] active:shadow-none active:translate-y-[4px] hover:border-indigo-300 hover:-translate-y-1 transition-all group relative overflow-hidden"
                      >
                          {/* Decorative background element */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full -mr-8 -mt-8 transition-colors group-hover:bg-indigo-50 z-0"></div>

                          <div className="z-10 flex flex-col items-center">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Day</span>
                            <span className="text-2xl font-black text-slate-700 group-hover:text-indigo-600 leading-none">{day}</span>
                          </div>
                      </button>
                  ))}
              </div>
          </div>
      );
  }

  // 3. Content Screen
  return (
      <div className="flex flex-col h-full bg-slate-50">
          <div className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 z-10 border-b border-slate-100 flex justify-between items-center">
              <button 
                  onClick={() => { setContent(''); setCurrentDay(null); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                  ←
              </button>
              <div className="text-center">
                  <h3 className="font-black text-slate-800">Day {currentDay}</h3>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{selectedLang.name}</span>
              </div>
              <div className="w-8"></div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
                      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                      <p className="text-slate-800 font-bold text-lg animate-pulse">Designing Lesson...</p>
                      <p className="text-slate-400 text-sm mt-1">AI Teacher is writing for you</p>
                  </div>
              ) : (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 prose prose-indigo prose-headings:font-black prose-p:text-slate-600 prose-li:text-slate-600">
                      <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
              )}
          </div>
      </div>
  );
};

export default Course;