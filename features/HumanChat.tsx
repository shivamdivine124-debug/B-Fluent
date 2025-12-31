
import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { User } from '../types';
import { ZEGO_APP_ID, ZEGO_SERVER_SECRET, ZEGO_TOKEN, ZEGO_SERVER_URL } from '../constants';
import { generateToken } from '../services/zegoToken';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface HumanChatProps {
  user: User | null;
}

const HumanChat: React.FC<HumanChatProps> = ({ user }) => {
  const [status, setStatus] = useState<'idle' | 'initializing' | 'searching' | 'connecting' | 'connected' | 'error'>('initializing');
  const [callDuration, setCallDuration] = useState(0);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string>('Initializing...');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  
  const zgRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  
  const lobbyChannel = useRef<any>(null);
  const selfId = useRef(user?.email?.split('@')[0] + '_' + Math.floor(Math.random()*1000) || 'user_' + Math.floor(Math.random()*1000)).current;
  const currentPartnerId = useRef<string | null>(null);
  const timerRef = useRef<any>(null);

  const addLog = (msg: string) => {
    console.log(`[Zego] ${msg}`);
    setDebugLog(prev => `${msg}\n${prev}`.slice(0, 500));
  };

  useEffect(() => {
    if (status === 'connected') {
      timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // --- Robust Library Loader ---
  const loadZegoLibrary = async () => {
    if ((window as any).ZegoExpressEngine) {
        addLog("Engine already available.");
        return;
    }

    addLog("Attempting to load Voice Engine...");

    const scripts = [
      "https://www.unpkg.com/zego-express-engine-webrtc@3.4.0/index.js",
      "https://cdn.jsdelivr.net/npm/zego-express-engine-webrtc@3.4.0/index.js",
      "https://resource.zegocloud.com/pre-build/ZegoExpressWebRTC-3.4.0.js"
    ];

    // Try sequentially to ensure stability
    for (const src of scripts) {
      try {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.crossOrigin = "anonymous";
          
          script.onload = () => {
            if ((window as any).ZegoExpressEngine) {
              resolve();
            } else {
              reject("Script loaded but Engine missing");
            }
          };
          script.onerror = () => reject("Network blocked");
          document.head.appendChild(script);
        });
        
        addLog(`Successfully loaded from: ${new URL(src).hostname}`);
        return; 
      } catch (e) {
        addLog(`Failed source ${new URL(src).hostname}: ${e}`);
      }
    }

    // Last resort: ESM Import
    try {
        addLog("Trying fallback ESM import...");
        // @ts-ignore
        const mod = await import("https://esm.sh/zego-express-engine-webrtc@3.4.0");
        if (mod && mod.ZegoExpressEngine) {
            (window as any).ZegoExpressEngine = mod.ZegoExpressEngine;
            addLog("Loaded via ESM");
            return;
        }
    } catch (e) {
        addLog("ESM fallback failed.");
    }

    throw new Error("Unable to load Voice Engine from any source. Please check your internet connection.");
  };

  useEffect(() => {
    let mounted = true;

    const initEngine = async () => {
        // 1. Security Check
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            const msg = "Microphone requires HTTPS.";
            addLog(msg);
            if(mounted) { setErrorDetails(msg); setStatus('error'); }
            return;
        }

        if (!ZEGO_APP_ID) {
            if(mounted) { setErrorDetails("AppID Missing in Config"); setStatus('error'); }
            return;
        }

        try {
            // 2. Load Library
            await loadZegoLibrary();
            
            if (!mounted) return;

            const ZegoEngineClass = (window as any).ZegoExpressEngine;
            // Use provided server URL or let Zego decide (passing empty string usually defaults to global, but we use the one from config)
            const server = ZEGO_SERVER_URL || undefined; 
            
            addLog(`Initializing Engine (ID: ${ZEGO_APP_ID})...`);
            
            // 3. Initialize
            const result = new ZegoEngineClass(Number(ZEGO_APP_ID), server);
            
            // 4. System Check
            const sys = await result.checkSystemRequirements();
            if (!sys.webRTC) {
                 const msg = "Your browser does not support WebRTC calls.";
                 addLog(msg);
                 if(mounted) { setErrorDetails(msg); setStatus('error'); }
                 return;
            }

            zgRef.current = result;
            addLog("Engine Ready.");
            if(mounted) setStatus('idle');

            // 5. Setup Listeners
            result.on('roomStreamUpdate', async (roomID: string, updateType: string, streamList: any[]) => {
                if (updateType === 'ADD') {
                    const streamID = streamList[0].streamID;
                    addLog("Incoming Audio Stream...");
                    try {
                        const remoteStream = await result.startPlayingStream(streamID);
                        remoteStreamRef.current = remoteStream;
                        const audio = new Audio();
                        audio.srcObject = remoteStream;
                        audio.play().catch(e => addLog("Autoplay blocked: tap to hear"));
                        setStatus('connected');
                    } catch (err: any) {
                        addLog(`Stream Error: ${err.message}`);
                    }
                } else if (updateType === 'DELETE') {
                    endCall();
                }
            });

            result.on('roomUserUpdate', (roomID: string, updateType: string) => {
                if (updateType === 'DELETE') endCall();
            });

        } catch (e: any) {
            const msg = e.message || "Unknown Initialization Error";
            addLog(`CRITICAL: ${msg}`);
            if(mounted) {
                setErrorDetails(msg);
                setStatus('error');
            }
        }
    };

    initEngine();

    return () => {
        mounted = false;
        if (zgRef.current) {
            try {
                zgRef.current.destroyEngine();
            } catch (e) { /* ignore */ }
            zgRef.current = null;
        }
    };
  }, []);

  const startZegoCall = async (roomID: string, role: 'host' | 'joiner') => {
    const zg = zgRef.current;
    if (!zg) {
        addLog("Engine lost. Reloading...");
        window.location.reload();
        return;
    }

    try {
        let token = ZEGO_TOKEN;
        if (!token && ZEGO_SERVER_SECRET) {
            addLog("Generating Token...");
            token = generateToken(Number(ZEGO_APP_ID), ZEGO_SERVER_SECRET, selfId);
        }
        
        if (!token) { 
            addLog("Token Gen Failed. Check Console."); 
            setErrorDetails("Security Token Generation Failed");
            setStatus('error'); 
            return; 
        }
        
        addLog(`Joining Room: ${roomID}`);
        await zg.loginRoom(roomID, token, { userID: selfId, userName: selfId });
        
        const localStream = await zg.createStream({ camera: { video: false, audio: true } });
        localStreamRef.current = localStream;
        
        zg.startPublishingStream(roomID + '_' + selfId, localStream);
        addLog("Microphone Active. Publishing...");

    } catch (err: any) {
        const msg = err.message || "Connection Error";
        addLog(`Call Failed: ${msg}`);
        setErrorDetails(msg);
        setStatus('error');
    }
  };

  const endCall = () => {
    const zg = zgRef.current;
    if (zg) {
        zg.logoutRoom();
        if (localStreamRef.current) {
            zg.destroyStream(localStreamRef.current);
            localStreamRef.current = null;
        }
    }
    if (lobbyChannel.current) {
        supabase.removeChannel(lobbyChannel.current);
        lobbyChannel.current = null;
    }
    setStatus('idle');
    setPartnerName(null);
    currentPartnerId.current = null;
  };

  const startSearch = () => {
    if (!isSupabaseConfigured) {
        alert("Server not configured properly.");
        return;
    }
    if (!zgRef.current) {
        setStatus('error');
        return;
    }

    setStatus('searching');
    addLog("Entering Global Lobby...");

    const lobby = supabase.channel('global_matchmaking', { config: { presence: { key: selfId } } });
    lobbyChannel.current = lobby;

    lobby
      .on('presence', { event: 'sync' }, () => {
        if (currentPartnerId.current || status === 'connected') return;
        const state = lobby.presenceState();
        const me = selfId;
        const partnerID = Object.keys(state).find(id => id !== me);
        
        if (partnerID && me < partnerID) {
            addLog(`Partner Found: ${partnerID}`);
            const roomID = `room_${me}_${partnerID}`;
            currentPartnerId.current = partnerID;
            lobby.send({ type: 'broadcast', event: 'invite', payload: { roomID, to: partnerID, from: me } });
            setPartnerName(partnerID);
            setStatus('connecting');
            startZegoCall(roomID, 'host');
        }
      })
      .on('broadcast', { event: 'invite' }, ({ payload }) => {
          if (payload.to === selfId && !currentPartnerId.current) {
              addLog(`Accepting Invite from ${payload.from}`);
              currentPartnerId.current = payload.from;
              setPartnerName(payload.from);
              setStatus('connecting');
              startZegoCall(payload.roomID, 'joiner');
          }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await lobby.track({ online_at: new Date().toISOString() });
        }
      });
  };

  return (
    <div className="h-full bg-slate-900 flex flex-col p-8 font-sans overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {status === 'idle' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 border border-white/10 mx-auto">🌍</div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Global Connect</h2>
            <p className="text-slate-400 font-medium mb-12 max-w-[240px] mx-auto leading-relaxed">Connect with a random partner from around the world to practice English.</p>
            <button 
                onClick={startSearch}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Start Matching
            </button>
          </div>
        )}

        {status === 'searching' && (
           <div className="animate-in fade-in duration-500">
             <div className="relative w-40 h-40 mb-12 mx-auto">
               <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
               <div className="absolute inset-4 bg-indigo-500/30 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl shadow-2xl border-4 border-slate-900">🔍</div>
               </div>
             </div>
             <h2 className="text-2xl font-black text-white mb-2">Searching...</h2>
             <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Finding your partner</p>
             <button onClick={endCall} className="mt-16 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition">Cancel Search</button>
           </div>
        )}

        {(status === 'connecting' || status === 'connected') && (
           <div className="w-full max-w-sm animate-in zoom-in fade-in duration-500">
              <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 mb-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                 </div>
                 <div className="relative z-10">
                    <div className="w-24 h-24 bg-indigo-500/20 rounded-[2rem] flex items-center justify-center text-4xl mb-6 mx-auto border border-indigo-500/30">👤</div>
                    <h3 className="text-2xl font-black text-white mb-1">{partnerName || 'Partner'}</h3>
                    {status === 'connecting' ? (
                       <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest animate-pulse">Establishing Link...</p>
                    ) : (
                       <div className="flex flex-col items-center gap-2">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Connected</p>
                         </div>
                         <p className="text-4xl font-black text-white mt-4 font-mono">{formatTime(callDuration)}</p>
                       </div>
                    )}
                 </div>
              </div>

              <button 
                onClick={endCall}
                className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-500/20 active:scale-90 transition-all mx-auto hover:bg-rose-600"
              >
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </button>
           </div>
        )}

        {(status === 'initializing' || status === 'error') && (
           <div className="p-8 text-center animate-in shake duration-500">
              {status === 'error' ? (
                <>
                  <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-3xl mb-6 mx-auto text-rose-500">⚠️</div>
                  <h2 className="text-2xl font-black text-white mb-3">Connection Failed</h2>
                  <p className="text-slate-500 font-medium mb-8 max-w-[240px] mx-auto text-xs leading-relaxed">
                    {errorDetails || "Network firewall or browser restriction detected."}
                  </p>
                </>
              ) : (
                <>
                   <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6 mx-auto"></div>
                   <h2 className="text-xl font-black text-white mb-3">Initializing...</h2>
                   <p className="text-slate-500 text-xs mb-8">Connecting to secure voice servers</p>
                </>
              )}
              
              {status === 'error' && (
                <button onClick={() => window.location.reload()} className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">Retry Connection</button>
              )}
              
              <button 
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="block mt-8 text-slate-600 text-[10px] font-black uppercase tracking-widest mx-auto hover:text-slate-400"
              >
                {showTroubleshooting ? 'Hide Debug Logs' : 'Show Debug Logs'}
              </button>
              
              {showTroubleshooting && (
                <div className="mt-4 p-4 bg-black/40 rounded-xl text-left font-mono text-[9px] text-emerald-400/80 overflow-x-auto max-h-40 border border-white/5 whitespace-pre-wrap">
                    {debugLog}
                </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};

export default HumanChat;
