import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion } from '../types';

type QuizMode = 'MENU' | 'MULTI_MENU' | 'LOBBY_HOST' | 'LOBBY_JOIN' | 'PLAYING' | 'LEVEL_SUMMARY';

const QuizGym: React.FC = () => {
  // Navigation State
  const [appState, setAppState] = useState<QuizMode>('MENU');
  
  // Game Data
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // Interaction State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Multiplayer State
  const [channel, setChannel] = useState<any>(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');

  // --- Actions ---

  const startSoloGame = async (startLevel: number) => {
    setLoading(true);
    const q = await generateQuizQuestions(startLevel);
    if (q.length === 0) {
        setError("Failed to load questions. Try again.");
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

  const nextLevel = () => {
      // Unlimited levels: just increment and generate
      startSoloGame(level + 1);
  };

  const hostGame = async () => {
    if (!isSupabaseConfigured) {
        setError("Multiplayer unavailable (Backend not configured)");
        return;
    }
    
    // Generate 4 digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomCode(code);
    setAppState('LOBBY_HOST');

    const newChannel = supabase.channel(`quiz-room-${code}`);
    
    // Listen for player join
    newChannel.on('broadcast', { event: 'player_joined' }, async () => {
        setLoading(true);
        // Generate questions for the match (Start at Level 1 for fair play)
        const q = await generateQuizQuestions(1);
        
        // Broadcast start
        newChannel.send({
            type: 'broadcast',
            event: 'start_quiz',
            payload: { questions: q }
        });
        
        setQuestions(q);
        setLevel(1);
        setCurrentQIndex(0);
        setAppState('PLAYING');
        setLoading(false);
    }).subscribe();

    setChannel(newChannel);
  };

  const joinGame = async () => {
    if (!isSupabaseConfigured) {
        setError("Multiplayer unavailable (Backend not configured)");
        return;
    }
    if (joinInput.length !== 4) {
        setError("Please enter a valid 4-digit code.");
        return;
    }
    
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
            // Tell host we are here
            newChannel.send({
                type: 'broadcast',
                event: 'player_joined',
                payload: {}
            });
        }
    });

    setChannel(newChannel);
    // Stay in loading state until game starts
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = index === questions[currentQIndex].correctIndex;

    if (isCorrect) {
      setScore(s => s + 10);
    }

    // Auto Advance Logic
    setTimeout(() => {
        advanceToNext();
    }, 1200); 
  };

  const advanceToNext = () => {
      if (currentQIndex < questions.length - 1) {
          // Next Question
          setCurrentQIndex(prev => prev + 1);
          setIsAnswered(false);
          setSelectedOption(null);
      } else {
          // End of Level
          setAppState('LEVEL_SUMMARY');
          setIsAnswered(false);
          setSelectedOption(null);
          // Cleanup multiplayer channel if active
          if (channel) {
              supabase.removeChannel(channel);
              setChannel(null);
          }
      }
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-indigo-900 text-white">
        <div className="animate-spin text-5xl mb-6">🏋️</div>
        <p className="font-bold text-lg animate-pulse">
            {appState === 'LOBBY_JOIN' || (appState === 'LOBBY_HOST' && loading) 
                ? "Connecting to Room..." 
                : `Generating Level ${level}...`}
        </p>
      </div>
    );
  }

  if (appState === 'MENU') {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full bg-indigo-900 text-white overflow-y-auto">
        <h1 className="text-5xl font-black mb-2 italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">THE GYM</h1>
        <p className="mb-10 text-indigo-300 tracking-widest text-sm font-bold uppercase">Brain Workout Center</p>
        
        {error && (
            <div className="mb-4 bg-red-500/80 px-4 py-3 rounded-lg text-sm font-bold animate-pulse w-full max-w-xs text-center shadow-lg">
                {error}
                <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
            </div>
        )}

        <div className="space-y-6 w-full max-w-xs">
            {/* Single Player Button */}
            <button 
                onClick={() => startSoloGame(1)}
                className="group w-full p-6 bg-white rounded-2xl shadow-[0_6px_0_rgb(203,213,225)] hover:shadow-[0_4px_0_rgb(203,213,225)] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all text-left relative overflow-hidden"
            >
               <div className="relative z-10 flex items-center justify-between">
                   <div>
                       <h3 className="text-2xl font-black text-indigo-900">Single Player</h3>
                       <p className="text-indigo-500 font-medium text-sm">Unlimited Levels</p>
                   </div>
                   <span className="text-4xl">👤</span>
               </div>
            </button>

            {/* Multiplayer Button */}
            <button 
                onClick={() => setAppState('MULTI_MENU')}
                className="group w-full p-6 bg-indigo-800 rounded-2xl shadow-[0_6px_0_rgb(49,46,129)] hover:shadow-[0_4px_0_rgb(49,46,129)] hover:translate-y-[2px] active:shadow-none active:translate-y-[6px] transition-all text-left relative overflow-hidden border-2 border-indigo-700"
            >
               <div className="relative z-10 flex items-center justify-between">
                   <div>
                       <h3 className="text-2xl font-black text-white">Multiplayer</h3>
                       <p className="text-indigo-300 font-medium text-sm">Play with Friends</p>
                   </div>
                   <span className="text-4xl">👥</span>
               </div>
            </button>
        </div>
      </div>
    );
  }

  if (appState === 'MULTI_MENU') {
      return (
        <div className="p-6 flex flex-col items-center justify-center h-full bg-indigo-900 text-white">
            <button onClick={() => setAppState('MENU')} className="text-indigo-300 text-sm font-bold mb-6 hover:text-white flex items-center absolute top-6 left-6">
                ← Back
            </button>
            
            <h2 className="text-3xl font-black text-white mb-2">Multiplayer</h2>
            <p className="text-indigo-300 mb-8 font-medium">Connect with a unique code</p>

            <div className="w-full max-w-xs space-y-4">
                <button 
                    onClick={hostGame}
                    className="w-full py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-lg rounded-2xl shadow-lg hover:scale-105 transition transform"
                >
                    Create Room (Host)
                </button>
                
                <div className="relative py-2 flex items-center">
                    <div className="flex-grow border-t border-indigo-700"></div>
                    <span className="flex-shrink mx-4 text-indigo-400 text-xs uppercase font-bold">OR</span>
                    <div className="flex-grow border-t border-indigo-700"></div>
                </div>

                <div className="bg-indigo-800 p-1 rounded-2xl border border-indigo-700">
                    <button 
                        onClick={() => setAppState('LOBBY_JOIN')}
                        className="w-full py-4 bg-indigo-700 text-indigo-100 font-bold rounded-xl hover:bg-indigo-600 transition"
                    >
                        Join Room
                    </button>
                </div>
            </div>
        </div>
      );
  }

  if (appState === 'LOBBY_HOST') {
      return (
        <div className="p-6 flex flex-col items-center justify-center h-full bg-indigo-900 text-white relative overflow-hidden">
            {/* Background animation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                 <div className="w-64 h-64 bg-purple-500 rounded-full animate-ping"></div>
            </div>

            <button onClick={() => { supabase.removeChannel(channel); setAppState('MULTI_MENU'); }} className="z-10 text-indigo-300 text-sm font-bold mb-6 hover:text-white flex items-center absolute top-6 left-6">
                ← Cancel
            </button>

            <div className="z-10 flex flex-col items-center">
                <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-4">Room Code</p>
                <div className="bg-white text-indigo-900 text-6xl font-black py-6 px-10 rounded-3xl shadow-2xl mb-8 tracking-widest border-4 border-indigo-300">
                    {roomCode}
                </div>
                
                <div className="flex items-center gap-3 bg-indigo-800/50 px-6 py-3 rounded-full backdrop-blur-sm">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-bold">Waiting for opponent...</span>
                </div>
                <p className="mt-8 text-xs text-indigo-400 max-w-[200px] text-center">Share this code with your friend to start the quiz.</p>
            </div>
        </div>
      );
  }

  if (appState === 'LOBBY_JOIN') {
      return (
        <div className="p-6 flex flex-col items-center justify-center h-full bg-indigo-900 text-white">
             <button onClick={() => setAppState('MULTI_MENU')} className="text-indigo-300 text-sm font-bold mb-6 hover:text-white flex items-center absolute top-6 left-6">
                ← Back
            </button>

            <h2 className="text-2xl font-black text-white mb-6">Enter Room Code</h2>
            
            <input 
                type="text" 
                maxLength={4}
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0000"
                className="w-48 bg-indigo-800 border-2 border-indigo-600 text-white text-center text-4xl font-black py-4 rounded-2xl outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 transition-all placeholder-indigo-600/50 tracking-widest mb-6"
            />
            
            {error && <p className="text-red-400 text-sm font-bold mb-4">{error}</p>}

            <button 
                onClick={joinGame}
                disabled={joinInput.length !== 4}
                className="w-48 py-4 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition transform"
            >
                Connect & Play
            </button>
        </div>
      );
  }

  if (appState === 'LEVEL_SUMMARY') {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-indigo-50 p-6 text-center">
            <div className="mb-8">
                <span className="text-6xl">🏆</span>
            </div>
            <h2 className="text-3xl font-black text-indigo-900 mb-2">Level {level} Complete!</h2>
            <p className="text-gray-600 mb-8">You answered 5 questions.</p>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-xs mb-8">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Score</p>
                <p className="text-5xl font-black text-green-500">{score}</p>
            </div>
            
            <button 
                onClick={nextLevel}
                className="w-full max-w-xs py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transition transform"
            >
                Start Level {level + 1} →
            </button>
            <button 
                onClick={() => { setAppState('MENU'); setScore(0); setLevel(1); }}
                className="mt-4 text-gray-400 font-bold text-sm hover:text-gray-600"
            >
                Return to Menu
            </button>
        </div>
      );
  }

  const currentQ = questions[currentQIndex];

  return (
    <div className="flex flex-col h-full bg-indigo-50 p-4 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-2xl shadow-sm">
        <div>
           <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Level {level}</span>
           <span className="text-xs font-bold text-indigo-900">Q {currentQIndex + 1}/5</span>
        </div>
        <div>
           <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block text-right">Score</span>
           <p className="text-xl font-black text-green-600 leading-none">{score}</p>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 rounded-3xl shadow-lg mb-6 flex-1 flex flex-col items-center justify-center text-center border-b-4 border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 leading-snug">{currentQ.question}</h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 mb-8">
        {currentQ.options.map((opt, idx) => {
            let buttonStyle = "bg-white border-2 border-indigo-100 text-gray-700 hover:border-indigo-400";
            
            if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                    buttonStyle = "bg-green-100 border-2 border-green-500 text-green-800"; // Correct Answer
                } else if (idx === selectedOption) {
                    buttonStyle = "bg-red-100 border-2 border-red-500 text-red-800"; // Wrong selected
                } else {
                    buttonStyle = "bg-gray-50 border-gray-100 text-gray-400 opacity-50"; // Others
                }
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleAnswer(idx)}
                className={`p-4 rounded-2xl font-bold transition-all text-left relative overflow-hidden ${buttonStyle} active:scale-98`}
              >
                <div className="flex items-center z-10 relative">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm mr-3 font-bold transition-colors ${
                        isAnswered && idx === currentQ.correctIndex ? 'bg-green-500 text-white' : 
                        isAnswered && idx === selectedOption ? 'bg-red-500 text-white' : 
                        'bg-indigo-50 text-indigo-600'
                    }`}>
                        {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                </div>
              </button>
            )
        })}
      </div>
      
      {/* Footer Hint */}
      <div className="text-center pb-4">
          <p className="text-xs text-gray-400">
              {isAnswered ? "Proceeding to next question..." : "Select an answer to continue"}
          </p>
      </div>
    </div>
  );
};

export default QuizGym;