'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useGameStore } from '@/store/gameStore';
import { usePlayerStore } from '@/store/playerStore';

interface PeerConnectionMap {
  [playerId: string]: RTCPeerConnection;
}

interface AudioElementMap {
  [playerId: string]: HTMLAudioElement;
}

import { useVoiceStore } from '@/store/voiceStore';

export function useVoiceChat() {
  const { socket, emit } = useSocket();
  const room = useGameStore((state) => state.room);
  const localPlayer = usePlayerStore((state) => state.localPlayer);
  
  const { isMicEnabled, setMicEnabled, micPermissionDenied, setMicPermissionDenied, setSpeakingPlayers, setToggleMicAction } = useVoiceStore();
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<PeerConnectionMap>({});
  const audioElementsRef = useRef<AudioElementMap>({});
  const analyserNodesRef = useRef<Record<string, AnalyserNode>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const speakingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const roomCode = room?.id;

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const cleanupAudioForPlayer = useCallback((playerId: string) => {
    if (peersRef.current[playerId]) {
      peersRef.current[playerId].close();
      delete peersRef.current[playerId];
    }
    if (audioElementsRef.current[playerId]) {
      audioElementsRef.current[playerId].srcObject = null;
      audioElementsRef.current[playerId].remove();
      delete audioElementsRef.current[playerId];
    }
    const currentSpeaking = useVoiceStore.getState().speakingPlayers;
    const next = { ...currentSpeaking };
    delete next[playerId];
    setSpeakingPlayers(next);
  }, [setSpeakingPlayers]);

  const cleanupAll = useCallback(() => {
    Object.keys(peersRef.current).forEach(cleanupAudioForPlayer);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (speakingIntervalRef.current) {
      clearInterval(speakingIntervalRef.current);
    }
    setMicEnabled(false);
  }, [cleanupAudioForPlayer, setMicEnabled]);

  const toggleMic = useCallback(async () => {
    if (isMicEnabled && localStreamRef.current) {
       localStreamRef.current.getAudioTracks().forEach(track => {
         track.enabled = !track.enabled;
       });
       setMicEnabled(false);
    } else {
       if (localStreamRef.current) {
         localStreamRef.current.getAudioTracks().forEach(track => {
           track.enabled = true;
         });
         setMicEnabled(true);
       } else {
         await requestMicPermission();
       }
    }
  }, [isMicEnabled, setMicEnabled]);

  useEffect(() => {
    setToggleMicAction(toggleMic);
  }, [toggleMic, setToggleMicAction]);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setMicEnabled(true);
      setMicPermissionDenied(false);
      
      initAudioContext();
      monitorSpeaking(localPlayer?.id || 'local', stream);

      // Tell existing peers we have a stream now by renegotiating if needed,
      // but simpler: if we get mic AFTER joining, we might need to recreate offers.
      // Easiest is to add tracks to existing peers and renegotiate.
      Object.values(peersRef.current).forEach(peer => {
        stream.getTracks().forEach(track => {
           const senders = peer.getSenders();
           const sender = senders.find(s => s.track?.kind === track.kind);
           if (!sender) {
             peer.addTrack(track, stream);
           }
        });
      });
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setMicPermissionDenied(true);
      setMicEnabled(false);
    }
  };

  const createPeerConnection = useCallback((targetSocketId: string, playerId: string, initiator: boolean) => {
    if (peersRef.current[playerId]) return peersRef.current[playerId];

    const peer = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[playerId] = peer;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStreamRef.current!);
      });
    }

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        emit('webrtc_ice_candidate', {
          targetSocketId,
          candidate: event.candidate,
          roomCode
        });
      }
    };

    peer.ontrack = (event) => {
      const stream = event.streams[0];
      if (!audioElementsRef.current[playerId]) {
        const audio = new Audio();
        audio.autoplay = true;
        // Don't mute remote audio
        audio.srcObject = stream;
        audioElementsRef.current[playerId] = audio;

        initAudioContext();
        monitorSpeaking(playerId, stream);
      }
    };

    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'closed') {
        cleanupAudioForPlayer(playerId);
      }
    };

    if (initiator) {
      peer.createOffer()
        .then(offer => peer.setLocalDescription(offer))
        .then(() => {
          emit('webrtc_offer', {
            targetSocketId,
            offer: peer.localDescription,
            roomCode
          });
        })
        .catch(console.error);
    }

    return peer;
  }, [emit, roomCode, cleanupAudioForPlayer, localPlayer]);

  const monitorSpeaking = (playerId: string, stream: MediaStream) => {
    if (!audioContextRef.current) return;
    
    try {
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserNodesRef.current[playerId] = analyser;
    } catch (e) {
      console.warn("Could not create analyser for stream", e);
    }
  };

  useEffect(() => {
    if (!audioContextRef.current) return;

    speakingIntervalRef.current = setInterval(() => {
      const newSpeakingState: Record<string, boolean> = {};
      
      Object.entries(analyserNodesRef.current).forEach(([playerId, analyser]) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;
        
        // Threshold for speaking
        newSpeakingState[playerId] = average > 15;
      });

      setSpeakingPlayers(newSpeakingState);
    }, 100);

    return () => {
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!socket || !roomCode || !localPlayer) return;

    const onVoiceUserJoined = ({ playerId, socketId }: { playerId: string, socketId: string }) => {
      // initiator connects to the newly joined user
      createPeerConnection(socketId, playerId, true);
    };

    const onVoiceUserLeft = ({ playerId }: { playerId: string }) => {
      cleanupAudioForPlayer(playerId);
    };

    const onWebRtcOffer = async ({ senderId, senderSocketId, offer }: any) => {
      const peer = createPeerConnection(senderSocketId, senderId, false);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      emit('webrtc_answer', {
        targetSocketId: senderSocketId,
        answer,
        roomCode
      });
    };

    const onWebRtcAnswer = async ({ senderId, answer }: any) => {
      const peer = peersRef.current[senderId];
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const onWebRtcIceCandidate = async ({ senderId, candidate }: any) => {
      const peer = peersRef.current[senderId];
      if (peer) {
         try {
           await peer.addIceCandidate(new RTCIceCandidate(candidate));
         } catch(e) {
           console.error("Error adding ice candidate", e);
         }
      }
    };

    const s = socket as any;
    s.on('voice_user_joined', onVoiceUserJoined);
    s.on('voice_user_left', onVoiceUserLeft);
    s.on('webrtc_offer', onWebRtcOffer);
    s.on('webrtc_answer', onWebRtcAnswer);
    s.on('webrtc_ice_candidate', onWebRtcIceCandidate);

    // Initial join
    requestMicPermission().then(() => {
      emit('join_voice', { roomCode });
    });

    return () => {
      emit('leave_voice', { roomCode });
      const s = socket as any;
      s.off('voice_user_joined', onVoiceUserJoined);
      s.off('voice_user_left', onVoiceUserLeft);
      s.off('webrtc_offer', onWebRtcOffer);
      s.off('webrtc_answer', onWebRtcAnswer);
      s.off('webrtc_ice_candidate', onWebRtcIceCandidate);
      cleanupAll();
    };
  }, [socket, roomCode, localPlayer, emit, cleanupAll, createPeerConnection]);

  return null;
}
