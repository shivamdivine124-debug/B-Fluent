import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion } from '../types';

type QuizMode = 'MENU' | 'MULTI_MENU' | 'LOBBY_HOST' | 'LOBBY_JOIN' | 'PLAYING' | 'LEVEL_SUMMARY';

const QuizGym: React.FC = () => {
  const [appState, setAppState] = useState<QuizMode>('MENU');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [channel, setChannel] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');

  const startSoloGame = async (startLevel: number) => {
    setLoading(true);
    const q = await generateQuizQuestions(startLevel);
    if (q.length === 0) {
        setError("Gym closed. Maintenance in progress.");
        setLoading(false);
        return;
    }
    setQuestions(q);
    setLevel(startLevel);
    setCurrentQIndex(0);
    setAppState('PLAYING');
    setIsAnswered(false);
    setSelectedOption(null);
    setLoading(false);
  };

  const nextLevel = () => startSoloGame(level + 1);

  const hostGame = async () => {
    if (!isSupabaseConfigured) {
        setError("Multiplayer requires active server.");
        return;
    }
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setAppState('LOBBY_HOST');
    const newChannel = supabase.channel(`quiz-room-${code}`);
    newChannel.on('broadcast', { event: 'player_joined' }, async () => {
        setLoading(true);
        const q = await generateQuizQuestions(1);
        newChannel.send({ type: 'broadcast', event: 'start_quiz', payload: { questions: q } });
        setQuestions(q);
        setLevel(1);
        setCurrentQIndex(0);
        setAppState('PLAYING');
        setLoading(false);
    }).subscribe();
    setChannel(newChannel);
  };

  const joinGame = async () => {
    if (!isSupabaseConfigured) return;
    if (joinInput.length !== 4) return;
    setLoading(true);
    const newChannel = supabase.channel(`quiz-room-${joinInput}`);
    newChannel.on('broadcast', { event: 'start_quiz' }, ({ payload }) => {
        setQuestions(payload.questions);
        setLevel(1);
        setCurrentQIndex(0);
        setAppState('PLAYING');
        setLoading(false);
    }).subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            newChannel.send({ type: 'broadcast', event: 'player_joined', payload: {} });
        }
    });
    setChannel(newChannel);
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQIndex].correctIndex) setScore(s => s + 10);
    setTimeout(() => advanceToNext(), 1200); 
  };

  const advanceToNext = () => {
      if (currentQIndex < questions.length - 1) {
          setCurrentQIndex(prev => prev + 1);
          setIsAnswered(false);
          setSelectedOption(null);
      } else {
          setAppState('LEVEL_SUMMARY');
          setIsAnswered(false);
          setSelectedOption(null);
          if (channel) { supabase.removeChannel(channel); setChannel(null); }
      }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-800">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8"></div>
        <p className="font-black text-xl tracking-tight uppercase">Loading Arena...</p>
      </div>
    );
  }

  if (appState === 'MENU') {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full bg-slate-50 relative">
        <div className="text-center mb-16 relative z-10">
            <div className="inline-block p-4 bg-white rounded-3xl mb-6 shadow-xl animate-float">
                <span className="text-4xl">🏋️</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-2 text-slate-900">Quiz Gym</h1>
            <p className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.4em]">Test Your Power</p>
        </div>

        <div className="space-y-4 w-full max-w-xs relative z-10">
            <button 
                onClick={() => startSoloGame(1)}
                className="w-full p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-lg hover:border-indigo-500 transition-all text-left"
            >
               <h3 className="text-xl font-black text-slate-800 tracking-tight">SOLO GRIND</h3>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Single Player Path</p>
            </button>

            <button 
                onClick={() => setAppState('MULTI_MENU')}
                className="w-full p-6 bg-slate-900 rounded-[2.5rem] shadow-xl text-left"
            >
               <h3 className="text-xl font-black text-white tracking-tight">MULTIPLAYER</h3>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Fight with Peers</p>
            </button>
        </div>
      </div>
    );
  }

  if (appState === 'MULTI_MENU') {
      return (
        <div className="p-8 flex flex-col items-center justify-center h-full bg-slate-50">
            <button onClick={() => setAppState('MENU')} className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] absolute top-20 left-8">← Back</button>
            <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Arena Mode</h2>
            <div className="w-full max-w-xs space-y-4">
                <button onClick={hostGame} className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-3xl shadow-lg active:scale-[0.98] transition-all">Create Room</button>
                <button onClick={() => setAppState('LOBBY_JOIN')} className="w-full py-5 bg-white border border-slate-200 text-slate-900 font-black text-lg rounded-3xl">Join Room</button>
            </div>
        </div>
      );
  }

  if (appState === 'LOBBY_HOST') {
      return (
        <div className="p-8 flex flex-col items-center justify-center h-full bg-slate-50 relative">
            <button onClick={() => setAppState('MULTI_MENU')} className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] absolute top-20 left-8">← Cancel</button>
            <div className="text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Share Room Code</p>
                <div className="bg-white border-2 border-slate-100 text-slate-900 text-7xl font-black py-8 px-12 rounded-[3rem] shadow-2xl mb-12 tracking-[0.2em]">
                    {roomCode}
                </div>
                <div className="flex items-center gap-3 justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Waiting for players...</span>
                </div>
            </div>
        </div>
      );
  }

  if (appState === 'LOBBY_JOIN') {
      return (
        <div className="p-8 flex flex-col items-center justify-center h-full bg-slate-50">
             <button onClick={() => setAppState('MULTI_MENU')} className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] absolute top-20 left-8">← Back</button>
            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Join Arena</h2>
            <input 
                type="text" maxLength={4} value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0000"
                className="w-full max-w-[200px] bg-white border-2 border-slate-100 text-slate-900 text-center text-5xl font-black py-6 rounded-3xl outline-none focus:border-indigo-500 transition-all mb-8"
            />
            <button 
                onClick={joinGame} disabled={joinInput.length !== 4}
                className="w-full max-w-[200px] py-5 bg-indigo-600 text-white font-black text-xl rounded-3xl shadow-xl disabled:opacity-30 transition-all active:scale-95"
            >
                Enter
            </button>
        </div>
      );
  }

  if (appState === 'LEVEL_SUMMARY') {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-white p-8 text-center relative overflow-hidden">
            <div className="mb-10 text-6xl">🏆</div>
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Workout Complete</h2>
            <p className="text-slate-500 font-medium mb-10">You've finished Level {level}.</p>
            <div className="bg-slate-50 p-8 rounded-[3rem] w-full max-w-xs mb-10 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] mb-2">Total Gains</p>
                <p className="text-6xl font-black text-indigo-600">{score}</p>
            </div>
            <button 
                onClick={nextLevel}
                className="w-full max-w-xs py-5 bg-slate-900 text-white font-black text-lg rounded-[2rem] shadow-xl active:scale-[0.98] transition-all"
            >
                Next Level →
            </button>
            <button onClick={() => { setAppState('MENU'); setScore(0); setLevel(1); }} className="mt-8 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Exit Gym</button>
        </div>
      );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 relative">
      <div className="flex justify-between items-end mb-8 pt-16 px-2">
        <div>
           <span className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.3em] block mb-1">Level {level}</span>
           <span className="text-xl font-black text-slate-900">Q {currentQIndex + 1}/5</span>
        </div>
        <div className="text-right">
           <span className="text-[9px] text-orange-500 font-black uppercase tracking-[0.3em] block mb-1">Score</span>
           <p className="text-3xl font-black text-slate-900 leading-none">{score}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl mb-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <h2 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">{currentQ.question}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-10">
        {currentQ.options.map((opt, idx) => {
            let style = "bg-white border border-slate-100 text-slate-800";
            if (isAnswered) {
                if (idx === currentQ.correctIndex) style = "bg-emerald-500 text-white border-emerald-400 shadow-lg";
                else if (idx === selectedOption) style = "bg-rose-500 text-white border-rose-400 shadow-lg";
                else style = "bg-white border-slate-50 text-slate-300 opacity-50";
            }
            return (
              <button
                key={idx} disabled={isAnswered} onClick={() => handleAnswer(idx)}
                className={`p-5 rounded-[2rem] font-black text-left transition-all active:scale-[0.98] flex items-center gap-4 ${style}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${isAnswered ? 'border-white/20' : 'border-slate-100 text-indigo-500'}`}>
                    {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            )
        })}
      </div>
    </div>
  );
};

export default QuizGym;