import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { User } from '../types';

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

interface HumanChatProps {
  user: User | null;
}

const HumanChat: React.FC<HumanChatProps> = ({ user }) => {
  const [status, setStatus] = useState<'idle' | 'searching' | 'connecting' | 'connected' | 'error'>('idle');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [partnerDisplayName, setPartnerDisplayName] = useState<string | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const lobbyChannel = useRef<any>(null);
  const callChannel = useRef<any>(null);
  
  const selfId = useRef(Math.random().toString(36).substring(7)).current;
  const isPolite = useRef(false);
  const currentPartnerId = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  const extractNameFromEmail = (email: string) => {
    if (!email) return "Learner";
    return email.split('@')[0];
  };

  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    if (lobbyChannel.current) {
      lobbyChannel.current.track({ status: 'idle', email: user?.email });
      supabase.removeChannel(lobbyChannel.current);
      lobbyChannel.current = null;
    }
    if (callChannel.current) {
      supabase.removeChannel(callChannel.current);
      callChannel.current = null;
    }
    currentPartnerId.current = null;
    setStatus('idle');
    setRemoteStream(null);
    setPartnerDisplayName(null);
  };

  const setupPeerConnection = (signalingChannel: any) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnection.current = pc;

    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        pc.addTrack(track, localStream.current!);
      });
    }

    pc.ontrack = (event) => {
      console.log("Remote track received");
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
        setStatus('connected');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalingChannel.send({
          type: 'broadcast',
          event: 'signal',
          payload: { candidate: event.candidate, from: selfId }
        });
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        await pc.setLocalDescription();
        signalingChannel.send({
          type: 'broadcast',
          event: 'signal',
          payload: { description: pc.localDescription, from: selfId }
        });
      } catch (err) {
        console.error("Negotiation Error:", err);
      }
    };

    return pc;
  };

  const startCallWith = async (otherId: string, otherEmail: string) => {
    if (currentPartnerId.current) return;
    currentPartnerId.current = otherId;
    setPartnerDisplayName(extractNameFromEmail(otherEmail));
    setStatus('connecting');
    
    // Create a unique private channel for these two users only
    const channelName = `call_${[selfId, otherId].sort().join('_')}`;
    const channel = supabase.channel(channelName);
    callChannel.current = channel;

    isPolite.current = selfId.localeCompare(otherId) > 0;

    channel
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        const pc = peerConnection.current;
        if (!pc || payload.from === selfId) return;

        try {
          if (payload.description) {
            const offerCollision = (payload.description.type === 'offer') && 
                                   (pc.signalingState !== 'stable');
            
            const ignoreOffer = !isPolite.current && offerCollision;
            if (ignoreOffer) return;

            await pc.setRemoteDescription(payload.description);
            if (payload.description.type === 'offer') {
              await pc.setLocalDescription();
              channel.send({
                type: 'broadcast',
                event: 'signal',
                payload: { description: pc.localDescription, from: selfId }
              });
            }
          } else if (payload.candidate) {
            try {
              await pc.addIceCandidate(payload.candidate);
            } catch (e) {
              if (!isPolite.current) throw e;
            }
          }
        } catch (err) {
          console.error("Signaling error:", err);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setupPeerConnection(channel);
        }
      });
  };

  const startSearch = async () => {
    if (!isSupabaseConfigured) {
        setStatus('error');
        return;
    }

    setStatus('searching');
    
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (err) {
      alert("Microphone access is required for Global Connect.");
      setStatus('idle');
      return;
    }

    const lobby = supabase.channel('global_matchmaking', {
      config: { presence: { key: selfId } }
    });
    lobbyChannel.current = lobby;

    lobby
      .on('presence', { event: 'sync' }, () => {
        if (currentPartnerId.current) return;
        
        const state = lobby.presenceState();
        const users = Object.keys(state);
        
        // Matchmaking logic: 
        // We only initiate if we are the "lower" ID to avoid duplicate attempts
        const potentialPartner = users.find(id => {
          const userState = (state[id] as any)[0];
          return id !== selfId && 
                 userState.status === 'searching' && 
                 selfId.localeCompare(id) < 0; // The one with lower ID initiates
        });

        if (potentialPartner) {
          const partnerEmail = (state[potentialPartner] as any)[0].email;
          // Send an invite broadcast to that specific person
          lobby.send({
            type: 'broadcast',
            event: 'match_invite',
            payload: { to: potentialPartner, from: selfId, fromEmail: user?.email }
          });
        }
      })
      .on('broadcast', { event: 'match_invite' }, async ({ payload }) => {
        // Only respond if the invite is for us AND we are still searching
        if (payload.to === selfId && !currentPartnerId.current && status === 'searching') {
          // Send match accept
          lobby.send({
            type: 'broadcast',
            event: 'match_accept',
            payload: { to: payload.from, from: selfId, fromEmail: user?.email }
          });
          
          await lobby.track({ status: 'busy', email: user?.email });
          startCallWith(payload.from, payload.fromEmail);
        }
      })
      .on('broadcast', { event: 'match_accept' }, async ({ payload }) => {
        // If we get an acceptance for an invite we sent
        if (payload.to === selfId && !currentPartnerId.current) {
          await lobby.track({ status: 'busy', email: user?.email });
          startCallWith(payload.from, payload.fromEmail);
        }
      })
      .subscribe(async (subStatus) => {
        if (subStatus === 'SUBSCRIBED') {
          await lobby.track({ status: 'searching', email: user?.email });
        }
      });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="z-10 flex flex-col items-center w-full">
        <div className="mb-2 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">1-on-1 Voice Call</span>
        </div>
        
        <h2 className="text-2xl font-black mb-8">
            {status === 'connected' ? "Call in Progress" : "Global Connect"}
        </h2>

        <div className="w-48 h-48 rounded-full border-4 border-white/10 bg-white/5 flex items-center justify-center mb-8 relative">
           {(status === 'searching' || status === 'connecting' || status === 'connected') && (
             <div className={`absolute inset-0 border-4 ${status === 'connected' ? 'border-green-500' : 'border-indigo-500'} rounded-full animate-ping opacity-75`}></div>
           )}
           
           <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-500 ${
               status === 'connected' ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-110 shadow-2xl shadow-green-500/20' : 'bg-white/5'
           }`}>
                {status === 'connected' ? (
                    <span className="text-5xl animate-bounce">🎙️</span>
                ) : (
                    <svg className="w-20 h-20 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                )}
           </div>
        </div>

        <div className="h-24 text-center flex flex-col items-center justify-center mb-8">
          <p className="text-xl font-black text-white">
            {status === 'idle' && "Find a learning partner"}
            {status === 'searching' && "Matching you with someone..."}
            {status === 'connecting' && "Setting up secure call..."}
            {status === 'connected' && `Connected with ${partnerDisplayName}`}
            {status === 'error' && "System Offline"}
          </p>
          {status === 'searching' && (
              <p className="text-xs text-indigo-300 uppercase tracking-widest font-bold mt-2 animate-pulse">Lobby is active</p>
          )}
          {status === 'connected' && (
              <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-bold uppercase tracking-widest">Live Private Session</span>
              </div>
          )}
        </div>
        
        {status === 'idle' || status === 'error' ? (
          <button
            onClick={startSearch}
            className="group relative h-16 w-64"
          >
            <div className="absolute inset-0 bg-indigo-600 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-full bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center gap-3 font-black text-lg transition-all transform active:scale-95 shadow-xl border border-indigo-400/30">
              <span className="text-2xl">⚡</span> Start Searching
            </div>
          </button>
        ) : (
          <button
            onClick={endCall}
            className="px-12 py-4 bg-red-500 hover:bg-red-600 rounded-full font-black text-lg shadow-lg shadow-red-500/30 transition transform hover:scale-105 border border-red-400/30"
          >
            {status === 'connected' ? "End Call" : "Stop Searching"}
          </button>
        )}

        <audio 
            autoPlay 
            ref={audio => { 
                if (audio && remoteStream) {
                    audio.srcObject = remoteStream;
                }
            }} 
        />
      </div>
    </div>
  );
};

export default HumanChat;