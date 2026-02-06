
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, StopCircle, Loader2, MessageSquare, Volume2, XCircle, Zap, Camera, Eye, Activity } from 'lucide-react';
import { createBlob, decode, decodeAudioData } from '../utils/audioHelpers';

interface TranscriptionEntry {
  speaker: 'user' | 'ai';
  text: string;
}

type Session = Awaited<ReturnType<GoogleGenAI['live']['connect']>>;

const AIVoiceTherapist: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentInputTranscription, setCurrentInputTranscription] = useState('');
  const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<TranscriptionEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio/Video Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputNodeRef = useRef<AudioNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sessionPromiseRef = useRef<Promise<Session> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const initAudioContexts = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }
    if (!outputAudioContextRef.current) {
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startVisionStreaming = () => {
    if (!videoRef.current || !canvasRef.current) return;

    frameIntervalRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.paused || video.ended) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth / 2; // Downscale for bandwidth
      canvas.height = video.videoHeight / 2;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob && sessionPromiseRef.current) {
          const base64Data = await blobToBase64(blob);
          sessionPromiseRef.current.then((session) => {
            session.sendRealtimeInput({
              media: { data: base64Data, mimeType: 'image/jpeg' }
            });
          });
        }
      }, 'image/jpeg', 0.6);
    }, 1000); // Send 1 frame per second for mood/facial analysis
  };

  const startSession = async () => {
    setLoading(true);
    setError(null);
    setCurrentInputTranscription('');
    setCurrentOutputTranscription('');
    setTranscriptHistory([]);

    try {
      initAudioContexts();
      const inputAudioContext = audioContextRef.current!;
      const outputAudioContext = outputAudioContextRef.current!;

      // Request both Audio and Video
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: { width: 640, height: 480 } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
      }

      const source = inputAudioContext.createMediaStreamSource(mediaStreamRef.current);
      inputNodeRef.current = inputAudioContext.createGain();
      scriptProcessorRef.current = inputAudioContext.createScriptProcessor(4096, 1, 1);

      scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromiseRef.current?.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        }).catch(e => console.error("Error sending audio input:", e));
      };

      source.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(inputAudioContext.destination);

      const ai = getAI();
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsSessionActive(true);
            setLoading(false);
            startVisionStreaming();
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setCurrentOutputTranscription(prev => prev + message.serverContent.outputTranscription.text);
            } else if (message.serverContent?.inputTranscription) {
              setCurrentInputTranscription(prev => prev + message.serverContent.inputTranscription.text);
            }

            if (message.serverContent?.turnComplete) {
              if (currentInputTranscription) {
                setTranscriptHistory(prev => [...prev, { speaker: 'user', text: currentInputTranscription }]);
                setCurrentInputTranscription('');
              }
              if (currentOutputTranscription) {
                setTranscriptHistory(prev => [...prev, { speaker: 'ai', text: currentOutputTranscription }]);
                setCurrentOutputTranscription('');
              }
            }

            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContext,
                24000,
                1,
              );
              const audioSource = outputAudioContext.createBufferSource();
              audioSource.buffer = audioBuffer;
              audioSource.connect(outputAudioContext.destination);
              audioSource.addEventListener('ended', () => {
                sourcesRef.current.delete(audioSource);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });
              audioSource.start(nextStartTimeRef.current);
              nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
              sourcesRef.current.add(audioSource);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(source => source.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            setError('Live session error. Please ensure camera/mic permissions are granted.');
            endSession();
          },
          onclose: () => {
            if (isSessionActive) setError('Live session disconnected.');
            endSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are an Elite Holistic RTT Therapist with Vision capabilities. Use the video stream to observe the user\'s facial expressions, posture, and micro-movements. Identify their mood (anxious, relaxed, closed-off) and state of wellness. If you see signs of physical tension, address them directly. Use visual cues to confirm who you are talking to and maintain a continuous healing presence. Master The Body Code, Astrology, Tarot, and Chakra balancing. Be soothing, commanding, and observant.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });
    } catch (e: any) {
      setError(`Failed to start session: ${e.message || 'Unknown error'}`);
      setLoading(false);
      setIsSessionActive(false);
      cleanupAudio();
    }
  };

  const cleanupAudio = () => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    scriptProcessorRef.current?.disconnect();
    inputNodeRef.current?.disconnect();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    audioContextRef.current = null;
    outputAudioContextRef.current = null;
    scriptProcessorRef.current = null;
    inputNodeRef.current = null;
    mediaStreamRef.current = null;
    sessionPromiseRef.current = null;
    nextStartTimeRef.current = 0;
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  };

  const endSession = () => {
    sessionPromiseRef.current?.then(session => session.close()).catch(() => {});
    setIsSessionActive(false);
    setLoading(false);
    setIsSpeaking(false);
    cleanupAudio();
  };

  useEffect(() => {
    return () => isSessionActive ? endSession() : cleanupAudio();
  }, [isSessionActive]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
      {/* Vision & Controls */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-500" />
          Vision & Healing Hub
        </h3>
        
        <div className="relative flex-1 bg-slate-900 rounded-xl mb-6 overflow-hidden border-4 border-slate-800 shadow-inner group">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-700 ${isSessionActive ? 'opacity-100' : 'opacity-20'}`}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!isSessionActive && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Camera className="w-16 h-16 opacity-10 mb-4" />
              <p className="text-sm">Camera ready for scan</p>
            </div>
          )}

          {isSessionActive && (
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="bg-emerald-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <Activity className="w-3 h-3" /> WELLNESS SCAN ACTIVE
              </div>
              <div className="bg-indigo-500/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> MOOD AI: {isSpeaking ? 'ANALYZING' : 'IDLE'}
              </div>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin w-10 h-10 text-indigo-500 mb-4" />
              <p className="text-indigo-400 font-medium">Opening Sacred Space...</p>
            </div>
          )}

          {/* Vision Scan Overlay Line */}
          {isSessionActive && (
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-0.5 bg-indigo-500/30 absolute top-0 animate-[scan_3s_linear_infinite]" />
             </div>
          )}
        </div>

        <div className="space-y-4">
          {!isSessionActive ? (
            <button
              onClick={startSession}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Camera className="w-5 h-5" />}
              {loading ? 'Initializing...' : 'Begin Visual RTT Session'}
            </button>
          ) : (
            <button
              onClick={endSession}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-100"
            >
              <StopCircle className="w-5 h-5" />
              End Session & Release Space
            </button>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <p className="text-xs">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Therapist Dialogue */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-500" />
          Dialogue & Analysis
        </h3>
        
        <div className="flex-1 bg-slate-50 rounded-xl p-4 overflow-y-auto border border-slate-100 flex flex-col space-y-3">
          {transcriptHistory.length === 0 && !currentInputTranscription && !currentOutputTranscription && !loading && !isSessionActive && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-12">
              <div className="bg-slate-100 p-6 rounded-full mb-6">
                <MessageSquare className="w-12 h-12 opacity-20" />
              </div>
              <h4 className="text-slate-600 font-semibold mb-2 text-lg">Therapist Awaiting Vision</h4>
              <p className="text-sm">Start the session to allow the AI to see your state of being and begin guided healing.</p>
            </div>
          )}

          {transcriptHistory.map((entry, idx) => (
            <div key={idx} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[85%] ${entry.speaker === 'user' ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white shadow-sm border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                {entry.text}
              </div>
            </div>
          ))}

          {currentInputTranscription && (
            <div className="flex justify-end">
              <div className="p-3 rounded-lg max-w-[85%] bg-indigo-500/80 text-white rounded-br-none flex items-center gap-2">
                <Mic className="w-4 h-4" /> {currentInputTranscription}
              </div>
            </div>
          )}
          {currentOutputTranscription && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg max-w-[85%] bg-white shadow-sm border border-indigo-100 text-slate-800 rounded-bl-none flex items-center gap-2">
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-indigo-500' : ''}`} /> {currentOutputTranscription}
              </div>
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(480px); opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default AIVoiceTherapist;
